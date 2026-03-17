import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyView from './pages/PropertyView';
import BuildingView from './pages/BuildingView';
import UnitView from './pages/UnitView';
import AlertsView from './pages/AlertsView';
import IntegrationsView from './pages/IntegrationsView';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Layout user={user} signOut={signOut}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties/:propertyId" element={<PropertyView />} />
              <Route path="/buildings/:buildingId" element={<BuildingView />} />
              <Route path="/units/:unitId" element={<UnitView />} />
              <Route path="/alerts" element={<AlertsView />} />
              <Route path="/integrations" element={<IntegrationsView />} />
              <Route path="/integrations/unifi" element={<UniFiIntegrationView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}

export default App;
