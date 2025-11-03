import React, { useState } from 'react';
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
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewIcon from '@mui/icons-material/Visibility';

interface Congregant {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  familyUnitId?: string;
  notes?: string;
}

const CongregantManagement: React.FC = () => {
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

  const [open, setOpen] = useState(false);
  const [editingCongregant, setEditingCongregant] = useState<Congregant | null>(null);
  const [formData, setFormData] = useState<Partial<Congregant>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
    notes: ''
  });

  const handleOpen = (congregant?: Congregant) => {
    if (congregant) {
      setEditingCongregant(congregant);
      setFormData(congregant);
    } else {
      setEditingCongregant(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
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
    setCongregants(prev => prev.filter(c => c.id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          ניהול מתפללים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          הוסף מתפלל חדש
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם פרטי</TableCell>
              <TableCell>שם משפחה</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {congregants.map((congregant) => (
              <TableRow key={congregant.id}>
                <TableCell>{congregant.firstName}</TableCell>
                <TableCell>{congregant.lastName}</TableCell>
                <TableCell>{congregant.phone || '-'}</TableCell>
                <TableCell>{congregant.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={congregant.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
                    color={congregant.status === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(congregant)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(congregant.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton color="info">
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCongregant ? 'עריכת מתפלל' : 'הוספת מתפלל חדש'}
        </DialogTitle>
        <DialogContent sx={{ pt: 5, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="שם פרטי"
              value={formData.firstName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="שם משפחה"
              value={formData.lastName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="טלפון"
              value={formData.phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
            />
            <TextField
              label="אימייל"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
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
            <TextField
              label="הערות"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCongregant ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CongregantManagement;
