/**
 * localStorage API for VC Time Tracker
 * Handles all data persistence operations
 */

import {
  TimeEntry,
  UserProfile,
  UserPreferences,
  TimeEntryFilters,
  DEFAULT_CURRENT_USER_ID,
  HARDCODED_USERS
} from '../types';

export const STORAGE_KEYS = {
  TIME_ENTRIES: 'vctime_time_entries',
  USER_PREFERENCES: 'vctime_user_preferences',
  CURRENT_USER: 'vctime_current_user',
  APP_SETTINGS: 'vctime_app_settings'
} as const;

// LocalStorage helper functions
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage (${key}):`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item to localStorage (${key}):`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage (${key}):`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Time Entry Operations
export class TimeEntryStorage {
  private static getTimeEntries(): TimeEntry[] {
    return storage.get<TimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES) || [];
  }

  private static saveTimeEntries(entries: TimeEntry[]): boolean {
    return storage.set(STORAGE_KEYS.TIME_ENTRIES, entries);
  }

  static saveTimeEntry(entry: TimeEntry): boolean {
    const entries = this.getTimeEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    return this.saveTimeEntries(entries);
  }

  static getTimeEntry(entryId: string): TimeEntry | null {
    const entries = this.getTimeEntries();
    return entries.find(e => e.id === entryId) || null;
  }

  static getTodayTimeEntry(userId: string): TimeEntry | null {
    const today = new Date().toISOString().split('T')[0];
    const entryId = `time-${userId}-${today}`;
    return this.getTimeEntry(entryId);
  }

  static getTimeEntryByUserAndDate(userId: string, date: string): TimeEntry | null {
    const entryId = `time-${userId}-${date}`;
    return this.getTimeEntry(entryId);
  }

  static getUserTimeEntries(userId: string, limit?: number): TimeEntry[] {
    const entries = this.getTimeEntries()
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

    return limit ? entries.slice(0, limit) : entries;
  }

  static getWeekTimeEntries(userId: string, weekStart?: string): TimeEntry[] {
    const startDate = weekStart || this.getWeekStart(new Date());
    const endDate = this.getDateByOffset(startDate, 6); // Add 6 days for full week

    const entries = this.getTimeEntries().filter(entry =>
      entry.userId === userId &&
      entry.date >= startDate &&
      entry.date <= endDate
    );

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }

  static getMonthTimeEntries(userId: string, year?: number, month?: number): TimeEntry[] {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1; // JS months are 0-based

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${new Date(targetYear, targetMonth, 0).getDate()}`;

    const entries = this.getTimeEntries().filter(entry =>
      entry.userId === userId &&
      entry.date >= startDate &&
      entry.date <= endDate
    );

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }

  static getFilteredTimeEntries(filters: TimeEntryFilters): TimeEntry[] {
    const entries = this.getTimeEntries();

    return entries.filter(entry => {
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.startDate && entry.date < filters.startDate) return false;
      if (filters.endDate && entry.date > filters.endDate) return false;
      if (filters.status && entry.status !== filters.status) return false;
      if (filters.isApproved !== undefined && entry.isApproved !== filters.isApproved) return false;

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }

  static deleteTimeEntry(entryId: string): boolean {
    const entries = this.getTimeEntries();
    const filteredEntries = entries.filter(e => e.id !== entryId);
    return this.saveTimeEntries(filteredEntries);
  }

  static getAllTimeEntries(): TimeEntry[] {
    return this.getTimeEntries().sort((a, b) => b.date.localeCompare(a.date));
  }

  // Date utility functions
  private static getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  private static getDateByOffset(dateString: string, offsetDays: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
  }
}

// User Preferences Operations
export class UserPreferencesStorage {
  static saveUserPreferences(preferences: UserPreferences): boolean {
    const allPreferences = storage.get<UserPreferences[]>(STORAGE_KEYS.USER_PREFERENCES) || [];
    const existingIndex = allPreferences.findIndex(p => p.userId === preferences.userId);

    if (existingIndex >= 0) {
      allPreferences[existingIndex] = preferences;
    } else {
      allPreferences.push(preferences);
    }

    return storage.set(STORAGE_KEYS.USER_PREFERENCES, allPreferences);
  }

  static getUserPreferences(userId: string): UserPreferences | null {
    const allPreferences = storage.get<UserPreferences[]>(STORAGE_KEYS.USER_PREFERENCES) || [];
    return allPreferences.find(p => p.userId === userId) || null;
  }

  static createDefaultPreferences(userId: string): UserPreferences {
    return {
      id: `prefs-${userId}`,
      userId,
      theme: 'system',
      notifications: {
        email: true,
        browser: true,
        clockInReminder: true,
        clockOutReminder: true
      },
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      defaultBreakDuration: 15,
      autoClockOut: {
        enabled: false,
        time: '18:00'
      }
    };
  }

  static getOrCreateUserPreferences(userId: string): UserPreferences {
    let preferences = this.getUserPreferences(userId);
    if (!preferences) {
      preferences = this.createDefaultPreferences(userId);
      this.saveUserPreferences(preferences);
    }
    return preferences;
  }
}

// Current User Management
export class CurrentUserStorage {
  static getCurrentUserId(): string {
    return storage.get<string>(STORAGE_KEYS.CURRENT_USER) || DEFAULT_CURRENT_USER_ID;
  }

  static setCurrentUserId(userId: string): boolean {
    return storage.set(STORAGE_KEYS.CURRENT_USER, userId);
  }

  static getCurrentUser(): UserProfile | null {
    const userId = this.getCurrentUserId();
    return HARDCODED_USERS.find(user => user.id === userId) || null;
  }

  static resetToDefaultUser(): boolean {
    return this.setCurrentUserId(DEFAULT_CURRENT_USER_ID);
  }
}

// Data Migration and Backup
export class DataMigration {
  static exportData(): string {
    const data = {
      timeEntries: TimeEntryStorage.getAllTimeEntries(),
      userPreferences: storage.get(STORAGE_KEYS.USER_PREFERENCES) || [],
      currentUser: CurrentUserStorage.getCurrentUserId(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.timeEntries || !Array.isArray(data.timeEntries)) {
        throw new Error('Invalid data format: missing timeEntries array');
      }

      // Backup current data before import
      const backup = this.exportData();
      storage.set('vctime_backup_' + Date.now(), backup);

      // Import data
      storage.set(STORAGE_KEYS.TIME_ENTRIES, data.timeEntries);

      if (data.userPreferences && Array.isArray(data.userPreferences)) {
        storage.set(STORAGE_KEYS.USER_PREFERENCES, data.userPreferences);
      }

      if (data.currentUser) {
        CurrentUserStorage.setCurrentUserId(data.currentUser);
      }

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  static clearAllData(): boolean {
    return storage.clear();
  }

  static getStorageSize(): { used: number; available: number; details: any } {
    let totalSize = 0;
    const details: { [key: string]: number } = {};

    Object.values(STORAGE_KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      const size = value ? new Blob([value]).size : 0;
      details[key] = size;
      totalSize += size;
    });

    // Rough estimate of localStorage limit (usually 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB

    return {
      used: totalSize,
      available: estimatedLimit - totalSize,
      details
    };
  }
}

// Error handling and recovery
export class StorageError extends Error {
  constructor(message: string, public readonly operation: string, public readonly key?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const handleStorageError = (error: unknown, operation: string, key?: string): void => {
  const storageError = error instanceof Error ? error : new Error('Unknown storage error');

  console.error(`Storage Error - ${operation}${key ? ` (${key})` : ''}:`, storageError);

  // Here you could implement error reporting, fallback logic, etc.
  // For now, we'll just log the error
};

// Initialize storage with default data if needed
export const initializeStorage = (): void => {
  try {
    // Ensure current user is set
    if (!storage.get(STORAGE_KEYS.CURRENT_USER)) {
      CurrentUserStorage.setCurrentUserId(DEFAULT_CURRENT_USER_ID);
    }

    // Log storage size for monitoring
    const size = DataMigration.getStorageSize();
    if (size.used > size.available * 0.8) {
      console.warn('LocalStorage usage is high:', size);
    }
  } catch (error) {
    handleStorageError(error, 'initializeStorage');
  }
};