import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'unifi-integration' });

export interface UniFiConfig {
  protectUrl: string;
  alarmHubUrl?: string;
  username: string;
  password: string;
}

export interface UniFiLeakSensor {
  id: string;
  name: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  location: string;
  battery_level: number;
  is_leak_detected: boolean;
  last_seen: string;
}

export interface UniFiMotionEvent {
  id: string;
  camera_id: string;
  camera_name: string;
  timestamp: string;
  type: 'motion' | 'person' | 'vehicle' | 'package';
  score: number;
  thumbnail_url?: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
}

export class UniFiClient {
  private protectClient: AxiosInstance;
  private alarmClient?: AxiosInstance;
  private authToken?: string;
  private wsConnection?: WebSocket;

  constructor(private config: UniFiConfig) {
    this.protectClient = axios.create({
      baseURL: config.protectUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false, // For self-signed certs
      }),
    });

    if (config.alarmHubUrl) {
      this.alarmClient = axios.create({
        baseURL: config.alarmHubUrl,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  /**
   * Authenticate with UniFi Protect
   */
  async authenticate(): Promise<void> {
    try {
      const response = await this.protectClient.post('/api/auth/login', {
        username: this.config.username,
        password: this.config.password,
      });

      this.authToken = response.headers['x-csrf-token'] || response.data.token;
      this.protectClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      
      if (this.alarmClient) {
        this.alarmClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      }

      logger.info('UniFi authenticated successfully');
    } catch (error) {
      logger.error('UniFi authentication failed', { error });
      throw error;
    }
  }

  /**
   * Get all leak sensors from AlarmHub
   */
  async getLeakSensors(): Promise<UniFiLeakSensor[]> {
    if (!this.alarmClient) {
      logger.warn('AlarmHub client not configured');
      return [];
    }

    try {
      const response = await this.alarmClient.get('/api/sensors');
      const sensors = response.data.filter((s: any) => s.type === 'leak');

      return sensors.map((sensor: any) => ({
        id: sensor.id,
        name: sensor.name,
        property_id: sensor.metadata?.property_id || '',
        building_id: sensor.metadata?.building_id,
        unit_id: sensor.metadata?.unit_id,
        location: sensor.location || '',
        battery_level: sensor.batteryLevel || 0,
        is_leak_detected: sensor.isLeakDetected || false,
        last_seen: sensor.lastSeen || new Date().toISOString(),
      }));
    } catch (error) {
      logger.error('Failed to get leak sensors', { error });
      return [];
    }
  }

  /**
   * Get motion events from Protect
   */
  async getMotionEvents(since: Date, limit: number = 100): Promise<UniFiMotionEvent[]> {
    try {
      const response = await this.protectClient.get('/proxy/protect/api/events', {
        params: {
          start: since.getTime(),
          type: 'motion,smartDetectZone',
          limit,
        },
      });

      return response.data.map((event: any) => ({
        id: event.id,
        camera_id: event.camera,
        camera_name: event.cameraName || 'Unknown Camera',
        timestamp: new Date(event.start).toISOString(),
        type: event.smartDetectTypes?.[0] || 'motion',
        score: event.score || 0,
        thumbnail_url: event.thumbnailId ? `/proxy/protect/api/events/${event.id}/thumbnail` : undefined,
        property_id: event.metadata?.property_id || '',
        building_id: event.metadata?.building_id,
        unit_id: event.metadata?.unit_id,
      }));
    } catch (error) {
      logger.error('Failed to get motion events', { error });
      return [];
    }
  }

  /**
   * Get cameras
   */
  async getCameras(): Promise<any[]> {
    try {
      const response = await this.protectClient.get('/proxy/protect/api/cameras');
      return response.data;
    } catch (error) {
      logger.error('Failed to get cameras', { error });
      return [];
    }
  }

  /**
   * Connect to real-time WebSocket updates
   */
  connectWebSocket(onEvent: (event: any) => void): void {
    if (!this.authToken) {
      logger.error('Not authenticated, cannot connect WebSocket');
      return;
    }

    const wsUrl = this.config.protectUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    this.wsConnection = new WebSocket(`${wsUrl}/proxy/protect/ws/updates`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
      rejectUnauthorized: false,
    });

    this.wsConnection.on('open', () => {
      logger.info('WebSocket connected to UniFi Protect');
    });

    this.wsConnection.on('message', (data: WebSocket.Data) => {
      try {
        const event = JSON.parse(data.toString());
        onEvent(event);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', { error });
      }
    });

    this.wsConnection.on('error', (error) => {
      logger.error('WebSocket error', { error });
    });

    this.wsConnection.on('close', () => {
      logger.info('WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(onEvent), 5000);
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = undefined;
    }
  }

  /**
   * Correlate leak sensor event with water usage data
   */
  async correlateLeakWithWaterUsage(
    leakSensorId: string,
    waterUsageData: { timestamp: string; flow_rate: number }[]
  ): Promise<{
    leak_confirmed: boolean;
    correlation_score: number;
    estimated_gallons_lost: number;
  }> {
    // Find spike in water usage around leak detection time
    const sensor = (await this.getLeakSensors()).find(s => s.id === leakSensorId);
    if (!sensor || !sensor.is_leak_detected) {
      return {
        leak_confirmed: false,
        correlation_score: 0,
        estimated_gallons_lost: 0,
      };
    }

    const leakTime = new Date(sensor.last_seen);
    const relevantUsage = waterUsageData.filter(reading => {
      const readingTime = new Date(reading.timestamp);
      const timeDiff = Math.abs(readingTime.getTime() - leakTime.getTime());
      return timeDiff < 3600000; // Within 1 hour
    });

    const avgFlowRate = relevantUsage.reduce((sum, r) => sum + r.flow_rate, 0) / relevantUsage.length;
    const maxFlowRate = Math.max(...relevantUsage.map(r => r.flow_rate));

    // High correlation if flow rate is elevated
    const correlationScore = avgFlowRate > 0.5 ? 0.9 : 0.3;
    const estimatedGallonsLost = avgFlowRate * 60; // GPM * 60 minutes

    return {
      leak_confirmed: correlationScore > 0.7,
      correlation_score: correlationScore,
      estimated_gallons_lost: estimatedGallonsLost,
    };
  }
}
