import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, AlertCircle, Settings, LogOut, Zap, Droplet, AlertTriangle, Activity } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  user: any;
  signOut?: () => void;
}

export default function Layout({ children, user, signOut }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Alerts', href: '/alerts', icon: AlertCircle },
    { name: 'Devices', href: '/devices', icon: Activity },
    { name: 'Integrations', href: '/integrations', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-3">
                  <img src="/l3-logo.png" alt="Lab3 Solutions" className="h-10 w-10" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">Lab3 Solutions</span>
                    <span className="text-lg font-bold text-gray-900">Energy Dashboard</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.signInDetails?.loginId || user?.username || 'User'}
              </span>
              {signOut && (
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
