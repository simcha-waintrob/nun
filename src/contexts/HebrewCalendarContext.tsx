import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HDate, HebrewCalendar, ParshaEvent, HolidayEvent } from 'hebcal';

interface HebrewYear {
  id: string;
  yearLabel: string;
  startGregorianDate: Date;
  endGregorianDate: Date;
}

interface HebrewEvent {
  id: string;
  eventType: 'SHABBAT_PARASHA' | 'HOLIDAY' | 'FAST' | 'OTHER';
  parashaName?: string;
  hebrewDateStr: string;
  gregorianDate: Date;
  title: string;
}

interface HebrewCalendarContextType {
  currentHebrewYear: HebrewYear | null;
  hebrewYears: HebrewYear[];
  events: HebrewEvent[];
  loading: boolean;
  error: string | null;
  selectHebrewYear: (year: HebrewYear) => void;
  createHebrewYear: (yearLabel: string) => Promise<void>;
  getHebrewDateString: (date: Date) => string;
  generateEventsForYear: (year: HebrewYear) => Promise<HebrewEvent[]>;
}

const HebrewCalendarContext = createContext<HebrewCalendarContextType | undefined>(undefined);

export const useHebrewCalendar = () => {
  const context = useContext(HebrewCalendarContext);
  if (context === undefined) {
    throw new Error('useHebrewCalendar must be used within a HebrewCalendarProvider');
  }
  return context;
};

interface HebrewCalendarProviderProps {
  children: ReactNode;
}

export const HebrewCalendarProvider: React.FC<HebrewCalendarProviderProps> = ({ children }) => {
  const [currentHebrewYear, setCurrentHebrewYear] = useState<HebrewYear | null>(null);
  const [hebrewYears, setHebrewYears] = useState<HebrewYear[]>([]);
  const [events, setEvents] = useState<HebrewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeCurrentYear();
  }, []);

  const initializeCurrentYear = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentHDate = new HDate(now);
      const hebrewYear = currentHDate.getFullYear();
      
      // Create Hebrew year from Tishrei to Elul
      const startOfYear = new HDate(1, 'Tishrei', hebrewYear);
      const endOfYear = new HDate(29, 'Elul', hebrewYear + 1);
      
      const yearData: HebrewYear = {
        id: hebrewYear.toString(),
        yearLabel: `תש"${getHebrewYearSuffix(hebrewYear)}`,
        startGregorianDate: startOfYear.greg(),
        endGregorianDate: endOfYear.greg()
      };
      
      setHebrewYears([yearData]);
      setCurrentHebrewYear(yearData);
      
      // Generate events for the current year
      const yearEvents = await generateEventsForYear(yearData);
      setEvents(yearEvents);
      
    } catch (err) {
      setError('שגיאה באתחול השנה העברית');
      console.error('Error initializing Hebrew year:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHebrewYearSuffix = (year: number): string => {
    // Convert Hebrew year to Hebrew letters (simplified)
    const yearStr = year.toString();
    const lastTwoDigits = yearStr.slice(-2);
    return lastTwoDigits; // Simplified - would normally convert to Hebrew letters
  };

  const selectHebrewYear = (year: HebrewYear) => {
    setCurrentHebrewYear(year);
  };

  const createHebrewYear = async (yearLabel: string) => {
    try {
      // Extract year number from label or use current + 1
      const currentYear = new HDate().getFullYear();
      const newYear = currentYear + 1;
      
      const startOfYear = new HDate(1, 'Tishrei', newYear);
      const endOfYear = new HDate(29, 'Elul', newYear + 1);
      
      const yearData: HebrewYear = {
        id: newYear.toString(),
        yearLabel,
        startGregorianDate: startOfYear.greg(),
        endGregorianDate: endOfYear.greg()
      };
      
      setHebrewYears(prev => [...prev, yearData]);
      
      // Generate events for the new year
      const yearEvents = await generateEventsForYear(yearData);
      setEvents(prev => [...prev, ...yearEvents]);
      
    } catch (err) {
      setError('שגיאה ביצירת שנה עברית חדשה');
      console.error('Error creating Hebrew year:', err);
    }
  };

  const getHebrewDateString = (date: Date): string => {
    try {
      const hdate = new HDate(date);
      return hdate.toString('h');
    } catch (err) {
      console.error('Error converting to Hebrew date:', err);
      return date.toLocaleDateString('he-IL');
    }
  };

  const generateEventsForYear = async (year: HebrewYear): Promise<HebrewEvent[]> => {
    try {
      const events: HebrewEvent[] = [];
      const startDate = year.startGregorianDate;
      const endDate = year.endGregorianDate;
      
      // Generate Shabbat and Parasha events
      const options = {
        start: startDate,
        end: endDate,
        sedrot: true,
        il: true // Israel calendar
      };
      
      const cal = HebrewCalendar.calendar(options);
      
      cal.forEach((ev: any, index: number) => {
        try {
          if (ev instanceof ParshaEvent) {
            events.push({
              id: `parsha-${index}`,
              eventType: 'SHABBAT_PARASHA',
              parashaName: ev.basename(),
              hebrewDateStr: getHebrewDateString(ev.getDate().greg()),
              gregorianDate: ev.getDate().greg(),
              title: `פרשת ${ev.basename()}`
            });
          } else if (ev instanceof HolidayEvent) {
            events.push({
              id: `holiday-${index}`,
              eventType: ev.getDesc().includes('Fast') ? 'FAST' : 'HOLIDAY',
              hebrewDateStr: getHebrewDateString(ev.getDate().greg()),
              gregorianDate: ev.getDate().greg(),
              title: ev.getDesc()
            });
          }
        } catch (error) {
          console.warn('Error processing calendar event:', error);
        }
      });
      
      return events.sort((a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime());
    } catch (err) {
      console.error('Error generating events for year:', err);
      return [];
    }
  };

  const value: HebrewCalendarContextType = {
    currentHebrewYear,
    hebrewYears,
    events,
    loading,
    error,
    selectHebrewYear,
    createHebrewYear,
    getHebrewDateString,
    generateEventsForYear
  };

  return (
    <HebrewCalendarContext.Provider value={value}>
      {children}
    </HebrewCalendarContext.Provider>
  );
};
