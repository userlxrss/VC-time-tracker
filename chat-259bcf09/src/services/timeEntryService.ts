/**
 * Time Entry Service for VC Time Tracker
 * Business logic layer for time entry operations
 */

import {
  TimeEntry,
  TimeEntryStatus,
  ShortBreak,
  BreakType,
  UserProfile,
  createEmptyTimeEntry,
  updateTimeEntryStatus,
  validateTimeEntry
} from '../types';
import { TimeEntryStorage, UserPreferencesStorage, CurrentUserStorage } from '../utils/localStorage';
import { TimeCalculator } from '../utils/timeCalculations';
import { DateUtils } from '../utils/dateUtils';

export interface TimeEntryServiceConfig {
  autoSave?: boolean;
  validateOnSave?: boolean;
  enableBusinessRuleValidation?: boolean;
}

export interface TimeEntryOperation {
  type: 'clock_in' | 'clock_out' | 'start_lunch' | 'end_lunch' | 'start_break' | 'end_break' | 'update';
  timestamp: string;
  userId: string;
  previousEntry?: TimeEntry;
  newEntry?: TimeEntry;
}

export class TimeEntryService {
  private static config: TimeEntryServiceConfig = {
    autoSave: true,
    validateOnSave: true,
    enableBusinessRuleValidation: true
  };

  /**
   * Configure the service
   */
  static configure(config: Partial<TimeEntryServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get or create today's time entry for a user
   */
  static getTodayTimeEntry(userId: string): TimeEntry {
    let entry = TimeEntryStorage.getTodayTimeEntry(userId);

    if (!entry) {
      entry = createEmptyTimeEntry(userId);
      if (this.config.autoSave) {
        this.saveTimeEntry(entry);
      }
    }

    return entry;
  }

  /**
   * Clock in user
   */
  static clockIn(userId: string, clockInTime?: string): { success: boolean; entry: TimeEntry; message?: string } {
    const entry = this.getTodayTimeEntry(userId);

    if (entry.clockIn) {
      return {
        success: false,
        entry,
        message: 'Already clocked in today'
      };
    }

    const updatedEntry: TimeEntry = {
      ...entry,
      clockIn: clockInTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5),
      status: TimeEntryStatus.CLOCKED_IN,
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    const result = this.saveTimeEntry(updatedEntry);
    this.logOperation({
      type: 'clock_in',
      timestamp: new Date().toISOString(),
      userId,
      previousEntry: entry,
      newEntry: updatedEntry
    });

    return {
      success: result,
      entry: updatedEntry,
      message: result ? 'Clocked in successfully' : 'Failed to clock in'
    };
  }

  /**
   * Clock out user
   */
  static clockOut(userId: string, clockOutTime?: string): { success: boolean; entry: TimeEntry; message?: string } {
    const entry = this.getTodayTimeEntry(userId);

    if (!entry.clockIn) {
      return {
        success: false,
        entry,
        message: 'Not clocked in'
      };
    }

    if (entry.clockOut) {
      return {
        success: false,
        entry,
        message: 'Already clocked out'
      };
    }

    const updatedEntry: TimeEntry = {
      ...entry,
      clockOut: clockOutTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5),
      status: TimeEntryStatus.CLOCKED_OUT,
      totalHours: TimeCalculator.calculateWorkHours({ ...entry, clockOut: clockOutTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5) }),
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    const result = this.saveTimeEntry(updatedEntry);
    this.logOperation({
      type: 'clock_out',
      timestamp: new Date().toISOString(),
      userId,
      previousEntry: entry,
      newEntry: updatedEntry
    });

    return {
      success: result,
      entry: updatedEntry,
      message: result ? 'Clocked out successfully' : 'Failed to clock out'
    };
  }

  /**
   * Start lunch break
   */
  static startLunch(userId: string, startTime?: string): { success: boolean; entry: TimeEntry; message?: string } {
    const entry = this.getTodayTimeEntry(userId);

    if (!entry.clockIn) {
      return {
        success: false,
        entry,
        message: 'Not clocked in'
      };
    }

    if (entry.clockOut) {
      return {
        success: false,
        entry,
        message: 'Already clocked out'
      };
    }

    if (entry.lunchBreak.start) {
      return {
        success: false,
        entry,
        message: 'Lunch break already started'
      };
    }

    const updatedEntry: TimeEntry = {
      ...entry,
      lunchBreak: {
        ...entry.lunchBreak,
        start: startTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5)
      },
      status: TimeEntryStatus.ON_LUNCH,
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    const result = this.saveTimeEntry(updatedEntry);

    return {
      success: result,
      entry: updatedEntry,
      message: result ? 'Lunch break started' : 'Failed to start lunch break'
    };
  }

  /**
   * End lunch break
   */
  static endLunch(userId: string, endTime?: string): { success: boolean; entry: TimeEntry; message?: string } {
    const entry = this.getTodayTimeEntry(userId);

    if (!entry.lunchBreak.start) {
      return {
        success: false,
        entry,
        message: 'Lunch break not started'
      };
    }

    if (entry.lunchBreak.end) {
      return {
        success: false,
        entry,
        message: 'Lunch break already ended'
      };
    }

    const startTime = entry.lunchBreak.start;
    const end = endTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5);
    const duration = TimeCalculator.getTimeDifference(startTime, end);

    const updatedEntry: TimeEntry = {
      ...entry,
      lunchBreak: {
        start: startTime,
        end: end,
        duration
      },
      status: TimeEntryStatus.CLOCKED_IN, // Return to clocked in status
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    const result = this.saveTimeEntry(updatedEntry);

    return {
      success: result,
      entry: updatedEntry,
      message: result ? `Lunch break ended (${TimeCalculator.formatMinutes(duration)})` : 'Failed to end lunch break'
    };
  }

  /**
   * Start a short break
   */
  static startBreak(userId: string, breakType: BreakType, startTime?: string): { success: boolean; entry: TimeEntry; message?: string } {
    const entry = this.getTodayTimeEntry(userId);

    if (!entry.clockIn) {
      return {
        success: false,
        entry,
        message: 'Not clocked in'
      };
    }

    if (entry.clockOut) {
      return {
        success: false,
        entry,
        message: 'Already clocked out'
      };
    }

    // Check if there's an active break
    const activeBreak = entry.shortBreaks.find(b => !b.end);
    if (activeBreak) {
      return {
        success: false,
        entry,
        message: 'Break already in progress'
      };
    }

    const newBreak: ShortBreak = {
      id: `break-${entry.id}-${Date.now()}`,
      start: startTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5),
      end: '', // Will be set when break ends
      duration: 0, // Will be calculated when break ends
      type: breakType
    };

    const updatedEntry: TimeEntry = {
      ...entry,
      shortBreaks: [...entry.shortBreaks, newBreak],
      status: TimeEntryStatus.ON_BREAK,
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    const result = this.saveTimeEntry(updatedEntry);

    return {
      success: result,
      entry: updatedEntry,
      message: result ? `${breakType.replace('_', ' ')} started` : 'Failed to start break'
    };
  }

  /**
   * End a short break
   */
  static endBreak(userId: string, breakId: string, endTime?: string): { success: boolean; entry: TimeEntry; message?: string } {
    const entry = this.getTodayTimeEntry(userId);

    const breakIndex = entry.shortBreaks.findIndex(b => b.id === breakId);
    if (breakIndex === -1) {
      return {
        success: false,
        entry,
        message: 'Break not found'
      };
    }

    const breakItem = entry.shortBreaks[breakIndex];
    if (breakItem.end) {
      return {
        success: false,
        entry,
        message: 'Break already ended'
      };
    }

    const end = endTime || TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5);
    const duration = TimeCalculator.getTimeDifference(breakItem.start, end);

    const updatedBreaks = [...entry.shortBreaks];
    updatedBreaks[breakIndex] = {
      ...breakItem,
      end,
      duration
    };

    const updatedEntry: TimeEntry = {
      ...entry,
      shortBreaks: updatedBreaks,
      status: TimeEntryStatus.CLOCKED_IN, // Return to clocked in status
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    const result = this.saveTimeEntry(updatedEntry);

    return {
      success: result,
      entry: updatedEntry,
      message: result ? `Break ended (${TimeCalculator.formatMinutes(duration)})` : 'Failed to end break'
    };
  }

  /**
   * Update time entry with new data
   */
  static updateTimeEntry(userId: string, updates: Partial<TimeEntry>): { success: boolean; entry: TimeEntry; errors?: string[] } {
    const entry = this.getTodayTimeEntry(userId);

    const updatedEntry: TimeEntry = {
      ...entry,
      ...updates,
      id: entry.id, // Preserve original ID
      userId: entry.userId, // Preserve original userId
      date: entry.date, // Preserve original date
      lastModified: new Date().toISOString(),
      modifiedBy: userId
    };

    // Recalculate derived fields
    if (updatedEntry.clockIn && updatedEntry.clockOut) {
      updatedEntry.totalHours = TimeCalculator.calculateWorkHours(updatedEntry);
    }

    updatedEntry.status = updateTimeEntryStatus(updatedEntry);

    // Validation
    if (this.config.validateOnSave) {
      const validation = validateTimeEntry(updatedEntry);
      if (!validation.isValid) {
        return {
          success: false,
          entry: updatedEntry,
          errors: validation.errors
        };
      }
    }

    // Business rule validation
    if (this.config.enableBusinessRuleValidation) {
      const businessValidation = TimeCalculator.validateBusinessRules(updatedEntry);
      // Business rules are warnings, not errors - we still save but might want to warn user
    }

    const result = this.saveTimeEntry(updatedEntry);
    this.logOperation({
      type: 'update',
      timestamp: new Date().toISOString(),
      userId,
      previousEntry: entry,
      newEntry: updatedEntry
    });

    return {
      success: result,
      entry: updatedEntry
    };
  }

  /**
   * Save time entry to storage
   */
  private static saveTimeEntry(entry: TimeEntry): boolean {
    try {
      return TimeEntryStorage.saveTimeEntry(entry);
    } catch (error) {
      console.error('Failed to save time entry:', error);
      return false;
    }
  }

  /**
   * Log time entry operation (for audit trail)
   */
  private static logOperation(operation: TimeEntryOperation): void {
    // In a real application, this would be sent to a backend service
    // For now, we can store it in localStorage for debugging
    const operations = JSON.parse(localStorage.getItem('vctime_operations') || '[]');
    operations.push(operation);

    // Keep only last 100 operations
    if (operations.length > 100) {
      operations.splice(0, operations.length - 100);
    }

    localStorage.setItem('vctime_operations', JSON.stringify(operations));
  }

  /**
   * Get time entries for a date range
   */
  static getTimeEntriesForDateRange(userId: string, startDate: string, endDate: string): TimeEntry[] {
    return TimeEntryStorage.getFilteredTimeEntries({
      userId,
      startDate,
      endDate
    });
  }

  /**
   * Get week summary for a user
   */
  static getWeekSummary(userId: string, weekStart?: string) {
    const weekInfo = DateUtils.getWeekInfo(weekStart);
    const entries = this.getTimeEntriesForDateRange(userId, weekInfo.start, weekInfo.end);

    return {
      weekInfo,
      entries,
      summary: TimeCalculator.calculateWeekSummary(entries)
    };
  }

  /**
   * Get month summary for a user
   */
  static getMonthSummary(userId: string, year?: number, month?: number) {
    const monthInfo = DateUtils.getMonthInfo(year && month ? `${year}-${String(month).padStart(2, '0')}-01` : undefined);
    const entries = this.getTimeEntriesForDateRange(userId, monthInfo.start, monthInfo.end);

    return {
      monthInfo,
      entries,
      summary: TimeCalculator.calculateWeekSummary(entries)
    };
  }

  /**
   * Get current status for a user
   */
  static getCurrentStatus(userId: string): {
    status: TimeEntryStatus;
    entry: TimeEntry;
    currentTime: string;
    hoursWorked: number;
    isOnBreak: boolean;
    activeBreak?: ShortBreak;
  } {
    const entry = this.getTodayTimeEntry(userId);
    const currentTime = TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5);
    const hoursWorked = entry.clockIn ? TimeCalculator.calculateWorkHours({ ...entry, clockOut: currentTime }) : 0;
    const activeBreak = entry.shortBreaks.find(b => !b.end);

    return {
      status: entry.status,
      entry,
      currentTime,
      hoursWorked,
      isOnBreak: !!activeBreak || (entry.lunchBreak.start && !entry.lunchBreak.end),
      activeBreak
    };
  }

  /**
   * Auto-clock out user if configured
   */
  static checkAutoClockOut(userId: string): { autoClockedOut: boolean; entry?: TimeEntry } {
    const preferences = UserPreferencesStorage.getOrCreateUserPreferences(userId);

    if (!preferences.autoClockOut?.enabled) {
      return { autoClockedOut: false };
    }

    const entry = this.getTodayTimeEntry(userId);
    const currentTime = TimeCalculator.parseTime(new Date()).toTimeString().slice(0, 5);
    const autoClockOutTime = preferences.autoClockOut.time;

    if (TimeCalculator.getTimeDifference(autoClockOutTime, currentTime) >= 0 && !entry.clockOut && entry.clockIn) {
      const result = this.clockOut(userId, autoClockOutTime);
      return {
        autoClockedOut: result.success,
        entry: result.entry
      };
    }

    return { autoClockedOut: false };
  }
}