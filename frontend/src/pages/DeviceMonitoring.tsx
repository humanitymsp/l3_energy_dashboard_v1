import { useQuery } from '@tanstack/react-query';
import { Zap, Droplet, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { api } from '../lib/api.local';

export default function DeviceMonitoring() {
  const { data: devicesData, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => fetch('http://localhost:4000/api/devices').then(res => res.json()),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time monitoring
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading device monitoring...</div>;
  }

  const devices = devicesData?.devices || [];
  const summary = devicesData?.summary || {};

  const shellyDevices = devices.filter((d: any) => d.type.startsWith('shelly'));
  const ecodirectDevices = devices.filter((d: any) => d.type.startsWith('ecodirect'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Device Monitoring</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring of Shelly and Ecodirect sensors</p>
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
              <dt className="text-sm font-medium text-muted-foreground">Ecodirect Sensors</dt>
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

      {/* Ecodirect Sensors */}
      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Droplet className="h-5 w-5 mr-2 text-primary" />
            Ecodirect Water Sensors ({ecodirectDevices.length})
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
                      Ecodirect Water
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
              <p>All Shelly and Ecodirect devices are reporting in real-time. Data refreshes every 5 seconds.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Shelly Pro 3EM: 3-phase electric monitoring with power factor analysis</li>
                <li>Shelly EM: Single-phase electric monitoring for individual units</li>
                <li>Ecodirect Water: Flow rate, pressure, and temperature monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
