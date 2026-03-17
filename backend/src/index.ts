import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Logger } from '@aws-lambda-powertools/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

const logger = new Logger({ serviceName: 'local-dev-server' });
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Energy Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      properties: '/api/properties',
      buildings: '/api/buildings/:propertyId',
      units: '/api/units/:buildingId',
      usage: '/api/usage',
      anomalies: '/api/anomalies',
      alerts: '/api/alerts',
      unifi: '/api/unifi',
    },
    documentation: 'See README.md for full API documentation',
  });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock data
const mockProperties = [
  {
    id: 'prop-001',
    name: 'Sunset Apartments',
    address: '123 NW 23rd Ave, Portland, OR 97210',
    units_count: 48,
    buildings_count: 2,
    active_alerts: 4,
    total_electric_kwh: 12450,
    total_water_gallons: 45600,
    occupied_units: 44,
    vacant_units: 4,
    monthly_electric_cost: 1867.50,
    monthly_water_cost: 684.00,
    cost_per_unit_electric: 42.44,
    cost_per_unit_water: 15.55,
    leak_alerts_prevented: 3,
    estimated_savings_ytd: 4250.00,
    avg_response_time_hours: 2.3,
    water_efficiency_score: 87,
    electric_efficiency_score: 82,
    shelly_devices: 50,
    ecodirect_sensors: 50,
    devices_online: 98,
    devices_total: 100,
  },
  {
    id: 'prop-002',
    name: 'Riverside Complex',
    address: '456 SE Hawthorne Blvd, Portland, OR 97214',
    units_count: 72,
    buildings_count: 3,
    active_alerts: 2,
    total_electric_kwh: 18920,
    total_water_gallons: 68400,
    occupied_units: 68,
    vacant_units: 4,
    monthly_electric_cost: 2838.00,
    monthly_water_cost: 1026.00,
    cost_per_unit_electric: 41.75,
    cost_per_unit_water: 15.09,
    leak_alerts_prevented: 5,
    estimated_savings_ytd: 6890.00,
    avg_response_time_hours: 1.8,
    water_efficiency_score: 91,
    electric_efficiency_score: 85,
    shelly_devices: 75,
    ecodirect_sensors: 75,
    devices_online: 148,
    devices_total: 150,
  },
  {
    id: 'prop-003',
    name: 'Oakwood Terrace',
    address: '789 NE Alberta St, Portland, OR 97211',
    units_count: 36,
    buildings_count: 2,
    active_alerts: 1,
    total_electric_kwh: 9340,
    total_water_gallons: 34200,
    occupied_units: 35,
    vacant_units: 1,
    monthly_electric_cost: 1401.00,
    monthly_water_cost: 513.00,
    cost_per_unit_electric: 40.03,
    cost_per_unit_water: 14.64,
    leak_alerts_prevented: 2,
    estimated_savings_ytd: 2890.00,
    avg_response_time_hours: 1.5,
    water_efficiency_score: 89,
    electric_efficiency_score: 88,
    shelly_devices: 38,
    ecodirect_sensors: 38,
    devices_online: 75,
    devices_total: 76,
  },
  {
    id: 'prop-004',
    name: 'Pearl District Lofts',
    address: '321 NW 10th Ave, Portland, OR 97209',
    units_count: 54,
    buildings_count: 1,
    active_alerts: 3,
    total_electric_kwh: 14680,
    total_water_gallons: 51300,
    occupied_units: 52,
    vacant_units: 2,
    monthly_electric_cost: 2202.00,
    monthly_water_cost: 769.50,
    cost_per_unit_electric: 42.35,
    cost_per_unit_water: 14.81,
    leak_alerts_prevented: 4,
    estimated_savings_ytd: 5340.00,
    avg_response_time_hours: 2.1,
    water_efficiency_score: 85,
    electric_efficiency_score: 83,
    shelly_devices: 55,
    ecodirect_sensors: 55,
    devices_online: 108,
    devices_total: 110,
  },
];

// Shelly and Ecodirect device inventory
// Each unit has: 1 Shelly EM (electric) + 1 Ecodirect (water)
// Each building has: 1 Shelly Pro 3EM (main panel) + 1 Ecodirect (main water line)
const mockDevices = [
  // Building-level Shelly Pro 3EM devices (3-phase monitoring)
  {
    id: 'shelly-main-001',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    type: 'shelly_pro_3em',
    name: 'Sunset Apartments - Building A Main Panel',
    location: 'Electrical Room',
    status: 'online',
    current_power_kw: 28.4,
    voltage_l1: 120.2,
    voltage_l2: 119.8,
    voltage_l3: 120.5,
    power_factor: 0.92,
    total_kwh_today: 356.8,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-main-002',
    property_id: 'prop-001',
    building_id: 'bldg-002',
    type: 'shelly_pro_3em',
    name: 'Sunset Apartments - Building B Main Panel',
    location: 'Electrical Room',
    status: 'online',
    current_power_kw: 32.2,
    voltage_l1: 119.9,
    voltage_l2: 120.3,
    voltage_l3: 120.1,
    power_factor: 0.89,
    total_kwh_today: 398.3,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-main-003',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    type: 'shelly_pro_3em',
    name: 'Riverside Complex - Building C Main Panel',
    location: 'Electrical Room',
    status: 'online',
    current_power_kw: 42.8,
    voltage_l1: 120.1,
    voltage_l2: 119.7,
    voltage_l3: 120.4,
    power_factor: 0.91,
    total_kwh_today: 512.6,
    last_reading: new Date().toISOString(),
  },
  
  // Unit-level Shelly EM devices (sample units shown)
  {
    id: 'shelly-unit-101',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-101',
    type: 'shelly_em',
    name: 'Unit 101 - Electric Monitor',
    location: 'Unit Breaker Panel',
    status: 'online',
    current_power_kw: 0.8,
    total_kwh_today: 12.4,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-unit-102',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-102',
    type: 'shelly_em',
    name: 'Unit 102 - Electric Monitor',
    location: 'Unit Breaker Panel',
    status: 'online',
    current_power_kw: 1.2,
    total_kwh_today: 15.8,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-unit-103',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-103',
    type: 'shelly_em',
    name: 'Unit 103 - Electric Monitor',
    location: 'Unit Breaker Panel',
    status: 'online',
    current_power_kw: 2.1,
    total_kwh_today: 18.2,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-unit-205',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-205',
    type: 'shelly_em',
    name: 'Unit 205 - Electric Monitor',
    location: 'Unit Breaker Panel',
    status: 'online',
    current_power_kw: 4.2,
    total_kwh_today: 28.9,
    alert: 'High usage detected - 45% above baseline',
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-unit-304',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    unit_id: 'unit-304',
    type: 'shelly_em',
    name: 'Unit 304 - Electric Monitor',
    location: 'Unit Breaker Panel',
    status: 'online',
    current_power_kw: 1.8,
    total_kwh_today: 16.4,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'shelly-unit-412',
    property_id: 'prop-001',
    building_id: 'bldg-002',
    unit_id: 'unit-412',
    type: 'shelly_em',
    name: 'Unit 412 - Electric Monitor',
    location: 'Unit Breaker Panel',
    status: 'online',
    current_power_kw: 0.6,
    total_kwh_today: 8.2,
    alert: 'Usage in vacant unit',
    last_reading: new Date().toISOString(),
  },
  
  // Building-level Ecodirect water sensors (main lines)
  {
    id: 'ecodirect-main-001',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    type: 'ecodirect_water',
    name: 'Sunset Apartments - Building A Main Water Line',
    location: 'Mechanical Room',
    status: 'online',
    current_flow_gpm: 12.4,
    total_gallons_today: 2840,
    pressure_psi: 62,
    temperature_f: 58,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-main-002',
    property_id: 'prop-001',
    building_id: 'bldg-002',
    type: 'ecodirect_water',
    name: 'Sunset Apartments - Building B Main Water Line',
    location: 'Mechanical Room',
    status: 'online',
    current_flow_gpm: 14.8,
    total_gallons_today: 3120,
    pressure_psi: 64,
    temperature_f: 59,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-main-003',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    type: 'ecodirect_water',
    name: 'Riverside Complex - Building C Main Water Line',
    location: 'Mechanical Room',
    status: 'online',
    current_flow_gpm: 18.2,
    total_gallons_today: 4280,
    pressure_psi: 65,
    temperature_f: 57,
    last_reading: new Date().toISOString(),
  },
  
  // Unit-level Ecodirect water sensors (sample units shown)
  {
    id: 'ecodirect-unit-101',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-101',
    type: 'ecodirect_water',
    name: 'Unit 101 - Water Monitor',
    location: 'Unit Water Closet',
    status: 'online',
    current_flow_gpm: 2.1,
    total_gallons_today: 45,
    pressure_psi: 58,
    alert: 'Leak detected - high flow in vacant unit',
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-unit-102',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-102',
    type: 'ecodirect_water',
    name: 'Unit 102 - Water Monitor',
    location: 'Unit Water Closet',
    status: 'online',
    current_flow_gpm: 0.0,
    total_gallons_today: 62,
    pressure_psi: 59,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-unit-103',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-103',
    type: 'ecodirect_water',
    name: 'Unit 103 - Water Monitor',
    location: 'Unit Water Closet',
    status: 'online',
    current_flow_gpm: 1.2,
    total_gallons_today: 78,
    pressure_psi: 60,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-unit-205',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-205',
    type: 'ecodirect_water',
    name: 'Unit 205 - Water Monitor',
    location: 'Unit Water Closet',
    status: 'online',
    current_flow_gpm: 0.0,
    total_gallons_today: 94,
    pressure_psi: 58,
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-unit-304',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    unit_id: 'unit-304',
    type: 'ecodirect_water',
    name: 'Unit 304 - Water Monitor',
    location: 'Unit Water Closet',
    status: 'online',
    current_flow_gpm: 0.3,
    total_gallons_today: 324,
    pressure_psi: 59,
    alert: 'Continuous flow detected - possible running toilet',
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-unit-412',
    property_id: 'prop-001',
    building_id: 'bldg-002',
    unit_id: 'unit-412',
    type: 'ecodirect_water',
    name: 'Unit 412 - Water Monitor',
    location: 'Unit Water Closet',
    status: 'online',
    current_flow_gpm: 0.4,
    total_gallons_today: 12,
    pressure_psi: 61,
    alert: 'Usage in vacant unit',
    last_reading: new Date().toISOString(),
  },
  {
    id: 'ecodirect-irrigation-001',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    type: 'ecodirect_water',
    name: 'Riverside Complex - Irrigation System',
    location: 'Irrigation Control Room',
    status: 'online',
    current_flow_gpm: 12.8,
    total_gallons_today: 2840,
    pressure_psi: 65,
    alert: 'Usage 180% above baseline - possible broken sprinkler',
    last_reading: new Date().toISOString(),
  },
];

const mockAlerts = [
  {
    id: 'alert-001',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-101',
    type: 'leak_detection',
    severity: 'critical',
    title: 'Critical Water Leak Detected',
    message: 'Unit 101: Ecodirect sensor (ecodirect-002) detected water flow spike of 320% in vacant unit. Current flow: 2.1 GPM. UniFi leak sensor confirmed water presence under kitchen sink. Estimated loss: 450 gallons in 2 hours.',
    status: 'active',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sources: ['ecodirect_water_sensor', 'unifi_leak_sensor', 'occupancy_sensor'],
    device_id: 'ecodirect-002',
    device_name: 'Unit 101 - Water Monitor',
    estimated_cost: 285.50,
    gallons_lost: 450,
  },
  {
    id: 'alert-002',
    property_id: 'prop-001',
    building_id: 'bldg-001',
    unit_id: 'unit-205',
    type: 'high_usage',
    severity: 'high',
    title: 'Abnormal Electric Usage Pattern',
    message: 'Unit 205: Shelly EM monitor (shelly-004) reporting 45% above baseline for 3 consecutive days. Current draw: 4.2 kW. Peak usage at 2-4 AM (28.9 kWh today) suggests possible unauthorized equipment or appliance malfunction.',
    status: 'active',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sources: ['shelly_em', 'smart_plug_monitoring'],
    device_id: 'shelly-004',
    device_name: 'Unit 205 - Electric Monitor',
    estimated_cost: 127.80,
    kwh_over_baseline: 156,
  },
  {
    id: 'alert-003',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    unit_id: 'unit-304',
    type: 'continuous_flow',
    severity: 'high',
    title: 'Continuous Water Flow Detected',
    message: 'Unit 304: Ecodirect sensor (ecodirect-003) detected constant water flow for 18 hours. Flow rate: 0.3 GPM. Total today: 324 gallons. Likely running toilet or slow leak. Tenant notified.',
    status: 'active',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sources: ['ecodirect_water_sensor', 'flow_analysis'],
    device_id: 'ecodirect-003',
    device_name: 'Unit 304 - Water Monitor',
    estimated_cost: 42.30,
    gallons_lost: 324,
  },
  {
    id: 'alert-004',
    property_id: 'prop-001',
    building_id: 'bldg-002',
    unit_id: 'unit-412',
    type: 'vacancy_usage',
    severity: 'medium',
    title: 'Usage in Vacant Unit',
    message: 'Unit 412: Marked vacant for 14 days but Shelly EM showing daily electric usage (avg 8 kWh/day) and Ecodirect showing water usage (avg 12 gallons/day). No motion detected by UniFi sensors.',
    status: 'active',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sources: ['ecodirect_water_sensor', 'shelly_em', 'unifi_motion_sensor'],
    estimated_cost: 38.50,
  },
  {
    id: 'alert-005',
    property_id: 'prop-002',
    building_id: 'bldg-003',
    unit_id: null,
    type: 'common_area_spike',
    severity: 'medium',
    title: 'Common Area Water Spike',
    message: 'Building 3 Irrigation: Ecodirect sensor (ecodirect-004) showing 180% increase vs. last week. Current flow: 12.8 GPM. Total today: 2,840 gallons. Possible broken sprinkler head or zone valve stuck open.',
    status: 'active',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    sources: ['ecodirect_irrigation_sensor', 'flow_analysis'],
    device_id: 'ecodirect-004',
    device_name: 'Building 3 - Irrigation',
    estimated_cost: 156.20,
    gallons_over_baseline: 1240,
  },
];

const mockUniFiDevices = [
  {
    id: 'cam-001',
    name: 'Lobby Camera',
    type: 'camera',
    location: { propertyId: 'prop-001', buildingId: 'bldg-001', zone: 'lobby' },
    status: 'online',
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'leak-001',
    name: 'Unit 101 - Kitchen Sink',
    type: 'leak_sensor',
    location: { propertyId: 'prop-001', buildingId: 'bldg-001', unitId: 'unit-101', zone: 'kitchen' },
    status: 'online',
    batteryLevel: 85,
    lastSeen: new Date().toISOString(),
    currentState: { leakDetected: true },
  },
  {
    id: 'leak-002',
    name: 'Unit 205 - Water Heater',
    type: 'leak_sensor',
    location: { propertyId: 'prop-001', buildingId: 'bldg-001', unitId: 'unit-205', zone: 'utility_closet' },
    status: 'online',
    batteryLevel: 92,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'contact-001',
    name: 'Unit 305 - Front Door',
    type: 'contact_sensor',
    location: { propertyId: 'prop-001', buildingId: 'bldg-001', unitId: 'unit-305', zone: 'entry' },
    status: 'online',
    batteryLevel: 78,
    lastSeen: new Date().toISOString(),
    currentState: { contactState: 'closed' },
  },
  {
    id: 'motion-001',
    name: 'Hallway Motion Sensor',
    type: 'motion_sensor',
    location: { propertyId: 'prop-001', buildingId: 'bldg-001', zone: 'hallway_2nd_floor' },
    status: 'online',
    batteryLevel: 65,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'temp-001',
    name: 'Unit 101 - Living Room',
    type: 'temperature_sensor',
    location: { propertyId: 'prop-001', buildingId: 'bldg-001', unitId: 'unit-101', zone: 'living_room' },
    status: 'online',
    batteryLevel: 88,
    lastSeen: new Date().toISOString(),
    currentState: { temperature: 72, humidity: 45 },
  },
];

const mockCorrelatedEvents = [
  {
    id: 'corr-001',
    type: 'leak_detection_confirmed',
    severity: 'critical',
    title: 'Leak Detection Confirmed - Unit 101',
    message: 'UniFi leak sensor triggered with concurrent 300% water usage spike. Immediate action required.',
    sources: ['unifi_leak_sensor', 'water_meter', 'unifi_camera'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    location: {
      propertyName: 'Sunset Apartments',
      buildingName: 'Building A',
      unitNumber: '101',
    },
  },
  {
    id: 'corr-002',
    type: 'vacant_unit_usage',
    severity: 'high',
    title: 'Usage in Vacant Unit - Unit 405',
    message: 'No motion detected for 7 days but water usage continues. Possible leak or unauthorized occupancy.',
    sources: ['unifi_motion_sensor', 'water_meter', 'unifi_access'],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    location: {
      propertyName: 'Riverside Complex',
      buildingName: 'Building C',
      unitNumber: '405',
    },
  },
];

// API routes - Import Lambda handlers and adapt them for Express
app.get('/api/properties', async (_req: Request, res: Response) => {
  try {
    res.json(mockProperties);
  } catch (error) {
    logger.error('Error fetching properties', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/alerts', async (_req: Request, res: Response) => {
  try {
    res.json({ alerts: mockAlerts });
  } catch (error) {
    logger.error('Error fetching alerts', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/unifi/devices', async (_req: Request, res: Response) => {
  try {
    res.json(mockUniFiDevices);
  } catch (error) {
    logger.error('Error fetching UniFi devices', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/unifi/correlated-events', async (_req: Request, res: Response) => {
  try {
    res.json(mockCorrelatedEvents);
  } catch (error) {
    logger.error('Error fetching correlated events', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate mock usage data for charts (last 30 days)
app.get('/api/usage', async (req: Request, res: Response) => {
  try {
    const { metricType = 'electric_kwh' } = req.query;
    
    const days = 30;
    const usage = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic usage patterns
      const baseValue = metricType === 'electric_kwh' ? 450 : 1500; // kWh or gallons
      const variance = baseValue * 0.15;
      const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.85 : 1.0;
      const seasonalMultiplier = 1 + (Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2);
      
      const value = (baseValue + (Math.random() - 0.5) * variance) * weekendMultiplier * seasonalMultiplier;
      
      usage.push({
        date: date.toISOString().split('T')[0],
        metric_type: metricType,
        sum_value: Math.round(value * 100) / 100,
        avg_value: Math.round((value / 24) * 100) / 100,
        min_value: Math.round((value * 0.3) * 100) / 100,
        max_value: Math.round((value * 1.8) * 100) / 100,
        peak_hour: Math.floor(Math.random() * 6) + 17, // Peak between 5pm-11pm
      });
    }
    
    res.json({ usage });
  } catch (error) {
    logger.error('Error fetching usage data', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get property details with stats
app.get('/api/properties/:propertyId', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const property = mockProperties.find(p => p.id === propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Calculate stats
    const stats = {
      total_units: property.units_count,
      occupied_units: Math.floor(property.units_count * 0.92),
      vacant_units: Math.ceil(property.units_count * 0.08),
      active_alerts: property.active_alerts,
      total_electric_kwh: property.total_electric_kwh,
      total_water_gallons: property.total_water_gallons,
      avg_electric_per_unit: Math.round((property.total_electric_kwh / property.units_count) * 100) / 100,
      avg_water_per_unit: Math.round((property.total_water_gallons / property.units_count) * 100) / 100,
      month_over_month_electric: Math.round((Math.random() - 0.3) * 20 * 100) / 100, // -6% to +14%
      month_over_month_water: Math.round((Math.random() - 0.4) * 15 * 100) / 100,
      anomalies_detected: Math.floor(Math.random() * 5) + 2,
      efficiency_score: Math.floor(Math.random() * 15) + 80, // 80-95
    };
    
    return res.json({ property, stats });
  } catch (error) {
    logger.error('Error fetching property', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get devices (Shelly and Ecodirect)
app.get('/api/devices', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.query;
    
    let devices = mockDevices;
    if (propertyId) {
      devices = devices.filter(d => d.property_id === propertyId);
    }
    
    const shellyDevices = devices.filter(d => d.type.startsWith('shelly'));
    const ecodirectDevices = devices.filter(d => d.type.startsWith('ecodirect'));
    
    return res.json({
      devices,
      summary: {
        total: devices.length,
        shelly_count: shellyDevices.length,
        ecodirect_count: ecodirectDevices.length,
        online: devices.filter(d => d.status === 'online').length,
        with_alerts: devices.filter(d => d.alert).length,
      },
    });
  } catch (error) {
    logger.error('Error fetching devices', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get buildings for a property
app.get('/api/buildings/:propertyId', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    const buildings = [
      {
        id: 'bldg-001',
        property_id: propertyId,
        name: 'Building A',
        floor_count: 4,
        unit_count: 24,
        active_alerts: 2,
        total_electric_kwh: 6200,
        total_water_gallons: 22800,
      },
      {
        id: 'bldg-002',
        property_id: propertyId,
        name: 'Building B',
        floor_count: 4,
        unit_count: 24,
        active_alerts: 1,
        total_electric_kwh: 6250,
        total_water_gallons: 22800,
      },
    ];
    
    res.json({ buildings });
  } catch (error) {
    logger.error('Error fetching buildings', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Development server running on http://localhost:${PORT}`);
  logger.info('Environment:', { 
    nodeEnv: process.env.NODE_ENV,
    dbHost: process.env.DB_HOST,
    awsEndpoint: process.env.AWS_ENDPOINT
  });
});

export default app;
