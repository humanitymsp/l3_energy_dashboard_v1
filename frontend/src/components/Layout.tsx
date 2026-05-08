import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, AlertCircle, Settings, LogOut, Zap, Droplet, AlertTriangle, Activity, Moon, Sun, Menu, X, DollarSign, Wrench } from 'lucide-react';
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
    { name: 'Laundry', href: '/laundry', icon: DollarSign },
    { name: 'Alerts', href: '/alerts', icon: AlertCircle },
    { name: 'Devices', href: '/devices', icon: Building2 },
    { name: 'Integrations', href: '/integrations', icon: Settings },
    { name: 'Admin', href: '/admin', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="nav-header shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img src="/l3-logo.png" alt="Lab3 Solutions" className="h-8 w-8 sm:h-10 sm:w-10" />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Property Dashboard</span>
                    <span className="text-base sm:text-lg font-bold gradient-text">Sabin CDC</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors touch-manipulation"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <span className="hidden lg:inline text-sm text-muted-foreground">
                {user?.signInDetails?.loginId || user?.username || 'User'}
              </span>
              {signOut && (
                <button
                  onClick={signOut}
                  className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-lg text-foreground hover:bg-accent touch-manipulation border border-border"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-4 rounded-lg text-lg font-medium touch-manipulation ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-6 w-6 mr-3" />
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
