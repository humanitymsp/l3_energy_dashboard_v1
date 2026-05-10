import axios, { AxiosInstance } from 'axios';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'leviton-integration' });

/**
 * Leviton Decora Smart Wi-Fi integration via My Leviton cloud API.
 *
 * Supported devices:
 *  - DW6HD  (Decora Smart Wi-Fi 600W Dimmer)
 *  - DW15S  (Decora Smart Wi-Fi 15A Switch)
 *  - D26HD  (Decora Smart Wi-Fi 2nd Gen Dimmer)
 *  - D215S  (Decora Smart Wi-Fi 2nd Gen Switch)
 *  - DWVAA  (Decora Smart Wi-Fi Voice Dimmer with Alexa)
 *
 * The My Leviton cloud API authenticates via email/password → JWT,
 * then exposes residential accounts → residences → rooms → switches.
 * Energy monitoring is available on 2nd-gen models (D2xxx series).
 */

export interface LevitonConfig {
  email: string;
  password: string;
  apiUrl?: string; // defaults to My Leviton cloud
}

export interface LevitonDevice {
  id: string;
  name: string;
  model: string;
  serial: string;
  residenceId: string;
  roomId?: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  location: string;
  device_type: 'dimmer' | 'switch' | 'outlet';
  is_on: boolean;
  brightness?: number; // 0-100, dimmers only
  power?: number; // Watts, 2nd-gen only
  energy?: number; // kWh cumulative, 2nd-gen only
  status: 'online' | 'offline';
  last_seen: string;
}

export interface LevitonReading {
  device_id: string;
  timestamp: string;
  is_on: boolean;
  brightness?: number;
  power: number; // Watts
  energy: number; // kWh cumulative
}

export class LevitonClient {
  private client: AxiosInstance;
  private authToken?: string;
  private userId?: string;
  private accountId?: string;

  constructor(private config: LevitonConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl || 'https://my.leviton.com/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate with My Leviton cloud API
   */
  async authenticate(): Promise<void> {
    try {
      const response = await this.client.post('/Person/login', {
        email: this.config.email,
        password: this.config.password,
      });

      this.authToken = response.data.id; // JWT token
      this.userId = response.data.userId;
      this.client.defaults.headers.common['Authorization'] = this.authToken;

      // Get the residential account
      const accountsRes = await this.client.get(
        `/Person/${this.userId}/residentialPermissions`
      );
      if (accountsRes.data.length > 0) {
        this.accountId = accountsRes.data[0].residentialAccountId;
      }

      logger.info('Leviton authenticated successfully', { userId: this.userId });
    } catch (error) {
      logger.error('Leviton authentication failed', { error });
      throw error;
    }
  }

  /**
   * Get all residences under the account
   */
  async getResidences(): Promise<any[]> {
    if (!this.accountId) {
      logger.warn('No account ID, call authenticate() first');
      return [];
    }

    try {
      const response = await this.client.get(
        `/ResidentialAccounts/${this.accountId}/residences`
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to get residences', { error });
      return [];
    }
  }

  /**
   * Get all switches/dimmers in a residence
   */
  async getDevices(residenceId: string): Promise<any[]> {
    try {
      const response = await this.client.get(
        `/Residences/${residenceId}/iotswitches`
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to get devices', { error, residenceId });
      return [];
    }
  }

  /**
   * Get a single switch status
   */
  async getDeviceStatus(deviceId: string): Promise<LevitonReading | null> {
    try {
      const response = await this.client.get(`/IotSwitches/${deviceId}`);
      const d = response.data;

      return {
        device_id: deviceId,
        timestamp: new Date().toISOString(),
        is_on: d.power > 0,
        brightness: d.brightness,
        power: d.power || 0,
        energy: d.energy || 0,
      };
    } catch (error) {
      logger.error('Failed to get device status', { error, deviceId });
      return null;
    }
  }

  /**
   * Get energy usage history for a device (2nd-gen models only)
   */
  async getEnergyHistory(
    deviceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<LevitonReading[]> {
    try {
      const response = await this.client.get(
        `/IotSwitches/${deviceId}/energyLogs`,
        {
          params: {
            where: JSON.stringify({
              and: [
                { timestamp: { gte: startTime.toISOString() } },
                { timestamp: { lte: endTime.toISOString() } },
              ],
            }),
          },
        }
      );

      return response.data.map((entry: any) => ({
        device_id: deviceId,
        timestamp: entry.timestamp,
        is_on: entry.power > 0,
        brightness: entry.brightness,
        power: entry.power || 0,
        energy: entry.energy || 0,
      }));
    } catch (error) {
      logger.error('Failed to get energy history', { error, deviceId });
      return [];
    }
  }

  /**
   * Poll all devices across all residences and return readings
   */
  async pollAllDevices(): Promise<LevitonReading[]> {
    const readings: LevitonReading[] = [];
    const residences = await this.getResidences();

    for (const residence of residences) {
      const devices = await this.getDevices(residence.id);
      for (const device of devices) {
        const reading = await this.getDeviceStatus(device.id);
        if (reading) {
          readings.push(reading);
        }
      }
    }

    return readings;
  }

  /**
   * Disconnect / logout
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.post('/Person/logout');
      this.authToken = undefined;
      this.userId = undefined;
      this.accountId = undefined;
      logger.info('Leviton logged out');
    } catch (error) {
      logger.error('Leviton logout failed', { error });
    }
  }
}
