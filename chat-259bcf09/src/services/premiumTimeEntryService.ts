/**
 * Premium Time Entry Service
 * Handles time entry operations with localStorage integration and real-time updates
 */

import { TimeEntry, TimeEntryStatus, getCurrentTimeString, getCurrentDateString, createEmptyTimeEntry } from '@/src/types/timeEntry';
import { UserProfile } from '@/src/types/user';
import { TimeCalculator } from '@/src/utils/timeCalculations';

export class PremiumTimeEntryService {
  private static readonly STORAGE_KEY = 'vc-time-tracker-entries';
  private static readonly SUBSCRIBERS_KEY = 'vc-time-tracker-subscribers';

  /**
   * Get all time entries from localStorage
   */
  static getAllTimeEntries(): Record<string, TimeEntry> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load time entries:', error);
      return {};
    }
  }

  /**
   * Save time entries to localStorage
   */
  static saveTimeEntries(entries: Record<string, TimeEntry>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to save time entries:', error);
    }
  }

  /**
   * Get time entry for specific user and date
   */
  static getTimeEntry(userId: string, date?: string): TimeEntry | undefined {
    const entries = this.getAllTimeEntries();
    const entryDate = date || getCurrentDateString();
    const entryId = `time-${userId}-${entryDate}`;
    return entries[entryId];
  }

  /**
   * Save or update time entry
   */
  static saveTimeEntry(entry: TimeEntry): void {
    const entries = this.getAllTimeEntries();
    entries[entry.id] = entry;
    this.saveTimeEntries(entries);
  }

  /**
   * Clock in user
   */
  static clockIn(userId: string): TimeEntry {
    const today = getCurrentDateString();
    const currentTime = getCurrentTimeString();
    const entryId = `time-${userId}-${today}`;

    let entry = this.getTimeEntry(userId, today);

    if (!entry) {
      entry = createEmptyTimeEntry(userId, today);
      entry.id = entryId;
    }

    entry.clockIn = currentTime;
    entry.clockOut = undefined;
    entry.status = TimeEntryStatus.CLOCKED_IN;
    entry.lastModified = new Date().toISOString();
    entry.modifiedBy = userId;

    this.saveTimeEntry(entry);
    return entry;
  }

  /**
   * Clock out user
   */
  static clockOut(userId: string): TimeEntry | null {
    const today = getCurrentDateString();
    const currentTime = getCurrentTimeString();
    const entry = this.getTimeEntry(userId, today);

    if (!entry || !entry.clockIn) {
      throw new Error('No active clock-in found');
    }

    entry.clockOut = currentTime;
    entry.status = TimeEntryStatus.CLOCKED_OUT;
    entry.lastModified = new Date().toISOString();
    entry.modifiedBy = userId;

    // Calculate total hours
    const summary = TimeCalculator.getTimeSummary(entry);
    entry.totalHours = summary.totalHours;

    this.saveTimeEntry(entry);
    return entry;
  }

  /**
   * Start lunch break
   */
  static startLunch(userId: string): TimeEntry | null {
    const today = getCurrentDateString();
    const currentTime = getCurrentTimeString();
    const entry = this.getTimeEntry(userId, today);

    if (!entry || !entry.clockIn) {
      throw new Error('No active clock-in found');
    }

    if (entry.status !== TimeEntryStatus.CLOCKED_IN) {
      throw new Error('User must be clocked in to start lunch');
    }

    entry.lunchBreak = {
      start: currentTime
    };
    entry.status = TimeEntryStatus.ON_LUNCH;
    entry.lastModified = new Date().toISOString();
    entry.modifiedBy = userId;

    this.saveTimeEntry(entry);
    return entry;
  }

  /**
   * End lunch break
   */
  static endLunch(userId: string): TimeEntry | null {
    const today = getCurrentDateString();
    const currentTime = getCurrentTimeString();
    const entry = this.getTimeEntry(userId, today);

    if (!entry || !entry.lunchBreak?.start) {
      throw new Error('No active lunch break found');
    }

    const startTime = entry.lunchBreak.start;
    const duration = TimeCalculator.getTimeDifference(startTime, currentTime);

    entry.lunchBreak = {
      start: startTime,
      end: currentTime,
      duration
    };
    entry.status = TimeEntryStatus.CLOCKED_IN;
    entry.lastModified = new Date().toISOString();
    entry.modifiedBy = userId;

    this.saveTimeEntry(entry);
    return entry;
  }

  /**
   * Start short break
   */
  static startBreak(userId: string, breakType: string = 'short_break'): TimeEntry | null {
    const today = getCurrentDateString();
    const currentTime = getCurrentTimeString();
    const entry = this.getTimeEntry(userId, today);

    if (!entry || !entry.clockIn) {
      throw new Error('No active clock-in found');
    }

    if (entry.status !== TimeEntryStatus.CLOCKED_IN) {
      throw new Error('User must be clocked in to start a break');
    }

    const breakId = `break-${userId}-${Date.now()}`;

    entry.shortBreaks.push({
      id: breakId,
      start: currentTime,
      end: '',
      duration: 0,
      type: breakType as any
    });

    entry.status = TimeEntryStatus.ON_BREAK;
    entry.lastModified = new Date().toISOString();
    entry.modifiedBy = userId;

    this.saveTimeEntry(entry);
    return entry;
  }

  /**
   * End short break
   */
  static endBreak(userId: string): TimeEntry | null {
    const today = getCurrentDateString();
    const currentTime = getCurrentTimeString();
    const entry = this.getTimeEntry(userId, today);

    if (!entry) {
      throw new Error('No time entry found');
    }

    const activeBreak = entry.shortBreaks.find(b => !b.end);

    if (!activeBreak) {
      throw new Error('No active break found');
    }

    const duration = TimeCalculator.getTimeDifference(activeBreak.start, currentTime);

    entry.shortBreaks = entry.shortBreaks.map(b =>
      b.id === activeBreak.id
        ? { ...b, end: currentTime, duration }
        : b
    );

    entry.status = TimeEntryStatus.CLOCKED_IN;
    entry.lastModified = new Date().toISOString();
    entry.modifiedBy = userId;

    this.saveTimeEntry(entry);
    return entry;
  }

  /**
   * Get user's time entries for a date range
   */
  static getUserTimeEntries(userId: string, startDate: string, endDate: string): TimeEntry[] {
    const entries = this.getAllTimeEntries();
    const userEntries: TimeEntry[] = [];

    Object.values(entries).forEach(entry => {
      if (entry.userId === userId && entry.date >= startDate && entry.date <= endDate) {
        userEntries.push(entry);
      }
    });

    return userEntries.sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Get all time entries for a date range
   */
  static getAllTimeEntriesForRange(startDate: string, endDate: string): TimeEntry[] {
    const entries = this.getAllTimeEntries();
    const rangeEntries: TimeEntry[] = [];

    Object.values(entries).forEach(entry => {
      if (entry.date >= startDate && entry.date <= endDate) {
        rangeEntries.push(entry);
      }
    });

    return rangeEntries.sort((a, b) => {
      // Sort by date and then by user
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.userId.localeCompare(b.userId);
    });
  }

  /**
   * Calculate user statistics for a period
   */
  static getUserStats(userId: string, startDate: string, endDate: string): {
    totalDays: number;
    workedDays: number;
    totalHours: number;
    averageHours: number;
    overtimeHours: number;
    totalBreakHours: number;
  } {
    const entries = this.getUserTimeEntries(userId, startDate, endDate);
    return TimeCalculator.calculateWeekSummary(entries);
  }

  /**
   * Get current status of a user
   */
  static getUserCurrentStatus(userId: string): TimeEntryStatus {
    const today = getCurrentDateString();
    const entry = this.getTimeEntry(userId, today);

    if (!entry) return TimeEntryStatus.NOT_STARTED;
    return entry.status;
  }

  /**
   * Check if user is currently active (clocked in, on lunch, or on break)
   */
  static isUserActive(userId: string): boolean {
    const status = this.getUserCurrentStatus(userId);
    return [
      TimeEntryStatus.CLOCKED_IN,
      TimeEntryStatus.ON_LUNCH,
      TimeEntryStatus.ON_BREAK
    ].includes(status);
  }

  /**
   * Get all currently active users
   */
  static getActiveUsers(userIdList: string[]): string[] {
    return userIdList.filter(userId => this.isUserActive(userId));
  }

  /**
   * Update all live entries (call this periodically for real-time updates)
   */
  static updateLiveEntries(): void {
    const entries = this.getAllTimeEntries();
    const currentTime = getCurrentTimeString();
    const today = getCurrentDateString();
    let hasUpdates = false;

    Object.keys(entries).forEach(entryId => {
      const entry = entries[entryId];

      // Only update today's entries
      if (entry.date !== today) return;

      // Only update active entries
      if ([
        TimeEntryStatus.CLOCKED_IN,
        TimeEntryStatus.ON_LUNCH,
        TimeEntryStatus.ON_BREAK
      ].includes(entry.status)) {
        entry.lastModified = new Date().toISOString();
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      this.saveTimeEntries(entries);
    }
  }

  /**
   * Subscribe to time entry changes (for real-time updates)
   */
  static subscribe(callback: () => void): () => void {
    // Store subscriber
    const subscribers = this.getSubscribers();
    const id = Date.now().toString();
    subscribers[id] = callback;
    localStorage.setItem(this.SUBSCRIBERS_KEY, JSON.stringify(subscribers));

    // Return unsubscribe function
    return () => {
      const currentSubscribers = this.getSubscribers();
      delete currentSubscribers[id];
      localStorage.setItem(this.SUBSCRIBERS_KEY, JSON.stringify(currentSubscribers));
    };
  }

  /**
   * Get all subscribers
   */
  private static getSubscribers(): Record<string, () => void> {
    try {
      const data = localStorage.getItem(this.SUBSCRIBERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Notify all subscribers of changes
   */
  private static notifySubscribers(): void {
    const subscribers = this.getSubscribers();
    Object.values(subscribers).forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  /**
   * Clear all time entries (for testing/reset)
   */
  static clearAllEntries(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifySubscribers();
  }

  /**
   * Export time entries data
   */
  static exportData(): string {
    const entries = this.getAllTimeEntries();
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Import time entries data
   */
  static importData(data: string): void {
    try {
      const entries = JSON.parse(data);
      this.saveTimeEntries(entries);
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }
}