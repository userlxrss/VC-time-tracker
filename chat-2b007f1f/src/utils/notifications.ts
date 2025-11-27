/**
 * Eye care reminder and forgot clock out reminder logic
 */

import { NotificationSettings, TimeEntry } from '../types';

/**
 * Eye care reminder manager
 */
export class EyeCareReminder {
  private intervalId: NodeJS.Timeout | null = null;
  private settings: NotificationSettings['eyeCareReminder'];
  private lastNotificationTime: number = 0;

  constructor(settings: NotificationSettings['eyeCareReminder']) {
    this.settings = settings;
  }

  /**
   * Start eye care reminders
   */
  start(settings?: NotificationSettings['eyeCareReminder']): void {
    if (settings) {
      this.settings = settings;
    }

    if (!this.settings.enabled || this.settings.interval <= 0) {
      this.stop();
      return;
    }

    // Stop existing interval if running
    this.stop();

    // Calculate initial delay (time since last reminder)
    const now = Date.now();
    const timeSinceLastReminder = this.settings.lastReminder
      ? now - new Date(this.settings.lastReminder).getTime()
      : 0;

    const intervalMs = this.settings.interval * 60 * 1000; // Convert minutes to milliseconds
    const initialDelay = Math.max(0, intervalMs - timeSinceLastReminder);

    // Set up recurring reminders
    this.intervalId = setInterval(() => {
      this.showEyeCareReminder();
    }, intervalMs);

    // Show immediate reminder if it's time
    if (timeSinceLastReminder >= intervalMs) {
      setTimeout(() => {
        this.showEyeCareReminder();
      }, 1000);
    }
  }

  /**
   * Stop eye care reminders
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Show eye care reminder notification
   */
  private showEyeCareReminder(): void {
    const now = Date.now();

    // Prevent spamming notifications
    if (now - this.lastNotificationTime < 30000) { // 30 seconds minimum between notifications
      return;
    }

    this.lastNotificationTime = now;

    // Request notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Eye Care Reminder', {
        body: 'Time to rest your eyes! Look at something 20 feet away for 20 seconds.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'eye-care-reminder',
        requireInteraction: false,
        actions: [
          {
            action: 'dismiss',
            title: 'Dismiss'
          },
          {
            action: 'snooze',
            title: 'Snooze 5 min'
          }
        ]
      });

      // Handle notification actions
      notification.onclick = () => {
        notification.close();
        window.focus();
      };

      setTimeout(() => {
        notification.close();
      }, 10000); // Auto-close after 10 seconds
    }

    // Play sound (optional)
    this.playNotificationSound();

    // Update last reminder time
    this.updateLastReminderTime();

    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('eyeCareReminder', {
      detail: {
        timestamp: new Date(),
        message: 'Time to rest your eyes!'
      }
    }));
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC6Gy+3ZiTYFG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (common in browsers)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  /**
   * Update last reminder time in storage
   */
  private updateLastReminderTime(): void {
    try {
      // This would be handled by the main app state
      this.settings.lastReminder = new Date();
    } catch (error) {
      console.error('Error updating last reminder time:', error);
    }
  }

  /**
   * Get next reminder time
   */
  getNextReminderTime(): Date | null {
    if (!this.settings.enabled || this.settings.interval <= 0) {
      return null;
    }

    const lastReminder = this.settings.lastReminder || new Date();
    const nextReminder = new Date(lastReminder.getTime() + (this.settings.interval * 60 * 1000));
    return nextReminder;
  }
}

/**
 * Forgot clock out reminder manager
 */
export class ForgotClockOutReminder {
  private intervalId: NodeJS.Timeout | null = null;
  private settings: NotificationSettings['forgotClockOut'];
  private lastCheckTime: number = 0;

  constructor(settings: NotificationSettings['forgotClockOut']) {
    this.settings = settings;
  }

  /**
   * Start forgot clock out reminders
   */
  start(settings?: NotificationSettings['forgotClockOut']): void {
    if (settings) {
      this.settings = settings;
    }

    if (!this.settings.enabled || this.settings.delay <= 0) {
      this.stop();
      return;
    }

    // Stop existing interval if running
    this.stop();

    // Check every minute
    this.intervalId = setInterval(() => {
      this.checkForgottenClockOut();
    }, 60000); // Check every minute
  }

  /**
   * Stop forgot clock out reminders
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if user forgot to clock out
   */
  private checkForgottenClockOut(): void {
    const now = Date.now();

    // Prevent spamming checks
    if (now - this.lastCheckTime < 30000) { // 30 seconds minimum between checks
      return;
    }

    this.lastCheckTime = now;

    try {
      // Get current time entry from localStorage
      const currentTimeEntryStr = localStorage.getItem('vct_current_time_entry');
      if (!currentTimeEntryStr) return;

      const currentTimeEntry: TimeEntry = JSON.parse(currentTimeEntryStr);
      const clockInTime = new Date(currentTimeEntry.clockIn);
      const timeSinceClockIn = now - clockInTime.getTime();

      const delayMs = this.settings.delay * 60 * 1000; // Convert minutes to milliseconds

      // Check if user has been clocked in for longer than the delay
      if (timeSinceClockIn > delayMs) {
        // Check if we've already reminded recently
        const lastReminder = this.settings.lastCheck;
        const timeSinceLastReminder = lastReminder
          ? now - new Date(lastReminder).getTime()
          : 0;

        // Only remind if it's been at least 2 hours since last reminder
        const minReminderInterval = 2 * 60 * 60 * 1000; // 2 hours
        if (timeSinceLastReminder >= minReminderInterval) {
          this.showForgotClockOutReminder(currentTimeEntry, clockInTime);
        }
      }
    } catch (error) {
      console.error('Error checking for forgotten clock out:', error);
    }
  }

  /**
   * Show forgot clock out reminder
   */
  private showForgotClockOutReminder(timeEntry: TimeEntry, clockInTime: Date): void {
    const hoursWorked = Math.round((Date.now() - clockInTime.getTime()) / (1000 * 60 * 60));

    // Request notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Forgot to Clock Out?', {
        body: `You've been working for ${hoursWorked} hour${hoursWorked !== 1 ? 's' : ''}. Don't forget to clock out!`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'forgot-clock-out-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'clock-out',
            title: 'Clock Out Now'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      // Handle notification actions
      notification.onclick = () => {
        notification.close();
        window.focus();
      };

      // Handle specific actions
      notification.onshow = () => {
        // This would be handled by the main app component
        window.dispatchEvent(new CustomEvent('forgotClockOutReminder', {
          detail: {
            timeEntry,
            hoursWorked,
            timestamp: new Date()
          }
        }));
      };
    }

    // Play sound
    this.playNotificationSound();

    // Update last check time
    this.updateLastCheckTime();
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC6Gy+3ZiTYFG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  /**
   * Update last check time in storage
   */
  private updateLastCheckTime(): void {
    try {
      // This would be handled by the main app state
      this.settings.lastCheck = new Date();
    } catch (error) {
      console.error('Error updating last check time:', error);
    }
  }
}

/**
 * Combined notification manager
 */
export class NotificationManager {
  private eyeCareReminder: EyeCareReminder;
  private forgotClockOutReminder: ForgotClockOutReminder;
  private settings: NotificationSettings;

  constructor(settings: NotificationSettings) {
    this.settings = settings;
    this.eyeCareReminder = new EyeCareReminder(settings.eyeCareReminder);
    this.forgotClockOutReminder = new ForgotClockOutReminder(settings.forgotClockOutReminder);
  }

  /**
   * Start all notifications
   */
  start(settings?: NotificationSettings): void {
    if (settings) {
      this.settings = settings;
      this.eyeCareReminder = new EyeCareReminder(settings.eyeCareReminder);
      this.forgotClockOutReminder = new ForgotClockOutReminder(settings.forgotClockOutReminder);
    }

    this.eyeCareReminder.start();
    this.forgotClockOutReminder.start();
  }

  /**
   * Stop all notifications
   */
  stop(): void {
    this.eyeCareReminder.stop();
    this.forgotClockOutReminder.stop();
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };

    if (settings.eyeCareReminder) {
      this.eyeCareReminder.start(settings.eyeCareReminder);
    }

    if (settings.forgotClockOut) {
      this.forgotClockOutReminder.start(settings.forgotClockOut);
    }
  }

  /**
   * Get next eye care reminder time
   */
  getNextEyeCareReminder(): Date | null {
    return this.eyeCareReminder.getNextReminderTime();
  }

  /**
   * Check notification permissions
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are enabled and permitted
   */
  areNotificationsEnabled(): boolean {
    return (
      this.settings.eyeCareReminder.enabled ||
      this.settings.forgotClockOut.enabled
    ) && 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
  }
}

/**
 * Create notification manager instance
 */
export function createNotificationManager(settings: NotificationSettings): NotificationManager {
  return new NotificationManager(settings);
}

/**
 * Utility function to show a one-time notification
 */
export function showNotification(
  title: string,
  body: string,
  options?: NotificationOptions
): Promise<void> {
  return new Promise((resolve) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      resolve();
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      notification.close();
      window.focus();
      resolve();
    };

    setTimeout(() => {
      notification.close();
      resolve();
    }, 5000); // Auto-close after 5 seconds
  });
}