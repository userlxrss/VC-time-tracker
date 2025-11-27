import { TimeTrackingEntry, ShortBreak, TimeStats, WeeklyReport, MonthlyReport } from './types';

export { TimeTrackingEntry, ShortBreak, TimeStats, WeeklyReport, MonthlyReport };

// Storage key for localStorage
const STORAGE_KEY = 'vc-time-entries';

// Helper functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getISOTimeString = (): string => {
  return new Date().toISOString();
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Return in hours
};

export const calculateBreakDuration = (breaks: ShortBreak[]): number => {
  return breaks.reduce((total, breakEntry) => {
    if (breakEntry.start && breakEntry.end) {
      return total + calculateDuration(breakEntry.start, breakEntry.end);
    }
    return total;
  }, 0);
};

// Core time tracking functions
export class TimeTracker {
  private static instance: TimeTracker;
  private entries: Map<string, TimeTrackingEntry[]> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): TimeTracker {
    if (!TimeTracker.instance) {
      TimeTracker.instance = new TimeTracker();
    }
    return TimeTracker.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.entries = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load time entries from storage:', error);
      this.entries = new Map();
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.entries.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save time entries to storage:', error);
    }
  }

  private getUserEntries(userId: number): TimeTrackingEntry[] {
    const key = userId.toString();
    if (!this.entries.has(key)) {
      this.entries.set(key, []);
    }
    return this.entries.get(key)!;
  }

  private saveUserEntry(userId: number, entries: TimeTrackingEntry[]): void {
    const key = userId.toString();
    this.entries.set(key, entries);
    this.saveToStorage();
  }

  public clockIn(userId: number): TimeTrackingEntry {
    const today = getTodayDateString();
    const existingEntry = this.getTodayTimeEntry(userId);

    if (existingEntry && existingEntry.status !== 'clocked_out') {
      throw new Error('User is already clocked in or on break');
    }

    const newEntry: TimeTrackingEntry = {
      id: generateId(),
      userId,
      date: today,
      clockIn: getISOTimeString(),
      clockOut: null,
      lunchBreakStart: null,
      lunchBreakEnd: null,
      shortBreaks: [],
      totalHours: null,
      status: 'clocked_in',
      createdAt: getISOTimeString(),
      updatedAt: getISOTimeString(),
    };

    const entries = this.getUserEntries(userId);
    entries.push(newEntry);
    this.saveUserEntry(userId, entries);

    return newEntry;
  }

  public clockOut(userId: number): TimeTrackingEntry {
    const todayEntry = this.getTodayTimeEntry(userId);

    if (!todayEntry) {
      throw new Error('No time entry found for today. Please clock in first.');
    }

    if (todayEntry.status === 'clocked_out') {
      throw new Error('User is already clocked out');
    }

    if (todayEntry.status === 'on_break') {
      // End any ongoing breaks before clocking out
      if (todayEntry.lunchBreakStart && !todayEntry.lunchBreakEnd) {
        todayEntry.lunchBreakEnd = getISOTimeString();
      }

      todayEntry.shortBreaks = todayEntry.shortBreaks.map(breakEntry => {
        if (breakEntry.start && !breakEntry.end) {
          return {
            ...breakEntry,
            end: getISOTimeString(),
            duration: calculateDuration(breakEntry.start, getISOTimeString()) * 60, // Convert to minutes
          };
        }
        return breakEntry;
      });
    }

    todayEntry.clockOut = getISOTimeString();
    todayEntry.status = 'clocked_out';
    todayEntry.totalHours = this.calculateHours(todayEntry);
    todayEntry.updatedAt = getISOTimeString();

    const entries = this.getUserEntries(userId);
    const index = entries.findIndex(e => e.id === todayEntry.id);
    if (index !== -1) {
      entries[index] = todayEntry;
      this.saveUserEntry(userId, entries);
    }

    return todayEntry;
  }

  public startLunchBreak(userId: number): TimeTrackingEntry {
    const todayEntry = this.getTodayTimeEntry(userId);

    if (!todayEntry) {
      throw new Error('No time entry found for today. Please clock in first.');
    }

    if (todayEntry.status !== 'clocked_in') {
      throw new Error('You must be clocked in to start a lunch break');
    }

    if (todayEntry.lunchBreakStart && !todayEntry.lunchBreakEnd) {
      throw new Error('Lunch break already in progress');
    }

    todayEntry.lunchBreakStart = getISOTimeString();
    todayEntry.status = 'on_break';
    todayEntry.updatedAt = getISOTimeString();

    const entries = this.getUserEntries(userId);
    const index = entries.findIndex(e => e.id === todayEntry.id);
    if (index !== -1) {
      entries[index] = todayEntry;
      this.saveUserEntry(userId, entries);
    }

    return todayEntry;
  }

  public endLunchBreak(userId: number): TimeTrackingEntry {
    const todayEntry = this.getTodayTimeEntry(userId);

    if (!todayEntry) {
      throw new Error('No time entry found for today');
    }

    if (!todayEntry.lunchBreakStart) {
      throw new Error('No lunch break in progress');
    }

    if (todayEntry.lunchBreakEnd) {
      throw new Error('Lunch break already ended');
    }

    todayEntry.lunchBreakEnd = getISOTimeString();
    todayEntry.status = 'clocked_in';
    todayEntry.updatedAt = getISOTimeString();

    const entries = this.getUserEntries(userId);
    const index = entries.findIndex(e => e.id === todayEntry.id);
    if (index !== -1) {
      entries[index] = todayEntry;
      this.saveUserEntry(userId, entries);
    }

    return todayEntry;
  }

  public startShortBreak(userId: number): TimeTrackingEntry {
    const todayEntry = this.getTodayTimeEntry(userId);

    if (!todayEntry) {
      throw new Error('No time entry found for today. Please clock in first.');
    }

    if (todayEntry.status !== 'clocked_in') {
      throw new Error('You must be clocked in to start a short break');
    }

    const activeShortBreak = todayEntry.shortBreaks.find(b => b.start && !b.end);
    if (activeShortBreak) {
      throw new Error('Short break already in progress');
    }

    const newBreak: ShortBreak = {
      id: generateId(),
      start: getISOTimeString(),
      end: null,
      duration: null,
    };

    todayEntry.shortBreaks.push(newBreak);
    todayEntry.status = 'on_break';
    todayEntry.updatedAt = getISOTimeString();

    const entries = this.getUserEntries(userId);
    const index = entries.findIndex(e => e.id === todayEntry.id);
    if (index !== -1) {
      entries[index] = todayEntry;
      this.saveUserEntry(userId, entries);
    }

    return todayEntry;
  }

  public endShortBreak(userId: number): TimeTrackingEntry {
    const todayEntry = this.getTodayTimeEntry(userId);

    if (!todayEntry) {
      throw new Error('No time entry found for today');
    }

    const activeBreakIndex = todayEntry.shortBreaks.findIndex(b => b.start && !b.end);
    if (activeBreakIndex === -1) {
      throw new Error('No short break in progress');
    }

    const endTime = getISOTimeString();
    todayEntry.shortBreaks[activeBreakIndex] = {
      ...todayEntry.shortBreaks[activeBreakIndex],
      end: endTime,
      duration: calculateDuration(todayEntry.shortBreaks[activeBreakIndex].start, endTime) * 60,
    };

    todayEntry.status = 'clocked_in';
    todayEntry.updatedAt = getISOTimeString();

    const entries = this.getUserEntries(userId);
    const index = entries.findIndex(e => e.id === todayEntry.id);
    if (index !== -1) {
      entries[index] = todayEntry;
      this.saveUserEntry(userId, entries);
    }

    return todayEntry;
  }

  public calculateHours(entry: TimeTrackingEntry): number {
    if (!entry.clockIn) return 0;

    let endTime = entry.clockOut;
    if (!endTime) {
      // If not clocked out, use current time
      endTime = getISOTimeString();
    }

    let totalHours = calculateDuration(entry.clockIn, endTime);

    // Subtract lunch break
    if (entry.lunchBreakStart && entry.lunchBreakEnd) {
      totalHours -= calculateDuration(entry.lunchBreakStart, entry.lunchBreakEnd);
    } else if (entry.lunchBreakStart && !entry.lunchBreakEnd) {
      // Lunch break in progress, subtract current break time
      totalHours -= calculateDuration(entry.lunchBreakStart, getISOTimeString());
    }

    // Subtract short breaks
    totalHours -= calculateBreakDuration(entry.shortBreaks);

    // Round to 2 decimal places
    return Math.max(0, Math.round(totalHours * 100) / 100);
  }

  public getTodayTimeEntry(userId: number): TimeTrackingEntry | null {
    const today = getTodayDateString();
    const entries = this.getUserEntries(userId);

    // Find entry for today, most recent first
    const todayEntries = entries.filter(e => e.date === today);
    return todayEntries.length > 0 ? todayEntries[todayEntries.length - 1] : null;
  }

  public getUserTimeEntries(userId: number, startDate?: string, endDate?: string): TimeTrackingEntry[] {
    const entries = this.getUserEntries(userId);

    if (!startDate && !endDate) {
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return entries.filter(entry => {
      const entryDate = entry.date;
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getTimeStats(userId: number): TimeStats {
    const today = getTodayDateString();
    const todayEntry = this.getTodayTimeEntry(userId);
    const todayHours = todayEntry ? this.calculateHours(todayEntry) : 0;

    // Calculate week hours (current week)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = today;

    const weekEntries = this.getUserTimeEntries(userId, weekStartStr, weekEndStr);
    const weekHours = weekEntries.reduce((total, entry) => total + (entry.totalHours || this.calculateHours(entry)), 0);

    // Calculate month hours (current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEntries = this.getUserTimeEntries(userId, monthStartStr, weekEndStr);
    const monthHours = monthEntries.reduce((total, entry) => total + (entry.totalHours || this.calculateHours(entry)), 0);

    return {
      todayHours: Math.round(todayHours * 100) / 100,
      weekHours: Math.round(weekHours * 100) / 100,
      monthHours: Math.round(monthHours * 100) / 100,
      currentStatus: todayEntry?.status || 'not_started',
      isClockedIn: todayEntry?.status === 'clocked_in',
      currentSessionStart: todayEntry?.clockIn || null,
    };
  }

  public getWeeklyReport(userId: number, weekStart: string): WeeklyReport {
    const weekStartObj = new Date(weekStart);
    const weekEndObj = new Date(weekStartObj);
    weekEndObj.setDate(weekStartObj.getDate() + 6);

    const weekEndStr = weekEndObj.toISOString().split('T')[0];
    const entries = this.getUserTimeEntries(userId, weekStart, weekEndStr);

    const totalHours = entries.reduce((total, entry) => total + (entry.totalHours || this.calculateHours(entry)), 0);

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartObj);
      currentDate.setDate(weekStartObj.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayEntry = entries.find(e => e.date === dateStr);
      dailyBreakdown.push({
        date: dateStr,
        hours: dayEntry ? (dayEntry.totalHours || this.calculateHours(dayEntry)) : 0,
        status: dayEntry?.status || 'not_started',
      });
    }

    return {
      weekStart,
      weekEnd: weekEndStr,
      entries,
      totalHours: Math.round(totalHours * 100) / 100,
      dailyBreakdown,
    };
  }

  public getMonthlyReport(userId: number, month: string): MonthlyReport {
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = new Date(year, monthNum, 0);

    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    const entries = this.getUserTimeEntries(userId, monthStartStr, monthEndStr);
    const totalHours = entries.reduce((total, entry) => total + (entry.totalHours || this.calculateHours(entry)), 0);

    // Generate weekly breakdown
    const weeklyBreakdown: WeeklyReport[] = [];
    const currentWeek = new Date(monthStart);

    while (currentWeek <= monthEnd) {
      const weekStartStr = currentWeek.toISOString().split('T')[0];
      const weeklyReport = this.getWeeklyReport(userId, weekStartStr);

      // Only include weeks that have entries in this month
      if (weeklyReport.entries.length > 0) {
        weeklyBreakdown.push(weeklyReport);
      }

      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    const daysWorked = entries.filter(e => e.totalHours && e.totalHours > 0).length;
    const averageDailyHours = daysWorked > 0 ? totalHours / daysWorked : 0;

    return {
      month,
      entries,
      totalHours: Math.round(totalHours * 100) / 100,
      weeklyBreakdown,
      averageDailyHours: Math.round(averageDailyHours * 100) / 100,
      daysWorked,
    };
  }

  public getAllUsersTimeStats(): Map<number, TimeStats> {
    const allStats = new Map<number, TimeStats>();

    // Get all user IDs from stored entries
    for (const [userIdStr] of this.entries) {
      const userId = parseInt(userIdStr);
      const stats = this.getTimeStats(userId);
      allStats.set(userId, stats);
    }

    return allStats;
  }

  // Cleanup old entries (optional - for storage management)
  public cleanupOldEntries(daysToKeep: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    for (const [userIdStr, entries] of this.entries) {
      const filteredEntries = entries.filter(entry => entry.date >= cutoffStr);
      this.entries.set(userIdStr, filteredEntries);
    }

    this.saveToStorage();
  }
}

// Export singleton instance
export const timeTracker = TimeTracker.getInstance();

// Export individual functions for convenience
export const clockIn = (userId: number) => timeTracker.clockIn(userId);
export const clockOut = (userId: number) => timeTracker.clockOut(userId);
export const startLunchBreak = (userId: number) => timeTracker.startLunchBreak(userId);
export const endLunchBreak = (userId: number) => timeTracker.endLunchBreak(userId);
export const startShortBreak = (userId: number) => timeTracker.startShortBreak(userId);
export const endShortBreak = (userId: number) => timeTracker.endShortBreak(userId);
export const calculateHours = (entry: TimeTrackingEntry) => timeTracker.calculateHours(entry);
export const getTodayTimeEntry = (userId: number) => timeTracker.getTodayTimeEntry(userId);
export const getUserTimeEntries = (userId: number, startDate?: string, endDate?: string) =>
  timeTracker.getUserTimeEntries(userId, startDate, endDate);
export const getTimeStats = (userId: number) => timeTracker.getTimeStats(userId);
export const getWeeklyReport = (userId: number, weekStart: string) => timeTracker.getWeeklyReport(userId, weekStart);
export const getMonthlyReport = (userId: number, month: string) => timeTracker.getMonthlyReport(userId, month);
export const getAllUsersTimeStats = () => timeTracker.getAllUsersTimeStats();