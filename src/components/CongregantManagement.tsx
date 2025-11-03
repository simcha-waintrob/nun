import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Fab,
  Grid,
  InputAdornment,
  Tabs,
  Tab,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useSynagogue } from '../contexts/SynagogueContext';
import { getParshiotForSelect } from '../utils/parshiot';
import HebrewDatePicker from './HebrewDatePicker';
import HebrewDateService from '../services/hebrewDateService';

interface Address {
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  city: string;
  postalCode?: string;
}

// Torah Aliyah types
interface Aliyah {
  id: string;
  congregantId: string;
  date: string; // Hebrew date
  gregorianDate: string;
  parasha: string;
  aliyahNumber?: number;
  aliyahType: string;
  amount?: number;
  notes?: string;
  createdAt: string;
}

// Pledge types
interface Pledge {
  id: string;
  congregantId: string;
  type: 'KIDDUSH' | 'SEUDA_SHLISHIT' | 'YAHRZEIT' | 'SIMCHA' | 'GENERAL';
  title: string;
  description?: string;
  date: string;
  gregorianDate: string;
  amount: number;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase types
interface Purchase {
  id: string;
  congregantId: string;
  type: 'SEFER_TORAH' | 'MEZUZAH' | 'TEFILLIN' | 'TALLIT' | 'SIDDUR' | 'PAROCHET' | 'OTHER';
  title: string;
  description?: string;
  amount: number;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

interface Congregant {
  id: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  identityNumber?: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address?: Address;
  status: 'ACTIVE' | 'INACTIVE';
  familyUnitId?: string;
  notes?: string;
}

const CongregantManagement: React.FC = () => {
  const { currentSynagogue } = useSynagogue();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCongregant, setSelectedCongregant] = useState<Congregant | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [congregants, setCongregants] = useState<Congregant[]>([
    {
      id: '1',
      firstName: 'יוסף',
      lastName: 'כהן',
      phone: '050-1234567',
      email: 'yosef@example.com',
      status: 'ACTIVE'
    },
    {
      id: '2',
      firstName: 'דוד',
      lastName: 'לוי',
      phone: '052-9876543',
      email: 'david@example.com',
      status: 'ACTIVE'
    },
    {
      id: '3',
      firstName: 'משה',
      lastName: 'אברהם',
      phone: '054-5555555',
      status: 'INACTIVE'
    }
  ]);

  // Mock data for aliyot, pledges, purchases
  const [aliyot, setAliyot] = useState<Aliyah[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [open, setOpen] = useState(false);
  const [editingCongregant, setEditingCongregant] = useState<Congregant | null>(null);
  const [formData, setFormData] = useState<Partial<Congregant>>({
    firstName: '',
    lastName: '',
    fatherName: '',
    identityNumber: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    address: {
      street: '',
      houseNumber: '',
      apartmentNumber: '',
      city: '',
      postalCode: ''
    },
    status: 'ACTIVE',
    notes: ''
  });

  // Search filter
  const filteredCongregants = useMemo(() => {
    if (!searchTerm) return congregants;
    
    const term = searchTerm.toLowerCase();
    return congregants.filter(c => 
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  }, [congregants, searchTerm]);

  const handleOpen = (congregant?: Congregant) => {
    if (congregant) {
      setEditingCongregant(congregant);
      setFormData(congregant);
    } else {
      setEditingCongregant(null);
      setFormData({
        firstName: '',
        lastName: '',
        fatherName: '',
        identityNumber: '',
        phone: '',
        secondaryPhone: '',
        email: '',
        address: {
          street: '',
          houseNumber: '',
          apartmentNumber: '',
          city: '',
          postalCode: ''
        },
        status: 'ACTIVE',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCongregant(null);
    setFormData({});
  };

  const handleSave = () => {
    if (editingCongregant) {
      // Update existing congregant
      setCongregants(prev => 
        prev.map(c => c.id === editingCongregant.id ? { ...c, ...formData } as Congregant : c)
      );
    } else {
      // Add new congregant
      const newCongregant: Congregant = {
        ...formData as Congregant,
        id: Date.now().toString()
      };
      setCongregants(prev => [...prev, newCongregant]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המתפלל?')) {
      setCongregants(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleViewDetails = (congregant: Congregant) => {
    setSelectedCongregant(congregant);
    setDetailsOpen(true);
  };

  const handleAddAliyah = (aliyah: Aliyah) => {
    setAliyot(prev => [...prev, aliyah]);
  };

  const handleAddPledge = (pledge: Pledge) => {
    setPledges(prev => [...prev, pledge]);
  };

  const handleAddPurchase = (purchase: Purchase) => {
    setPurchases(prev => [...prev, purchase]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <AccountBoxIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          ניהול מתפללים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          הוסף מתפלל
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="חיפוש לפי שם, טלפון או אימייל..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={() => setSearchTerm('')} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell align="center">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCongregants.map((congregant) => (
              <TableRow key={congregant.id}>
                <TableCell>{`${congregant.firstName} ${congregant.lastName}`}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {congregant.phone || '-'}
                    </Typography>
                    {congregant.secondaryPhone && (
                      <Typography variant="caption" color="text.secondary">
                        {congregant.secondaryPhone}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{congregant.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={congregant.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
                    color={congregant.status === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton 
                      onClick={() => handleViewDetails(congregant)} 
                      color="info" 
                      size="small"
                      title="צפייה בפרטים"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpen(congregant)} 
                      color="primary" 
                      size="small"
                      title="עריכה"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(congregant.id)} 
                      color="error" 
                      size="small"
                      title="מחיקה"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>
          {editingCongregant ? 'עריכת מתפלל' : 'הוספת מתפלל חדש'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="שם פרטי"
                value={formData.firstName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="שם משפחה"
                value={formData.lastName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="שם האב"
                value={formData.fatherName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="תעודת זהות"
                value={formData.identityNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, identityNumber: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="טלפון ראשי"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="טלפון נוסף"
                value={formData.secondaryPhone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="אימייל"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>כתובת מגורים</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="רחוב"
                value={formData.address?.street || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address!, street: e.target.value }
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="מספר בית"
                value={formData.address?.houseNumber || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address!, houseNumber: e.target.value }
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="דירה"
                value={formData.address?.apartmentNumber || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address!, apartmentNumber: e.target.value }
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="עיר"
                value={formData.address?.city || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address!, city: e.target.value }
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="מיקוד"
                value={formData.address?.postalCode || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address!, postalCode: e.target.value }
                }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>סטטוס</InputLabel>
                <Select
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                  label="סטטוס"
                >
                  <MenuItem value="ACTIVE">פעיל</MenuItem>
                  <MenuItem value="INACTIVE">לא פעיל</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="הערות"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCongregant ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Congregant Details Dialog */}
      {selectedCongregant && (
        <CongregantDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          congregant={selectedCongregant}
          aliyot={aliyot.filter(a => a.congregantId === selectedCongregant.id)}
          pledges={pledges.filter(p => p.congregantId === selectedCongregant.id)}
          purchases={purchases.filter(p => p.congregantId === selectedCongregant.id)}
          onAddAliyah={handleAddAliyah}
          onAddPledge={handleAddPledge}
          onAddPurchase={handleAddPurchase}
        />
      )}
    </Box>
  );
};

// Congregant Details Dialog Component - Will be implemented in next step
interface CongregantDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  congregant: Congregant;
  aliyot: Aliyah[];
  pledges: Pledge[];
  purchases: Purchase[];
  onAddAliyah: (aliyah: Aliyah) => void;
  onAddPledge: (pledge: Pledge) => void;
  onAddPurchase: (purchase: Purchase) => void;
}

const CongregantDetailsDialog: React.FC<CongregantDetailsDialogProps> = ({
  open,
  onClose,
  congregant,
  aliyot,
  pledges,
  purchases,
  onAddAliyah,
  onAddPledge,
  onAddPurchase
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [addAliyahOpen, setAddAliyahOpen] = useState(false);
  const [addPledgeOpen, setAddPledgeOpen] = useState(false);
  const [addPurchaseOpen, setAddPurchaseOpen] = useState(false);
  const [editingAliyah, setEditingAliyah] = useState<Aliyah | null>(null);
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  
  // Snackbar for validation
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success' | 'warning'>('error');
  
  // Get today's dates
  const getTodayDates = () => {
    const today = new Date();
    const hebrewDate = HebrewDateService.gregorianToHebrew(today);
    const gregorianDateStr = today.toISOString().split('T')[0];
    const hebrewDateStr = HebrewDateService.formatHebrewDate(hebrewDate.day, hebrewDate.month, hebrewDate.year);
    
    return {
      hebrewDate: hebrewDateStr,
      gregorianDate: gregorianDateStr
    };
  };
  
  // Form states
  const [aliyahForm, setAliyahForm] = useState<Partial<Aliyah>>(() => {
    const todayDates = getTodayDates();
    return {
      date: todayDates.hebrewDate,
      gregorianDate: todayDates.gregorianDate,
      parasha: '',
      aliyahNumber: 1,
      aliyahType: '',
      amount: 0,
      notes: ''
    };
  });
  
  const [pledgeForm, setPledgeForm] = useState<Partial<Pledge>>(() => {
    const todayDates = getTodayDates();
    return {
      type: 'KIDDUSH',
      title: '',
      description: '',
      date: todayDates.hebrewDate,
      gregorianDate: todayDates.gregorianDate,
      amount: 0,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      notes: ''
    };
  });
  
  const [purchaseForm, setPurchaseForm] = useState<Partial<Purchase>>({
    type: 'SEFER_TORAH',
    title: '',
    description: '',
    amount: 0,
    date: '',
    status: 'ACTIVE',
    notes: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Aliyah handlers
  const handleAddAliyah = () => {
    setEditingAliyah(null);
    const todayDates = getTodayDates();
    setAliyahForm({
      date: todayDates.hebrewDate,
      gregorianDate: todayDates.gregorianDate,
      parasha: '',
      aliyahNumber: 1,
      aliyahType: '',
      amount: 0,
      notes: ''
    });
    setAddAliyahOpen(true);
  };

  const handleSaveAliyah = () => {
    // Validation
    if (!aliyahForm.date || !aliyahForm.gregorianDate) {
      setSnackbarMessage('נא למלא תאריך');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!aliyahForm.parasha) {
      setSnackbarMessage('נא לבחור פרשה');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!aliyahForm.aliyahType) {
      setSnackbarMessage('נא לבחור סוג עלייה');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (editingAliyah) {
      console.log('Update aliyah:', editingAliyah.id, aliyahForm);
      setSnackbarMessage('העלייה עודכנה בהצלחה');
      setSnackbarSeverity('success');
    } else {
      const newAliyah: Aliyah = {
        ...aliyahForm as Aliyah,
        id: Date.now().toString(),
        congregantId: congregant.id,
        createdAt: new Date().toISOString()
      };
      onAddAliyah(newAliyah);
      setSnackbarMessage('העלייה נוספה בהצלחה');
      setSnackbarSeverity('success');
    }
    setSnackbarOpen(true);
    setAddAliyahOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth dir="rtl">
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBoxIcon />
          <Typography variant="h6">
            {`${congregant.firstName} ${congregant.lastName}`}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`עליות (${aliyot.length})`} />
          <Tab label={`התחייבויות (${pledges.length})`} />
          <Tab label={`קניות (${purchases.length})`} />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Aliyot Tab */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">עליות לתורה</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddAliyah}
                  size="small"
                >
                  הוסף עלייה
                </Button>
              </Box>
              {aliyot.length === 0 ? (
                <Typography color="text.secondary">אין עליות רשומות</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>תאריך</TableCell>
                        <TableCell>פרשה</TableCell>
                        <TableCell>סוג עלייה</TableCell>
                        <TableCell>סכום</TableCell>
                        <TableCell>הערות</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {aliyot.map((aliyah) => (
                        <TableRow key={aliyah.id}>
                          <TableCell>{aliyah.date}</TableCell>
                          <TableCell>{aliyah.parasha}</TableCell>
                          <TableCell>{aliyah.aliyahType}</TableCell>
                          <TableCell>{aliyah.amount ? `₪${aliyah.amount}` : '-'}</TableCell>
                          <TableCell>{aliyah.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          
          {/* Pledges Tab */}
          {tabValue === 1 && <Typography>התחייבויות - בשלב פיתוח...</Typography>}
          
          {/* Purchases Tab */}
          {tabValue === 2 && <Typography>קניות - בשלב פיתוח...</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>סגור</Button>
      </DialogActions>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          dir="rtl"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Add/Edit Aliyah Dialog */}
      <Dialog 
        open={addAliyahOpen} 
        onClose={() => setAddAliyahOpen(false)} 
        maxWidth="md" 
        fullWidth 
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 2.5,
          fontSize: '1.25rem',
          fontWeight: 600
        }}>
          {editingAliyah ? '✏️ עריכת עלייה' : '➕ הוספת עלייה חדשה'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <HebrewDatePicker
                value={{
                  hebrewDate: aliyahForm.date || '',
                  gregorianDate: aliyahForm.gregorianDate || ''
                }}
                onChange={(dates) => setAliyahForm(prev => ({
                  ...prev,
                  date: dates.hebrewDate,
                  gregorianDate: dates.gregorianDate
                }))}
                label="תאריך"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={getParshiotForSelect().map(p => p.label)}
                value={aliyahForm.parasha || ''}
                onChange={(e, newValue) => setAliyahForm(prev => ({ ...prev, parasha: newValue || '' }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="📖 פרשה"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={[
                  'כהן',
                  'לוי',
                  'שלישי',
                  'רביעי',
                  'חמישי',
                  'שישי',
                  'שביעי',
                  'מפטיר',
                  'הוספה א',
                  'הוספה ב',
                  'הוספה ג',
                  'הגבהה',
                  'גלילה',
                  'ראשון',
                  'שני'
                ]}
                value={aliyahForm.aliyahType || ''}
                onChange={(e, newValue) => setAliyahForm(prev => ({ ...prev, aliyahType: newValue || '' }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="🎯 סוג עלייה"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="💰 סכום תרומה (אופציונלי)"
                type="number"
                value={aliyahForm.amount || ''}
                onChange={(e) => setAliyahForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                fullWidth
                inputProps={{ min: 0 }}
                placeholder="הזן סכום בש״ח"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="📝 הערות (אופציונלי)"
                value={aliyahForm.notes || ''}
                onChange={(e) => setAliyahForm(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                placeholder="הערות נוספות..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setAddAliyahOpen(false)}
            variant="outlined"
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSaveAliyah} 
            variant="contained"
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            {editingAliyah ? '✅ עדכן' : '➕ הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CongregantManagement;
