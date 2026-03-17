import { get, post, put } from 'aws-amplify/api';

const API_NAME = 'EnergyDashboardAPI';

export interface Property {
  id: string;
  external_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  building_count?: number;
  unit_count?: number;
}

export interface Building {
  id: string;
  property_id: string;
  external_id: string;
  name: string;
  floor_count?: number;
  unit_count?: number;
}

export interface Unit {
  id: string;
  building_id: string;
  property_id: string;
  external_id: string;
  unit_number: string;
  floor?: number;
  square_feet?: number;
  occupied?: boolean;
  tenant_name?: string;
}

export interface Alert {
  id: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'muted';
  title: string;
  message: string;
  created_at: string;
  property_name?: string;
  building_name?: string;
  unit_number?: string;
}

export interface Anomaly {
  id: string;
  timestamp: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric_type: string;
  actual_value?: number;
  expected_value?: number;
  deviation_percent?: number;
  description?: string;
  resolved: boolean;
}

export interface UsageData {
  hour_start?: string;
  date?: string;
  metric_type: string;
  sum_value: number;
  avg_value: number;
  min_value: number;
  max_value: number;
  peak_hour?: number;
}

export const api = {
  async getProperties(): Promise<Property[]> {
    const response = await get({
      apiName: API_NAME,
      path: '/properties',
    }).response;
    const data = await response.body.json() as any;
    return data.properties;
  },

  async getProperty(propertyId: string): Promise<{ property: Property; stats: any }> {
    const response = await get({
      apiName: API_NAME,
      path: `/properties/${propertyId}`,
    }).response;
    return await response.body.json() as any;
  },

  async getBuildings(propertyId: string): Promise<Building[]> {
    const response = await get({
      apiName: API_NAME,
      path: `/properties/${propertyId}/buildings`,
    }).response;
    const data = await response.body.json() as any;
    return data.buildings;
  },

  async getUnits(propertyId: string, buildingId?: string): Promise<Unit[]> {
    const queryParams: Record<string, string> | undefined = buildingId ? { buildingId } : undefined;
    const response = await get({
      apiName: API_NAME,
      path: `/properties/${propertyId}/units`,
      options: queryParams ? { queryParams } : {},
    }).response;
    const data = await response.body.json() as any;
    return data.units;
  },

  async getUsage(params: {
    propertyId: string;
    buildingId?: string;
    unitId?: string;
    metricType?: string;
    startDate?: string;
    endDate?: string;
    granularity?: 'hourly' | 'daily';
  }): Promise<UsageData[]> {
    const response = await get({
      apiName: API_NAME,
      path: '/usage',
      options: { queryParams: params as any },
    }).response;
    const data = await response.body.json() as any;
    return data.usage;
  },

  async getAnomalies(params: {
    propertyId?: string;
    buildingId?: string;
    unitId?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
  }): Promise<Anomaly[]> {
    const response = await get({
      apiName: API_NAME,
      path: '/anomalies',
      options: { queryParams: params as any },
    }).response;
    const data = await response.body.json() as any;
    return data.anomalies;
  },

  async getAlerts(params: {
    propertyId?: string;
    status?: string;
    severity?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const response = await get({
      apiName: API_NAME,
      path: '/alerts',
      options: { queryParams: params as any },
    }).response;
    const data = await response.body.json() as any;
    return data.alerts;
  },

  async updateAlert(alertId: string, updates: { status?: string; acknowledged_by?: string; resolved_by?: string }): Promise<Alert> {
    const response = await put({
      apiName: API_NAME,
      path: `/alerts/${alertId}`,
      options: { body: updates },
    }).response;
    const data = await response.body.json() as any;
    return data.alert;
  },
};
