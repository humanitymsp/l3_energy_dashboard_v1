import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyView from './pages/PropertyView';
import BuildingView from './pages/BuildingView';
import UnitView from './pages/UnitView';
import AlertsView from './pages/AlertsView';
import IntegrationsView from './pages/IntegrationsView';
import UniFiIntegrationView from './pages/UniFiIntegrationView';
import DeviceMonitoring from './pages/DeviceMonitoring';
import MonitoringDashboard from './pages/MonitoringDashboard';
import SecurityMonitoring from './pages/SecurityMonitoring';

// Mock user for public access
const mockUser = {
  username: 'Guest User',
  attributes: {
    email: 'guest@lab3solutions.com',
  },
};

function App() {
  return (
    <BrowserRouter>
      <Layout user={mockUser} signOut={undefined}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties/:propertyId" element={<PropertyView />} />
          <Route path="/buildings/:buildingId" element={<BuildingView />} />
          <Route path="/units/:unitId" element={<UnitView />} />
          <Route path="/alerts" element={<AlertsView />} />
          <Route path="/devices" element={<DeviceMonitoring />} />
          <Route path="/integrations" element={<IntegrationsView />} />
          <Route path="/integrations/unifi" element={<UniFiIntegrationView />} />
          <Route path="/monitoring" element={<MonitoringDashboard />} />
          <Route path="/monitoring/security" element={<SecurityMonitoring />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
