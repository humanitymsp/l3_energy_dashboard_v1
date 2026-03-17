# Utility Monitoring Dashboard - Production MVP

## Executive Summary

A production-ready IoT SaaS platform for monitoring electric and water usage across apartment complexes and multifamily properties. The system integrates with Home Assistant, UniFi sensors, and IoT utility meters to provide real-time monitoring, anomaly detection, peak usage analysis, and intelligent alerting.

### Key Capabilities
- **Multi-tier monitoring**: Portfolio → Property → Building → Unit level granularity
- **Dual utility tracking**: Electric (kWh, kW) and Water (gallons, flow rate)
- **Anomaly detection**: Static thresholds, baseline deviation, spike detection, leak detection, sensor health
- **Peak usage analysis**: Identify demand windows, off-hours usage, surge patterns
- **Intelligent alerting**: Rule-based engine with multiple channels (email, SMS, webhook, Home Assistant)
- **Integration hub**: Home Assistant, UniFi, MQTT meters, REST meters, Modbus adapters
- **Event logging**: Complete audit trail of readings, anomalies, alerts, and integration events

### Target Market
- Apartment complexes and multifamily properties
- Property management firms
- HOA and condo portfolios
- Facilities seeking utility cost reduction and leak detection

## Recommended Architecture - AWS Amplify

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                   AWS Amplify Hosting                            │
│  React + TypeScript Dashboard (CloudFront CDN)                  │
│  - Portfolio/Property/Building/Unit views                       │
│  - Real-time charts and anomaly visualization                   │
│  - Alert management and event logs                              │
│  - CI/CD from Git repository                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│              AWS API Gateway (REST + WebSocket)                  │
│  - Cognito authentication & authorization                        │
│  - Request validation and throttling                            │
│  - CORS configuration                                           │
│  - Custom domain support                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Lambda Functions                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │  Dashboard   │ │  Ingestion   │ │   Anomaly    │           │
│  │     API      │ │   Handler    │ │   Detection  │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   Alerting   │ │ Integration  │ │   Rollup     │           │
│  │    Engine    │ │  Connectors  │ │  Processor   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Services Layer                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │  IoT Core    │ │     SQS      │ │  EventBridge │           │
│  │   (MQTT)     │ │   (Queues)   │ │   (Events)   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │     SNS      │ │     SES      │ │  Timestream  │           │
│  │ (Alerting)   │ │   (Email)    │ │ (Time-series)│           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Data Persistence Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon RDS PostgreSQL (with pg_cron extension)          │  │
│  │  - Multi-AZ deployment for HA                            │  │
│  │  - Automated backups and snapshots                       │  │
│  │  - Read replicas for analytics                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon Timestream (Optional - Time-series optimization) │  │
│  │  - Automatic data lifecycle management                   │  │
│  │  - Built-in time-series analytics                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon S3 (Raw event storage & archives)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### AWS Service Mapping

**Frontend**: AWS Amplify Hosting
- Automatic CI/CD from GitHub/GitLab/Bitbucket
- Global CDN via CloudFront
- Custom domain with SSL/TLS
- Preview deployments for branches

**Authentication**: Amazon Cognito
- User pools for authentication
- Identity pools for AWS resource access
- MFA support
- Social identity providers

**API Layer**: Amazon API Gateway
- REST API for dashboard operations
- WebSocket API for real-time updates
- Request/response validation
- Rate limiting and throttling

**Compute**: AWS Lambda
- Serverless functions for all business logic
- Auto-scaling based on demand
- Pay-per-execution pricing
- VPC integration for RDS access

**Message Queue**: Amazon SQS
- Decouple ingestion from processing
- Dead letter queues for failed messages
- FIFO queues for ordered processing

**Event Bus**: Amazon EventBridge
- Route events between services
- Schedule periodic tasks (rollups, cleanup)
- Integration with third-party SaaS

**IoT Integration**: AWS IoT Core
- MQTT broker for meter connectivity
- Device registry and shadows
- Rules engine for routing
- Certificate-based authentication

**Notifications**: Amazon SNS + SES
- SNS for SMS and push notifications
- SES for transactional emails
- Topic-based pub/sub for alerts

**Time-Series Data**: Amazon Timestream (Optional)
- Purpose-built for time-series
- Automatic data tiering (memory → SSD → S3)
- Built-in analytics functions
- Cost-effective at scale

**Relational Data**: Amazon RDS PostgreSQL
- Metadata, configurations, mappings
- User accounts and permissions
- Alert rules and integration configs
- Multi-AZ for high availability

**Object Storage**: Amazon S3
- Raw event payloads
- Long-term archives
- Export files and reports
- Lifecycle policies for cost optimization

**Monitoring**: Amazon CloudWatch
- Lambda function logs and metrics
- Custom application metrics
- Alarms and dashboards
- Log insights for troubleshooting

### Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui for components
- Recharts for visualization
- Lucide React for icons
- AWS Amplify Libraries (Auth, API, PubSub)
- React Query for data fetching
- Zustand for state management

**Backend**
- Node.js 20 + TypeScript (Lambda runtime)
- AWS Lambda for serverless functions
- AWS SDK v3 for AWS service integration
- node-postgres (pg) for RDS PostgreSQL
- AWS IoT SDK for MQTT
- Axios for HTTP clients
- AWS Lambda Powertools for logging/tracing
- Joi for validation
- Middy for Lambda middleware

**Database**
- Amazon RDS PostgreSQL 16
- pg_cron extension for scheduled tasks
- Multi-AZ deployment
- Automated backups
- Optional: Amazon Timestream for time-series optimization

**AWS Infrastructure**
- AWS Amplify (Frontend hosting + CI/CD)
- Amazon API Gateway (REST + WebSocket)
- AWS Lambda (Compute)
- Amazon Cognito (Authentication)
- AWS IoT Core (MQTT broker)
- Amazon SQS (Message queues)
- Amazon EventBridge (Event bus)
- Amazon SNS (Notifications)
- Amazon SES (Email)
- Amazon S3 (Object storage)
- Amazon CloudWatch (Monitoring)
- AWS Secrets Manager (Credentials)
- AWS Systems Manager Parameter Store (Configuration)

## Data Flow Diagram

### Ingestion Flow
```
External Sources → Adapters → Normalization → Validation → Persistence → Processing
     ↓                ↓            ↓              ↓             ↓            ↓
Home Assistant   Extract      Convert to    Check schema   Raw events   Anomaly
UniFi Events     Transform    standard      Deduplicate    Normalized   Detection
MQTT Meters      Load         format        Enrich         readings     Alert Eval
REST Meters                                                              Rollups
Webhooks
```

### Alert Flow
```
Sensor Reading → Anomaly Detection → Alert Rules Evaluation → Alert Generation → Notification Dispatch
                      ↓                       ↓                      ↓                    ↓
                 Static threshold      Match conditions        Create alert         Email
                 Baseline deviation    Check severity          Log event            SMS
                 Spike detection       Apply filters           Update status        Webhook
                 Leak detection        Check mute/snooze                            Home Assistant
```

### Dashboard Flow
```
User Request → API Gateway → Service Layer → Database Query → Response Transform → UI Render
     ↓              ↓              ↓               ↓                 ↓               ↓
Filter/Date    Auth check     Business logic   TimescaleDB      Format JSON     Charts
Property       Rate limit     Aggregation      Continuous       Add metadata    Tables
Building       Validation     Calculation      aggregates       Enrich data     Cards
Unit                                                                             Maps
```

## Integration Strategy

### 1. Home Assistant Integration
**Connection Method**: REST API + WebSocket API
**Purpose**: Primary automation hub and entity aggregator

**Implementation**:
- REST API for initial entity discovery and metadata
- WebSocket API for real-time state changes
- Map Home Assistant entities to property/building/unit hierarchy
- Support utility_meter entities for rolled-up usage
- Leverage Home Assistant notification services for alerts

**Entity Mapping**:
```typescript
{
  "sensor.unit_101_electric_power": {
    "propertyId": "prop-001",
    "buildingId": "bldg-001",
    "unitId": "unit-101",
    "metricType": "electric_kw"
  }
}
```

### 2. UniFi Protect & AlarmHub Integration
**Connection Methods**: UniFi API, WebSocket Events, Webhooks
**Purpose**: Security monitoring, environmental sensors, occupancy detection, and utility correlation

#### UniFi Protect Integration

**Cameras & Motion Detection**:
- **API**: UniFi Protect REST API + WebSocket for real-time events
- **Purpose**: Occupancy detection, vacancy verification, security correlation
- **Capabilities**:
  - Motion detection events per camera
  - Smart detection (person, vehicle, package)
  - Occupancy status per unit/common area
  - Vacancy detection for leak/anomaly correlation
  - Video analytics for traffic patterns
- **Use Cases**:
  - Correlate high water usage with occupancy
  - Detect water usage when unit is vacant (leak indicator)
  - Verify unit occupancy for billing disputes
  - Common area usage patterns vs. utility consumption

**Implementation**:
```typescript
// Motion event correlation
if (motionDetected && waterUsage > threshold && unitStatus === 'vacant') {
  createAlert({
    type: 'potential_leak',
    severity: 'high',
    message: 'Water usage detected in vacant unit with motion',
    correlatedEvents: [motionEvent, waterUsageEvent]
  });
}
```

#### UniFi AlarmHub & Sensor Integration

**Leak Sensors**:
- **Device**: UniFi Leak Sensor
- **Integration**: AlarmHub API + WebSocket events
- **Capabilities**:
  - Real-time leak detection
  - Water presence alerts
  - Battery status monitoring
  - Placement: Under sinks, water heaters, washing machines, bathrooms
- **Correlation**:
  - Cross-reference with water meter readings
  - Validate leak detection with flow rate spikes
  - Auto-trigger Moen Flo shutoff valve
  - Generate maintenance tickets

**Door/Window Sensors**:
- **Device**: UniFi Contact Sensor
- **Purpose**: Occupancy tracking, HVAC efficiency
- **Capabilities**:
  - Entry/exit detection
  - Occupancy inference
  - Common area access monitoring
  - Maintenance access logging
- **Correlation**:
  - Track HVAC usage vs. occupancy
  - Detect energy waste (doors/windows open with HVAC running)
  - Vacancy verification for utility anomalies

**Motion Sensors**:
- **Device**: UniFi Motion Sensor
- **Purpose**: Occupancy detection, common area usage
- **Capabilities**:
  - PIR motion detection
  - Ambient light sensing
  - Temperature monitoring
  - Battery status
- **Correlation**:
  - Occupancy-based usage analysis
  - Common area lighting vs. motion patterns
  - Vacancy detection for leak investigation

**Temperature/Humidity Sensors**:
- **Device**: UniFi Temperature Sensor (via AlarmHub)
- **Purpose**: HVAC efficiency, comfort monitoring
- **Capabilities**:
  - Temperature monitoring
  - Humidity tracking
  - Trend analysis
- **Correlation**:
  - HVAC runtime vs. temperature delta
  - Energy efficiency scoring
  - Identify HVAC issues (high runtime, poor temp control)

**Smart Plugs & Power Monitoring**:
- **Device**: UniFi Smart Power Plug
- **Purpose**: Appliance-level monitoring
- **Capabilities**:
  - Real-time power consumption
  - Remote on/off control
  - Energy usage tracking per outlet
- **Use Cases**:
  - Monitor common area equipment
  - Track EV charger usage
  - Laundry room equipment monitoring

#### UniFi Access Integration

**Door Access Control**:
- **Device**: UniFi Access Hub + Readers
- **Purpose**: Entry logging, occupancy tracking
- **Capabilities**:
  - Entry/exit timestamps
  - User identification
  - Common area access patterns
- **Correlation**:
  - Occupancy verification
  - Maintenance access logging
  - Utility usage vs. access patterns

#### Event Processing & Correlation

**Real-time Event Stream**:
```typescript
interface UniFiEvent {
  type: 'motion' | 'leak' | 'contact' | 'temperature' | 'access' | 'smart_detection';
  deviceId: string;
  deviceName: string;
  location: {
    propertyId: string;
    buildingId: string;
    unitId?: string;
    zone: string; // 'unit', 'common_area', 'exterior'
  };
  timestamp: string;
  data: {
    // Event-specific data
    detected?: boolean;
    temperature?: number;
    humidity?: number;
    leakDetected?: boolean;
    contactState?: 'open' | 'closed';
    smartDetection?: 'person' | 'vehicle' | 'package';
  };
  metadata: {
    batteryLevel?: number;
    signalStrength?: number;
    firmwareVersion?: string;
  };
}
```

**Correlation Rules**:
1. **Leak Detection + Water Usage**:
   - Leak sensor triggered → Check water meter for spike
   - Water spike + no leak sensor → Suggest sensor placement
   - Leak sensor + high usage → Auto-shutoff if Moen Flo installed

2. **Occupancy + Usage**:
   - No motion/access for 7 days + water usage → Potential leak
   - High motion + low usage → Investigate meter accuracy
   - Vacation mode + any usage → Alert property manager

3. **HVAC Efficiency**:
   - Door/window open + HVAC running → Energy waste alert
   - High temp delta + high runtime → HVAC maintenance needed
   - Occupancy + temperature → Comfort scoring

4. **Security + Utility**:
   - Unauthorized access + usage spike → Security investigation
   - After-hours access + utility usage → Track maintenance impact

**Dashboard Integration**:
- Real-time UniFi device status widget
- Leak sensor status per unit
- Occupancy heatmap overlay on property map
- Correlated events timeline
- Smart alerts combining UniFi + utility data

### 3. IoT Meter Integration
**Connection Methods**: MQTT, REST polling, Webhooks, Modbus/TCP

#### Supported Electric Monitoring Devices

**Shelly Pro 3EM / EM Family**
- **Integration**: MQTT, REST API, WebSocket
- **Capabilities**: 3-phase energy monitoring, real-time power, voltage, current, power factor
- **Home Assistant**: Native integration via Shelly integration
- **Direct Integration**: MQTT topics `shellypro3em-{deviceid}/status/em:{phase}`
- **Metrics**: kW, kWh, voltage, current, power factor per phase
- **Update Rate**: 1-60 seconds configurable

**Aeotec Home Energy Meter (Gen 8)**
- **Integration**: Z-Wave via Home Assistant
- **Capabilities**: Whole-home energy monitoring, 200A clamp-on CT
- **Home Assistant**: Z-Wave JS integration
- **Metrics**: Total kWh, instantaneous kW, voltage, current
- **Update Rate**: 10-60 seconds configurable
- **Notes**: Requires Z-Wave controller (e.g., Aeotec Z-Stick)

**Emporia Vue 3**
- **Integration**: Cloud API, Home Assistant custom component
- **Capabilities**: 16-circuit monitoring, solar tracking, EV charging
- **Home Assistant**: HACS custom component `emporia_vue`
- **Metrics**: Per-circuit kWh, kW, voltage
- **Update Rate**: 1-minute intervals
- **API**: REST API with OAuth authentication

**Siemens Inhab**
- **Integration**: Modbus/TCP, BACnet
- **Capabilities**: Commercial/industrial energy management
- **Home Assistant**: Modbus integration
- **Metrics**: Multi-phase power, energy, demand, harmonics
- **Update Rate**: Configurable polling interval
- **Protocol**: Modbus TCP register mapping

**Schneider Wiser Energy**
- **Integration**: Cloud API, Home Assistant integration
- **Capabilities**: Circuit-level monitoring, load disaggregation
- **Home Assistant**: Native Wiser integration
- **Metrics**: Per-circuit kWh, kW, cost tracking
- **Update Rate**: Real-time updates via cloud
- **API**: REST API with API key authentication

#### Supported Water Monitoring Devices

**Flume 2**
- **Integration**: Cloud API, Home Assistant custom component
- **Capabilities**: Whole-home water monitoring, leak detection, flow rate
- **Home Assistant**: HACS custom component `flume`
- **Metrics**: Gallons, GPM flow rate, leak alerts
- **Update Rate**: 1-minute intervals
- **API**: REST API with OAuth 2.0
- **Features**: AI-powered leak detection, usage notifications

**Moen Flo Smart Water Monitor + Shutoff**
- **Integration**: Cloud API, Home Assistant integration
- **Capabilities**: Flow monitoring, automatic shutoff, pressure monitoring
- **Home Assistant**: Native Flo integration
- **Metrics**: Gallons, GPM, PSI pressure, temperature
- **Update Rate**: Real-time flow events
- **API**: REST API with API key
- **Features**: FloSense leak detection, automatic shutoff valve

**Phyn Plus**
- **Integration**: Cloud API, Home Assistant custom component
- **Capabilities**: Whole-home monitoring, leak detection, automatic shutoff
- **Home Assistant**: HACS custom component `phyn`
- **Metrics**: Gallons, GPM, pressure
- **Update Rate**: Real-time events
- **API**: REST API with OAuth
- **Features**: Pressure wave analysis for leak detection

**YoLink FlowSmart / YoLink Valve Ecosystem**
- **Integration**: MQTT, REST API, Home Assistant integration
- **Capabilities**: Flow monitoring, smart valve control, leak detection
- **Home Assistant**: Native YoLink integration
- **Metrics**: Gallons, flow rate, valve status
- **Update Rate**: Real-time via LoRa network
- **API**: MQTT and REST API
- **Features**: Long-range LoRa connectivity, battery-powered sensors

**ESPHome Pulse-Meter Setups**
- **Integration**: MQTT, ESPHome API, Home Assistant native
- **Capabilities**: Custom pulse counting for mechanical meters
- **Home Assistant**: ESPHome native integration
- **Metrics**: Configurable units (gallons, cubic meters, etc.)
- **Update Rate**: Real-time pulse counting
- **Configuration**: YAML-based sensor configuration
- **Hardware**: ESP32/ESP8266 with pulse sensor
- **Example Config**:
```yaml
sensor:
  - platform: pulse_meter
    pin: GPIO12
    name: "Water Meter"
    unit_of_measurement: "gal/min"
    total:
      name: "Water Total"
      unit_of_measurement: "gal"
      filters:
        - multiply: 0.1  # 10 pulses per gallon
```

#### General Integration Patterns

**MQTT Meters**:
- Subscribe to configured topics
- Parse device-specific payload formats
- Support QoS levels for reliability
- Handle connection failures and reconnection
- Topic patterns: `{device_type}/{device_id}/sensor/{metric}`

**REST Meters**:
- Scheduled polling at configurable intervals
- Support authentication (API key, OAuth, Basic)
- Parse various response formats (JSON, XML, CSV)
- Implement exponential backoff on failures
- Rate limiting and quota management

**Webhook Meters**:
- Dedicated endpoint per meter type
- Signature validation for security
- Idempotency handling
- Async processing queue
- Support for batch payloads

**Modbus Adapters**:
- Modbus/TCP client for industrial meters
- Register mapping configuration
- Data type conversion (INT16, UINT32, FLOAT)
- Polling scheduler with configurable intervals
- Support for multiple slave devices

### 4. Normalization Layer
All integrations convert to a standard format:

```typescript
interface NormalizedReading {
  source: 'home_assistant' | 'unifi' | 'mqtt_meter' | 'rest_meter' | 'modbus_adapter';
  propertyExternalId: string;
  buildingExternalId: string;
  unitExternalId: string;
  deviceExternalId: string;
  metricType: MetricType;
  value: number;
  timestamp: string; // ISO8601
  status: 'ok' | 'warning' | 'error' | 'offline';
  metadata: Record<string, any>;
}
```

## MVP Build Plan - Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and tooling
- [ ] Database schema and migrations
- [ ] Core API structure
- [ ] Authentication system
- [ ] Basic frontend shell

### Phase 2: Data Ingestion (Week 3-4)
- [ ] MQTT connector
- [ ] REST meter poller
- [ ] Webhook endpoints
- [ ] Home Assistant connector
- [ ] Event normalization pipeline
- [ ] Data persistence layer

### Phase 3: Analytics Engine (Week 5-6)
- [ ] Anomaly detection service
- [ ] Baseline calculation
- [ ] Peak usage analysis
- [ ] Rollup aggregations
- [ ] Alert rule engine
- [ ] Notification dispatcher

### Phase 4: Dashboard UI (Week 7-8)
- [ ] Portfolio overview
- [ ] Property view
- [ ] Building view
- [ ] Unit view
- [ ] Alerts & logs view
- [ ] Integrations management
- [ ] Charts and visualizations

### Phase 5: Integration & Testing (Week 9-10)
- [ ] UniFi adapter
- [ ] Modbus adapter (optional)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Docker deployment
- [ ] Documentation

### Phase 6: Polish & Launch (Week 11-12)
- [ ] UI/UX refinement
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Monitoring and logging
- [ ] Deployment automation
- [ ] User onboarding

## SaaS Business Model

### Target Customers
1. **Apartment Complex Owners**: 50-500 units per property
2. **Property Management Firms**: Managing multiple properties
3. **HOA/Condo Associations**: Shared utility monitoring
4. **Facilities Management**: Commercial multifamily

### Value Propositions
- **Cost Reduction**: Identify waste, leaks, and inefficiencies (10-30% savings)
- **Preventive Maintenance**: Early leak detection prevents damage
- **Tenant Billing**: Accurate per-unit usage for submetering
- **Sustainability**: Track and reduce carbon footprint
- **Compliance**: Utility reporting and benchmarking

### Revenue Model
**Tiered SaaS Pricing**:
- **Starter**: $99/month - Up to 50 units, basic features
- **Professional**: $299/month - Up to 200 units, advanced analytics
- **Enterprise**: $799/month - Unlimited units, white-label, API access
- **Custom**: Volume pricing for property management firms

**Add-ons**:
- SMS alerting: $0.05/message
- Advanced ML anomaly detection: $50/month
- White-label branding: $200/month
- Dedicated support: $500/month

### Growth Strategy
1. **Land**: Start with single property pilot
2. **Expand**: Upsell to additional properties in portfolio
3. **Integrate**: Partner with property management software (Yardi, AppFolio)
4. **Scale**: API marketplace for meter manufacturers and integrators

### Competitive Advantages
- **Multi-integration**: Home Assistant + UniFi + any meter
- **Anomaly Intelligence**: Beyond simple thresholds
- **Scalable Architecture**: Cloud-native, multi-tenant
- **Open Integration**: MQTT, REST, Modbus support
- **Modern UX**: 2026 dashboard standards

## Next Steps After MVP
1. Multi-tenancy and organization hierarchy
2. Advanced ML models for anomaly detection
3. Predictive maintenance recommendations
4. Mobile app (React Native)
5. Tenant portal for usage transparency
6. Integration marketplace
7. Carbon footprint tracking
8. Utility bill reconciliation
9. Demand response automation
10. White-label deployment options
