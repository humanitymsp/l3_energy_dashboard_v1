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
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Services</h2>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  integration.featured ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {integration.featured ? (
                    <Shield className="h-6 w-6 text-blue-600" />
                  ) : integration.status === 'connected' ? (
                    <Wifi className="h-6 w-6 text-green-500" />
                  ) : (
                    <WifiOff className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {integration.name}
                      {integration.featured && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">Last sync: {integration.lastSync}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      integration.status === 'connected'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {integration.status}
                  </span>
                  {integration.detailsPath ? (
                    <Link
                      to={integration.detailsPath}
                      className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  ) : (
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Configure
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              All integrations are operational. Data is being collected and processed in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
