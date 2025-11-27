/**
 * Real-time Notification System
 *
 * Comprehensive toast and real-time notification management with cross-tab
 * synchronization, priority handling, and automatic cleanup.
 */

import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationRepository
} from '../../database-schema';
import { manilaTime } from '../utils/manilaTime';
import { localStorageManager } from '../storage/localStorageManager';

/**
 * Toast notification configuration
 */
export interface ToastConfig {
  duration?: number; // Auto-dismiss duration in milliseconds
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showProgress?: boolean;
  closable?: boolean;
  pauseOnHover?: boolean;
  icon?: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Notification creation options
 */
export interface CreateNotificationOptions extends ToastConfig {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  ccUserIds?: string[];
  channel?: 'toast' | 'inbox' | 'email' | 'push';
  expiresAt?: Date;
}

/**
 * Notification subscription options
 */
export interface NotificationSubscription {
  userId?: string;
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  channels?: string[];
}

/**
 * Toast notification state
 */
export interface ToastState {
  id: string;
  isVisible: boolean;
  progress: number;
  isPaused: boolean;
  createdAt: Date;
  config: ToastConfig;
}

/**
 * Custom error for notification operations
 */
class NotificationError extends Error {
  constructor(message: string, public operation: string, public notificationId?: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

/**
 * Notification Manager implementation
 */
export class NotificationManager implements NotificationRepository {
  private readonly DEFAULT_TOAST_DURATION = 5000; // 5 seconds
  private readonly MAX_NOTIFICATIONS = 100;
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  private activeToasts: Map<string, ToastState> = new Map();
  private subscribers: Map<string, Set<Function>> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupCrossTabSync();
    this.startCleanupTimer();
    this.setupVisibilityHandler();
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    // Listen for storage events
    localStorageManager.addEventListener('notificationsChanged', (notifications: Notification[]) => {
      this.notifySubscribers('notifications', notifications);
    });

    // Listen for broadcast channel messages
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('hr_time_tracker');
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CREATED') {
          this.handleCrossTabNotification(event.data.notification);
        }
      });
    }
  }

  /**
   * Handle notifications from other tabs
   */
  private handleCrossTabNotification(notification: Notification): void {
    // Skip if notification is from current tab
    if (notification.tabId === localStorageManager.getTabId()) {
      return;
    }

    // Process the notification
    if (notification.channel === 'toast') {
      this.showToast(notification);
    }

    this.notifySubscribers('notification', notification);
  }

  /**
   * Setup page visibility handler
   */
  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllToasts();
      } else {
        this.resumeAllToasts();
      }
    });
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredNotifications();
      this.cleanupCompletedToasts();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop cleanup timer
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ==================== CREATE OPERATIONS ====================

  async create(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateNotificationId(),
      createdAt: manilaTime.now(),
      updatedAt: manilaTime.now(),
      isRead: false,
      requiresSync: true,
      sessionId: `session_${Date.now()}`,
      tabId: localStorageManager.getTabId()
    };

    // Validate notification
    const validation = this.validateNotification(newNotification);
    if (!validation.isValid) {
      throw new NotificationError(
        `Validation failed: ${validation.errors.join(', ')}`,
        'create'
      );
    }

    // Add to storage
    localStorageManager.addNotification(newNotification);

    // Handle different channels
    if (newNotification.channel === 'toast') {
      this.showToast(newNotification);
    }

    // Notify subscribers
    this.notifySubscribers('notification', newNotification);

    // Broadcast to other tabs
    this.broadcastNotification(newNotification);

    return newNotification;
  }

  /**
   * Create a toast notification with simplified interface
   */
  async createToast(options: CreateNotificationOptions): Promise<Notification> {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> = {
      userId: options.userId,
      title: options.title,
      message: options.message,
      type: options.type,
      priority: options.priority,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: {
        ...options.metadata,
        toastConfig: {
          duration: options.duration,
          position: options.position,
          showProgress: options.showProgress,
          closable: options.closable,
          pauseOnHover: options.pauseOnHover,
          icon: options.icon,
          action: options.action
        }
      },
      ccUserIds: options.ccUserIds,
      channel: options.channel || 'toast',
      expiresAt: options.expiresAt
    };

    return await this.create(notification);
  }

  // ==================== READ OPERATIONS ====================

  async findById(id: string): Promise<Notification | null> {
    const notifications = localStorageManager.getNotifications();
    return notifications.find(n => n.id === id) || null;
  }

  async findByUserId(userId: string, options?: {
    unreadOnly?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    limit?: number;
  }): Promise<Notification[]> {
    let notifications = localStorageManager.getNotifications()
      .filter(n => n.userId === userId || n.ccUserIds?.includes(userId));

    if (options) {
      if (options.unreadOnly) {
        notifications = notifications.filter(n => !n.isRead);
      }

      if (options.type) {
        notifications = notifications.filter(n => n.type === options.type);
      }

      if (options.priority) {
        notifications = notifications.filter(n => n.priority === options.priority);
      }

      if (options.limit) {
        notifications = notifications.slice(0, options.limit);
      }
    }

    // Sort by creation date (newest first) and priority
    return notifications.sort((a, b) => {
      const priorityOrder = {
        [NotificationPriority.URGENT]: 4,
        [NotificationPriority.HIGH]: 3,
        [NotificationPriority.MEDIUM]: 2,
        [NotificationPriority.LOW]: 1
      };

      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findUnreadCount(userId: string): Promise<number> {
    const notifications = localStorageManager.getNotifications();
    return notifications.filter(n =>
      (n.userId === userId || n.ccUserIds?.includes(userId)) && !n.isRead
    ).length;
  }

  async findByTabId(tabId: string): Promise<Notification[]> {
    const notifications = localStorageManager.getNotifications();
    return notifications.filter(n => n.tabId === tabId);
  }

  // ==================== UPDATE OPERATIONS ====================

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findById(id);
    if (!notification) {
      throw new NotificationError('Notification not found', 'markAsRead', id);
    }

    notification.isRead = true;
    notification.readAt = manilaTime.now();
    notification.updatedAt = manilaTime.now();

    // Update in storage
    const notifications = localStorageManager.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = notification;
      localStorageManager.saveNotifications(notifications);
    }

    this.notifySubscribers('notificationUpdated', notification);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = localStorageManager.getNotifications();
    let updated = false;

    notifications.forEach(notification => {
      if ((notification.userId === userId || notification.ccUserIds?.includes(userId)) && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = manilaTime.now();
        notification.updatedAt = manilaTime.now();
        updated = true;
      }
    });

    if (updated) {
      localStorageManager.saveNotifications(notifications);
      this.notifySubscribers('allNotificationsRead', { userId });
    }
  }

  // ==================== SYNC OPERATIONS ====================

  async markForSync(ids: string[]): Promise<void> {
    const notifications = localStorageManager.getNotifications();
    let updated = false;

    notifications.forEach(notification => {
      if (ids.includes(notification.id)) {
        notification.requiresSync = true;
        updated = true;
      }
    });

    if (updated) {
      localStorageManager.saveNotifications(notifications);
    }
  }

  async clearSyncedNotifications(tabId: string): Promise<void> {
    const notifications = localStorageManager.getNotifications();
    const filtered = notifications.filter(n => n.tabId !== tabId);
    localStorageManager.saveNotifications(filtered);
  }

  // ==================== DELETE OPERATIONS ====================

  async softDelete(id: string): Promise<void> {
    const notifications = localStorageManager.getNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    localStorageManager.saveNotifications(filtered);

    // Remove from active toasts
    this.removeToast(id);

    this.notifySubscribers('notificationDeleted', { id });
  }

  async cleanupExpired(): Promise<void> {
    this.cleanupExpiredNotifications();
  }

  // ==================== TOAST MANAGEMENT ====================

  /**
   * Show a toast notification
   */
  private showToast(notification: Notification): void {
    const toastConfig = notification.metadata?.toastConfig as ToastConfig || {};
    const duration = toastConfig.duration || this.getDurationByPriority(notification.priority);

    const toastState: ToastState = {
      id: notification.id,
      isVisible: true,
      progress: 100,
      isPaused: document.hidden,
      createdAt: manilaTime.now(),
      config: {
        duration,
        position: 'top-right',
        showProgress: true,
        closable: true,
        pauseOnHover: true,
        ...toastConfig
      }
    };

    this.activeToasts.set(notification.id, toastState);

    // Start progress animation
    this.startToastProgress(notification.id, duration);

    // Notify listeners
    this.notifySubscribers('toastShown', {
      notification,
      toastState
    });
  }

  /**
   * Start toast progress animation
   */
  private startToastProgress(toastId: string, duration: number): void {
    const toastState = this.activeToasts.get(toastId);
    if (!toastState) return;

    const startTime = Date.now();
    const updateProgress = () => {
      const currentToast = this.activeToasts.get(toastId);
      if (!currentToast || currentToast.isPaused) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, 100 - (elapsed / duration) * 100);

      if (progress > 0) {
        currentToast.progress = progress;
        requestAnimationFrame(updateProgress);
      } else {
        this.removeToast(toastId);
      }
    };

    requestAnimationFrame(updateProgress);
  }

  /**
   * Remove toast notification
   */
  removeToast(toastId: string): void {
    const toastState = this.activeToasts.get(toastId);
    if (!toastState) return;

    toastState.isVisible = false;
    this.activeToasts.delete(toastId);

    // Mark notification as read
    this.markAsRead(toastId).catch(console.error);

    this.notifySubscribers('toastHidden', { toastId, toastState });
  }

  /**
   * Pause all toasts
   */
  private pauseAllToasts(): void {
    this.activeToasts.forEach(toast => {
      toast.isPaused = true;
    });
  }

  /**
   * Resume all toasts
   */
  private resumeAllToasts(): void {
    this.activeToasts.forEach((toast, id) => {
      if (toast.isPaused && toast.config.duration) {
        toast.isPaused = false;
        const elapsed = Date.now() - toast.createdAt.getTime();
        const remaining = Math.max(0, toast.config.duration - elapsed);

        if (remaining > 0) {
          this.startToastProgress(id, remaining);
        } else {
          this.removeToast(id);
        }
      }
    });
  }

  /**
   * Get duration by notification priority
   */
  private getDurationByPriority(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 0; // No auto-dismiss
      case NotificationPriority.HIGH:
        return 10000; // 10 seconds
      case NotificationPriority.MEDIUM:
        return 7000; // 7 seconds
      case NotificationPriority.LOW:
        return 4000; // 4 seconds
      default:
        return this.DEFAULT_TOAST_DURATION;
    }
  }

  /**
   * Cleanup completed toasts
   */
  private cleanupCompletedToasts(): void {
    const toRemove: string[] = [];

    this.activeToasts.forEach((toast, id) => {
      if (!toast.isVisible) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.activeToasts.delete(id));
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Subscribe to notification events
   */
  subscribe(event: string, callback: Function): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification subscriber:', error);
        }
      });
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate notification
   */
  private validateNotification(notification: Notification): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!notification.userId) {
      errors.push('User ID is required');
    }

    if (!notification.title || notification.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!notification.message || notification.message.trim().length === 0) {
      errors.push('Message is required');
    }

    if (!Object.values(NotificationType).includes(notification.type)) {
      errors.push('Invalid notification type');
    }

    if (!Object.values(NotificationPriority).includes(notification.priority)) {
      errors.push('Invalid notification priority');
    }

    if (notification.expiresAt && notification.expiresAt <= manilaTime.now()) {
      errors.push('Expiration date must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Broadcast notification to other tabs
   */
  private broadcastNotification(notification: Notification): void {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('hr_time_tracker');
      channel.postMessage({
        type: 'NOTIFICATION_CREATED',
        notification
      });
      channel.close();
    }
  }

  /**
   * Cleanup expired notifications
   */
  private cleanupExpiredNotifications(): void {
    const notifications = localStorageManager.getNotifications();
    const now = manilaTime.now();

    const filtered = notifications.filter(notification => {
      if (!notification.expiresAt) return true;
      return new Date(notification.expiresAt) > now;
    });

    if (filtered.length !== notifications.length) {
      localStorageManager.saveNotifications(filtered);
      this.notifySubscribers('notificationsCleaned', { removed: notifications.length - filtered.length });
    }
  }

  /**
   * Get active toast notifications
   */
  getActiveToasts(): Map<string, ToastState> {
    return new Map(this.activeToasts);
  }

  /**
   * Create success notification
   */
  async success(userId: string, title: string, message: string, options?: Partial<CreateNotificationOptions>): Promise<Notification> {
    return await this.createToast({
      userId,
      title,
      message,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      ...options
    });
  }

  /**
   * Create error notification
   */
  async error(userId: string, title: string, message: string, options?: Partial<CreateNotificationOptions>): Promise<Notification> {
    return await this.createToast({
      userId,
      title,
      message,
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      duration: 0, // No auto-dismiss for errors
      ...options
    });
  }

  /**
   * Create warning notification
   */
  async warning(userId: string, title: string, message: string, options?: Partial<CreateNotificationOptions>): Promise<Notification> {
    return await this.createToast({
      userId,
      title,
      message,
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      ...options
    });
  }

  /**
   * Create info notification
   */
  async info(userId: string, title: string, message: string, options?: Partial<CreateNotificationOptions>): Promise<Notification> {
    return await this.createToast({
      userId,
      title,
      message,
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
      ...options
    });
  }

  /**
   * Create time reminder notification
   */
  async timeReminder(userId: string, message: string, options?: Partial<CreateNotificationOptions>): Promise<Notification> {
    return await this.createToast({
      userId,
      title: '⏰ Time Reminder',
      message,
      type: NotificationType.TIME_REMINDER,
      priority: NotificationPriority.MEDIUM,
      icon: '⏰',
      ...options
    });
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.activeToasts.clear();
    this.subscribers.clear();
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Export the class for testing
