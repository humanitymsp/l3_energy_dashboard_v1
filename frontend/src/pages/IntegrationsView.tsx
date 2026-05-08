import { Activity, Wifi, WifiOff, Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IntegrationsView() {
  const integrations = [
    { name: 'UniFi Protect & AlarmHub', status: 'connected', lastSync: '30 seconds ago', detailsPath: '/integrations/unifi', featured: true },
    { name: 'Home Assistant', status: 'connected', lastSync: '2 minutes ago' },
    { name: 'MQTT Broker', status: 'connected', lastSync: '1 minute ago' },
    { name: 'AWS IoT Core', status: 'connected', lastSync: 'Just now' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
      </div>

      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Connected Services</h2>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  integration.featured ? 'border-primary/40 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {integration.featured ? (
                    <Shield className="h-6 w-6 text-primary" />
                  ) : integration.status === 'connected' ? (
                    <Wifi className="h-6 w-6 text-success" />
                  ) : (
                    <WifiOff className="h-6 w-6 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {integration.name}
                      {integration.featured && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          Featured
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      integration.status === 'connected'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {integration.status}
                  </span>
                  {integration.detailsPath ? (
                    <Link
                      to={integration.detailsPath}
                      className="inline-flex items-center px-3 py-1 border border-primary/40 text-xs font-medium rounded text-primary bg-card hover:bg-primary/5"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  ) : (
                    <button className="inline-flex items-center px-3 py-1 border border-border text-xs font-medium rounded text-foreground bg-card hover:bg-muted">
                      Configure
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-foreground">
              All integrations are operational. Data is being collected and processed in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
