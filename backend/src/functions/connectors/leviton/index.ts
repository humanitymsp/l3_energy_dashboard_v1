import { Context, ScheduledEvent } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Logger } from '@aws-lambda-powertools/logger';
import { query } from '../../../shared/database';
import { IntegrationType, MetricType, ReadingStatus } from '../../../shared/types';
import { LevitonClient } from '../../../integrations/leviton';

const logger = new Logger({ serviceName: 'leviton-connector' });
const sqsClient = new SQSClient({});

/**
 * Scheduled Lambda that polls Leviton Decora Smart devices via My Leviton cloud API.
 * Runs on a 5-minute interval to collect power/energy data from 2nd-gen switches and dimmers.
 */
export async function handler(_event: ScheduledEvent, context: Context): Promise<void> {
  logger.addContext(context);
  logger.info('Leviton connector triggered');

  const integrations = await getLevitonIntegrations();

  for (const integration of integrations) {
    try {
      await syncLeviton(integration);
    } catch (error) {
      logger.error('Failed to sync Leviton', { integrationId: integration.id, error });
      await logIntegrationError(integration.id, error);
    }
  }
}

async function getLevitonIntegrations(): Promise<any[]> {
  const result = await query(
    `SELECT * FROM integrations 
     WHERE integration_type = $1 AND enabled = true`,
    [IntegrationType.LEVITON]
  );
  return result.rows;
}

async function syncLeviton(integration: any): Promise<void> {
  const config = integration.config;

  const client = new LevitonClient({
    email: config.email,
    password: config.password,
    apiUrl: config.apiUrl,
  });

  await client.authenticate();

  const mappings = await getDeviceMappings(integration.id);

  const residences = await client.getResidences();

  for (const residence of residences) {
    const devices = await client.getDevices(residence.id);

    for (const device of devices) {
      const mapping = mappings.find(
        (m: any) => m.integration_entity_id === device.id
      );

      if (!mapping) {
        logger.debug('Unmapped Leviton device, skipping', { deviceId: device.id, deviceName: device.name });
        continue;
      }

      const reading = await client.getDeviceStatus(device.id);
      if (!reading) continue;

      const deviceResult = await query(
        'SELECT d.*, p.external_id as property_external_id, b.external_id as building_external_id, u.external_id as unit_external_id FROM devices d JOIN properties p ON d.property_id = p.id LEFT JOIN buildings b ON d.building_id = b.id LEFT JOIN units u ON d.unit_id = u.id WHERE d.id = $1',
        [mapping.device_id]
      );

      if (deviceResult.rows.length === 0) {
        logger.warn('Device not found', { deviceId: mapping.device_id });
        continue;
      }

      const dbDevice = deviceResult.rows[0];

      // Send power reading (Watts → kW)
      if (reading.power > 0) {
        const normalizedReading = {
          source: IntegrationType.LEVITON,
          propertyExternalId: dbDevice.property_external_id,
          buildingExternalId: dbDevice.building_external_id,
          unitExternalId: dbDevice.unit_external_id,
          deviceExternalId: dbDevice.external_id,
          metricType: MetricType.ELECTRIC_KW,
          value: reading.power / 1000, // W → kW
          timestamp: reading.timestamp,
          status: ReadingStatus.OK,
          metadata: {
            leviton_device_id: device.id,
            device_name: device.name,
            model: device.model,
            is_on: reading.is_on,
            brightness: reading.brightness,
          },
        };

        await sqsClient.send(new SendMessageCommand({
          QueueUrl: process.env.INGESTION_QUEUE_URL!,
          MessageBody: JSON.stringify(normalizedReading),
        }));
      }

      // Send cumulative energy reading (kWh)
      if (reading.energy > 0) {
        const energyReading = {
          source: IntegrationType.LEVITON,
          propertyExternalId: dbDevice.property_external_id,
          buildingExternalId: dbDevice.building_external_id,
          unitExternalId: dbDevice.unit_external_id,
          deviceExternalId: dbDevice.external_id,
          metricType: MetricType.ELECTRIC_KWH,
          value: reading.energy,
          timestamp: reading.timestamp,
          status: ReadingStatus.OK,
          metadata: {
            leviton_device_id: device.id,
            reading_type: 'cumulative_energy',
          },
        };

        await sqsClient.send(new SendMessageCommand({
          QueueUrl: process.env.INGESTION_QUEUE_URL!,
          MessageBody: JSON.stringify(energyReading),
        }));
      }

      logger.debug('Leviton device synced', { deviceId: device.id, power: reading.power });
    }
  }

  await client.disconnect();

  await query(
    'UPDATE integrations SET last_sync = NOW(), error_count = 0, last_error = NULL WHERE id = $1',
    [integration.id]
  );

  logger.info('Leviton sync complete', { integrationId: integration.id });
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
