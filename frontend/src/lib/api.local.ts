// Local development API client using fetch instead of Amplify
const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:4000';

export interface Property {
  id: string;
  name: string;
  address?: string;
  units_count?: number;
  buildings_count?: number;
  active_alerts?: number;
  total_electric_kwh?: number;
  total_water_gallons?: number;
  occupied_units?: number;
  vacant_units?: number;
  monthly_electric_cost?: number;
  monthly_water_cost?: number;
  cost_per_unit_electric?: number;
  cost_per_unit_water?: number;
  leak_alerts_prevented?: number;
  estimated_savings_ytd?: number;
  avg_response_time_hours?: number;
  water_efficiency_score?: number;
  electric_efficiency_score?: number;
  shelly_devices?: number;
  ecodirect_sensors?: number;
  devices_online?: number;
  devices_total?: number;
}

export interface Alert {
  id: string;
  property_id: string;
  property_name?: string;
  building_id?: string;
  building_name?: string;
  unit_id?: string;
  unit_number?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'muted';
  title: string;
  message: string;
  created_at: string;
  sources?: string[];
  estimated_cost?: number;
  device_id?: string;
  device_name?: string;
  gallons_lost?: number;
  kwh_over_baseline?: number;
}

export const api = {
  async getProperties(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/api/properties`);
    return await response.json();
  },

  async getProperty(propertyId: string): Promise<{ property: Property; stats: any }> {
    const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`);
    return await response.json();
  },

  async getBuildings(propertyId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${propertyId}`);
    const data = await response.json();
    return data.buildings || [];
  },

  async getUnits(propertyId: string, buildingId?: string): Promise<any[]> {
    const url = buildingId 
      ? `${API_BASE_URL}/api/units?propertyId=${propertyId}&buildingId=${buildingId}`
      : `${API_BASE_URL}/api/units?propertyId=${propertyId}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.units || [];
  },

  async getUsage(params: any): Promise<any[]> {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/usage?${queryString}`);
    const data = await response.json();
    return data.usage || [];
  },

  async getAnomalies(params: any): Promise<any[]> {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/anomalies?${queryString}`);
    const data = await response.json();
    return data.anomalies || [];
  },

  async getAlerts(params?: any): Promise<Alert[]> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `${API_BASE_URL}/api/alerts?${queryString}` : `${API_BASE_URL}/api/alerts`;
    const response = await fetch(url);
    const data = await response.json();
    return data.alerts || [];
  },

  async updateAlert(alertId: string, updates: any): Promise<Alert> {
    const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.alert;
  },

  // UniFi Integration APIs
  async getUniFiDevices(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/unifi/devices`);
    return await response.json();
  },

  async getCorrelatedEvents(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/unifi/correlated-events`);
    return await response.json();
  },

  async getUniFiDeviceStatus(deviceId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/unifi/devices/${deviceId}`);
    return await response.json();
  },

  async getOccupancyStatus(unitId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/unifi/occupancy/${unitId}`);
    return await response.json();
  },
};
