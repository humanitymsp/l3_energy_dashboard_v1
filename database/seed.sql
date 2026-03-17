-- Seed data for Energy Dashboard
-- Creates sample properties, buildings, units, devices, and initial data

-- Insert Organizations
INSERT INTO organizations (id, name, slug, plan, properties_limit, units_limit, billing_email) VALUES
('11111111-1111-1111-1111-111111111111', 'Acme Property Management', 'acme-pm', 'enterprise', 10, 500, 'billing@acmepm.com'),
('22222222-2222-2222-2222-222222222222', 'Green Living Communities', 'green-living', 'professional', 5, 200, 'billing@greenliving.com');

-- Insert Properties
INSERT INTO properties (id, external_id, name, address, city, state, zip_code, timezone, metadata) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PROP-001', 'Riverside Apartments', '123 River Road', 'Portland', 'OR', '97201', 'America/Los_Angeles', '{"year_built": 2018, "total_units": 48}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PROP-002', 'Downtown Towers', '456 Main Street', 'Seattle', 'WA', '98101', 'America/Los_Angeles', '{"year_built": 2020, "total_units": 72}');

-- Insert Buildings
INSERT INTO buildings (id, property_id, external_id, name, floor_count, unit_count, metadata) VALUES
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BLDG-A', 'Building A', 4, 24, '{"parking_spaces": 30}'),
('aaaabbbb-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BLDG-B', 'Building B', 4, 24, '{"parking_spaces": 30}'),
('bbbbcccc-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BLDG-NORTH', 'North Tower', 6, 36, '{"parking_spaces": 45}'),
('bbbbcccc-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BLDG-SOUTH', 'South Tower', 6, 36, '{"parking_spaces": 45}');

-- Insert Units (100 units total - 24 per building for property 1, 36 per building for property 2)
-- Property 1, Building A (24 units)
INSERT INTO units (building_id, property_id, external_id, unit_number, floor, square_feet, bedrooms, bathrooms, occupied, tenant_name, tenant_email, lease_start_date, lease_end_date) VALUES
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A101', 'A101', 1, 850, 2, 1.0, true, 'John Smith', 'john.smith@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A102', 'A102', 1, 850, 2, 1.0, true, 'Jane Doe', 'jane.doe@email.com', '2024-02-01', '2025-01-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A103', 'A103', 1, 1100, 3, 2.0, true, 'Bob Johnson', 'bob.j@email.com', '2024-01-15', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A104', 'A104', 1, 1100, 3, 2.0, false, NULL, NULL, NULL, NULL),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A105', 'A105', 1, 650, 1, 1.0, true, 'Alice Brown', 'alice.b@email.com', '2024-03-01', '2025-02-28'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A106', 'A106', 1, 650, 1, 1.0, true, 'Charlie Davis', 'charlie.d@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A201', 'A201', 2, 850, 2, 1.0, true, 'David Wilson', 'david.w@email.com', '2024-02-15', '2025-01-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A202', 'A202', 2, 850, 2, 1.0, true, 'Emma Taylor', 'emma.t@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A203', 'A203', 2, 1100, 3, 2.0, true, 'Frank Miller', 'frank.m@email.com', '2024-03-01', '2025-02-28'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A204', 'A204', 2, 1100, 3, 2.0, true, 'Grace Lee', 'grace.l@email.com', '2024-01-15', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A205', 'A205', 2, 650, 1, 1.0, false, NULL, NULL, NULL, NULL),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A206', 'A206', 2, 650, 1, 1.0, true, 'Henry Clark', 'henry.c@email.com', '2024-02-01', '2025-01-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A301', 'A301', 3, 850, 2, 1.0, true, 'Iris Martinez', 'iris.m@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A302', 'A302', 3, 850, 2, 1.0, true, 'Jack Anderson', 'jack.a@email.com', '2024-03-15', '2025-02-28'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A303', 'A303', 3, 1100, 3, 2.0, true, 'Kelly White', 'kelly.w@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A304', 'A304', 3, 1100, 3, 2.0, true, 'Leo Harris', 'leo.h@email.com', '2024-02-01', '2025-01-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A305', 'A305', 3, 650, 1, 1.0, true, 'Mia Thompson', 'mia.t@email.com', '2024-01-15', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A306', 'A306', 3, 650, 1, 1.0, true, 'Noah Garcia', 'noah.g@email.com', '2024-03-01', '2025-02-28'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A401', 'A401', 4, 850, 2, 1.0, true, 'Olivia Rodriguez', 'olivia.r@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A402', 'A402', 4, 850, 2, 1.0, false, NULL, NULL, NULL, NULL),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A403', 'A403', 4, 1100, 3, 2.0, true, 'Paul Martinez', 'paul.m@email.com', '2024-02-15', '2025-01-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A404', 'A404', 4, 1100, 3, 2.0, true, 'Quinn Lopez', 'quinn.l@email.com', '2024-01-01', '2024-12-31'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A405', 'A405', 4, 650, 1, 1.0, true, 'Rachel King', 'rachel.k@email.com', '2024-03-01', '2025-02-28'),
('aaaabbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UNIT-A406', 'A406', 4, 650, 1, 1.0, true, 'Sam Wright', 'sam.w@email.com', '2024-01-15', '2024-12-31');

-- Property 1, Building B (24 units) - simplified for brevity
INSERT INTO units (building_id, property_id, external_id, unit_number, floor, square_feet, bedrooms, bathrooms, occupied) 
SELECT 
  'aaaabbbb-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'UNIT-B' || floor || '0' || unit_num,
  'B' || floor || '0' || unit_num,
  floor,
  CASE WHEN unit_num <= 2 THEN 850 WHEN unit_num <= 4 THEN 1100 ELSE 650 END,
  CASE WHEN unit_num <= 2 THEN 2 WHEN unit_num <= 4 THEN 3 ELSE 1 END,
  CASE WHEN unit_num <= 2 THEN 1.0 WHEN unit_num <= 4 THEN 2.0 ELSE 1.0 END,
  random() > 0.15
FROM generate_series(1, 4) AS floor
CROSS JOIN generate_series(1, 6) AS unit_num;

-- Property 2, North Tower (36 units)
INSERT INTO units (building_id, property_id, external_id, unit_number, floor, square_feet, bedrooms, bathrooms, occupied)
SELECT 
  'bbbbcccc-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'UNIT-N' || floor || '0' || unit_num,
  'N' || floor || '0' || unit_num,
  floor,
  CASE WHEN unit_num <= 2 THEN 900 WHEN unit_num <= 4 THEN 1200 ELSE 700 END,
  CASE WHEN unit_num <= 2 THEN 2 WHEN unit_num <= 4 THEN 3 ELSE 1 END,
  CASE WHEN unit_num <= 2 THEN 1.5 WHEN unit_num <= 4 THEN 2.0 ELSE 1.0 END,
  random() > 0.1
FROM generate_series(1, 6) AS floor
CROSS JOIN generate_series(1, 6) AS unit_num;

-- Property 2, South Tower (36 units)
INSERT INTO units (building_id, property_id, external_id, unit_number, floor, square_feet, bedrooms, bathrooms, occupied)
SELECT 
  'bbbbcccc-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'UNIT-S' || floor || '0' || unit_num,
  'S' || floor || '0' || unit_num,
  floor,
  CASE WHEN unit_num <= 2 THEN 900 WHEN unit_num <= 4 THEN 1200 ELSE 700 END,
  CASE WHEN unit_num <= 2 THEN 2 WHEN unit_num <= 4 THEN 3 ELSE 1 END,
  CASE WHEN unit_num <= 2 THEN 1.5 WHEN unit_num <= 4 THEN 2.0 ELSE 1.0 END,
  random() > 0.1
FROM generate_series(1, 6) AS floor
CROSS JOIN generate_series(1, 6) AS unit_num;

-- Insert Devices (electric and water meters for each unit)
INSERT INTO devices (unit_id, building_id, property_id, external_id, device_type, manufacturer, model, installation_date, status)
SELECT 
  u.id,
  u.building_id,
  u.property_id,
  u.external_id || '-ELEC',
  'electric_meter',
  'Schneider Electric',
  'PM5560',
  CURRENT_DATE - INTERVAL '2 years',
  'ok'
FROM units u;

INSERT INTO devices (unit_id, building_id, property_id, external_id, device_type, manufacturer, model, installation_date, status)
SELECT 
  u.id,
  u.building_id,
  u.property_id,
  u.external_id || '-WATER',
  'water_meter',
  'Badger Meter',
  'ORION',
  CURRENT_DATE - INTERVAL '2 years',
  'ok'
FROM units u;

-- Insert some environmental sensors
INSERT INTO devices (unit_id, building_id, property_id, external_id, device_type, manufacturer, model, installation_date, status)
SELECT 
  u.id,
  u.building_id,
  u.property_id,
  u.external_id || '-LEAK',
  'leak_sensor',
  'Aeotec',
  'Water Sensor 7',
  CURRENT_DATE - INTERVAL '1 year',
  'ok'
FROM units u
WHERE random() > 0.7;

-- Insert Integrations
INSERT INTO integrations (id, property_id, integration_type, name, config, enabled, last_sync) VALUES
('cccccccc-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'home_assistant', 'Riverside HA', '{"url": "http://homeassistant.local:8123", "token": "REPLACE_WITH_ACTUAL_TOKEN"}', true, NOW()),
('cccccccc-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'home_assistant', 'Downtown HA', '{"url": "http://homeassistant-dt.local:8123", "token": "REPLACE_WITH_ACTUAL_TOKEN"}', true, NOW()),
('dddddddd-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mqtt_meter', 'Riverside MQTT', '{"broker": "mqtt.riverside.local", "port": 1883, "topics": ["energy/meters/#"]}', true, NOW()),
('dddddddd-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'unifi', 'Downtown UniFi', '{"controller_url": "https://unifi.downtown.local", "site": "default"}', true, NOW());

-- Insert Device Mappings
INSERT INTO device_mappings (device_id, integration_id, integration_device_id, integration_entity_id, metric_type)
SELECT 
  d.id,
  i.id,
  d.external_id,
  'sensor.' || LOWER(REPLACE(d.external_id, '-', '_')) || '_power',
  'electric_kw'
FROM devices d
JOIN integrations i ON d.property_id = i.property_id AND i.integration_type = 'home_assistant'
WHERE d.device_type = 'electric_meter'
LIMIT 50;

-- Insert Alert Rules
INSERT INTO alert_rules (property_id, name, description, metric_type, condition, severity, channels, enabled) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'High Electric Usage', 'Alert when electric usage exceeds 5 kW', 'electric_kw', '{"operator": ">", "threshold": 5.0, "duration_minutes": 15}', 'medium', ARRAY['email', 'home_assistant']::alert_channel[], true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Continuous Water Flow', 'Alert on continuous water flow for 20+ minutes', 'water_flow_rate', '{"operator": ">", "threshold": 0.5, "duration_minutes": 20}', 'high', ARRAY['email', 'sms', 'home_assistant']::alert_channel[], true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Leak Detected', 'Immediate alert on leak sensor trigger', 'leak', '{"operator": "=", "threshold": 1}', 'critical', ARRAY['email', 'sms', 'push', 'home_assistant']::alert_channel[], true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Off-Hours Electric Spike', 'High electric usage between 11pm-6am', 'electric_kw', '{"operator": ">", "threshold": 3.0, "time_range": ["23:00", "06:00"]}', 'medium', ARRAY['email']::alert_channel[], true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Water Usage Anomaly', 'Water usage 2.5x above baseline', 'water_gallons', '{"operator": "baseline_deviation", "multiplier": 2.5}', 'high', ARRAY['email', 'home_assistant']::alert_channel[], true);

-- Insert sample sensor readings for the last 7 days
-- Electric readings (every 15 minutes)
INSERT INTO sensor_readings (timestamp, property_id, building_id, unit_id, device_id, metric_type, value, status, source)
SELECT 
  ts,
  d.property_id,
  d.building_id,
  d.unit_id,
  d.id,
  'electric_kw',
  -- Simulate realistic electric usage pattern
  CASE 
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 0 AND 5 THEN 0.2 + random() * 0.3
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 6 AND 8 THEN 1.5 + random() * 1.0
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 9 AND 16 THEN 0.8 + random() * 0.7
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 17 AND 22 THEN 2.0 + random() * 1.5
    ELSE 0.5 + random() * 0.5
  END,
  'ok',
  'mqtt_meter'
FROM devices d
CROSS JOIN generate_series(
  NOW() - INTERVAL '7 days',
  NOW(),
  INTERVAL '15 minutes'
) AS ts
WHERE d.device_type = 'electric_meter'
LIMIT 100000;

-- Water readings (every 15 minutes)
INSERT INTO sensor_readings (timestamp, property_id, building_id, unit_id, device_id, metric_type, value, status, source)
SELECT 
  ts,
  d.property_id,
  d.building_id,
  d.unit_id,
  d.id,
  'water_flow_rate',
  -- Simulate realistic water flow pattern (gallons per minute)
  CASE 
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 0 AND 5 THEN random() * 0.1
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 6 AND 9 THEN random() * 2.5
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 10 AND 16 THEN random() * 0.8
    WHEN EXTRACT(HOUR FROM ts) BETWEEN 17 AND 22 THEN random() * 2.0
    ELSE random() * 0.3
  END,
  'ok',
  'mqtt_meter'
FROM devices d
CROSS JOIN generate_series(
  NOW() - INTERVAL '7 days',
  NOW(),
  INTERVAL '15 minutes'
) AS ts
WHERE d.device_type = 'water_meter'
LIMIT 100000;

-- Insert some anomalies
INSERT INTO anomalies (timestamp, property_id, building_id, unit_id, device_id, anomaly_type, severity, metric_type, actual_value, expected_value, deviation_percent, confidence_score, description, recommended_action)
SELECT 
  NOW() - INTERVAL '2 hours',
  u.property_id,
  u.building_id,
  u.id,
  d.id,
  'spike',
  'high',
  'electric_kw',
  8.5,
  2.1,
  304.8,
  0.92,
  'Sudden spike in electric usage detected',
  'Check for malfunctioning appliances or HVAC issues'
FROM units u
JOIN devices d ON u.id = d.unit_id AND d.device_type = 'electric_meter'
WHERE u.unit_number IN ('A101', 'B203', 'N305')
LIMIT 3;

INSERT INTO anomalies (timestamp, property_id, building_id, unit_id, device_id, anomaly_type, severity, metric_type, actual_value, expected_value, deviation_percent, confidence_score, description, recommended_action, resolved)
SELECT 
  NOW() - INTERVAL '5 days',
  u.property_id,
  u.building_id,
  u.id,
  d.id,
  'leak',
  'critical',
  'water_flow_rate',
  1.8,
  0.1,
  1700.0,
  0.98,
  'Continuous water flow detected - possible leak',
  'Immediate inspection required',
  true
FROM units u
JOIN devices d ON u.id = d.unit_id AND d.device_type = 'water_meter'
WHERE u.unit_number = 'A304'
LIMIT 1;

-- Insert some alerts
INSERT INTO alerts (alert_rule_id, anomaly_id, property_id, building_id, unit_id, severity, status, title, message, channels_sent)
SELECT 
  ar.id,
  an.id,
  an.property_id,
  an.building_id,
  an.unit_id,
  an.severity,
  CASE WHEN an.resolved THEN 'resolved' ELSE 'active' END,
  'Anomaly Detected: ' || an.description,
  'Anomaly detected in unit. ' || an.recommended_action,
  ARRAY['email', 'home_assistant']::alert_channel[]
FROM anomalies an
JOIN alert_rules ar ON an.property_id = ar.property_id AND an.metric_type = ar.metric_type
LIMIT 10;

-- Insert sample users
INSERT INTO users (cognito_sub, email, first_name, last_name, role, organization_id, properties_access) VALUES
('user-001', 'admin@acmepm.com', 'Admin', 'User', 'admin', '11111111-1111-1111-1111-111111111111', ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::UUID[]),
('user-002', 'manager@acmepm.com', 'Property', 'Manager', 'manager', '11111111-1111-1111-1111-111111111111', ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::UUID[]),
('user-003', 'viewer@greenliving.com', 'View', 'Only', 'viewer', '22222222-2222-2222-2222-222222222222', ARRAY['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']::UUID[]);

-- Create initial baselines from existing data
INSERT INTO baselines (property_id, building_id, unit_id, metric_type, hour_of_day, day_of_week, baseline_value, std_deviation, sample_count, valid_from)
SELECT 
  property_id,
  building_id,
  unit_id,
  metric_type,
  EXTRACT(HOUR FROM timestamp)::INTEGER as hour_of_day,
  EXTRACT(DOW FROM timestamp)::INTEGER as day_of_week,
  AVG(value) as baseline_value,
  STDDEV(value) as std_deviation,
  COUNT(*) as sample_count,
  CURRENT_DATE as valid_from
FROM sensor_readings
WHERE timestamp >= NOW() - INTERVAL '7 days'
  AND metric_type IN ('electric_kw', 'water_flow_rate')
GROUP BY property_id, building_id, unit_id, metric_type, EXTRACT(HOUR FROM timestamp), EXTRACT(DOW FROM timestamp)
HAVING COUNT(*) >= 5;

-- Summary statistics
SELECT 'Properties' as entity, COUNT(*) as count FROM properties
UNION ALL
SELECT 'Buildings', COUNT(*) FROM buildings
UNION ALL
SELECT 'Units', COUNT(*) FROM units
UNION ALL
SELECT 'Devices', COUNT(*) FROM devices
UNION ALL
SELECT 'Sensor Readings', COUNT(*) FROM sensor_readings
UNION ALL
SELECT 'Anomalies', COUNT(*) FROM anomalies
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'Alert Rules', COUNT(*) FROM alert_rules
UNION ALL
SELECT 'Baselines', COUNT(*) FROM baselines;
