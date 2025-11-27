/**
 * Manila Time Utilities
 *
 * Comprehensive timezone handling for Asia/Manila (UTC+8)
 * with business day calculations and working hour computations.
 */

import { ManilaTimeUtils } from '../../database-schema';

// Manila timezone configuration
const MANILA_TIMEZONE = 'Asia/Manila';
const UTC_OFFSET_HOURS = 8; // Manila is UTC+8

// Business hours configuration (for calculations, not enforcement)
const BUSINESS_HOURS = {
  start: 9, // 9:00 AM
  end: 18, // 6:00 PM
  lunchStart: 12, // 12:00 PM
  lunchEnd: 13, // 1:00 PM
};

// Working days (Monday to Friday)
const WORKING_DAYS = [1, 2, 3, 4, 5]; // 1 = Monday, 7 = Sunday

// Philippine holidays (simplified - in production, this would come from an API)
const PHILIPPINE_HOLIDAYS = [
  // Regular holidays (examples - these should be updated annually)
  '2024-01-01', // New Year's Day
  '2024-04-09', // Araw ng Kagitingan
  '2024-04-10', // Maundy Thursday
  '2024-04-11', // Good Friday
  '2024-05-01', // Labor Day
  '2024-06-12', // Independence Day
  '2024-08-26', // National Heroes Day
  '2024-11-30', // Bonifacio Day
  '2024-12-25', // Christmas Day
  '2024-12-30', // Rizal Day

  // 2025 holidays (examples)
  '2025-01-01', // New Year's Day
  '2025-04-09', // Araw ng Kagitingan
  '2025-04-17', // Maundy Thursday
  '2025-04-18', // Good Friday
  '2025-05-01', // Labor Day
  '2025-06-12', // Independence Day
  '2025-08-25', // National Heroes Day
  '2025-11-30', // Bonifacio Day
  '2025-12-25', // Christmas Day
  '2025-12-30', // Rizal Day
];

/**
 * Custom error for Manila time operations
 */
class ManilaTimeError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'ManilaTimeError';
  }
}

/**
 * Manila Time Utilities implementation
 */
export class ManilaTimeUtilsImpl implements ManilaTimeUtils {

  /**
   * Get current time in Manila timezone
   */
  now(): Date {
    const now = new Date();
    return this.toManilaTime(now);
  }

  /**
   * Convert any date to Manila time
   */
  toManilaTime(date: Date): Date {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new ManilaTimeError('Invalid date provided', 'toManilaTime');
    }

    // Create a new date in Manila timezone
    const utcTime = date.getTime();
    const manilaTime = new Date(utcTime + (UTC_OFFSET_HOURS * 60 * 60 * 1000));

    // Adjust for timezone offset differences
    const offset = date.getTimezoneOffset() * 60 * 1000;
    const adjustedTime = new Date(utcTime + offset + (UTC_OFFSET_HOURS * 60 * 60 * 1000));

    return adjustedTime;
  }

  /**
   * Format date in Manila timezone with various format options
   */
  format(date: Date, format: string): string {
    const manilaDate = this.toManilaTime(date);

    const formatMap: Record<string, string> = {
      // Date formats
      'YYYY': manilaDate.getFullYear().toString(),
      'YY': manilaDate.getFullYear().toString().slice(-2),
      'MM': (manilaDate.getMonth() + 1).toString().padStart(2, '0'),
      'DD': manilaDate.getDate().toString().padStart(2, '0'),

      // Time formats
      'HH': manilaDate.getHours().toString().padStart(2, '0'),
      'mm': manilaDate.getMinutes().toString().padStart(2, '0'),
      'ss': manilaDate.getSeconds().toString().padStart(2, '0'),
      'A': manilaDate.getHours() >= 12 ? 'PM' : 'AM',
      'a': manilaDate.getHours() >= 12 ? 'pm' : 'am',

      // Day names
      'dddd': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][manilaDate.getDay()],
      'ddd': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][manilaDate.getDay()],
      'dd': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][manilaDate.getDay()],

      // Month names
      'MMMM': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][manilaDate.getMonth()],
      'MMM': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][manilaDate.getMonth()],
    };

    // Replace format tokens
    let result = format;
    Object.entries(formatMap).forEach(([token, value]) => {
      result = result.replace(new RegExp(token, 'g'), value);
    });

    return result;
  }

  /**
   * Check if date is today in Manila timezone
   */
  isToday(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const manilaNow = this.now();

    return manilaDate.toDateString() === manilaNow.toDateString();
  }

  /**
   * Check if date is yesterday in Manila timezone
   */
  isYesterday(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const yesterday = new Date(this.now());
    yesterday.setDate(yesterday.getDate() - 1);

    return manilaDate.toDateString() === yesterday.toDateString();
  }

  /**
   * Check if date is tomorrow in Manila timezone
   */
  isTomorrow(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const tomorrow = new Date(this.now());
    tomorrow.setDate(tomorrow.getDate() + 1);

    return manilaDate.toDateString() === tomorrow.toDateString();
  }

  /**
   * Get start of day in Manila timezone
   */
  startOfDay(date: Date): Date {
    const manilaDate = this.toManilaTime(date);
    return new Date(
      manilaDate.getFullYear(),
      manilaDate.getMonth(),
      manilaDate.getDate(),
      0, 0, 0, 0
    );
  }

  /**
   * Get end of day in Manila timezone
   */
  endOfDay(date: Date): Date {
    const manilaDate = this.toManilaTime(date);
    return new Date(
      manilaDate.getFullYear(),
      manilaDate.getMonth(),
      manilaDate.getDate(),
      23, 59, 59, 999
    );
  }

  /**
   * Get start of week (Monday) in Manila timezone
   */
  startOfWeek(date: Date): Date {
    const manilaDate = this.toManilaTime(date);
    const day = manilaDate.getDay();
    const diff = manilaDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    return new Date(
      manilaDate.getFullYear(),
      manilaDate.getMonth(),
      diff,
      0, 0, 0, 0
    );
  }

  /**
   * Get end of week (Sunday) in Manila timezone
   */
  endOfWeek(date: Date): Date {
    const start = this.startOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return this.endOfDay(end);
  }

  /**
   * Get start of month in Manila timezone
   */
  startOfMonth(date: Date): Date {
    const manilaDate = this.toManilaTime(date);
    return new Date(
      manilaDate.getFullYear(),
      manilaDate.getMonth(),
      1,
      0, 0, 0, 0
    );
  }

  /**
   * Get end of month in Manila timezone
   */
  endOfMonth(date: Date): Date {
    const manilaDate = this.toManilaTime(date);
    const lastDay = new Date(
      manilaDate.getFullYear(),
      manilaDate.getMonth() + 1,
      0
    );
    return this.endOfDay(lastDay);
  }

  /**
   * Check if a date is a working day in Philippines
   */
  isWorkingDay(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const dayOfWeek = manilaDate.getDay();

    // Check if it's a weekday
    if (!WORKING_DAYS.includes(dayOfWeek)) {
      return false;
    }

    // Check if it's a holiday
    const dateString = this.format(manilaDate, 'YYYY-MM-DD');
    return !PHILIPPINE_HOLIDAYS.includes(dateString);
  }

  /**
   * Check if a date is a Philippine holiday
   */
  isHoliday(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const dateString = this.format(manilaDate, 'YYYY-MM-DD');
    return PHILIPPINE_HOLIDAYS.includes(dateString);
  }

  /**
   * Add business days (excluding weekends and holidays)
   */
  addBusinessDays(date: Date, days: number): Date {
    const manilaDate = this.toManilaTime(date);
    let result = new Date(manilaDate);
    let businessDaysAdded = 0;

    while (businessDaysAdded < Math.abs(days)) {
      result.setDate(result.getDate() + (days > 0 ? 1 : -1));

      if (this.isWorkingDay(result)) {
        businessDaysAdded++;
      }
    }

    return result;
  }

  /**
   * Calculate working hours between two dates
   */
  calculateWorkingHours(start: Date, end: Date): number {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new ManilaTimeError('Invalid dates provided', 'calculateWorkingHours');
    }

    if (start >= end) {
      return 0;
    }

    const manilaStart = this.toManilaTime(start);
    const manilaEnd = this.toManilaTime(end);

    let totalHours = 0;
    let current = new Date(manilaStart);

    while (current < manilaEnd) {
      const endOfDay = this.endOfDay(current);
      const periodEnd = manilaEnd < endOfDay ? manilaEnd : endOfDay;

      if (this.isWorkingDay(current)) {
        // Calculate hours for this day
        const dayStart = this.startOfDay(current);
        const dayHours = (periodEnd.getTime() - Math.max(current.getTime(), dayStart.getTime())) / (1000 * 60 * 60);

        if (dayHours > 0) {
          totalHours += Math.min(dayHours, 24); // Cap at 24 hours per day
        }
      }

      // Move to next day
      current = this.startOfDay(endOfDay);
      current.setDate(current.getDate() + 1);
    }

    return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate total hours between two dates (includes non-working time)
   */
  calculateTotalHours(start: Date, end: Date): number {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new ManilaTimeError('Invalid dates provided', 'calculateTotalHours');
    }

    if (start >= end) {
      return 0;
    }

    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate break duration in hours
   */
  calculateBreakDuration(breakStart: Date, breakEnd?: Date): number {
    if (!(breakStart instanceof Date)) {
      throw new ManilaTimeError('Invalid break start date', 'calculateBreakDuration');
    }

    const endTime = breakEnd || this.now();
    return this.calculateTotalHours(breakStart, endTime);
  }

  /**
   * Get relative time description (e.g., "2 hours ago", "in 3 days")
   */
  getRelativeTime(date: Date): string {
    const manilaDate = this.toManilaTime(date);
    const now = this.now();
    const diffMs = now.getTime() - manilaDate.getTime();
    const diffHours = Math.abs(diffMs / (1000 * 60 * 60));
    const diffDays = Math.abs(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      // Future
      if (diffHours < 1) {
        const minutes = Math.round(diffHours * 60);
        return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        return `in ${Math.round(diffHours)} hour${Math.round(diffHours) !== 1 ? 's' : ''}`;
      } else {
        return `in ${Math.round(diffDays)} day${Math.round(diffDays) !== 1 ? 's' : ''}`;
      }
    } else {
      // Past
      if (diffHours < 1) {
        const minutes = Math.round(diffHours * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${Math.round(diffHours)} hour${Math.round(diffHours) !== 1 ? 's' : ''} ago`;
      } else {
        return `${Math.round(diffDays)} day${Math.round(diffDays) !== 1 ? 's' : ''} ago`;
      }
    }
  }

  /**
   * Get time difference description between two dates
   */
  getTimeDifference(start: Date, end: Date): string {
    const hours = this.calculateTotalHours(start, end);

    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days} day${days !== 1 ? 's' : ''} ${remainingHours.toFixed(1)} hour${remainingHours !== 1 ? 's' : ''}`;
      } else {
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
    }
  }

  /**
   * Get projected completion time for an 8-hour workday
   */
  getProjectedCompletionTime(clockIn: Date, targetHours: number = 8): Date {
    const projectedTime = new Date(clockIn);
    projectedTime.setHours(projectedTime.getHours() + targetHours);
    return projectedTime;
  }

  /**
   * Check if time is within business hours
   */
  isWithinBusinessHours(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const hours = manilaDate.getHours();

    return hours >= BUSINESS_HOURS.start && hours < BUSINESS_HOURS.end;
  }

  /**
   * Check if time is during typical lunch hours
   */
  isLunchTime(date: Date): boolean {
    const manilaDate = this.toManilaTime(date);
    const hours = manilaDate.getHours();

    return hours >= BUSINESS_HOURS.lunchStart && hours < BUSINESS_HOURS.lunchEnd;
  }

  /**
   * Get the next working day after the given date
   */
  getNextWorkingDay(date: Date): Date {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    while (!this.isWorkingDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return this.startOfDay(nextDay);
  }

  /**
   * Get the previous working day before the given date
   */
  getPreviousWorkingDay(date: Date): Date {
    let prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);

    while (!this.isWorkingDay(prevDay)) {
      prevDay.setDate(prevDay.getDate() - 1);
    }

    return this.startOfDay(prevDay);
  }

  /**
   * Get working days in a date range
   */
  getWorkingDaysInRange(start: Date, end: Date): Date[] {
    const workingDays: Date[] = [];
    let current = this.startOfDay(start);
    const endDate = this.endOfDay(end);

    while (current <= endDate) {
      if (this.isWorkingDay(current)) {
        workingDays.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Get time period description (e.g., "Morning", "Afternoon", "Evening")
   */
  getTimeOfDay(date: Date): 'Early Morning' | 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Late Night' {
    const manilaDate = this.toManilaTime(date);
    const hours = manilaDate.getHours();

    if (hours >= 5 && hours < 8) return 'Early Morning';
    if (hours >= 8 && hours < 12) return 'Morning';
    if (hours >= 12 && hours < 17) return 'Afternoon';
    if (hours >= 17 && hours < 21) return 'Evening';
    if (hours >= 21 && hours < 24) return 'Night';
    return 'Late Night';
  }

  /**
   * Format duration in a human-readable way
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    } else if (hours < 8) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
    } else {
      const days = Math.floor(hours / 8);
      const remainingHours = hours % 8;
      return remainingHours > 0 ? `${days}d ${remainingHours.toFixed(1)}h` : `${days}d`;
    }
  }
}

// Export singleton instance
export const manilaTime = new ManilaTimeUtilsImpl();

