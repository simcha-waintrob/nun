import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AliyahIcon from '@mui/icons-material/BookOnline';
import { useHebrewCalendar } from '../contexts/HebrewCalendarContext';

interface Aliyah {
  id: string;
  type: string;
  congregantName: string;
  amount: number;
}

const EventManagement: React.FC = () => {
  const { events } = useHebrewCalendar();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [aliyahDialogOpen, setAliyahDialogOpen] = useState(false);
  const [aliyot, setAliyot] = useState<Aliyah[]>([]);

  // Mock congregants data
  const congregants = [
    { id: '1', name: 'יוסף כהן' },
    { id: '2', name: 'דוד לוי' },
    { id: '3', name: 'משה אברהם' },
    { id: '4', name: 'אהרן ישראל' },
    { id: '5', name: 'יעקב שמואל' }
  ];

  const aliyahTypes = [
    { value: 'KOHEN', label: 'כהן' },
    { value: 'LEVI', label: 'לוי' },
    { value: 'SHLISHI', label: 'שלישי' },
    { value: 'REVI', label: 'רביעי' },
    { value: 'CHAMISHI', label: 'חמישי' },
    { value: 'SHISHI', label: 'שישי' },
    { value: 'SHVII', label: 'שביעי' },
    { value: 'MAFTIR', label: 'מפטיר' },
    { value: 'EXTRA_1', label: 'תוספת 1' },
    { value: 'EXTRA_2', label: 'תוספת 2' },
    { value: 'EXTRA_3', label: 'תוספת 3' },
    { value: 'EXTRA_4', label: 'תוספת 4' }
  ];

  const [newAliyah, setNewAliyah] = useState({
    type: '',
    congregantName: '',
    amount: 0
  });

  const handleOpenAliyahDialog = (event: any) => {
    setSelectedEvent(event);
    // Load existing aliyot for this event (mock data)
    setAliyot([
      { id: '1', type: 'KOHEN', congregantName: 'יוסף כהן', amount: 180 },
      { id: '2', type: 'LEVI', congregantName: 'דוד לוי', amount: 150 }
    ]);
    setAliyahDialogOpen(true);
  };

  const handleAddAliyah = () => {
    if (newAliyah.type && newAliyah.congregantName && newAliyah.amount > 0) {
      const aliyah: Aliyah = {
        id: Date.now().toString(),
        ...newAliyah
      };
      setAliyot(prev => [...prev, aliyah]);
      setNewAliyah({ type: '', congregantName: '', amount: 0 });
    }
  };

  const handleDeleteAliyah = (id: string) => {
    setAliyot(prev => prev.filter(a => a.id !== id));
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'SHABBAT_PARASHA': return 'שבת פרשה';
      case 'HOLIDAY': return 'חג';
      case 'FAST': return 'צום';
      default: return 'אחר';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'SHABBAT_PARASHA': return 'primary';
      case 'HOLIDAY': return 'secondary';
      case 'FAST': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ניהול אירועים
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {event.title}
                  </Typography>
                  <Chip
                    label={getEventTypeLabel(event.eventType)}
                    color={getEventTypeColor(event.eventType) as any}
                    size="small"
                  />
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  {event.hebrewDateStr}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {event.gregorianDate.toLocaleDateString('he-IL')}
                </Typography>
                
                {event.parashaName && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    פרשת {event.parashaName}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<AliyahIcon />}
                  onClick={() => handleOpenAliyahDialog(event)}
                >
                  ניהול עליות
                </Button>
                <Button size="small" startIcon={<AddIcon />}>
                  הוסף קניה/טקס
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Aliyah Management Dialog */}
      <Dialog open={aliyahDialogOpen} onClose={() => setAliyahDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          ניהול עליות - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              הוסף עלייה חדשה
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>סוג עלייה</InputLabel>
                  <Select
                    value={newAliyah.type}
                    onChange={(e) => setNewAliyah(prev => ({ ...prev, type: e.target.value }))}
                    label="סוג עלייה"
                  >
                    {aliyahTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={congregants}
                  getOptionLabel={(option) => option.name}
                  value={congregants.find(c => c.name === newAliyah.congregantName) || null}
                  onChange={(_, value) => setNewAliyah(prev => ({ ...prev, congregantName: value?.name || '' }))}
                  renderInput={(params) => <TextField {...params} label="מתפלל" />}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="סכום (₪)"
                  type="number"
                  value={newAliyah.amount}
                  onChange={(e) => setNewAliyah(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleAddAliyah}
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  הוסף
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom>
            עליות קיימות
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>סוג עלייה</TableCell>
                  <TableCell>מתפלל</TableCell>
                  <TableCell>סכום</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aliyot.map((aliyah) => (
                  <TableRow key={aliyah.id}>
                    <TableCell>
                      {aliyahTypes.find(t => t.value === aliyah.type)?.label || aliyah.type}
                    </TableCell>
                    <TableCell>{aliyah.congregantName}</TableCell>
                    <TableCell>₪{aliyah.amount}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAliyah(aliyah.id)}
                      >
                        מחק
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAliyahDialogOpen(false)}>סגור</Button>
          <Button variant="contained">שמור שינויים</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagement;
