import { HDate } from '@hebcal/core';

/**
 * Hebrew Date Service - שירות מרכזי לניהול תאריכים עבריים
 * 
 * שירות זה מספק פונקציות מרכזיות לכל הפרויקט:
 * - המרה בין תאריכים עבריים ללועזיים
 * - המרת מספרים לגימטריה
 * - שמות חודשים עבריים
 * - עיצוב תאריכים
 */

// ============================================================================
// Hebrew Month Names - שמות חודשים עבריים
// ============================================================================

export const HEBREW_MONTHS = [
  { value: 1, label: 'ניסן', english: 'Nisan' },
  { value: 2, label: 'אייר', english: 'Iyyar' },
  { value: 3, label: 'סיון', english: 'Sivan' },
  { value: 4, label: 'תמוז', english: 'Tamuz' },
  { value: 5, label: 'אב', english: 'Av' },
  { value: 6, label: 'אלול', english: 'Elul' },
  { value: 7, label: 'תשרי', english: 'Tishrei' },
  { value: 8, label: 'חשוון', english: 'Cheshvan' },
  { value: 9, label: 'כסלו', english: 'Kislev' },
  { value: 10, label: 'טבת', english: 'Tevet' },
  { value: 11, label: 'שבט', english: 'Shvat' },
  { value: 12, label: 'אדר', english: 'Adar' },
  { value: 13, label: 'אדר א׳', english: 'Adar I' },
  { value: 14, label: 'אדר ב׳', english: 'Adar II' }
] as const;

/**
 * קבלת שם חודש עברי לפי מספר
 */
export function getHebrewMonthName(monthNumber: number): string {
  const month = HEBREW_MONTHS.find(m => m.value === monthNumber);
  return month?.label || '';
}

/**
 * קבלת שם חודש עברי מתוך HDate
 */
export function getHebrewMonthNameFromHDate(hdate: HDate): string {
  try {
    const monthName = hdate.getMonthName();
    
    // Map English month names to Hebrew
    const monthMap: { [key: string]: string } = {
      'Nisan': 'ניסן',
      'Iyyar': 'אייר',
      'Sivan': 'סיון',
      'Tamuz': 'תמוז',
      'Av': 'אב',
      'Elul': 'אלול',
      'Tishrei': 'תשרי',
      'Cheshvan': 'חשוון',
      'Kislev': 'כסלו',
      'Tevet': 'טבת',
      'Shvat': 'שבט',
      'Adar': 'אדר',
      'Adar I': 'אדר א׳',
      'Adar II': 'אדר ב׳'
    };
    
    return monthMap[monthName] || monthName;
  } catch {
    return getHebrewMonthName(hdate.getMonth());
  }
}

/**
 * קבלת כל שמות החודשים העבריים
 */
export function getAllHebrewMonths() {
  return HEBREW_MONTHS.slice(0, 12); // Without Adar I/II
}

// ============================================================================
// Gematria Conversion - המרה לגימטריה
// ============================================================================

/**
 * המרת מספר לגימטריה עברית
 * @param num - מספר להמרה (1-999)
 * @returns מחרוזת בגימטריה עם גרשיים/גרש
 * 
 * @example
 * toGematria(5) // returns "ה׳"
 * toGematria(15) // returns "ט״ו"
 * toGematria(786) // returns "תשפ״ו"
 */
export function toGematria(num: number): string {
  if (num <= 0) return num.toString();
  if (num > 999) return num.toString();
  
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
  
  // Special cases for 15 and 16 (to avoid using God's name)
  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';
  
  let result = '';
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;
  
  if (h > 0 && h < hundreds.length) result += hundreds[h];
  if (t > 0 && t < tens.length) result += tens[t];
  if (o > 0 && o < ones.length) result += ones[o];
  
  // Add gershayim (״) between last two letters, or geresh (׳) for single letter
  if (result.length > 1) {
    return result.slice(0, -1) + '״' + result.slice(-1);
  } else if (result.length === 1) {
    return result + '׳';
  }
  
  return result || num.toString();
}

/**
 * המרת שנה עברית לגימטריה (מסיר את האלפים)
 * @param year - שנה עברית (5000-5999)
 * @returns שנה בגימטריה
 * 
 * @example
 * yearToGematria(5786) // returns "תשפ״ו"
 * yearToGematria(5800) // returns "ת״ת"
 */
export function yearToGematria(year: number): string {
  // Remove the thousands (5000)
  const shortYear = year % 1000;
  return toGematria(shortYear);
}

/**
 * המרת יום בחודש לגימטריה
 * @param day - יום (1-30)
 * @returns יום בגימטריה
 * 
 * @example
 * dayToGematria(7) // returns "ז׳"
 * dayToGematria(15) // returns "ט״ו"
 */
export function dayToGematria(day: number): string {
  return toGematria(day);
}

// ============================================================================
// Date Conversion - המרות תאריכים
// ============================================================================

/**
 * המרת תאריך עברי לתאריך לועזי
 * @param day - יום
 * @param month - חודש (1-14)
 * @param year - שנה עברית
 * @returns תאריך לועזי בפורמט YYYY-MM-DD
 */
export function hebrewToGregorian(day: number, month: number, year: number): string {
  try {
    const hdate = new HDate(day, month, year);
    const gdate = hdate.greg();
    const yyyy = gdate.getFullYear();
    const mm = String(gdate.getMonth() + 1).padStart(2, '0');
    const dd = String(gdate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (error) {
    console.error('Error converting Hebrew to Gregorian:', error);
    return '';
  }
}

/**
 * המרת תאריך לועזי לתאריך עברי
 * @param dateStr - תאריך לועזי (YYYY-MM-DD או Date object)
 * @returns אובייקט עם יום, חודש ושנה עבריים
 */
export function gregorianToHebrew(dateStr: string | Date): { day: number; month: number; year: number } {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const hdate = new HDate(date);
    return {
      day: hdate.getDate(),
      month: hdate.getMonth(),
      year: hdate.getFullYear()
    };
  } catch (error) {
    console.error('Error converting Gregorian to Hebrew:', error);
    return { day: 1, month: 7, year: 5786 };
  }
}

/**
 * קבלת HDate מתאריך לועזי
 */
export function getHDateFromGregorian(dateStr: string | Date): HDate {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new HDate(date);
}

/**
 * קבלת HDate מתאריך עברי
 */
export function getHDateFromHebrew(day: number, month: number, year: number): HDate {
  return new HDate(day, month, year);
}

// ============================================================================
// Date Formatting - עיצוב תאריכים
// ============================================================================

/**
 * עיצוב תאריך עברי מלא עם גימטריה
 * @param day - יום
 * @param month - חודש
 * @param year - שנה
 * @returns תאריך מעוצב בעברית
 * 
 * @example
 * formatHebrewDate(7, 7, 5786) // returns "ז׳ תשרי תשפ״ו"
 */
export function formatHebrewDate(day: number, month: number, year: number): string {
  const dayGematria = dayToGematria(day);
  const monthName = getHebrewMonthName(month);
  const yearGematria = yearToGematria(year);
  
  return `${dayGematria} ${monthName} ${yearGematria}`;
}

/**
 * עיצוב תאריך עברי מ-HDate
 */
export function formatHebrewDateFromHDate(hdate: HDate): string {
  const day = hdate.getDate();
  const month = hdate.getMonth();
  const year = hdate.getFullYear();
  
  return formatHebrewDate(day, month, year);
}

/**
 * עיצוב תאריך עברי קצר (ללא שנה)
 * @example
 * formatHebrewDateShort(7, 7) // returns "ז׳ תשרי"
 */
export function formatHebrewDateShort(day: number, month: number): string {
  const dayGematria = dayToGematria(day);
  const monthName = getHebrewMonthName(month);
  
  return `${dayGematria} ${monthName}`;
}

/**
 * עיצוב תאריך לועזי לתאריך עברי
 * @param dateStr - תאריך לועזי
 * @returns תאריך עברי מעוצב
 */
export function formatGregorianAsHebrew(dateStr: string | Date): string {
  const hdate = getHDateFromGregorian(dateStr);
  return formatHebrewDateFromHDate(hdate);
}

// ============================================================================
// Date Utilities - כלי עזר
// ============================================================================

/**
 * קבלת מספר ימים בחודש עברי
 */
export function getDaysInHebrewMonth(month: number, year: number): number {
  try {
    const day30 = new HDate(30, month, year);
    return day30.getMonth() === month ? 30 : 29;
  } catch {
    return 29;
  }
}

/**
 * בדיקה האם שנה מעוברת
 */
export function isLeapYear(year: number): boolean {
  try {
    const adarII = new HDate(1, 13, year);
    return adarII.getMonth() === 13;
  } catch {
    return false;
  }
}

/**
 * קבלת תאריך עברי נוכחי
 */
export function getCurrentHebrewDate(): { day: number; month: number; year: number; formatted: string } {
  const hdate = new HDate();
  const day = hdate.getDate();
  const month = hdate.getMonth();
  const year = hdate.getFullYear();
  
  return {
    day,
    month,
    year,
    formatted: formatHebrewDate(day, month, year)
  };
}

/**
 * קבלת רשימת שנים עבריות (לשימוש ב-dropdowns)
 * @param startYear - שנת התחלה
 * @param count - כמות שנים
 * @returns מערך של שנים עם value ו-label בגימטריה
 */
export function getHebrewYearsList(startYear: number = 5776, count: number = 21) {
  return Array.from({ length: count }, (_, i) => {
    const year = startYear + i;
    return {
      value: year,
      label: yearToGematria(year)
    };
  });
}

/**
 * קבלת רשימת ימים בחודש (לשימוש ב-dropdowns)
 */
export function getHebrewDaysList(month: number, year: number) {
  const daysInMonth = getDaysInHebrewMonth(month, year);
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      value: day,
      label: dayToGematria(day)
    };
  });
}

// ============================================================================
// Export Default Service Object
// ============================================================================

const HebrewDateService = {
  // Month names
  HEBREW_MONTHS,
  getHebrewMonthName,
  getHebrewMonthNameFromHDate,
  getAllHebrewMonths,
  
  // Gematria
  toGematria,
  yearToGematria,
  dayToGematria,
  
  // Conversion
  hebrewToGregorian,
  gregorianToHebrew,
  getHDateFromGregorian,
  getHDateFromHebrew,
  
  // Formatting
  formatHebrewDate,
  formatHebrewDateFromHDate,
  formatHebrewDateShort,
  formatGregorianAsHebrew,
  
  // Utilities
  getDaysInHebrewMonth,
  isLeapYear,
  getCurrentHebrewDate,
  getHebrewYearsList,
  getHebrewDaysList
};

export default HebrewDateService;
