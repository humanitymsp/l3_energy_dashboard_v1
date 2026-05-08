import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp,
  Calendar,
  Building2,
  CreditCard,
  Smartphone,
  Coins,
  Package,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  Target,
  Download,
  AlertTriangle,
  Bell,
  X
} from 'lucide-react';
import { api } from '../lib/api.local';

type DateRange = 'today' | '7d' | '14d' | '30d' | 'this_month' | 'custom';

function getDateRangeFilter(range: DateRange): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  switch (range) {
    case 'today':
      start = now;
      break;
    case '7d':
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      break;
    case '14d':
      start = new Date(now);
      start.setDate(start.getDate() - 13);
      break;
    case '30d':
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 29);
  }

  return { start: start.toISOString().split('T')[0], end };
}

export default function LaundryManagement() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showAlerts, setShowAlerts] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fetch revenue data
  const { data: allRevenue = [], isLoading: revenueLoading, isFetching } = useQuery({
    queryKey: ['laundryRevenue', selectedProperty],
    queryFn: () => api.getLaundryRevenue(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Fetch properties for context
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.getProperties(),
  });

  // Fetch alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['laundryAlerts', selectedProperty],
    queryFn: () => api.getLaundryAlerts(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Filter revenue by date range
  const { start, end } = getDateRangeFilter(dateRange);
  const revenue = useMemo(() => {
    return allRevenue.filter(r => r.date >= start && r.date <= end);
  }, [allRevenue, start, end]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['laundryRevenue'] });
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    queryClient.invalidateQueries({ queryKey: ['laundryAlerts'] });
    setLastUpdated(new Date());
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Property', 'Revenue', 'Sessions', 'Card', 'Mobile', 'Coin', 'App'];
    const rows = revenue.map(r => {
      const propName = properties.find(p => p.id === r.property_id)?.name || r.property_id;
      return [
        r.date,
        propName,
        r.total_revenue.toFixed(2),
        r.total_sessions,
        r.payment_breakdown.card.toFixed(2),
        r.payment_breakdown.mobile.toFixed(2),
        r.payment_breakdown.coin.toFixed(2),
        r.payment_breakdown.app.toFixed(2),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laundry-revenue-${start}-to-${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'coin': return <Coins className="h-4 w-4" />;
      case 'app': return <Package className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  // Calculate totals from filtered data
  const totalRevenue = revenue.reduce((sum, r) => sum + r.total_revenue, 0);
  const totalSessions = revenue.reduce((sum, r) => sum + r.total_sessions, 0);
  const todayRevenue = revenue.find(r => r.date === new Date().toISOString().split('T')[0])?.total_revenue || 0;

  // Calculate yesterday's revenue for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayRevenue = revenue.find(r => r.date === yesterdayStr)?.total_revenue || 0;
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  // Projected monthly total
  const daysInRange = revenue.length > 0 ? new Set(revenue.map(r => r.date)).size : 1;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedMonthly = daysInRange > 0 ? (totalRevenue / daysInRange) * daysInMonth : 0;

  // Revenue alerts based on thresholds
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const highSeverityCount = unresolvedAlerts.filter(a => a.severity === 'high').length;

  // Group revenue by property
  const revenueByProperty = properties.map(property => {
    const propertyRevenue = revenue.filter(r => r.property_id === property.id);
    const propertyTotal = propertyRevenue.reduce((sum, r) => sum + r.total_revenue, 0);
    const propertySessions = propertyRevenue.reduce((sum, r) => sum + r.total_sessions, 0);
    const propTodayRevenue = propertyRevenue.find(r => r.date === new Date().toISOString().split('T')[0])?.total_revenue || 0;
    const propYesterdayRevenue = propertyRevenue.find(r => r.date === yesterdayStr)?.total_revenue || 0;
    const propChange = propYesterdayRevenue > 0 ? ((propTodayRevenue - propYesterdayRevenue) / propYesterdayRevenue) * 100 : 0;

    // Weekly average for alert threshold
    const weekRevenue = propertyRevenue.slice(0, 7);
    const weekAvg = weekRevenue.length > 0 ? weekRevenue.reduce((s, r) => s + r.total_revenue, 0) / weekRevenue.length : 0;
    const belowThreshold = weekAvg > 0 && propTodayRevenue < weekAvg * 0.75;
    
    return {
      ...property,
      totalRevenue: propertyTotal,
      totalSessions: propertySessions,
      todayRevenue: propTodayRevenue,
      revenueChange: propChange,
      revenueHistory: propertyRevenue.slice(0, 7),
      belowThreshold,
      weeklyAvg: weekAvg
    };
  });

  if (revenueLoading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded w-full max-w-xs"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Sub-navigation */}
        <div className="flex items-center space-x-1 mb-4 sm:mb-6 bg-muted/50 rounded-lg p-1 w-fit">
          <Link
            to="/laundry"
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              location.pathname === '/laundry'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/laundry/dashboard"
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              location.pathname === '/laundry/dashboard'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analytics
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">Laundry Services</h1>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 border border-border rounded-lg hover:bg-muted transition-colors"
              title="Revenue Alerts"
            >
              <Bell className="h-4 w-4" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Alerts Panel */}
        {showAlerts && unresolvedAlerts.length > 0 && (
          <div className="mb-4 sm:mb-6 border border-destructive/30 bg-destructive/5 rounded-lg p-3 sm:p-4 animate-slide-up-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Active Alerts ({unresolvedAlerts.length})</h3>
              </div>
              <button onClick={() => setShowAlerts(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {unresolvedAlerts.map(alert => (
                <div key={alert.id} className="flex items-start space-x-3 p-2 bg-background rounded-lg">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.severity === 'high' ? 'bg-destructive' : alert.severity === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(alert.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    alert.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    alert.severity === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>{alert.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Range Picker + Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              { key: 'today', label: 'Today' },
              { key: '7d', label: '7 Days' },
              { key: '14d', label: '14 Days' },
              { key: '30d', label: '30 Days' },
              { key: 'this_month', label: 'This Month' },
            ] as { key: DateRange; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  dateRange === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted text-foreground rounded-md text-xs sm:text-sm font-medium transition-colors"
            title="Export to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="metric-card animate-slide-up-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-success">${todayRevenue.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {revenueChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-success mr-0.5" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive mr-0.5" />
                  )}
                  <span className={`text-xs font-medium ${revenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {Math.abs(revenueChange).toFixed(1)}% vs yesterday
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </div>

          <div className="metric-card animate-slide-up-sm [animation-delay:75ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold gradient-text">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{revenue.length} days tracked</p>
              </div>
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="metric-card animate-slide-up-sm [animation-delay:150ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Projected Monthly</p>
                <p className="text-xl sm:text-2xl font-bold text-info">${projectedMonthly.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on current pace</p>
              </div>
              <div className="p-2 sm:p-3 bg-info/10 rounded-lg">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-info" />
              </div>
            </div>
          </div>

          <div className="metric-card animate-slide-up-sm [animation-delay:200ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{totalSessions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${totalSessions > 0 ? (totalRevenue / totalSessions).toFixed(2) : '0.00'}/session
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Property Revenue Overview */}
        <div className="dashboard-card p-3 sm:p-6 animate-slide-up [animation-delay:300ms]">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Property Revenue</h2>
            <p className="text-sm text-muted-foreground">Performance by property with weekly trend</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {revenueByProperty.map((property) => (
              <div key={property.id} className={`border rounded-lg p-3 sm:p-5 transition-colors ${
                property.belowThreshold ? 'border-destructive/40 bg-destructive/5' : 'border-border hover:border-primary/30'
              }`}>
                {property.belowThreshold && (
                  <div className="flex items-center space-x-1.5 mb-2 text-xs text-destructive font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Below weekly avg (${property.weeklyAvg.toFixed(0)}/day)</span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground">{property.name}</h3>
                      <p className="text-xs text-muted-foreground">{property.address}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    property.revenueChange >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {property.revenueChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    <span>{Math.abs(property.revenueChange).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Mini Sparkline */}
                <div className="flex items-end space-x-1 h-8 mb-3">
                  {property.revenueHistory.map((rev, i) => {
                    const maxRev = Math.max(...property.revenueHistory.map(r => r.total_revenue), 1);
                    const height = (rev.total_revenue / maxRev) * 100;
                    return (
                      <div
                        key={rev.id}
                        className={`flex-1 rounded-t transition-all ${
                          i === 0 ? 'bg-primary' : 'bg-primary/40'
                        }`}
                        style={{ height: `${Math.max(height, 8)}%` }}
                        title={`${new Date(rev.date).toLocaleDateString()}: $${rev.total_revenue.toFixed(2)}`}
                      ></div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-sm sm:text-base font-bold text-success">${property.todayRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm sm:text-base font-bold gradient-text">${property.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                    <p className="text-xs text-muted-foreground">Sessions</p>
                    <p className="text-sm sm:text-base font-bold text-foreground">{property.totalSessions.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                    <p className="text-xs text-muted-foreground">Avg/Session</p>
                    <p className="text-sm sm:text-base font-bold text-info">
                      ${property.totalSessions > 0 ? (property.totalRevenue / property.totalSessions).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Summary */}
        <div className="dashboard-card mt-4 sm:mt-6 p-3 sm:p-6 animate-slide-up [animation-delay:500ms]">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">Payment Methods</h2>
            <p className="text-sm text-muted-foreground">Revenue by payment method</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {['card', 'mobile', 'coin', 'app'].map((method) => {
              const methodRevenue = revenue.reduce((sum, r) => sum + (r.payment_breakdown[method as keyof typeof r.payment_breakdown] || 0), 0);
              const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;
              
              return (
                <div key={method} className="bg-muted/50 rounded-lg p-3 sm:p-4 hover:bg-muted/80 transition-colors">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                    <div className="text-muted-foreground">
                      {getPaymentIcon(method)}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground capitalize">{method}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-success">${methodRevenue.toFixed(2)}</p>
                  <div className="mt-1.5">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
