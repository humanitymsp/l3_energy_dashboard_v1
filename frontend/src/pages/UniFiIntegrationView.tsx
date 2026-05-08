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
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-500';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-500';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-500';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-500';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (devicesLoading) {
    return <div className="flex items-center justify-center h-64">Loading UniFi integration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">UniFi Integration</h1>
          <p className="text-muted-foreground mt-1">Protect, AlarmHub & Access integration with utility correlation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-muted-foreground">Connected</span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-success mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Online Devices</dt>
              <dd className="text-2xl font-semibold text-success">{onlineDevices}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-destructive mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Offline Devices</dt>
              <dd className="text-2xl font-semibold text-destructive">{offlineDevices}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Battery className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Low Battery</dt>
              <dd className="text-2xl font-semibold text-orange-600 dark:text-orange-400">{lowBatteryDevices}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-primary mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Devices</dt>
              <dd className="text-2xl font-semibold text-primary">{devices.length}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Events */}
      {correlatedEvents.length > 0 && (
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500 dark:text-orange-400" />
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
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{event.location.propertyName}</span>
                        {event.location.buildingName && <span>{event.location.buildingName}</span>}
                        {event.location.unitNumber && <span>Unit {event.location.unitNumber}</span>}
                        <span className="flex items-center space-x-1">
                          <span>Sources:</span>
                          {event.sources.map((source: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">
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
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-primary" />
              UniFi Protect Cameras ({devicesByType.cameras.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.cameras.slice(0, 5).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className={`h-5 w-5 ${device.status === 'online' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.location.zone}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {device.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leak Sensors */}
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-primary" />
              Leak Sensors ({devicesByType.leakSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.leakSensors.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Droplet className={`h-5 w-5 ${device.status === 'online' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {device.location.unitId ? `Unit ${device.location.unitId}` : device.location.zone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.batteryLevel && (
                      <span className={`text-xs ${device.batteryLevel < 20 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {device.batteryLevel}%
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      device.status === 'online' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
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
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <DoorOpen className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Door/Window Sensors ({devicesByType.contactSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.contactSensors.slice(0, 5).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DoorOpen className={`h-5 w-5 ${device.status === 'online' ? 'text-purple-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.location.zone}</p>
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
                      <span className={`text-xs ${device.batteryLevel < 20 ? 'text-red-600' : 'text-muted-foreground'}`}>
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
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Motion Sensors ({devicesByType.motionSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.motionSensors.slice(0, 5).map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className={`h-5 w-5 ${device.status === 'online' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.batteryLevel && (
                      <span className={`text-xs ${device.batteryLevel < 20 ? 'text-red-600' : 'text-muted-foreground'}`}>
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
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Thermometer className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
              Temperature Sensors ({devicesByType.temperatureSensors.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.temperatureSensors.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Thermometer className={`h-5 w-5 ${device.status === 'online' ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.currentState?.temperature && (
                      <span className="text-sm font-medium text-foreground">
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
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              Smart Plugs ({devicesByType.smartPlugs.length})
            </h3>
            <div className="space-y-2">
              {devicesByType.smartPlugs.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className={`h-5 w-5 ${device.status === 'online' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.location.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.currentState?.power && (
                      <span className="text-sm font-medium text-foreground">
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
      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-foreground">UniFi Ecosystem Integration</h3>
            <div className="mt-2 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time leak detection correlated with water meter readings</li>
                <li>Occupancy tracking via motion sensors and cameras for vacancy verification</li>
                <li>HVAC efficiency monitoring with temperature sensors and door/window contacts</li>
                <li>Smart alerts combining UniFi events with utility anomalies</li>
                <li>Access control event logging and denied-entry alerting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
