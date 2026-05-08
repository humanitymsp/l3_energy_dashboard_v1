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
      name: 'UniFi Protect & Sensors',
      status: 'connected',
      lastSync: '30 seconds ago',
      detailsPath: '/integrations/unifi',
      featured: true,
      icon: Shield,
      description: 'Connects to the UniFi OS Console running Protect (NVR/cameras) and sensor devices (leak, contact, motion, temperature). Uses the reverse-engineered Protect REST API with WebSocket event streaming for real-time alerts. The unifi-protect npm library provides TypeScript bindings. Bootstrap endpoint returns full system state; WebSocket delivers binary-framed event packets for motion, doorbell, and sensor triggers.',
      connectionMethod: 'REST + WebSocket (Local Network) — Cookie-based session auth with CSRF token via POST /api/auth/login on UniFi OS Console. After login, GET /proxy/protect/api/bootstrap retrieves full device state. WebSocket at wss://{host}/proxy/protect/ws/updates streams real-time events using a binary header+payload protocol.',
      apiConfig: [
        { label: 'Controller URL', value: 'https://192.168.1.1' },
        { label: 'Username', value: 'protect_svc' },
        { label: 'Password', value: '••••••••••••', masked: true },
        { label: 'Bootstrap Endpoint', value: '/proxy/protect/api/bootstrap' },
        { label: 'WebSocket URL', value: 'wss://192.168.1.1/proxy/protect/ws/updates' },
      ],
      settings: [
        { label: 'Enable Motion Events', value: 'Enabled', type: 'toggle' },
        { label: 'Enable Leak Alerts', value: 'Enabled', type: 'toggle' },
        { label: 'WebSocket Reconnect', value: 'Auto (5s backoff)', type: 'text' },
        { label: 'Event Correlation Window', value: '60s', type: 'text' },
        { label: 'Camera Snapshot Retention', value: '7 days', type: 'select' },
      ],
    },
    {
      id: 'shelly',
      name: 'Shelly Gen2 Energy Monitors',
      status: 'connected',
      lastSync: '15 seconds ago',
      icon: Activity,
      description: 'Shelly EM (single-phase, per-unit) and Pro 3EM (three-phase, building main panel) devices report real-time energy consumption via Gen2 MQTT RPC protocol. Devices publish RPC notifications (NotifyStatus events) containing instantaneous power (W), voltage (V), current (A), power factor, and cumulative energy (kWh). Status updates publish to {device_id}/status/em:0 with full electrical readings.',
      connectionMethod: 'MQTT Gen2 RPC — Devices connect directly to MQTT broker. RPC notifications publish to {device_id}/events/rpc (QoS 1). Component status publishes to {device_id}/status/em:0 on significant change. Commands sent via {device_id}/rpc request topic. Supports mTLS with client certificates.',
      apiConfig: [
        { label: 'MQTT Broker', value: 'mqtt://broker.local:1883' },
        { label: 'RPC Topic Pattern', value: '{device_id}/events/rpc' },
        { label: 'Status Topic Pattern', value: '{device_id}/status/em:0' },
        { label: 'Auth User', value: 'shelly_svc' },
        { label: 'Auth Password', value: '••••••••', masked: true },
        { label: 'QoS Level', value: '1' },
      ],
      settings: [
        { label: 'Status Notifications (status_ntf)', value: 'Enabled', type: 'toggle' },
        { label: 'RPC Notifications (rpc_ntf)', value: 'Enabled', type: 'toggle' },
        { label: 'Power Threshold Alert', value: '500W', type: 'text' },
        { label: 'mTLS Client Certs', value: 'Disabled', type: 'toggle' },
        { label: 'Auto-Discovery', value: 'Enabled', type: 'toggle' },
      ],
    },
    {
      id: 'water-sensors',
      name: 'LoRaWAN Water Flow Sensors',
      status: 'connected',
      lastSync: '45 seconds ago',
      icon: Activity,
      description: 'Dragino SW3L outdoor flow sensors and FM100 inline meters measure water consumption per unit and at building mains. Sensors transmit via LoRaWAN to a local Dragino LPS8N gateway running ChirpStack MQTT Forwarder. ChirpStack Network Server decodes payloads and publishes decoded JSON to MQTT. Battery-powered with 5+ year life. Leak detection inferred from continuous flow analysis.',
      connectionMethod: 'LoRaWAN → ChirpStack → MQTT — Sensors transmit at configurable intervals (default 10min, alarm on continuous flow). Dragino gateway forwards packets to ChirpStack v4 via MQTT Forwarder. ChirpStack decodes LoRaWAN frames, runs JavaScript codec, and publishes to application/{app_id}/device/{dev_eui}/event/up.',
      apiConfig: [
        { label: 'ChirpStack Server', value: 'http://192.168.1.50:8080' },
        { label: 'MQTT Topic', value: 'application/1/device/+/event/up' },
        { label: 'Gateway EUI', value: 'A840411EDC284E50' },
        { label: 'Network Key', value: '••••••••••••••••', masked: true },
        { label: 'App Key', value: '••••••••••••••••', masked: true },
      ],
      settings: [
        { label: 'Uplink Interval', value: '10 min', type: 'text' },
        { label: 'Continuous Flow Alert', value: '> 0.1 GPM for 30 min', type: 'text' },
        { label: 'Gallons Alert Threshold', value: '50 gal/hr', type: 'text' },
        { label: 'Battery Low Alert (< 3.0V)', value: 'Enabled', type: 'toggle' },
        { label: 'Codec Function', value: 'dragino_sw3l_decoder.js', type: 'text' },
      ],
    },
    {
      id: 'mqtt',
      name: 'Eclipse Mosquitto MQTT Broker',
      status: 'connected',
      lastSync: '5 seconds ago',
      icon: Radio,
      description: 'Central Eclipse Mosquitto v2 message broker that routes all IoT device telemetry. Shelly devices, ChirpStack (water sensors), and Home Assistant all publish here. The Node.js backend maintains persistent subscriptions and writes time-series data to PostgreSQL/TimescaleDB. Supports MQTT v5 shared subscriptions for horizontal scaling of backend workers.',
      connectionMethod: 'MQTT v5 over TCP (1883) and TLS (8883) — Backend uses persistent sessions with QoS 1 subscriptions. WebSocket port (9001) available for browser-based debugging. ACL file restricts per-client topic access.',
      apiConfig: [
        { label: 'Broker Address', value: 'mqtt://localhost:1883' },
        { label: 'TLS Port', value: '8883' },
        { label: 'WebSocket Port', value: '9001' },
        { label: 'Client ID', value: 'energy-dash-backend-01' },
        { label: 'Username', value: 'backend_svc' },
        { label: 'Password', value: '••••••••', masked: true },
        { label: 'ACL File', value: '/mosquitto/config/acl.conf' },
      ],
      settings: [
        { label: 'Protocol Version', value: 'MQTT v5', type: 'text' },
        { label: 'Max Reconnect Attempts', value: '∞ (exponential backoff)', type: 'text' },
        { label: 'Keep Alive Interval', value: '60s', type: 'text' },
        { label: 'Clean Start', value: 'Disabled', type: 'toggle' },
        { label: 'Message Expiry', value: '24 hours', type: 'select' },
      ],
    },
    {
      id: 'aws-iot',
      name: 'AWS IoT Core',
      status: 'connected',
      lastSync: 'Just now',
      icon: Cloud,
      description: 'Cloud-side ingestion for device telemetry. Local Mosquitto broker bridges selected topics to AWS IoT Core via MQTT bridge. IoT Rules route messages to Kinesis Data Firehose (→ S3 for archival), Lambda (anomaly detection), and SNS (push alerts). Device Shadows maintain last-known state for offline reconciliation. Fleet Indexing enables cross-device queries.',
      connectionMethod: 'MQTT Bridge over TLS (Port 8883) — Mosquitto bridge config authenticates via X.509 device certificate. Only selected topics are forwarded (e.g., shelly/+/status/em:0, application/+/device/+/event/up). IoT Rules engine processes with SQL-like syntax.',
      apiConfig: [
        { label: 'Endpoint', value: 'a1b2c3d4e5-ats.iot.us-west-2.amazonaws.com' },
        { label: 'Region', value: 'us-west-2' },
        { label: 'Thing Group', value: 'energy-dash-devices' },
        { label: 'Certificate ARN', value: 'arn:aws:iot:us-west-2:••••:cert/abc123', masked: true },
        { label: 'Bridge Topic Filter', value: 'shelly/+/status/#, application/+/device/+/event/up' },
        { label: 'IoT Policy', value: 'EnergyDashBridgePolicy' },
      ],
      settings: [
        { label: 'Device Shadow Sync', value: 'Enabled', type: 'toggle' },
        { label: 'Rule: Firehose → S3', value: 'Active', type: 'toggle' },
        { label: 'Rule: Lambda Anomaly', value: 'Active', type: 'toggle' },
        { label: 'Rule: SNS Alerts', value: 'Active', type: 'toggle' },
        { label: 'S3 Retention', value: '90 days', type: 'select' },
        { label: 'Fleet Indexing', value: 'Enabled', type: 'toggle' },
      ],
    },
    {
      id: 'speed-queen',
      name: 'Speed Queen Insights',
      status: 'connected',
      lastSync: '5 minutes ago',
      icon: Server,
      description: 'Speed Queen Insights cloud platform provides laundry machine telemetry, revenue data, and maintenance alerts for multi-housing laundry rooms. Connected machines report cycle counts, revenue per machine, error codes, and availability status. Data is pulled via the Insights web portal API using session-based authentication.',
      connectionMethod: 'HTTPS REST API (Cloud) — Session-based auth to Speed Queen Insights portal (insights.speedqueen.com). Polling at 5-minute intervals retrieves machine status, daily revenue reports, and maintenance alerts. No official public API — uses authenticated portal endpoints.',
      apiConfig: [
        { label: 'Portal URL', value: 'https://insights.speedqueen.com' },
        { label: 'Account Email', value: 'ops@sabincdc.org' },
        { label: 'Password', value: '••••••••••••', masked: true },
        { label: 'Location ID', value: 'LOC-••••', masked: true },
        { label: 'Poll Interval', value: '5 min' },
      ],
      settings: [
        { label: 'Revenue Sync', value: 'Enabled', type: 'toggle' },
        { label: 'Machine Status Alerts', value: 'Enabled', type: 'toggle' },
        { label: 'Error Code Forwarding', value: 'Enabled', type: 'toggle' },
        { label: 'Daily Revenue Report', value: '6:00 AM', type: 'text' },
        { label: 'Out-of-Service Alert', value: '> 2 hours', type: 'text' },
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
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">System Architecture</h3>
        <div className="text-sm text-muted-foreground space-y-3">
          <div>
            <span className="font-medium text-foreground">Electric Monitoring (Shelly → MQTT → Backend)</span>
            <p className="mt-1">Shelly Gen2 devices (EM per unit, Pro 3EM per building panel) connect to the Mosquitto broker over WiFi. They publish RPC notifications and status updates containing real-time power, voltage, and energy readings. The Node.js backend subscribes to these topics and writes to PostgreSQL/TimescaleDB.</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Water Monitoring (Dragino → LoRaWAN → ChirpStack → MQTT → Backend)</span>
            <p className="mt-1">Battery-powered Dragino flow sensors transmit via LoRa radio to a local LPS8N gateway. The gateway runs ChirpStack MQTT Forwarder, which passes packets to ChirpStack Network Server for LoRaWAN decoding. Decoded payloads (flow rate, total volume) are published to MQTT and consumed by the backend.</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Security & Sensors (UniFi Protect → REST/WebSocket → Backend)</span>
            <p className="mt-1">The backend authenticates with the UniFi OS Console via cookie-based session, fetches bootstrap state, then maintains a WebSocket connection for real-time events (motion, leak, contact, temperature). Events are correlated with utility data for smart alerts (e.g., leak sensor + water spike = confirmed leak).</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Laundry Revenue (Speed Queen Insights → HTTPS → Backend)</span>
            <p className="mt-1">Backend polls the Speed Queen Insights portal at 5-minute intervals for machine status and revenue data. Daily revenue reports and maintenance alerts are synced into the dashboard database.</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Cloud Sync & Alerting (Mosquitto Bridge → AWS IoT Core)</span>
            <p className="mt-1">Mosquitto bridges selected MQTT topics to AWS IoT Core over TLS with X.509 cert auth. IoT Rules route to Kinesis Firehose (S3 archival), Lambda (anomaly detection), and SNS (push notifications via email/SMS). Device Shadows maintain last-known state for offline devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
