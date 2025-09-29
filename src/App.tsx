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
import Navigation from './components/Navigation';
import { HebrewCalendarProvider } from './contexts/HebrewCalendarContext';
import { SynagogueProvider } from './contexts/SynagogueContext';

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
            <SynagogueProvider>
              <HebrewCalendarProvider>
                <Router>
                  <Navigation signOut={signOut} user={user} />
                  <Box component="main" sx={{ p: 3, mt: 8 }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/congregants" element={<CongregantManagement />} />
                      <Route path="/events" element={<EventManagement />} />
                      <Route path="/payments" element={<PaymentManagement />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </Box>
                </Router>
              </HebrewCalendarProvider>
            </SynagogueProvider>
          )}
        </Authenticator>
      </Box>
    </ThemeProvider>
  );
}

export default App;
