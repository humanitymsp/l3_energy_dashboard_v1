import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  CreditCard,
  Smartphone,
  Coins,
  Package
} from 'lucide-react';
import { api } from '../lib/api.local';

export default function LaundryDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Fetch revenue data
  const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['laundryRevenue', selectedProperty],
    queryFn: () => api.getLaundryRevenue(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Fetch properties for context
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.getProperties(),
  });

  if (revenueLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.total_revenue, 0);
  const totalSessions = revenueData.reduce((sum, r) => sum + r.total_sessions, 0);
  const todayRevenue = revenueData.find(r => r.date === new Date().toISOString().split('T')[0])?.total_revenue || 0;
  const averageRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'coin': return <Coins className="h-4 w-4" />;
      case 'app': return <Package className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Laundry Revenue Analytics</h1>
            <p className="text-muted-foreground">Revenue performance across all laundry services</p>
          </div>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="mt-4 md:mt-0 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Properties</option>
            <option value="prop-001">NBC HQ - Building A</option>
            <option value="prop-002">NBC HQ - Building B</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-bold text-success">${todayRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold gradient-text">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold text-info">{totalSessions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <Calendar className="h-6 w-6 text-info" />
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Session</p>
                <p className="text-3xl font-bold gradient-text">${averageRevenuePerSession.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Date */}
        <div className="dashboard-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
          <div className="space-y-4">
            {revenueData.map((rev) => (
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
                  <div className="w-24 bg-muted rounded-full h-2">
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

        {/* Payment Methods */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['card', 'mobile', 'coin', 'app'].map((method) => {
              const methodRevenue = revenueData.reduce((sum, r) => sum + (r.payment_breakdown[method as keyof typeof r.payment_breakdown] || 0), 0);
              const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;

              return (
                <div key={method} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-muted-foreground">{getPaymentIcon(method)}</div>
                    <span className="text-sm font-medium text-foreground capitalize">{method}</span>
                  </div>
                  <p className="text-xl font-bold text-success">${methodRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
