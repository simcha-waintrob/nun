import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  Alert,
  Avatar,
  CardMedia
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAdmin, UserRole } from '../contexts/AdminContext';

interface SynagogueFormData {
  name: string;
  hebrewName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  adminUserId: string;
  active: boolean;
  logoUrl?: string;
  logoFile?: File;
  settings: {
    timezone: string;
    currency: string;
    language: string;
  };
}

const SuperAdminDashboard: React.FC = () => {
  const { 
    synagogues, 
    users, 
    loading, 
    error, 
    createSynagogue, 
    updateSynagogue, 
    deleteSynagogue,
    canManageSynagogues 
  } = useAdmin();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSynagogue, setEditingSynagogue] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<SynagogueFormData>({
    name: '',
    hebrewName: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    adminUserId: '',
    active: true,
    logoUrl: '',
    logoFile: undefined,
    settings: {
      timezone: 'Asia/Jerusalem',
      currency: 'ILS',
      language: 'he'
    }
  });

  if (!canManageSynagogues()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          אין לך הרשאות לגשת לדף זה
        </Alert>
      </Box>
    );
  }

  const handleOpenDialog = (synagogueId?: string) => {
    if (synagogueId) {
      const synagogue = synagogues.find(s => s.id === synagogueId);
      if (synagogue) {
        setFormData({
          name: synagogue.name,
          hebrewName: synagogue.hebrewName,
          address: synagogue.address || '',
          contactPhone: synagogue.contactPhone || '',
          contactEmail: synagogue.contactEmail || '',
          adminUserId: synagogue.adminUserId,
          active: synagogue.active,
          logoUrl: synagogue.logoUrl || '',
          logoFile: undefined,
          settings: synagogue.settings || {
            timezone: 'Asia/Jerusalem',
            currency: 'ILS',
            language: 'he'
          }
        });
        setLogoPreview(synagogue.logoUrl || null);
        setEditingSynagogue(synagogueId);
      }
    } else {
      setFormData({
        name: '',
        hebrewName: '',
        address: '',
        contactPhone: '',
        contactEmail: '',
        adminUserId: '',
        active: true,
        logoUrl: '',
        logoFile: undefined,
        settings: {
          timezone: 'Asia/Jerusalem',
          currency: 'ILS',
          language: 'he'
        }
      });
      setLogoPreview(null);
      setEditingSynagogue(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSynagogue(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('אנא בחר קובץ תמונה בלבד');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('גודל הקובץ חייב להיות קטן מ-5MB');
        return;
      }
      
      setFormData({ ...formData, logoFile: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logoFile: undefined, logoUrl: '' });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    try {
      let logoUrl = formData.logoUrl;
      
      // If a new logo file was uploaded, simulate upload and get URL
      if (formData.logoFile) {
        // In a real app, you would upload to AWS S3 or similar service
        // For now, we'll create a mock URL
        logoUrl = URL.createObjectURL(formData.logoFile);
      }
      
      const synagogueData = {
        ...formData,
        logoUrl,
        logoFile: undefined // Don't include the file object in the data
      };
      
      if (editingSynagogue) {
        await updateSynagogue(editingSynagogue, synagogueData);
      } else {
        await createSynagogue(synagogueData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving synagogue:', error);
    }
  };

  const handleDelete = async (synagogueId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את בית הכנסת?')) {
      await deleteSynagogue(synagogueId);
    }
  };

  const getAdminName = (adminUserId: string) => {
    const admin = users.find(u => u.id === adminUserId);
    return admin?.name || 'לא נמצא';
  };

  const activesynagogues = synagogues.filter(s => s.active);
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === UserRole.ADMIN).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ניהול מערכת - מנהל על
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">{synagogues.length}</Typography>
                  <Typography color="textSecondary">בתי כנסת</Typography>
                  <Typography variant="body2" color="success.main">
                    {activesynagogues.length} פעילים
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">{totalUsers}</Typography>
                  <Typography color="textSecondary">משתמשים</Typography>
                  <Typography variant="body2" color="info.main">
                    {totalAdmins} מנהלים
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {Math.round((activesynagogues.length / synagogues.length) * 100) || 0}%
                  </Typography>
                  <Typography color="textSecondary">שיעור פעילות</Typography>
                  <Typography variant="body2" color="textSecondary">
                    בתי כנסת פעילים
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Synagogues Management */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">ניהול בתי כנסת</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              הוסף בית כנסת
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>לוגו</TableCell>
                  <TableCell>שם בית הכנסת</TableCell>
                  <TableCell>שם עברי</TableCell>
                  <TableCell>כתובת</TableCell>
                  <TableCell>מנהל</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {synagogues.map((synagogue) => (
                  <TableRow key={synagogue.id}>
                    <TableCell>
                      {synagogue.logoUrl ? (
                        <Avatar
                          src={synagogue.logoUrl}
                          alt={synagogue.hebrewName}
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                          <ImageIcon />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>{synagogue.name}</TableCell>
                    <TableCell>{synagogue.hebrewName}</TableCell>
                    <TableCell>{synagogue.address || 'לא צוין'}</TableCell>
                    <TableCell>{getAdminName(synagogue.adminUserId)}</TableCell>
                    <TableCell>
                      <Chip
                        label={synagogue.active ? 'פעיל' : 'לא פעיל'}
                        color={synagogue.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(synagogue.id)}
                        title="עריכה"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(synagogue.id)}
                        title="מחיקה"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Synagogue Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSynagogue ? 'עריכת בית כנסת' : 'הוספת בית כנסת חדש'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Logo Upload Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  לוגו בית הכנסת
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {logoPreview ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={logoPreview}
                        alt="תצוגה מקדימה של הלוגו"
                        sx={{ width: 80, height: 80 }}
                      />
                      <Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          startIcon={<UploadIcon />}
                          sx={{ mb: 1, display: 'block' }}
                        >
                          החלף לוגו
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={handleRemoveLogo}
                          startIcon={<DeleteIcon />}
                        >
                          הסר לוגו
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.300' }}>
                        <ImageIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Button
                        variant="outlined"
                        onClick={() => fileInputRef.current?.click()}
                        startIcon={<UploadIcon />}
                      >
                        העלה לוגו
                      </Button>
                    </Box>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  קבצי תמונה בלבד, עד 5MB
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם בית הכנסת (אנגלית)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם בית הכנסת (עברית)"
                value={formData.hebrewName}
                onChange={(e) => setFormData({ ...formData, hebrewName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כתובת"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="טלפון"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="אימייל"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>מנהל בית הכנסת</InputLabel>
                <Select
                  value={formData.adminUserId}
                  onChange={(e) => setFormData({ ...formData, adminUserId: e.target.value })}
                >
                  {users.filter(u => u.role === UserRole.ADMIN).map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>סטטוס</InputLabel>
                <Select
                  value={formData.active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                >
                  <MenuItem value="true">פעיל</MenuItem>
                  <MenuItem value="false">לא פעיל</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSynagogue ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;
