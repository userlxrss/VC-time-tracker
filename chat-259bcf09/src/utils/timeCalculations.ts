/**
 * Time calculation utilities for VC Time Tracker
 * Handles complex time calculations, formatting, and business logic
 */

import { TimeEntry, ShortBreak, TimeEntryStatus } from '../types';

export interface TimeSummary {
  totalHours: number;
  workHours: number;
  breakHours: number;
  overtimeHours: number;
  regularHours: number;
}

export interface WorkDaySummary {
  date: string;
  status: TimeEntryStatus;
  totalHours: number;
  workHours: number;
  breakHours: number;
  isComplete: boolean;
  hasIssues: boolean;
}

export interface PayPeriodSummary {
  periodStart: string;
  periodEnd: string;
  totalDays: number;
  workedDays: number;
  totalHours: number;
  averageHoursPerDay: number;
  overtimeHours: number;
  estimatedPay: number;
}

export class TimeCalculator {
  // Constants for business rules
  private static readonly REGULAR_HOURS_PER_DAY = 8;
  private static readonly LUNCH_BREAK_REQUIRED_HOURS = 6;
  private static readonly MIN_LUNCH_DURATION = 30; // minutes
  private static readonly MAX_SHORT_BREAKS_PER_DAY = 4;
  private static readonly MAX_SHORT_BREAK_DURATION = 60; // minutes

  /**
   * Calculate total work hours with proper break deductions
   */
  static calculateWorkHours(entry: TimeEntry): number {
    if (!entry.clockIn || !entry.clockOut) return 0;

    const clockInTime = this.parseTime(entry.clockIn);
    const clockOutTime = this.parseTime(entry.clockOut);

    // Total time between clock in and out
    const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60);

    // Calculate break minutes
    const lunchMinutes = this.calculateLunchBreakMinutes(entry);
    const shortBreakMinutes = this.calculateShortBreaksMinutes(entry.shortBreaks);
    const totalBreakMinutes = lunchMinutes + shortBreakMinutes;

    // Work minutes = total minutes - break minutes
    const workMinutes = Math.max(0, totalMinutes - totalBreakMinutes);
    return workMinutes / 60; // Convert to hours
  }

  /**
   * Calculate lunch break duration in minutes
   */
  static calculateLunchBreakMinutes(entry: TimeEntry): number {
    if (!entry.lunchBreak.start || !entry.lunchBreak.end) return 0;

    const startTime = this.parseTime(entry.lunchBreak.start);
    const endTime = this.parseTime(entry.lunchBreak.end);
    return Math.max(0, (endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  /**
   * Calculate total short breaks duration in minutes
   */
  static calculateShortBreaksMinutes(breaks: ShortBreak[]): number {
    return breaks.reduce((total, breakItem) => {
      return total + breakItem.duration;
    }, 0);
  }

  /**
   * Calculate total break hours
   */
  static calculateBreakHours(entry: TimeEntry): number {
    const lunchMinutes = this.calculateLunchBreakMinutes(entry);
    const shortBreakMinutes = this.calculateShortBreaksMinutes(entry.shortBreaks);
    return (lunchMinutes + shortBreakMinutes) / 60;
  }

  /**
   * Calculate total hours from clock in to clock out (including breaks)
   */
  static calculateTotalHours(entry: TimeEntry): number {
    if (!entry.clockIn || !entry.clockOut) return 0;

    const clockInTime = this.parseTime(entry.clockIn);
    const clockOutTime = this.parseTime(entry.clockOut);
    return (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Calculate overtime hours (hours over regular work day)
   */
  static calculateOvertimeHours(entry: TimeEntry): number {
    const workHours = this.calculateWorkHours(entry);
    return Math.max(0, workHours - this.REGULAR_HOURS_PER_DAY);
  }

  /**
   * Calculate regular hours (capped at regular work day)
   */
  static calculateRegularHours(entry: TimeEntry): number {
    const workHours = this.calculateWorkHours(entry);
    return Math.min(workHours, this.REGULAR_HOURS_PER_DAY);
  }

  /**
   * Get comprehensive time summary for a time entry
   */
  static getTimeSummary(entry: TimeEntry): TimeSummary {
    const totalHours = this.calculateTotalHours(entry);
    const workHours = this.calculateWorkHours(entry);
    const breakHours = this.calculateBreakHours(entry);
    const overtimeHours = this.calculateOvertimeHours(entry);
    const regularHours = this.calculateRegularHours(entry);

    return {
      totalHours,
      workHours,
      breakHours,
      overtimeHours,
      regularHours
    };
  }

  /**
   * Parse time string to Date object
   */
  static parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Format minutes to human readable string
   */
  static formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  /**
   * Format decimal hours to human readable string
   */
  static formatHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    return `${wholeHours}h ${minutes}m`;
  }

  /**
   * Format time string for display
   */
  static formatTimeString(timeString: string, format: '12h' | '24h' = '12h'): string {
    if (!timeString) return '--:--';

    const [hours, minutes] = timeString.split(':').map(Number);

    if (format === '24h') {
      return timeString;
    }

    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  /**
   * Add minutes to a time string
   */
  static addMinutes(timeString: string, minutesToAdd: number): string {
    const time = this.parseTime(timeString);
    time.setMinutes(time.getMinutes() + minutesToAdd);
    return time.toTimeString().slice(0, 5);
  }

  /**
   * Calculate time difference between two time strings
   */
  static getTimeDifference(startTime: string, endTime: string): number {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
  }

  /**
   * Check if a time is within work hours range
   */
  static isWithinWorkHours(timeString: string, workStart: string = '09:00', workEnd: string = '17:00'): boolean {
    const time = this.parseTime(timeString);
    const startTime = this.parseTime(workStart);
    const endTime = this.parseTime(workEnd);

    return time >= startTime && time <= endTime;
  }

  /**
   * Validate time entry for business rule compliance
   */
  static validateBusinessRules(entry: TimeEntry): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!entry.clockIn || !entry.clockOut) {
      return { isValid: false, warnings: ['Missing clock in or clock out time'] };
    }

    const workHours = this.calculateWorkHours(entry);
    const lunchMinutes = this.calculateLunchBreakMinutes(entry);

    // Lunch break validation
    if (workHours * 60 >= this.LUNCH_BREAK_REQUIRED_HOURS * 60) {
      if (!entry.lunchBreak.start || !entry.lunchBreak.end) {
        warnings.push(`Lunch break required for shifts over ${this.LUNCH_BREAK_REQUIRED_HOURS} hours`);
      } else if (lunchMinutes < this.MIN_LUNCH_DURATION) {
        warnings.push(`Lunch break should be at least ${this.MIN_LUNCH_DURATION} minutes`);
      }
    }

    // Short breaks validation
    if (entry.shortBreaks.length > this.MAX_SHORT_BREAKS_PER_DAY) {
      warnings.push(`More than ${this.MAX_SHORT_BREAKS_PER_DAY} short breaks taken`);
    }

    const longBreaks = entry.shortBreaks.filter(b => b.duration > this.MAX_SHORT_BREAK_DURATION);
    if (longBreaks.length > 0) {
      warnings.push(`${longBreaks.length} break(s) exceed ${this.MAX_SHORT_BREAK_DURATION} minutes`);
    }

    // Work hours validation
    if (workHours > 12) {
      warnings.push('Very long shift detected (over 12 hours)');
    } else if (workHours < 4) {
      warnings.push('Very short shift detected (under 4 hours)');
    }

    // Clock in/out time validation
    const clockInTime = this.parseTime(entry.clockIn);
    const clockOutTime = this.parseTime(entry.clockOut);

    if (clockInTime.getHours() < 6 || clockInTime.getHours() > 10) {
      warnings.push('Unusual clock in time (outside 6 AM - 10 AM)');
    }

    if (clockOutTime.getHours() < 15 || clockOutTime.getHours() > 23) {
      warnings.push('Unusual clock out time (outside 3 PM - 11 PM)');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Calculate work week summary
   */
  static calculateWeekSummary(entries: TimeEntry[]): {
    totalDays: number;
    workedDays: number;
    totalHours: number;
    averageHours: number;
    overtimeHours: number;
    totalBreakHours: number;
  } {
    const workedDays = entries.filter(e => e.clockIn && e.clockOut).length;
    const totalHours = entries.reduce((sum, entry) => sum + this.calculateWorkHours(entry), 0);
    const overtimeHours = entries.reduce((sum, entry) => sum + this.calculateOvertimeHours(entry), 0);
    const totalBreakHours = entries.reduce((sum, entry) => sum + this.calculateBreakHours(entry), 0);

    return {
      totalDays: entries.length,
      workedDays,
      totalHours,
      averageHours: workedDays > 0 ? totalHours / workedDays : 0,
      overtimeHours,
      totalBreakHours
    };
  }

  /**
   * Generate work day summary
   */
  static generateWorkDaySummary(entry: TimeEntry): WorkDaySummary {
    const summary = this.getTimeSummary(entry);
    const isComplete = !!(entry.clockIn && entry.clockOut);
    const validation = this.validateBusinessRules(entry);

    return {
      date: entry.date,
      status: entry.status,
      totalHours: summary.totalHours,
      workHours: summary.workHours,
      breakHours: summary.breakHours,
      isComplete,
      hasIssues: !validation.isValid || validation.warnings.length > 0
    };
  }

  /**
   * Calculate estimated pay (for future use)
   */
  static calculateEstimatedPay(entries: TimeEntry[], hourlyRate: number = 15): number {
    const regularHours = entries.reduce((sum, entry) => sum + this.calculateRegularHours(entry), 0);
    const overtimeHours = entries.reduce((sum, entry) => sum + this.calculateOvertimeHours(entry), 0);

    // Overtime is typically 1.5x regular rate
    return (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5);
  }
}