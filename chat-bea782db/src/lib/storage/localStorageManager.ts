/**
 * LocalStorage Manager for HR Time Tracker
 *
 * Provides cross-tab synchronization and reliable local storage operations
 * with comprehensive error handling and data validation.
 */

import {
  STORAGE_KEYS,
  SyncEvent,
  User,
  TimeEntry,
  Notification,
  LocalStorageManager as ILocalStorageManager
} from '../../database-schema';

// Validation helper functions
const validateUser = (user: any): user is User => {
  return user &&
    typeof user.id === 'string' &&
    typeof user.employeeId === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    typeof user.employmentStatus === 'string';
};

const validateTimeEntry = (entry: any): entry is TimeEntry => {
  return entry &&
    typeof entry.id === 'string' &&
    typeof entry.userId === 'string' &&
    entry.clockIn instanceof Date &&
    (entry.clockOut === undefined || entry.clockOut instanceof Date) &&
    Array.isArray(entry.breaks) &&
    typeof entry.status === 'string';
};

const validateNotification = (notification: any): notification is Notification => {
  return notification &&
    typeof notification.id === 'string' &&
    typeof notification.userId === 'string' &&
    typeof notification.title === 'string' &&
    typeof notification.message === 'string' &&
    typeof notification.type === 'string';
};

const validateSyncEvent = (event: any): event is SyncEvent => {
  return event &&
    typeof event.type === 'string' &&
    event.timestamp instanceof Date &&
    typeof event.userId === 'string' &&
    typeof event.tabId === 'string';
};

// Date serialization helpers
const serializeDate = (date: Date): string => date.toISOString();
const deserializeDate = (isoString: string): Date => new Date(isoString);

// Storage error class
class StorageError extends Error {
  constructor(message: string, public operation: string, public key?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Enhanced LocalStorage Manager with validation and cross-tab sync
 */
export class LocalStorageManager implements ILocalStorageManager {
  private readonly PREFIX = 'hr_tracker_';
  private readonly VERSION = '1.0.0';
  private tabId: string;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.tabId = this.generateTabId();
    this.setupCrossTabSync();
    this.cleanupOldData();
  }

  /**
   * Generate unique tab ID for cross-tab synchronization
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get prefixed storage key
   */
  private getKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  /**
   * Safely get item from localStorage with error handling
   */
  private getItem<T>(key: string, validator?: (data: any) => data is T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Check version compatibility
      if (parsed.version !== this.VERSION) {
        console.warn(`Version mismatch for ${key}, clearing data`);
        this.removeItem(key);
        return null;
      }

      const data = parsed.data;

      // Validate data structure
      if (validator && !validator(data)) {
        console.error(`Invalid data structure for ${key}`, data);
        this.removeItem(key);
        return null;
      }

      // Convert date strings back to Date objects
      return this.deserializeDates(data);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Safely set item in localStorage with error handling
   */
  private setItem<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify({
        version: this.VERSION,
        data: this.serializeDates(data),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded(key);
      } else {
        console.error(`Error writing ${key} to localStorage:`, error);
        throw new StorageError(`Failed to write ${key}`, 'setItem', key);
      }
    }
  }

  /**
   * Remove item from localStorage
   */
  private removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  /**
   * Handle storage quota exceeded
   */
  private handleStorageQuotaExceeded(key: string): void {
    console.warn('Storage quota exceeded, cleaning up old data...');

    // Clean up old notifications first
    const notifications = this.getNotifications();
    const recentNotifications = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100); // Keep only 100 most recent

    this.saveNotifications(recentNotifications);

    // Clean up old sync events
    const syncEvents = this.getSyncEvents();
    const recentSyncEvents = syncEvents
      .filter(event => Date.now() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000) // Keep only last 24 hours
      .slice(-50); // Keep max 50 events

    this.saveSyncEvents(recentSyncEvents);

    // Try again
    try {
      this.setItem(key, this.getItem(key));
    } catch (error) {
      console.error('Still unable to store data after cleanup:', error);
      throw new StorageError('Storage quota exceeded and cleanup failed', 'setItem', key);
    }
  }

  /**
   * Serialize Date objects in data structure
   */
  private serializeDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (obj instanceof Date) {
      return { __type: 'Date', value: obj.toISOString() };
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeDates(item));
    }

    if (typeof obj === 'object') {
      const serialized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        serialized[key] = this.serializeDates(value);
      }
      return serialized;
    }

    return obj;
  }

  /**
   * Deserialize Date objects in data structure
   */
  private deserializeDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'object' && obj.__type === 'Date') {
      return new Date(obj.value);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deserializeDates(item));
    }

    if (typeof obj === 'object') {
      const deserialized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        deserialized[key] = this.deserializeDates(value);
      }
      return deserialized;
    }

    return obj;
  }

  /**
   * Setup cross-tab synchronization using storage events
   */
  private setupCrossTabSync(): void {
    // Save tab ID
    this.setItem(STORAGE_KEYS.TAB_ID, this.tabId);

    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith(this.PREFIX)) {
        const key = event.key.replace(this.PREFIX, '');
        this.handleStorageEvent(key, event.newValue);
      }
    });

    // Set up cleanup on tab close
    window.addEventListener('beforeunload', () => {
      this.cleanupTabData();
    });
  }

  /**
   * Handle storage events from other tabs
   */
  private handleStorageEvent(key: string, newValue: string | null): void {
    if (key === STORAGE_KEYS.ACTIVE_TIME_ENTRY) {
      const listeners = this.eventListeners.get('activeEntryChanged') || [];
      listeners.forEach(listener => {
        try {
          const entry = newValue ? JSON.parse(newValue).data : null;
          listener(entry);
        } catch (error) {
          console.error('Error parsing active entry from storage event:', error);
        }
      });
    }

    if (key === STORAGE_KEYS.NOTIFICATIONS) {
      const listeners = this.eventListeners.get('notificationsChanged') || [];
      listeners.forEach(listener => {
        try {
          const notifications = newValue ? JSON.parse(newValue).data : [];
          listener(notifications);
        } catch (error) {
          console.error('Error parsing notifications from storage event:', error);
        }
      });
    }
  }

  /**
   * Cleanup data for this tab
   */
  private cleanupTabData(): void {
    try {
      // Remove notifications for this tab
      const notifications = this.getNotifications();
      const filteredNotifications = notifications.filter(
        notification => notification.tabId !== this.tabId
      );
      this.saveNotifications(filteredNotifications);

      // Clear sync events for this tab
      const syncEvents = this.getSyncEvents();
      const filteredSyncEvents = syncEvents.filter(
        event => event.tabId !== this.tabId
      );
      this.saveSyncEvents(filteredSyncEvents);
    } catch (error) {
      console.error('Error cleaning up tab data:', error);
    }
  }

  /**
   * Cleanup old data periodically
   */
  private cleanupOldData(): void {
    try {
      // Clean up old sync events (older than 7 days)
      const syncEvents = this.getSyncEvents();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const filteredSyncEvents = syncEvents.filter(
        event => new Date(event.timestamp) > weekAgo
      );

      if (filteredSyncEvents.length !== syncEvents.length) {
        this.saveSyncEvents(filteredSyncEvents);
      }

      // Clean up expired notifications
      const notifications = this.getNotifications();
      const now = new Date();

      const filteredNotifications = notifications.filter(
        notification => !notification.expiresAt || new Date(notification.expiresAt) > now
      );

      if (filteredNotifications.length !== notifications.length) {
        this.saveNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  // ==================== USER SESSION ====================

  saveUserSession(user: User): void {
    if (!validateUser(user)) {
      throw new StorageError('Invalid user data', 'saveUserSession');
    }
    this.setItem(STORAGE_KEYS.USER, user);
  }

  getUserSession(): User | null {
    return this.getItem(STORAGE_KEYS.USER, validateUser);
  }

  clearUserSession(): void {
    this.removeItem(STORAGE_KEYS.USER);
  }

  // ==================== ACTIVE TIME ENTRY ====================

  saveActiveEntry(entry: TimeEntry | null): void {
    if (entry && !validateTimeEntry(entry)) {
      throw new StorageError('Invalid time entry data', 'saveActiveEntry');
    }
    this.setItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY, entry);
  }

  getActiveEntry(): TimeEntry | null {
    return this.getItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY, validateTimeEntry);
  }

  clearActiveEntry(): void {
    this.removeItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY);
  }

  // ==================== NOTIFICATIONS ====================

  saveNotifications(notifications: Notification[]): void {
    if (!Array.isArray(notifications)) {
      throw new StorageError('Notifications must be an array', 'saveNotifications');
    }

    const validNotifications = notifications.filter(validateNotification);
    if (validNotifications.length !== notifications.length) {
      console.warn('Some notifications were invalid and filtered out');
    }

    this.setItem(STORAGE_KEYS.NOTIFICATIONS, validNotifications);
  }

  getNotifications(): Notification[] {
    const notifications = this.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return Array.isArray(notifications) ? notifications : [];
  }

  addNotification(notification: Notification): void {
    if (!validateNotification(notification)) {
      throw new StorageError('Invalid notification data', 'addNotification');
    }

    const notifications = this.getNotifications();
    notifications.unshift(notification); // Add to beginning

    // Keep only most recent 500 notifications
    if (notifications.length > 500) {
      notifications.splice(500);
    }

    this.saveNotifications(notifications);
  }

  // ==================== CROSS-TAB SYNC ====================

  saveSyncEvent(event: SyncEvent): void {
    if (!validateSyncEvent(event)) {
      throw new StorageError('Invalid sync event data', 'saveSyncEvent');
    }

    const syncEvents = this.getSyncEvents();
    syncEvents.push(event);

    // Keep only most recent 100 sync events
    if (syncEvents.length > 100) {
      syncEvents.splice(0, syncEvents.length - 100);
    }

    this.setItem('sync_events', syncEvents);
  }

  getSyncEvents(): SyncEvent[] {
    return this.getItem('sync_events', (events): events is SyncEvent[] => {
      return Array.isArray(events) && events.every(validateSyncEvent);
    }) || [];
  }

  clearSyncEvents(): void {
    this.removeItem('sync_events');
  }

  // ==================== SETTINGS ====================

  saveSettings(settings: Record<string, any>): void {
    if (typeof settings !== 'object' || settings === null) {
      throw new StorageError('Settings must be an object', 'saveSettings');
    }
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  getSettings(): Record<string, any> {
    return this.getItem(STORAGE_KEYS.SETTINGS) || {};
  }

  // ==================== EVENT LISTENERS ====================

  /**
   * Add event listener for storage changes
   */
  addEventListener(event: 'activeEntryChanged' | 'notificationsChanged', callback: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: 'activeEntryChanged' | 'notificationsChanged', callback: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current tab ID
   */
  getTabId(): string {
    return this.tabId;
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (key.startsWith(this.PREFIX)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available space (localStorage typically has 5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const percentage = (used / estimated) * 100;

      return {
        used,
        available: estimated - used,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Clear all app data from localStorage
   */
  clearAllData(): void {
    try {
      const keysToRemove: string[] = [];
      for (let key in localStorage) {
        if (key.startsWith(this.PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new StorageError('Failed to clear all data', 'clearAllData');
    }
  }
}

// Create singleton instance
export const localStorageManager = new LocalStorageManager();

// Export the class for testing purposes
