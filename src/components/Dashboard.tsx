import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import { useSynagogue } from '../contexts/SynagogueContext';
import { useHebrewCalendar } from '../contexts/HebrewCalendarContext';
import { useAdmin } from '../contexts/AdminContext';

const Dashboard: React.FC = () => {
  const { currentSynagogue } = useSynagogue();
  const { currentHebrewYear, events, loading } = useHebrewCalendar();
  const { synagogues } = useAdmin();
  
  // Get current synagogue data with logo
  const currentSynagogueData = synagogues.find(s => s.id === currentSynagogue?.id);

  // Mock data for demonstration
  const stats = {
    totalCongregants: 156,
    activeEvents: 12,
    pendingPayments: 8,
    totalRevenue: 45600
  };

  const upcomingEvents = events
    .filter(event => event.gregorianDate >= new Date())
    .slice(0, 5);

  const recentPayments = [
    { id: 1, congregant: 'יוסף כהן', amount: 180, date: '2025-01-15', type: 'עלייה לתורה' },
    { id: 2, congregant: 'דוד לוי', amount: 250, date: '2025-01-14', type: 'קידוש' },
    { id: 3, congregant: 'משה אברהם', amount: 120, date: '2025-01-13', type: 'הגבהה' }
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          טוען נתונים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {currentSynagogueData?.logoUrl && (
          <Avatar
            src={currentSynagogueData.logoUrl}
            alt={currentSynagogueData.hebrewName}
            sx={{ width: 64, height: 64, mr: 3 }}
          />
        )}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            דשבורד - {currentSynagogue?.name}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            שנת {currentHebrewYear?.yearLabel}
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    מתפללים
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCongregants}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    אירועים פעילים
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeEvents}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    תשלומים ממתינים
                  </Typography>
                  <Typography variant="h4">
                    {stats.pendingPayments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    הכנסות השנה
                  </Typography>
                  <Typography variant="h4">
                    ₪{stats.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              אירועים קרובים
            </Typography>
            <List>
              {upcomingEvents.map((event) => (
                <ListItem key={event.id} divider>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {event.gregorianDate.toLocaleDateString('he-IL')}
                        </Typography>
                        <Chip
                          size="small"
                          label={event.eventType === 'SHABBAT_PARASHA' ? 'שבת' : 'חג'}
                          color={event.eventType === 'SHABBAT_PARASHA' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              תשלומים אחרונים
            </Typography>
            <List>
              {recentPayments.map((payment) => (
                <ListItem key={payment.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {payment.congregant}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          ₪{payment.amount}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {payment.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(payment.date).toLocaleDateString('he-IL')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
