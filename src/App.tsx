import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

import amplifyconfig from './amplifyconfiguration.json';
import Dashboard from './components/Dashboard';
import CongregantManagement from './components/CongregantManagement';
import EventManagement from './components/EventManagement';
import PaymentManagement from './components/PaymentManagement';
import Reports from './components/Reports';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import { HebrewCalendarProvider } from './contexts/HebrewCalendarContext';
import { SynagogueProvider } from './contexts/SynagogueContext';
import { AdminProvider, useAdmin, UserRole } from './contexts/AdminContext';

Amplify.configure(amplifyconfig);

// RTL Theme for Hebrew support
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: [
      'Segoe UI',
      'Tahoma',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Role-based routing component
const AppRoutes: React.FC = () => {
  const { userRole } = useAdmin();

  return (
    <Routes>
      {/* Super Admin Routes */}
      {userRole === UserRole.SUPER_ADMIN && (
        <>
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </>
      )}
      
      {/* Admin Routes */}
      {(userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}
      
      {/* Regular User Routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/congregants" element={<CongregantManagement />} />
      <Route path="/events" element={<EventManagement />} />
      <Route path="/payments" element={<PaymentManagement />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box dir="rtl">
        <Authenticator
          loginMechanisms={['email']}
          signUpAttributes={['email']}
          hideSignUp={true}
        >
          {({ signOut, user }) => (
            <AdminProvider>
              <SynagogueProvider>
                <HebrewCalendarProvider>
                  <Router>
                    <Navigation signOut={signOut} user={user} />
                    <Box component="main" sx={{ p: 3, mt: 8 }}>
                      <AppRoutes />
                    </Box>
                  </Router>
                </HebrewCalendarProvider>
              </SynagogueProvider>
            </AdminProvider>
          )}
        </Authenticator>
      </Box>
    </ThemeProvider>
  );
}

export default App;
