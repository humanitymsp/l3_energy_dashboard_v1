// Mock data API client - works without backend
const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || '';

import {
  LaundryMachine,
  LaundrySession,
  LaundryRevenue,
  LaundryAlert,
  LaundryAnalytics,
  LaundrySettings
} from './types/laundry';

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
  leviton_devices?: number;
  devices_online?: number;
  devices_total?: number;
  solar_capacity_kw?: number;
  solar_production_today_kwh?: number;
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
        name: 'NBC HQ',
        address: '30 Rockefeller Plaza, New York, NY 10112',
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
        leviton_devices: 24,
        devices_online: 94,
        devices_total: 96,
        solar_capacity_kw: 50,
        solar_production_today_kwh: 185,
      },
      {
        id: 'prop-002',
        name: 'NBC HQ',
        address: '30 Rockefeller Plaza, New York, NY 10112',
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
        leviton_devices: 36,
        devices_online: 140,
        devices_total: 144,
        solar_capacity_kw: 75,
        solar_production_today_kwh: 268,
      },
      {
        id: 'prop-003',
        name: 'NBC HQ',
        address: '30 Rockefeller Plaza, New York, NY 10112',
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
        leviton_devices: 18,
        devices_online: 71,
        devices_total: 72,
        solar_capacity_kw: 30,
        solar_production_today_kwh: 112,
      },
      {
        id: 'prop-004',
        name: 'NBC HQ',
        address: '30 Rockefeller Plaza, New York, NY 10112',
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
        leviton_devices: 27,
        devices_online: 105,
        devices_total: 108,
        solar_capacity_kw: 45,
        solar_production_today_kwh: 162,
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
      efficiency_score: property.water_efficiency_score && property.electric_efficiency_score
        ? Math.round((property.water_efficiency_score + property.electric_efficiency_score) / 2)
        : 85,
      water_efficiency_score: property.water_efficiency_score || 87,
      electric_efficiency_score: property.electric_efficiency_score || 82,
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
    // Generate 30 days of mock usage data
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sum_value: Math.floor(Math.random() * 500) + 300,
        avg_value: Math.floor(Math.random() * 50) + 25,
        metric_type: params.metricType || 'electric_kwh',
      });
    }
    return Promise.resolve(data);
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

  // Laundry Management API Methods
  async getLaundryMachines(propertyId?: string): Promise<LaundryMachine[]> {
    const machines: LaundryMachine[] = [
      {
        id: 'wm-001',
        property_id: 'prop-001',
        building_id: 'bldg-001',
        machine_type: 'washer',
        provider: 'csc_serviceworks',
        brand: 'Speed Queen',
        model: 'SC40',
        serial_number: 'SQ-HC5-001',
        location: 'Building A - Floor 1',
        status: 'online',
        last_maintenance: '2024-03-01',
        next_maintenance: '2024-06-01',
        total_cycles: 15420,
        cycles_today: 23,
        cycles_this_month: 487,
        revenue_today: 115.00,
        revenue_this_month: 2435.00,
        average_cycle_time: 35,
        current_cycle_start: new Date(Date.now() - 15 * 60000).toISOString(),
        error_codes: [],
        efficiency_score: 92,
        water_usage_per_cycle: 45,
        energy_usage_per_cycle: 2.1,
        installation_date: '2022-01-15',
        warranty_expiry: '2025-01-15'
      },
      {
        id: 'dr-001',
        property_id: 'prop-001',
        building_id: 'bldg-001',
        machine_type: 'dryer',
        provider: 'csc_serviceworks',
        brand: 'Speed Queen',
        model: 'ST40',
        serial_number: 'SQ-DC5-001',
        location: 'Building A - Floor 1',
        status: 'online',
        last_maintenance: '2024-03-01',
        next_maintenance: '2024-06-01',
        total_cycles: 16890,
        cycles_today: 21,
        cycles_this_month: 456,
        revenue_today: 84.00,
        revenue_this_month: 1824.00,
        average_cycle_time: 42,
        current_cycle_start: new Date(Date.now() - 8 * 60000).toISOString(),
        error_codes: [],
        efficiency_score: 89,
        energy_usage_per_cycle: 3.2,
        installation_date: '2022-01-15',
        warranty_expiry: '2025-01-15'
      },
      {
        id: 'wm-002',
        property_id: 'prop-001',
        building_id: 'bldg-002',
        machine_type: 'washer',
        provider: 'csc_serviceworks',
        brand: 'Speed Queen',
        model: 'SC60',
        serial_number: 'SQ-SC60-002',
        location: 'Building B - Floor 2',
        status: 'maintenance',
        last_maintenance: '2024-04-15',
        next_maintenance: '2024-07-15',
        total_cycles: 12340,
        cycles_today: 0,
        cycles_this_month: 234,
        revenue_today: 0,
        revenue_this_month: 1170.00,
        average_cycle_time: 38,
        error_codes: ['E02', 'E05'],
        efficiency_score: 76,
        water_usage_per_cycle: 48,
        energy_usage_per_cycle: 2.3,
        installation_date: '2022-03-20',
        warranty_expiry: '2025-03-20'
      },
      {
        id: 'dr-002',
        property_id: 'prop-002',
        building_id: 'bldg-003',
        machine_type: 'dryer',
        provider: 'csc_serviceworks',
        brand: 'Speed Queen',
        model: 'ST60',
        serial_number: 'SQ-ST60-002',
        location: 'Building C - Floor 1',
        status: 'offline',
        last_maintenance: '2024-02-15',
        next_maintenance: '2024-05-15',
        total_cycles: 9870,
        cycles_today: 0,
        cycles_this_month: 156,
        revenue_today: 0,
        revenue_this_month: 624.00,
        average_cycle_time: 45,
        error_codes: ['POWER_FAILURE'],
        efficiency_score: 45,
        energy_usage_per_cycle: 3.5,
        installation_date: '2022-06-10',
        warranty_expiry: '2025-06-10'
      }
    ];

    if (propertyId) {
      return Promise.resolve(machines.filter(m => m.property_id === propertyId));
    }
    return Promise.resolve(machines);
  },

  async getLaundrySessions(propertyId?: string, limit?: number): Promise<LaundrySession[]> {
    const sessions: LaundrySession[] = [
      {
        id: 'session-001',
        machine_id: 'wm-001',
        property_id: 'prop-001',
        user_id: 'user-123',
        unit_number: '204',
        start_time: new Date(Date.now() - 15 * 60000).toISOString(),
        cycle_type: 'normal',
        cost: 5.00,
        payment_method: 'csc_go',
        status: 'active',
        machine_type: 'washer',
        revenue: 5.00,
        water_usage: 45,
        energy_usage: 2.1
      },
      {
        id: 'session-002',
        machine_id: 'dr-001',
        property_id: 'prop-001',
        user_id: 'user-456',
        unit_number: '312',
        start_time: new Date(Date.now() - 8 * 60000).toISOString(),
        cycle_type: 'normal',
        cost: 4.00,
        payment_method: 'csc_go',
        status: 'active',
        machine_type: 'dryer',
        revenue: 4.00,
        energy_usage: 3.2
      },
      {
        id: 'session-003',
        machine_id: 'wm-002',
        property_id: 'prop-001',
        user_id: 'user-789',
        unit_number: '156',
        start_time: new Date(Date.now() - 2 * 3600000).toISOString(),
        end_time: new Date(Date.now() - 2 * 3600000 + 35 * 60000).toISOString(),
        duration: 35,
        cycle_type: 'heavy',
        cost: 7.00,
        payment_method: 'card',
        status: 'completed',
        machine_type: 'washer',
        revenue: 7.00,
        water_usage: 52,
        energy_usage: 2.8
      }
    ];

    let filteredSessions = propertyId ? sessions.filter(s => s.property_id === propertyId) : sessions;
    if (limit) {
      filteredSessions = filteredSessions.slice(0, limit);
    }
    return Promise.resolve(filteredSessions);
  },

  async getLaundryRevenue(propertyId?: string, period?: string): Promise<LaundryRevenue[]> {
    // Generate 30 days of mock revenue data for both properties
    const revenue: LaundryRevenue[] = [];
    const properties = ['prop-001', 'prop-002'];
    const baseRevenues = { 'prop-001': 185, 'prop-002': 145 };
    const baseSessions = { 'prop-001': 42, 'prop-002': 32 };

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      // Weekend boost
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.25 : 1.0;
      // Random variance
      const variance = 0.8 + Math.sin(dayOffset * 0.7) * 0.3;

      for (const propId of properties) {
        const base = baseRevenues[propId as keyof typeof baseRevenues];
        const baseSess = baseSessions[propId as keyof typeof baseSessions];
        const totalRev = +(base * weekendMultiplier * variance).toFixed(2);
        const sessions = Math.round(baseSess * weekendMultiplier * variance);
        const cardPct = 0.45, cscGoPct = 0.35, coinPct = 0.20;

        revenue.push({
          id: `rev-${propId}-${dayOffset}`,
          property_id: propId,
          date: dateStr,
          total_revenue: totalRev,
          washer_revenue: +(totalRev * 0.58).toFixed(2),
          dryer_revenue: +(totalRev * 0.42).toFixed(2),
          total_sessions: sessions,
          washer_sessions: Math.round(sessions * 0.55),
          dryer_sessions: Math.round(sessions * 0.45),
          peak_hour: dayOfWeek >= 5 ? 14 : 19,
          average_session_duration: 35 + Math.random() * 10,
          payment_breakdown: {
            card: +(totalRev * cardPct).toFixed(2),
            csc_go: +(totalRev * cscGoPct).toFixed(2),
            coin: +(totalRev * coinPct).toFixed(2),
          }
        });
      }
    }

    const filtered = propertyId ? revenue.filter(r => r.property_id === propertyId) : revenue;
    return Promise.resolve(filtered);
  },

  async getLaundryAlerts(propertyId?: string): Promise<LaundryAlert[]> {
    const alerts: LaundryAlert[] = [
      {
        id: 'alert-laundry-001',
        property_id: 'prop-001',
        machine_id: 'wm-002',
        type: 'maintenance_due',
        severity: 'medium',
        title: 'Maintenance Required',
        message: 'Washer WM-002 requires maintenance - Error codes E02, E05 detected',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        resolved: false,
        machine_type: 'washer',
        machine_location: 'Building B - Floor 2'
      },
      {
        id: 'alert-laundry-002',
        property_id: 'prop-002',
        machine_id: 'dr-002',
        type: 'offline',
        severity: 'high',
        title: 'Machine Offline',
        message: 'Dryer DR-002 is offline - Power failure detected',
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        resolved: false,
        machine_type: 'dryer',
        machine_location: 'Building C - Floor 1'
      },
      {
        id: 'alert-laundry-003',
        property_id: 'prop-001',
        type: 'revenue_drop',
        severity: 'low',
        title: 'Revenue Drop Detected',
        message: 'Daily revenue down 15% compared to weekly average',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        resolved: false
      }
    ];

    return Promise.resolve(propertyId ? alerts.filter(a => a.property_id === propertyId) : alerts);
  },

  async getLaundryAnalytics(propertyId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<LaundryAnalytics> {
    const analytics: LaundryAnalytics = {
      property_id: propertyId,
      period: period,
      total_revenue: period === 'daily' ? 199.00 : period === 'weekly' ? 1393.00 : 5572.00,
      revenue_growth: 12.5,
      total_sessions: period === 'daily' ? 44 : period === 'weekly' ? 308 : 1232,
      session_growth: 8.3,
      average_revenue_per_session: 4.52,
      peak_usage_hours: [18, 19, 20],
      machine_utilization: 78.5,
      maintenance_costs: period === 'daily' ? 0 : period === 'weekly' ? 150 : 600,
      profit_margin: 68.2,
      top_performing_machines: [
        { machine_id: 'wm-001', revenue: 115.00, sessions: 23 },
        { machine_id: 'dr-001', revenue: 84.00, sessions: 21 }
      ],
      revenue_forecast: [
        { period: 'Next Week', predicted_revenue: 1450.00, confidence: 0.85 },
        { period: 'Next Month', predicted_revenue: 5800.00, confidence: 0.78 }
      ]
    };

    return Promise.resolve(analytics);
  },

  async getLaundrySettings(propertyId: string): Promise<LaundrySettings> {
    const settings: LaundrySettings = {
      property_id: propertyId,
      washer_cost: {
        quick: 3.00,
        normal: 5.00,
        heavy: 7.00,
        delicate: 4.00
      },
      dryer_cost: {
        quick: 2.50,
        normal: 4.00,
        heavy: 6.00,
        delicate: 3.00
      },
      operating_hours: {
        open: '06:00',
        close: '22:00'
      },
      maintenance_reminder_days: 90,
      revenue_alert_threshold: 15,
      auto_maintenance_scheduling: true,
      payment_methods: ['card', 'csc_go', 'coin']
    };

    return Promise.resolve(settings);
  },

  async updateLaundrySettings(propertyId: string, settings: Partial<LaundrySettings>): Promise<LaundrySettings> {
    // In a real implementation, this would update the database
    const currentSettings = await this.getLaundrySettings(propertyId);
    const updatedSettings = { ...currentSettings, ...settings };
    return Promise.resolve(updatedSettings);
  },

  async getUniFiDeviceStatus(deviceId: string): Promise<any> {
    return Promise.resolve({});
  },

  async getOccupancyStatus(unitId: string): Promise<any> {
    return Promise.resolve({});
  },
};
