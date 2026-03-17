import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Wifi, Thermometer, Camera, Lock, Activity, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { mockMonitoringCategories, mockCorrelatedEvents, mockCameras, mockAccessPoints, mockNetworkStats } from '../lib/mockData/unifi';

export default function MonitoringDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = mockMonitoringCategories;
  const correlatedEvents = mockCorrelatedEvents;

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Shield,
      Zap,
      Wifi,
      Thermometer,
    };
    return icons[iconName] || Activity;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unified Monitoring Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Single pane of glass for all property monitoring systems
        </p>
      </div>

      {/* Monitoring Categories Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = getIcon(category.icon);
          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {category.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {category.onlineCount}/{category.deviceCount}
                        </div>
                        <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">devices</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                      {category.status}
                    </span>
                    {category.alerts > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                        {category.alerts} alerts
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System-Wide Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Camera className="h-6 w-6 text-gray-400 dark:text-gray-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Cameras</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{mockCameras.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Lock className="h-6 w-6 text-gray-400 dark:text-gray-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Access Points</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{mockAccessPoints.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wifi className="h-6 w-6 text-gray-400 dark:text-gray-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Network Devices</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{mockNetworkStats.totalDevices}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400 dark:text-gray-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Connected Clients</dt>
                  <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{mockNetworkStats.totalClients}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Events - AI-Powered Insights */}
      {correlatedEvents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Correlated Events</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered multi-system event correlation</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                <Activity className="h-4 w-4 mr-1" />
                AI Insights
              </span>
            </div>
            <div className="space-y-4">
              {correlatedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    event.severity === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      : event.severity === 'high'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                      : event.severity === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            event.severity === 'critical'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                              : event.severity === 'high'
                              ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                          }`}
                        >
                          {event.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.sources.map((source, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {source.type === 'camera' && <Camera className="h-3 w-3 mr-1" />}
                            {source.type === 'access' && <Lock className="h-3 w-3 mr-1" />}
                            {source.type === 'water' && <Activity className="h-3 w-3 mr-1" />}
                            {source.type === 'electric' && <Zap className="h-3 w-3 mr-1" />}
                            {source.deviceName}
                          </span>
                        ))}
                      </div>
                      {event.estimatedImpact && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {event.estimatedImpact.cost && (
                            <span className="mr-3">Est. Cost: ${event.estimatedImpact.cost}</span>
                          )}
                          {event.estimatedImpact.gallonsLost && (
                            <span className="mr-3">Water Lost: {event.estimatedImpact.gallonsLost.toLocaleString()} gal</span>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {event.location.propertyName} • {event.location.buildingName}
                        {event.location.unitNumber && ` • Unit ${event.location.unitNumber}`}
                      </div>
                    </div>
                    <span
                      className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'active'
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                          : event.status === 'investigating'
                          ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links to Category Pages */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detailed Monitoring</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/monitoring/security"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Physical Security</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cameras & Access</p>
              </div>
            </Link>
            <Link
              to="/monitoring/network"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Wifi className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Network</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Infrastructure</p>
              </div>
            </Link>
            <Link
              to="/monitoring/utilities"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Utilities</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Water & Electric</p>
              </div>
            </Link>
            <Link
              to="/monitoring/environmental"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Thermometer className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Environmental</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Temp & Humidity</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
