import { Camera, Lock, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockCameras, mockAccessPoints, mockMotionEvents, mockAccessEvents } from '../lib/mockData/unifi';

export default function SecurityMonitoring() {
  const cameras = mockCameras;
  const accessPoints = mockAccessPoints;
  const motionEvents = mockMotionEvents;
  const accessEvents = mockAccessEvents;

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const recordingCameras = cameras.filter(c => c.isRecording).length;
  const camerasWithMotion = cameras.filter(c => c.hasMotion).length;

  const onlineAccessPoints = accessPoints.filter(a => a.status === 'online').length;
  const deniedAccess = accessEvents.filter(e => e.eventType === 'denied').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Physical Security</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          UniFi Protect Cameras & Access Control
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Cameras Online</dt>
                  <dd className="text-3xl font-semibold text-foreground">{onlineCameras}/{cameras.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Recording</dt>
                  <dd className="text-3xl font-semibold text-foreground">{recordingCameras}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Access Points</dt>
                  <dd className="text-3xl font-semibold text-foreground">{onlineAccessPoints}/{accessPoints.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Denied Access (24h)</dt>
                  <dd className="text-3xl font-semibold text-foreground">{deniedAccess}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cameras List */}
      <div className="bg-card border border-border shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">UniFi Protect Cameras</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Camera className={`h-6 w-6 ${camera.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{camera.name}</h3>
                      <p className="text-xs text-muted-foreground">{camera.model}</p>
                    </div>
                  </div>
                  {camera.hasMotion && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                      Motion
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>{camera.location.propertyName}</p>
                  <p>{camera.location.buildingName} • {camera.location.area}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {camera.isRecording && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                        Recording
                      </span>
                    )}
                    {camera.smartDetections.person && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        Person
                      </span>
                    )}
                    {camera.smartDetections.vehicle && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                        Vehicle
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Control Points */}
      <div className="bg-card border border-border shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">UniFi Access Control</h2>
          <div className="space-y-3">
            {accessPoints.map((point) => (
              <div
                key={point.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Lock className={`h-6 w-6 ${point.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{point.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {point.location.propertyName} • {point.location.buildingName} • {point.location.floor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">24h Access Count</p>
                    <p className="text-sm font-semibold text-foreground">{point.accessCount24h}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    point.doorState === 'closed' 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {point.doorState}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Access Events */}
      <div className="bg-card border border-border shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Recent Access Events</h2>
          <div className="space-y-2">
            {accessEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  event.eventType === 'denied'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {event.eventType === 'granted' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {event.user.name} • {event.accessPointName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Badge: {event.user.badgeId} • {event.location.propertyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.eventType === 'granted'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                  }`}>
                    {event.eventType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
