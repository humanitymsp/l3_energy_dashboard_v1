import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Zap, Droplet, AlertTriangle, Home, TrendingUp, TrendingDown, Camera, Wifi, Search } from 'lucide-react';
import { api } from '../lib/api.local';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.getProperties(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => api.getAlerts({ status: 'active', limit: 10 }),
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  // Filter properties based on search query
  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter alerts based on search query
  const filteredAlerts = activeAlerts.filter(alert =>
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.property_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Overview</h1>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search properties and alerts..."
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-6 w-6 text-gray-400 dark:text-gray-200" />
                <Home className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Properties</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{properties.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {properties.reduce((sum, p) => sum + (p.units_count || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className={`h-6 w-6 ${criticalAlerts.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                  <dd className={`text-3xl font-semibold ${activeAlerts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {activeAlerts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                  <dd className="text-lg font-semibold text-green-600">Operational</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''} Require Attention
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <Link to="/alerts" className="font-medium underline hover:text-red-600">
                  View all alerts →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Properties</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
              >
                {(property.active_alerts ?? 0) > 0 && (
                  <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {property.active_alerts ?? 0} alerts
                  </span>
                )}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Building2 className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-500 truncate">{property.address}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Units</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.occupied_units || 0} / {property.units_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Buildings</p>
                      <p className="text-sm font-semibold text-gray-900">{property.buildings_count || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Electric Cost</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${property.monthly_electric_cost?.toLocaleString() || 0}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Water Cost</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${property.monthly_water_cost?.toLocaleString() || 0}/mo
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Efficiency Score</span>
                      <span className="text-xs font-semibold text-green-600">
                        {Math.round(((property.water_efficiency_score || 0) + (property.electric_efficiency_score || 0)) / 2)}%
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: `${Math.round(((property.water_efficiency_score || 0) + (property.electric_efficiency_score || 0)) / 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  {property.estimated_savings_ytd && property.estimated_savings_ytd > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">YTD Savings from Leak Prevention</p>
                      <p className="text-lg font-bold text-green-600">
                        ${property.estimated_savings_ytd.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* UniFi Integration Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">UniFi Integration</h2>
                <p className="text-sm text-gray-500">Protect • AlarmHub • Access</p>
              </div>
            </div>
            <Link
              to="/integrations/unifi"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Details →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Cameras</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">12</p>
              <p className="text-xs text-gray-500 mt-1">All online</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Droplet className="h-5 w-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Leak Sensors</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">24</p>
              <p className="text-xs text-gray-500 mt-1">23 online</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Events Today</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">47</p>
              <p className="text-xs text-green-600 mt-1">3 correlated</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-500">Prevented Losses</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">$8.2K</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
          </div>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : alert.severity === 'high'
                      ? 'bg-orange-50 border-orange-500'
                      : alert.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        {alert.property_name} - {alert.building_name} - Unit {alert.unit_number}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : alert.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/alerts"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all alerts →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
