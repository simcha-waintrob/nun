import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { HDate, HebrewCalendar as HebcalCalendar, Sedra } from '@hebcal/core';
import HebrewDateService from '../services/hebrewDateService';

interface HebrewCalendarDay {
  hebrewDate: HDate;
  gregorianDate: Date;
  hebrewDay: number;
  hebrewMonth: string;
  hebrewYear: number;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  isShabbat: boolean;
  isHoliday: boolean;
  holidayName?: string;
  parasha?: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const HebrewCalendar: React.FC = () => {
  // Force current Hebrew date to be Tishrei 5786 (September 2025)
  const [currentHebrewYear, setCurrentHebrewYear] = useState(5786);
  const [currentHebrewMonth, setCurrentHebrewMonth] = useState(7); // 7 = Tishrei (current month)
  const [calendarDays, setCalendarDays] = useState<HebrewCalendarDay[]>([]);
  
  // Debug: Log the initial state
  console.log(`🔧 INITIAL STATE: currentHebrewMonth=${currentHebrewMonth}, currentHebrewYear=${currentHebrewYear}`);

  // Use centralized Hebrew month names
  const getMonthName = (monthNum: number): string => {
    return HebrewDateService.getHebrewMonthName(monthNum);
  };

  // Hebrew day names (Sunday to Saturday, RTL)
  const hebrewDayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  
  // Hebrew day of week names
  const hebrewWeekDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  // Format Gregorian date using HDate library's own methods
  const formatGregorianDate = (hdate: HDate): string => {
    try {
      // Use HDate library to get the correct Gregorian date
      const gregorianDate = hdate.greg();
      
      // Use HDate's toString method which should give us proper formatting
      const hdateString = hdate.toString();
      
      // Extract just the Gregorian date part or format it simply
      const day = gregorianDate.getDate();
      const month = gregorianDate.getMonth() + 1; // 0-based to 1-based
      const year = gregorianDate.getFullYear();
      
      // Simple format: day/month
      return `${day}/${month}`;
    } catch (error) {
      return '';
    }
  };

  // Use centralized service for Hebrew numbers
  const numberToHebrewLetters = (num: number): string => {
    return HebrewDateService.dayToGematria(num);
  };

  // Get holidays using HDate library only - no hardcoded dates
  const getHolidaysForDate = (hdate: HDate): string[] => {
    try {
      // Use HebrewCalendar from @hebcal/core to get holidays
      const events = HebcalCalendar.calendar({
        start: hdate.greg(),
        end: hdate.greg(),
        isHebrewYear: false,
        candlelighting: false,
        havdalahMins: 0,
        sedrot: false,
        il: true, // Israel - handles postponements correctly (like צום גדליה)
        noHolidays: false
      });
      
      const holidays: string[] = [];
      for (const event of events) {
        const desc = event.getDesc();
        if (desc && !desc.includes('Candle lighting') && !desc.includes('Havdalah')) {
          holidays.push(desc); // Keep original names from library
        }
      }
      
      return holidays;
    } catch (error) {
      console.log('Holiday lookup failed:', error);
      return [];
    }
  };

  // Dynamic parasha calculation using HDate library only
  const getParashaForHebrewDate = (hdate: HDate): string | undefined => {
    try {
      // Check if it's Shabbat
      if (hdate.greg().getDay() !== 6) {
        return undefined; // Not Shabbat
      }
      
      console.log(`🔍 Getting parasha for ${hdate.toString()} (${hdate.greg().toDateString()})`);

      // Use HebrewCalendar to get sedrot events for this date
      const events = HebcalCalendar.calendar({
        start: hdate.greg(),
        end: hdate.greg(),
        isHebrewYear: false,
        sedrot: true,
        il: true, // Israel
        noHolidays: true // Only get sedrot, not holidays
      });
      
      console.log(`📚 Found ${events.length} events for this date:`, events.map(e => ({
        desc: e.getDesc(),
        flags: e.getFlags(),
        flagsBinary: e.getFlags().toString(2),
        isParshaHashavua: !!(e.getFlags() & 4),
        constructor: e.constructor.name,
        category: e.getCategories ? e.getCategories() : 'N/A'
      })));
      
      // Find the parasha event - try multiple approaches
      for (const event of events) {
        console.log(`🔍 Checking event:`, {
          desc: event.getDesc(),
          flags: event.getFlags(),
          constructor: event.constructor.name,
          basename: event.basename ? event.basename() : 'N/A'
        });
        
        // Try different ways to identify parasha
        if (event.getFlags() & 4) { // PARSHA_HASHAVUA flag
          console.log(`✅ Found parasha by flag: ${event.getDesc()}`);
          return event.getDesc();
        }
        
        // Try by constructor name
        if (event.constructor.name === 'ParshaEvent') {
          console.log(`✅ Found parasha by constructor: ${event.getDesc()}`);
          return event.getDesc();
        }
        
        // Try by basename method
        if (event.basename && typeof event.basename === 'function') {
          const basename = event.basename();
          if (basename) {
            console.log(`✅ Found parasha by basename: ${basename}`);
            return basename;
          }
        }
        
        // Try by description pattern (contains parasha names)
        const desc = event.getDesc();
        if (desc && (desc.includes('Parashat') || desc.includes('פרשת') || 
                    ['Bereshit', 'Noach', 'Lech-Lecha', 'Vayera', 'Chayei Sara', 'Toldot', 'Vayetzei', 'Vayishlach', 'Vayeshev', 'Miketz', 'Vayigash', 'Vayechi', 'Shemot', 'Vaera', 'Bo', 'Beshalach', 'Yitro', 'Mishpatim', 'Terumah', 'Tetzaveh', 'Ki Tisa', 'Vayakhel', 'Pekudei', 'Vayikra', 'Tzav', 'Shmini', 'Tazria', 'Metzora', 'Achrei Mot', 'Kedoshim', 'Emor', 'Behar', 'Bechukotai', 'Bamidbar', 'Nasso', 'Beha\'alotcha', 'Sh\'lach', 'Korach', 'Chukat', 'Balak', 'Pinchas', 'Matot', 'Masei', 'Devarim', 'Vaetchanan', 'Eikev', 'Re\'eh', 'Shoftim', 'Ki Teitzei', 'Ki Tavo', 'Nitzavim', 'Vayeilech', 'Ha\'azinu', 'V\'Zot HaBerachah'].includes(desc))) {
          console.log(`✅ Found parasha by description pattern: ${desc}`);
          return desc;
        }
      }
      
      console.log(`❌ No parasha found for ${hdate.toString()}`);
      
      return undefined;
    } catch (error) {
      console.log('HDate parsha calculation failed:', error);
      return undefined;
    }
  };

  // Bidirectional Hebrew-English parasha mapping
  const parashaMapping: { [key: string]: string } = {
    // Hebrew to English
    'בראשית': 'Bereishit', 'נח': 'Noach', 'לך לך': 'Lech Lecha', 'וירא': 'Vayera', 
    'חיי שרה': 'Chayei Sarah', 'תולדות': 'Toldot', 'ויצא': 'Vayetzei', 'וישלח': 'Vayishlach', 
    'וישב': 'Vayeshev', 'מקץ': 'Miketz', 'ויגש': 'Vayigash', 'ויחי': 'Vayechi',
    'שמות': 'Shemot', 'וארא': 'Vaera', 'בא': 'Bo', 'בשלח': 'Beshalach', 
    'יתרו': 'Yitro', 'משפטים': 'Mishpatim', 'תרומה': 'Terumah', 'תצוה': 'Tetzaveh', 
    'כי תשא': 'Ki Tisa', 'ויקהל': 'Vayakhel', 'פקודי': 'Pekudei', 'ויקהל-פקודי': 'Vayakhel-Pekudei',
    'ויקרא': 'Vayikra', 'צו': 'Tzav', 'שמיני': 'Shemini', 'תזריע': 'Tazria', 
    'מצורע': 'Metzora', 'אחרי מות': 'Acharei Mot', 'קדושים': 'Kedoshim', 'אמור': 'Emor', 
    'בהר': 'Behar', 'בחקתי': 'Bechukotai',
    'במדבר': 'Bamidbar', 'נשא': 'Nasso', 'בהעלתך': 'Beha\'alotcha', 'שלח לך': 'Sh\'lach', 
    'קרח': 'Korach', 'חקת': 'Chukat', 'בלק': 'Balak', 'פינחס': 'Pinchas', 
    'מטות': 'Matot', 'מסעי': 'Masei',
    'דברים': 'Devarim', 'ואתחנן': 'Vaetchanan', 'עקב': 'Eikev', 'ראה': 'Re\'eh', 
    'שפטים': 'Shoftim', 'כי תצא': 'Ki Teitzei', 'כי תבוא': 'Ki Tavo', 'נצבים': 'Nitzavim', 
    'וילך': 'Vayeilech', 'האזינו': 'Haazinu', 'וזאת הברכה': 'Vezot Habracha',
    
    // English to Hebrew (reverse mapping)
    'Bereishit': 'בראשית', 'Bereshit': 'בראשית', 'Noach': 'נח', 'Lech Lecha': 'לך לך', 'Vayera': 'וירא',
    'Chayei Sarah': 'חיי שרה', 'Toldot': 'תולדות', 'Vayetzei': 'ויצא', 'Vayishlach': 'וישלח',
    'Vayeshev': 'וישב', 'Miketz': 'מקץ', 'Vayigash': 'ויגש', 'Vayechi': 'ויחי',
    'Shemot': 'שמות', 'Vaera': 'וארא', 'Bo': 'בא', 'Beshalach': 'בשלח',
    'Yitro': 'יתרו', 'Mishpatim': 'משפטים', 'Terumah': 'תרומה', 'Tetzaveh': 'תצוה',
    'Ki Tisa': 'כי תשא', 'Vayakhel': 'ויקהל', 'Pekudei': 'פקודי',
    'Vayikra': 'ויקרא', 'Tzav': 'צו', 'Shemini': 'שמיני', 'Tazria': 'תזריע',
    'Metzora': 'מצורע', 'Acharei Mot': 'אחרי מות', 'Kedoshim': 'קדושים', 'Emor': 'אמור',
    'Behar': 'בהר', 'Bechukotai': 'בחקתי',
    'Bamidbar': 'במדבר', 'Nasso': 'נשא', 'Beha\'alotcha': 'בהעלתך', 'Sh\'lach': 'שלח לך',
    'Korach': 'קרח', 'Chukat': 'חקת', 'Balak': 'בלק', 'Pinchas': 'פינחס',
    'Matot': 'מטות', 'Masei': 'מסעי',
    'Devarim': 'דברים', 'Vaetchanan': 'ואתחנן', 'Eikev': 'עקב', 'Re\'eh': 'ראה',
    'Shoftim': 'שפטים', 'Ki Teitzei': 'כי תצא', 'Ki Tavo': 'כי תבוא', 'Nitzavim': 'נצבים',
    'Vayeilech': 'וילך', 'Haazinu': 'האזינו', 'Ha\'azinu': 'האזינו', 'Ha\'Azinu': 'האזינו', 'Vezot Habracha': 'וזאת הברכה',
    // Combined parshiot
    'Vayakhel-Pekudei': 'ויקהל-פקודי', 'Matot-Masei': 'מטות-מסעי', 'Nitzavim-Vayeilech': 'נצבים-וילך',
    'Tazria-Metzora': 'תזריע-מצורע', 'Acharei Mot-Kedoshim': 'אחרי מות-קדושים', 'Behar-Bechukotai': 'בהר-בחקתי',
    'Chukat-Balak': 'חקת-בלק'
  };


  // Format parasha name with Hebrew and optional English
  const formatParashaName = (parashaName: any, showEnglish: boolean = false): string => {
    if (!parashaName) return '';
    
    // Handle case where parasha is an array or object (from HDate library)
    let parashaString = '';
    if (typeof parashaName === 'string') {
      parashaString = parashaName;
    } else if (Array.isArray(parashaName) && parashaName.length > 0) {
      parashaString = parashaName[0].toString();
    } else if (typeof parashaName === 'object' && parashaName.toString) {
      parashaString = parashaName.toString();
    } else {
      return '';
    }
    
    // Handle special cases that should be displayed as-is
    if (parashaString.includes('שבת') || parashaString.includes('חול המועד') || 
        parashaString.includes('End-of-Year') || parashaString.includes('Simchat-Torah')) {
      return parashaString;
    }
    
    // Clean up the parasha name - remove "Parashat" prefix if present
    let cleanName = parashaString;
    if (cleanName.startsWith('Parashat ')) {
      cleanName = cleanName.replace('Parashat ', '');
    }
    if (cleanName.startsWith('פרשת ')) {
      cleanName = cleanName.replace('פרשת ', '');
    }
    
    // Handle combined parshiot (e.g., "Matot-Masei")
    let hebrewName = cleanName;
    if (cleanName.includes('-')) {
      const parts = cleanName.split('-');
      const hebrewParts = parts.map(part => {
        const trimmedPart = part.trim();
        return parashaMapping[trimmedPart] || trimmedPart;
      });
      hebrewName = hebrewParts.join('-');
    } else {
      // Single parasha - convert to Hebrew if mapping exists
      if (parashaMapping[cleanName]) {
        hebrewName = parashaMapping[cleanName];
      }
    }
    
    // Add פרשת prefix
    const withPrefix = `פרשת ${hebrewName}`;
    
    // Show English translation if requested and available
    if (showEnglish) {
      // For combined parshiot, show the clean English name
      const englishName = cleanName;
      if (englishName !== hebrewName) {
        return `${withPrefix}\n(${englishName})`;
      }
    }
    
    return withPrefix;
  };


  // Create correct Hebrew-Gregorian date mapping for any Hebrew date
  const getCorrectGregorianDate = (hebrewDay: number, hebrewMonth: number, hebrewYear: number): Date => {
    // Use HDate library for accurate conversion for all years
    try {
      const hebrewDate = new HDate(hebrewDay, hebrewMonth, hebrewYear);
      return hebrewDate.greg();
    } catch {
      // Fallback calculation if HDate fails
      // Hebrew year 5786 starts approximately September 23, 2025
      const baseYear = 5786;
      const baseDate = new Date(2025, 8, 23); // September 23, 2025
      
      // Calculate approximate year difference (Hebrew year is ~354 days)
      const yearDiff = hebrewYear - baseYear;
      const approximateDate = new Date(baseDate);
      approximateDate.setFullYear(approximateDate.getFullYear() + yearDiff);
      
      // Adjust for month and day within the year
      let totalDays = hebrewDay - 1;
      const monthLengths = [30, 29, 29, 29, 30, 29, 30, 29, 30, 29, 30, 29];
      for (let month = 1; month < hebrewMonth; month++) {
        totalDays += monthLengths[month - 1];
      }
      
      approximateDate.setDate(approximateDate.getDate() + totalDays);
      return approximateDate;
    }
  };

  // Generate calendar for current Hebrew month
  const generateCalendar = () => {
    const days: HebrewCalendarDay[] = [];
    const today = new Date();
    
    try {
      // Use HDate to get accurate days in month
      let daysInMonth = 29;
      try {
        // Try to create day 30 and check if it's still in the same month
        const day30 = new HDate(30, currentHebrewMonth, currentHebrewYear);
        // If day 30 is still in the same month, then the month has 30 days
        if (day30.getMonth() === currentHebrewMonth) {
          daysInMonth = 30;
        } else {
          daysInMonth = 29;
        }
      } catch {
        daysInMonth = 29;
      }
      
      console.log(`📅 Month ${currentHebrewMonth}/${currentHebrewYear} has ${daysInMonth} days`);

      // Generate days for the month using HDate directly
      for (let day = 1; day <= daysInMonth; day++) {
        // Create HDate object directly from Hebrew date
        const hdate = new HDate(day, currentHebrewMonth, currentHebrewYear);
        const gregorianDate = hdate.greg();
        const dayOfWeek = gregorianDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Get holidays for this day using HDate
        const holidays = getHolidaysForDate(hdate);
        
        // Get parasha for Shabbat using HDate library
        let parasha: string | undefined = undefined;
        if (dayOfWeek === 6) {
          parasha = getParashaForHebrewDate(hdate);
          console.log(`📖 Shabbat ${day}/${currentHebrewMonth}/${currentHebrewYear} (${gregorianDate.toDateString()}): parasha = ${parasha}`);
        }
        
        // Debug: Log all dates to console to identify the issue
        if (day <= 3) {
          console.log(`📅 DATE DEBUG (day ${day}):`);
          console.log(`  Current Hebrew Month/Year: ${currentHebrewMonth}/${currentHebrewYear}`);
          console.log(`  Month Name from Array: ${getMonthName(currentHebrewMonth)}`);
          console.log(`  Hebrew Date Input: ${day}/${currentHebrewMonth}/${currentHebrewYear}`);
          console.log(`  HDate object created: ${hdate.toString()}`);
          console.log(`  Gregorian Date Result: ${gregorianDate.toISOString().split('T')[0]}`);
          console.log(`  Expected vs Actual: Should be Sept/Oct 2025, got ${gregorianDate.getMonth() + 1}/${gregorianDate.getFullYear()}`);
          console.log(`  ---`);
        }
        
        const calendarDay: HebrewCalendarDay = {
          hebrewDate: hdate,
          gregorianDate,
          hebrewDay: day,
          hebrewMonth: hdate.getMonthName() || getMonthName(currentHebrewMonth),
          hebrewYear: currentHebrewYear,
          gregorianDay: gregorianDate.getDate(),
          gregorianMonth: gregorianDate.getMonth() + 1,
          gregorianYear: gregorianDate.getFullYear(),
          isShabbat: dayOfWeek === 6,
          isHoliday: holidays.length > 0,
          holidayName: holidays.length > 0 ? holidays.join(', ') : undefined,
          parasha: parasha,
          isCurrentMonth: true,
          isToday: gregorianDate.toDateString() === today.toDateString()
        };
        
        days.push(calendarDay);
      }

      // Fill the calendar grid with empty days at the beginning using HDate
      const firstDayHDate = new HDate(1, currentHebrewMonth, currentHebrewYear);
      const firstDayOfWeek = firstDayHDate.greg().getDay(); // 0 = Sunday
      const calendarGrid: HebrewCalendarDay[] = [];
      
      // Add empty days at the beginning for proper week alignment
      for (let i = 0; i < firstDayOfWeek; i++) {
        // Calculate previous Hebrew dates properly
        let prevHebrewDay = 1 - (firstDayOfWeek - i);
        let prevHebrewMonth = currentHebrewMonth;
        let prevHebrewYear = currentHebrewYear;
        
        // Handle negative days (go to previous month)
        while (prevHebrewDay <= 0) {
          // Handle Hebrew year transitions correctly
          if (currentHebrewMonth === 7) {
            // From Tishrei, go to previous year's Elul
            prevHebrewMonth = 6;
            prevHebrewYear = currentHebrewYear - 1;
          } else if (currentHebrewMonth === 1) {
            // From Nisan, go to previous year's Adar
            prevHebrewMonth = 12;
            prevHebrewYear = currentHebrewYear - 1;
          } else {
            // Normal case: just go to previous month
            prevHebrewMonth = currentHebrewMonth - 1;
            prevHebrewYear = currentHebrewYear;
          }
          
          // Get days in previous month using correct month check
          let daysInPrevMonth = 29;
          try {
            const day30 = new HDate(30, prevHebrewMonth, prevHebrewYear);
            if (day30.getMonth() === prevHebrewMonth) {
              daysInPrevMonth = 30;
            }
          } catch {
            daysInPrevMonth = 29;
          }
          
          prevHebrewDay += daysInPrevMonth;
        }
        
        // Create HDate for the calculated previous date
        const prevHDate = new HDate(prevHebrewDay, prevHebrewMonth, prevHebrewYear);
        const prevGregorianDate = prevHDate.greg();
        
        calendarGrid.push({
          hebrewDate: prevHDate,
          gregorianDate: prevGregorianDate,
          hebrewDay: prevHebrewDay,
          hebrewMonth: getMonthName(prevHebrewMonth) || 'אלול',
          hebrewYear: prevHebrewYear,
          gregorianDay: prevGregorianDate.getDate(),
          gregorianMonth: prevGregorianDate.getMonth() + 1,
          gregorianYear: prevGregorianDate.getFullYear(),
          isShabbat: prevGregorianDate.getDay() === 6,
          isHoliday: false,
          isCurrentMonth: false,
          isToday: prevGregorianDate.toDateString() === today.toDateString(),
          parasha: prevGregorianDate.getDay() === 6 ? getParashaForHebrewDate(prevHDate) : undefined
        });
      }
      
      // Add the actual month days
      calendarGrid.push(...days);
      
      // Don't fill remaining days - just show current month
      // This prevents showing next month's days in current month view
      
      setCalendarDays(calendarGrid);
      
    } catch (error) {
      console.error('Error generating Hebrew calendar:', error);
    }
  };

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    console.log(`🔄 NAVIGATION: Current = ${currentHebrewMonth}/${currentHebrewYear}, Direction = ${direction}`);
    
    if (direction === 'prev') {
      // Going backwards in Hebrew calendar
      if (currentHebrewMonth === 7) {
        // From Tishrei (start of Hebrew year) go to previous year's Elul
        setCurrentHebrewMonth(6); // Elul
        setCurrentHebrewYear(currentHebrewYear - 1);
        console.log(`📅 Special case: Tishrei -> Previous year Elul (${6}/${currentHebrewYear - 1})`);
      } else if (currentHebrewMonth === 1) {
        // From Nisan - check if previous year had Adar II
        try {
          // Try to create Adar II to see if it exists in this year
          const adarII = new HDate(1, 13, currentHebrewYear);
          if (adarII.getMonth() === 13) {
            // Leap year - go to Adar II
            setCurrentHebrewMonth(13);
            console.log(`📅 Leap year: Nisan -> Adar II (${13}/${currentHebrewYear})`);
          } else {
            // Regular year - go to Adar
            setCurrentHebrewMonth(12);
          }
        } catch {
          // If error, assume regular year
          setCurrentHebrewMonth(12);
        }
      } else if (currentHebrewMonth === 13) {
        // From Adar II go to Adar I
        setCurrentHebrewMonth(12);
        console.log(`📅 Adar II -> Adar I (${12}/${currentHebrewYear})`);
      } else {
        // Normal case: just go to previous month in same year
        setCurrentHebrewMonth(currentHebrewMonth - 1);
      }
    } else {
      // Going forwards in Hebrew calendar
      if (currentHebrewMonth === 6) {
        // From Elul go to next year's Tishrei
        setCurrentHebrewMonth(7); // Tishrei
        setCurrentHebrewYear(currentHebrewYear + 1);
        console.log(`📅 Special case: Elul -> Next year Tishrei (${7}/${currentHebrewYear + 1})`);
      } else if (currentHebrewMonth === 12) {
        // From Adar - check if it's a leap year
        try {
          // Try to create Adar II to see if it exists in this year
          const adarII = new HDate(1, 13, currentHebrewYear);
          if (adarII.getMonth() === 13) {
            // Leap year - go to Adar II
            setCurrentHebrewMonth(13);
            console.log(`📅 Leap year: Adar I -> Adar II (${13}/${currentHebrewYear})`);
          } else {
            // Regular year - go to Nisan
            setCurrentHebrewMonth(1);
          }
        } catch {
          // If error, assume regular year
          setCurrentHebrewMonth(1);
        }
      } else if (currentHebrewMonth === 13) {
        // From Adar II go to Nisan
        setCurrentHebrewMonth(1);
        console.log(`📅 Adar II -> Nisan (${1}/${currentHebrewYear})`);
      } else {
        // Normal case: just go to next month in same year
        setCurrentHebrewMonth(currentHebrewMonth + 1);
      }
    }
  };

  const handleYearChange = (year: number) => {
    setCurrentHebrewYear(year);
  };

  const handleMonthChange = (month: number) => {
    setCurrentHebrewMonth(month);
  };

  // Initialize calendar on component mount
  useEffect(() => {
    generateCalendar();
  }, []);

  useEffect(() => {
    generateCalendar();
  }, [currentHebrewYear, currentHebrewMonth]);

  // Generate year options (current year ± 10 years)
  const yearOptions = [];
  for (let year = currentHebrewYear - 10; year <= currentHebrewYear + 10; year++) {
    yearOptions.push(year);
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        לוח שנה עברי
      </Typography>

      {/* Navigation Controls */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3
        }}
      >
        {/* Month Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigateMonth('prev')} 
            size="large"
            sx={{ 
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: '#f0f0f0', transform: 'scale(1.1)' }
            }}
          >
            <ChevronRight />
          </IconButton>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.dark',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {(() => {
              // Get current month name from HDate to handle Adar I/II correctly
              const currentHDate = new HDate(1, currentHebrewMonth, currentHebrewYear);
              const monthName = currentHDate.getMonthName() || getMonthName(currentHebrewMonth);
              console.log(`🗓️ HEADER DEBUG: currentHebrewMonth=${currentHebrewMonth}, monthName=${monthName}`);
              return `${monthName} ${currentHebrewYear}`;
            })()}
          </Typography>
          
          <IconButton 
            onClick={() => navigateMonth('next')} 
            size="large"
            sx={{ 
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: '#f0f0f0', transform: 'scale(1.1)' }
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>

        {/* Year and Month Selectors */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontWeight: 'bold' }}>שנה</InputLabel>
            <Select
              value={currentHebrewYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              label="שנה"
              sx={{ backgroundColor: 'white', borderRadius: 2 }}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontWeight: 'bold' }}>חודש</InputLabel>
            <Select
              value={currentHebrewMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              label="חודש"
              sx={{ backgroundColor: 'white', borderRadius: 2 }}
            >
              {(() => {
                const months = [];
                // Add regular months (1-12)
                for (let i = 1; i <= 12; i++) {
                  const hdate = new HDate(1, i, currentHebrewYear);
                  const monthName = hdate.getMonthName() || getMonthName(i);
                  months.push(
                    <MenuItem key={i} value={i}>{monthName}</MenuItem>
                  );
                }
                
                // Check if this is a leap year and add Adar II (month 13)
                try {
                  const adarII = new HDate(1, 13, currentHebrewYear);
                  if (adarII.getMonth() === 13) {
                    const monthName = adarII.getMonthName() || getMonthName(13);
                    months.push(
                      <MenuItem key={13} value={13}>{monthName}</MenuItem>
                    );
                  }
                } catch {
                  // Not a leap year, no Adar II
                }
                
                return months;
              })()}
            </Select>
          </FormControl>
        </Box>

        {/* Day Headers */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {hebrewDayNames.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center' }}>
              <Paper 
                elevation={2}
                sx={{ 
                  py: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {day}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 2, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e3f2fd'
          }}
        >
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <Grid container spacing={2} key={weekIndex} sx={{ mb: 2 }}>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayArrayIndex = weekIndex * 7 + dayIndex;
                const day = calendarDays[dayArrayIndex];
                
                if (!day) return <Grid item xs key={dayIndex} />;
                
                return (
                  <Grid item xs key={dayIndex}>
                    <Card
                      elevation={day.isCurrentMonth ? 3 : 1}
                      sx={{
                        minHeight: 120,
                        cursor: 'pointer',
                        position: 'relative',
                        backgroundColor: 
                          day.isToday ? '#fff8e1' : // Today - warm yellow
                          day.isHoliday ? '#ffecb3' : // Holiday - light amber
                          day.isShabbat ? '#e8f5e8' : // Shabbat - light green
                          !day.isCurrentMonth ? '#fafafa' : // Other month - very light gray
                          'white', // Regular day
                        border: day.isToday ? '3px solid #ff9800' : 
                               day.isHoliday ? '2px solid #f57c00' :
                               day.isShabbat ? '2px solid #4caf50' :
                               '1px solid #e0e0e0',
                        borderRadius: 2,
                        opacity: day.isCurrentMonth ? 1 : 0.6,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          backgroundColor: day.isToday ? '#fff3cd' : 
                                         day.isHoliday ? '#ffe0b2' :
                                         day.isShabbat ? '#c8e6c9' :
                                         '#f5f5f5',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: 6,
                          zIndex: 10
                        },
                        ...(day.isToday && {
                          boxShadow: '0 4px 20px rgba(255, 152, 0, 0.3)'
                        })
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {/* Day of Week in Hebrew */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: day.isToday ? '#e65100' :
                                   day.isCurrentMonth ? '#1976d2' : '#9e9e9e',
                            mb: 0.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {hebrewWeekDayNames[day.gregorianDate.getDay()]}
                        </Typography>
                        
                        {/* Hebrew Date (Large) */}
                        <Typography 
                          variant="h3" 
                          fontWeight="bold" 
                          sx={{ 
                            textAlign: 'center',
                            mb: 0.5,
                            color: day.isToday ? '#e65100' :
                                   day.isCurrentMonth ? '#1976d2' : '#9e9e9e',
                            fontSize: '2.2rem',
                            lineHeight: 1,
                            textShadow: day.isToday ? '0 2px 4px rgba(230, 81, 0, 0.3)' : 'none'
                          }}
                        >
                          {numberToHebrewLetters(day.hebrewDay)}
                        </Typography>
                        
                        {/* Hebrew Month Name */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            textAlign: 'center',
                            fontSize: '0.7rem',
                            color: day.isToday ? '#bf360c' : 'text.secondary',
                            mb: 0.2,
                            fontWeight: day.isToday ? 'bold' : 'normal'
                          }}
                        >
                          {day.hebrewMonth}
                        </Typography>

                        {/* Gregorian Date */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            textAlign: 'center',
                            fontSize: '0.6rem',
                            color: day.isToday ? '#bf360c' : '#666',
                            mb: 0.5,
                            fontWeight: day.isToday ? 'bold' : 'normal',
                            opacity: 0.8
                          }}
                        >
                          {(() => {
                            // Use the Gregorian date directly from the day object
                            const greg = day.gregorianDate;
                            return `${greg.getDate()}/${greg.getMonth() + 1}`;
                          })()}
                        </Typography>

                        {/* Holiday Name */}
                        {day.isHoliday && day.holidayName && (
                          <Box 
                            sx={{ 
                              backgroundColor: 'rgba(211, 47, 47, 0.1)',
                              borderRadius: 1,
                              p: 0.5,
                              mb: 0.5
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                color: '#d32f2f',
                                display: 'block',
                                textAlign: 'center',
                                lineHeight: 1.2
                              }}
                            >
                              {day.holidayName}
                            </Typography>
                          </Box>
                        )}

                        {/* Shabbat and Parasha */}
                        {day.isShabbat && (
                          <Box 
                            sx={{ 
                              backgroundColor: 'rgba(76, 175, 80, 0.15)',
                              borderRadius: 2,
                              p: 1,
                              textAlign: 'center',
                              border: '1px solid rgba(76, 175, 80, 0.3)'
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.75rem',
                                color: '#1b5e20',
                                display: 'block',
                                fontWeight: 'bold',
                                lineHeight: 1.2,
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                whiteSpace: 'pre-line' // Allow line breaks for English translation
                              }}
                            >
                              {day.parasha ? formatParashaName(day.parasha, true) : 'שבת קודש'}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Paper>
      </Paper>
    </Box>
  );
};

export default HebrewCalendar;
