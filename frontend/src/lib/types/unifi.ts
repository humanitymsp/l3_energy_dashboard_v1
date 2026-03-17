// UniFi Protect Types
export interface UniFiCamera {
  id: string;
  name: string;
  model: string;
  location: {
    propertyId: string;
    propertyName: string;
    buildingId?: string;
    buildingName?: string;
    area: string;
  };
  status: 'online' | 'offline' | 'upgrading';
  isRecording: boolean;
  hasMotion: boolean;
  lastMotionAt?: string;
  smartDetections: {
    person: boolean;
    vehicle: boolean;
    package: boolean;
  };
  stats: {
    uptime: number;
    fps: number;
    bitrate: number;
  };
}

export interface MotionEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  type: 'motion' | 'person' | 'vehicle' | 'package';
  thumbnailUrl?: string;
  location: {
    propertyName: string;
    buildingName?: string;
    area: string;
  };
  correlatedEvents?: string[];
}

// UniFi Access Types
export interface AccessPoint {
  id: string;
  name: string;
  location: {
    propertyId: string;
    propertyName: string;
    buildingId?: string;
    buildingName?: string;
    floor?: string;
  };
  status: 'online' | 'offline' | 'locked' | 'unlocked';
  doorState: 'open' | 'closed';
  lastAccess?: string;
  accessCount24h: number;
}

export interface AccessEvent {
  id: string;
  accessPointId: string;
  accessPointName: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    badgeId: string;
  };
  eventType: 'granted' | 'denied' | 'forced' | 'propped';
  location: {
    propertyName: string;
    buildingName?: string;
    floor?: string;
  };
}

// UniFi Network Types
export interface NetworkDevice {
  id: string;
  name: string;
  type: 'switch' | 'ap' | 'gateway' | 'camera' | 'access';
  model: string;
  location: {
    propertyId: string;
    propertyName: string;
    buildingId?: string;
    buildingName?: string;
  };
  status: 'online' | 'offline' | 'upgrading';
  uptime: number;
  clients: number;
  stats: {
    cpu: number;
    memory: number;
    temperature?: number;
  };
  ports?: {
    total: number;
    active: number;
    poe?: number;
  };
}

export interface NetworkStats {
  totalDevices: number;
  onlineDevices: number;
  totalClients: number;
  bandwidth: {
    download: number;
    upload: number;
  };
  alerts: number;
}

// Monitoring Categories
export interface MonitoringCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  deviceCount: number;
  onlineCount: number;
  alerts: number;
  status: 'operational' | 'warning' | 'critical';
}

// Correlated Event
export interface CorrelatedEvent {
  id: string;
  timestamp: string;
  type: 'leak_detection' | 'unauthorized_access' | 'power_anomaly' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sources: Array<{
    type: 'camera' | 'access' | 'water' | 'electric' | 'network';
    deviceId: string;
    deviceName: string;
    data: any;
  }>;
  location: {
    propertyId: string;
    propertyName: string;
    buildingId?: string;
    buildingName?: string;
    unitId?: string;
    unitNumber?: string;
  };
  estimatedImpact?: {
    cost?: number;
    gallonsLost?: number;
    kwhWasted?: number;
  };
  status: 'active' | 'investigating' | 'resolved';
}
