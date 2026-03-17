import axios, { AxiosInstance } from 'axios';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'shelly-integration' });

export interface ShellyDevice {
  id: string;
  type: 'shelly_em' | 'shelly_pro_3em' | 'shelly_plus_1pm';
  name: string;
  host: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  location: string;
}

export interface ShellyEMReading {
  device_id: string;
  timestamp: string;
  power: number; // Watts
  voltage: number; // Volts
  current: number; // Amps
  power_factor: number;
  total_kwh: number;
  total_kwh_returned?: number;
}

export interface ShellyPro3EMReading {
  device_id: string;
  timestamp: string;
  total_power: number; // kW
  phase_a: {
    voltage: number;
    current: number;
    power: number;
    power_factor: number;
  };
  phase_b: {
    voltage: number;
    current: number;
    power: number;
    power_factor: number;
  };
  phase_c: {
    voltage: number;
    current: number;
    power: number;
    power_factor: number;
  };
  total_kwh: number;
}

export class ShellyClient {
  private devices: Map<string, ShellyDevice> = new Map();

  constructor(devices: ShellyDevice[]) {
    devices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  /**
   * Get current status from a Shelly EM device
   */
  async getShellyEMStatus(deviceId: string): Promise<ShellyEMReading | null> {
    const device = this.devices.get(deviceId);
    if (!device || device.type !== 'shelly_em') {
      logger.error('Device not found or wrong type', { deviceId });
      return null;
    }

    try {
      // Shelly Gen2 API endpoint
      const response = await axios.get(`http://${device.host}/rpc/EM.GetStatus?id=0`, {
        timeout: 5000,
      });

      const data = response.data;
      
      return {
        device_id: deviceId,
        timestamp: new Date().toISOString(),
        power: data.act_power || 0,
        voltage: data.voltage || 0,
        current: data.current || 0,
        power_factor: data.pf || 0,
        total_kwh: (data.total || 0) / 1000, // Convert Wh to kWh
        total_kwh_returned: data.total_ret ? data.total_ret / 1000 : undefined,
      };
    } catch (error) {
      logger.error('Failed to get Shelly EM status', { deviceId, error });
      return null;
    }
  }

  /**
   * Get current status from a Shelly Pro 3EM device
   */
  async getShellyPro3EMStatus(deviceId: string): Promise<ShellyPro3EMReading | null> {
    const device = this.devices.get(deviceId);
    if (!device || device.type !== 'shelly_pro_3em') {
      logger.error('Device not found or wrong type', { deviceId });
      return null;
    }

    try {
      // Shelly Pro 3EM API endpoint
      const response = await axios.get(`http://${device.host}/rpc/EM.GetStatus?id=0`, {
        timeout: 5000,
      });

      const data = response.data;
      
      return {
        device_id: deviceId,
        timestamp: new Date().toISOString(),
        total_power: (data.total_act_power || 0) / 1000, // Convert W to kW
        phase_a: {
          voltage: data.a_voltage || 0,
          current: data.a_current || 0,
          power: (data.a_act_power || 0) / 1000,
          power_factor: data.a_pf || 0,
        },
        phase_b: {
          voltage: data.b_voltage || 0,
          current: data.b_current || 0,
          power: (data.b_act_power || 0) / 1000,
          power_factor: data.b_pf || 0,
        },
        phase_c: {
          voltage: data.c_voltage || 0,
          current: data.c_current || 0,
          power: (data.c_act_power || 0) / 1000,
          power_factor: data.c_pf || 0,
        },
        total_kwh: (data.total_act_energy || 0) / 1000, // Convert Wh to kWh
      };
    } catch (error) {
      logger.error('Failed to get Shelly Pro 3EM status', { deviceId, error });
      return null;
    }
  }

  /**
   * Get status for all devices
   */
  async getAllDeviceStatuses(): Promise<Array<ShellyEMReading | ShellyPro3EMReading>> {
    const readings: Array<ShellyEMReading | ShellyPro3EMReading> = [];

    for (const [deviceId, device] of this.devices) {
      try {
        if (device.type === 'shelly_em') {
          const reading = await this.getShellyEMStatus(deviceId);
          if (reading) readings.push(reading);
        } else if (device.type === 'shelly_pro_3em') {
          const reading = await this.getShellyPro3EMStatus(deviceId);
          if (reading) readings.push(reading);
        }
      } catch (error) {
        logger.error('Failed to get device status', { deviceId, error });
      }
    }

    return readings;
  }

  /**
   * Get device info (name, firmware, etc.)
   */
  async getDeviceInfo(deviceId: string): Promise<any> {
    const device = this.devices.get(deviceId);
    if (!device) {
      return null;
    }

    try {
      const response = await axios.get(`http://${device.host}/rpc/Shelly.GetDeviceInfo`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to get device info', { deviceId, error });
      return null;
    }
  }
}
