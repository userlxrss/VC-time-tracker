/**
 * Leave Management Notifications
 *
 * Handles workflow automation and notifications for leave requests, approvals,
 * rejections, and other leave-related events with cross-tab synchronization.
 */

import {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  User,
  Notification,
  NotificationType,
  NotificationPriority,
} from '../../../database-schema';
import { manilaTime } from '../utils/manilaTime';

export interface LeaveNotificationEvent {
  type: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'REMINDER';
  request: LeaveRequest;
  user: User;
  approver?: User;
  additionalData?: {
    rejectionReason?: string;
    daysUntilLeave?: number;
    overdrawnBalance?: boolean;
  };
}

export class LeaveNotificationManager {
  private static notificationQueue: Notification[] = [];
  private static isProcessing = false;

  /**
   * Create a notification for a leave event
   */
  static async createNotification(event: LeaveNotificationEvent): Promise<Notification> {
    const notification = this.buildNotification(event);
    this.notificationQueue.push(notification);

    // Process notifications asynchronously
    this.processQueue();

    return notification;
  }

  /**
   * Build notification based on event type
   */
  private static buildNotification(event: LeaveNotificationEvent): Notification {
    const { type, request, user, approver, additionalData } = event;
    const now = manilaTime.now();

    let title = '';
    let message = '';
    let notificationType: NotificationType = NotificationType.INFO;
    let priority: NotificationPriority = NotificationPriority.MEDIUM;
    let actionUrl = '/leave';
    let actionText = 'View Leave';

    switch (type) {
      case 'SUBMIT':
        title = `Leave Request Submitted`;
        message = `${user.firstName} ${user.lastName} has submitted a ${request.type} leave request for ${request.totalDays} day(s) from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()}.`;
        notificationType = NotificationType.LEAVE_UPDATE;
        priority = request.isEmergency ? NotificationPriority.HIGH : NotificationPriority.MEDIUM;
        actionUrl = '/leave/approvals';
        actionText = 'Review Request';
        break;

      case 'APPROVE':
        title = `Leave Request Approved`;
        message = `Your ${request.type} leave request for ${request.totalDays} day(s) from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been approved.`;
        notificationType = NotificationType.SUCCESS;
        priority = NotificationPriority.MEDIUM;
        actionUrl = '/leave/my-requests';
        actionText = 'View Request';
        break;

      case 'REJECT':
        title = `Leave Request Rejected`;
        message = `Your ${request.type} leave request for ${request.totalDays} day(s) from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been rejected.`;
        if (additionalData?.rejectionReason) {
          message += ` Reason: ${additionalData.rejectionReason}`;
        }
        notificationType = NotificationType.ERROR;
        priority = NotificationPriority.HIGH;
        actionUrl = '/leave/my-requests';
        actionText = 'View Request';
        break;

      case 'CANCEL':
        title = `Leave Request Cancelled`;
        message = `A ${request.type} leave request for ${request.totalDays} day(s) from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been cancelled.`;
        notificationType = NotificationType.LEAVE_UPDATE;
        priority = NotificationPriority.LOW;
        actionUrl = '/leave/team-requests';
        actionText = 'View Requests';
        break;

      case 'REMINDER':
        title = `Leave Reminder`;
        message = `Your ${request.type} leave is starting ${additionalData?.daysUntilLeave || 1} day(s) from now on ${request.startDate.toLocaleDateString()}.`;
        notificationType = NotificationType.TIME_REMINDER;
        priority = additionalData?.daysUntilLeave === 1 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM;
        actionUrl = '/leave/my-requests';
        actionText = 'View Request';
        break;
    }

    // Build recipient list
    const recipients = this.getRecipients(event);

    const notification: Notification = {
      id: this.generateNotificationId(),
      userId: recipients.primary,
      ccUserIds: recipients.cc,
      title,
      message,
      type: notificationType,
      priority,
      actionUrl,
      actionText,
      metadata: {
        requestId: request.id,
        leaveType: request.type,
        eventType: type,
        userId: user.id,
        approverId: approver?.id,
      },
      isRead: false,
      channel: 'toast',
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: now,
      updatedAt: now,
      requiresSync: true,
      sessionId: this.getSessionId(),
      tabId: this.getTabId(),
    };

    return notification;
  }

  /**
   * Get notification recipients based on event type
   */
  private static getRecipients(event: LeaveNotificationEvent): { primary: string; cc: string[] } {
    const { type, request, user, approver } = event;
    const cc: string[] = [];

    switch (type) {
      case 'SUBMIT':
        // Notify manager(s)
        if (approver) {
          return {
            primary: approver.id,
            cc: [user.id], // CC the employee
          };
        }
        return { primary: user.id, cc: [] };

      case 'APPROVE':
      case 'REJECT':
      case 'CANCEL':
        // Notify employee
        return {
          primary: user.id,
          cc: approver ? [approver.id] : [],
        };

      case 'REMINDER':
        // Notify employee
        return { primary: user.id, cc: [] };

      default:
        return { primary: user.id, cc: [] };
    }
  }

  /**
   * Process notification queue
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()!;
        await this.deliverNotification(notification);
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Deliver notification to different channels
   */
  private static async deliverNotification(notification: Notification): Promise<void> {
    try {
      // Store notification in localStorage for persistence
      await this.storeNotification(notification);

      // Show toast notification
      this.showToast(notification);

      // Send to other tabs for cross-tab sync
      this.syncToOtherTabs(notification);

      // Send email notification (in a real app, this would be an API call)
      await this.sendEmailNotification(notification);

    } catch (error) {
      console.error('Error delivering notification:', error);
    }
  }

  /**
   * Store notification in localStorage
   */
  private static async storeNotification(notification: Notification): Promise<void> {
    try {
      const key = 'hr_tracker_notifications';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(notification);

      // Keep only last 100 notifications
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Show toast notification
   */
  private static showToast(notification: Notification): void {
    // Create a custom toast implementation
    const toast = this.createToastElement(notification);
    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }

  /**
   * Create toast element
   */
  private static createToastElement(notification: Notification): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `
      fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50
      transform transition-all duration-300 translate-y-0 opacity-100
    `;

    const colorClasses = {
      [NotificationType.SUCCESS]: 'text-green-600',
      [NotificationType.ERROR]: 'text-red-600',
      [NotificationType.WARNING]: 'text-yellow-600',
      [NotificationType.INFO]: 'text-blue-600',
      [NotificationType.LEAVE_UPDATE]: 'text-purple-600',
      [NotificationType.TIME_REMINDER]: 'text-indigo-600',
    };

    const iconClasses = colorClasses[notification.type] || colorClasses[NotificationType.INFO];

    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="w-6 h-6 ${iconClasses} rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">!</span>
          </div>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="mt-1 text-sm text-gray-500">${notification.message}</p>
          ${notification.actionUrl ? `
            <button
              onclick="window.location.href='${notification.actionUrl}'"
              class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ${notification.actionText}
            </button>
          ` : ''}
        </div>
        <button
          onclick="this.closest('.fixed').remove()"
          class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <span class="sr-only">Close</span>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;

    return toast;
  }

  /**
   * Sync notification to other tabs
   */
  private static syncToOtherTabs(notification: Notification): void {
    try {
      const syncEvent = {
        type: 'LEAVE_NOTIFICATION',
        timestamp: new Date().toISOString(),
        data: notification,
        tabId: this.getTabId(),
      };

      localStorage.setItem('hr_tracker_sync_event', JSON.stringify(syncEvent));

      // Clean up after a short delay
      setTimeout(() => {
        localStorage.removeItem('hr_tracker_sync_event');
      }, 100);
    } catch (error) {
      console.error('Error syncing to other tabs:', error);
    }
  }

  /**
   * Send email notification (mock implementation)
   */
  private static async sendEmailNotification(notification: Notification): Promise<void> {
    // In a real application, this would make an API call to send emails
    console.log('📧 Email notification sent:', {
      to: notification.userId,
      cc: notification.ccUserIds,
      subject: notification.title,
      message: notification.message,
    });
  }

  /**
   * Trigger notifications for various leave events
   */
  static async notifyLeaveSubmitted(request: LeaveRequest, user: User, approver?: User): Promise<void> {
    await this.createNotification({
      type: 'SUBMIT',
      request,
      user,
      approver,
    });
  }

  static async notifyLeaveApproved(request: LeaveRequest, user: User, approver?: User): Promise<void> {
    await this.createNotification({
      type: 'APPROVE',
      request,
      user,
      approver,
    });
  }

  static async notifyLeaveRejected(request: LeaveRequest, user: User, approver?: User, rejectionReason?: string): Promise<void> {
    await this.createNotification({
      type: 'REJECT',
      request,
      user,
      approver,
      additionalData: { rejectionReason },
    });
  }

  static async notifyLeaveCancelled(request: LeaveRequest, user: User): Promise<void> {
    await this.createNotification({
      type: 'CANCEL',
      request,
      user,
    });
  }

  static async notifyLeaveReminder(request: LeaveRequest, user: User, daysUntilLeave: number): Promise<void> {
    await this.createNotification({
      type: 'REMINDER',
      request,
      user,
      additionalData: { daysUntilLeave },
    });
  }

  /**
   * Setup cross-tab event listeners
   */
  static setupCrossTabSync(): void {
    try {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'hr_tracker_sync_event' && e.newValue) {
          const event = JSON.parse(e.newValue);
          if (event.type === 'LEAVE_NOTIFICATION' && event.tabId !== this.getTabId()) {
            // Show notification from another tab
            this.showToast(event.data);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Error setting up cross-tab sync:', error);
    }
  }

  /**
   * Utility methods
   */
  private static generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('hr_tracker_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('hr_tracker_session_id', sessionId);
    }
    return sessionId;
  }

  private static getTabId(): string {
    let tabId = (window as any).hrTrackerTabId;
    if (!tabId) {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      (window as any).hrTrackerTabId = tabId;
    }
    return tabId;
  }

  /**
   * Check for upcoming leave and send reminders
   */
  static async checkUpcomingLeave(user: User, requests: LeaveRequest[]): Promise<void> {
    const now = manilaTime.now();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const request of requests) {
      if (request.status === LeaveStatus.APPROVED) {
        const daysUntilLeave = Math.ceil((request.startDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        // Send reminder 1 day before and on the day of leave
        if (daysUntilLeave === 1 || daysUntilLeave === 0) {
          await this.notifyLeaveReminder(request, user, Math.max(0, daysUntilLeave));
        }
      }
    }
  }
}

// Initialize cross-tab sync when module loads
if (typeof window !== 'undefined') {
  LeaveNotificationManager.setupCrossTabSync();
}