import { useState } from 'react';
import { Activity, Wifi, Shield, ExternalLink, Radio, Cloud, ChevronDown, ChevronUp, Key, Globe, RefreshCw, Settings, CheckCircle2 } from 'lucide-react';
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
      description: 'Connects to UniFi OS Console running Protect (NVR/cameras) and smart sensors (leak, door/window contact, motion, temperature/humidity). Uses the unifi-protect npm library — the most mature open-source implementation of the Protect API, actively maintained and used by thousands via homebridge-unifi-protect. Auth is cookie-based session via local admin credentials (exempt from Ubiquiti MFA requirements). WebSocket provides real-time binary-encoded event stream.',
      connectionMethod: 'Local Admin Auth + WebSocket — POST /api/auth/login with local admin credentials returns session cookie. GET /proxy/protect/api/bootstrap returns full system state (all cameras, sensors, NVR config). WebSocket at wss://{host}/proxy/protect/ws/updates?lastUpdateId={id} streams binary-framed event packets (motion, ring, leak, contact state changes). Library: unifi-protect (npm). Requires direct network access to UniFi OS Console.',
      apiConfig: [
        { label: 'Console Address', value: 'https://192.168.1.1' },
        { label: 'Local Admin User', value: 'protect_readonly' },
        { label: 'Local Admin Password', value: '••••••••••••', masked: true },
        { label: 'Auth Endpoint', value: 'POST /api/auth/login' },
        { label: 'Bootstrap', value: 'GET /proxy/protect/api/bootstrap' },
        { label: 'Events WebSocket', value: 'wss://.../proxy/protect/ws/updates' },
      ],
      settings: [
        { label: 'Motion Event Subscription', value: 'Enabled', type: 'toggle' },
        { label: 'Leak Sensor Alerts', value: 'Enabled', type: 'toggle' },
        { label: 'Contact Sensor (Door/Window)', value: 'Enabled', type: 'toggle' },
        { label: 'WebSocket Auto-Reconnect', value: 'Enabled (5s exp. backoff)', type: 'text' },
        { label: 'Bootstrap Refresh Interval', value: '5 min', type: 'text' },
      ],
    },
    {
      id: 'shelly',
      name: 'Shelly Gen2 Energy Monitors',
      status: 'connected',
      lastSync: '15 seconds ago',
      icon: Activity,
      description: 'Shelly EM (single-phase, CT clamp, per-unit breaker panel) and Shelly Pro 3EM (three-phase, building main panel) devices. Gen2 firmware uses MQTT with RPC-over-MQTT protocol. Devices publish NotifyStatus and NotifyEvent payloads containing instantaneous power (W), voltage (V), current (A), power factor, and cumulative energy (Wh). Each device connects to the MQTT broker over WiFi with configurable topic prefix.',
      connectionMethod: 'Gen2 MQTT RPC Protocol — Each Shelly device connects to MQTT broker as a client. Publishes: {topic_prefix}/events/rpc (NotifyStatus, NotifyEvent), {topic_prefix}/status/em:0 (full EM component state on significant change). Subscribe to {topic_prefix}/rpc to send commands. QoS 1 guaranteed delivery. Device firmware handles reconnection. Documented at shelly-api-docs.shelly.cloud/gen2.',
      apiConfig: [
        { label: 'MQTT Broker', value: 'mqtt://192.168.1.10:1883' },
        { label: 'Notification Topic', value: '{topic_prefix}/events/rpc' },
        { label: 'Status Topic', value: '{topic_prefix}/status/em:0' },
        { label: 'Command Topic', value: '{topic_prefix}/rpc' },
        { label: 'Broker Username', value: 'shelly_svc' },
        { label: 'Broker Password', value: '••••••••', masked: true },
      ],
      settings: [
        { label: 'status_ntf (publish full status)', value: 'Enabled', type: 'toggle' },
        { label: 'rpc_ntf (publish RPC events)', value: 'Enabled', type: 'toggle' },
        { label: 'QoS Level', value: '1', type: 'text' },
        { label: 'High Power Alert Threshold', value: '500W', type: 'text' },
        { label: 'Firmware Auto-Update', value: 'Disabled', type: 'toggle' },
      ],
    },
    {
      id: 'water-sensors',
      name: 'Dragino LoRaWAN Water Sensors',
      status: 'connected',
      lastSync: '45 seconds ago',
      icon: Activity,
      description: 'Dragino SW3L (pipe-mount pulse counter) and S31-LB (inline flow) sensors measure water consumption. Communicate via LoRaWAN Class A to a Dragino LPS8N gateway on-site. Gateway runs ChirpStack Concentratord + MQTT Forwarder. ChirpStack v4 Network Server handles join, decryption, and payload decoding via JavaScript codec. Decoded JSON published to MQTT. Battery-powered sensors last 5+ years on 2x AA.',
      connectionMethod: 'LoRaWAN → ChirpStack v4 → MQTT — Sensor uplinks arrive at gateway via LoRa radio (US915 band). ChirpStack MQTT Forwarder on gateway publishes raw frames to ChirpStack NS. NS handles OTAA join, frame decryption, deduplication, and runs device codec (JavaScript). Decoded payload published to: application/{APPLICATION_ID}/device/{DEV_EUI}/event/up. Topic structure per ChirpStack v4 docs.',
      apiConfig: [
        { label: 'ChirpStack URL', value: 'http://192.168.1.10:8080' },
        { label: 'MQTT Event Topic', value: 'application/{app_id}/device/+/event/up' },
        { label: 'LoRaWAN Band', value: 'US915' },
        { label: 'Join Type', value: 'OTAA' },
        { label: 'App Key', value: '••••••••••••••••••••••••••••••••', masked: true },
      ],
      settings: [
        { label: 'Uplink Interval', value: '10 min (configurable via downlink)', type: 'text' },
        { label: 'Alarm: Continuous Flow', value: '> 0.1 GPM for 30 min', type: 'text' },
        { label: 'High Volume Alert', value: '> 50 gal/hr', type: 'text' },
        { label: 'Low Battery Alert (< 2.8V)', value: 'Enabled', type: 'toggle' },
        { label: 'Decoder Codec', value: 'dragino_sw3l_v1.js', type: 'text' },
      ],
    },
    {
      id: 'mqtt',
      name: 'Eclipse Mosquitto Broker',
      status: 'connected',
      lastSync: '5 seconds ago',
      icon: Radio,
      description: 'Eclipse Mosquitto v2 is the central MQTT message broker. All device telemetry routes through here: Shelly devices connect as MQTT clients, ChirpStack publishes decoded LoRaWAN payloads, and the Node.js backend subscribes to process and store data. Runs as a Docker container in the local stack. Configured with username/password auth and per-client ACL for topic isolation.',
      connectionMethod: 'MQTT v5 over TCP (port 1883) and TLS (port 8883) — Backend connects with persistent session (Clean Start = false) so messages queue during brief disconnects. QoS 1 subscriptions ensure at-least-once delivery. WebSocket on port 9001 for browser-based MQTT debugging tools. ACL file restricts which clients can publish/subscribe to which topics.',
      apiConfig: [
        { label: 'TCP Address', value: 'mqtt://192.168.1.10:1883' },
        { label: 'TLS Address', value: 'mqtts://192.168.1.10:8883' },
        { label: 'WebSocket', value: 'ws://192.168.1.10:9001' },
        { label: 'Backend Client ID', value: 'energy-dash-backend-01' },
        { label: 'Username', value: 'backend_svc' },
        { label: 'Password', value: '••••••••', masked: true },
      ],
      settings: [
        { label: 'Protocol Version', value: 'MQTT v5', type: 'text' },
        { label: 'Persistent Session', value: 'Enabled', type: 'toggle' },
        { label: 'Keep Alive', value: '60s', type: 'text' },
        { label: 'ACL Enforcement', value: 'Enabled', type: 'toggle' },
        { label: 'Message Expiry Interval', value: '86400s (24h)', type: 'text' },
      ],
    },
    {
      id: 'aws-iot',
      name: 'AWS IoT Core',
      status: 'connected',
      lastSync: 'Just now',
      icon: Cloud,
      description: 'Cloud telemetry archival and alerting. Mosquitto is configured as an MQTT bridge to forward selected topics to AWS IoT Core. IoT Rules (SQL-based) route messages to: Kinesis Data Firehose → S3 (long-term storage), Lambda (anomaly detection), and SNS (email/SMS push alerts). Device Shadows store last-known device state for reconciliation after outages.',
      connectionMethod: 'Mosquitto MQTT Bridge → AWS IoT Core (TLS port 8883) — Bridge authenticates with X.509 device certificate provisioned via AWS IoT. Only specific topic patterns are forwarded (configured in mosquitto.conf bridge section). IoT Core receives messages and applies Rules Engine with SQL-like WHERE clauses to fan out to AWS services.',
      apiConfig: [
        { label: 'IoT Endpoint', value: 'a1b2c3d4e5-ats.iot.us-west-2.amazonaws.com' },
        { label: 'Region', value: 'us-west-2' },
        { label: 'Auth Method', value: 'X.509 Device Certificate' },
        { label: 'Certificate ARN', value: 'arn:aws:iot:us-west-2:••••:cert/...', masked: true },
        { label: 'Bridge Topics', value: 'shelly/+/status/#, application/+/device/+/event/up' },
      ],
      settings: [
        { label: 'Rule: Firehose → S3 Archival', value: 'Enabled', type: 'toggle' },
        { label: 'Rule: Lambda Anomaly Detection', value: 'Enabled', type: 'toggle' },
        { label: 'Rule: SNS Push Alerts', value: 'Enabled', type: 'toggle' },
        { label: 'Device Shadow Sync', value: 'Enabled', type: 'toggle' },
        { label: 'S3 Data Retention', value: '90 days', type: 'select' },
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
            <span className="font-medium text-foreground">Electric Monitoring (Shelly → MQTT → Backend → PostgreSQL)</span>
            <p className="mt-1">Shelly Gen2 devices (EM per unit, Pro 3EM per building panel) connect to the Mosquitto broker over WiFi using the Gen2 RPC-over-MQTT protocol. They publish NotifyStatus events with power, voltage, and energy data. The Node.js backend subscribes to these topics and writes time-series data to PostgreSQL with TimescaleDB extension for efficient range queries.</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Water Monitoring (Dragino → LoRa → Gateway → ChirpStack → MQTT → Backend)</span>
            <p className="mt-1">Battery-powered Dragino flow sensors transmit via LoRa radio (US915) to a local LPS8N gateway. The gateway runs ChirpStack MQTT Forwarder, forwarding raw LoRaWAN frames to ChirpStack v4 Network Server. ChirpStack handles OTAA join, decryption, deduplication, and applies a JavaScript codec to decode binary payloads into JSON (flow rate, total volume, battery voltage). Decoded data is published to MQTT and consumed by the backend.</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Security & Sensors (UniFi Protect → Local REST + WebSocket → Backend)</span>
            <p className="mt-1">The backend uses the unifi-protect npm library to authenticate with the UniFi OS Console via local admin credentials (cookie-based session). It fetches the bootstrap (full system state), then maintains a persistent WebSocket connection receiving binary-encoded real-time events (motion, leak detection, door contact changes). Events are correlated with utility data for smart alerts (e.g., leak sensor trigger + water flow spike = confirmed leak).</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Cloud Archival & Alerting (Mosquitto Bridge → AWS IoT Core → S3/Lambda/SNS)</span>
            <p className="mt-1">Mosquitto is configured with a bridge connection to forward selected MQTT topics to AWS IoT Core over TLS (X.509 cert auth). IoT Rules Engine applies SQL-like filters to route data: Kinesis Data Firehose → S3 for long-term archival, Lambda for anomaly detection, and SNS for push notifications (email/SMS). Device Shadows maintain last-known state for offline reconciliation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
