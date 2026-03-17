import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, AlertCircle, Settings, LogOut, Zap, Droplet, AlertTriangle, Activity, Moon, Sun, Brain, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
  user: any;
  signOut?: () => void;
}

export default function Layout({ children, user, signOut }: LayoutProps) {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Monitoring', href: '/monitoring', icon: Activity },
    { name: 'Analytics', href: '/analytics', icon: Brain },
    { name: 'Alerts', href: '/alerts', icon: AlertCircle },
    { name: 'Devices', href: '/devices', icon: Building2 },
    { name: 'Integrations', href: '/integrations', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img src="/l3-logo.png" alt="Lab3 Solutions" className="h-8 w-8 sm:h-10 sm:w-10" />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Lab3 Solutions</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Nexus</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                {user?.signInDetails?.loginId || user?.username || 'User'}
              </span>
              {signOut && (
                <button
                  onClick={signOut}
                  className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium touch-manipulation ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
