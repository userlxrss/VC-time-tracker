/**
 * localStorage utilities for data persistence
 */

import { User, TimeEntry, Break, UserPreferences } from '../types';

const STORAGE_KEYS = {
  USER: 'vct_user',
  PREFERENCES: 'vct_preferences',
  TIME_ENTRIES: 'vct_time_entries',
  BREAKS: 'vct_breaks',
  CURRENT_TIME_ENTRY: 'vct_current_time_entry',
  ACTIVE_BREAK: 'vct_active_break',
  NOTIFICATIONS: 'vct_notifications',
  TIMER_STATE: 'vct_timer_state',
} as const;

/**
 * Generic storage operations
 */
class StorageService {
  private isClient = typeof window !== 'undefined';

  private getStorageKey(key: string): string {
    return key;
  }

  /**
   * Save data to localStorage
   */
  set<T>(key: string, data: T): boolean {
    try {
      if (!this.isClient) return false;

      const serializedData = JSON.stringify(data, (key, value) => {
        // Convert Date objects to ISO strings for JSON serialization
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });

      localStorage.setItem(this.getStorageKey(key), serializedData);
      return true;
    } catch (error) {
      console.error(`Error saving data to localStorage for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.isClient) return defaultValue || null;

      const item = localStorage.getItem(this.getStorageKey(key));
      if (!item) return defaultValue || null;

      return JSON.parse(item, (key, value) => {
        // Convert ISO strings back to Date objects
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });
    } catch (error) {
      console.error(`Error reading data from localStorage for key ${key}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): boolean {
    try {
      if (!this.isClient) return false;

      localStorage.removeItem(this.getStorageKey(key));
      return true;
    } catch (error) {
      console.error(`Error removing data from localStorage for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all VC Time Tracker data
   */
  clear(): boolean {
    try {
      if (!this.isClient) return false;

      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(this.getStorageKey(key));
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    if (!this.isClient) return false;

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Specific data storage operations
 */
export class DataStorage {
  private storage = new StorageService();

  // User operations
  saveUser(user: User): boolean {
    return this.storage.set(STORAGE_KEYS.USER, user);
  }

  getUser(): User | null {
    return this.storage.get<User>(STORAGE_KEYS.USER);
  }

  removeUser(): boolean {
    return this.storage.remove(STORAGE_KEYS.USER);
  }

  // Preferences operations
  savePreferences(preferences: UserPreferences): boolean {
    return this.storage.set(STORAGE_KEYS.PREFERENCES, preferences);
  }

  getPreferences(): UserPreferences | null {
    return this.storage.get<UserPreferences>(STORAGE_KEYS.PREFERENCES);
  }

  // Time entries operations
  saveTimeEntries(timeEntries: TimeEntry[]): boolean {
    return this.storage.set(STORAGE_KEYS.TIME_ENTRIES, timeEntries);
  }

  getTimeEntries(): TimeEntry[] {
    return this.storage.get<TimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []) || [];
  }

  addTimeEntry(timeEntry: TimeEntry): boolean {
    const timeEntries = this.getTimeEntries();
    timeEntries.push(timeEntry);
    return this.saveTimeEntries(timeEntries);
  }

  updateTimeEntry(timeEntryId: string, updates: Partial<TimeEntry>): boolean {
    const timeEntries = this.getTimeEntries();
    const index = timeEntries.findIndex(entry => entry.id === timeEntryId);

    if (index === -1) return false;

    timeEntries[index] = {
      ...timeEntries[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.saveTimeEntries(timeEntries);
  }

  deleteTimeEntry(timeEntryId: string): boolean {
    const timeEntries = this.getTimeEntries().filter(entry => entry.id !== timeEntryId);
    return this.saveTimeEntries(timeEntries);
  }

  // Current time entry operations
  saveCurrentTimeEntry(timeEntry: TimeEntry | null): boolean {
    return this.storage.set(STORAGE_KEYS.CURRENT_TIME_ENTRY, timeEntry);
  }

  getCurrentTimeEntry(): TimeEntry | null {
    return this.storage.get<TimeEntry>(STORAGE_KEYS.CURRENT_TIME_ENTRY);
  }

  clearCurrentTimeEntry(): boolean {
    return this.storage.remove(STORAGE_KEYS.CURRENT_TIME_ENTRY);
  }

  // Breaks operations
  saveBreaks(breaks: Break[]): boolean {
    return this.storage.set(STORAGE_KEYS.BREAKS, breaks);
  }

  getBreaks(): Break[] {
    return this.storage.get<Break[]>(STORAGE_KEYS.BREAKS, []) || [];
  }

  addBreak(break: Break): boolean {
    const breaks = this.getBreaks();
    breaks.push(break);
    return this.saveBreaks(breaks);
  }

  updateBreak(breakId: string, updates: Partial<Break>): boolean {
    const breaks = this.getBreaks();
    const index = breaks.findIndex(b => b.id === breakId);

    if (index === -1) return false;

    breaks[index] = {
      ...breaks[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.saveBreaks(breaks);
  }

  deleteBreak(breakId: string): boolean {
    const breaks = this.getBreaks().filter(b => b.id !== breakId);
    return this.saveBreaks(breaks);
  }

  // Active break operations
  saveActiveBreak(break: Break | null): boolean {
    return this.storage.set(STORAGE_KEYS.ACTIVE_BREAK, break);
  }

  getActiveBreak(): Break | null {
    return this.storage.get<Break>(STORAGE_KEYS.ACTIVE_BREAK);
  }

  clearActiveBreak(): boolean {
    return this.storage.remove(STORAGE_KEYS.ACTIVE_BREAK);
  }

  // Export data for backup
  exportData(): {
    user?: User;
    preferences?: UserPreferences;
    timeEntries: TimeEntry[];
    breaks: Break[];
  } {
    return {
      user: this.getUser() || undefined,
      preferences: this.getPreferences() || undefined,
      timeEntries: this.getTimeEntries(),
      breaks: this.getBreaks(),
    };
  }

  // Import data from backup
  importData(data: {
    user?: User;
    preferences?: UserPreferences;
    timeEntries?: TimeEntry[];
    breaks?: Break[];
  }): boolean {
    try {
      let success = true;

      if (data.user) {
        success = this.saveUser(data.user) && success;
      }

      if (data.preferences) {
        success = this.savePreferences(data.preferences) && success;
      }

      if (data.timeEntries) {
        success = this.saveTimeEntries(data.timeEntries) && success;
      }

      if (data.breaks) {
        success = this.saveBreaks(data.breaks) && success;
      }

      return success;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dataStorage = new DataStorage();