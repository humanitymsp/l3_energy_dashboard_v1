import { useState } from 'react';
import { Activity, Wifi, Shield, ExternalLink, Server, Radio, Cloud, ChevronDown, ChevronUp, Key, Globe, RefreshCw, Settings, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'degraded';
  lastSync: string;
  detailsPath?: string;
  featured?: boolean;
  icon: any;
  description: string;
  connectionMethod: string;
  apiConfig: { label: string; value: string; masked?: boolean }[];
  settings: { label: string; value: string; type: 'text' | 'toggle' | 'select' }[];
}

export default function IntegrationsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: 'unifi',
      name: 'UniFi Protect & AlarmHub',
      status: 'connected',
      lastSync: '30 seconds ago',
      detailsPath: '/integrations/unifi',
      featured: true,
      icon: Shield,
      description: 'Connects to Ubiquiti UniFi Protect for camera feeds, motion events, and smart sensor data. AlarmHub provides door/window contact sensors, leak detection, and intrusion alerts. Data is polled via the UniFi OS API on a local controller.',
      connectionMethod: 'REST API (Local Network) — Polls UniFi OS Console at configured interval. Requires local network access or VPN tunnel to controller.',
      apiConfig: [
        { label: 'Controller URL', value: 'https://192.168.1.1:443' },
        { label: 'API Key', value: 'unfk_••••••••••••••••••••', masked: true },
        { label: 'Site ID', value: 'default' },
        { label: 'Poll Interval', value: '30s' },
      ],
      settings: [
        { label: 'Enable Motion Events', value: 'Enabled', type: 'toggle' },
        { label: 'Enable Leak Alerts', value: 'Enabled', type: 'toggle' },
        { label: 'Camera Snapshot Retention', value: '7 days', type: 'select' },
        { label: 'Event Correlation Window', value: '60s', type: 'text' },
      ],
    },
    {
      id: 'shelly',
      name: 'Shelly Energy Monitors',
      status: 'connected',
      lastSync: '15 seconds ago',
      icon: Activity,
      description: 'Shelly EM and Pro 3EM devices report real-time energy consumption per unit via MQTT. Each device publishes wattage, voltage, and cumulative kWh readings. Data flows through the MQTT broker into the time-series database.',
      connectionMethod: 'MQTT Publish/Subscribe — Devices publish to topic shelly/{device_id}/status. Backend subscribes via shared MQTT broker.',
      apiConfig: [
        { label: 'MQTT Broker', value: 'mqtt://broker.local:1883' },
        { label: 'Topic Prefix', value: 'shelly/' },
        { label: 'Auth User', value: 'shelly_svc' },
        { label: 'Auth Password', value: '••••••••', masked: true },
        { label: 'QoS Level', value: '1' },
      ],
      settings: [
        { label: 'Report Interval', value: '15s', type: 'text' },
        { label: 'Power Threshold Alert', value: '500W', type: 'text' },
        { label: 'Store Raw Readings', value: 'Enabled', type: 'toggle' },
        { label: 'Auto-Discovery', value: 'Enabled', type: 'toggle' },
      ],
    },
    {
      id: 'ecodirect',
      name: 'EcoDirect Water Sensors',
      status: 'connected',
      lastSync: '45 seconds ago',
      icon: Activity,
      description: 'EcoDirect flow meters and leak sensors report water usage per unit and detect anomalies. Sensors communicate via LoRaWAN gateway, which forwards data over MQTT. Leak detection triggers immediate alerts.',
      connectionMethod: 'LoRaWAN → MQTT Bridge — Sensors transmit via LoRa to local gateway, which publishes to MQTT topic ecodirect/{sensor_id}/data.',
      apiConfig: [
        { label: 'Gateway IP', value: '192.168.1.50:8080' },
        { label: 'MQTT Topic', value: 'ecodirect/' },
        { label: 'Network Key', value: '••••••••••••••••', masked: true },
        { label: 'App EUI', value: '70B3D57ED0049ACE' },
      ],
      settings: [
        { label: 'Leak Detection Sensitivity', value: 'High', type: 'select' },
        { label: 'Flow Report Interval', value: '60s', type: 'text' },
        { label: 'Gallons Alert Threshold', value: '50 gal/hr', type: 'text' },
        { label: 'Battery Low Alert', value: 'Enabled', type: 'toggle' },
      ],
    },
    {
      id: 'mqtt',
      name: 'MQTT Broker',
      status: 'connected',
      lastSync: '5 seconds ago',
      icon: Radio,
      description: 'Central message broker (Mosquitto) that routes all IoT device data. All Shelly, EcoDirect, and Home Assistant events pass through here. The backend subscribes to relevant topics and persists data to PostgreSQL.',
      connectionMethod: 'TCP/TLS Connection — Backend maintains persistent connection to broker. Supports MQTT v5 with shared subscriptions for horizontal scaling.',
      apiConfig: [
        { label: 'Broker Address', value: 'mqtt://localhost:1883' },
        { label: 'TLS Port', value: '8883' },
        { label: 'WebSocket Port', value: '9001' },
        { label: 'Client ID', value: 'energy-dash-backend-01' },
        { label: 'Username', value: 'backend_svc' },
        { label: 'Password', value: '••••••••', masked: true },
      ],
      settings: [
        { label: 'Max Reconnect Attempts', value: '10', type: 'text' },
        { label: 'Keep Alive Interval', value: '60s', type: 'text' },
        { label: 'Clean Session', value: 'Disabled', type: 'toggle' },
        { label: 'Message Retention', value: '24 hours', type: 'select' },
      ],
    },
    {
      id: 'aws-iot',
      name: 'AWS IoT Core',
      status: 'connected',
      lastSync: 'Just now',
      icon: Cloud,
      description: 'Cloud-side ingestion for device telemetry. MQTT messages are forwarded from local broker to AWS IoT Core for long-term storage in S3, real-time analytics via Kinesis, and push notifications via SNS. Also enables remote device management.',
      connectionMethod: 'MQTT over TLS (Port 8883) — Authenticated via X.509 certificates. Messages routed through IoT Rules to Lambda, S3, and DynamoDB.',
      apiConfig: [
        { label: 'Endpoint', value: 'a1b2c3d4e5-ats.iot.us-west-2.amazonaws.com' },
        { label: 'Region', value: 'us-west-2' },
        { label: 'Thing Group', value: 'energy-dash-devices' },
        { label: 'Certificate ARN', value: 'arn:aws:iot:us-west-2:••••:cert/abc123', masked: true },
        { label: 'Policy Name', value: 'EnergyDashDevicePolicy' },
      ],
      settings: [
        { label: 'Shadow Sync', value: 'Enabled', type: 'toggle' },
        { label: 'Rule Actions', value: 'S3 + Lambda + SNS', type: 'text' },
        { label: 'Retention (S3)', value: '90 days', type: 'select' },
        { label: 'Fleet Indexing', value: 'Enabled', type: 'toggle' },
      ],
    },
    {
      id: 'home-assistant',
      name: 'Home Assistant',
      status: 'connected',
      lastSync: '2 minutes ago',
      icon: Server,
      description: 'Local automation hub that aggregates Z-Wave, Zigbee, and WiFi devices not natively supported. Provides a unified API for thermostat control, lighting schedules, and occupancy detection. Publishes state changes to MQTT.',
      connectionMethod: 'REST API + WebSocket — Long-lived access token authenticates REST calls. WebSocket provides real-time state change events.',
      apiConfig: [
        { label: 'Instance URL', value: 'http://homeassistant.local:8123' },
        { label: 'Access Token', value: 'eyJ••••••••••••••••••••', masked: true },
        { label: 'Webhook ID', value: 'energy_dash_webhook_01' },
      ],
      settings: [
        { label: 'Sync Entities', value: 'climate, sensor, binary_sensor', type: 'text' },
        { label: 'Event Forwarding', value: 'Enabled', type: 'toggle' },
        { label: 'State Poll Interval', value: '120s', type: 'text' },
        { label: 'Automation Triggers', value: 'Enabled', type: 'toggle' },
      ],
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {integrations.filter(i => i.status === 'connected').length}/{integrations.length} Connected
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isExpanded = expandedId === integration.id;

          return (
            <div
              key={integration.id}
              className={`bg-card border rounded-xl shadow-sm overflow-hidden transition-all ${
                integration.featured ? 'border-primary/40' : 'border-border'
              }`}
            >
              {/* Header Row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(integration.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${integration.featured ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${integration.featured ? 'text-primary' : 'text-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {integration.name}
                      {integration.featured && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    integration.status === 'connected'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    <Wifi className="h-3 w-3 mr-1" />
                    {integration.status}
                  </span>
                  {integration.detailsPath && (
                    <Link
                      to={integration.detailsPath}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center px-3 py-1 border border-primary/40 text-xs font-medium rounded text-primary bg-card hover:bg-primary/5"
                    >
                      Live View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Description */}
                  <div className="px-4 py-3 bg-muted/20">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>

                  {/* Connection Method */}
                  <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Connection Method</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{integration.connectionMethod}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                    {/* API Configuration */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="h-4 w-4 text-primary" />
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">API Configuration</h4>
                      </div>
                      <div className="space-y-2 ml-6">
                        {integration.apiConfig.map((config) => (
                          <div key={config.label} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{config.label}</span>
                            <code className={`text-xs px-2 py-0.5 rounded bg-muted font-mono ${config.masked ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {config.value}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-4 w-4 text-primary" />
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Settings</h4>
                      </div>
                      <div className="space-y-2 ml-6">
                        {integration.settings.map((setting) => (
                          <div key={setting.label} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{setting.label}</span>
                            {setting.type === 'toggle' ? (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                setting.value === 'Enabled'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {setting.value}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-foreground">{setting.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3" />
                      <span>Last sync: {integration.lastSync}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-foreground bg-card hover:bg-muted transition-colors">
                        Test Connection
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-foreground bg-card hover:bg-muted transition-colors">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System Architecture Note */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Data Flow Architecture</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <span className="font-medium text-foreground">Device → Broker → Backend → Database</span> — All IoT devices publish readings via MQTT to the central Mosquitto broker. The Node.js backend subscribes to relevant topics, processes and validates data, then persists to PostgreSQL with TimescaleDB for time-series queries.
          </p>
          <p>
            <span className="font-medium text-foreground">Cloud Sync</span> — Telemetry is forwarded to AWS IoT Core for long-term archival (S3), real-time anomaly detection (Lambda), and push notifications (SNS → mobile/email).
          </p>
          <p>
            <span className="font-medium text-foreground">Alert Pipeline</span> — Threshold violations and ML-detected anomalies create alerts stored in PostgreSQL, surfaced in the dashboard, and optionally pushed via SMS/email through AWS SNS.
          </p>
        </div>
      </div>
    </div>
  );
}
