import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Logger } from '@aws-lambda-powertools/logger';
import { query, transaction } from '../../shared/database';
import { NormalizedReading, IntegrationType, MetricType, ReadingStatus } from '../../shared/types';
import Joi from 'joi';

const logger = new Logger({ serviceName: 'ingestion' });
const sqsClient = new SQSClient({});
const s3Client = new S3Client({});

const normalizedReadingSchema = Joi.object({
  source: Joi.string().valid(...Object.values(IntegrationType)).required(),
  propertyExternalId: Joi.string().required(),
  buildingExternalId: Joi.string().optional(),
  unitExternalId: Joi.string().optional(),
  deviceExternalId: Joi.string().required(),
  metricType: Joi.string().valid(...Object.values(MetricType)).required(),
  value: Joi.number().required(),
  timestamp: Joi.string().isoDate().required(),
  status: Joi.string().valid(...Object.values(ReadingStatus)).default('ok'),
  metadata: Joi.object().optional(),
});

export async function handler(event: SQSEvent, context: Context): Promise<void> {
  logger.addContext(context);
  logger.info('Processing ingestion batch', { recordCount: event.Records.length });

  const results = await Promise.allSettled(
    event.Records.map(record => processRecord(record))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  logger.info('Ingestion batch complete', { succeeded, failed });
}

async function processRecord(record: SQSRecord): Promise<void> {
  const messageId = record.messageId;
  
  try {
    const payload = JSON.parse(record.body);
    logger.debug('Processing message', { messageId, payload });

    await storeRawEvent(payload);

    const normalizedReading = await normalizePayload(payload);
    
    const { error } = normalizedReadingSchema.validate(normalizedReading);
    if (error) {
      logger.error('Validation failed', { messageId, error: error.message });
      throw new Error(`Validation failed: ${error.message}`);
    }

    await persistReading(normalizedReading);

    await triggerAnomalyDetection(normalizedReading);

    logger.info('Message processed successfully', { messageId });
  } catch (error) {
    logger.error('Failed to process message', { messageId, error });
    throw error;
  }
}

async function storeRawEvent(payload: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const s3Key = `raw-events/${timestamp.substring(0, 10)}/${Date.now()}-${Math.random().toString(36).substring(7)}.json`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.EVENT_BUCKET!,
    Key: s3Key,
    Body: JSON.stringify(payload),
    ContentType: 'application/json',
  }));

  await query(
    `INSERT INTO raw_events (source, event_type, payload, s3_key) VALUES ($1, $2, $3, $4)`,
    [payload.source || 'unknown', payload.type || 'reading', payload, s3Key]
  );
}

async function normalizePayload(payload: any): Promise<NormalizedReading> {
  if (payload.source && payload.deviceExternalId) {
    return payload as NormalizedReading;
  }

  if (payload.topic && payload.topic.startsWith('energy/meters/')) {
    return {
      source: IntegrationType.MQTT_METER,
      propertyExternalId: payload.propertyId || 'unknown',
      buildingExternalId: payload.buildingId,
      unitExternalId: payload.unitId,
      deviceExternalId: payload.deviceId || payload.topic.split('/').pop()!,
      metricType: payload.metric || MetricType.ELECTRIC_KW,
      value: parseFloat(payload.value || payload.power || payload.usage || 0),
      timestamp: payload.timestamp || new Date().toISOString(),
      status: payload.status || ReadingStatus.OK,
      metadata: payload,
    };
  }

  if (payload.entity_id) {
    return {
      source: IntegrationType.HOME_ASSISTANT,
      propertyExternalId: payload.propertyId || 'unknown',
      buildingExternalId: payload.buildingId,
      unitExternalId: payload.unitId,
      deviceExternalId: payload.entity_id,
      metricType: inferMetricType(payload.entity_id, payload.unit_of_measurement),
      value: parseFloat(payload.state || payload.value || 0),
      timestamp: payload.last_changed || payload.last_updated || new Date().toISOString(),
      status: ReadingStatus.OK,
      metadata: payload,
    };
  }

  throw new Error('Unable to normalize payload - unknown format');
}

function inferMetricType(entityId: string, unit?: string): MetricType {
  const lowerEntity = entityId.toLowerCase();
  
  if (lowerEntity.includes('power') || lowerEntity.includes('electric') || unit === 'kW') {
    return MetricType.ELECTRIC_KW;
  }
  if (lowerEntity.includes('energy') || unit === 'kWh') {
    return MetricType.ELECTRIC_KWH;
  }
  if (lowerEntity.includes('water') && (lowerEntity.includes('flow') || unit === 'gpm')) {
    return MetricType.WATER_FLOW_RATE;
  }
  if (lowerEntity.includes('water') || unit === 'gal') {
    return MetricType.WATER_GALLONS;
  }
  if (lowerEntity.includes('temp') || unit === '°F' || unit === '°C') {
    return MetricType.TEMPERATURE;
  }
  if (lowerEntity.includes('humidity') || unit === '%') {
    return MetricType.HUMIDITY;
  }
  if (lowerEntity.includes('leak')) {
    return MetricType.LEAK;
  }
  if (lowerEntity.includes('door')) {
    return MetricType.DOOR;
  }
  if (lowerEntity.includes('motion')) {
    return MetricType.MOTION;
  }

  return MetricType.ELECTRIC_KW;
}

async function persistReading(reading: NormalizedReading): Promise<void> {
  await transaction(async (client) => {
    const propertyResult = await client.query(
      'SELECT id FROM properties WHERE external_id = $1',
      [reading.propertyExternalId]
    );

    if (propertyResult.rows.length === 0) {
      throw new Error(`Property not found: ${reading.propertyExternalId}`);
    }

    const propertyId = propertyResult.rows[0].id;

    let buildingId = null;
    if (reading.buildingExternalId) {
      const buildingResult = await client.query(
        'SELECT id FROM buildings WHERE external_id = $1 AND property_id = $2',
        [reading.buildingExternalId, propertyId]
      );
      buildingId = buildingResult.rows[0]?.id || null;
    }

    let unitId = null;
    if (reading.unitExternalId) {
      const unitResult = await client.query(
        'SELECT id FROM units WHERE external_id = $1 AND property_id = $2',
        [reading.unitExternalId, propertyId]
      );
      unitId = unitResult.rows[0]?.id || null;
    }

    const deviceResult = await client.query(
      'SELECT id FROM devices WHERE external_id = $1 AND property_id = $2',
      [reading.deviceExternalId, propertyId]
    );

    let deviceId;
    if (deviceResult.rows.length === 0) {
      const insertResult = await client.query(
        `INSERT INTO devices (property_id, building_id, unit_id, external_id, device_type, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [propertyId, buildingId, unitId, reading.deviceExternalId, reading.metricType, reading.status]
      );
      deviceId = insertResult.rows[0].id;
      logger.info('Created new device', { deviceId, externalId: reading.deviceExternalId });
    } else {
      deviceId = deviceResult.rows[0].id;
    }

    await client.query(
      `INSERT INTO sensor_readings 
       (timestamp, property_id, building_id, unit_id, device_id, metric_type, value, status, source, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        reading.timestamp,
        propertyId,
        buildingId,
        unitId,
        deviceId,
        reading.metricType,
        reading.value,
        reading.status,
        reading.source,
        reading.metadata || null,
      ]
    );

    logger.info('Reading persisted', {
      deviceId,
      metricType: reading.metricType,
      value: reading.value,
    });
  });
}

async function triggerAnomalyDetection(reading: NormalizedReading): Promise<void> {
  if (!['electric_kw', 'electric_kwh', 'water_gallons', 'water_flow_rate'].includes(reading.metricType)) {
    return;
  }

  try {
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: process.env.ANOMALY_QUEUE_URL!,
      MessageBody: JSON.stringify(reading),
    }));

    logger.debug('Anomaly detection triggered', { metricType: reading.metricType });
  } catch (error) {
    logger.error('Failed to trigger anomaly detection', { error });
  }
}
