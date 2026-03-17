import { SQSEvent, Context } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Logger } from '@aws-lambda-powertools/logger';
import { query } from '../../shared/database';
import { AlertChannel, AnomalySeverity } from '../../shared/types';

const logger = new Logger({ serviceName: 'alerting' });
const snsClient = new SNSClient({});
const sesClient = new SESClient({});

export async function handler(event: SQSEvent, context: Context): Promise<void> {
  logger.addContext(context);
  logger.info('Processing alert batch', { recordCount: event.Records.length });

  for (const record of event.Records) {
    try {
      const anomaly = JSON.parse(record.body);
      await processAlert(anomaly);
    } catch (error) {
      logger.error('Failed to process alert', { error, messageId: record.messageId });
    }
  }
}

async function processAlert(anomaly: any): Promise<void> {
  const matchingRules = await findMatchingAlertRules(anomaly);

  if (matchingRules.length === 0) {
    logger.debug('No matching alert rules', { anomaly });
    return;
  }

  for (const rule of matchingRules) {
    if (!shouldTriggerAlert(rule, anomaly)) {
      logger.debug('Alert suppressed by cooldown or mute', { ruleId: rule.id });
      continue;
    }

    const alert = await createAlert(rule, anomaly);
    await dispatchNotifications(alert, rule.channels);
  }
}

async function findMatchingAlertRules(anomaly: any): Promise<any[]> {
  const result = await query(
    `SELECT *
     FROM alert_rules
     WHERE enabled = true
       AND (muted_until IS NULL OR muted_until < NOW())
       AND metric_type = $1
       AND (property_id IS NULL OR property_id = $2)
       AND (building_id IS NULL OR building_id = $3)
       AND (unit_id IS NULL OR unit_id = $4)`,
    [anomaly.metric_type, anomaly.property_id, anomaly.building_id, anomaly.unit_id]
  );

  return result.rows.filter(rule => evaluateCondition(rule.condition, anomaly));
}

function evaluateCondition(condition: any, anomaly: any): boolean {
  if (condition.operator === 'baseline_deviation') {
    return anomaly.anomaly_type === 'baseline_deviation' && 
           anomaly.deviation_percent >= (condition.multiplier || 2) * 100;
  }

  if (condition.operator === '>') {
    return anomaly.actual_value > condition.threshold;
  }

  if (condition.operator === '>=') {
    return anomaly.actual_value >= condition.threshold;
  }

  if (condition.operator === '<') {
    return anomaly.actual_value < condition.threshold;
  }

  if (condition.operator === '<=') {
    return anomaly.actual_value <= condition.threshold;
  }

  if (condition.operator === '=') {
    return anomaly.actual_value === condition.threshold;
  }

  return true;
}

function shouldTriggerAlert(rule: any, anomaly: any): boolean {
  if (rule.muted_until && new Date(rule.muted_until) > new Date()) {
    return false;
  }

  return true;
}

async function createAlert(rule: any, anomaly: any): Promise<any> {
  const unitInfo = await query(
    `SELECT u.unit_number, b.name as building_name, p.name as property_name
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     JOIN properties p ON u.property_id = p.id
     WHERE u.id = $1`,
    [anomaly.unit_id]
  );

  const location = unitInfo.rows.length > 0 
    ? `${unitInfo.rows[0].property_name} - ${unitInfo.rows[0].building_name} - Unit ${unitInfo.rows[0].unit_number}`
    : 'Unknown location';

  const title = `${getSeverityEmoji(anomaly.severity)} ${anomaly.anomaly_type.replace(/_/g, ' ').toUpperCase()}`;
  const message = `${anomaly.description}\n\nLocation: ${location}\nRecommended Action: ${anomaly.recommended_action}`;

  const result = await query(
    `INSERT INTO alerts (
      alert_rule_id, anomaly_id, property_id, building_id, unit_id,
      severity, status, title, message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      rule.id,
      anomaly.id || null,
      anomaly.property_id,
      anomaly.building_id,
      anomaly.unit_id,
      anomaly.severity,
      'active',
      title,
      message,
    ]
  );

  return result.rows[0];
}

function getSeverityEmoji(severity: AnomalySeverity): string {
  const emojis: Record<AnomalySeverity, string> = {
    [AnomalySeverity.LOW]: '🟢',
    [AnomalySeverity.MEDIUM]: '🟡',
    [AnomalySeverity.HIGH]: '🟠',
    [AnomalySeverity.CRITICAL]: '🔴',
  };
  return emojis[severity] || '⚠️';
}

async function dispatchNotifications(alert: any, channels: AlertChannel[]): Promise<void> {
  const channelsSent: AlertChannel[] = [];

  for (const channel of channels) {
    try {
      switch (channel) {
        case AlertChannel.EMAIL:
          await sendEmailNotification(alert);
          channelsSent.push(AlertChannel.EMAIL);
          break;

        case AlertChannel.SMS:
          await sendSMSNotification(alert);
          channelsSent.push(AlertChannel.SMS);
          break;

        case AlertChannel.WEBHOOK:
          await sendWebhookNotification(alert);
          channelsSent.push(AlertChannel.WEBHOOK);
          break;

        case AlertChannel.HOME_ASSISTANT:
          await sendHomeAssistantNotification(alert);
          channelsSent.push(AlertChannel.HOME_ASSISTANT);
          break;

        default:
          logger.warn('Unsupported alert channel', { channel });
      }
    } catch (error) {
      logger.error('Failed to send notification', { channel, error });
    }
  }

  await query(
    'UPDATE alerts SET channels_sent = $1 WHERE id = $2',
    [channelsSent, alert.id]
  );
}

async function sendEmailNotification(alert: any): Promise<void> {
  const recipients = await getAlertRecipients(alert.property_id);

  if (recipients.length === 0) {
    logger.warn('No email recipients found', { propertyId: alert.property_id });
    return;
  }

  await sesClient.send(new SendEmailCommand({
    Source: 'alerts@energy-dashboard.com',
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Subject: {
        Data: alert.title,
      },
      Body: {
        Text: {
          Data: alert.message,
        },
        Html: {
          Data: `
            <html>
              <body>
                <h2>${alert.title}</h2>
                <p>${alert.message.replace(/\n/g, '<br>')}</p>
                <p><strong>Severity:</strong> ${alert.severity}</p>
                <p><strong>Time:</strong> ${new Date(alert.created_at).toLocaleString()}</p>
              </body>
            </html>
          `,
        },
      },
    },
  }));

  logger.info('Email notification sent', { alertId: alert.id, recipients: recipients.length });
}

async function sendSMSNotification(alert: any): Promise<void> {
  const phoneNumbers = await getAlertPhoneNumbers(alert.property_id);

  if (phoneNumbers.length === 0) {
    logger.warn('No SMS recipients found', { propertyId: alert.property_id });
    return;
  }

  for (const phoneNumber of phoneNumbers) {
    await snsClient.send(new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: `${alert.title}\n\n${alert.message.substring(0, 140)}`,
    }));
  }

  logger.info('SMS notifications sent', { alertId: alert.id, recipients: phoneNumbers.length });
}

async function sendWebhookNotification(alert: any): Promise<void> {
  logger.info('Webhook notification placeholder', { alertId: alert.id });
}

async function sendHomeAssistantNotification(alert: any): Promise<void> {
  logger.info('Home Assistant notification placeholder', { alertId: alert.id });
}

async function getAlertRecipients(propertyId: string): Promise<string[]> {
  const result = await query(
    `SELECT DISTINCT email
     FROM users
     WHERE $1 = ANY(properties_access)
       AND email IS NOT NULL
       AND role IN ('admin', 'manager')`,
    [propertyId]
  );

  return result.rows.map(r => r.email);
}

async function getAlertPhoneNumbers(propertyId: string): Promise<string[]> {
  const result = await query(
    `SELECT DISTINCT u.tenant_phone
     FROM units u
     WHERE u.property_id = $1
       AND u.tenant_phone IS NOT NULL
       AND u.occupied = true`,
    [propertyId]
  );

  return result.rows.map(r => r.tenant_phone).filter(Boolean);
}
