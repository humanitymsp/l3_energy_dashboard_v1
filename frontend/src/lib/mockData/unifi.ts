import { UniFiCamera, MotionEvent, AccessPoint, AccessEvent, NetworkDevice, NetworkStats, MonitoringCategory, CorrelatedEvent } from '../types/unifi';

// Mock UniFi Protect Cameras
export const mockCameras: UniFiCamera[] = [
  {
    id: 'cam-001',
    name: 'Main Entrance',
    model: 'G4 Pro',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      area: 'Main Entrance',
    },
    status: 'online',
    isRecording: true,
    hasMotion: false,
    smartDetections: { person: true, vehicle: true, package: true },
    stats: { uptime: 99.8, fps: 30, bitrate: 8000 },
  },
  {
    id: 'cam-002',
    name: 'Parking Lot North',
    model: 'G4 Bullet',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      area: 'Parking Lot',
    },
    status: 'online',
    isRecording: true,
    hasMotion: true,
    lastMotionAt: new Date(Date.now() - 5 * 60000).toISOString(),
    smartDetections: { person: false, vehicle: true, package: false },
    stats: { uptime: 99.5, fps: 24, bitrate: 6000 },
  },
  {
    id: 'cam-003',
    name: 'Hallway 1st Floor',
    model: 'G4 Dome',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      area: '1st Floor Hallway',
    },
    status: 'online',
    isRecording: true,
    hasMotion: false,
    smartDetections: { person: true, vehicle: false, package: true },
    stats: { uptime: 99.9, fps: 30, bitrate: 5000 },
  },
  {
    id: 'cam-004',
    name: 'Laundry Room',
    model: 'G4 Instant',
    location: {
      propertyId: 'prop-002',
      propertyName: 'Riverside Complex',
      buildingId: 'bldg-003',
      buildingName: 'Building A',
      area: 'Laundry Room',
    },
    status: 'online',
    isRecording: true,
    hasMotion: false,
    smartDetections: { person: true, vehicle: false, package: false },
    stats: { uptime: 98.7, fps: 24, bitrate: 4000 },
  },
];

// Mock Motion Events
export const mockMotionEvents: MotionEvent[] = [
  {
    id: 'evt-001',
    cameraId: 'cam-002',
    cameraName: 'Parking Lot North',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: 'vehicle',
    location: {
      propertyName: 'Sunset Apartments',
      buildingName: 'Building A',
      area: 'Parking Lot',
    },
  },
  {
    id: 'evt-002',
    cameraId: 'cam-001',
    cameraName: 'Main Entrance',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'person',
    location: {
      propertyName: 'Sunset Apartments',
      buildingName: 'Building A',
      area: 'Main Entrance',
    },
  },
];

// Mock UniFi Access Points
export const mockAccessPoints: AccessPoint[] = [
  {
    id: 'access-001',
    name: 'Building A Main Door',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      floor: 'Ground',
    },
    status: 'online',
    doorState: 'closed',
    lastAccess: new Date(Date.now() - 10 * 60000).toISOString(),
    accessCount24h: 47,
  },
  {
    id: 'access-002',
    name: 'Maintenance Room',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      floor: 'Basement',
    },
    status: 'online',
    doorState: 'closed',
    lastAccess: new Date(Date.now() - 2 * 3600000).toISOString(),
    accessCount24h: 3,
  },
  {
    id: 'access-003',
    name: 'Rooftop Access',
    location: {
      propertyId: 'prop-002',
      propertyName: 'Riverside Complex',
      buildingId: 'bldg-003',
      buildingName: 'Building A',
      floor: 'Roof',
    },
    status: 'online',
    doorState: 'closed',
    lastAccess: new Date(Date.now() - 24 * 3600000).toISOString(),
    accessCount24h: 1,
  },
];

// Mock Access Events
export const mockAccessEvents: AccessEvent[] = [
  {
    id: 'access-evt-001',
    accessPointId: 'access-001',
    accessPointName: 'Building A Main Door',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    user: { id: 'user-001', name: 'John Maintenance', badgeId: 'BADGE-1001' },
    eventType: 'granted',
    location: {
      propertyName: 'Sunset Apartments',
      buildingName: 'Building A',
      floor: 'Ground',
    },
  },
  {
    id: 'access-evt-002',
    accessPointId: 'access-002',
    accessPointName: 'Maintenance Room',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    user: { id: 'user-001', name: 'John Maintenance', badgeId: 'BADGE-1001' },
    eventType: 'granted',
    location: {
      propertyName: 'Sunset Apartments',
      buildingName: 'Building A',
      floor: 'Basement',
    },
  },
  {
    id: 'access-evt-003',
    accessPointId: 'access-001',
    accessPointName: 'Building A Main Door',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    user: { id: 'user-002', name: 'Unknown', badgeId: 'UNKNOWN' },
    eventType: 'denied',
    location: {
      propertyName: 'Sunset Apartments',
      buildingName: 'Building A',
      floor: 'Ground',
    },
  },
];

// Mock Network Devices
export const mockNetworkDevices: NetworkDevice[] = [
  {
    id: 'net-001',
    name: 'Building A Core Switch',
    type: 'switch',
    model: 'USW-Pro-48-PoE',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
    },
    status: 'online',
    uptime: 2592000,
    clients: 48,
    stats: { cpu: 12, memory: 34, temperature: 42 },
    ports: { total: 48, active: 42, poe: 24 },
  },
  {
    id: 'net-002',
    name: 'Building A AP - Lobby',
    type: 'ap',
    model: 'U6-Pro',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
    },
    status: 'online',
    uptime: 1296000,
    clients: 12,
    stats: { cpu: 8, memory: 28 },
  },
  {
    id: 'net-003',
    name: 'Property Gateway',
    type: 'gateway',
    model: 'UDM-Pro',
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
    },
    status: 'online',
    uptime: 5184000,
    clients: 156,
    stats: { cpu: 15, memory: 42, temperature: 38 },
  },
];

// Mock Network Stats
export const mockNetworkStats: NetworkStats = {
  totalDevices: 24,
  onlineDevices: 23,
  totalClients: 156,
  bandwidth: { download: 450.5, upload: 125.3 },
  alerts: 1,
};

// Mock Monitoring Categories
export const mockMonitoringCategories: MonitoringCategory[] = [
  {
    id: 'security',
    name: 'Physical Security',
    icon: 'Shield',
    description: 'Cameras & Access Control',
    deviceCount: 16,
    onlineCount: 16,
    alerts: 1,
    status: 'operational',
  },
  {
    id: 'utilities',
    name: 'Utilities Monitoring',
    icon: 'Zap',
    description: 'Water & Electric',
    deviceCount: 436,
    onlineCount: 429,
    alerts: 10,
    status: 'warning',
  },
  {
    id: 'network',
    name: 'Network Infrastructure',
    icon: 'Wifi',
    description: 'Switches, APs & Gateways',
    deviceCount: 24,
    onlineCount: 23,
    alerts: 1,
    status: 'operational',
  },
  {
    id: 'environmental',
    name: 'Environmental',
    icon: 'Thermometer',
    description: 'Temperature & Humidity',
    deviceCount: 48,
    onlineCount: 47,
    alerts: 0,
    status: 'operational',
  },
];

// Mock Correlated Events
export const mockCorrelatedEvents: CorrelatedEvent[] = [
  {
    id: 'corr-001',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'leak_detection',
    severity: 'critical',
    title: 'Potential Leak Detected - Unit 204',
    description: 'Water usage spike detected simultaneously with motion in hallway. Possible pipe burst.',
    sources: [
      {
        type: 'water',
        deviceId: 'eco-204',
        deviceName: 'Unit 204 Water Sensor',
        data: { flow: 15.2, baseline: 0.5 },
      },
      {
        type: 'camera',
        deviceId: 'cam-003',
        deviceName: 'Hallway 1st Floor',
        data: { motionDetected: true, personDetected: false },
      },
    ],
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
      unitId: 'unit-204',
      unitNumber: '204',
    },
    estimatedImpact: { cost: 450, gallonsLost: 2500 },
    status: 'active',
  },
  {
    id: 'corr-002',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    type: 'unauthorized_access',
    severity: 'high',
    title: 'Unauthorized Access Attempt',
    description: 'Failed access attempt followed by person detection at restricted door.',
    sources: [
      {
        type: 'access',
        deviceId: 'access-001',
        deviceName: 'Building A Main Door',
        data: { eventType: 'denied', badgeId: 'UNKNOWN' },
      },
      {
        type: 'camera',
        deviceId: 'cam-001',
        deviceName: 'Main Entrance',
        data: { personDetected: true },
      },
    ],
    location: {
      propertyId: 'prop-001',
      propertyName: 'Sunset Apartments',
      buildingId: 'bldg-001',
      buildingName: 'Building A',
    },
    status: 'investigating',
  },
];
