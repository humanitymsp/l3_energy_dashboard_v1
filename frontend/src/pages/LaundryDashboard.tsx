import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  Zap,
  Droplet,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Users,
  CreditCard,
  Smartphone,
  Coins,
  Package,
  ArrowUp,
  ArrowDown,
  Wrench
} from 'lucide-react';
import { api } from '../lib/api.local';
import { LaundryAnalytics, LaundryRevenue, LaundryMachine } from '../lib/types/laundry';

export default function LaundryDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string>('prop-001');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['laundryAnalytics', selectedProperty, selectedPeriod],
    queryFn: () => api.getLaundryAnalytics(selectedProperty, selectedPeriod),
  });

  // Fetch revenue data for charts
  const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['laundryRevenue', selectedProperty],
    queryFn: () => api.getLaundryRevenue(selectedProperty),
  });

  // Fetch machines for utilization
  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ['laundryMachines', selectedProperty],
    queryFn: () => api.getLaundryMachines(selectedProperty),
  });

  if (analyticsLoading || revenueLoading || machinesLoading || !analytics) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todayRevenue = revenueData[0] || { total_revenue: 0, total_sessions: 0, payment_breakdown: { card: 0, mobile: 0, coin: 0, app: 0 }, peak_hour: 19, average_session_duration: 38.5 };
  const utilizationRate = machines.length > 0 ? (machines.filter(m => m.status === 'online').length / machines.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Laundry Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive insights into laundry operations and revenue performance</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="prop-001">NBC HQ - Building A</option>
              <option value="prop-002">NBC HQ - Building B</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-success">${analytics.total_revenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {analytics.revenue_growth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-destructive mr-1" />
                  )}
                  <span className={`text-sm font-medium ${analytics.revenue_growth > 0 ? 'text-success' : 'text-destructive'}`}>
                    {Math.abs(analytics.revenue_growth)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold gradient-text">{analytics.total_sessions.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {analytics.session_growth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-destructive mr-1" />
                  )}
                  <span className={`text-sm font-medium ${analytics.session_growth > 0 ? 'text-success' : 'text-destructive'}`}>
                    {Math.abs(analytics.session_growth)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Revenue/Session</p>
                <p className="text-3xl font-bold text-info">${analytics.average_revenue_per_session.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">Per cycle average</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <Target className="h-6 w-6 text-info" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Machine Utilization</p>
                <p className="text-3xl font-bold gradient-text">{analytics.machine_utilization.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-2">Efficiency rate</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
            <div className="space-y-4">
              {revenueData.slice(0, 7).map((rev, index) => (
                <div key={rev.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(rev.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">${rev.total_revenue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{rev.total_sessions} sessions</p>
                    </div>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(rev.total_revenue / 250) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Usage Hours */}
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Peak Usage Hours</h3>
            <div className="space-y-3">
              {analytics.peak_usage_hours.map((hour, index) => (
                <div key={hour} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{hour}:00 - {hour + 1}:00</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-warning h-2 rounded-full" 
                        style={{ width: `${((3 - index) / 3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Machines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Machines</h3>
            <div className="space-y-3">
              {analytics.top_performing_machines.map((machine, index) => (
                <div key={machine.machine_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{machine.machine_id}</p>
                      <p className="text-xs text-muted-foreground">{machine.sessions} sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">${machine.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {todayRevenue.payment_breakdown && Object.entries(todayRevenue.payment_breakdown).map(([method, amount]) => {
                const percentage = (amount / todayRevenue.total_revenue) * 100;
                const icons = {
                  card: <CreditCard className="h-4 w-4" />,
                  mobile: <Smartphone className="h-4 w-4" />,
                  coin: <Coins className="h-4 w-4" />,
                  app: <Package className="h-4 w-4" />
                };
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">
                        {icons[method as keyof typeof icons]}
                      </div>
                      <span className="text-sm font-medium text-foreground capitalize">{method}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-info h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">${amount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Forecast */}
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Forecast</h3>
            <div className="space-y-3">
              {analytics.revenue_forecast.map((forecast, index) => (
                <div key={forecast.period} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{forecast.period}</span>
                    <span className="text-xs text-muted-foreground">{(forecast.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-success">${forecast.predicted_revenue.toLocaleString()}</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-1 h-3 rounded-full ${
                            i < Math.floor(forecast.confidence * 5) ? 'bg-success' : 'bg-muted'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
                </div>
                <p className="text-2xl font-bold text-success">{analytics.profit_margin.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">After costs</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Wrench className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium text-muted-foreground">Maintenance Costs</span>
                </div>
                <p className="text-2xl font-bold text-warning">${analytics.maintenance_costs.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">This {selectedPeriod}</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium text-muted-foreground">Avg Session Time</span>
                </div>
                <p className="text-2xl font-bold text-info">{todayRevenue.average_session_duration.toFixed(1)} min</p>
                <p className="text-xs text-muted-foreground">Per cycle</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Peak Hour</span>
                </div>
                <p className="text-2xl font-bold text-primary">{todayRevenue.peak_hour}:00</p>
                <p className="text-xs text-muted-foreground">Busiest time</p>
              </div>
            </div>
          </div>

          {/* Machine Status Overview */}
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Machine Status Overview</h3>
            <div className="space-y-3">
              {['online', 'maintenance', 'offline', 'out_of_order'].map((status) => {
                const count = machines.filter(m => m.status === status).length;
                const percentage = machines.length > 0 ? (count / machines.length) * 100 : 0;
                const colors = {
                  online: 'success',
                  maintenance: 'warning',
                  offline: 'destructive',
                  out_of_order: 'destructive'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 bg-${colors[status as keyof typeof colors]} rounded-full`}></div>
                      <span className="text-sm font-medium text-foreground capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count} machines</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className={`bg-${colors[status as keyof typeof colors]} h-2 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
