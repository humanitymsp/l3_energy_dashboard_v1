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
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{property.name}</h1>
            <p className="text-muted-foreground mt-1">{property.address}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Units */}
        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Total Units</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">{stats?.total_units || 0}</div>
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
        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Electric (30d)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">
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
        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Droplet className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Water (30d)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">
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
        <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-green-500 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Efficiency Score</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">{stats?.efficiency_score || 0}</div>
                    <div className="ml-2 text-sm font-semibold text-muted-foreground">/ 100</div>
                  </dd>
                  <div className="mt-1">
                    <div className="w-full bg-muted rounded-full h-2">
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
        <div className="bg-card border border-border shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Per Unit Averages</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Electric per Unit</span>
                <span className="text-lg font-semibold text-foreground">
                  {stats?.avg_electric_per_unit?.toFixed(1)} kWh
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Total: {stats?.total_electric_kwh?.toLocaleString()} kWh / {stats?.total_units} units
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Water per Unit</span>
                <span className="text-lg font-semibold text-foreground">
                  {stats?.avg_water_per_unit?.toFixed(1)} gal
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Total: {stats?.total_water_gallons?.toLocaleString()} gal / {stats?.total_units} units
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Occupancy</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Occupied Units</span>
              <span className="text-lg font-semibold text-green-600">{stats?.occupied_units}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Vacant Units</span>
              <span className="text-lg font-semibold text-orange-600">{stats?.vacant_units}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${((stats?.occupied_units || 0) / (stats?.total_units || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground text-center">
                {(((stats?.occupied_units || 0) / (stats?.total_units || 1)) * 100).toFixed(1)}% Occupancy Rate
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Alerts & Anomalies</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Alerts</span>
              <span className="text-lg font-semibold text-red-600">{stats?.active_alerts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Anomalies Detected</span>
              <span className="text-lg font-semibold text-orange-600">{stats?.anomalies_detected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electric Usage Chart */}
        <div className="bg-card border border-border shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400" />
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
              <div className="text-xs text-muted-foreground">Average Daily</div>
              <div className="text-lg font-semibold text-foreground">
                {(electricChartData.reduce((sum, d) => sum + d.value, 0) / electricChartData.length).toFixed(1)} kWh
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
              <div className="text-lg font-semibold text-foreground">
                {Math.max(...electricChartData.map(d => d.value)).toFixed(1)} kWh
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Low Day</div>
              <div className="text-lg font-semibold text-foreground">
                {Math.min(...electricChartData.map(d => d.value)).toFixed(1)} kWh
              </div>
            </div>
          </div>
        </div>

        {/* Water Usage Chart */}
        <div className="bg-card border border-border shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Droplet className="h-5 w-5 mr-2 text-primary" />
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
              <div className="text-xs text-muted-foreground">Average Daily</div>
              <div className="text-lg font-semibold text-foreground">
                {(waterChartData.reduce((sum, d) => sum + d.value, 0) / waterChartData.length).toFixed(0)} gal
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
              <div className="text-lg font-semibold text-foreground">
                {Math.max(...waterChartData.map(d => d.value)).toFixed(0)} gal
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Low Day</div>
              <div className="text-lg font-semibold text-foreground">
                {Math.min(...waterChartData.map(d => d.value)).toFixed(0)} gal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings List */}
      <div className="bg-card border border-border shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Buildings ({buildings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildings.map((building: any) => (
              <Link
                key={building.id}
                to={`/buildings/${building.id}`}
                className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-foreground">{building.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{building.unit_count} units • {building.floor_count} floors</p>
                  </div>
                  {building.active_alerts > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      {building.active_alerts} alerts
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Electric</div>
                    <div className="text-sm font-semibold text-foreground">{building.total_electric_kwh?.toLocaleString()} kWh</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Water</div>
                    <div className="text-sm font-semibold text-foreground">{building.total_water_gallons?.toLocaleString()} gal</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-card border border-border shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Active Alerts ({alerts.length})
            </h3>
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded"
                >
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300">{alert.title}</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">{alert.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-red-600 dark:text-red-400">
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
