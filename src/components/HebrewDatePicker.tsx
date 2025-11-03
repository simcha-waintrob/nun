import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HebrewDateService from '../services/hebrewDateService';

interface HebrewDatePickerProps {
  value?: {
    hebrewDate: string;
    gregorianDate: string;
  };
  onChange: (dates: { hebrewDate: string; gregorianDate: string }) => void;
  label?: string;
  required?: boolean;
}

const HebrewDatePicker: React.FC<HebrewDatePickerProps> = ({
  value,
  onChange,
  label = 'תאריך',
  required = false
}) => {
  const [open, setOpen] = useState(false);
  const [dateType, setDateType] = useState<'hebrew' | 'gregorian'>('hebrew');
  
  // Hebrew date state
  const [hebrewDay, setHebrewDay] = useState<number>(1);
  const [hebrewMonth, setHebrewMonth] = useState<number>(7); // Tishrei
  const [hebrewYear, setHebrewYear] = useState<number>(5786);
  
  // Gregorian date state
  const [gregorianDate, setGregorianDate] = useState<string>('');

  // Use centralized Hebrew month names
  const hebrewMonthNames = HebrewDateService.getAllHebrewMonths();

  // Initialize from value prop
  useEffect(() => {
    if (value?.gregorianDate) {
      setGregorianDate(value.gregorianDate);
      try {
        const hDate = HebrewDateService.gregorianToHebrew(value.gregorianDate);
        setHebrewDay(hDate.day);
        setHebrewMonth(hDate.month);
        setHebrewYear(hDate.year);
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
  }, [value]);

  // Handle Hebrew date change
  const handleHebrewDateChange = (day: number, month: number, year: number) => {
    setHebrewDay(day);
    setHebrewMonth(month);
    setHebrewYear(year);
    
    // Update Gregorian date using service
    const gDate = HebrewDateService.hebrewToGregorian(day, month, year);
    setGregorianDate(gDate);
  };

  // Handle Gregorian date change
  const handleGregorianDateChange = (dateStr: string) => {
    setGregorianDate(dateStr);
    
    // Update Hebrew date using service
    const hDate = HebrewDateService.gregorianToHebrew(dateStr);
    setHebrewDay(hDate.day);
    setHebrewMonth(hDate.month);
    setHebrewYear(hDate.year);
  };

  // Handle save
  const handleSave = () => {
    const hebrewDateStr = HebrewDateService.formatHebrewDate(hebrewDay, hebrewMonth, hebrewYear);
    onChange({
      hebrewDate: hebrewDateStr,
      gregorianDate: gregorianDate
    });
    setOpen(false);
  };

  // Display value
  const displayValue = value?.hebrewDate || value?.gregorianDate || '';

  return (
    <>
      <TextField
        label={label}
        value={displayValue}
        onClick={() => setOpen(true)}
        fullWidth
        required={required}
        InputProps={{
          readOnly: true,
          endAdornment: <CalendarTodayIcon sx={{ cursor: 'pointer', color: 'action.active' }} />
        }}
        sx={{ cursor: 'pointer' }}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>בחירת תאריך</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Toggle between Hebrew and Gregorian */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ToggleButtonGroup
                value={dateType}
                exclusive
                onChange={(e, newType) => newType && setDateType(newType)}
                aria-label="date type"
              >
                <ToggleButton value="hebrew" aria-label="hebrew date">
                  תאריך עברי
                </ToggleButton>
                <ToggleButton value="gregorian" aria-label="gregorian date">
                  תאריך לועזי
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {dateType === 'hebrew' ? (
              // Hebrew Date Picker
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    בחר תאריך עברי
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>יום</InputLabel>
                    <Select
                      value={hebrewDay}
                      onChange={(e) => handleHebrewDateChange(Number(e.target.value), hebrewMonth, hebrewYear)}
                      label="יום"
                    >
                      {Array.from({ length: HebrewDateService.getDaysInHebrewMonth(hebrewMonth, hebrewYear) }, (_, i) => i + 1).map(day => (
                        <MenuItem key={day} value={day}>{HebrewDateService.dayToGematria(day)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>חודש</InputLabel>
                    <Select
                      value={hebrewMonth}
                      onChange={(e) => handleHebrewDateChange(hebrewDay, Number(e.target.value), hebrewYear)}
                      label="חודש"
                    >
                      {hebrewMonthNames.map(month => (
                        <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>שנה</InputLabel>
                    <Select
                      value={hebrewYear}
                      onChange={(e) => handleHebrewDateChange(hebrewDay, hebrewMonth, Number(e.target.value))}
                      label="שנה"
                    >
                      {HebrewDateService.getHebrewYearsList(5776, 21).map(year => (
                        <MenuItem key={year.value} value={year.value}>{year.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    תאריך לועזי מתאים: {gregorianDate ? new Date(gregorianDate).toLocaleDateString('he-IL') : '-'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              // Gregorian Date Picker
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    בחר תאריך לועזי
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="תאריך לועזי"
                    type="date"
                    value={gregorianDate}
                    onChange={(e) => handleGregorianDateChange(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    תאריך עברי מתאים: {HebrewDateService.formatHebrewDate(hebrewDay, hebrewMonth, hebrewYear)}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">אישור</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HebrewDatePicker;
