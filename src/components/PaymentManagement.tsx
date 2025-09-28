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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Grid,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import BalanceIcon from '@mui/icons-material/AccountBalance';
import { useHebrewCalendar } from '../contexts/HebrewCalendarContext';

interface Payment {
  id: string;
  congregantName: string;
  amount: number;
  method: string;
  reference?: string;
  hebrewDate: string;
  gregorianDate: Date;
  allocations: PaymentAllocation[];
}

interface PaymentAllocation {
  id: string;
  targetType: string;
  targetDescription: string;
  amount: number;
}

interface OutstandingCharge {
  id: string;
  type: 'ALIYAH' | 'PURCHASE' | 'PLEDGE';
  description: string;
  amount: number;
  eventTitle: string;
  congregantName: string;
}

const PaymentManagement: React.FC = () => {
  const { getHebrewDateString } = useHebrewCalendar();
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      congregantName: 'יוסף כהן',
      amount: 180,
      method: 'CASH',
      hebrewDate: 'ט״ו בשבט תשפ״ה',
      gregorianDate: new Date('2025-01-15'),
      allocations: [
        { id: '1', targetType: 'ALIYAH', targetDescription: 'עלייה כהן - פרשת בשלח', amount: 180 }
      ]
    },
    {
      id: '2',
      congregantName: 'דוד לוי',
      amount: 400,
      method: 'CHECK',
      reference: '123456',
      hebrewDate: 'י״ד בשבט תשפ״ה',
      gregorianDate: new Date('2025-01-14'),
      allocations: [
        { id: '2', targetType: 'PLEDGE', targetDescription: 'קידוש - פרשת יתרו', amount: 250 },
        { id: '3', targetType: 'ALIYAH', targetDescription: 'עלייה לוי - פרשת בשלח', amount: 150 }
      ]
    }
  ]);

  const [open, setOpen] = useState(false);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [formData, setFormData] = useState({
    congregantName: '',
    amount: 0,
    method: 'CASH',
    reference: '',
    gregorianDate: new Date()
  });

  // Mock data for outstanding charges
  const outstandingCharges: OutstandingCharge[] = [
    {
      id: '1',
      type: 'ALIYAH',
      description: 'עלייה שלישי',
      amount: 120,
      eventTitle: 'פרשת משפטים',
      congregantName: 'משה אברהם'
    },
    {
      id: '2',
      type: 'PLEDGE',
      description: 'סעודה שלישית',
      amount: 300,
      eventTitle: 'פרשת תרומה',
      congregantName: 'אהרן ישראל'
    },
    {
      id: '3',
      type: 'PURCHASE',
      description: 'הגבהה',
      amount: 100,
      eventTitle: 'פרשת תצוה',
      congregantName: 'יעקב שמואל'
    }
  ];

  const congregants = [
    'יוסף כהן', 'דוד לוי', 'משה אברהם', 'אהרן ישראל', 'יעקב שמואל'
  ];

  const paymentMethods = [
    { value: 'CASH', label: 'מזומן' },
    { value: 'CHECK', label: 'צ\'ק' },
    { value: 'TRANSFER', label: 'העברה בנקאית' },
    { value: 'CARD', label: 'כרטיס אשראי' },
    { value: 'STANDING_ORDER', label: 'הוראת קבע' }
  ];

  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [allocationAmounts, setAllocationAmounts] = useState<{ [key: string]: number }>({});

  const handleAddPayment = () => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...formData,
      hebrewDate: getHebrewDateString(formData.gregorianDate),
      allocations: []
    };
    
    setPayments(prev => [...prev, newPayment]);
    setSelectedPayment(newPayment);
    setOpen(false);
    setAllocationDialogOpen(true);
    
    // Reset form
    setFormData({
      congregantName: '',
      amount: 0,
      method: 'CASH',
      reference: '',
      gregorianDate: new Date()
    });
  };

  const handleAllocatePayment = () => {
    if (!selectedPayment) return;

    const allocations: PaymentAllocation[] = selectedCharges.map(chargeId => {
      const charge = outstandingCharges.find(c => c.id === chargeId);
      return {
        id: `alloc-${chargeId}`,
        targetType: charge?.type || 'ALIYAH',
        targetDescription: `${charge?.description} - ${charge?.eventTitle}`,
        amount: allocationAmounts[chargeId] || charge?.amount || 0
      };
    });

    setPayments(prev => 
      prev.map(p => 
        p.id === selectedPayment.id 
          ? { ...p, allocations }
          : p
      )
    );

    setAllocationDialogOpen(false);
    setSelectedCharges([]);
    setAllocationAmounts({});
  };

  const getMethodLabel = (method: string) => {
    return paymentMethods.find(m => m.value === method)?.label || method;
  };

  const getChargeTypeColor = (type: string) => {
    switch (type) {
      case 'ALIYAH': return 'primary';
      case 'PLEDGE': return 'secondary';
      case 'PURCHASE': return 'success';
      default: return 'default';
    }
  };

  const getChargeTypeLabel = (type: string) => {
    switch (type) {
      case 'ALIYAH': return 'עלייה';
      case 'PLEDGE': return 'התחייבות';
      case 'PURCHASE': return 'קניה/טקס';
      default: return type;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          ניהול תשלומים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          הוסף תשלום חדש
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Outstanding Charges Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                חיובים פתוחים
              </Typography>
              <List dense>
                {outstandingCharges.slice(0, 5).map((charge) => (
                  <ListItem key={charge.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{charge.congregantName}</span>
                          <span>₪{charge.amount}</span>
                        </Box>
                      }
                      secondary={`${charge.description} - ${charge.eventTitle}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>מתפלל</TableCell>
                  <TableCell>סכום</TableCell>
                  <TableCell>אמצעי תשלום</TableCell>
                  <TableCell>אסמכתא</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell>שיוכים</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.congregantName}</TableCell>
                    <TableCell>₪{payment.amount}</TableCell>
                    <TableCell>{getMethodLabel(payment.method)}</TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell>{payment.gregorianDate.toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>
                      {payment.allocations.length > 0 ? (
                        <Chip
                          label={`${payment.allocations.length} שיוכים`}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="לא משויך"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Add Payment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הוספת תשלום חדש</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Autocomplete
              options={congregants}
              value={formData.congregantName}
              onChange={(_, value) => setFormData(prev => ({ ...prev, congregantName: value || '' }))}
              renderInput={(params) => <TextField {...params} label="מתפלל" required />}
            />
            
            <TextField
              label="סכום (₪)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              required
            />
            
            <FormControl>
              <InputLabel>אמצעי תשלום</InputLabel>
              <Select
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                label="אמצעי תשלום"
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="אסמכתא (מס' צ'ק/אישור)"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            />
            
            <TextField
              label="תאריך"
              type="date"
              value={formData.gregorianDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, gregorianDate: new Date(e.target.value) }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={handleAddPayment} variant="contained">
            הוסף ושייך
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Allocation Dialog */}
      <Dialog open={allocationDialogOpen} onClose={() => setAllocationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>שיוך תשלום לחיובים</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            תשלום: ₪{selectedPayment?.amount} מ{selectedPayment?.congregantName}
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            בחר חיובים לשיוך:
          </Typography>
          
          <List>
            {outstandingCharges
              .filter(charge => charge.congregantName === selectedPayment?.congregantName)
              .map((charge) => (
                <ListItem key={charge.id}>
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedCharges.includes(charge.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCharges(prev => [...prev, charge.id]);
                          setAllocationAmounts(prev => ({ ...prev, [charge.id]: charge.amount }));
                        } else {
                          setSelectedCharges(prev => prev.filter(id => id !== charge.id));
                          setAllocationAmounts(prev => {
                            const newAmounts = { ...prev };
                            delete newAmounts[charge.id];
                            return newAmounts;
                          });
                        }
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Chip
                            label={getChargeTypeLabel(charge.type)}
                            color={getChargeTypeColor(charge.type) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {charge.description}
                        </Box>
                        <Typography variant="h6">₪{charge.amount}</Typography>
                      </Box>
                    }
                    secondary={charge.eventTitle}
                  />
                  {selectedCharges.includes(charge.id) && (
                    <TextField
                      label="סכום לשיוך"
                      type="number"
                      size="small"
                      value={allocationAmounts[charge.id] || 0}
                      onChange={(e) => setAllocationAmounts(prev => ({
                        ...prev,
                        [charge.id]: Number(e.target.value)
                      }))}
                      sx={{ ml: 2, width: 120 }}
                    />
                  )}
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllocationDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleAllocatePayment} variant="contained">
            שייך תשלום
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagement;
