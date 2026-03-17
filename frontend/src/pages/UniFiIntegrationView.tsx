import { useQuery } from '@tanstack/react-query';
import { Shield, Droplet, DoorOpen, Thermometer, Activity, Camera, Zap, AlertTriangle, CheckCircle, Battery } from 'lucide-react';
import { api } from '../lib/api.local';

interface UniFiDevice {
  id: string;
  name: string;
  type: 'camera' | 'leak_sensor' | 'contact_sensor' | 'motion_sensor' | 'temperature_sensor' | 'smart_plug';
  location: {
    propertyId: string;
    buildingId: string;
    unitId?: string;
    zone: string;
  };
  status: 'online' | 'offline';
  batteryLevel?: number;
  lastSeen: string;
  currentState?: any;
}

interface CorrelatedEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  sources: string[];
  timestamp: string;
  location: {
    propertyName: string;
    buildingName: string;
    unitNumber?: string;
  };
}

export default function UniFiIntegrationView() {
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['unifi', 'devices'],
    queryFn: () => api.getUniFiDevices(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: correlatedEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['unifi', 'correlated-events'],
    queryFn: () => api.getCorrelatedEvents(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const devicesByType = {
    cameras: devices.filter(d => d.type === 'camera'),
    leakSensors: devices.filter(d => d.type === 'leak_sensor'),
    contactSensors: devices.filter(d => d.type === 'contact_sensor'),
    motionSensors: devices.filter(d => d.type === 'motion_sensor'),
    temperatureSensors: devices.filter(d => d.type === 'temperature_sensor'),
    smartPlugs: devices.filter(d => d.type === 'smart_plug'),
  };

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const lowBatteryDevices = devices.filter(d => d.batteryLevel && d.batteryLevel < 20).length;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'camera': return Camera;
      case 'leak_sensor': return Droplet;
      case 'contact_sensor': return DoorOpen;
      case 'motion_sensor': return Activity;
      case 'temperature_sensor': return Thermometer;
      case 'smart_plug': return Zap;
      default: return Shield;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-500';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  if (devicesLoading) {
    return <div className="flex items-center justify-center h-64">Loading UniFi integration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">UniFi Integration</h1>
          <p className="text-gray-500 mt-1">Protect, AlarmHub & Access integration with utility correlation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Connected</span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Online Devices</dt>
              <dd className="text-2xl font-semibold text-green-600">{onlineDevices}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Offline Devices</dt>
              <dd className="text-2xl font-semibold text-red-600">{offlineDevices}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Battery className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Low Battery</dt>
              <dd className="text-2xl font-semibold text-orange-600">{lowBatteryDevices}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Devices</dt>
              <dd className="text-2xl font-semibold text-blue-600">{devices.length}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Events */}
      {correlatedEvents.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Smart Alerts - UniFi + Utility Correlation
            </h2>
            <div className="space-y-3">
              {correlatedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{event.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{event.location.propertyName}</span>
                        {event.location.buildingName && <span>{event.location.buildingName}</span>}
                        {event.location.unitNumber && <span>Unit {event.location.unitNumber}</span>}
                        <span className="flex items-center space-x-1">
                          <span>Sources:</span>
                          {event.sources.map((source, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                              {source}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Device Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UniFi Protect Cameras */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-600" />
              UniFi Protect Cameras ({devicesByType.cameras.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.cameras.slice(0, 5).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className={`h-5 w-5 ${device.status === 'online' ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.location.zone}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leak Sensors */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-blue-500" />
              Leak Sensors ({devicesByType.leakSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.leakSensors.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Droplet className={`h-5 w-5 ${device.status === 'online' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">
                        {device.location.unitId ? `Unit ${device.location.unitId}` : device.location.zone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.batteryLevel && (
                      <span className={`text-xs ${device.batteryLevel < 20 ? 'text-red-600' : 'text-gray-600'}`}>
                        {device.batteryLevel}%
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Sensors */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DoorOpen className="h-5 w-5 mr-2 text-purple-600" />
              Door/Window Sensors ({devicesByType.contactSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.contactSensors.slice(0, 5).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DoorOpen className={`h-5 w-5 ${device.status === 'online' ? 'text-purple-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.currentState?.contactState && (
                      <span className={`text-xs font-medium ${
                        device.currentState.contactState === 'open' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {device.currentState.contactState}
                      </span>
                    )}
                    {device.batteryLevel && (
                      <span className={`text-xs ${device.batteryLevel < 20 ? 'text-red-600' : 'text-gray-600'}`}>
                        {device.batteryLevel}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Motion Sensors */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Motion Sensors ({devicesByType.motionSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.motionSensors.slice(0, 5).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className={`h-5 w-5 ${device.status === 'online' ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.batteryLevel && (
                      <span className={`text-xs ${device.batteryLevel < 20 ? 'text-red-600' : 'text-gray-600'}`}>
                        {device.batteryLevel}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Temperature Sensors */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Thermometer className="h-5 w-5 mr-2 text-red-600" />
              Temperature Sensors ({devicesByType.temperatureSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.temperatureSensors.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Thermometer className={`h-5 w-5 ${device.status === 'online' ? 'text-red-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.currentState?.temperature && (
                      <span className="text-sm font-medium text-gray-900">
                        {device.currentState.temperature}°F
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Plugs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Smart Plugs ({devicesByType.smartPlugs.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.smartPlugs.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className={`h-5 w-5 ${device.status === 'online' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.currentState?.power && (
                      <span className="text-sm font-medium text-gray-900">
                        {device.currentState.power}W
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">UniFi Ecosystem Integration</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time leak detection correlated with water meter readings</li>
                <li>Occupancy tracking via motion sensors and cameras for vacancy verification</li>
                <li>HVAC efficiency monitoring with temperature sensors and door/window contacts</li>
                <li>Smart alerts combining UniFi events with utility anomalies</li>
                <li>Automatic shutoff integration with Moen Flo when leaks detected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
