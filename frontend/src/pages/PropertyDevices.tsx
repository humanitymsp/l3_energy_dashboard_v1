import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Zap, Droplet, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PropertyDevices() {
  const { propertyId } = useParams<{ propertyId: string }>();

  const { data: devicesData, isLoading } = useQuery({
    queryKey: ['devices', propertyId],
    queryFn: () => fetch(`http://localhost:4000/api/devices?propertyId=${propertyId}`).then(res => res.json()),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading devices...</div>;
  }

  const devices = devicesData?.devices || [];
  const summary = devicesData?.summary || {};

  const shellyDevices = devices.filter((d: any) => d.type.startsWith('shelly'));
  const ecodirectDevices = devices.filter((d: any) => d.type.startsWith('ecodirect'));

  // Group by building
  const devicesByBuilding: Record<string, any[]> = {};
  devices.forEach((device: any) => {
    const key = device.building_id || 'common';
    if (!devicesByBuilding[key]) {
      devicesByBuilding[key] = [];
    }
    devicesByBuilding[key].push(device);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Device Deployment</h2>
        <p className="text-gray-500 mt-1">Every unit monitored with Shelly EM (electric) + Ecodirect (water)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Shelly Devices</dt>
              <dd className="text-2xl font-semibold text-gray-900">{summary.shelly_count || 0}</dd>
              <dd className="text-xs text-gray-500">1 per unit + building mains</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Droplet className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Ecodirect Sensors</dt>
              <dd className="text-2xl font-semibold text-gray-900">{summary.ecodirect_count || 0}</dd>
              <dd className="text-xs text-gray-500">1 per unit + building mains</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Online</dt>
              <dd className="text-2xl font-semibold text-green-600">{summary.online || 0}</dd>
              <dd className="text-xs text-gray-500">of {summary.total || 0} total</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">With Alerts</dt>
              <dd className="text-2xl font-semibold text-red-600">{summary.with_alerts || 0}</dd>
              <dd className="text-xs text-gray-500">requiring attention</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Complete Unit-Level Monitoring</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Every unit in this property is equipped with:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Shelly EM</strong> - Real-time electric monitoring at the unit breaker panel</li>
                <li><strong>Ecodirect Water Sensor</strong> - Flow rate, pressure, and leak detection</li>
              </ul>
              <p className="mt-2">Building-level monitoring includes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Shelly Pro 3EM</strong> - 3-phase electric monitoring on main panels</li>
                <li><strong>Ecodirect Main Line Sensors</strong> - Building water supply monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Devices by Building */}
      {Object.entries(devicesByBuilding).map(([buildingId, buildingDevices]) => {
        const buildingName = buildingId === 'common' ? 'Common Areas' : 
          buildingDevices[0]?.name?.includes('Building A') ? 'Building A' :
          buildingDevices[0]?.name?.includes('Building B') ? 'Building B' : 'Building C';
        
        const unitDevices = buildingDevices.filter((d: any) => d.unit_id);
        const buildingLevelDevices = buildingDevices.filter((d: any) => !d.unit_id);

        return (
          <div key={buildingId} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{buildingName}</h3>
              
              {/* Building-level devices */}
              {buildingLevelDevices.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Building-Level Monitoring</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buildingLevelDevices.map((device: any) => (
                      <div
                        key={device.id}
                        className={`border rounded-lg p-4 ${
                          device.alert ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm text-gray-900">{device.name}</h5>
                            <p className="text-xs text-gray-500">{device.location}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {device.type === 'shelly_pro_3em' ? 'Shelly Pro 3EM' : 'Ecodirect Main'}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {device.status}
                          </span>
                        </div>
                        {device.alert && (
                          <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded">
                            <p className="text-xs font-medium text-red-800 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {device.alert}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {device.current_power_kw && (
                            <div>
                              <span className="text-gray-600">Power:</span>
                              <span className="font-semibold ml-1">{device.current_power_kw} kW</span>
                            </div>
                          )}
                          {device.current_flow_gpm !== undefined && (
                            <div>
                              <span className="text-gray-600">Flow:</span>
                              <span className="font-semibold ml-1">{device.current_flow_gpm} GPM</span>
                            </div>
                          )}
                          {device.total_kwh_today && (
                            <div>
                              <span className="text-gray-600">Today:</span>
                              <span className="font-semibold ml-1">{device.total_kwh_today} kWh</span>
                            </div>
                          )}
                          {device.total_gallons_today && (
                            <div>
                              <span className="text-gray-600">Today:</span>
                              <span className="font-semibold ml-1">{device.total_gallons_today} gal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit-level devices (sample) */}
              {unitDevices.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Unit-Level Monitoring (Showing {unitDevices.length} sample units)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {unitDevices.map((device: any) => (
                      <div
                        key={device.id}
                        className={`border rounded p-3 ${
                          device.alert ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-900">{device.name}</span>
                          {device.type.startsWith('shelly') ? (
                            <Zap className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Droplet className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        {device.alert && (
                          <div className="mb-1 p-1 bg-red-100 rounded">
                            <p className="text-xs text-red-800">{device.alert}</p>
                          </div>
                        )}
                        <div className="text-xs space-y-0.5">
                          {device.current_power_kw !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Power:</span>
                              <span className="font-semibold">{device.current_power_kw} kW</span>
                            </div>
                          )}
                          {device.total_kwh_today && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Today:</span>
                              <span className="font-semibold">{device.total_kwh_today} kWh</span>
                            </div>
                          )}
                          {device.current_flow_gpm !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Flow:</span>
                              <span className="font-semibold">{device.current_flow_gpm} GPM</span>
                            </div>
                          )}
                          {device.total_gallons_today && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Today:</span>
                              <span className="font-semibold">{device.total_gallons_today} gal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Note: All units in this building have identical monitoring equipment. Showing sample units above.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
