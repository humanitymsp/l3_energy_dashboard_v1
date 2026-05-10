import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp,
  DollarSign,
  BarChart3,
  CreditCard,
  Smartphone,
  Coins,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  Target,
  Download
} from 'lucide-react';
import { api } from '../lib/api.local';

type DateRange = 'today' | '7d' | '14d' | '30d' | 'this_month';

function getDateRangeFilter(range: DateRange): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;
  switch (range) {
    case 'today': start = now; break;
    case '7d': start = new Date(now); start.setDate(start.getDate() - 6); break;
    case '14d': start = new Date(now); start.setDate(start.getDate() - 13); break;
    case '30d': start = new Date(now); start.setDate(start.getDate() - 29); break;
    case 'this_month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    default: start = new Date(now); start.setDate(start.getDate() - 29);
  }
  return { start: start.toISOString().split('T')[0], end };
}

export default function LaundryDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fetch revenue data
  const { data: allRevenueData = [], isLoading: revenueLoading, isFetching } = useQuery({
    queryKey: ['laundryRevenue', selectedProperty],
    queryFn: () => api.getLaundryRevenue(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Fetch properties for context
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.getProperties(),
  });

  const { start, end } = getDateRangeFilter(dateRange);
  const revenueData = useMemo(() => {
    return allRevenueData.filter(r => r.date >= start && r.date <= end);
  }, [allRevenueData, start, end]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['laundryRevenue'] });
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    setLastUpdated(new Date());
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Property', 'Revenue', 'Sessions', 'Card', 'CSC GO', 'Coin'];
    const rows = revenueData.map(r => {
      const propName = properties.find(p => p.id === r.property_id)?.name || r.property_id;
      return [r.date, propName, r.total_revenue.toFixed(2), r.total_sessions,
        r.payment_breakdown.card.toFixed(2), r.payment_breakdown.csc_go.toFixed(2),
        r.payment_breakdown.coin.toFixed(2)
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laundry-analytics-${start}-to-${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (revenueLoading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded w-full max-w-xs"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

  // Calculate metrics
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.total_revenue, 0);
  const totalSessions = revenueData.reduce((sum, r) => sum + r.total_sessions, 0);
  const todayRevenue = revenueData.find(r => r.date === new Date().toISOString().split('T')[0])?.total_revenue || 0;
  const averageRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

  // Yesterday comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayRevenue = revenueData.find(r => r.date === yesterdayStr)?.total_revenue || 0;
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  // Projected monthly
  const daysInRange = revenueData.length > 0 ? new Set(revenueData.map(r => r.date)).size : 1;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedMonthly = daysInRange > 0 ? (totalRevenue / daysInRange) * daysInMonth : 0;

  // Peak revenue day
  const peakDay = revenueData.reduce((max, r) => r.total_revenue > (max?.total_revenue || 0) ? r : max, revenueData[0]);
  const maxRevenue = Math.max(...revenueData.map(r => r.total_revenue), 1);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'csc_go': return <Smartphone className="h-4 w-4" />;
      case 'coin': return <Coins className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">Revenue Analytics</h1>
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
              onClick={handleRefresh}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                    {Math.abs(revenueChange).toFixed(1)}%
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
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Projected Monthly</p>
                <p className="text-xl sm:text-2xl font-bold gradient-text">${projectedMonthly.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">{daysInRange} days tracked</p>
              </div>
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="metric-card animate-slide-up-sm [animation-delay:150ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg per Session</p>
                <p className="text-xl sm:text-2xl font-bold text-info">${averageRevenuePerSession.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalSessions} total</p>
              </div>
              <div className="p-2 sm:p-3 bg-info/10 rounded-lg">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-info" />
              </div>
            </div>
          </div>

          <div className="metric-card animate-slide-up-sm [animation-delay:200ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{revenueData.length} days</p>
              </div>
              <div className="p-2 sm:p-3 bg-muted rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="dashboard-card p-3 sm:p-6 mb-4 sm:mb-6 animate-slide-up [animation-delay:300ms]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Daily Revenue</h3>
            {peakDay && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                Peak: ${peakDay.total_revenue.toFixed(2)} on {new Date(peakDay.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          {/* Visual Bar Chart */}
          <div className="flex items-end space-x-1 sm:space-x-2 h-32 sm:h-40 mb-3">
            {revenueData.map((rev, i) => {
              const height = (rev.total_revenue / maxRevenue) * 100;
              const isToday = rev.date === new Date().toISOString().split('T')[0];
              return (
                <div key={rev.id} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 ${
                      isToday ? 'bg-primary' : 'bg-primary/40'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${new Date(rev.date).toLocaleDateString()}: $${rev.total_revenue.toFixed(2)}`}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {revenueData.length > 0 && (
              <>
                <span>{new Date(revenueData[revenueData.length - 1]?.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                <span>{new Date(revenueData[0]?.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </>
            )}
          </div>

          {/* Revenue List */}
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {revenueData.slice(0, 5).map((rev, i) => {
              const prevRev = revenueData[i + 1];
              const change = prevRev ? ((rev.total_revenue - prevRev.total_revenue) / prevRev.total_revenue) * 100 : 0;
              return (
                <div key={rev.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`}></div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(rev.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">${rev.total_revenue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{rev.total_sessions} sessions</p>
                    </div>
                    {prevRev && (
                      <div className={`flex items-center text-xs font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(change).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="dashboard-card p-3 sm:p-6 animate-slide-up [animation-delay:500ms]">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Payment Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {['card', 'csc_go', 'coin'].map((method) => {
              const methodRevenue = revenueData.reduce((sum, r) => sum + (r.payment_breakdown[method as keyof typeof r.payment_breakdown] || 0), 0);
              const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;

              return (
                <div key={method} className="bg-muted/50 rounded-lg p-3 sm:p-4 hover:bg-muted/80 transition-colors">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                    <div className="text-muted-foreground">{getPaymentIcon(method)}</div>
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
