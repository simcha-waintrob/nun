import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon
} from '@mui/icons-material';
import { HDate } from '@hebcal/core';

interface AliyahAssignment {
  id: string;
  type: string;
  congregantName: string;
  amount?: number;
}

interface CalendarDay {
  gregorianDate: Date;
  hebrewDate: string;
  parasha?: string;
  holiday?: string;
  isShabbat: boolean;
  aliyot: AliyahAssignment[];
}

const JewishCalendar: React.FC = () => {
  const [currentHebrewMonth, setCurrentHebrewMonth] = useState(() => {
    try {
      return new HDate(new Date());
    } catch {
      return null;
    }
  });
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [aliyahDialogOpen, setAliyahDialogOpen] = useState(false);
  const [newAliyah, setNewAliyah] = useState({
    type: '',
    congregantName: '',
    amount: 0
  });

  // Aliyah types
  const aliyahTypes = [
    { value: 'KOHEN', label: 'כהן' },
    { value: 'LEVI', label: 'לוי' },
    { value: 'SHLISHI', label: 'שלישי' },
    { value: 'REVI', label: 'רביעי' },
    { value: 'CHAMISHI', label: 'חמישי' },
    { value: 'SHISHI', label: 'שישי' },
    { value: 'SHVII', label: 'שביעי' },
    { value: 'MAFTIR', label: 'מפטיר' }
  ];

  // Mock congregants
  const congregants = [
    'יוסף כהן', 'דוד לוי', 'משה אברהם', 'אהרן יצחק', 'שמואל דוד'
  ];

  // Get correct parasha for the current period
  const getParashaForDate = (date: Date): string | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Correct parasha schedule based on user's correction - all in Hebrew
    const parashaSchedule: { [key: string]: string } = {
      // Shabbat dates with their parshiot in Hebrew
      '2025-09-20': 'נצבים',
      '2025-09-21': 'וילך', 
      '2025-09-27': 'וילך',
      '2025-09-28': 'האזינו',
      
      // This week's Shabbat (Oct 4) - פרשת האזינו
      '2025-10-04': 'האזינו',
      
      // Next Shabbatot
      '2025-10-11': 'האזינו',
      '2025-10-12': 'וזאת הברכה',
      '2025-10-18': 'וזאת הברכה',
      '2025-10-19': 'בראשית',
      '2025-10-25': 'בראשית',
      '2025-10-26': 'נח',
      '2025-11-01': 'נח',
      '2025-11-02': 'לך לך',
      '2025-11-08': 'לך לך',
      '2025-11-09': 'וירא',
      '2025-11-15': 'וירא',
      '2025-11-16': 'חיי שרה',
      '2025-11-22': 'חיי שרה',
      '2025-11-23': 'תולדות',
      '2025-11-29': 'תולדות',
      '2025-11-30': 'ויצא',
      '2025-12-06': 'ויצא',
      '2025-12-07': 'וישלח'
    };
    
    return parashaSchedule[dateStr];
  };

  // Get holidays for date
  const getHolidayForDate = (date: Date): string | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    
    const holidays: { [key: string]: string } = {
      // Tishrei holidays (September-October 2025)
      '2025-09-15': 'ראש השנה א׳',
      '2025-09-16': 'ראש השנה ב׳', 
      '2025-09-17': 'צום גדליה',
      '2025-09-24': 'יום כיפור',
      '2025-09-29': 'סוכות',
      '2025-09-30': 'חול המועד סוכות',
      '2025-10-01': 'חול המועד סוכות',
      '2025-10-02': 'חול המועד סוכות',
      '2025-10-03': 'חול המועד סוכות',
      '2025-10-04': 'חול המועד סוכות',
      '2025-10-05': 'הושענא רבה',
      '2025-10-06': 'שמיני עצרת',
      '2025-10-07': 'שמחת תורה'
    };
    
    return holidays[dateStr];
  };

  // Hebrew month names
  const hebrewMonthNames = [
    'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר',
    'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
  ];

  // Convert number to Hebrew letters
  const numberToHebrewLetters = (num: number): string => {
    const hebrewNumbers: { [key: number]: string } = {
      1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
      10: 'י', 11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט',
      20: 'כ', 21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל'
    };
    return hebrewNumbers[num] || num.toString();
  };

  // Get current Hebrew month info
  const getCurrentHebrewMonthInfo = () => {
    if (!currentHebrewMonth) return { monthName: 'תשרי', year: 5786, monthNum: 7 };
    
    try {
      const year = currentHebrewMonth.getFullYear();
      const monthNum = currentHebrewMonth.getMonth(); // Use HDate's month number directly
      
      // Map HDate month numbers to Hebrew names
      const monthNameMap: { [key: number]: string } = {
        1: 'ניסן',    // Nisan
        2: 'אייר',    // Iyyar  
        3: 'סיון',    // Sivan
        4: 'תמוז',    // Tamuz
        5: 'אב',      // Av
        6: 'אלול',    // Elul
        7: 'תשרי',    // Tishrei
        8: 'חשון',    // Cheshvan
        9: 'כסלו',    // Kislev
        10: 'טבת',   // Tevet
        11: 'שבט',   // Sh'vat
        12: 'אדר'    // Adar
      };
      
      const monthName = monthNameMap[monthNum] || 'תשרי';
      
      return { monthName, year, monthNum };
    } catch {
      return { monthName: 'תשרי', year: 5786, monthNum: 7 };
    }
  };

  // Generate calendar days for current Hebrew month
  const generateCalendarDays = (): CalendarDay[] => {
    const { monthName, year, monthNum } = getCurrentHebrewMonthInfo();
    const days: CalendarDay[] = [];
    
    // Hebrew months have 29 or 30 days - try both
    let daysInMonth = 30;
    try {
      new HDate(30, monthNum, year);
    } catch {
      daysInMonth = 29;
    }
    
    // Create days for the Hebrew month (1 to daysInMonth)
    for (let day = 1; day <= daysInMonth; day++) {
      try {
        const hdate = new HDate(day, monthNum, year);
        const gregorianDate = hdate.greg();
        const hebrewDayLetter = numberToHebrewLetters(day);
        const hebrewDateStr = `${hebrewDayLetter} ${monthName}`;
        const isShabbat = gregorianDate.getDay() === 6;
        
        // Debug logging for day 20
        if (day === 20) {
          console.log(`Debug ${day} ${monthName}:`, {
            gregorianDate: gregorianDate.toDateString(),
            dayOfWeek: gregorianDate.getDay(),
            isShabbat,
            monthNum,
            year
          });
        }
        const parasha = isShabbat ? getParashaForDate(gregorianDate) : undefined;
        const holiday = getHolidayForDate(gregorianDate);
        
        days.push({
          gregorianDate,
          hebrewDate: hebrewDateStr,
          parasha,
          holiday,
          isShabbat,
          aliyot: [] // Will be loaded from storage/API
        });
      } catch (error) {
        console.warn('Error creating Hebrew date for day', day, ':', error);
      }
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const { year, monthNum } = getCurrentHebrewMonthInfo();
    
    console.log(`🔄 NAVIGATION DEBUG: Current = ${monthNum}/${year}, Direction = ${direction}`);
    
    try {
      let newMonth, newYear;
      if (direction === 'prev') {
        // Going backwards in Hebrew calendar
        if (monthNum === 7) {
          // From Tishrei (start of Hebrew year) go to previous year's Elul
          newMonth = 6; // Elul
          newYear = year - 1;
          console.log(`📅 Special case: Tishrei -> Previous year Elul`);
        } else if (monthNum === 1) {
          // From Nisan go to previous year's Adar
          newMonth = 12; // Adar
          newYear = year - 1;
        } else {
          // Normal case: just go to previous month in same year
          newMonth = monthNum - 1;
          newYear = year;
        }
      } else {
        // Going forwards in Hebrew calendar
        if (monthNum === 6) {
          // From Elul go to next year's Tishrei
          newMonth = 7; // Tishrei
          newYear = year + 1;
          console.log(`📅 Special case: Elul -> Next year Tishrei`);
        } else if (monthNum === 12) {
          // From Adar go to next year's Nisan
          newMonth = 1; // Nisan
          newYear = year + 1;
        } else {
          // Normal case: just go to next month in same year
          newMonth = monthNum + 1;
          newYear = year;
        }
      }
      
      console.log(`🔄 Navigation result: ${monthNum}/${year} -> ${newMonth}/${newYear}`);
      const newHebrewDate = new HDate(1, newMonth, newYear);
      console.log(`🔄 New HDate created:`, newHebrewDate.toString());
      setCurrentHebrewMonth(newHebrewDate);
    } catch (error) {
      console.warn('Error navigating Hebrew month:', error);
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    if (day.isShabbat || day.holiday) {
      setAliyahDialogOpen(true);
    }
  };

  const handleAddAliyah = () => {
    if (selectedDay && newAliyah.type && newAliyah.congregantName) {
      const aliyah: AliyahAssignment = {
        id: Date.now().toString(),
        ...newAliyah
      };
      
      selectedDay.aliyot.push(aliyah);
      setNewAliyah({ type: '', congregantName: '', amount: 0 });
    }
  };

  // Day names in Hebrew RTL order: Sunday to Saturday (right to left)
  const dayNames = ['ש׳', 'ו׳', 'ה׳', 'ד׳', 'ג׳', 'ב׳', 'א׳'];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        לוח שנה עברי
      </Typography>

      {/* Calendar Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigateMonth('prev')}>
            <ChevronRight />
          </IconButton>
          
          <Typography variant="h5">
            {getCurrentHebrewMonthInfo().monthName} {getCurrentHebrewMonthInfo().year}
          </Typography>
          
          <IconButton onClick={() => navigateMonth('next')}>
            <ChevronLeft />
          </IconButton>
        </Box>

        {/* Day Headers */}
        <Grid container spacing={1}>
          {dayNames.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid - Hebrew Month Days organized by weeks */}
        <Box sx={{ mt: 1 }}>
          {/* Create weekly calendar with proper day positioning */}
          {(() => {
            // Group days into weeks with proper positioning
            const weeks: (CalendarDay | null)[][] = [];
            
            // Sort days by Gregorian date to ensure proper chronological order
            const sortedDays = [...calendarDays].sort((a, b) => 
              a.gregorianDate.getTime() - b.gregorianDate.getTime()
            );
            
            sortedDays.forEach(day => {
              const gregorianDayOfWeek = day.gregorianDate.getDay(); // 0=Sunday, 6=Saturday
              // Convert to RTL position: Saturday=0, Friday=1, ..., Sunday=6
              const rtlPosition = 6 - gregorianDayOfWeek;
              
              // Debug logging for day 20
              if (day.hebrewDate.includes('כ')) {
                console.log(`Grid Debug כ:`, {
                  hebrewDate: day.hebrewDate,
                  gregorianDate: day.gregorianDate.toDateString(),
                  gregorianDayOfWeek,
                  rtlPosition,
                  isShabbat: day.isShabbat
                });
              }
              
              // Find or create a week that has space for this day
              let targetWeek = weeks.find(week => week[rtlPosition] === null);
              
              if (!targetWeek) {
                // Create a new week
                targetWeek = new Array(7).fill(null);
                weeks.push(targetWeek);
              }
              
              targetWeek[rtlPosition] = day;
            });
            
            return weeks.map((week, weekIndex) => (
              <Grid container spacing={1} key={weekIndex} sx={{ mb: 1 }}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <Grid item xs key={dayIndex} />;
                  }
                  
                  // Check if this is the current Hebrew date (ז תשרי = 7th of Tishrei)
                  const hebrewDayLetter = day.hebrewDate.split(' ')[0];
                  const hebrewMonth = day.hebrewDate.split(' ')[1];
                  const isCurrentHebrewDate = hebrewDayLetter === 'ז' && hebrewMonth === 'תשרי';
                  
                  return (
                    <Grid item xs key={dayIndex}>
                      <Card
                    sx={{
                      minHeight: 140,
                      cursor: 'pointer',
                      backgroundColor: isCurrentHebrewDate ? '#bbdefb' : // Current Hebrew date - light blue
                                     day.isShabbat ? '#e3f2fd' : // Shabbat - blue
                                     day.holiday ? '#fff3e0' : 'white', // Holiday - orange
                      border: isCurrentHebrewDate ? '3px solid #1976d2' : // Current Hebrew date - thick blue border
                             day.isShabbat ? '2px solid #2196f3' : // Shabbat - blue border
                             '1px solid #e0e0e0', // Regular border
                      boxShadow: isCurrentHebrewDate ? 3 : 1, // Current Hebrew date gets more shadow
                      '&:hover': {
                        backgroundColor: isCurrentHebrewDate ? '#90caf9' : '#f5f5f5',
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleDayClick(day)}
                  >
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color={isCurrentHebrewDate ? 'primary' : 'inherit'}>
                          {hebrewDayLetter}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          {day.gregorianDate.getDate()}/{day.gregorianDate.getMonth() + 1}
                        </Typography>
                      </Box>
                      
                      {day.isShabbat && (
                        <Box sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 'bold',
                            color: '#1976d2',
                            display: 'block'
                          }}>
                            שבת
                          </Typography>
                          {day.parasha && (
                            <Typography variant="caption" sx={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 'bold',
                              color: '#1976d2',
                              display: 'block'
                            }}>
                              פרשת {day.parasha}
                            </Typography>
                          )}
                        </Box>
                      )}
                      
                      {day.holiday && (
                        <Box sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 'bold',
                            color: '#f57c00',
                            display: 'block'
                          }}>
                            {day.holiday}
                          </Typography>
                        </Box>
                      )}
                      
                      {day.aliyot.length > 0 && (
                        <Typography variant="caption" color="primary" sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          fontSize: '0.6rem'
                        }}>
                          {day.aliyot.length} עליות
                        </Typography>
                      )}
                      
                      {isCurrentHebrewDate && (
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          mt: 0.5,
                          fontSize: '0.6rem',
                          fontWeight: 'bold',
                          color: '#1976d2'
                        }}>
                          היום - ז תשרי
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                );
              })}
            </Grid>
            ));
          })()}
        </Box>
      </Paper>

      {/* Aliyah Management Dialog */}
      <Dialog open={aliyahDialogOpen} onClose={() => setAliyahDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          ניהול עליות - {selectedDay?.gregorianDate.toLocaleDateString('he-IL')}
          {selectedDay?.parasha && ` - פרשת ${selectedDay.parasha}`}
        </DialogTitle>
        
        <DialogContent>
          {/* Existing Aliyot */}
          {selectedDay?.aliyot && selectedDay.aliyot.length > 0 && (
            <Table sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>עלייה</TableCell>
                  <TableCell>שם</TableCell>
                  <TableCell>סכום</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDay.aliyot.map((aliyah) => (
                  <TableRow key={aliyah.id}>
                    <TableCell>{aliyahTypes.find(t => t.value === aliyah.type)?.label}</TableCell>
                    <TableCell>{aliyah.congregantName}</TableCell>
                    <TableCell>{aliyah.amount ? `₪${aliyah.amount}` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add New Aliyah */}
          <Typography variant="h6" gutterBottom>
            הוספת עלייה חדשה
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>סוג עלייה</InputLabel>
                <Select
                  value={newAliyah.type}
                  onChange={(e) => setNewAliyah(prev => ({ ...prev, type: e.target.value }))}
                >
                  {aliyahTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>שם חבר קהילה</InputLabel>
                <Select
                  value={newAliyah.congregantName}
                  onChange={(e) => setNewAliyah(prev => ({ ...prev, congregantName: e.target.value }))}
                >
                  {congregants.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="סכום נדר (₪)"
                type="number"
                value={newAliyah.amount}
                onChange={(e) => setNewAliyah(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAliyahDialogOpen(false)}>
            סגור
          </Button>
          <Button onClick={handleAddAliyah} variant="contained" startIcon={<AddIcon />}>
            הוסף עלייה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JewishCalendar;
