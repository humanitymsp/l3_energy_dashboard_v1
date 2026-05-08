import { Zap, Droplet, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const mockDevices = [
  { id: 'shelly-main-001', property_id: 'prop-001', building_id: 'bldg-001', type: 'shelly_pro_3em', name: 'Sunset Apartments - Building A Main Panel', location: 'Electrical Room', status: 'online', current_power_kw: 28.4, voltage_l1: 120.2, voltage_l2: 119.8, voltage_l3: 120.5, power_factor: 0.92, total_kwh_today: 356.8 },
  { id: 'shelly-main-002', property_id: 'prop-001', building_id: 'bldg-002', type: 'shelly_pro_3em', name: 'Sunset Apartments - Building B Main Panel', location: 'Electrical Room', status: 'online', current_power_kw: 32.2, voltage_l1: 119.9, voltage_l2: 120.3, voltage_l3: 120.1, power_factor: 0.89, total_kwh_today: 398.3 },
  { id: 'shelly-main-003', property_id: 'prop-002', building_id: 'bldg-003', type: 'shelly_pro_3em', name: 'Riverside Complex - Building C Main Panel', location: 'Electrical Room', status: 'online', current_power_kw: 42.8, voltage_l1: 120.1, voltage_l2: 119.7, voltage_l3: 120.4, power_factor: 0.91, total_kwh_today: 512.6 },
  { id: 'shelly-unit-101', property_id: 'prop-001', building_id: 'bldg-001', unit_id: 'unit-101', type: 'shelly_em', name: 'Unit 101 - Electric Monitor', location: 'Unit Breaker Panel', status: 'online', current_power_kw: 0.8, total_kwh_today: 12.4 },
  { id: 'shelly-unit-102', property_id: 'prop-001', building_id: 'bldg-001', unit_id: 'unit-102', type: 'shelly_em', name: 'Unit 102 - Electric Monitor', location: 'Unit Breaker Panel', status: 'online', current_power_kw: 1.2, total_kwh_today: 15.8 },
  { id: 'shelly-unit-103', property_id: 'prop-001', building_id: 'bldg-001', unit_id: 'unit-103', type: 'shelly_em', name: 'Unit 103 - Electric Monitor', location: 'Unit Breaker Panel', status: 'online', current_power_kw: 2.1, total_kwh_today: 18.2, alert: 'Usage 45% above baseline for 3 consecutive days' },
  { id: 'shelly-unit-205', property_id: 'prop-001', building_id: 'bldg-001', unit_id: 'unit-205', type: 'shelly_em', name: 'Unit 205 - Electric Monitor', location: 'Unit Breaker Panel', status: 'online', current_power_kw: 4.2, total_kwh_today: 28.9, alert: 'Peak usage at 2-4 AM - possible unauthorized equipment' },
  { id: 'eco-main-001', property_id: 'prop-001', building_id: 'bldg-001', type: 'ecodirect_water', name: 'Building A - Main Water Line', location: 'Mechanical Room', status: 'online', current_flow_gpm: 4.2, total_gallons_today: 1850, pressure_psi: 62, temperature_f: 55 },
  { id: 'eco-main-002', property_id: 'prop-001', building_id: 'bldg-002', type: 'ecodirect_water', name: 'Building B - Main Water Line', location: 'Mechanical Room', status: 'online', current_flow_gpm: 3.8, total_gallons_today: 1720, pressure_psi: 60, temperature_f: 54 },
  { id: 'eco-unit-101', property_id: 'prop-001', building_id: 'bldg-001', unit_id: 'unit-101', type: 'ecodirect_water', name: 'Unit 101 - Water Monitor', location: 'Unit Water Closet', status: 'online', current_flow_gpm: 2.1, total_gallons_today: 450, pressure_psi: 58, alert: 'Flow spike 320% - possible leak in vacant unit' },
  { id: 'eco-unit-304', property_id: 'prop-002', building_id: 'bldg-003', unit_id: 'unit-304', type: 'ecodirect_water', name: 'Unit 304 - Water Monitor', location: 'Unit Water Closet', status: 'online', current_flow_gpm: 0.3, total_gallons_today: 324, pressure_psi: 59, alert: 'Continuous flow detected - possible running toilet' },
  { id: 'eco-irrigation-001', property_id: 'prop-002', building_id: 'bldg-003', type: 'ecodirect_water', name: 'Riverside Complex - Irrigation System', location: 'Irrigation Control Room', status: 'online', current_flow_gpm: 12.8, total_gallons_today: 2840, pressure_psi: 65, alert: 'Usage 180% above baseline - possible broken sprinkler' },
];

export default function DeviceMonitoring() {
  const devices = mockDevices;
  const shellyDevicesList = devices.filter(d => d.type.startsWith('shelly'));
  const ecodirectDevicesList = devices.filter(d => d.type.startsWith('ecodirect'));
  const summary = {
    total: devices.length,
    shelly_count: shellyDevicesList.length,
    ecodirect_count: ecodirectDevicesList.length,
    online: devices.filter(d => d.status === 'online').length,
    with_alerts: devices.filter(d => (d as any).alert).length,
  };

  const shellyDevices = devices.filter((d: any) => d.type.startsWith('shelly'));
  const ecodirectDevices = devices.filter((d: any) => d.type.startsWith('ecodirect'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Device Monitoring</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring of Shelly and Dragino sensors</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-primary mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Shelly Devices</dt>
              <dd className="text-2xl font-semibold text-foreground">{summary.shelly_count || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <Droplet className="h-6 w-6 text-primary mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Dragino Sensors</dt>
              <dd className="text-2xl font-semibold text-foreground">{summary.ecodirect_count || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-success mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Online</dt>
              <dd className="text-2xl font-semibold text-success">{summary.online || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-destructive mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">With Alerts</dt>
              <dd className="text-2xl font-semibold text-destructive">{summary.with_alerts || 0}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Shelly Devices */}
      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Shelly Electric Monitors ({shellyDevices.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shellyDevices.map((device: any) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.alert ? 'border-red-500/40 bg-red-50 dark:bg-red-900/20' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{device.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{device.location}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-2">
                      {device.type === 'shelly_pro_3em' ? 'Shelly Pro 3EM' : 'Shelly EM'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {device.alert && (
                  <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-xs font-medium text-red-800 dark:text-red-300 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {device.alert}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Current Power</span>
                    <span className="text-sm font-semibold text-foreground">
                      {device.current_power_kw?.toFixed(2)} kW
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Today's Usage</span>
                    <span className="text-sm font-semibold text-foreground">
                      {device.total_kwh_today?.toFixed(1)} kWh
                    </span>
                  </div>
                  {device.power_factor && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Power Factor</span>
                      <span className="text-sm font-semibold text-foreground">
                        {device.power_factor}
                      </span>
                    </div>
                  )}
                  {device.voltage_l1 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">3-Phase Voltage</p>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">L1:</span>
                          <span className="font-medium ml-1 text-foreground">{device.voltage_l1}V</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">L2:</span>
                          <span className="font-medium ml-1 text-foreground">{device.voltage_l2}V</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">L3:</span>
                          <span className="font-medium ml-1 text-foreground">{device.voltage_l3}V</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dragino Sensors */}
      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Droplet className="h-5 w-5 mr-2 text-primary" />
            Dragino Water Sensors ({ecodirectDevices.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecodirectDevices.map((device: any) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.alert ? 'border-red-500/40 bg-red-50 dark:bg-red-900/20' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{device.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{device.location}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-2">
                      Dragino Water
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {device.alert && (
                  <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-xs font-medium text-red-800 dark:text-red-300 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {device.alert}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Current Flow</span>
                    <span className={`text-sm font-semibold ${
                      device.current_flow_gpm > 1 ? 'text-primary' : 'text-foreground'
                    }`}>
                      {device.current_flow_gpm?.toFixed(1)} GPM
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Today's Usage</span>
                    <span className="text-sm font-semibold text-foreground">
                      {device.total_gallons_today?.toLocaleString()} gal
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Pressure</span>
                    <span className="text-sm font-semibold text-foreground">
                      {device.pressure_psi} PSI
                    </span>
                  </div>
                  {device.temperature_f && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Temperature</span>
                      <span className="text-sm font-semibold text-foreground">
                        {device.temperature_f}°F
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-foreground">Real-Time Monitoring Active</h3>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>All Shelly and Dragino devices are reporting in real-time. Data refreshes every 5 seconds.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Shelly Pro 3EM: 3-phase electric monitoring with power factor analysis</li>
                <li>Shelly EM: Single-phase electric monitoring for individual units</li>
                <li>Dragino Water: Flow rate, pressure, and temperature monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
