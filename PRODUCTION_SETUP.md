# Production Integration Setup Guide

This guide explains how to integrate real Shelly devices, Ecodirect sensors, and UniFi systems with the Energy Dashboard.

## 🔌 Integration Architecture

The dashboard now supports **true production integrations** with:

1. **Shelly Devices** - Electric monitoring (EM, Pro 3EM, Plus 1PM)
2. **Ecodirect Sensors** - Water monitoring and leak detection
3. **UniFi Protect & AlarmHub** - Cameras, leak sensors, motion detection

## 📋 Prerequisites

### Shelly Devices
- Shelly EM or Shelly Pro 3EM devices installed
- Devices connected to your local network
- Static IP addresses assigned to each device
- Gen2 firmware (for API compatibility)

### Ecodirect Sensors
- Ecodirect water sensors installed
- API access credentials from Ecodirect
- Sensors registered in Ecodirect cloud platform

### UniFi Systems
- UniFi Protect NVR or Cloud Key
- UniFi AlarmHub (optional, for leak sensors)
- Admin credentials for API access
- Network access to UniFi controller

## 🛠️ Configuration Steps

### Step 1: Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
# Ecodirect
ECODIRECT_API_URL=https://api.ecodirect.com
ECODIRECT_API_KEY=your_actual_api_key_here

# UniFi
UNIFI_PROTECT_URL=https://192.168.1.10  # Your UniFi Protect IP
UNIFI_ALARM_HUB_URL=https://192.168.1.11  # Your AlarmHub IP (if separate)
UNIFI_USERNAME=admin
UNIFI_PASSWORD=your_password
```

### Step 2: Configure Devices

Edit `backend/devices.json` with your actual device information:

#### Shelly Devices

For each Shelly device, add an entry:

```json
{
  "id": "shelly-unique-id",
  "type": "shelly_em" | "shelly_pro_3em" | "shelly_plus_1pm",
  "name": "Descriptive Name",
  "host": "192.168.1.XXX",  // Device IP address
  "property_id": "prop-001",
  "building_id": "bldg-001",  // Optional
  "unit_id": "unit-101",      // Optional
  "location": "Location Description"
}
```

**Finding Shelly Device IPs:**
1. Open Shelly app on your phone
2. Go to device settings
3. Note the IP address
4. Assign static IP in your router

**Testing Shelly Connection:**
```bash
curl http://192.168.1.XXX/rpc/Shelly.GetDeviceInfo
```

#### Ecodirect Sensors

For each Ecodirect sensor, add:

```json
{
  "id": "ecodirect-unique-id",
  "serial_number": "EC-XXXXX",  // From Ecodirect dashboard
  "name": "Descriptive Name",
  "property_id": "prop-001",
  "building_id": "bldg-001",
  "unit_id": "unit-101",
  "location": "Location Description",
  "device_type": "water_meter" | "water_sensor"
}
```

**Getting Ecodirect API Key:**
1. Log into Ecodirect dashboard
2. Go to Settings → API Access
3. Generate new API key
4. Copy to `.env` file

### Step 3: Update Backend to Use Real Data

The integration clients are ready. To switch from mock data to real data:

**Edit `backend/src/index.ts`:**

```typescript
import { ShellyClient } from './integrations/shelly';
import { EcodirectClient } from './integrations/ecodirect';
import { UniFiClient } from './integrations/unifi';
import * as devicesConfig from '../devices.json';

// Initialize clients
const shellyClient = new ShellyClient(devicesConfig.shelly_devices);
const ecodirectClient = new EcodirectClient(
  process.env.ECODIRECT_API_URL!,
  process.env.ECODIRECT_API_KEY!,
  devicesConfig.ecodirect_devices
);
const unifiClient = new UniFiClient({
  protectUrl: process.env.UNIFI_PROTECT_URL!,
  alarmHubUrl: process.env.UNIFI_ALARM_HUB_URL,
  username: process.env.UNIFI_USERNAME!,
  password: process.env.UNIFI_PASSWORD!,
});

// Authenticate UniFi
await unifiClient.authenticate();

// Replace mock device endpoint with real data
app.get('/api/devices', async (req, res) => {
  try {
    const [shellyReadings, ecodirectReadings, leakSensors] = await Promise.all([
      shellyClient.getAllDeviceStatuses(),
      ecodirectClient.getAllDeviceReadings(),
      unifiClient.getLeakSensors(),
    ]);

    // Combine and format data
    const devices = [
      ...shellyReadings.map(r => ({
        id: r.device_id,
        type: 'shelly',
        ...r,
        status: 'online',
      })),
      ...ecodirectReadings.map(r => ({
        id: r.device_id,
        type: 'ecodirect',
        ...r,
        status: 'online',
        alert: r.alerts.length > 0 ? r.alerts.join(', ') : undefined,
      })),
      ...leakSensors.map(s => ({
        id: s.id,
        type: 'unifi_leak_sensor',
        ...s,
        status: s.battery_level > 10 ? 'online' : 'low_battery',
        alert: s.is_leak_detected ? 'Leak detected' : undefined,
      })),
    ];

    res.json({ devices, summary: {...} });
  } catch (error) {
    logger.error('Failed to get devices', { error });
    res.status(500).json({ error: 'Failed to fetch device data' });
  }
});
```

### Step 4: Set Up Real-Time Updates

For live data updates, set up polling or WebSocket connections:

```typescript
// Poll Shelly devices every 5 seconds
setInterval(async () => {
  const readings = await shellyClient.getAllDeviceStatuses();
  // Store in database or cache
}, 5000);

// Connect to UniFi WebSocket for real-time events
unifiClient.connectWebSocket((event) => {
  console.log('UniFi event:', event);
  // Process motion events, leak alerts, etc.
});
```

### Step 5: Database Integration

Store readings in PostgreSQL for historical data:

```sql
CREATE TABLE device_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_device_readings_device_id ON device_readings(device_id);
CREATE INDEX idx_device_readings_timestamp ON device_readings(timestamp);
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use AWS Secrets Manager** for production credentials
3. **Enable HTTPS** for all API connections
4. **Rotate API keys** regularly
5. **Use VPN** if accessing devices remotely
6. **Implement rate limiting** on API endpoints

## 📊 Data Flow

```
Shelly Devices → HTTP API → Backend → PostgreSQL → Frontend
Ecodirect Cloud → REST API → Backend → PostgreSQL → Frontend
UniFi Protect → WebSocket → Backend → PostgreSQL → Frontend
```

## 🧪 Testing Integration

### Test Shelly Connection
```bash
curl http://localhost:4000/api/devices?type=shelly
```

### Test Ecodirect Connection
```bash
curl http://localhost:4000/api/devices?type=ecodirect
```

### Test UniFi Connection
```bash
curl http://localhost:4000/api/unifi/leak-sensors
```

## 🚨 Troubleshooting

### Shelly Devices Not Responding
- Check device IP addresses
- Verify devices are on same network
- Ensure Gen2 firmware is installed
- Check firewall rules

### Ecodirect API Errors
- Verify API key is correct
- Check API rate limits
- Ensure sensors are online in Ecodirect dashboard

### UniFi Authentication Failed
- Verify username/password
- Check UniFi Protect version (requires v2.0+)
- Ensure API access is enabled in UniFi settings
- Try accessing UniFi web interface manually

## 📈 Production Deployment

When deploying to production:

1. **Use AWS Lambda** for serverless backend
2. **Store credentials** in AWS Secrets Manager
3. **Use RDS PostgreSQL** for database
4. **Enable CloudWatch** logging
5. **Set up alarms** for device offline status
6. **Configure auto-scaling** for API Gateway

## 🔄 Migration from Mock to Real Data

The system is designed to work with both mock and real data:

- **Development**: Uses mock data from `backend/src/index.ts`
- **Production**: Uses real integrations from `backend/src/integrations/`

To switch:
1. Set `NODE_ENV=production` in `.env`
2. Configure all device credentials
3. Update API endpoints to use integration clients
4. Test thoroughly before going live

## 📞 Support

For integration issues:
- **Shelly**: https://shelly-api-docs.shelly.cloud/
- **Ecodirect**: Contact your Ecodirect representative
- **UniFi**: https://ubntwiki.com/products/software/unifi-protect
