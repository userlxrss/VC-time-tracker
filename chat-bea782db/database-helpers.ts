/**
 * Database Helper Utilities
 *
 * Production-ready implementations and utilities for the HR time tracker schema.
 * Includes validation, timezone management, and cross-tab synchronization.
 */

import {
  User,
  TimeEntry,
  LeaveRequest,
  SalaryRecord,
  Notification,
  LeaveBalance,
  BreakPeriod,
  SyncEvent,
  UserRole,
  TimeEntryStatus,
  LeaveStatus,
  PaymentStatus,
  NotificationType,
  NotificationPriority,
  LeaveType,
  EmploymentStatus,
  STORAGE_KEYS,
  ManilaTimeUtils,
  LocalStorageManager
} from './database-schema';

// ==================== TIMEZONE UTILITIES ====================

/**
 * Manila Timezone Utilities Implementation
 */
export class ManilaTimeManager implements ManilaTimeUtils {
  private readonly TIMEZONE = 'Asia/Manila';
  private readonly UTC_OFFSET = 8; // UTC+8

  now(): Date {
    return this.toManilaTime(new Date());
  }

  toManilaTime(date: Date): Date {
    // Create a new date to avoid mutating the original
    const utc = new Date(date.getTime());
    const manilaTime = new Date(utc.getTime() + (this.UTC_OFFSET * 60 * 60 * 1000));
    return manilaTime;
  }

  format(date: Date, format: string): string {
    const manilaTime = this.toManilaTime(date);

    // Simple formatting - you might want to use a library like date-fns
    return manilaTime.toLocaleString('en-PH', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: format.includes('12h') ? true : false
    });
  }

  isToday(date: Date): boolean {
    const manilaTime = this.toManilaTime(date);
    const today = this.toManilaTime(new Date());

    return manilaTime.toDateString() === today.toDateString();
  }

  startOfDay(date: Date): Date {
    const manilaTime = this.toManilaTime(date);
    manilaTime.setHours(0, 0, 0, 0);
    return manilaTime;
  }

  endOfDay(date: Date): Date {
    const manilaTime = this.toManilaTime(date);
    manilaTime.setHours(23, 59, 59, 999);
    return manilaTime;
  }

  addBusinessDays(date: Date, days: number): Date {
    const result = this.toManilaTime(new Date(date));
    let businessDaysAdded = 0;

    while (businessDaysAdded < days) {
      result.setDate(result.getDate() + 1);

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        businessDaysAdded++;
      }
    }

    return result;
  }

  calculateWorkingHours(start: Date, end: Date): number {
    const startTime = this.toManilaTime(start);
    const endTime = this.toManilaTime(end);

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.max(0, diffHours);
  }
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validation utilities
 */
export class ValidationHelper {
  private static timeManager = new ManilaTimeManager();

  /**
   * Validate user data
   */
  static validateUser(userData: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // First name validation
    if (userData.firstName) {
      if (userData.firstName.length < 2 || userData.firstName.length > 50) {
        errors.push('First name must be between 2 and 50 characters');
      }
      if (!/^[a-zA-Z\s'-]+$/.test(userData.firstName)) {
        errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
      }
    }

    // Last name validation
    if (userData.lastName) {
      if (userData.lastName.length < 2 || userData.lastName.length > 50) {
        errors.push('Last name must be between 2 and 50 characters');
      }
      if (!/^[a-zA-Z\s'-]+$/.test(userData.lastName)) {
        errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
      }
    }

    // Email validation
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone number validation
    if (userData.phoneNumber) {
      const phoneRegex = /^(\+63|0)[0-9]{10}$/;
      if (!phoneRegex.test(userData.phoneNumber)) {
        errors.push('Phone number must be a valid Philippine number (+63 or 0 followed by 10 digits)');
      }
    }

    // Employee ID validation
    if (userData.employeeId) {
      if (userData.employeeId.length < 3 || userData.employeeId.length > 20) {
        errors.push('Employee ID must be between 3 and 20 characters');
      }
      if (!/^[A-Z0-9-]+$/.test(userData.employeeId)) {
        errors.push('Employee ID can only contain uppercase letters, numbers, and hyphens');
      }
    }

    // Hourly rate validation
    if (userData.hourlyRate !== undefined) {
      if (userData.hourlyRate < 0 || userData.hourlyRate > 10000) {
        errors.push('Hourly rate must be between 0 and 10,000');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate time entry data
   */
  static validateTimeEntry(entryData: Partial<TimeEntry>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (entryData.clockIn) {
      const now = this.timeManager.now();
      const maxFutureTime = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes in future

      if (entryData.clockIn > maxFutureTime) {
        errors.push('Cannot clock in more than 5 minutes in the future');
      }
    }

    if (entryData.clockOut && entryData.clockIn) {
      if (entryData.clockOut <= entryData.clockIn) {
        errors.push('Clock out time must be after clock in time');
      }

      const duration = this.timeManager.calculateWorkingHours(entryData.clockIn, entryData.clockOut);
      if (duration > 24) {
        errors.push('Time entry cannot exceed 24 hours');
      }
    }

    if (entryData.notes && entryData.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate leave request data
   */
  static validateLeaveRequest(requestData: Partial<LeaveRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!requestData.type || !Object.values(LeaveType).includes(requestData.type)) {
      errors.push('Invalid leave type');
    }

    if (requestData.startDate) {
      const now = this.timeManager.startOfDay(this.timeManager.now());
      const requestDate = this.timeManager.startOfDay(requestData.startDate);

      if (requestDate < now) {
        errors.push('Leave start date cannot be in the past');
      }

      const maxFutureDate = new Date(now);
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

      if (requestData.startDate > maxFutureDate) {
        errors.push('Leave cannot be requested more than 365 days in advance');
      }
    }

    if (requestData.endDate && requestData.startDate) {
      if (requestData.endDate < requestData.startDate) {
        errors.push('End date must be after or equal to start date');
      }

      const duration = Math.ceil(
        (requestData.endDate.getTime() - requestData.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      if (duration > 365) {
        errors.push('Leave cannot exceed 365 days');
      }

      if (requestData.totalDays && requestData.totalDays !== duration) {
        errors.push('Total days does not match date range');
      }
    }

    if (requestData.totalDays) {
      if (requestData.totalDays < 0.5 || requestData.totalDays > 365) {
        errors.push('Total days must be between 0.5 and 365');
      }
    }

    if (requestData.reason) {
      if (requestData.reason.length < 10) {
        errors.push('Reason must be at least 10 characters');
      }
      if (requestData.reason.length > 1000) {
        errors.push('Reason cannot exceed 1000 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate Philippine phone number
   */
  static isValidPhilippinePhone(phone: string): boolean {
    const phoneRegex = /^(\+63|0)[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ==================== LOCAL STORAGE IMPLEMENTATION ====================

/**
 * LocalStorage Manager Implementation
 */
export class LocalStorageHelper implements LocalStorageManager {
  private timeManager = new ManilaTimeManager();
  private tabId: string;

  constructor() {
    this.tabId = ValidationHelper.generateId();
    this.saveTabId();
  }

  // User session management
  saveUserSession(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  }

  getUserSession(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get user session:', error);
      return null;
    }
  }

  clearUserSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Failed to clear user session:', error);
    }
  }

  // Active time entry management
  saveActiveEntry(entry: TimeEntry | null): void {
    try {
      if (entry) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY, JSON.stringify(entry));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY);
      }
    } catch (error) {
      console.error('Failed to save active entry:', error);
    }
  }

  getActiveEntry(): TimeEntry | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get active entry:', error);
      return null;
    }
  }

  clearActiveEntry(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIME_ENTRY);
    } catch (error) {
      console.error('Failed to clear active entry:', error);
    }
  }

  // Notifications management
  saveNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  getNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification); // Add to beginning

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    this.saveNotifications(notifications);
  }

  // Cross-tab sync management
  saveSyncEvent(event: SyncEvent): void {
    try {
      const events = this.getSyncEvents();
      events.push(event);

      // Keep only last 50 events
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }

      localStorage.setItem(`${STORAGE_KEYS.NOTIFICATIONS}_sync`, JSON.stringify(events));

      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${STORAGE_KEYS.NOTIFICATIONS}_sync`,
        newValue: JSON.stringify(events)
      }));
    } catch (error) {
      console.error('Failed to save sync event:', error);
    }
  }

  getSyncEvents(): SyncEvent[] {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.NOTIFICATIONS}_sync`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get sync events:', error);
      return [];
    }
  }

  clearSyncEvents(): void {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.NOTIFICATIONS}_sync`);
    } catch (error) {
      console.error('Failed to clear sync events:', error);
    }
  }

  // Settings management
  saveSettings(settings: Record<string, any>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getSettings(): Record<string, any> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  // Tab management
  private saveTabId(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TAB_ID, this.tabId);
    } catch (error) {
      console.error('Failed to save tab ID:', error);
    }
  }

  getTabId(): string {
    return this.tabId;
  }

  // Cleanup methods
  cleanup(): void {
    this.clearActiveEntry();
    this.clearSyncEvents();
  }
}

// ==================== CROSS-TAB SYNCHRONIZATION ====================

/**
 * Cross-tab synchronization manager
 */
export class CrossTabSyncManager {
  private storageHelper: LocalStorageHelper;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.storageHelper = new LocalStorageHelper();
    this.setupStorageListener();
  }

  /**
   * Listen for storage events from other tabs
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === `${STORAGE_KEYS.NOTIFICATIONS}_sync`) {
        const events: SyncEvent[] = event.newValue ? JSON.parse(event.newValue) : [];
        this.processSyncEvents(events);
      }
    });
  }

  /**
   * Process sync events from other tabs
   */
  private processSyncEvents(events: SyncEvent[]): void {
    events.forEach(event => {
      if (event.tabId !== this.storageHelper.getTabId()) {
        this.notifyListeners(event.type, event);
      }
    });
  }

  /**
   * Add event listener for specific sync event types
   */
  addListener(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeListener(eventType: string, callback: Function): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners for a specific event type
   */
  private notifyListeners(eventType: string, event: SyncEvent): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in sync event listener:', error);
        }
      });
    }
  }

  /**
   * Broadcast sync event to other tabs
   */
  broadcastEvent(type: string, userId: string, data: any): void {
    const event: SyncEvent = {
      type: type as any,
      timestamp: new Date(),
      userId,
      data,
      tabId: this.storageHelper.getTabId()
    };

    this.storageHelper.saveSyncEvent(event);
  }
}

// ==================== CALCULATION UTILITIES ====================

/**
 * Time calculation utilities
 */
export class TimeCalculations {
  private timeManager = new ManilaTimeManager();

  /**
   * Calculate total hours from time entry including breaks
   */
  static calculateTotalHours(timeEntry: TimeEntry): number {
    if (!timeEntry.clockOut) return 0;

    const totalDuration = new TimeCalculations().timeManager.calculateWorkingHours(
      timeEntry.clockIn,
      timeEntry.clockOut
    );

    const totalBreakDuration = timeEntry.breaks.reduce((total, breakPeriod) => {
      if (!breakPeriod.endTime) return total;
      return total + (breakPeriod.endTime.getTime() - breakPeriod.startTime.getTime()) / (1000 * 60 * 60);
    }, 0);

    return Math.max(0, totalDuration - totalBreakDuration);
  }

  /**
   * Calculate overtime hours
   */
  static calculateOvertimeHours(timeEntry: TimeEntry, regularHoursLimit: number = 8): number {
    const totalHours = this.calculateTotalHours(timeEntry);
    return Math.max(0, totalHours - regularHoursLimit);
  }

  /**
   * Calculate leave duration in days
   */
  static calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new TimeCalculations().timeManager.startOfDay(startDate);
    const end = new TimeCalculations().timeManager.startOfDay(endDate);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }

  /**
   * Calculate payroll amounts
   */
  static calculatePayroll(
    regularHours: number,
    overtimeHours: number,
    hourlyRate: number,
    overtimeRate: number = 1.5
  ): {
    regularAmount: number;
    overtimeAmount: number;
    grossAmount: number;
  } {
    const regularAmount = regularHours * hourlyRate;
    const overtimeAmount = overtimeHours * hourlyRate * overtimeRate;
    const grossAmount = regularAmount + overtimeAmount;

    return {
      regularAmount,
      overtimeAmount,
      grossAmount
    };
  }

  /**
   * Check if user has sufficient leave balance
   */
  static hasLeaveBalance(
    balance: LeaveBalance,
    type: LeaveType,
    requestedDays: number
  ): boolean {
    switch (type) {
      case LeaveType.VACATION:
        return balance.vacationRemaining >= requestedDays;
      case LeaveType.SICK:
        return balance.sickRemaining >= requestedDays;
      case LeaveType.PERSONAL:
        return balance.personalRemaining >= requestedDays;
      case LeaveType.UNPAID:
        return true; // Unpaid leave doesn't require balance
      default:
        return true; // Other types might have different rules
    }
  }
}

// ==================== EXPORTS ====================

export {
  // Classes
  ManilaTimeManager,
  ValidationHelper,
  LocalStorageHelper,
  CrossTabSyncManager,
  TimeCalculations,

  // Utilities
  type SyncEvent,
  STORAGE_KEYS
};