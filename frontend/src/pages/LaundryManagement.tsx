import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  TrendingUp, 
  Clock,
  Zap,
  Droplet,
  CheckCircle,
  XCircle,
  Wrench,
  Activity,
  CreditCard,
  Smartphone,
  Coins,
  Package
} from 'lucide-react';
import { api } from '../lib/api.local';
import { LaundryMachine, LaundrySession, LaundryAlert } from '../lib/types/laundry';

export default function LaundryManagement() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'machines' | 'sessions' | 'alerts' | 'revenue'>('machines');

  // Fetch laundry machines
  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ['laundryMachines', selectedProperty],
    queryFn: () => api.getLaundryMachines(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Fetch active sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['laundrySessions', selectedProperty],
    queryFn: () => api.getLaundrySessions(selectedProperty === 'all' ? undefined : selectedProperty, 10),
  });

  // Fetch laundry alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['laundryAlerts', selectedProperty],
    queryFn: () => api.getLaundryAlerts(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  // Fetch revenue data
  const { data: revenue = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['laundryRevenue', selectedProperty],
    queryFn: () => api.getLaundryRevenue(selectedProperty === 'all' ? undefined : selectedProperty),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'offline': return 'text-destructive';
      case 'maintenance': return 'text-warning';
      case 'out_of_order': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success/10';
      case 'offline': return 'bg-destructive/10';
      case 'maintenance': return 'bg-warning/10';
      case 'out_of_order': return 'bg-destructive/10';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'out_of_order': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-destructive/80 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const machineTypeIcon = (type: string) => {
    return type === 'washer' ? 
      <Droplet className="h-5 w-5 text-blue-500" /> : 
      <Zap className="h-5 w-5 text-orange-500" />;
  };

  const totalRevenue = revenue.reduce((sum, r) => sum + r.total_revenue, 0);
  const totalSessions = revenue.reduce((sum, r) => sum + r.total_sessions, 0);
  const activeMachines = machines.filter(m => m.status === 'online').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Laundry Management</h1>
          <p className="text-muted-foreground">Monitor and manage laundry services, revenue, and machine performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Home className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Machines</p>
                <p className="text-2xl font-bold gradient-text">{activeMachines}/{machines.length}</p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-success/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-success">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-info/10 rounded-lg">
                  <Activity className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-info">{sessions.filter(s => s.status === 'active').length}</p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${criticalAlerts > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
                  <AlertTriangle className={`h-6 w-6 ${criticalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                <p className={`text-2xl font-bold ${criticalAlerts > 0 ? 'text-destructive' : 'gradient-text'}`}>{criticalAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Filter */}
        <div className="mb-6">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Properties</option>
            <option value="prop-001">NBC HQ - Building A</option>
            <option value="prop-002">NBC HQ - Building B</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            {['machines', 'sessions', 'alerts', 'revenue'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Machines Tab */}
          {activeTab === 'machines' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {machines.map((machine) => (
                <div key={machine.id} className="dashboard-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {machineTypeIcon(machine.machine_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{machine.brand} {machine.model}</h3>
                        <p className="text-sm text-muted-foreground">{machine.location}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusBg(machine.status)}`}>
                      {getStatusIcon(machine.status)}
                      <span className={`text-sm font-medium ${getStatusColor(machine.status)}`}>
                        {machine.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Cycles</p>
                      <p className="font-bold text-foreground">{machine.total_cycles.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Today's Cycles</p>
                      <p className="font-bold text-foreground">{machine.cycles_today}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Revenue Today</p>
                      <p className="font-bold text-success">${machine.revenue_today.toFixed(2)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Efficiency Score</p>
                      <p className="font-bold text-foreground">{machine.efficiency_score}%</p>
                    </div>
                  </div>

                  {machine.current_cycle_start && (
                    <div className="bg-info/10 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-info" />
                        <span className="text-sm font-medium text-info">Cycle in Progress</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started: {new Date(machine.current_cycle_start).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {machine.error_codes.length > 0 && (
                    <div className="bg-destructive/10 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Error Codes</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {machine.error_codes.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Serial: {machine.serial_number}
                    </span>
                    <Link
                      to={`/laundry/machines/${machine.id}`}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="dashboard-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-foreground">Machine</th>
                      <th className="text-left p-4 font-medium text-foreground">User</th>
                      <th className="text-left p-4 font-medium text-foreground">Type</th>
                      <th className="text-left p-4 font-medium text-foreground">Duration</th>
                      <th className="text-left p-4 font-medium text-foreground">Cost</th>
                      <th className="text-left p-4 font-medium text-foreground">Payment</th>
                      <th className="text-left p-4 font-medium text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {machineTypeIcon(session.machine_type)}
                            <span className="font-medium">{session.machine_id}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{session.unit_number || 'Guest'}</p>
                            <p className="text-sm text-muted-foreground">{session.user_id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-muted rounded text-sm">
                            {session.cycle_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{session.duration || 'Active'} min</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-success">${session.cost.toFixed(2)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getPaymentIcon(session.payment_method)}
                            <span className="text-sm">{session.payment_method}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'active' 
                              ? 'bg-success/10 text-success' 
                              : session.status === 'completed'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="dashboard-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        <p className="text-muted-foreground mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-sm text-muted-foreground">
                            {alert.machine_location || 'Property Level'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {!alert.resolved && (
                        <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/80">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {revenue.map((rev) => (
                <div key={rev.id} className="dashboard-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    {new Date(rev.date).toLocaleDateString()} Revenue
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-bold text-success">${rev.total_revenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Sessions</p>
                      <p className="text-xl font-bold text-foreground">{rev.total_sessions}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Washer Revenue</span>
                      <span className="font-medium">${rev.washer_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Dryer Revenue</span>
                      <span className="font-medium">${rev.dryer_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Peak Hour</span>
                      <span className="font-medium">{rev.peak_hour}:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Duration</span>
                      <span className="font-medium">{rev.average_session_duration} min</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Payment Methods</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(rev.payment_breakdown).map(([method, amount]) => (
                        <div key={method} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getPaymentIcon(method)}
                            <span className="text-sm text-muted-foreground capitalize">{method}</span>
                          </div>
                          <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
