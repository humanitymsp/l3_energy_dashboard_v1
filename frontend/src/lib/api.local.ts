// Mock data API client - works without backend
const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || '';

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
    // Return mock data directly without backend
    return Promise.resolve([
      {
        id: 'prop-001',
        name: 'Sunset Apartments',
        address: '123 Sunset Blvd, Los Angeles, CA 90028',
        units_count: 48,
        buildings_count: 2,
        active_alerts: 3,
        total_electric_kwh: 12450,
        total_water_gallons: 285000,
        occupied_units: 45,
        vacant_units: 3,
        monthly_electric_cost: 3245,
        monthly_water_cost: 1850,
        cost_per_unit_electric: 72.11,
        cost_per_unit_water: 41.11,
        leak_alerts_prevented: 12,
        estimated_savings_ytd: 8500,
        avg_response_time_hours: 2.5,
        water_efficiency_score: 87,
        electric_efficiency_score: 82,
        shelly_devices: 48,
        ecodirect_sensors: 48,
        devices_online: 94,
        devices_total: 96,
      },
      {
        id: 'prop-002',
        name: 'Riverside Complex',
        address: '456 River Rd, Portland, OR 97201',
        units_count: 72,
        buildings_count: 3,
        active_alerts: 5,
        total_electric_kwh: 18200,
        total_water_gallons: 425000,
        occupied_units: 68,
        vacant_units: 4,
        monthly_electric_cost: 4850,
        monthly_water_cost: 2750,
        cost_per_unit_electric: 71.32,
        cost_per_unit_water: 40.44,
        leak_alerts_prevented: 18,
        estimated_savings_ytd: 12300,
        avg_response_time_hours: 3.2,
        water_efficiency_score: 85,
        electric_efficiency_score: 79,
        shelly_devices: 72,
        ecodirect_sensors: 72,
        devices_online: 140,
        devices_total: 144,
      },
      {
        id: 'prop-003',
        name: 'Downtown Lofts',
        address: '789 Main St, Seattle, WA 98101',
        units_count: 36,
        buildings_count: 1,
        active_alerts: 1,
        total_electric_kwh: 9800,
        total_water_gallons: 195000,
        occupied_units: 35,
        vacant_units: 1,
        monthly_electric_cost: 2650,
        monthly_water_cost: 1250,
        cost_per_unit_electric: 75.71,
        cost_per_unit_water: 35.71,
        leak_alerts_prevented: 8,
        estimated_savings_ytd: 5200,
        avg_response_time_hours: 1.8,
        water_efficiency_score: 92,
        electric_efficiency_score: 88,
        shelly_devices: 36,
        ecodirect_sensors: 36,
        devices_online: 71,
        devices_total: 72,
      },
      {
        id: 'prop-004',
        name: 'Parkside Residences',
        address: '321 Park Ave, San Francisco, CA 94102',
        units_count: 54,
        buildings_count: 2,
        active_alerts: 2,
        total_electric_kwh: 14500,
        total_water_gallons: 320000,
        occupied_units: 52,
        vacant_units: 2,
        monthly_electric_cost: 3950,
        monthly_water_cost: 2100,
        cost_per_unit_electric: 75.96,
        cost_per_unit_water: 40.38,
        leak_alerts_prevented: 15,
        estimated_savings_ytd: 9800,
        avg_response_time_hours: 2.1,
        water_efficiency_score: 89,
        electric_efficiency_score: 84,
        shelly_devices: 54,
        ecodirect_sensors: 54,
        devices_online: 105,
        devices_total: 108,
      },
    ]);
  },

  async getProperty(propertyId: string): Promise<{ property: Property; stats: any }> {
    const properties = await this.getProperties();
    const property = properties.find(p => p.id === propertyId);
    if (!property) throw new Error('Property not found');
    
    const stats = {
      total_units: property.units_count || 0,
      occupied_units: property.occupied_units || 0,
      vacant_units: property.vacant_units || 0,
      occupancy_rate: property.occupied_units && property.units_count 
        ? ((property.occupied_units / property.units_count) * 100).toFixed(1)
        : 0,
      total_electric_kwh: property.total_electric_kwh || 0,
      total_water_gallons: property.total_water_gallons || 0,
      month_over_month_electric: 5.2,
      month_over_month_water: -2.1,
      active_alerts: property.active_alerts || 0,
      monthly_electric_cost: property.monthly_electric_cost || 0,
      monthly_water_cost: property.monthly_water_cost || 0,
    };
    
    return Promise.resolve({ property, stats });
  },

  async getBuildings(propertyId: string): Promise<any[]> {
    const buildings = [
      { id: 'bldg-001', name: 'Building A', property_id: 'prop-001', units: 24 },
      { id: 'bldg-002', name: 'Building B', property_id: 'prop-001', units: 24 },
      { id: 'bldg-003', name: 'Building A', property_id: 'prop-002', units: 36 },
    ];
    return Promise.resolve(buildings.filter(b => b.property_id === propertyId));
  },

  async getUnits(propertyId?: string, buildingId?: string): Promise<any[]> {
    const allUnits = [
      { id: 'unit-101', number: '101', property_id: 'prop-001', building_id: 'bldg-001', status: 'occupied' },
      { id: 'unit-102', number: '102', property_id: 'prop-001', building_id: 'bldg-001', status: 'occupied' },
      { id: 'unit-204', number: '204', property_id: 'prop-001', building_id: 'bldg-001', status: 'occupied' },
      { id: 'unit-312', number: '312', property_id: 'prop-002', building_id: 'bldg-003', status: 'occupied' },
      { id: 'unit-108', number: '108', property_id: 'prop-003', building_id: 'bldg-005', status: 'occupied' },
    ];
    
    let filtered = allUnits;
    if (propertyId) filtered = filtered.filter(u => u.property_id === propertyId);
    if (buildingId) filtered = filtered.filter(u => u.building_id === buildingId);
    
    return Promise.resolve(filtered);
  },

  async getUsage(params: any): Promise<any[]> {
    return Promise.resolve([]);
  },

  async getAnomalies(params: any): Promise<any[]> {
    return Promise.resolve([]);
  },

  async getAlerts(params?: any): Promise<Alert[]> {
    return Promise.resolve([
      {
        id: 'alert-001',
        type: 'leak',
        severity: 'high',
        title: 'Potential Water Leak Detected',
        message: 'Unusual water flow detected in Unit 204',
        property_id: 'prop-001',
        property_name: 'Sunset Apartments',
        building_id: 'bldg-001',
        building_name: 'Building A',
        unit_id: 'unit-204',
        unit_number: '204',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'active',
      },
      {
        id: 'alert-002',
        type: 'power',
        severity: 'medium',
        title: 'High Power Usage',
        message: 'Electric consumption 25% above average',
        property_id: 'prop-002',
        property_name: 'Riverside Complex',
        building_id: 'bldg-003',
        building_name: 'Building A',
        unit_id: 'unit-312',
        unit_number: '312',
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        status: 'active',
      },
    ]);
  },

  async updateAlert(alertId: string, updates: any): Promise<Alert> {
    const alerts = await this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    return Promise.resolve({ ...alert, ...updates });
  },

  // UniFi Integration APIs
  async getUniFiDevices(): Promise<any[]> {
    return Promise.resolve([]);
  },

  async getCorrelatedEvents(): Promise<any[]> {
    return Promise.resolve([]);
  },

  async getUniFiDeviceStatus(deviceId: string): Promise<any> {
    return Promise.resolve({});
  },

  async getOccupancyStatus(unitId: string): Promise<any> {
    return Promise.resolve({});
  },
};
