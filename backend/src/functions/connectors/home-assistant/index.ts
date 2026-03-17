import { Context, ScheduledEvent } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Logger } from '@aws-lambda-powertools/logger';
import axios from 'axios';
import WebSocket from 'ws';
import { query } from '../../../shared/database';
import { IntegrationType, MetricType, ReadingStatus } from '../../../shared/types';

const logger = new Logger({ serviceName: 'ha-connector' });
const sqsClient = new SQSClient({});

export async function handler(event: ScheduledEvent, context: Context): Promise<void> {
  logger.addContext(context);
  logger.info('Home Assistant connector triggered');

  const integrations = await getHomeAssistantIntegrations();

  for (const integration of integrations) {
    try {
      await syncHomeAssistant(integration);
    } catch (error) {
      logger.error('Failed to sync Home Assistant', { integrationId: integration.id, error });
      await logIntegrationError(integration.id, error);
    }
  }
}

async function getHomeAssistantIntegrations(): Promise<any[]> {
  const result = await query(
    `SELECT * FROM integrations 
     WHERE integration_type = $1 AND enabled = true`,
    [IntegrationType.HOME_ASSISTANT]
  );
  return result.rows;
}

async function syncHomeAssistant(integration: any): Promise<void> {
  const config = integration.config;
  const haUrl = config.url;
  const token = config.token;

  const entities = await fetchEntities(haUrl, token);
  
  const mappings = await getDeviceMappings(integration.id);
  
  for (const mapping of mappings) {
    const entity = entities.find((e: any) => e.entity_id === mapping.integration_entity_id);
    
    if (!entity) {
      logger.warn('Entity not found in Home Assistant', { 
        entityId: mapping.integration_entity_id 
      });
      continue;
    }

    await ingestEntityState(integration, mapping, entity);
  }

  await query(
    'UPDATE integrations SET last_sync = NOW(), error_count = 0, last_error = NULL WHERE id = $1',
    [integration.id]
  );

  logger.info('Home Assistant sync complete', { 
    integrationId: integration.id,
    entitiesProcessed: mappings.length 
  });
}

async function fetchEntities(haUrl: string, token: string): Promise<any[]> {
  try {
    const response = await axios.get(`${haUrl}/api/states`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch Home Assistant entities', { error });
    throw error;
  }
}

async function getDeviceMappings(integrationId: string): Promise<any[]> {
  const result = await query(
    `SELECT dm.*, d.external_id, d.property_id, d.building_id, d.unit_id
     FROM device_mappings dm
     JOIN devices d ON dm.device_id = d.id
     WHERE dm.integration_id = $1`,
    [integrationId]
  );
  return result.rows;
}

async function ingestEntityState(integration: any, mapping: any, entity: any): Promise<void> {
  const deviceResult = await query(
    'SELECT d.*, p.external_id as property_external_id, b.external_id as building_external_id, u.external_id as unit_external_id FROM devices d JOIN properties p ON d.property_id = p.id LEFT JOIN buildings b ON d.building_id = b.id LEFT JOIN units u ON d.unit_id = u.id WHERE d.id = $1',
    [mapping.device_id]
  );

  if (deviceResult.rows.length === 0) {
    logger.warn('Device not found', { deviceId: mapping.device_id });
    return;
  }

  const device = deviceResult.rows[0];

  const value = parseFloat(entity.state);
  if (isNaN(value)) {
    logger.debug('Non-numeric state, skipping', { entityId: entity.entity_id, state: entity.state });
    return;
  }

  const normalizedReading = {
    source: IntegrationType.HOME_ASSISTANT,
    propertyExternalId: device.property_external_id,
    buildingExternalId: device.building_external_id,
    unitExternalId: device.unit_external_id,
    deviceExternalId: device.external_id,
    metricType: mapping.metric_type,
    value: value,
    timestamp: entity.last_updated || new Date().toISOString(),
    status: ReadingStatus.OK,
    metadata: {
      entity_id: entity.entity_id,
      friendly_name: entity.attributes?.friendly_name,
      unit_of_measurement: entity.attributes?.unit_of_measurement,
      device_class: entity.attributes?.device_class,
    },
  };

  await sqsClient.send(new SendMessageCommand({
    QueueUrl: process.env.INGESTION_QUEUE_URL!,
    MessageBody: JSON.stringify(normalizedReading),
  }));

  logger.debug('Entity state ingested', { entityId: entity.entity_id, value });
}

async function logIntegrationError(integrationId: string, error: any): Promise<void> {
  await query(
    `UPDATE integrations 
     SET error_count = error_count + 1, 
         last_error = $1 
     WHERE id = $2`,
    [error.message || String(error), integrationId]
  );

  await query(
    `INSERT INTO integration_events (integration_id, event_type, status, error)
     VALUES ($1, $2, $3, $4)`,
    [integrationId, 'sync', 'error', error.message || String(error)]
  );
}

export async function subscribeToWebSocket(haUrl: string, token: string, onMessage: (data: any) => void): Promise<void> {
  const wsUrl = haUrl.replace('http', 'ws') + '/api/websocket';
  
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    logger.info('WebSocket connection opened', { haUrl });
  });

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'auth_required') {
        ws.send(JSON.stringify({
          type: 'auth',
          access_token: token,
        }));
      } else if (message.type === 'auth_ok') {
        ws.send(JSON.stringify({
          id: 1,
          type: 'subscribe_events',
          event_type: 'state_changed',
        }));
      } else if (message.type === 'event') {
        onMessage(message.event);
      }
    } catch (error) {
      logger.error('WebSocket message error', { error });
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error', { error });
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed');
  });
}
