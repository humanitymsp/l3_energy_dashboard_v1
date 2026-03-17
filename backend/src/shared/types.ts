export enum MetricType {
  ELECTRIC_KWH = 'electric_kwh',
  ELECTRIC_KW = 'electric_kw',
  WATER_GALLONS = 'water_gallons',
  WATER_FLOW_RATE = 'water_flow_rate',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  LEAK = 'leak',
  DOOR = 'door',
  WINDOW = 'window',
  MOTION = 'motion',
  OCCUPANCY = 'occupancy',
  SMOKE = 'smoke',
  CO = 'co',
}

export enum ReadingStatus {
  OK = 'ok',
  WARNING = 'warning',
  ERROR = 'error',
  OFFLINE = 'offline',
}

export enum IntegrationType {
  HOME_ASSISTANT = 'home_assistant',
  UNIFI = 'unifi',
  MQTT_METER = 'mqtt_meter',
  REST_METER = 'rest_meter',
  MODBUS_ADAPTER = 'modbus_adapter',
  WEBHOOK = 'webhook',
}

export enum AnomalyType {
  STATIC_THRESHOLD = 'static_threshold',
  BASELINE_DEVIATION = 'baseline_deviation',
  SPIKE = 'spike',
  LEAK = 'leak',
  SENSOR_HEALTH = 'sensor_health',
  CORRELATION = 'correlation',
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  MUTED = 'muted',
}

export enum AlertChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  HOME_ASSISTANT = 'home_assistant',
  PUSH = 'push',
}

export interface NormalizedReading {
  source: IntegrationType;
  propertyExternalId: string;
  buildingExternalId?: string;
  unitExternalId?: string;
  deviceExternalId: string;
  metricType: MetricType;
  value: number;
  timestamp: string;
  status: ReadingStatus;
  metadata?: Record<string, any>;
}

export interface Property {
  id: string;
  external_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  timezone?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Building {
  id: string;
  property_id: string;
  external_id: string;
  name: string;
  address?: string;
  floor_count?: number;
  unit_count?: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Unit {
  id: string;
  building_id: string;
  property_id: string;
  external_id: string;
  unit_number: string;
  floor?: number;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  occupied?: boolean;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  lease_start_date?: Date;
  lease_end_date?: Date;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Device {
  id: string;
  unit_id?: string;
  building_id?: string;
  property_id: string;
  external_id: string;
  device_type: string;
  manufacturer?: string;
  model?: string;
  firmware_version?: string;
  installation_date?: Date;
  last_seen?: Date;
  status: ReadingStatus;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface SensorReading {
  id: number;
  timestamp: Date;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  device_id: string;
  metric_type: MetricType;
  value: number;
  status: ReadingStatus;
  source: IntegrationType;
  raw_payload?: Record<string, any>;
  created_at: Date;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  device_id?: string;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  metric_type: MetricType;
  actual_value?: number;
  expected_value?: number;
  deviation_percent?: number;
  confidence_score?: number;
  description?: string;
  recommended_action?: string;
  related_reading_ids?: number[];
  metadata?: Record<string, any>;
  resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
  created_at: Date;
}

export interface Alert {
  id: string;
  alert_rule_id?: string;
  anomaly_id?: string;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  severity: AnomalySeverity;
  status: AlertStatus;
  title: string;
  message: string;
  channels_sent?: AlertChannel[];
  acknowledged_at?: Date;
  acknowledged_by?: string;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AlertRule {
  id: string;
  property_id?: string;
  building_id?: string;
  unit_id?: string;
  name: string;
  description?: string;
  metric_type: MetricType;
  condition: Record<string, any>;
  severity: AnomalySeverity;
  channels: AlertChannel[];
  enabled: boolean;
  muted_until?: Date;
  cooldown_minutes?: number;
  escalation_config?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface UsageRollupHourly {
  id: number;
  hour_start: Date;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  metric_type: MetricType;
  sum_value: number;
  avg_value: number;
  min_value: number;
  max_value: number;
  reading_count: number;
  created_at: Date;
}

export interface UsageRollupDaily {
  id: number;
  date: Date;
  property_id: string;
  building_id?: string;
  unit_id?: string;
  metric_type: MetricType;
  sum_value: number;
  avg_value: number;
  min_value: number;
  max_value: number;
  peak_hour?: number;
  peak_value?: number;
  reading_count: number;
  created_at: Date;
}

export interface Baseline {
  id: string;
  property_id?: string;
  building_id?: string;
  unit_id?: string;
  metric_type: MetricType;
  hour_of_day?: number;
  day_of_week?: number;
  baseline_value: number;
  std_deviation?: number;
  sample_count: number;
  valid_from: Date;
  valid_to?: Date;
  created_at: Date;
  updated_at: Date;
}
