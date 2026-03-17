import axios, { AxiosInstance } from 'axios';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'ecodirect-integration' });

export interface EcodirectDevice {
  id: string;
  serial_number: string;
  name: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  location: string;
  device_type: 'water_meter' | 'water_sensor';
}

export interface EcodirectReading {
  device_id: string;
  timestamp: string;
  flow_rate: number; // GPM (gallons per minute)
  total_volume: number; // Gallons
  pressure: number; // PSI
  temperature: number; // Fahrenheit
  battery_level?: number; // Percentage
  signal_strength?: number; // dBm
  leak_detected: boolean;
  alerts: string[];
}

export class EcodirectClient {
  private client: AxiosInstance;
  private devices: Map<string, EcodirectDevice> = new Map();
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string, devices: EcodirectDevice[]) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    devices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  /**
   * Get current reading from an Ecodirect water sensor
   */
  async getDeviceReading(deviceId: string): Promise<EcodirectReading | null> {
    const device = this.devices.get(deviceId);
    if (!device) {
      logger.error('Device not found', { deviceId });
      return null;
    }

    try {
      // Ecodirect API endpoint for real-time data
      const response = await this.client.get(`/api/v1/devices/${device.serial_number}/current`);
      const data = response.data;

      // Check for leak conditions
      const leakDetected = this.detectLeak(data);
      const alerts = this.generateAlerts(data, leakDetected);

      return {
        device_id: deviceId,
        timestamp: data.timestamp || new Date().toISOString(),
        flow_rate: data.flow_rate || 0, // GPM
        total_volume: data.total_volume || 0, // Gallons
        pressure: data.pressure || 0, // PSI
        temperature: data.temperature || 0, // F
        battery_level: data.battery_level,
        signal_strength: data.signal_strength,
        leak_detected: leakDetected,
        alerts,
      };
    } catch (error) {
      logger.error('Failed to get Ecodirect reading', { deviceId, error });
      return null;
    }
  }

  /**
   * Get historical data for a device
   */
  async getHistoricalData(
    deviceId: string,
    startTime: Date,
    endTime: Date,
    interval: '1min' | '5min' | '15min' | '1hour' | '1day' = '15min'
  ): Promise<EcodirectReading[]> {
    const device = this.devices.get(deviceId);
    if (!device) {
      logger.error('Device not found', { deviceId });
      return [];
    }

    try {
      const response = await this.client.get(`/api/v1/devices/${device.serial_number}/history`, {
        params: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          interval,
        },
      });

      return response.data.readings.map((reading: any) => ({
        device_id: deviceId,
        timestamp: reading.timestamp,
        flow_rate: reading.flow_rate || 0,
        total_volume: reading.total_volume || 0,
        pressure: reading.pressure || 0,
        temperature: reading.temperature || 0,
        battery_level: reading.battery_level,
        signal_strength: reading.signal_strength,
        leak_detected: this.detectLeak(reading),
        alerts: this.generateAlerts(reading, this.detectLeak(reading)),
      }));
    } catch (error) {
      logger.error('Failed to get historical data', { deviceId, error });
      return [];
    }
  }

  /**
   * Get all device readings
   */
  async getAllDeviceReadings(): Promise<EcodirectReading[]> {
    const readings: EcodirectReading[] = [];

    for (const [deviceId] of this.devices) {
      const reading = await this.getDeviceReading(deviceId);
      if (reading) {
        readings.push(reading);
      }
    }

    return readings;
  }

  /**
   * Detect leak conditions
   */
  private detectLeak(data: any): boolean {
    // Leak detection logic
    const flowRate = data.flow_rate || 0;
    const pressure = data.pressure || 0;
    
    // Continuous low flow (possible leak)
    if (flowRate > 0 && flowRate < 0.5) {
      return true;
    }

    // Sudden pressure drop
    if (pressure < 30) {
      return true;
    }

    // Check if device has leak flag
    if (data.leak_alarm === true) {
      return true;
    }

    return false;
  }

  /**
   * Generate alerts based on sensor data
   */
  private generateAlerts(data: any, leakDetected: boolean): string[] {
    const alerts: string[] = [];

    if (leakDetected) {
      alerts.push('Leak detected');
    }

    if (data.flow_rate > 0 && data.flow_rate < 0.5) {
      alerts.push('Continuous low flow detected');
    }

    if (data.flow_rate > 15) {
      alerts.push('High flow rate detected');
    }

    if (data.pressure < 30) {
      alerts.push('Low pressure');
    }

    if (data.pressure > 80) {
      alerts.push('High pressure');
    }

    if (data.battery_level && data.battery_level < 20) {
      alerts.push('Low battery');
    }

    if (data.temperature < 35) {
      alerts.push('Freeze risk');
    }

    return alerts;
  }

  /**
   * Set device configuration
   */
  async setDeviceConfig(deviceId: string, config: any): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      return false;
    }

    try {
      await this.client.put(`/api/v1/devices/${device.serial_number}/config`, config);
      return true;
    } catch (error) {
      logger.error('Failed to set device config', { deviceId, error });
      return false;
    }
  }
}
