import React, { useState } from 'react';
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
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAdmin, UserRole } from '../contexts/AdminContext';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { 
    currentUser,
    synagogues, 
    users, 
    loading, 
    error, 
    createUser,
    updateUser,
    deleteUser,
    canManageUsers 
  } = useAdmin();

  const [tabValue, setTabValue] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: UserRole.USER,
    active: true
  });

  const currentSynagogue = synagogues.find(s => s.id === currentUser?.synagogueId);
  const synagogueUsers = users.filter(u => u.synagogueId === currentUser?.synagogueId);

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          אין לך הרשאות לגשת לדף זה
        </Alert>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenUserDialog = (userId?: string) => {
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        setUserFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active
        });
        setEditingUser(userId);
      }
    } else {
      setUserFormData({
        name: '',
        email: '',
        role: UserRole.USER,
        active: true
      });
      setEditingUser(null);
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser, userFormData);
      } else {
        await createUser({
          ...userFormData,
          synagogueId: currentUser.synagogueId
        });
      }
      handleCloseUserDialog();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      await deleteUser(userId);
    }
  };

  const activeUsers = synagogueUsers.filter(u => u.active);
  const totalEvents = 25; // Mock data - would come from actual events
  const totalPayments = 150; // Mock data - would come from actual payments

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ניהול בית הכנסת - {currentSynagogue?.hebrewName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">{synagogueUsers.length}</Typography>
                  <Typography color="textSecondary">משתמשים</Typography>
                  <Typography variant="body2" color="success.main">
                    {activeUsers.length} פעילים
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: 'secondary.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">{totalEvents}</Typography>
                  <Typography color="textSecondary">אירועים</Typography>
                  <Typography variant="body2" color="info.main">
                    החודש
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ fontSize: 40, color: 'warning.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">{totalPayments}</Typography>
                  <Typography color="textSecondary">תשלומים</Typography>
                  <Typography variant="body2" color="textSecondary">
                    החודש
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', ml: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {Math.round((activeUsers.length / synagogueUsers.length) * 100) || 0}%
                  </Typography>
                  <Typography color="textSecondary">פעילות</Typography>
                  <Typography variant="body2" color="textSecondary">
                    משתמשים פעילים
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Management Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="ניהול משתמשים" />
            <Tab label="הגדרות בית הכנסת" />
            <Tab label="דוחות" />
          </Tabs>
        </Box>

        {/* Users Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">משתמשי בית הכנסת</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenUserDialog()}
            >
              הוסף משתמש
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>שם</TableCell>
                  <TableCell>אימייל</TableCell>
                  <TableCell>תפקיד</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>תאריך הצטרפות</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {synagogueUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === UserRole.ADMIN ? 'מנהל' : 'משתמש'}
                        color={user.role === UserRole.ADMIN ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'פעיל' : 'לא פעיל'}
                        color={user.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenUserDialog(user.id)}
                        title="עריכה"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
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
        </TabPanel>

        {/* Synagogue Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            הגדרות בית הכנסת
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם בית הכנסת"
                value={currentSynagogue?.hebrewName || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="כתובת"
                value={currentSynagogue?.address || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="טלפון"
                value={currentSynagogue?.contactPhone || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="אימייל"
                value={currentSynagogue?.contactEmail || ''}
                disabled
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            לעדכון פרטי בית הכנסת, אנא פנה למנהל המערכת
          </Alert>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            דוחות ונתונים
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    דוח משתמשים
                  </Typography>
                  <Typography variant="body2">
                    סה"כ משתמשים: {synagogueUsers.length}
                  </Typography>
                  <Typography variant="body2">
                    משתמשים פעילים: {activeUsers.length}
                  </Typography>
                  <Typography variant="body2">
                    מנהלים: {synagogueUsers.filter(u => u.role === UserRole.ADMIN).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    פעילות אחרונה
                  </Typography>
                  <Typography variant="body2">
                    משתמש אחרון שנוסף: {synagogueUsers[synagogueUsers.length - 1]?.name || 'אין'}
                  </Typography>
                  <Typography variant="body2">
                    תאריך: {synagogueUsers[synagogueUsers.length - 1]?.createdAt ? 
                      new Date(synagogueUsers[synagogueUsers.length - 1].createdAt).toLocaleDateString('he-IL') : 'אין'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם מלא"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="אימייל"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>תפקיד</InputLabel>
                <Select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                >
                  <MenuItem value={UserRole.USER}>משתמש</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>מנהל</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>סטטוס</InputLabel>
                <Select
                  value={userFormData.active ? 'true' : 'false'}
                  onChange={(e) => setUserFormData({ ...userFormData, active: e.target.value === 'true' })}
                >
                  <MenuItem value="true">פעיל</MenuItem>
                  <MenuItem value="false">לא פעיל</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>ביטול</Button>
          <Button onClick={handleSubmitUser} variant="contained">
            {editingUser ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
