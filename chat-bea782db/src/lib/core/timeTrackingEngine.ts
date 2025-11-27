/**
 * Core Time Tracking Engine
 *
 * Main orchestrator that combines all time tracking functionality into a
 * cohesive, production-ready system with comprehensive features.
 */

import {
  TimeEntry,
  User,
  BreakPeriod,
  TimeEntryStatus,
  UserRole,
  NotificationType,
  NotificationPriority
} from '../../database-schema';
import { timeEntryManager } from '../timeTracking/timeEntryManager';
import { breakManager } from '../breaks/breakManager';
import { notificationManager } from '../notifications/notificationManager';
import { overtimeCalculator, DailyWorkSummary, WeeklyWorkSummary } from '../analytics/overtimeCalculator';
import { manilaTime } from '../utils/manilaTime';
import { localStorageManager } from '../storage/localStorageManager';
import { errorHandler, AppError, BusinessLogicError, ValidationError } from '../errors/errorHandler';
import { validationSchemas } from '../validation/schemas';

/**
 * Time tracking engine configuration
 */
export interface TimeTrackingEngineConfig {
  enableAutoReminders: boolean;
  enableBreakReminders: boolean;
  enableOvertimeAlerts: boolean;
  enableWeeklyReports: boolean;
  reminderInterval: number; // minutes
  breakDurationReminder: number; // minutes
  overtimeThreshold: number; // hours
  weeklyReportDay: number; // 0 = Sunday, 6 = Saturday
  weeklyReportTime: string; // HH:MM format
}

/**
 * Engine status
 */
export interface EngineStatus {
  isInitialized: boolean;
  isRunning: boolean;
  currentUser: User | null;
  activeEntry: TimeEntry | null;
  isOnBreak: boolean;
  sessionStartTime: Date | null;
  lastSyncTime: Date | null;
  errorCount: number;
  lastError: string | null;
}

/**
 * Time tracking session data
 */
export interface TimeTrackingSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalWorkTime: number;
  totalBreakTime: number;
  entries: TimeEntry[];
  status: 'active' | 'completed' | 'interrupted';
}

/**
 * Real-time updates
 */
export interface RealTimeUpdate {
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END' | 'PROGRESS_UPDATE' | 'NOTIFICATION';
  timestamp: Date;
  userId: string;
  data: any;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeBreaks: boolean;
  includeAnalytics: boolean;
  includeEarnings?: boolean;
}

/**
 * Core Time Tracking Engine
 */
export class TimeTrackingEngine {
  private config: TimeTrackingEngineConfig;
  private status: EngineStatus;
  private currentSession: TimeTrackingSession | null = null;
  private updateListeners: Set<(update: RealTimeUpdate) => void> = new Set();
  private reminderTimers: Map<string, NodeJS.Timeout> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<TimeTrackingEngineConfig> = {}) {
    this.config = {
      enableAutoReminders: true,
      enableBreakReminders: true,
      enableOvertimeAlerts: true,
      enableWeeklyReports: false,
      reminderInterval: 60, // 1 hour
      breakDurationReminder: 45, // 45 minutes
      overtimeThreshold: 8,
      weeklyReportDay: 5, // Friday
      weeklyReportTime: '17:00',
      ...config
    };

    this.status = {
      isInitialized: false,
      isRunning: false,
      currentUser: null,
      activeEntry: null,
      isOnBreak: false,
      sessionStartTime: null,
      lastSyncTime: null,
      errorCount: 0,
      lastError: null
    };

    this.setupValidationSchemas();
  }

  /**
   * Initialize the engine
   */
  async initialize(userId?: string): Promise<void> {
    try {
      console.log('🚀 Initializing Time Tracking Engine...');

      // Load user session if userId provided
      let user: User | null = null;
      if (userId) {
        user = await this.loadUser(userId);
      } else {
        user = localStorageManager.getUserSession();
      }

      if (user) {
        await this.setUserSession(user);
      }

      // Check for active time entry
      if (user) {
        const activeEntry = await timeEntryManager.findActiveEntry(user.id);
        if (activeEntry) {
          this.status.activeEntry = activeEntry;
          this.status.isOnBreak = breakManager.isOnBreak(activeEntry.breaks);
        }
      }

      // Setup background services
      this.setupBackgroundServices();
      this.setupCrossTabSync();

      this.status.isInitialized = true;
      this.status.isRunning = true;
      this.status.sessionStartTime = new Date();

      console.log('✅ Time Tracking Engine initialized successfully');
      this.broadcastUpdate({
        type: 'PROGRESS_UPDATE',
        timestamp: new Date(),
        userId: user?.id || 'anonymous',
        data: { status: 'initialized' }
      });

    } catch (error) {
      console.error('❌ Failed to initialize Time Tracking Engine:', error);
      await this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Shutdown the engine
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Time Tracking Engine...');

    // Clear all timers
    this.reminderTimers.forEach(timer => clearTimeout(timer));
    this.reminderTimers.clear();

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    // Complete current session if active
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.status = 'completed';
      await this.saveSession(this.currentSession);
    }

    // Clear notifications
    await notificationManager.cleanupExpired();

    // Update status
    this.status.isRunning = false;
    this.currentSession = null;
    this.updateListeners.clear();

    console.log('✅ Time Tracking Engine shut down successfully');
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Set user session
   */
  async setUserSession(user: User): Promise<void> {
    try {
      // Validate user
      const validation = errorHandler.validate('user', user);
      if (!validation.isValid) {
        throw new ValidationError('USER_VALIDATION', `Invalid user data: ${validation.errors.join(', ')}`);
      }

      this.status.currentUser = user;
      localStorageManager.saveUserSession(user);

      // Start new session
      this.currentSession = {
        userId: user.id,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date(),
        totalWorkTime: 0,
        totalBreakTime: 0,
        entries: [],
        status: 'active'
      };

      // Setup user-specific features
      this.setupUserReminders(user);

      console.log(`👤 User session set: ${user.firstName} ${user.lastName} (${user.email})`);

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Load user from storage
   */
  private async loadUser(userId: string): Promise<User | null> {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use the stored session
      const user = localStorageManager.getUserSession();
      return user?.id === userId ? user : null;
    } catch (error) {
      console.error('Failed to load user:', error);
      return null;
    }
  }

  // ==================== CLOCK IN/OUT OPERATIONS ====================

  /**
   * Clock in user
   */
  async clockIn(options: {
    userId?: string;
    notes?: string;
    location?: { latitude: number; longitude: number; address: string };
    force?: boolean;
  } = {}): Promise<TimeEntry> {
    try {
      const userId = options.userId || this.status.currentUser?.id;
      if (!userId) {
        throw new BusinessLogicError('CLOCK_IN_NO_USER', 'No user session available');
      }

      // Check if already clocked in
      const existingEntry = await timeEntryManager.findActiveEntry(userId);
      if (existingEntry && !options.force) {
        throw new BusinessLogicError('ALREADY_CLOCKED_IN', 'User is already clocked in', {
          existingEntryId: existingEntry.id,
          clockInTime: existingEntry.clockIn
        });
      }

      // Validate clock in time
      const clockInTime = manilaTime.now();
      const futureLimit = new Date(clockInTime.getTime() + 5 * 60 * 1000); // 5 minutes future

      if (clockInTime > futureLimit) {
        throw new ValidationError('CLOCK_IN_FUTURE', 'Cannot clock in more than 5 minutes in the future');
      }

      // Create time entry
      const timeEntry = await timeEntryManager.clockIn({
        userId,
        notes: options.notes,
        clockInLocation: options.location
      });

      // Update status
      this.status.activeEntry = timeEntry;
      this.status.isOnBreak = false;

      // Update session
      if (this.currentSession) {
        this.currentSession.entries.push(timeEntry);
      }

      // Send notifications
      await this.sendClockInNotification(userId, timeEntry);

      // Start reminders
      if (this.config.enableAutoReminders) {
        this.startWorkReminder(userId);
      }

      // Broadcast update
      this.broadcastUpdate({
        type: 'CLOCK_IN',
        timestamp: new Date(),
        userId,
        data: { timeEntry }
      });

      console.log(`⏰ User clocked in: ${userId} at ${manilaTime.format(timeEntry.clockIn)}`);
      return timeEntry;

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Clock out user
   */
  async clockOut(options: {
    userId?: string;
    clockOutTime?: Date;
    notes?: string;
    location?: { latitude: number; longitude: number; address: string };
    force?: boolean;
  } = {}): Promise<TimeEntry> {
    try {
      const userId = options.userId || this.status.currentUser?.id;
      if (!userId) {
        throw new BusinessLogicError('CLOCK_OUT_NO_USER', 'No user session available');
      }

      const activeEntry = this.status.activeEntry || await timeEntryManager.findActiveEntry(userId);
      if (!activeEntry) {
        throw new BusinessLogicError('NOT_CLOCKED_IN', 'User is not currently clocked in');
      }

      // Auto-complete breaks if any are active
      const updatedBreaks = breakManager.autoCompleteBreaks(activeEntry.breaks);
      if (updatedBreaks.length !== activeEntry.breaks.length) {
        await timeEntryManager.update(activeEntry.id, { breaks: updatedBreaks });
      }

      // Clock out
      const clockOutTime = options.clockOutTime || manilaTime.now();
      const updatedEntry = await timeEntryManager.clockOut(activeEntry.id, clockOutTime);

      // Update status
      this.status.activeEntry = null;
      this.status.isOnBreak = false;

      // Update session
      if (this.currentSession) {
        this.currentSession.totalWorkTime += updatedEntry.totalHours || 0;
        this.currentSession.totalBreakTime += updatedEntry.breaks.reduce((total, b) => total + (b.duration || 0), 0);
      }

      // Send notifications
      await this.sendClockOutNotification(userId, updatedEntry);

      // Clear reminders
      this.clearWorkReminder(userId);

      // Broadcast update
      this.broadcastUpdate({
        type: 'CLOCK_OUT',
        timestamp: new Date(),
        userId,
        data: { timeEntry: updatedEntry }
      });

      console.log(`⏰ User clocked out: ${userId} at ${manilaTime.format(clockOutTime)}`);
      return updatedEntry;

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  // ==================== BREAK MANAGEMENT ====================

  /**
   * Start break
   */
  async startBreak(
    breakType: BreakPeriod['type'],
    options: { userId?: string; duration?: number } = {}
  ): Promise<BreakPeriod> {
    try {
      const userId = options.userId || this.status.currentUser?.id;
      if (!userId) {
        throw new BusinessLogicError('START_BREAK_NO_USER', 'No user session available');
      }

      const activeEntry = this.status.activeEntry || await timeEntryManager.findActiveEntry(userId);
      if (!activeEntry) {
        throw new BusinessLogicError('START_BREAK_NOT_CLOCKED_IN', 'Must be clocked in to take a break');
      }

      // Check if already on break
      if (breakManager.isOnBreak(activeEntry.breaks)) {
        throw new BusinessLogicError('ALREADY_ON_BREAK', 'Already on a break');
      }

      // Validate break type
      const config = breakManager.getBreakTypeConfig(breakType);
      if (!config) {
        throw new ValidationError('INVALID_BREAK_TYPE', `Invalid break type: ${breakType}`);
      }

      // Add break to time entry
      const updatedEntry = await timeEntryManager.addBreak(activeEntry.id, {
        type: breakType,
        isPaid: config.isPaid,
        duration: options.duration
      });

      // Get the new break
      const newBreak = updatedEntry.breaks.find(b => !b.endTime);
      if (!newBreak) {
        throw new Error('Failed to create break');
      }

      // Update status
      this.status.activeEntry = updatedEntry;
      this.status.isOnBreak = true;

      // Send notification
      await this.sendBreakStartNotification(userId, newBreak);

      // Start break duration reminder
      if (this.config.enableBreakReminders) {
        this.startBreakReminder(userId, newBreak);
      }

      // Broadcast update
      this.broadcastUpdate({
        type: 'BREAK_START',
        timestamp: new Date(),
        userId,
        data: { break: newBreak }
      });

      console.log(`☕ Break started: ${breakType} for user ${userId}`);
      return newBreak;

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * End break
   */
  async endBreak(options: { userId?: string; breakId?: string } = {}): Promise<BreakPeriod> {
    try {
      const userId = options.userId || this.status.currentUser?.id;
      if (!userId) {
        throw new BusinessLogicError('END_BREAK_NO_USER', 'No user session available');
      }

      const activeEntry = this.status.activeEntry || await timeEntryManager.findActiveEntry(userId);
      if (!activeEntry) {
        throw new BusinessLogicError('END_BREAK_NOT_CLOCKED_IN', 'Not currently clocked in');
      }

      // Find active break
      const activeBreaks = activeEntry.breaks.filter(b => !b.endTime);
      if (activeBreaks.length === 0) {
        throw new BusinessLogicError('NO_ACTIVE_BREAK', 'No active break to end');
      }

      const breakToEnd = activeBreaks.find(b => b.id === options.breakId) || activeBreaks[0];

      // End the break
      const updatedEntry = await timeEntryManager.endBreak(activeEntry.id, breakToEnd.id);

      // Get the updated break
      const endedBreak = updatedEntry.breaks.find(b => b.id === breakToEnd.id);
      if (!endedBreak) {
        throw new Error('Failed to end break');
      }

      // Update status
      this.status.activeEntry = updatedEntry;
      this.status.isOnBreak = false;

      // Send notification
      await this.sendBreakEndNotification(userId, endedBreak);

      // Clear break reminder
      this.clearBreakReminder(userId);

      // Broadcast update
      this.broadcastUpdate({
        type: 'BREAK_END',
        timestamp: new Date(),
        userId,
        data: { break: endedBreak }
      });

      console.log(`🏁 Break ended: ${endedBreak.type} for user ${userId} (duration: ${endedBreak.duration} minutes)`);
      return endedBreak;

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  // ==================== ANALYTICS AND REPORTING ====================

  /**
   * Get today's progress
   */
  async getTodayProgress(userId?: string): Promise<DailyWorkSummary> {
    const targetUserId = userId || this.status.currentUser?.id;
    if (!targetUserId) {
      throw new BusinessLogicError('PROGRESS_NO_USER', 'No user available');
    }

    const entries = await timeEntryManager.findByUserId(targetUserId, {
      startDate: manilaTime.startOfDay(manilaTime.now()),
      endDate: manilaTime.endOfDay(manilaTime.now())
    });

    return await overtimeCalculator.getTodayProgress(targetUserId, entries);
  }

  /**
   * Get weekly progress
   */
  async getWeeklyProgress(userId?: string): Promise<WeeklyWorkSummary> {
    const targetUserId = userId || this.status.currentUser?.id;
    if (!targetUserId) {
      throw new BusinessLogicError('PROGRESS_NO_USER', 'No user available');
    }

    const entries = await timeEntryManager.findByUserId(targetUserId);
    return await overtimeCalculator.getCurrentWeekProgress(targetUserId, entries);
  }

  /**
   * Export time tracking data
   */
  async exportData(options: ExportOptions): Promise<string | object> {
    try {
      const userId = this.status.currentUser?.id;
      if (!userId) {
        throw new BusinessLogicError('EXPORT_NO_USER', 'No user available for export');
      }

      // Get entries in date range
      const entries = await timeEntryManager.findByUserId(userId, {
        startDate: options.dateRange.start,
        endDate: options.dateRange.end
      });

      // Generate appropriate summary based on date range
      const duration = (options.dateRange.end.getTime() - options.dateRange.start.getTime()) / (1000 * 60 * 60 * 24);

      let summary: DailyWorkSummary | WeeklyWorkSummary | any;

      if (duration <= 1) {
        // Daily summary
        summary = await overtimeCalculator.getTodayProgress(userId, entries);
      } else if (duration <= 7) {
        // Weekly summary
        summary = await overtimeCalculator.getCurrentWeekProgress(userId, entries);
      } else {
        // Monthly summary
        summary = await overtimeCalculator.getCurrentMonthProgress(userId, entries);
      }

      return overtimeCalculator.exportData(summary, options.format);

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  // ==================== NOTIFICATION METHODS ====================

  /**
   * Send clock in notification
   */
  private async sendClockInNotification(userId: string, timeEntry: TimeEntry): Promise<void> {
    await notificationManager.success(userId, '✅ Clocked In Successfully',
      `You've clocked in at ${manilaTime.format(timeEntry.clockIn, 'hh:mm A')}. Have a productive day!`,
      {
        action: {
          label: 'View Progress',
          callback: () => this.getTodayProgress(userId)
        }
      }
    );
  }

  /**
   * Send clock out notification
   */
  private async sendClockOutNotification(userId: string, timeEntry: TimeEntry): Promise<void> {
    const totalHours = timeEntry.totalHours?.toFixed(2) || '0.00';
    const clockOutTime = manilaTime.format(timeEntry.clockOut!, 'hh:mm A');

    let message = `You've clocked out at ${clockOutTime}. Total hours: ${totalHours}`;

    if (timeEntry.overtimeHours && timeEntry.overtimeHours > 0) {
      message += ` (including ${timeEntry.overtimeHours.toFixed(2)} overtime hours)`;
    }

    await notificationManager.success(userId, '✅ Clocked Out Successfully', message, {
      action: {
        label: 'View Summary',
        callback: () => this.getTodayProgress(userId)
      }
    });
  }

  /**
   * Send break start notification
   */
  private async sendBreakStartNotification(userId: string, breakPeriod: BreakPeriod): Promise<void> {
    const config = breakManager.getBreakTypeConfig(breakPeriod.type);
    if (!config) return;

    await notificationManager.info(userId, `☕ ${config.name} Started`,
      `${config.description}. Duration: ${config.defaultDuration} minutes`,
      {
        duration: 3000, // Shorter duration for break notifications
        action: {
          label: 'End Break',
          callback: () => this.endBreak({ userId })
        }
      }
    );
  }

  /**
   * Send break end notification
   */
  private async sendBreakEndNotification(userId: string, breakPeriod: BreakPeriod): Promise<void> {
    const config = breakManager.getBreakTypeConfig(breakPeriod.type);
    if (!config) return;

    await notificationManager.success(userId, '🏁 Break Ended',
      `${config.name} ended. Duration: ${breakPeriod.duration} minutes`,
      {
        duration: 3000
      }
    );
  }

  // ==================== REMINDER SYSTEM ====================

  /**
   * Setup user-specific reminders
   */
  private setupUserReminders(user: User): void {
    if (this.config.enableWeeklyReports) {
      this.setupWeeklyReport(user);
    }
  }

  /**
   * Start work reminder
   */
  private startWorkReminder(userId: string): void {
    this.clearWorkReminder(userId); // Clear any existing reminder

    const timer = setInterval(async () => {
      try {
        const progress = await this.getTodayProgress(userId);
        const hoursWorked = progress.totalHours;

        // Send reminder based on progress
        if (hoursWorked < 4) {
          await notificationManager.timeReminder(userId,
            `Keep going! You've worked ${hoursWorked.toFixed(1)} hours so far today.`);
        } else if (hoursWorked < 6) {
          await notificationManager.timeReminder(userId,
            `Great progress! ${hoursWorked.toFixed(1)} hours completed. You're doing well!`);
        } else if (hoursWorked < 8) {
          await notificationManager.timeReminder(userId,
            `Almost there! ${hoursWorked.toFixed(1)} hours done. Just ${(8 - hoursWorked).toFixed(1)} hours to your goal!`);
        }

        // Check for overtime
        if (hoursWorked > this.config.overtimeThreshold && this.config.enableOvertimeAlerts) {
          await notificationManager.warning(userId,
            '⚠️ Overtime Alert', `You've worked ${(hoursWorked - 8).toFixed(1)} overtime hours today.`);
        }

      } catch (error) {
        console.error('Work reminder error:', error);
      }
    }, this.config.reminderInterval * 60 * 1000);

    this.reminderTimers.set(`work_${userId}`, timer);
  }

  /**
   * Clear work reminder
   */
  private clearWorkReminder(userId: string): void {
    const timer = this.reminderTimers.get(`work_${userId}`);
    if (timer) {
      clearInterval(timer);
      this.reminderTimers.delete(`work_${userId}`);
    }
  }

  /**
   * Start break reminder
   */
  private startBreakReminder(userId: string, breakPeriod: BreakPeriod): void {
    const config = breakManager.getBreakTypeConfig(breakPeriod.type);
    if (!config) return;

    this.clearBreakReminder(userId);

    const timer = setTimeout(async () => {
      try {
        await notificationManager.info(userId, '💡 Break Reminder',
          `Your ${config.name.toLowerCase()} has been going for a while. Remember to stay hydrated!`,
          {
            action: {
              label: 'End Break',
              callback: () => this.endBreak({ userId })
            }
          }
        );
      } catch (error) {
        console.error('Break reminder error:', error);
      }
    }, this.config.breakDurationReminder * 60 * 1000);

    this.reminderTimers.set(`break_${userId}`, timer);
  }

  /**
   * Clear break reminder
   */
  private clearBreakReminder(userId: string): void {
    const timer = this.reminderTimers.get(`break_${userId}`);
    if (timer) {
      clearTimeout(timer);
      this.reminderTimers.delete(`break_${userId}`);
    }
  }

  /**
   * Setup weekly report (placeholder for future implementation)
   */
  private setupWeeklyReport(user: User): void {
    // Implementation would go here for weekly reports
    console.log(`Weekly reports enabled for user: ${user.id}`);
  }

  // ==================== BACKGROUND SERVICES ====================

  /**
   * Setup background services
   */
  private setupBackgroundServices(): void {
    // Setup periodic sync (every 5 minutes)
    this.syncTimer = setInterval(() => {
      this.performPeriodicSync();
    }, 5 * 60 * 1000);

    // Setup cleanup (every hour)
    setInterval(() => {
      this.performCleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('hr_time_tracker_engine');

      channel.addEventListener('message', (event) => {
        if (event.data.type === 'ENGINE_UPDATE') {
          this.handleCrossTabUpdate(event.data.update);
        }
      });
    }
  }

  /**
   * Perform periodic sync
   */
  private async performPeriodicSync(): Promise<void> {
    try {
      // Sync active entry if exists
      if (this.status.activeEntry) {
        const refreshedEntry = await timeEntryManager.findById(this.status.activeEntry.id);
        if (refreshedEntry) {
          this.status.activeEntry = refreshedEntry;
          this.status.isOnBreak = breakManager.isOnBreak(refreshedEntry.breaks);
        }
      }

      this.status.lastSyncTime = new Date();

    } catch (error) {
      console.error('Periodic sync error:', error);
      this.status.errorCount++;
    }
  }

  /**
   * Perform cleanup
   */
  private async performCleanup(): Promise<void> {
    try {
      // Cleanup expired notifications
      await notificationManager.cleanupExpired();

      // Cleanup old sync events
      localStorageManager.clearSyncEvents();

    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Handle cross-tab updates
   */
  private async handleCrossTabUpdate(update: RealTimeUpdate): Promise<void> {
    if (update.userId !== this.status.currentUser?.id) return;

    // Refresh local state based on update type
    switch (update.type) {
      case 'CLOCK_IN':
        if (update.data.timeEntry) {
          this.status.activeEntry = update.data.timeEntry;
          this.status.isOnBreak = false;
        }
        break;

      case 'CLOCK_OUT':
        this.status.activeEntry = null;
        this.status.isOnBreak = false;
        break;

      case 'BREAK_START':
        this.status.isOnBreak = true;
        break;

      case 'BREAK_END':
        this.status.isOnBreak = false;
        break;
    }

    // Notify listeners
    this.updateListeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Update listener error:', error);
      }
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Setup validation schemas
   */
  private setupValidationSchemas(): void {
    Object.entries(validationSchemas).forEach(([name, schema]) => {
      errorHandler.registerValidationSchema(name, schema);
    });
  }

  /**
   * Handle errors
   */
  private async handleError(error: Error): Promise<void> {
    try {
      await errorHandler.handleError(error, this.status.currentUser?.id);

      this.status.errorCount++;
      this.status.lastError = error.message;

      console.error('Time Tracking Engine Error:', error);

    } catch (handlerError) {
      console.error('Error handler failed:', handlerError);
    }
  }

  /**
   * Save session to storage
   */
  private async saveSession(session: TimeTrackingSession): Promise<void> {
    try {
      const sessions = JSON.parse(localStorage.getItem('hr_tracker_sessions') || '[]');
      sessions.push(session);

      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100);
      }

      localStorage.setItem('hr_tracker_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Broadcast update to listeners
   */
  private broadcastUpdate(update: RealTimeUpdate): void {
    // Notify local listeners
    this.updateListeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Update listener error:', error);
      }
    });

    // Broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('hr_time_tracker_engine');
      channel.postMessage({ type: 'ENGINE_UPDATE', update });
      channel.close();
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Get current engine status
   */
  getStatus(): EngineStatus {
    return { ...this.status };
  }

  /**
   * Get current session
   */
  getCurrentSession(): TimeTrackingSession | null {
    return this.currentSession;
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback: (update: RealTimeUpdate) => void): () => void {
    this.updateListeners.add(callback);

    return () => {
      this.updateListeners.delete(callback);
    };
  }

  /**
   * Get active time entry
   */
  getActiveEntry(): TimeEntry | null {
    return this.status.activeEntry;
  }

  /**
   * Check if user is clocked in
   */
  isClockedIn(): boolean {
    return !!this.status.activeEntry;
  }

  /**
   * Check if user is on break
   */
  isOnBreak(): boolean {
    return this.status.isOnBreak;
  }
}

// Export singleton instance
export const timeTrackingEngine = new TimeTrackingEngine();

// Export the class for testing
export { TimeTrackingEngine };