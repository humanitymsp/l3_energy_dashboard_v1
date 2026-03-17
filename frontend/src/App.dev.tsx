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

// Mock user for local development
const mockUser = {
  username: 'dev@local.dev',
  attributes: {
    email: 'dev@local.dev',
  },
};

const mockSignOut = () => {
  console.log('Sign out clicked (mock)');
};

function App() {
  return (
    <BrowserRouter>
      <Layout user={mockUser} signOut={mockSignOut}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties/:propertyId" element={<PropertyView />} />
          <Route path="/buildings/:buildingId" element={<BuildingView />} />
          <Route path="/units/:unitId" element={<UnitView />} />
          <Route path="/alerts" element={<AlertsView />} />
          <Route path="/integrations" element={<IntegrationsView />} />
          <Route path="/integrations/unifi" element={<UniFiIntegrationView />} />
          <Route path="/devices" element={<DeviceMonitoring />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
