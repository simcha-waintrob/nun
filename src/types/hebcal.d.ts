declare module 'hebcal' {
  export class HDate {
    constructor(date?: Date | number | string, month?: string | number, year?: number);
    getFullYear(): number;
    greg(): Date;
    toString(format?: string): string;
  }

  export class HebrewCalendar {
    static calendar(options: any): any[];
  }

  export class ParshaEvent {
    basename(): string;
    getDate(): HDate;
  }

  export class HolidayEvent {
    getDesc(): string;
    getDate(): HDate;
  }
}
