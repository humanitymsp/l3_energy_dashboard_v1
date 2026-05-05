import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Building2,
  CreditCard,
  Smartphone,
  Coins,
  Package
} from 'lucide-react';
import { api } from '../lib/api.local';

export default function LaundryManagement() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Fetch revenue data
  const { data: revenue = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['laundryRevenue', selectedProperty],
    queryFn: () => api.getLaundryRevenue(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Fetch properties for context
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.getProperties(),
  });

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'coin': return <Coins className="h-4 w-4" />;
      case 'app': return <Package className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  // Calculate totals
  const totalRevenue = revenue.reduce((sum, r) => sum + r.total_revenue, 0);
  const totalSessions = revenue.reduce((sum, r) => sum + r.total_sessions, 0);
  const todayRevenue = revenue.find(r => r.date === new Date().toISOString().split('T')[0])?.total_revenue || 0;

  // Group revenue by property
  const revenueByProperty = properties.map(property => {
    const propertyRevenue = revenue.filter(r => r.property_id === property.id);
    const propertyTotal = propertyRevenue.reduce((sum, r) => sum + r.total_revenue, 0);
    const propertySessions = propertyRevenue.reduce((sum, r) => sum + r.total_sessions, 0);
    const todayRevenue = propertyRevenue.find(r => r.date === new Date().toISOString().split('T')[0])?.total_revenue || 0;
    
    return {
      ...property,
      totalRevenue: propertyTotal,
      totalSessions: propertySessions,
      todayRevenue: todayRevenue
    };
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Laundry Services</h1>
          <p className="text-muted-foreground">High-level revenue overview for laundry services across all properties</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-success/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-bold text-success">${todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold gradient-text">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-info/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold text-info">{totalSessions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Revenue Overview */}
        <div className="dashboard-card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Property Revenue Overview</h2>
            <p className="text-muted-foreground">Laundry service revenue breakdown by property</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {revenueByProperty.map((property) => (
              <div key={property.id} className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Today's Revenue</p>
                    <p className="text-lg font-bold text-success">${property.todayRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-lg font-bold gradient-text">${property.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total Sessions</p>
                    <p className="text-lg font-bold text-foreground">{property.totalSessions.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Avg per Session</p>
                    <p className="text-lg font-bold text-info">
                      ${property.totalSessions > 0 ? (property.totalRevenue / property.totalSessions).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                {/* Recent Revenue Trend */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">Recent Revenue</p>
                  <div className="space-y-2">
                    {revenue
                      .filter(r => r.property_id === property.id)
                      .slice(0, 5)
                      .map((rev) => (
                        <div key={rev.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {new Date(rev.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-medium text-success">${rev.total_revenue.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Summary */}
        <div className="dashboard-card mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Payment Methods</h2>
            <p className="text-muted-foreground">Revenue breakdown by payment method across all properties</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['card', 'mobile', 'coin', 'app'].map((method) => {
              const methodRevenue = revenue.reduce((sum, r) => sum + (r.payment_breakdown[method as keyof typeof r.payment_breakdown] || 0), 0);
              const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;
              
              return (
                <div key={method} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-muted-foreground">
                      {getPaymentIcon(method)}
                    </div>
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
