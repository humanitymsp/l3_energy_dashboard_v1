import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api.local';
import { format } from 'date-fns';

export default function AlertsView() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts({ limit: 100 }),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) =>
      api.updateAlert(alertId, { status: 'acknowledged', acknowledged_by: 'current_user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) =>
      api.updateAlert(alertId, { status: 'resolved', resolved_by: 'current_user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-destructive mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Active</dt>
              <dd className="text-2xl font-semibold text-destructive">{activeAlerts.length}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Acknowledged</dt>
              <dd className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{acknowledgedAlerts.length}</dd>
            </div>
          </div>
        </div>

        <div className="bg-card overflow-hidden shadow rounded-lg border border-border p-5">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-success mr-3" />
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Resolved</dt>
              <dd className="text-2xl font-semibold text-success">{resolvedAlerts.length}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">All Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : alert.severity === 'high'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    : alert.severity === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'critical'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                            : alert.severity === 'high'
                            ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.status === 'active'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                            : alert.status === 'acknowledged'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{alert.property_name}</span>
                      {alert.building_name && <span>{alert.building_name}</span>}
                      {alert.unit_number && <span>Unit {alert.unit_number}</span>}
                      <span>{format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900/70"
                      >
                        Acknowledge
                      </button>
                    )}
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/70"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
