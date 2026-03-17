import { SQSEvent, Context } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Logger } from '@aws-lambda-powertools/logger';
import { query, transaction } from '../../shared/database';
import { NormalizedReading, AnomalyType, AnomalySeverity, MetricType } from '../../shared/types';

const logger = new Logger({ serviceName: 'anomaly-detection' });
const sqsClient = new SQSClient({});

export async function handler(event: SQSEvent, context: Context): Promise<void> {
  logger.addContext(context);
  logger.info('Processing anomaly detection batch', { recordCount: event.Records.length });

  for (const record of event.Records) {
    try {
      const reading: NormalizedReading = JSON.parse(record.body);
      await detectAnomalies(reading);
    } catch (error) {
      logger.error('Failed to process anomaly detection', { error, messageId: record.messageId });
    }
  }
}

async function detectAnomalies(reading: NormalizedReading): Promise<void> {
  const deviceResult = await query(
    `SELECT d.id, d.property_id, d.building_id, d.unit_id
     FROM devices d
     JOIN properties p ON d.property_id = p.id
     WHERE d.external_id = $1 AND p.external_id = $2`,
    [reading.deviceExternalId, reading.propertyExternalId]
  );

  if (deviceResult.rows.length === 0) {
    logger.warn('Device not found for anomaly detection', { reading });
    return;
  }

  const device = deviceResult.rows[0];

  const anomalies = await Promise.all([
    checkStaticThreshold(reading, device),
    checkBaselineDeviation(reading, device),
    checkSpike(reading, device),
    checkLeakPattern(reading, device),
  ]);

  const detectedAnomalies = anomalies.filter(a => a !== null);

  for (const anomaly of detectedAnomalies) {
    if (anomaly) {
      await persistAnomaly(anomaly);
      await triggerAlert(anomaly);
    }
  }

  if (detectedAnomalies.length > 0) {
    logger.info('Anomalies detected', { count: detectedAnomalies.length, device: device.id });
  }
}

async function checkStaticThreshold(reading: NormalizedReading, device: any): Promise<any | null> {
  const thresholds: Record<string, number> = {
    [MetricType.ELECTRIC_KW]: 5.0,
    [MetricType.WATER_FLOW_RATE]: 3.0,
  };

  const threshold = thresholds[reading.metricType as MetricType];
  if (!threshold || reading.value <= threshold) {
    return null;
  }

  const deviationPercent = ((reading.value - threshold) / threshold) * 100;

  return {
    timestamp: reading.timestamp,
    property_id: device.property_id,
    building_id: device.building_id,
    unit_id: device.unit_id,
    device_id: device.id,
    anomaly_type: AnomalyType.STATIC_THRESHOLD,
    severity: reading.value > threshold * 2 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM,
    metric_type: reading.metricType,
    actual_value: reading.value,
    expected_value: threshold,
    deviation_percent: deviationPercent,
    confidence_score: 0.95,
    description: `${reading.metricType} exceeded static threshold of ${threshold}`,
    recommended_action: 'Investigate high usage - check for malfunctioning equipment or unusual activity',
  };
}

async function checkBaselineDeviation(reading: NormalizedReading, device: any): Promise<any | null> {
  const timestamp = new Date(reading.timestamp);
  const hourOfDay = timestamp.getHours();
  const dayOfWeek = timestamp.getDay();

  const baselineResult = await query(
    `SELECT baseline_value, std_deviation
     FROM baselines
     WHERE unit_id = $1
       AND metric_type = $2
       AND hour_of_day = $3
       AND day_of_week = $4
       AND valid_from <= CURRENT_DATE
       AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
     ORDER BY created_at DESC
     LIMIT 1`,
    [device.unit_id, reading.metricType, hourOfDay, dayOfWeek]
  );

  if (baselineResult.rows.length === 0) {
    return null;
  }

  const baseline = baselineResult.rows[0];
  const deviation = Math.abs(reading.value - baseline.baseline_value);
  const deviationPercent = (deviation / baseline.baseline_value) * 100;

  const threshold = baseline.std_deviation ? baseline.baseline_value + (2.5 * baseline.std_deviation) : baseline.baseline_value * 1.5;

  if (reading.value <= threshold) {
    return null;
  }

  return {
    timestamp: reading.timestamp,
    property_id: device.property_id,
    building_id: device.building_id,
    unit_id: device.unit_id,
    device_id: device.id,
    anomaly_type: AnomalyType.BASELINE_DEVIATION,
    severity: deviationPercent > 200 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM,
    metric_type: reading.metricType,
    actual_value: reading.value,
    expected_value: baseline.baseline_value,
    deviation_percent: deviationPercent,
    confidence_score: 0.85,
    description: `${reading.metricType} deviates ${deviationPercent.toFixed(1)}% from baseline`,
    recommended_action: 'Compare with historical patterns - may indicate changed behavior or equipment issue',
  };
}

async function checkSpike(reading: NormalizedReading, device: any): Promise<any | null> {
  const recentReadingsResult = await query(
    `SELECT value
     FROM sensor_readings
     WHERE device_id = $1
       AND metric_type = $2
       AND timestamp >= $3
       AND timestamp < $4
     ORDER BY timestamp DESC
     LIMIT 10`,
    [device.id, reading.metricType, new Date(Date.now() - 3600000).toISOString(), reading.timestamp]
  );

  if (recentReadingsResult.rows.length < 5) {
    return null;
  }

  const recentValues = recentReadingsResult.rows.map(r => r.value);
  const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

  const spikeThreshold = avgRecent * 3;

  if (reading.value <= spikeThreshold) {
    return null;
  }

  const deviationPercent = ((reading.value - avgRecent) / avgRecent) * 100;

  return {
    timestamp: reading.timestamp,
    property_id: device.property_id,
    building_id: device.building_id,
    unit_id: device.unit_id,
    device_id: device.id,
    anomaly_type: AnomalyType.SPIKE,
    severity: reading.value > avgRecent * 5 ? AnomalySeverity.CRITICAL : AnomalySeverity.HIGH,
    metric_type: reading.metricType,
    actual_value: reading.value,
    expected_value: avgRecent,
    deviation_percent: deviationPercent,
    confidence_score: 0.90,
    description: `Sudden spike detected - ${deviationPercent.toFixed(1)}% increase from recent average`,
    recommended_action: 'Immediate investigation recommended - possible equipment malfunction or emergency',
  };
}

async function checkLeakPattern(reading: NormalizedReading, device: any): Promise<any | null> {
  if (reading.metricType !== MetricType.WATER_FLOW_RATE && reading.metricType !== MetricType.LEAK) {
    return null;
  }

  if (reading.metricType === MetricType.LEAK && reading.value > 0) {
    return {
      timestamp: reading.timestamp,
      property_id: device.property_id,
      building_id: device.building_id,
      unit_id: device.unit_id,
      device_id: device.id,
      anomaly_type: AnomalyType.LEAK,
      severity: AnomalySeverity.CRITICAL,
      metric_type: reading.metricType,
      actual_value: reading.value,
      expected_value: 0,
      deviation_percent: 100,
      confidence_score: 0.99,
      description: 'Leak sensor triggered',
      recommended_action: 'IMMEDIATE ACTION REQUIRED - Shut off water and inspect for leaks',
    };
  }

  const continuousFlowResult = await query(
    `SELECT COUNT(*) as count, AVG(value) as avg_flow
     FROM sensor_readings
     WHERE device_id = $1
       AND metric_type = $2
       AND timestamp >= $3
       AND timestamp < $4
       AND value > 0.5`,
    [device.id, MetricType.WATER_FLOW_RATE, new Date(Date.now() - 1200000).toISOString(), reading.timestamp]
  );

  const continuousFlow = continuousFlowResult.rows[0];

  if (continuousFlow.count >= 4 && continuousFlow.avg_flow > 0.5) {
    const timestamp = new Date(reading.timestamp);
    const hour = timestamp.getHours();

    if (hour >= 23 || hour <= 5) {
      return {
        timestamp: reading.timestamp,
        property_id: device.property_id,
        building_id: device.building_id,
        unit_id: device.unit_id,
        device_id: device.id,
        anomaly_type: AnomalyType.LEAK,
        severity: AnomalySeverity.HIGH,
        metric_type: reading.metricType,
        actual_value: reading.value,
        expected_value: 0,
        deviation_percent: 100,
        confidence_score: 0.80,
        description: 'Continuous water flow detected during off-hours - possible leak',
        recommended_action: 'Inspect for leaks - continuous flow for 20+ minutes during nighttime',
      };
    }
  }

  return null;
}

async function persistAnomaly(anomaly: any): Promise<string> {
  const result = await query(
    `INSERT INTO anomalies (
      timestamp, property_id, building_id, unit_id, device_id,
      anomaly_type, severity, metric_type, actual_value, expected_value,
      deviation_percent, confidence_score, description, recommended_action
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id`,
    [
      anomaly.timestamp,
      anomaly.property_id,
      anomaly.building_id,
      anomaly.unit_id,
      anomaly.device_id,
      anomaly.anomaly_type,
      anomaly.severity,
      anomaly.metric_type,
      anomaly.actual_value,
      anomaly.expected_value,
      anomaly.deviation_percent,
      anomaly.confidence_score,
      anomaly.description,
      anomaly.recommended_action,
    ]
  );

  return result.rows[0].id;
}

async function triggerAlert(anomaly: any): Promise<void> {
  try {
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: process.env.ALERT_QUEUE_URL!,
      MessageBody: JSON.stringify(anomaly),
    }));

    logger.debug('Alert triggered', { anomalyType: anomaly.anomaly_type, severity: anomaly.severity });
  } catch (error) {
    logger.error('Failed to trigger alert', { error });
  }
}
