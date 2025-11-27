/**
 * Date utility functions for VC Time Tracker
 * Handles date formatting, manipulation, and business calendar logic
 */

export interface DateRange {
  start: string;
  end: string;
}

export interface WeekInfo {
  start: string;
  end: string;
  weekNumber: number;
  year: number;
  isCurrentWeek: boolean;
}

export interface MonthInfo {
  start: string;
  end: string;
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  isCurrentMonth: boolean;
}

export class DateUtils {
  // Format constants
  private static readonly DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    US: 'MM/DD/YYYY',
    EU: 'DD/MM/YYYY',
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_SHORT: 'MMM DD',
    DISPLAY_WITH_DAY: 'ddd, MMM DD, YYYY'
  } as const;

  /**
   * Format date string to specified format
   */
  static formatDate(dateString: string, format: keyof typeof DateUtils.DATE_FORMATS = 'ISO'): string {
    const date = new Date(dateString);

    switch (format) {
      case 'ISO':
        return dateString;
      case 'US':
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      case 'EU':
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      case 'DISPLAY':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      case 'DISPLAY_SHORT':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      case 'DISPLAY_WITH_DAY':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      default:
        return dateString;
    }
  }

  /**
   * Get today's date in ISO format
   */
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Check if a date is today
   */
  static isToday(dateString: string): boolean {
    return dateString === this.today();
  }

  /**
   * Check if a date is in the past
   */
  static isPast(dateString: string): boolean {
    return dateString < this.today();
  }

  /**
   * Check if a date is in the future
   */
  static isFuture(dateString: string): boolean {
    return dateString > this.today();
  }

  /**
   * Add days to a date
   */
  static addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Subtract days from a date
   */
  static subtractDays(dateString: string, days: number): string {
    return this.addDays(dateString, -days);
  }

  /**
   * Get start of week (Monday) for a given date
   */
  static getWeekStart(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    date.setDate(diff);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get end of week (Sunday) for a given date
   */
  static getWeekEnd(dateString: string): string {
    const weekStart = this.getWeekStart(dateString);
    return this.addDays(weekStart, 6);
  }

  /**
   * Get week information for a given date
   */
  static getWeekInfo(dateString?: string): WeekInfo {
    const date = new Date(dateString || this.today());
    const start = this.getWeekStart(date.toISOString().split('T')[0]);
    const end = this.getWeekEnd(date.toISOString().split('T')[0]);

    // Calculate week number
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceStartOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil((daysSinceStartOfYear + firstDayOfYear.getDay() + 1) / 7);

    return {
      start,
      end,
      weekNumber,
      year: date.getFullYear(),
      isCurrentWeek: this.isCurrentWeek(start, end)
    };
  }

  /**
   * Check if a week range is the current week
   */
  static isCurrentWeek(weekStart: string, weekEnd: string): boolean {
    const currentWeek = this.getWeekInfo();
    return weekStart === currentWeek.start && weekEnd === currentWeek.end;
  }

  /**
   * Get month information for a given date
   */
  static getMonthInfo(dateString?: string): MonthInfo {
    const date = new Date(dateString || this.today());
    const year = date.getFullYear();
    const month = date.getMonth();

    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      start,
      end,
      year,
      month: month + 1, // Convert to 1-based month
      monthName: monthNames[month],
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      isCurrentMonth: this.isCurrentMonth(year, month)
    };
  }

  /**
   * Check if a year and month is the current month
   */
  static isCurrentMonth(year: number, month: number): boolean {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth();
  }

  /**
   * Get previous month info
   */
  static getPreviousMonthInfo(): MonthInfo {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return this.getMonthInfo(prevMonth.toISOString().split('T')[0]);
  }

  /**
   * Get next month info
   */
  static getNextMonthInfo(): MonthInfo {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.getMonthInfo(nextMonth.toISOString().split('T')[0]);
  }

  /**
   * Get date range for a period type
   */
  static getDateRangeForPeriod(
    period: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth',
    dateString?: string
  ): DateRange {
    const baseDate = dateString || this.today();

    switch (period) {
      case 'today':
        return { start: baseDate, end: baseDate };
      case 'yesterday':
        return { start: this.subtractDays(baseDate, 1), end: this.subtractDays(baseDate, 1) };
      case 'thisWeek':
        const thisWeek = this.getWeekInfo(baseDate);
        return { start: thisWeek.start, end: thisWeek.end };
      case 'lastWeek':
        const lastWeekStart = this.subtractDays(this.getWeekStart(baseDate), 7);
        const lastWeekEnd = this.subtractDays(this.getWeekEnd(baseDate), 7);
        return { start: lastWeekStart, end: lastWeekEnd };
      case 'thisMonth':
        const thisMonth = this.getMonthInfo(baseDate);
        return { start: thisMonth.start, end: thisMonth.end };
      case 'lastMonth':
        const lastMonth = this.getPreviousMonthInfo();
        return { start: lastMonth.start, end: lastMonth.end };
      default:
        return { start: baseDate, end: baseDate };
    }
  }

  /**
   * Generate array of dates for a range
   */
  static generateDateRange(start: string, end: string): string[] {
    const dates: string[] = [];
    let currentDate = start;

    while (currentDate <= end) {
      dates.push(currentDate);
      currentDate = this.addDays(currentDate, 1);
    }

    return dates;
  }

  /**
   * Get day of week for a date
   */
  static getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  /**
   * Get short day of week for a date
   */
  static getShortDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  /**
   * Check if a date is a weekday
   */
  static isWeekday(dateString: string): boolean {
    const date = new Date(dateString);
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  }

  /**
   * Check if a date is a weekend
   */
  static isWeekend(dateString: string): boolean {
    return !this.isWeekday(dateString);
  }

  /**
   * Get the number of weekdays in a date range
   */
  static getWeekdaysInRange(start: string, end: string): number {
    const dates = this.generateDateRange(start, end);
    return dates.filter(date => this.isWeekday(date)).length;
  }

  /**
   * Get the number of weekend days in a date range
   */
  static getWeekendDaysInRange(start: string, end: string): number {
    const dates = this.generateDateRange(start, end);
    return dates.filter(date => this.isWeekend(date)).length;
  }

  /**
   * Format a relative date (e.g., "Today", "Yesterday", "Last Monday")
   */
  static formatRelativeDate(dateString: string): string {
    if (this.isToday(dateString)) {
      return 'Today';
    }

    if (this.isPast(dateString)) {
      const daysDiff = Math.floor((new Date(this.today()).getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        return 'Yesterday';
      }

      if (daysDiff <= 7) {
        const dayName = this.getDayOfWeek(dateString);
        return daysDiff === 7 ? `Last ${dayName}` : dayName;
      }
    }

    if (this.isFuture(dateString)) {
      const daysDiff = Math.floor((new Date(dateString).getTime() - new Date(this.today()).getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        return 'Tomorrow';
      }

      if (daysDiff <= 7) {
        return this.getDayOfWeek(dateString);
      }
    }

    return this.formatDate(dateString, 'DISPLAY');
  }

  /**
   * Get the fiscal quarter for a date
   */
  static getFiscalQuarter(dateString: string): { quarter: number; year: number; name: string } {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // Convert to 1-based
    const quarter = Math.ceil(month / 3);
    const year = date.getFullYear();

    return {
      quarter,
      year,
      name: `Q${quarter} ${year}`
    };
  }

  /**
   * Check if a date is within a fiscal quarter
   */
  static isInFiscalQuarter(dateString: string, quarter: number, year: number): boolean {
    const dateInfo = this.getFiscalQuarter(dateString);
    return dateInfo.quarter === quarter && dateInfo.year === year;
  }

  /**
   * Get date range for a fiscal quarter
   */
  static getFiscalQuarterRange(quarter: number, year: number): DateRange {
    const startMonth = (quarter - 1) * 3 + 1;
    const startDate = new Date(year, startMonth - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, startMonth + 2, 0).toISOString().split('T')[0];

    return { start: startDate, end: endDate };
  }
}