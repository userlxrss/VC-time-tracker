/**
 * Time Entry Management System
 *
 * Comprehensive CRUD operations for time entries with status management,
 * break integration, and automatic calculations.
 */

import {
  TimeEntry,
  TimeEntryStatus,
  BreakPeriod,
  TimeEntryRepository,
  SyncEvent
} from '../../database-schema';
import { manilaTime } from '../utils/manilaTime';
import { breakManager } from '../breaks/breakManager';
import { localStorageManager } from '../storage/localStorageManager';

/**
 * Time entry creation options
 */
export interface CreateTimeEntryOptions {
  userId: string;
  clockInTime?: Date;
  notes?: string;
  clockInLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

/**
 * Time entry update options
 */
export interface UpdateTimeEntryOptions {
  clockOutTime?: Date;
  notes?: string;
  status?: TimeEntryStatus;
  clockOutLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

/**
 * Time entry search filters
 */
export interface TimeEntryFilters {
  startDate?: Date;
  endDate?: Date;
  status?: TimeEntryStatus;
  userId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Time entry statistics
 */
export interface TimeEntryStatistics {
  totalTimeEntries: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  averageHoursPerEntry: number;
  longestEntry: TimeEntry | null;
  shortestEntry: TimeEntry | null;
  entriesByStatus: Record<TimeEntryStatus, number>;
  dailyProgress: {
    date: string;
    hours: number;
    goal: number;
    completion: number;
  }[];
}

/**
 * Validation result for time entries
 */
export interface TimeEntryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Daily work progress
 */
export interface DailyProgress {
  date: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  goalHours: number;
  completionPercentage: number;
  projectedFinishTime?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'exceeded';
}

/**
 * Custom error for time entry operations
 */
class TimeEntryError extends Error {
  constructor(message: string, public operation: string, public entryId?: string) {
    super(message);
    this.name = 'TimeEntryError';
  }
}

/**
 * Time Entry Manager implementation
 */
export class TimeEntryManager implements TimeEntryRepository {
  private readonly WORK_DAY_HOURS = 8;
  private readonly OVERTIME_RATE = 1.25;
  private readonly MAX_CLOCK_IN_FUTURE_MINUTES = 5;
  private readonly MAX_DURATION_HOURS = 24;

  /**
   * Generate unique time entry ID
   */
  private generateTimeEntryId(): string {
    return `time_entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all time entries from storage
   */
  private getAllTimeEntries(): TimeEntry[] {
    const stored = localStorage.getItem('hr_tracker_time_entries');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Save time entries to storage
   */
  private saveTimeEntries(entries: TimeEntry[]): void {
    localStorage.setItem('hr_tracker_time_entries', JSON.stringify(entries));
  }

  /**
   * Sync time entry changes across tabs
   */
  private async syncTimeEntryChange(
    type: 'CLOCK_IN' | 'CLOCK_OUT' | 'ADD_BREAK' | 'END_BREAK' | 'UPDATE',
    userId: string,
    data: any
  ): Promise<void> {
    const syncEvent: SyncEvent = {
      type,
      timestamp: manilaTime.now(),
      userId,
      data,
      tabId: localStorageManager.getTabId()
    };

    localStorageManager.saveSyncEvent(syncEvent);

    // Broadcast to other tabs
    const channel = new BroadcastChannel('hr_time_tracker');
    channel.postMessage({
      type: 'TIME_ENTRY_UPDATE',
      event: syncEvent
    });
    channel.close();
  }

  // ==================== CREATE OPERATIONS ====================

  async create(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<TimeEntry> {
    const validation = this.validateTimeEntry(entry as TimeEntry);
    if (!validation.isValid) {
      throw new TimeEntryError(
        `Validation failed: ${validation.errors.join(', ')}`,
        'create'
      );
    }

    const newEntry: TimeEntry = {
      ...entry,
      id: this.generateTimeEntryId(),
      createdAt: manilaTime.now(),
      updatedAt: manilaTime.now()
    };

    // Calculate computed fields
    this.calculateTimeEntryTotals(newEntry);

    // Save to storage
    const entries = this.getAllTimeEntries();
    entries.push(newEntry);
    this.saveTimeEntries(entries);

    // Sync across tabs
    await this.syncTimeEntryChange('CLOCK_IN', entry.userId, newEntry);

    return newEntry;
  }

  /**
   * Clock in a user
   */
  async clockIn(options: CreateTimeEntryOptions): Promise<TimeEntry> {
    const existingActiveEntry = await this.findActiveEntry(options.userId);
    if (existingActiveEntry) {
      throw new TimeEntryError(
        'User already has an active time entry',
        'clockIn',
        existingActiveEntry.id
      );
    }

    const clockInTime = options.clockInTime || manilaTime.now();

    // Validate clock in time
    const futureLimit = new Date();
    futureLimit.setMinutes(futureLimit.getMinutes() + this.MAX_CLOCK_IN_FUTURE_MINUTES);
    if (clockInTime > futureLimit) {
      throw new TimeEntryError(
        'Cannot clock in more than 5 minutes in the future',
        'clockIn'
      );
    }

    const timeEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> = {
      userId: options.userId,
      clockIn: clockInTime,
      breaks: [],
      status: TimeEntryStatus.ACTIVE,
      clockInLocation: options.clockInLocation,
      notes: options.notes
    };

    return await this.create(timeEntry);
  }

  // ==================== READ OPERATIONS ====================

  async findById(id: string): Promise<TimeEntry | null> {
    const entries = this.getAllTimeEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  async findByUserId(userId: string, options?: TimeEntryFilters): Promise<TimeEntry[]> {
    const entries = this.getAllTimeEntries();
    let filtered = entries.filter(entry => entry.userId === userId);

    if (options) {
      if (options.startDate) {
        filtered = filtered.filter(entry => entry.clockIn >= options.startDate!);
      }

      if (options.endDate) {
        filtered = filtered.filter(entry => entry.clockIn <= options.endDate!);
      }

      if (options.status) {
        filtered = filtered.filter(entry => entry.status === options.status);
      }
    }

    // Sort by clock in time (newest first)
    filtered.sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime());

    if (options?.limit) {
      const start = options.offset || 0;
      filtered = filtered.slice(start, start + options.limit);
    }

    return filtered;
  }

  async findActiveEntry(userId: string): Promise<TimeEntry | null> {
    const entries = this.getAllTimeEntries();
    return entries.find(entry =>
      entry.userId === userId &&
      entry.status === TimeEntryStatus.ACTIVE
    ) || null;
  }

  async findPendingEntries(): Promise<TimeEntry[]> {
    const entries = this.getAllTimeEntries();
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return entries.filter(entry =>
      entry.status === TimeEntryStatus.ACTIVE &&
      entry.clockIn < twentyFourHoursAgo
    );
  }

  // ==================== UPDATE OPERATIONS ====================

  async update(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
    const entries = this.getAllTimeEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      throw new TimeEntryError('Time entry not found', 'update', id);
    }

    const updatedEntry = {
      ...entries[entryIndex],
      ...updates,
      updatedAt: manilaTime.now()
    };

    const validation = this.validateTimeEntry(updatedEntry);
    if (!validation.isValid) {
      throw new TimeEntryError(
        `Validation failed: ${validation.errors.join(', ')}`,
        'update',
        id
      );
    }

    // Recalculate totals
    this.calculateTimeEntryTotals(updatedEntry);

    entries[entryIndex] = updatedEntry;
    this.saveTimeEntries(entries);

    await this.syncTimeEntryChange('UPDATE', updatedEntry.userId, updatedEntry);

    return updatedEntry;
  }

  async clockOut(id: string, clockOutTime: Date = manilaTime.now()): Promise<TimeEntry> {
    const entry = await this.findById(id);
    if (!entry) {
      throw new TimeEntryError('Time entry not found', 'clockOut', id);
    }

    if (entry.status !== TimeEntryStatus.ACTIVE) {
      throw new TimeEntryError(
        'Cannot clock out an inactive time entry',
        'clockOut',
        id
      );
    }

    // Auto-complete any active breaks
    const updatedBreaks = breakManager.autoCompleteBreaks(entry.breaks);

    const updates: Partial<TimeEntry> = {
      clockOut: clockOutTime,
      status: TimeEntryStatus.COMPLETED,
      breaks: updatedBreaks
    };

    const updatedEntry = await this.update(id, updates);
    await this.syncTimeEntryChange('CLOCK_OUT', entry.userId, updatedEntry);

    return updatedEntry;
  }

  async addBreak(entryId: string, breakPeriod: Omit<BreakPeriod, 'id'>): Promise<TimeEntry> {
    const entry = await this.findById(entryId);
    if (!entry) {
      throw new TimeEntryError('Time entry not found', 'addBreak', entryId);
    }

    if (entry.status !== TimeEntryStatus.ACTIVE) {
      throw new TimeEntryError(
        'Cannot add break to inactive time entry',
        'addBreak',
        entryId
      );
    }

    // Validate break
    const validation = breakManager.validateBreak(breakPeriod as BreakPeriod, entry.breaks);
    if (!validation.isValid) {
      throw new TimeEntryError(
        `Break validation failed: ${validation.errors.join(', ')}`,
        'addBreak',
        entryId
      );
    }

    const newBreak = breakManager.startBreak(breakPeriod.type, breakPeriod.duration);
    const updatedBreaks = [...entry.breaks, newBreak];

    const updatedEntry = await this.update(entryId, { breaks: updatedBreaks });
    await this.syncTimeEntryChange('ADD_BREAK', entry.userId, newBreak);

    return updatedEntry;
  }

  async endBreak(entryId: string, breakId: string, endTime?: Date): Promise<TimeEntry> {
    const entry = await this.findById(entryId);
    if (!entry) {
      throw new TimeEntryError('Time entry not found', 'endBreak', entryId);
    }

    const breakPeriod = entry.breaks.find(b => b.id === breakId);
    if (!breakPeriod) {
      throw new TimeEntryError('Break not found', 'endBreak', entryId);
    }

    if (breakPeriod.endTime) {
      throw new TimeEntryError('Break already ended', 'endBreak', entryId);
    }

    const updatedBreak = breakManager.endBreak(breakPeriod, endTime);
    const updatedBreaks = entry.breaks.map(b => b.id === breakId ? updatedBreak : b);

    const updatedEntry = await this.update(entryId, { breaks: updatedBreaks });
    await this.syncTimeEntryChange('END_BREAK', entry.userId, updatedBreak);

    return updatedEntry;
  }

  async approve(id: string, approverId: string): Promise<TimeEntry> {
    const entry = await this.findById(id);
    if (!entry) {
      throw new TimeEntryError('Time entry not found', 'approve', id);
    }

    const updates: Partial<TimeEntry> = {
      status: TimeEntryStatus.APPROVED,
      approvedBy: approverId,
      approvedAt: manilaTime.now()
    };

    return await this.update(id, updates);
  }

  async reject(id: string, approverId: string, reason: string): Promise<TimeEntry> {
    const entry = await this.findById(id);
    if (!entry) {
      throw new TimeEntryError('Time entry not found', 'reject', id);
    }

    const updates: Partial<TimeEntry> = {
      status: TimeEntryStatus.REJECTED,
      approvedBy: approverId,
      approvedAt: manilaTime.now(),
      notes: `${entry.notes || ''}\n\nRejected: ${reason}`.trim()
    };

    return await this.update(id, updates);
  }

  // ==================== DELETE OPERATIONS ====================

  async softDelete(id: string): Promise<void> {
    const entries = this.getAllTimeEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      throw new TimeEntryError('Time entry not found', 'softDelete', id);
    }

    entries[entryIndex].deletedAt = manilaTime.now();
    entries[entryIndex].updatedAt = manilaTime.now();

    this.saveTimeEntries(entries);
  }

  // ==================== CALCULATION METHODS ====================

  /**
   * Calculate totals for a time entry
   */
  private calculateTimeEntryTotals(entry: TimeEntry): void {
    if (!entry.clockOut) {
      // For active entries, calculate current totals
      const now = manilaTime.now();
      entry.totalHours = manilaTime.calculateTotalHours(entry.clockIn, now);

      // Subtract break time
      const totalBreakMinutes = entry.breaks.reduce((total, breakPeriod) => {
        if (breakPeriod.duration) {
          return total + breakPeriod.duration;
        }
        return total;
      }, 0);

      entry.totalHours -= totalBreakMinutes / 60;
    } else {
      // For completed entries, calculate final totals
      entry.totalHours = manilaTime.calculateTotalHours(entry.clockIn, entry.clockOut);

      // Subtract break time
      const totalBreakMinutes = entry.breaks.reduce((total, breakPeriod) => {
        return total + (breakPeriod.duration || 0);
      }, 0);

      entry.totalHours -= totalBreakMinutes / 60;
    }

    // Ensure we don't have negative hours
    entry.totalHours = Math.max(0, entry.totalHours);

    // Calculate regular and overtime hours
    if (entry.totalHours <= this.WORK_DAY_HOURS) {
      entry.regularHours = entry.totalHours;
      entry.overtimeHours = 0;
    } else {
      entry.regularHours = this.WORK_DAY_HOURS;
      entry.overtimeHours = entry.totalHours - this.WORK_DAY_HOURS;
    }

    // Validation flags
    entry.isLate = this.isLateEntry(entry);
    entry.isEarlyDeparture = this.isEarlyDeparture(entry);
  }

  /**
   * Check if entry is late
   */
  private isLateEntry(entry: TimeEntry): boolean {
    const clockInHour = entry.clockIn.getHours();
    return clockInHour > 9; // After 9 AM is considered late
  }

  /**
   * Check if entry is early departure
   */
  private isEarlyDeparture(entry: TimeEntry): boolean {
    if (!entry.clockOut) return false;
    const clockOutHour = entry.clockOut.getHours();
    return clockOutHour < 17; // Before 5 PM is early departure
  }

  /**
   * Validate time entry
   */
  private validateTimeEntry(entry: TimeEntry): TimeEntryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!entry.userId) {
      errors.push('User ID is required');
    }

    if (!entry.clockIn) {
      errors.push('Clock in time is required');
    }

    if (!entry.status) {
      errors.push('Status is required');
    }

    // Date validations
    if (entry.clockIn) {
      const futureLimit = new Date();
      futureLimit.setMinutes(futureLimit.getMinutes() + this.MAX_CLOCK_IN_FUTURE_MINUTES);

      if (entry.clockIn > futureLimit) {
        errors.push('Clock in time cannot be more than 5 minutes in the future');
      }

      if (entry.clockOut) {
        if (entry.clockOut <= entry.clockIn) {
          errors.push('Clock out time must be after clock in time');
        }

        const duration = manilaTime.calculateTotalHours(entry.clockIn, entry.clockOut);
        if (duration > this.MAX_DURATION_HOURS) {
          errors.push(`Duration cannot exceed ${this.MAX_DURATION_HOURS} hours`);
        }
      }
    }

    // Break validations
    if (entry.breaks && entry.breaks.length > 0) {
      entry.breaks.forEach((breakPeriod, index) => {
        const validation = breakManager.validateBreak(breakPeriod, entry.breaks);
        if (!validation.isValid) {
          errors.push(`Break ${index + 1}: ${validation.errors.join(', ')}`);
        }
        warnings.push(`Break ${index + 1}: ${validation.warnings.join(', ')}`);
      });
    }

    // Status validations
    if (entry.clockOut && entry.status === TimeEntryStatus.ACTIVE) {
      warnings.push('Time entry has clock out time but status is still ACTIVE');
    }

    if (!entry.clockOut && entry.status === TimeEntryStatus.COMPLETED) {
      warnings.push('Time entry is COMPLETED but has no clock out time');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ==================== STATISTICS AND ANALYTICS ====================

  /**
   * Get time entry statistics
   */
  async getStatistics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeEntryStatistics> {
    const entries = await this.findByUserId(userId, { startDate, endDate });
    const completedEntries = entries.filter(e => e.status === TimeEntryStatus.COMPLETED);

    const totalTimeEntries = entries.length;
    const totalHours = completedEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
    const regularHours = completedEntries.reduce((sum, e) => sum + (e.regularHours || 0), 0);
    const overtimeHours = completedEntries.reduce((sum, e) => sum + (e.overtimeHours || 0), 0);

    const averageHoursPerEntry = totalTimeEntries > 0 ? totalHours / totalTimeEntries : 0;

    const sortedByDuration = [...completedEntries].sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0));
    const longestEntry = sortedByDuration[0] || null;
    const shortestEntry = sortedByDuration[sortedByDuration.length - 1] || null;

    const entriesByStatus = entries.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<TimeEntryStatus, number>);

    // Daily progress
    const dailyProgress = this.calculateDailyProgress(completedEntries);

    return {
      totalTimeEntries,
      totalHours,
      regularHours,
      overtimeHours,
      averageHoursPerEntry,
      longestEntry,
      shortestEntry,
      entriesByStatus,
      dailyProgress
    };
  }

  /**
   * Calculate daily progress
   */
  private calculateDailyProgress(entries: TimeEntry[]): DailyProgress[] {
    const dailyMap = new Map<string, { totalHours: number; regularHours: number; overtimeHours: number }>();

    entries.forEach(entry => {
      if (!entry.totalHours) return;

      const dateKey = manilaTime.format(entry.clockIn, 'YYYY-MM-DD');
      const existing = dailyMap.get(dateKey) || { totalHours: 0, regularHours: 0, overtimeHours: 0 };

      dailyMap.set(dateKey, {
        totalHours: existing.totalHours + entry.totalHours,
        regularHours: existing.regularHours + (entry.regularHours || 0),
        overtimeHours: existing.overtimeHours + (entry.overtimeHours || 0)
      });
    });

    return Array.from(dailyMap.entries()).map(([date, hours]) => {
      const dateObj = new Date(date);
      const completionPercentage = Math.min(100, (hours.totalHours / this.WORK_DAY_HOURS) * 100);

      let status: DailyProgress['status'] = 'not_started';
      if (hours.totalHours > 0) {
        if (hours.totalHours < this.WORK_DAY_HOURS) {
          status = 'in_progress';
        } else {
          status = 'completed';
        }
      }

      // Calculate projected finish time for incomplete days
      let projectedFinishTime: Date | undefined;
      if (status === 'in_progress' && hours.totalHours > 0) {
        const timeEntry = entries.find(e => manilaTime.format(e.clockIn, 'YYYY-MM-DD') === date);
        if (timeEntry) {
          projectedFinishTime = manilaTime.getProjectedCompletionTime(
            timeEntry.clockIn,
            this.WORK_DAY_HOURS
          );
        }
      }

      return {
        date: dateObj,
        totalHours: hours.totalHours,
        regularHours: hours.regularHours,
        overtimeHours: hours.overtimeHours,
        goalHours: this.WORK_DAY_HOURS,
        completionPercentage,
        projectedFinishTime,
        status
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get today's progress for a user
   */
  async getTodayProgress(userId: string): Promise<DailyProgress | null> {
    const today = manilaTime.now();
    const todayStart = manilaTime.startOfDay(today);
    const todayEnd = manilaTime.endOfDay(today);

    const entries = await this.findByUserId(userId, {
      startDate: todayStart,
      endDate: todayEnd
    });

    if (entries.length === 0) {
      // Check if there's an active entry
      const activeEntry = await this.findActiveEntry(userId);
      if (!activeEntry) {
        return null;
      }
      entries.push(activeEntry);
    }

    const dailyProgress = this.calculateDailyProgress(entries);
    return dailyProgress.length > 0 ? dailyProgress[0] : null;
  }

  /**
   * Get projected completion time for current day
   */
  async getProjectedCompletionTime(userId: string): Promise<Date | null> {
    const activeEntry = await this.findActiveEntry(userId);
    if (!activeEntry) return null;

    // Calculate current work time excluding breaks
    const currentHours = activeEntry.totalHours || 0;
    const remainingHours = Math.max(0, this.WORK_DAY_HOURS - currentHours);

    if (remainingHours === 0) return null;

    const projectedTime = new Date(manilaTime.now());
    projectedTime.setHours(projectedTime.getHours() + Math.ceil(remainingHours));

    return projectedTime;
  }
}

// Export singleton instance
export const timeEntryManager = new TimeEntryManager();

