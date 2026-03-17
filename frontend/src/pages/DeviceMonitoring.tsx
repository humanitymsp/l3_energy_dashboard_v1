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
        <h1 className="text-3xl font-bold text-gray-900">Device Monitoring</h1>
        <p className="text-gray-500 mt-1">Real-time monitoring of Shelly and Ecodirect sensors</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Shelly Devices</dt>
              <dd className="text-2xl font-semibold text-gray-900">{summary.shelly_count || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Droplet className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Ecodirect Sensors</dt>
              <dd className="text-2xl font-semibold text-gray-900">{summary.ecodirect_count || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Online</dt>
              <dd className="text-2xl font-semibold text-green-600">{summary.online || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">With Alerts</dt>
              <dd className="text-2xl font-semibold text-red-600">{summary.with_alerts || 0}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Shelly Devices */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            Shelly Electric Monitors ({shellyDevices.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shellyDevices.map((device: any) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.alert ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{device.location}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      {device.type === 'shelly_pro_3em' ? 'Shelly Pro 3EM' : 'Shelly EM'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {device.alert && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-800 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {device.alert}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Current Power</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {device.current_power_kw?.toFixed(2)} kW
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Today's Usage</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {device.total_kwh_today?.toFixed(1)} kWh
                    </span>
                  </div>
                  {device.power_factor && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Power Factor</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {device.power_factor}
                      </span>
                    </div>
                  )}
                  {device.voltage_l1 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">3-Phase Voltage</p>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>
                          <span className="text-gray-500">L1:</span>
                          <span className="font-medium ml-1">{device.voltage_l1}V</span>
                        </div>
                        <div>
                          <span className="text-gray-500">L2:</span>
                          <span className="font-medium ml-1">{device.voltage_l2}V</span>
                        </div>
                        <div>
                          <span className="text-gray-500">L3:</span>
                          <span className="font-medium ml-1">{device.voltage_l3}V</span>
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Droplet className="h-5 w-5 mr-2 text-blue-500" />
            Ecodirect Water Sensors ({ecodirectDevices.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecodirectDevices.map((device: any) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.alert ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{device.location}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      Ecodirect Water
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {device.alert && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-800 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {device.alert}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Current Flow</span>
                    <span className={`text-sm font-semibold ${
                      device.current_flow_gpm > 1 ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {device.current_flow_gpm?.toFixed(1)} GPM
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Today's Usage</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {device.total_gallons_today?.toLocaleString()} gal
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Pressure</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {device.pressure_psi} PSI
                    </span>
                  </div>
                  {device.temperature_f && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Temperature</span>
                      <span className="text-sm font-semibold text-gray-900">
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
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Real-Time Monitoring Active</h3>
            <div className="mt-2 text-sm text-blue-700">
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
