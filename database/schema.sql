-- Energy Dashboard Database Schema
-- PostgreSQL 16 with pg_cron extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create enum types
CREATE TYPE metric_type AS ENUM (
  'electric_kwh',
  'electric_kw',
  'water_gallons',
  'water_flow_rate',
  'temperature',
  'humidity',
  'leak',
  'door',
  'window',
  'motion',
  'occupancy',
  'smoke',
  'co'
);

CREATE TYPE reading_status AS ENUM ('ok', 'warning', 'error', 'offline');
CREATE TYPE integration_type AS ENUM ('home_assistant', 'unifi', 'mqtt_meter', 'rest_meter', 'modbus_adapter', 'webhook');
CREATE TYPE anomaly_type AS ENUM ('static_threshold', 'baseline_deviation', 'spike', 'leak', 'sensor_health', 'correlation');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'muted');
CREATE TYPE alert_channel AS ENUM ('email', 'sms', 'webhook', 'home_assistant', 'push');

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'USA',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_external_id ON properties(external_id);

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  floor_count INTEGER,
  unit_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, external_id)
);

CREATE INDEX idx_buildings_property_id ON buildings(property_id);
CREATE INDEX idx_buildings_external_id ON buildings(external_id);

-- Units table
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  unit_number VARCHAR(50) NOT NULL,
  floor INTEGER,
  square_feet INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  occupied BOOLEAN DEFAULT false,
  tenant_name VARCHAR(255),
  tenant_email VARCHAR(255),
  tenant_phone VARCHAR(50),
  lease_start_date DATE,
  lease_end_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, external_id)
);

CREATE INDEX idx_units_building_id ON units(building_id);
CREATE INDEX idx_units_property_id ON units(property_id);
CREATE INDEX idx_units_external_id ON units(external_id);
CREATE INDEX idx_units_occupied ON units(occupied);

-- Devices table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  firmware_version VARCHAR(50),
  installation_date DATE,
  last_seen TIMESTAMP WITH TIME ZONE,
  status reading_status DEFAULT 'ok',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_devices_unit_id ON devices(unit_id);
CREATE INDEX idx_devices_building_id ON devices(building_id);
CREATE INDEX idx_devices_property_id ON devices(property_id);
CREATE INDEX idx_devices_external_id ON devices(external_id);
CREATE INDEX idx_devices_status ON devices(status);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  integration_type integration_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_integrations_property_id ON integrations(property_id);
CREATE INDEX idx_integrations_type ON integrations(integration_type);
CREATE INDEX idx_integrations_enabled ON integrations(enabled);

-- Device mappings table (for integration-specific device IDs)
CREATE TABLE device_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  integration_device_id VARCHAR(255) NOT NULL,
  integration_entity_id VARCHAR(255),
  metric_type metric_type NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, integration_device_id, metric_type)
);

CREATE INDEX idx_device_mappings_device_id ON device_mappings(device_id);
CREATE INDEX idx_device_mappings_integration_id ON device_mappings(integration_id);

-- Sensor readings table (time-series data)
CREATE TABLE sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  metric_type metric_type NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  status reading_status DEFAULT 'ok',
  source integration_type NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_property_id ON sensor_readings(property_id);
CREATE INDEX idx_sensor_readings_unit_id ON sensor_readings(unit_id);
CREATE INDEX idx_sensor_readings_metric_type ON sensor_readings(metric_type);
CREATE INDEX idx_sensor_readings_composite ON sensor_readings(device_id, metric_type, timestamp DESC);

-- Partition sensor_readings by month for better performance
-- Note: This would be set up with pg_partman or manual partitioning in production

-- Usage rollups hourly
CREATE TABLE usage_rollups_hourly (
  id BIGSERIAL PRIMARY KEY,
  hour_start TIMESTAMP WITH TIME ZONE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  metric_type metric_type NOT NULL,
  sum_value DOUBLE PRECISION NOT NULL,
  avg_value DOUBLE PRECISION NOT NULL,
  min_value DOUBLE PRECISION NOT NULL,
  max_value DOUBLE PRECISION NOT NULL,
  reading_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hour_start, property_id, COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::UUID), metric_type)
);

CREATE INDEX idx_usage_rollups_hourly_hour ON usage_rollups_hourly(hour_start DESC);
CREATE INDEX idx_usage_rollups_hourly_property ON usage_rollups_hourly(property_id, hour_start DESC);
CREATE INDEX idx_usage_rollups_hourly_unit ON usage_rollups_hourly(unit_id, hour_start DESC);

-- Usage rollups daily
CREATE TABLE usage_rollups_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  metric_type metric_type NOT NULL,
  sum_value DOUBLE PRECISION NOT NULL,
  avg_value DOUBLE PRECISION NOT NULL,
  min_value DOUBLE PRECISION NOT NULL,
  max_value DOUBLE PRECISION NOT NULL,
  peak_hour INTEGER,
  peak_value DOUBLE PRECISION,
  reading_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, property_id, COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::UUID), metric_type)
);

CREATE INDEX idx_usage_rollups_daily_date ON usage_rollups_daily(date DESC);
CREATE INDEX idx_usage_rollups_daily_property ON usage_rollups_daily(property_id, date DESC);
CREATE INDEX idx_usage_rollups_daily_unit ON usage_rollups_daily(unit_id, date DESC);

-- Baselines table (for anomaly detection)
CREATE TABLE baselines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  metric_type metric_type NOT NULL,
  hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  baseline_value DOUBLE PRECISION NOT NULL,
  std_deviation DOUBLE PRECISION,
  sample_count INTEGER NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_baselines_unit_metric ON baselines(unit_id, metric_type);
CREATE INDEX idx_baselines_valid ON baselines(valid_from, valid_to);

-- Anomalies table
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  anomaly_type anomaly_type NOT NULL,
  severity anomaly_severity NOT NULL,
  metric_type metric_type NOT NULL,
  actual_value DOUBLE PRECISION,
  expected_value DOUBLE PRECISION,
  deviation_percent DOUBLE PRECISION,
  confidence_score DOUBLE PRECISION,
  description TEXT,
  recommended_action TEXT,
  related_reading_ids BIGINT[],
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_anomalies_timestamp ON anomalies(timestamp DESC);
CREATE INDEX idx_anomalies_property_id ON anomalies(property_id);
CREATE INDEX idx_anomalies_unit_id ON anomalies(unit_id);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_anomalies_resolved ON anomalies(resolved);

-- Alert rules table
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_type metric_type NOT NULL,
  condition JSONB NOT NULL,
  severity anomaly_severity NOT NULL,
  channels alert_channel[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  muted_until TIMESTAMP WITH TIME ZONE,
  cooldown_minutes INTEGER DEFAULT 60,
  escalation_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_property_id ON alert_rules(property_id);
CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  anomaly_id UUID REFERENCES anomalies(id) ON DELETE SET NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  severity anomaly_severity NOT NULL,
  status alert_status DEFAULT 'active',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channels_sent alert_channel[],
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by VARCHAR(255),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(255),
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_property_id ON alerts(property_id);
CREATE INDEX idx_alerts_unit_id ON alerts(unit_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Integration events log
CREATE TABLE integration_events (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  payload JSONB,
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_integration_events_integration_id ON integration_events(integration_id);
CREATE INDEX idx_integration_events_timestamp ON integration_events(timestamp DESC);
CREATE INDEX idx_integration_events_status ON integration_events(status);

-- Raw events storage (for debugging and replay)
CREATE TABLE raw_events (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source integration_type NOT NULL,
  event_type VARCHAR(100),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  s3_key VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_raw_events_timestamp ON raw_events(timestamp DESC);
CREATE INDEX idx_raw_events_processed ON raw_events(processed);
CREATE INDEX idx_raw_events_source ON raw_events(source);

-- Users table (for multi-tenancy)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cognito_sub VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  organization_id UUID,
  properties_access UUID[],
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);

-- Organizations table (for SaaS multi-tenancy)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'starter',
  properties_limit INTEGER DEFAULT 1,
  units_limit INTEGER DEFAULT 50,
  billing_email VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Functions and triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_baselines_updated_at BEFORE UPDATE ON baselines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update device last_seen on new reading
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE devices 
  SET last_seen = NEW.timestamp,
      status = NEW.status
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_last_seen_trigger
AFTER INSERT ON sensor_readings
FOR EACH ROW EXECUTE FUNCTION update_device_last_seen();

-- Scheduled jobs using pg_cron
-- Run hourly rollups every hour at 5 minutes past
SELECT cron.schedule('hourly-rollups', '5 * * * *', $$
  INSERT INTO usage_rollups_hourly (
    hour_start, property_id, building_id, unit_id, metric_type,
    sum_value, avg_value, min_value, max_value, reading_count
  )
  SELECT 
    date_trunc('hour', timestamp) as hour_start,
    property_id,
    building_id,
    unit_id,
    metric_type,
    SUM(value) as sum_value,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    COUNT(*) as reading_count
  FROM sensor_readings
  WHERE timestamp >= date_trunc('hour', NOW() - INTERVAL '2 hours')
    AND timestamp < date_trunc('hour', NOW() - INTERVAL '1 hour')
    AND metric_type IN ('electric_kwh', 'electric_kw', 'water_gallons', 'water_flow_rate')
  GROUP BY date_trunc('hour', timestamp), property_id, building_id, unit_id, metric_type
  ON CONFLICT (hour_start, property_id, COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::UUID), metric_type)
  DO UPDATE SET
    sum_value = EXCLUDED.sum_value,
    avg_value = EXCLUDED.avg_value,
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    reading_count = EXCLUDED.reading_count;
$$);

-- Run daily rollups every day at 1:00 AM
SELECT cron.schedule('daily-rollups', '0 1 * * *', $$
  INSERT INTO usage_rollups_daily (
    date, property_id, building_id, unit_id, metric_type,
    sum_value, avg_value, min_value, max_value, peak_hour, peak_value, reading_count
  )
  SELECT 
    date_trunc('day', hour_start)::DATE as date,
    property_id,
    building_id,
    unit_id,
    metric_type,
    SUM(sum_value) as sum_value,
    AVG(avg_value) as avg_value,
    MIN(min_value) as min_value,
    MAX(max_value) as max_value,
    (ARRAY_AGG(EXTRACT(HOUR FROM hour_start) ORDER BY max_value DESC))[1]::INTEGER as peak_hour,
    MAX(max_value) as peak_value,
    SUM(reading_count) as reading_count
  FROM usage_rollups_hourly
  WHERE hour_start >= CURRENT_DATE - INTERVAL '2 days'
    AND hour_start < CURRENT_DATE - INTERVAL '1 day'
  GROUP BY date_trunc('day', hour_start)::DATE, property_id, building_id, unit_id, metric_type
  ON CONFLICT (date, property_id, COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::UUID), metric_type)
  DO UPDATE SET
    sum_value = EXCLUDED.sum_value,
    avg_value = EXCLUDED.avg_value,
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    peak_hour = EXCLUDED.peak_hour,
    peak_value = EXCLUDED.peak_value,
    reading_count = EXCLUDED.reading_count;
$$);

-- Clean up old raw events (keep 30 days)
SELECT cron.schedule('cleanup-raw-events', '0 2 * * *', $$
  DELETE FROM raw_events WHERE created_at < NOW() - INTERVAL '30 days';
$$);

-- Clean up old integration events (keep 90 days)
SELECT cron.schedule('cleanup-integration-events', '0 3 * * *', $$
  DELETE FROM integration_events WHERE created_at < NOW() - INTERVAL '90 days';
$$);

-- Views for common queries

-- Current device status view
CREATE VIEW v_device_status AS
SELECT 
  d.id,
  d.external_id,
  d.device_type,
  d.status,
  d.last_seen,
  p.name as property_name,
  b.name as building_name,
  u.unit_number,
  CASE 
    WHEN d.last_seen < NOW() - INTERVAL '1 hour' THEN 'offline'
    WHEN d.last_seen < NOW() - INTERVAL '15 minutes' THEN 'stale'
    ELSE 'online'
  END as connectivity_status,
  EXTRACT(EPOCH FROM (NOW() - d.last_seen)) as seconds_since_last_seen
FROM devices d
LEFT JOIN properties p ON d.property_id = p.id
LEFT JOIN buildings b ON d.building_id = b.id
LEFT JOIN units u ON d.unit_id = u.id;

-- Active alerts view
CREATE VIEW v_active_alerts AS
SELECT 
  a.id,
  a.severity,
  a.status,
  a.title,
  a.message,
  a.created_at,
  p.name as property_name,
  b.name as building_name,
  u.unit_number,
  ar.name as rule_name
FROM alerts a
JOIN properties p ON a.property_id = p.id
LEFT JOIN buildings b ON a.building_id = b.id
LEFT JOIN units u ON a.unit_id = u.id
LEFT JOIN alert_rules ar ON a.alert_rule_id = ar.id
WHERE a.status IN ('active', 'acknowledged')
ORDER BY a.created_at DESC;

-- Unit usage summary view
CREATE VIEW v_unit_usage_summary AS
SELECT 
  u.id as unit_id,
  u.unit_number,
  b.name as building_name,
  p.name as property_name,
  SUM(CASE WHEN ur.metric_type = 'electric_kwh' THEN ur.sum_value ELSE 0 END) as total_electric_kwh,
  SUM(CASE WHEN ur.metric_type = 'water_gallons' THEN ur.sum_value ELSE 0 END) as total_water_gallons,
  COUNT(DISTINCT CASE WHEN an.severity IN ('high', 'critical') THEN an.id END) as high_severity_anomalies
FROM units u
JOIN buildings b ON u.building_id = b.id
JOIN properties p ON u.property_id = p.id
LEFT JOIN usage_rollups_daily ur ON u.id = ur.unit_id AND ur.date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN anomalies an ON u.id = an.unit_id AND an.timestamp >= NOW() - INTERVAL '30 days' AND NOT an.resolved
GROUP BY u.id, u.unit_number, b.name, p.name;

COMMENT ON TABLE properties IS 'Top-level properties/complexes';
COMMENT ON TABLE buildings IS 'Buildings within properties';
COMMENT ON TABLE units IS 'Individual units/apartments';
COMMENT ON TABLE devices IS 'IoT devices and meters';
COMMENT ON TABLE sensor_readings IS 'Time-series sensor data';
COMMENT ON TABLE usage_rollups_hourly IS 'Hourly aggregated usage data';
COMMENT ON TABLE usage_rollups_daily IS 'Daily aggregated usage data';
COMMENT ON TABLE anomalies IS 'Detected anomalies';
COMMENT ON TABLE alerts IS 'Generated alerts';
COMMENT ON TABLE alert_rules IS 'Alert rule definitions';
