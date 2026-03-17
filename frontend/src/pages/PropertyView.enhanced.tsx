import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Building2, Home, AlertTriangle, ArrowLeft, TrendingUp, TrendingDown, Zap, Droplet, Users, Activity, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { api } from '../lib/api.local';
import { format, subDays } from 'date-fns';

export default function PropertyView() {
  const { propertyId } = useParams<{ propertyId: string }>();

  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => api.getProperty(propertyId!),
    enabled: !!propertyId,
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings', propertyId],
    queryFn: () => api.getBuildings(propertyId!),
    enabled: !!propertyId,
  });

  const { data: electricUsageData = [] } = useQuery({
    queryKey: ['usage', propertyId, 'electric'],
    queryFn: () => api.getUsage({
      propertyId: propertyId!,
      metricType: 'electric_kwh',
      granularity: 'daily',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    }),
    enabled: !!propertyId,
  });

  const { data: waterUsageData = [] } = useQuery({
    queryKey: ['usage', propertyId, 'water'],
    queryFn: () => api.getUsage({
      propertyId: propertyId!,
      metricType: 'water_gallons',
      granularity: 'daily',
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    }),
    enabled: !!propertyId,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', propertyId],
    queryFn: () => api.getAlerts({ propertyId, status: 'active' }),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading property details...</div>;
  }

  const property = propertyData?.property;
  const stats = propertyData?.stats;

  if (!property) {
    return <div className="text-center py-12">Property not found</div>;
  }

  const electricChartData = electricUsageData.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    value: d.sum_value,
    avg: d.avg_value,
  }));

  const waterChartData = waterUsageData.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    value: d.sum_value,
    avg: d.avg_value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-gray-500 mt-1">{property.address}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Units */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.total_units || 0}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <Users className="h-4 w-4 mr-1" />
                      {stats?.occupied_units || 0} occupied
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Electric Usage */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Electric (30d)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.total_electric_kwh?.toLocaleString() || 0} kWh
                    </div>
                    {stats?.month_over_month_electric !== undefined && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stats.month_over_month_electric >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {stats.month_over_month_electric >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(stats.month_over_month_electric)}%
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Water Usage */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Droplet className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Water (30d)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.total_water_gallons?.toLocaleString() || 0} gal
                    </div>
                    {stats?.month_over_month_water !== undefined && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stats.month_over_month_water >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {stats.month_over_month_water >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(stats.month_over_month_water)}%
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Efficiency Score</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.efficiency_score || 0}</div>
                    <div className="ml-2 text-sm font-semibold text-gray-600">/ 100</div>
                  </dd>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stats?.efficiency_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Per Unit Averages</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Electric per Unit</span>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.avg_electric_per_unit?.toFixed(1)} kWh
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Total: {stats?.total_electric_kwh?.toLocaleString()} kWh / {stats?.total_units} units
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Water per Unit</span>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.avg_water_per_unit?.toFixed(1)} gal
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Total: {stats?.total_water_gallons?.toLocaleString()} gal / {stats?.total_units} units
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Occupancy</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Occupied Units</span>
              <span className="text-lg font-semibold text-green-600">{stats?.occupied_units}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vacant Units</span>
              <span className="text-lg font-semibold text-orange-600">{stats?.vacant_units}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${((stats?.occupied_units || 0) / (stats?.total_units || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 text-center">
                {(((stats?.occupied_units || 0) / (stats?.total_units || 1)) * 100).toFixed(1)}% Occupancy Rate
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Anomalies</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Alerts</span>
              <span className="text-lg font-semibold text-red-600">{stats?.active_alerts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Anomalies Detected</span>
              <span className="text-lg font-semibold text-orange-600">{stats?.anomalies_detected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electric Usage Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Electric Usage - Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={electricChartData}>
              <defs>
                <linearGradient id="colorElectric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                formatter={(value: any) => [`${value.toFixed(2)} kWh`, 'Usage']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorElectric)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500">Average Daily</div>
              <div className="text-lg font-semibold text-gray-900">
                {(electricChartData.reduce((sum, d) => sum + d.value, 0) / electricChartData.length).toFixed(1)} kWh
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Peak Day</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.max(...electricChartData.map(d => d.value)).toFixed(1)} kWh
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Low Day</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.min(...electricChartData.map(d => d.value)).toFixed(1)} kWh
              </div>
            </div>
          </div>
        </div>

        {/* Water Usage Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Droplet className="h-5 w-5 mr-2 text-blue-500" />
            Water Usage - Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={waterChartData}>
              <defs>
                <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Gallons', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                formatter={(value: any) => [`${value.toFixed(0)} gal`, 'Usage']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorWater)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500">Average Daily</div>
              <div className="text-lg font-semibold text-gray-900">
                {(waterChartData.reduce((sum, d) => sum + d.value, 0) / waterChartData.length).toFixed(0)} gal
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Peak Day</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.max(...waterChartData.map(d => d.value)).toFixed(0)} gal
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Low Day</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.min(...waterChartData.map(d => d.value)).toFixed(0)} gal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Buildings ({buildings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildings.map((building: any) => (
              <Link
                key={building.id}
                to={`/buildings/${building.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{building.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{building.unit_count} units • {building.floor_count} floors</p>
                  </div>
                  {building.active_alerts > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {building.active_alerts} alerts
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Electric</div>
                    <div className="text-sm font-semibold text-gray-900">{building.total_electric_kwh?.toLocaleString()} kWh</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Water</div>
                    <div className="text-sm font-semibold text-gray-900">{building.total_water_gallons?.toLocaleString()} gal</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Active Alerts ({alerts.length})
            </h3>
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                >
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-red-600">
                        <span>{format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        {alert.sources && (
                          <span className="flex items-center space-x-1">
                            <Activity className="h-3 w-3" />
                            <span>{alert.sources.join(', ')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
