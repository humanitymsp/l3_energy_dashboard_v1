import { SQSEvent, SQSHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const logger = new Logger({ serviceName: 'unifi-connector' });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

interface UniFiConfig {
  protectUrl: string;
  alarmHubUrl: string;
  accessUrl: string;
  username: string;
  password: string;
  apiKey?: string;
}

interface UniFiDevice {
  id: string;
  name: string;
  type: 'camera' | 'leak_sensor' | 'contact_sensor' | 'motion_sensor' | 'temperature_sensor' | 'smart_plug' | 'access_reader';
  location: {
    propertyId: string;
    buildingId: string;
    unitId?: string;
    zone: string;
  };
  status: 'online' | 'offline';
  batteryLevel?: number;
  firmwareVersion?: string;
}

interface UniFiEvent {
  type: 'motion' | 'leak' | 'contact' | 'temperature' | 'access' | 'smart_detection' | 'power';
  deviceId: string;
  deviceName: string;
  location: {
    propertyId: string;
    buildingId: string;
    unitId?: string;
    zone: string;
  };
  timestamp: string;
  data: any;
  metadata: {
    batteryLevel?: number;
    signalStrength?: number;
    firmwareVersion?: string;
  };
}

class UniFiProtectClient {
  private client: AxiosInstance;
  private wsConnection?: WebSocket;
  private authToken?: string;

  constructor(private config: UniFiConfig) {
    this.client = axios.create({
      baseURL: config.protectUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async authenticate(): Promise<void> {
    try {
      const response = await this.client.post('/api/auth/login', {
        username: this.config.username,
        password: this.config.password,
      });

      this.authToken = response.headers['x-csrf-token'] || response.data.token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      
      logger.info('UniFi Protect authenticated successfully');
    } catch (error) {
      logger.error('UniFi Protect authentication failed', { error });
      throw error;
    }
  }

  async getCameras(): Promise<any[]> {
    try {
      const response = await this.client.get('/proxy/protect/api/cameras');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch cameras', { error });
      return [];
    }
  }

  async getMotionEvents(since: Date): Promise<any[]> {
    try {
      const response = await this.client.get('/proxy/protect/api/events', {
        params: {
          start: since.getTime(),
          type: 'motion',
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch motion events', { error });
      return [];
    }
  }

  async getSmartDetections(since: Date): Promise<any[]> {
    try {
      const response = await this.client.get('/proxy/protect/api/events', {
        params: {
          start: since.getTime(),
          type: 'smartDetectZone',
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch smart detections', { error });
      return [];
    }
  }

  connectWebSocket(onEvent: (event: any) => void): void {
    const wsUrl = this.config.protectUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    this.wsConnection = new WebSocket(`${wsUrl}/proxy/protect/ws/updates`, {
      headers: {
        'Cookie': `TOKEN=${this.authToken}`,
      },
    });

    this.wsConnection.on('open', () => {
      logger.info('UniFi Protect WebSocket connected');
    });

    this.wsConnection.on('message', (data: string) => {
      try {
        const event = JSON.parse(data);
        onEvent(event);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', { error, data });
      }
    });

    this.wsConnection.on('error', (error) => {
      logger.error('UniFi Protect WebSocket error', { error });
    });

    this.wsConnection.on('close', () => {
      logger.warn('UniFi Protect WebSocket closed, reconnecting...');
      setTimeout(() => this.connectWebSocket(onEvent), 5000);
    });
  }
}

class UniFiAlarmHubClient {
  private client: AxiosInstance;

  constructor(private config: UniFiConfig) {
    this.client = axios.create({
      baseURL: config.alarmHubUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
    });
  }

  async getSensors(): Promise<UniFiDevice[]> {
    try {
      const response = await this.client.get('/api/sensors');
      return response.data.map((sensor: any) => this.normalizeSensor(sensor));
    } catch (error) {
      logger.error('Failed to fetch sensors', { error });
      return [];
    }
  }

  async getLeakSensors(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/sensors', {
        params: { type: 'leak' },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch leak sensors', { error });
      return [];
    }
  }

  async getContactSensors(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/sensors', {
        params: { type: 'contact' },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch contact sensors', { error });
      return [];
    }
  }

  async getMotionSensors(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/sensors', {
        params: { type: 'motion' },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch motion sensors', { error });
      return [];
    }
  }

  async getTemperatureSensors(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/sensors', {
        params: { type: 'temperature' },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch temperature sensors', { error });
      return [];
    }
  }

  async getSensorEvents(sensorId: string, since: Date): Promise<any[]> {
    try {
      const response = await this.client.get(`/api/sensors/${sensorId}/events`, {
        params: {
          start: since.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch sensor events', { error, sensorId });
      return [];
    }
  }

  private normalizeSensor(sensor: any): UniFiDevice {
    return {
      id: sensor.id,
      name: sensor.name,
      type: this.mapSensorType(sensor.type),
      location: sensor.location || {},
      status: sensor.isOnline ? 'online' : 'offline',
      batteryLevel: sensor.batteryLevel,
      firmwareVersion: sensor.firmwareVersion,
    };
  }

  private mapSensorType(type: string): UniFiDevice['type'] {
    const typeMap: Record<string, UniFiDevice['type']> = {
      'leak': 'leak_sensor',
      'contact': 'contact_sensor',
      'motion': 'motion_sensor',
      'temperature': 'temperature_sensor',
      'plug': 'smart_plug',
    };
    return typeMap[type] || 'motion_sensor';
  }
}

class UniFiAccessClient {
  private client: AxiosInstance;

  constructor(private config: UniFiConfig) {
    this.client = axios.create({
      baseURL: config.accessUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
    });
  }

  async getAccessEvents(since: Date): Promise<any[]> {
    try {
      const response = await this.client.get('/api/access/events', {
        params: {
          start: since.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch access events', { error });
      return [];
    }
  }

  async getDoors(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/access/doors');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch doors', { error });
      return [];
    }
  }
}

// Event correlation engine
class UniFiEventCorrelator {
  async correlateLeakWithWaterUsage(leakEvent: UniFiEvent): Promise<void> {
    logger.info('Correlating leak detection with water usage', { leakEvent });

    // Query water meter readings for the same location
    // Check for usage spike in the last 15 minutes
    // Create high-priority alert if correlation found
    
    const correlatedAlert = {
      type: 'correlated_leak_detection',
      severity: 'critical',
      title: 'Leak Sensor Triggered with Water Usage Spike',
      message: `Leak detected at ${leakEvent.location.zone} with concurrent water usage increase`,
      sources: ['unifi_leak_sensor', 'water_meter'],
      location: leakEvent.location,
      timestamp: new Date().toISOString(),
      actions: [
        'Check leak sensor location',
        'Review water meter readings',
        'Consider automatic shutoff',
      ],
    };

    await this.sendToAlertQueue(correlatedAlert);
  }

  async correlateOccupancyWithUsage(occupancyEvent: UniFiEvent): Promise<void> {
    logger.info('Correlating occupancy with utility usage', { occupancyEvent });

    // Check if unit is marked as vacant
    // If vacant but motion/access detected, update occupancy status
    // If vacant with high usage, create alert
  }

  async correlateHVACEfficiency(tempEvent: UniFiEvent, contactEvent?: UniFiEvent): Promise<void> {
    logger.info('Correlating HVAC efficiency', { tempEvent, contactEvent });

    // Check if doors/windows are open
    // Check HVAC runtime
    // Calculate efficiency score
    // Alert if energy waste detected
  }

  private async sendToAlertQueue(alert: any): Promise<void> {
    try {
      await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.ALERT_QUEUE_URL,
        MessageBody: JSON.stringify(alert),
      }));
      logger.info('Alert sent to queue', { alertType: alert.type });
    } catch (error) {
      logger.error('Failed to send alert to queue', { error, alert });
    }
  }
}

// Main Lambda handler
export const handler: SQSHandler = async (event: SQSEvent) => {
  logger.info('Processing UniFi connector event', { recordCount: event.Records.length });

  const config: UniFiConfig = {
    protectUrl: process.env.UNIFI_PROTECT_URL || '',
    alarmHubUrl: process.env.UNIFI_ALARMHUB_URL || '',
    accessUrl: process.env.UNIFI_ACCESS_URL || '',
    username: process.env.UNIFI_USERNAME || '',
    password: process.env.UNIFI_PASSWORD || '',
    apiKey: process.env.UNIFI_API_KEY,
  };

  const protectClient = new UniFiProtectClient(config);
  const alarmHubClient = new UniFiAlarmHubClient(config);
  const accessClient = new UniFiAccessClient(config);
  const correlator = new UniFiEventCorrelator();

  try {
    // Authenticate with UniFi Protect
    await protectClient.authenticate();

    // Fetch recent events
    const since = new Date(Date.now() - 15 * 60 * 1000); // Last 15 minutes

    const [motionEvents, smartDetections, leakSensors, accessEvents] = await Promise.all([
      protectClient.getMotionEvents(since),
      protectClient.getSmartDetections(since),
      alarmHubClient.getLeakSensors(),
      accessClient.getAccessEvents(since),
    ]);

    logger.info('Fetched UniFi events', {
      motionEvents: motionEvents.length,
      smartDetections: smartDetections.length,
      leakSensors: leakSensors.length,
      accessEvents: accessEvents.length,
    });

    // Process and correlate events
    for (const leakSensor of leakSensors) {
      if (leakSensor.leakDetected) {
        const event: UniFiEvent = {
          type: 'leak',
          deviceId: leakSensor.id,
          deviceName: leakSensor.name,
          location: leakSensor.location,
          timestamp: new Date().toISOString(),
          data: { leakDetected: true },
          metadata: {
            batteryLevel: leakSensor.batteryLevel,
          },
        };
        await correlator.correlateLeakWithWaterUsage(event);
      }
    }

    // Send normalized events to ingestion queue
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.INGESTION_QUEUE_URL,
        MessageBody: JSON.stringify({
          source: 'unifi',
          ...message,
        }),
      }));
    }

    logger.info('UniFi connector processing complete');
  } catch (error) {
    logger.error('UniFi connector error', { error });
    throw error;
  }
};

// WebSocket event handler (for real-time processing)
export const websocketHandler = async (event: any) => {
  logger.info('Processing UniFi WebSocket event', { event });

  const config: UniFiConfig = {
    protectUrl: process.env.UNIFI_PROTECT_URL || '',
    alarmHubUrl: process.env.UNIFI_ALARMHUB_URL || '',
    accessUrl: process.env.UNIFI_ACCESS_URL || '',
    username: process.env.UNIFI_USERNAME || '',
    password: process.env.UNIFI_PASSWORD || '',
    apiKey: process.env.UNIFI_API_KEY,
  };

  const protectClient = new UniFiProtectClient(config);
  const correlator = new UniFiEventCorrelator();

  await protectClient.authenticate();

  // Set up WebSocket connection for real-time events
  protectClient.connectWebSocket(async (wsEvent) => {
    logger.info('Received UniFi WebSocket event', { wsEvent });

    // Process event in real-time
    if (wsEvent.type === 'motion') {
      const unifiEvent: UniFiEvent = {
        type: 'motion',
        deviceId: wsEvent.camera.id,
        deviceName: wsEvent.camera.name,
        location: wsEvent.camera.location,
        timestamp: new Date(wsEvent.start).toISOString(),
        data: {
          detected: true,
          smartDetection: wsEvent.smartDetectTypes,
        },
        metadata: {},
      };

      await correlator.correlateOccupancyWithUsage(unifiEvent);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'WebSocket handler initialized' }),
  };
};
