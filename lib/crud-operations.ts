import {
  TimeEntry, LeaveRequest, SalaryPayment, Notification, User
} from './types';
import {
  getTimeEntries, saveTimeEntry, getLeaveRequests, saveLeaveRequest,
  getSalaryPayments, saveSalaryPayment, getNotifications, saveNotification,
  generateId, addNotification, getSalaryRecords, saveSalaryRecord,
  SalaryRecord, getCurrentTimeEntry, getTimeEntriesForUser, getLeaveRequestsForUser,
  getSalaryRecordsForEmployee, isLateArrival, calculateHoursWorked,
  getCurrentMonthSalary, markSalaryAsPaid
} from './storage';
import { USERS, CURRENT_USER_ID } from './constants';

// ==================== TIME ENTRY CRUD ====================

export interface TimeEntryInput {
  userId: number;
  clockIn?: string;
  clockOut?: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  shortBreaks?: Array<{ start: string; end: string | null }>;
  notes?: string;
}

class TimeEntryCRUD {

  // CREATE - Clock in operations
  static clockIn(userId: number, notes?: string): TimeEntry {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if already clocked in today
    const existingEntry = getCurrentTimeEntry(userId);
    if (existingEntry) {
      throw new Error('Already clocked in today');
    }

    const timeEntry: TimeEntry = {
      id: generateId(),
      userId,
      date: today,
      clockIn: now,
      clockOut: null,
      lunchBreakStart: null,
      lunchBreakEnd: null,
      shortBreaks: [],
      totalHours: null,
      status: 'clocked_in',
      isLate: isLateArrival(new Date(now)),
      notes: notes || ''
    };

    saveTimeEntry(timeEntry);

    // Create notification for management
    if (timeEntry.isLate) {
      this.notifyLateArrival(userId, now);
    }

    return timeEntry;
  }

  // CREATE - Start lunch break
  static startLunchBreak(userId: number): TimeEntry {
    const entry = getCurrentTimeEntry(userId);
    if (!entry) {
      throw new Error('No active time entry found');
    }

    if (entry.status !== 'clocked_in') {
      throw new Error('Must be clocked in to start lunch break');
    }

    const now = new Date().toISOString();
    entry.lunchBreakStart = now;
    entry.status = 'on_lunch';

    saveTimeEntry(entry);
    return entry;
  }

  // CREATE - End lunch break
  static endLunchBreak(userId: number): TimeEntry {
    const entry = getCurrentTimeEntry(userId);
    if (!entry) {
      throw new Error('No active time entry found');
    }

    if (entry.status !== 'on_lunch') {
      throw new Error('Must be on lunch break to end lunch break');
    }

    const now = new Date().toISOString();
    entry.lunchBreakEnd = now;
    entry.status = 'clocked_in';

    saveTimeEntry(entry);
    return entry;
  }

  // CREATE - Start short break
  static startShortBreak(userId: number): TimeEntry {
    const entry = getCurrentTimeEntry(userId);
    if (!entry) {
      throw new Error('No active time entry found');
    }

    if (entry.status !== 'clocked_in') {
      throw new Error('Must be clocked in to start break');
    }

    const now = new Date().toISOString();
    entry.shortBreaks = [...entry.shortBreaks, { start: now, end: null }];
    entry.status = 'on_break';

    saveTimeEntry(entry);
    return entry;
  }

  // CREATE - End short break
  static endShortBreak(userId: number): TimeEntry {
    const entry = getCurrentTimeEntry(userId);
    if (!entry) {
      throw new Error('No active time entry found');
    }

    if (entry.status !== 'on_break') {
      throw new Error('Must be on break to end break');
    }

    const now = new Date().toISOString();
    const lastBreak = entry.shortBreaks.find(b => b.end === null);

    if (lastBreak) {
      lastBreak.end = now;
    }

    entry.status = 'clocked_in';

    saveTimeEntry(entry);
    return entry;
  }

  // READ - Get time entries for date range
  static getTimeEntriesForDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): TimeEntry[] {
    const entries = getTimeEntriesForUser(userId);
    return entries.filter(entry =>
      entry.date >= startDate && entry.date <= endDate
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // READ - Get current week entries
  static getCurrentWeekEntries(userId: number): TimeEntry[] {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return this.getTimeEntriesForDateRange(
      userId,
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0]
    );
  }

  // READ - Get current month entries
  static getCurrentMonthEntries(userId: number): TimeEntry[] {
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    return this.getTimeEntriesForDateRange(
      userId,
      monthStart.toISOString().split('T')[0],
      monthEnd.toISOString().split('T')[0]
    );
  }

  // READ - Calculate hours worked for period
  static calculateHoursForPeriod(
    userId: number,
    startDate: string,
    endDate: string
  ): { totalHours: number; totalDays: number; averageHours: number } {
    const entries = this.getTimeEntriesForDateRange(userId, startDate, endDate);
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const totalDays = entries.length;
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;

    return { totalHours, totalDays, averageHours };
  }

  // UPDATE - Clock out
  static clockOut(userId: number, notes?: string): TimeEntry {
    const entry = getCurrentTimeEntry(userId);
    if (!entry) {
      throw new Error('No active time entry found');
    }

    if (entry.status === 'clocked_out') {
      throw new Error('Already clocked out');
    }

    const now = new Date().toISOString();
    entry.clockOut = now;
    entry.status = 'clocked_out';
    entry.notes = notes || entry.notes;

    // Calculate total hours
    const clockInTime = new Date(entry.clockIn);
    const clockOutTime = new Date(now);

    // Calculate lunch break minutes
    let lunchMinutes = 0;
    if (entry.lunchBreakStart && entry.lunchBreakEnd) {
      lunchMinutes = Math.floor(
        (new Date(entry.lunchBreakEnd).getTime() - new Date(entry.lunchBreakStart).getTime())
        / (1000 * 60)
      );
    }

    // Calculate short break minutes
    let breakMinutes = 0;
    entry.shortBreaks.forEach(break_ => {
      if (break_.start && break_.end) {
        breakMinutes += Math.floor(
          (new Date(break_.end).getTime() - new Date(break_.start).getTime())
          / (1000 * 60)
        );
      }
    });

    entry.totalHours = calculateHoursWorked(clockInTime, clockOutTime, lunchMinutes, breakMinutes);

    saveTimeEntry(entry);
    return entry;
  }

  // UPDATE - Modify time entry (admin only)
  static updateTimeEntry(
    entryId: number,
    updates: Partial<TimeEntryInput>,
    updatedBy: number
  ): TimeEntry {
    const entries = getTimeEntries();
    const entryIndex = entries.findIndex(e => e.id === entryId);

    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }

    const entry = entries[entryIndex];

    // Update allowed fields
    if (updates.clockIn) entry.clockIn = updates.clockIn;
    if (updates.clockOut) entry.clockOut = updates.clockOut;
    if (updates.lunchBreakStart) entry.lunchBreakStart = updates.lunchBreakStart;
    if (updates.lunchBreakEnd) entry.lunchBreakEnd = updates.lunchBreakEnd;
    if (updates.shortBreaks) entry.shortBreaks = updates.shortBreaks;
    if (updates.notes !== undefined) entry.notes = updates.notes;

    // Recalculate total hours if clock out is provided
    if (updates.clockOut && entry.clockIn) {
      const clockInTime = new Date(entry.clockIn);
      const clockOutTime = new Date(updates.clockOut);

      let lunchMinutes = 0;
      if (entry.lunchBreakStart && entry.lunchBreakEnd) {
        lunchMinutes = Math.floor(
          (new Date(entry.lunchBreakEnd).getTime() - new Date(entry.lunchBreakStart).getTime())
          / (1000 * 60)
        );
      }

      let breakMinutes = 0;
      entry.shortBreaks.forEach(break_ => {
        if (break_.start && break_.end) {
          breakMinutes += Math.floor(
            (new Date(break_.end).getTime() - new Date(break_.start).getTime())
            / (1000 * 60)
          );
        }
      });

      entry.totalHours = calculateHoursWorked(clockInTime, clockOutTime, lunchMinutes, breakMinutes);
    }

    // Update late status
    if (entry.clockIn) {
      entry.isLate = isLateArrival(new Date(entry.clockIn));
    }

    // Update status based on current time
    if (entry.clockOut) {
      entry.status = 'clocked_out';
    } else if (entry.lunchBreakStart && !entry.lunchBreakEnd) {
      entry.status = 'on_lunch';
    } else if (entry.shortBreaks.some(b => !b.end)) {
      entry.status = 'on_break';
    } else if (entry.clockIn) {
      entry.status = 'clocked_in';
    }

    saveTimeEntry(entry);

    // Create notification for user about modification
    addNotification({
      userId: entry.userId,
      type: 'salary_paid', // Using existing type as generic notification
      title: 'Time Entry Modified',
      message: `Your time entry for ${entry.date} has been modified by admin.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return entry;
  }

  // DELETE - Remove incorrect time entry (admin only)
  static deleteTimeEntry(entryId: number, deletedBy: number): boolean {
    const entries = getTimeEntries();
    const entryIndex = entries.findIndex(e => e.id === entryId);

    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }

    const entry = entries[entryIndex];

    // Remove the entry
    entries.splice(entryIndex, 1);
    localStorage.setItem('vc_time_entries', JSON.stringify(entries));

    // Create notification for user about deletion
    addNotification({
      userId: entry.userId,
      type: 'salary_paid', // Using existing type as generic notification
      title: 'Time Entry Deleted',
      message: `Your time entry for ${entry.date} has been deleted by admin.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return true;
  }

  // Utility methods
  private static notifyLateArrival(userId: number, clockInTime: string): void {
    const managers = USERS.filter(u => u.id === 1 || u.id === 2); // Bosses
    const user = USERS.find(u => u.id === userId);

    managers.forEach(manager => {
      addNotification({
        userId: manager.id,
        type: 'leave_submitted', // Using existing type for notification
        title: 'Late Arrival',
        message: `${user?.firstName} clocked in late at ${new Date(clockInTime).toLocaleTimeString()}.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });
  }

  // Bulk operations for admin
  static bulkCreateTimeEntries(entriesData: TimeEntryInput[], createdBy: number): TimeEntry[] {
    const createdEntries: TimeEntry[] = [];

    entriesData.forEach(data => {
      try {
        const entry: TimeEntry = {
          id: generateId(),
          userId: data.userId,
          date: new Date().toISOString().split('T')[0],
          clockIn: data.clockIn || new Date().toISOString(),
          clockOut: data.clockOut || null,
          lunchBreakStart: data.lunchBreakStart || null,
          lunchBreakEnd: data.lunchBreakEnd || null,
          shortBreaks: data.shortBreaks || [],
          totalHours: null,
          status: data.clockOut ? 'clocked_out' : 'clocked_in',
          isLate: data.clockIn ? isLateArrival(new Date(data.clockIn)) : false,
          notes: data.notes || ''
        };

        // Calculate total hours if clock out is provided
        if (entry.clockOut && entry.clockIn) {
          let lunchMinutes = 0;
          if (entry.lunchBreakStart && entry.lunchBreakEnd) {
            lunchMinutes = Math.floor(
              (new Date(entry.lunchBreakEnd).getTime() - new Date(entry.lunchBreakStart).getTime())
              / (1000 * 60)
            );
          }

          let breakMinutes = 0;
          entry.shortBreaks.forEach(break_ => {
            if (break_.start && break_.end) {
              breakMinutes += Math.floor(
                (new Date(break_.end).getTime() - new Date(break_.start).getTime())
                / (1000 * 60)
              );
            }
          });

          entry.totalHours = calculateHoursWorked(
            new Date(entry.clockIn),
            new Date(entry.clockOut),
            lunchMinutes,
            breakMinutes
          );
        }

        createdEntries.push(entry);
        saveTimeEntry(entry);
      } catch (error) {
        console.error('Error creating time entry:', error);
      }
    });

    return createdEntries;
  }
}

// ==================== LEAVE MANAGEMENT CRUD ====================

export interface LeaveRequestInput {
  userId: number;
  leaveType: "annual" | "sick";
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string;
}

class LeaveManagementCRUD {

  // CREATE - Enhanced leave request submission
  static createLeaveRequest(input: LeaveRequestInput): LeaveRequest {
    const businessDays = this.calculateBusinessDays(
      new Date(input.startDate),
      new Date(input.endDate)
    );

    // Check if user is a boss (Ella or Paul)
    const isBoss = input.userId === 1 || input.userId === 2;

    const leaveRequest: LeaveRequest = {
      id: generateId(),
      userId: input.userId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      isHalfDay: input.isHalfDay,
      daysRequested: input.isHalfDay ? 0.5 : businessDays,
      reason: input.reason,
      status: isBoss ? "approved" : "pending",
      approvedBy: isBoss ? input.userId : null
    };

    saveLeaveRequest(leaveRequest);

    // Create notification for managers (only if not a boss)
    if (!isBoss) {
      this.notifyManagersOfNewLeave(leaveRequest);
    }

    return leaveRequest;
  }

  // READ - Leave balance calculations
  static calculateLeaveBalance(employeeId: number): {
    annual: { total: number; used: number; pending: number; remaining: number };
    sick: { total: number; used: number; pending: number; remaining: number };
  } {
    const leaveRequests = getLeaveRequestsForUser(employeeId);
    const currentYear = new Date().getFullYear();

    const annualRequests = leaveRequests.filter(req =>
      req.leaveType === 'annual' &&
      new Date(req.startDate).getFullYear() === currentYear
    );

    const sickRequests = leaveRequests.filter(req =>
      req.leaveType === 'sick' &&
      new Date(req.startDate).getFullYear() === currentYear
    );

    const annualUsed = annualRequests
      .filter(req => req.status === 'approved' || req.status === 'auto_approved')
      .reduce((total, req) => total + req.daysRequested, 0);

    const annualPending = annualRequests
      .filter(req => req.status === 'pending')
      .reduce((total, req) => total + req.daysRequested, 0);

    const sickUsed = sickRequests
      .filter(req => req.status === 'approved' || req.status === 'auto_approved')
      .reduce((total, req) => total + req.daysRequested, 0);

    const sickPending = sickRequests
      .filter(req => req.status === 'pending')
      .reduce((total, req) => total + req.daysRequested, 0);

    return {
      annual: {
        total: 15,
        used: annualUsed,
        pending: annualPending,
        remaining: 15 - annualUsed - annualPending
      },
      sick: {
        total: 10,
        used: sickUsed,
        pending: sickPending,
        remaining: 10 - sickUsed - sickPending
      }
    };
  }

  // READ - Leave history
  static getLeaveHistory(employeeId: number, limit?: number): LeaveRequest[] {
    const allRequests = getLeaveRequestsForUser(employeeId);
    const sorted = allRequests.sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // UPDATE - Enhanced leave approval/denial workflow
  static updateLeaveStatus(
    leaveId: number,
    status: "approved" | "denied",
    approvedBy: number,
    notes?: string
  ): boolean {
    const requests = getLeaveRequests();
    const requestIndex = requests.findIndex(r => r.id === leaveId);

    if (requestIndex === -1) return false;

    const request = requests[requestIndex];
    request.status = status;
    request.approvedBy = approvedBy;

    saveLeaveRequest(request);

    // Notify employee with detailed message
    const approveMessage = notes
      ? `Your leave request for ${request.startDate} - ${request.endDate} has been approved. Notes: ${notes}`
      : `Your leave request for ${request.startDate} - ${request.endDate} has been approved.`;

    const denyMessage = notes
      ? `Your leave request for ${request.startDate} - ${request.endDate} has been denied. Reason: ${notes}`
      : `Your leave request for ${request.startDate} - ${request.endDate} has been denied.`;

    addNotification({
      userId: request.userId,
      type: status === 'approved' ? 'leave_approved' : 'leave_denied',
      title: `Leave Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
      message: status === 'approved' ? approveMessage : denyMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: leaveId,
      relatedType: 'leave'
    });

    return true;
  }

  // UPDATE - Bulk approve/deny leave requests
  static bulkUpdateLeaveStatus(
    leaveIds: number[],
    status: "approved" | "denied",
    approvedBy: number,
    notes?: string
  ): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    leaveIds.forEach(leaveId => {
      try {
        const result = this.updateLeaveStatus(leaveId, status, approvedBy, notes);
        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    });

    return { success, failed };
  }

  // UPDATE - Auto-approve sick leave (for emergencies)
  static autoApproveSickLeave(leaveId: number): boolean {
    const requests = getLeaveRequests();
    const requestIndex = requests.findIndex(r => r.id === leaveId);

    if (requestIndex === -1) return false;

    const request = requests[requestIndex];

    if (request.leaveType !== 'sick') {
      return false;
    }

    request.status = 'auto_approved';
    request.approvedBy = null; // System approved

    saveLeaveRequest(request);

    // Notify employee
    addNotification({
      userId: request.userId,
      type: 'leave_approved',
      title: 'Sick Leave Auto-Approved',
      message: `Your sick leave request for ${request.startDate} - ${request.endDate} has been automatically approved.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: leaveId,
      relatedType: 'leave'
    });

    // Notify managers
    const managers = USERS.filter(u => u.id === 1 || u.id === 2);
    managers.forEach(manager => {
      addNotification({
        userId: manager.id,
        type: 'leave_submitted',
        title: 'Sick Leave Auto-Approved',
        message: `${USERS.find(u => u.id === request.userId)?.firstName}'s sick leave has been auto-approved for ${request.startDate} - ${request.endDate}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: leaveId,
        relatedType: 'leave'
      });
    });

    return true;
  }

  // READ - Enhanced pending requests with filtering
  static getPendingLeaveRequestsForManager(managerId: number): LeaveRequest[] {
    // For now, all bosses can see all pending requests
    if (managerId === 1 || managerId === 2) {
      return getLeaveRequests().filter(request => request.status === 'pending');
    }
    return [];
  }

  // READ - Get leave requests by date range
  static getLeaveRequestsForDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): LeaveRequest[] {
    const requests = getLeaveRequestsForUser(userId);
    return requests.filter(request =>
      request.startDate >= startDate && request.endDate <= endDate
    ).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  // READ - Get overlapping leave requests (for conflict detection)
  static getOverlappingLeaveRequests(
    userId: number,
    startDate: string,
    endDate: string,
    excludeLeaveId?: number
  ): LeaveRequest[] {
    const requests = getLeaveRequestsForUser(userId);
    return requests.filter(request => {
      if (excludeLeaveId && request.id === excludeLeaveId) return false;

      return request.status === 'approved' && (
        (request.startDate <= startDate && request.endDate >= startDate) ||
        (request.startDate <= endDate && request.endDate >= endDate) ||
        (request.startDate >= startDate && request.endDate <= endDate)
      );
    });
  }

  // DELETE - Enhanced leave cancellation
  static cancelLeaveRequest(leaveId: number, cancelledBy: number, reason?: string): boolean {
    const requests = getLeaveRequests();
    const requestIndex = requests.findIndex(r => r.id === leaveId);

    if (requestIndex === -1) return false;

    const request = requests[requestIndex];

    // Only allow cancellation if pending or if it's the user's own request
    if (request.status !== 'pending' && request.userId !== cancelledBy) {
      return false;
    }

    // Remove the request
    requests.splice(requestIndex, 1);
    localStorage.setItem('vc_leave_requests', JSON.stringify(requests));

    // Notify relevant parties
    const cancelMessage = reason
      ? `Your leave request for ${request.startDate} - ${request.endDate} has been cancelled. Reason: ${reason}`
      : `Your leave request for ${request.startDate} - ${request.endDate} has been cancelled.`;

    if (request.userId !== cancelledBy) {
      addNotification({
        userId: request.userId,
        type: 'leave_denied',
        title: 'Leave Request Cancelled',
        message: cancelMessage,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: leaveId,
        relatedType: 'leave'
      });
    }

    // If cancelled by admin, notify other managers
    if (cancelledBy === 1 || cancelledBy === 2) {
      const otherManagers = USERS.filter(u => (u.id === 1 || u.id === 2) && u.id !== cancelledBy);
      otherManagers.forEach(manager => {
        addNotification({
          userId: manager.id,
          type: 'leave_denied',
          title: 'Leave Request Cancelled',
          message: `${USERS.find(u => u.id === cancelledBy)?.firstName} cancelled ${USERS.find(u => u.id === request.userId)?.firstName}'s leave request for ${request.startDate} - ${request.endDate}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: leaveId,
          relatedType: 'leave'
        });
      });
    }

    return true;
  }

  // Helper methods
  private static calculateBusinessDays(startDate: Date, endDate: Date): number {
    let days = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  private static notifyManagersOfNewLeave(request: LeaveRequest): void {
    const managers = USERS.filter(u => u.id === 1 || u.id === 2); // Bosses

    managers.forEach(manager => {
      addNotification({
        userId: manager.id,
        type: 'leave_submitted',
        title: 'New Leave Request',
        message: `${USERS.find(u => u.id === request.userId)?.firstName} submitted a leave request for ${request.startDate} - ${request.endDate}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: request.id,
        relatedType: 'leave'
      });
    });
  }
}

// ==================== NOTIFICATION MANAGEMENT CRUD ====================

class NotificationManagementCRUD {

  // CREATE - Automatic notification generation
  static createNotification(notification: Omit<Notification, 'id'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: generateId()
    };

    saveNotification(newNotification);
    return newNotification;
  }

  // READ - Notification center
  static getNotificationsForUser(userId: number, limit?: number): Notification[] {
    const notifications = getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return limit ? notifications.slice(0, limit) : notifications;
  }

  static getUnreadCount(userId: number): number {
    return getNotifications().filter(n => n.userId === userId && !n.isRead).length;
  }

  // UPDATE - Mark as read
  static markAsRead(notificationId: number): boolean {
    const notifications = getNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.isRead = true;
      localStorage.setItem('vc_notifications', JSON.stringify(notifications));
      return true;
    }
    return false;
  }

  static markAllAsRead(userId: number): void {
    const notifications = getNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    localStorage.setItem('vc_notifications', JSON.stringify(notifications));
  }

  // DELETE - Clear old notifications
  static deleteNotification(notificationId: number): boolean {
    const notifications = getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);

    if (index !== -1) {
      notifications.splice(index, 1);
      localStorage.setItem('vc_notifications', JSON.stringify(notifications));
      return true;
    }
    return false;
  }

  static clearOldNotifications(userId: number, daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const notifications = getNotifications().filter(n => {
      if (n.userId === userId) {
        return new Date(n.createdAt) > cutoffDate;
      }
      return true;
    });

    localStorage.setItem('vc_notifications', JSON.stringify(notifications));
  }

  // UPDATE - Enhanced notification management
  static markMultipleAsRead(notificationIds: number[]): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    notificationIds.forEach(id => {
      if (this.markAsRead(id)) {
        success++;
      } else {
        failed++;
      }
    });

    return { success, failed };
  }

  // UPDATE - Archive notifications (mark as read and move to archive)
  static archiveNotification(notificationId: number): boolean {
    const notifications = getNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) return false;

    notification.isRead = true;

    // Add to archive storage
    const archived = JSON.parse(localStorage.getItem('vc_notifications_archived') || '[]');
    archived.push({
      ...notification,
      archivedAt: new Date().toISOString()
    });
    localStorage.setItem('vc_notifications_archived', JSON.stringify(archived));

    // Remove from active notifications
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications.splice(index, 1);
      localStorage.setItem('vc_notifications', JSON.stringify(notifications));
    }

    return true;
  }

  // UPDATE - Bulk archive notifications
  static archiveMultipleNotifications(notificationIds: number[]): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    notificationIds.forEach(id => {
      if (this.archiveNotification(id)) {
        success++;
      } else {
        failed++;
      }
    });

    return { success, failed };
  }

  // READ - Get archived notifications
  static getArchivedNotifications(userId: number, limit?: number): any[] {
    const archived: any[] = JSON.parse(localStorage.getItem('vc_notifications_archived') || '[]');
    const userArchived = archived
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());

    return limit ? userArchived.slice(0, limit) : userArchived;
  }

  // READ - Get notification statistics
  static getNotificationStatistics(userId: number): {
    total: number;
    unread: number;
    read: number;
    archived: number;
    thisWeek: number;
  } {
    const notifications = getNotifications().filter(n => n.userId === userId);
    const archived = this.getArchivedNotifications(userId);

    const total = notifications.length + archived.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const read = notifications.filter(n => n.isRead).length;
    const archivedCount = archived.length;

    // Notifications from this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeek = notifications.filter(n => new Date(n.createdAt) >= weekStart).length;

    return { total, unread, read, archived: archivedCount, thisWeek };
  }

  // READ - Get notifications by type
  static getNotificationsByType(userId: number, type: Notification['type']): Notification[] {
    return getNotifications()
      .filter(n => n.userId === userId && n.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // CREATE - Create system announcement (admin only)
  static createSystemAnnouncement(
    title: string,
    message: string,
    targetUsers?: number[],
    priority?: 'low' | 'medium' | 'high'
  ): Notification[] {
    const createdNotifications: Notification[] = [];
    const recipients = targetUsers || USERS.map(u => u.id);

    recipients.forEach(userId => {
      const notification = this.createNotification({
        userId,
        type: 'leave_submitted', // Using existing type for system announcements
        title: priority === 'high' ? `🔴 ${title}` : priority === 'medium' ? `🟡 ${title}` : title,
        message,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      createdNotifications.push(notification);
    });

    return createdNotifications;
  }

  // CREATE - Create scheduled notification
  static createScheduledNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt'>,
    scheduledDate: string
  ): { id: string; scheduledDate: string } {
    const scheduledNotification = {
      id: generateId().toString(),
      notificationData,
      scheduledDate,
      createdAt: new Date().toISOString()
    };

    // Store scheduled notifications
    const scheduled = JSON.parse(localStorage.getItem('vc_notifications_scheduled') || '[]');
    scheduled.push(scheduledNotification);
    localStorage.setItem('vc_notifications_scheduled', JSON.stringify(scheduled));

    return { id: scheduledNotification.id, scheduledDate };
  }

  // Utility method to process scheduled notifications
  static processScheduledNotifications(): void {
    const scheduled: any[] = JSON.parse(localStorage.getItem('vc_notifications_scheduled') || '[]');
    const now = new Date().toISOString();
    const toProcess = scheduled.filter(s => s.scheduledDate <= now);

    toProcess.forEach(scheduled => {
      this.createNotification({
        ...scheduled.notificationData,
        createdAt: now
      });
    });

    // Remove processed notifications
    const remaining = scheduled.filter(s => s.scheduledDate > now);
    localStorage.setItem('vc_notifications_scheduled', JSON.stringify(remaining));
  }

  // Utility methods for automatic notifications
  static generateLeaveNotifications(leaveRequest: LeaveRequest, action: 'created' | 'approved' | 'denied'): void {
    const user = USERS.find(u => u.id === leaveRequest.userId);
    if (!user) return;

    if (action === 'created') {
      // Notify managers
      USERS.filter(u => u.id === 1 || u.id === 2).forEach(manager => {
        this.createNotification({
          userId: manager.id,
          type: 'leave_submitted',
          title: 'New Leave Request',
          message: `${user.firstName} requested ${leaveRequest.daysRequested} day(s) of ${leaveRequest.leaveType} leave.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: leaveRequest.id,
          relatedType: 'leave'
        });
      });
    } else {
      // Notify employee
      this.createNotification({
        userId: leaveRequest.userId,
        type: action === 'approved' ? 'leave_approved' : 'leave_denied',
        title: `Leave Request ${action === 'approved' ? 'Approved' : 'Denied'}`,
        message: `Your leave request has been ${action}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: leaveRequest.id,
        relatedType: 'leave'
      });
    }
  }

  // Utility method to generate salary notifications
  static generateSalaryNotifications(payment: SalaryPayment, action: 'generated' | 'processed' | 'confirmed'): void {
    const user = USERS.find(u => u.id === payment.userId);
    if (!user) return;

    if (action === 'generated') {
      this.createNotification({
        userId: payment.userId,
        type: 'salary_paid',
        title: 'Salary Generated',
        message: `Your salary for ${payment.month} (₱${payment.amount.toLocaleString()}) has been generated.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: payment.id,
        relatedType: 'salary'
      });
    } else if (action === 'processed') {
      this.createNotification({
        userId: payment.userId,
        type: 'salary_paid',
        title: 'Salary Processed',
        message: `Your salary payment for ${payment.month} has been processed and will be credited soon.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: payment.id,
        relatedType: 'salary'
      });
    } else if (action === 'confirmed') {
      // Notify managers
      USERS.filter(u => u.id === 1 || u.id === 2).forEach(manager => {
        this.createNotification({
          userId: manager.id,
          type: 'salary_confirmed',
          title: 'Salary Confirmed',
          message: `${user.firstName} confirmed receipt of salary for ${payment.month}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: payment.id,
          relatedType: 'salary'
        });
      });
    }
  }
}

// ==================== SALARY PAYMENT CRUD ====================

export interface SalaryPaymentInput {
  userId: number;
  month: string;
  amount: number;
  paymentDate?: string;
  markedPaidBy?: number;
  notes?: string;
}

class SalaryPaymentCRUD {

  // CREATE - Generate monthly payment
  static generateMonthlyPayment(
    userId: number,
    month?: string,
    customAmount?: number,
    generatedBy?: number
  ): SalaryPayment {
    const targetMonth = month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Check if payment already exists for this month
    const existingPayments = getSalaryPaymentsForUser(userId);
    const existingPayment = existingPayments.find(p => p.month === targetMonth);

    if (existingPayment) {
      throw new Error(`Payment for ${targetMonth} already exists`);
    }

    const today = new Date().toISOString().split('T')[0];
    const payment: SalaryPayment = {
      id: generateId(),
      userId,
      month: targetMonth,
      amount: customAmount || 32444, // Default monthly salary
      paymentDate: today,
      markedPaidBy: generatedBy || 1,
      confirmedByEmployee: false,
      confirmedAt: null
    };

    saveSalaryPayment(payment);

    // Create notification for employee
    addNotification({
      userId: payment.userId,
      type: 'salary_paid',
      title: 'Salary Payment Generated',
      message: `Your salary payment for ${targetMonth} (₱${payment.amount.toLocaleString()}) has been generated.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: payment.id,
      relatedType: 'salary'
    });

    return payment;
  }

  // CREATE - Bulk generate monthly payments for all employees
  static generateMonthlyPaymentsForAllEmployees(
    month?: string,
    generatedBy?: number
  ): { success: number; failed: number; payments: SalaryPayment[] } {
    const employees = USERS.filter(u => u.id === 3); // Only employees, not bosses
    const targetMonth = month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let success = 0;
    let failed = 0;
    const payments: SalaryPayment[] = [];

    employees.forEach(employee => {
      try {
        const existingPayments = getSalaryPaymentsForUser(employee.id);
        const existingPayment = existingPayments.find(p => p.month === targetMonth);

        if (!existingPayment) {
          const payment = this.generateMonthlyPayment(employee.id, targetMonth, undefined, generatedBy);
          payments.push(payment);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    });

    return { success, failed, payments };
  }

  // CREATE - Generate bonus payment
  static generateBonusPayment(
    userId: number,
    amount: number,
    reason: string,
    generatedBy?: number
  ): SalaryPayment {
    const today = new Date().toISOString().split('T')[0];
    const bonusMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' (Bonus)';

    const payment: SalaryPayment = {
      id: generateId(),
      userId,
      month: bonusMonth,
      amount,
      paymentDate: today,
      markedPaidBy: generatedBy || 1,
      confirmedByEmployee: false,
      confirmedAt: null
    };

    saveSalaryPayment(payment);

    // Create notification for employee
    addNotification({
      userId: payment.userId,
      type: 'salary_paid',
      title: 'Bonus Payment Generated',
      message: `You've received a bonus payment of ₱${amount.toLocaleString()}. Reason: ${reason}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: payment.id,
      relatedType: 'salary'
    });

    return payment;
  }

  // READ - Get payment history
  static getPaymentHistory(userId: number, limit?: number): SalaryPayment[] {
    const payments = getSalaryPaymentsForUser(userId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    return limit ? payments.slice(0, limit) : payments;
  }

  // READ - Get payments by date range
  static getPaymentsForDateRange(
    startDate: string,
    endDate: string,
    userId?: number
  ): SalaryPayment[] {
    const payments = userId ? getSalaryPaymentsForUser(userId) : getSalaryPayments();

    return payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate).toISOString().split('T')[0];
      return paymentDate >= startDate && paymentDate <= endDate;
    }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  // READ - Get pending payments (for admin)
  static getPendingPayments(): SalaryPayment[] {
    return getSalaryPayments()
      .filter(payment => !payment.confirmedByEmployee)
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }

  // READ - Get payment statistics
  static getPaymentStatistics(userId: number): {
    totalPaid: number;
    thisYearPaid: number;
    pendingConfirmation: number;
    averageMonthly: number;
  } {
    const payments = getSalaryPaymentsForUser(userId);
    const currentYear = new Date().getFullYear();

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    const thisYearPaid = payments
      .filter(payment => new Date(payment.paymentDate).getFullYear() === currentYear)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingConfirmation = payments
      .filter(payment => !payment.confirmedByEmployee)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const averageMonthly = payments.length > 0 ? totalPaid / payments.length : 0;

    return { totalPaid, thisYearPaid, pendingConfirmation, averageMonthly };
  }

  // UPDATE - Mark as paid (admin action)
  static markAsPaid(paymentId: number, markedBy: number): boolean {
    const payments = getSalaryPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);

    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }

    const payment = payments[paymentIndex];
    payment.markedPaidBy = markedBy;
    payment.paymentDate = new Date().toISOString().split('T')[0];

    saveSalaryPayment(payment);

    // Create notification for employee
    addNotification({
      userId: payment.userId,
      type: 'salary_paid',
      title: 'Salary Payment Processed',
      message: `Your salary payment for ${payment.month} (₱${payment.amount.toLocaleString()}) has been processed.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: paymentId,
      relatedType: 'salary'
    });

    return true;
  }

  // UPDATE - Confirm by employee
  static confirmByEmployee(paymentId: number, userId: number): boolean {
    const payments = getSalaryPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId && p.userId === userId);

    if (paymentIndex === -1) {
      throw new Error('Payment not found or access denied');
    }

    const payment = payments[paymentIndex];
    payment.confirmedByEmployee = true;
    payment.confirmedAt = new Date().toISOString();

    saveSalaryPayment(payment);

    // Notify management
    const managers = USERS.filter(u => u.id === 1 || u.id === 2);
    managers.forEach(manager => {
      addNotification({
        userId: manager.id,
        type: 'salary_confirmed',
        title: 'Salary Payment Confirmed',
        message: `${USERS.find(u => u.id === userId)?.firstName} confirmed receipt of salary payment for ${payment.month}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: paymentId,
        relatedType: 'salary'
      });
    });

    return true;
  }

  // UPDATE - Update payment amount (admin only)
  static updatePaymentAmount(
    paymentId: number,
    newAmount: number,
    reason: string,
    updatedBy: number
  ): boolean {
    if (newAmount < 0) {
      throw new Error('Amount must be positive');
    }

    const payments = getSalaryPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);

    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }

    const payment = payments[paymentIndex];
    const oldAmount = payment.amount;
    payment.amount = newAmount;

    saveSalaryPayment(payment);

    // Notify employee about change
    addNotification({
      userId: payment.userId,
      type: 'salary_paid',
      title: 'Payment Amount Updated',
      message: `Your payment for ${payment.month} has been updated from ₱${oldAmount.toLocaleString()} to ₱${newAmount.toLocaleString()}. Reason: ${reason}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: paymentId,
      relatedType: 'salary'
    });

    return true;
  }

  // DELETE - Remove incorrect payment (admin only)
  static deletePayment(paymentId: number, deletedBy: number, reason: string): boolean {
    const payments = getSalaryPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);

    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }

    const payment = payments[paymentIndex];

    // Remove the payment
    payments.splice(paymentIndex, 1);
    localStorage.setItem('vc_salary_payments', JSON.stringify(payments));

    // Notify employee about deletion
    addNotification({
      userId: payment.userId,
      type: 'salary_paid',
      title: 'Payment Deleted',
      message: `Your payment for ${payment.month} (₱${payment.amount.toLocaleString()}) has been deleted. Reason: ${reason}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return true;
  }

  // Utility methods
  static getUpcomingPayments(userId?: number): SalaryPayment[] {
    const allPayments = userId ? getSalaryPaymentsForUser(userId) : getSalaryPayments();
    const today = new Date();

    return allPayments
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate > today && !payment.confirmedByEmployee;
      })
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }

  static getOverduePayments(): SalaryPayment[] {
    const today = new Date();
    today.setDate(today.getDate() - 7); // Consider overdue after 7 days

    return getSalaryPayments()
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate < today && !payment.confirmedByEmployee;
      })
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }
}

// ==================== USER PROFILE CRUD ====================

export interface UserProfileInput {
  firstName: string;
  email: string;
  role?: 'admin' | 'manager' | 'employee';
  department?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  hireDate?: string;
  salary?: number;
  isActive?: boolean;
}

class UserProfileCRUD {

  // CREATE - Add new employees (for admins)
  static createEmployee(employeeData: UserProfileInput, createdBy: number): User {
    // Validate email uniqueness
    const existingUser = USERS.find(u => u.email === employeeData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newEmployee: User = {
      id: generateId(),
      firstName: employeeData.firstName,
      email: employeeData.email
    };

    // In a real implementation, this would save to a database
    // For now, we'll use localStorage for dynamic users
    const dynamicUsers = JSON.parse(localStorage.getItem('vc_dynamic_users') || '[]');
    dynamicUsers.push(newEmployee);
    localStorage.setItem('vc_dynamic_users', JSON.stringify(dynamicUsers));

    // Notify managers about new employee
    if (createdBy !== 1 && createdBy !== 2) { // If not created by a boss
      const managers = USERS.filter(u => u.id === 1 || u.id === 2);
      managers.forEach(manager => {
        addNotification({
          userId: manager.id,
          type: 'leave_submitted', // Using existing type for notification
          title: 'New Employee Added',
          message: `${USERS.find(u => u.id === createdBy)?.firstName} added ${employeeData.firstName} as a new employee.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
    }

    return newEmployee;
  }

  // CREATE - Bulk create employees
  static bulkCreateEmployees(employeesData: UserProfileInput[], createdBy: number): { success: number; failed: number; users: User[] } {
    let success = 0;
    let failed = 0;
    const createdUsers: User[] = [];

    employeesData.forEach(data => {
      try {
        const user = this.createEmployee(data, createdBy);
        createdUsers.push(user);
        success++;
      } catch (error) {
        failed++;
      }
    });

    return { success, failed, users: createdUsers };
  }

  // READ - Get all users (including dynamic ones)
  static getAllUsers(): User[] {
    const dynamicUsers: User[] = JSON.parse(localStorage.getItem('vc_dynamic_users') || '[]');
    return [...USERS, ...dynamicUsers];
  }

  // READ - User details and search
  static getUserById(userId: number): User | null {
    const allUsers = this.getAllUsers();
    return allUsers.find(u => u.id === userId) || null;
  }

  static searchUsers(query: string): User[] {
    const allUsers = this.getAllUsers();
    return allUsers.filter(user =>
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  }

  // READ - Get users by role (simulated role system)
  static getUsersByRole(role: 'admin' | 'manager' | 'employee'): User[] {
    const allUsers = this.getAllUsers();

    if (role === 'admin') {
      return allUsers.filter(u => u.id === 1); // Ella as admin
    } else if (role === 'manager') {
      return allUsers.filter(u => u.id === 2); // Paul as manager
    } else {
      return allUsers.filter(u => u.id === 3 || u.id > 3); // Employees
    }
  }

  // READ - Get active users (simulated with activity check)
  static getActiveUsers(): User[] {
    const allUsers = this.getAllUsers();
    const activeUsers: User[] = [];

    allUsers.forEach(user => {
      const entries = getTimeEntriesForUser(user.id);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(e => e.date === today);

      if (todayEntry && ['clocked_in', 'on_lunch', 'on_break'].includes(todayEntry.status)) {
        activeUsers.push(user);
      }
    });

    return activeUsers;
  }

  // READ - Get user statistics
  static getUserStatistics(userId: number): {
    totalHours: number;
    thisWeekHours: number;
    thisMonthHours: number;
    leaveBalance: any;
    notificationsCount: number;
  } {
    const entries = getTimeEntriesForUser(userId);
    const notifications = getNotifications().filter(n => n.userId === userId);

    // Calculate hours
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekEntries = entries.filter(e => new Date(e.date) >= weekStart);
    const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    const thisMonthEntries = entries.filter(e => new Date(e.date) >= monthStart);
    const thisMonthHours = thisMonthEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    // Get leave balance (using existing LeaveManagementCRUD)
    const leaveBalance = null; // Would integrate with LeaveManagementCRUD

    return {
      totalHours,
      thisWeekHours,
      thisMonthHours,
      leaveBalance,
      notificationsCount: notifications.length
    };
  }

  // UPDATE - Edit user profiles
  static updateUserProfile(userId: number, updates: Partial<UserProfileInput>, updatedBy: number): boolean {
    const dynamicUsers: User[] = JSON.parse(localStorage.getItem('vc_dynamic_users') || '[]');
    const userIndex = dynamicUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found or cannot be modified');
    }

    const user = dynamicUsers[userIndex];

    // Update allowed fields
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.email) {
      // Check email uniqueness if changing email
      if (updates.email !== user.email) {
        const existingUser = this.getAllUsers().find(u => u.email === updates.email);
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }
      user.email = updates.email;
    }

    dynamicUsers[userIndex] = user;
    localStorage.setItem('vc_dynamic_users', JSON.stringify(dynamicUsers));

    // Create notification for user about profile update
    if (userId !== updatedBy) {
      addNotification({
        userId,
        type: 'salary_paid', // Using existing type for notification
        title: 'Profile Updated',
        message: `Your profile has been updated by admin.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return true;
  }

  // UPDATE - Update user role (admin only)
  static updateUserRole(userId: number, newRole: 'admin' | 'manager' | 'employee', updatedBy: number): boolean {
    // In a real implementation with proper role system
    console.log(`Updating user ${userId} role to: ${newRole} by ${updatedBy}`);

    // Notify user about role change
    addNotification({
      userId,
      type: 'salary_paid', // Using existing type for notification
      title: 'Role Updated',
      message: `Your role has been updated to ${newRole}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return true;
  }

  // UPDATE - Reset user password (admin only)
  static resetUserPassword(userId: number, updatedBy: number): { tempPassword: string } {
    const tempPassword = Math.random().toString(36).slice(-8);

    // Notify user about password reset
    addNotification({
      userId,
      type: 'salary_paid', // Using existing type for notification
      title: 'Password Reset',
      message: `Your password has been reset. Temporary password: ${tempPassword}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return { tempPassword };
  }

  // DELETE - Deactivate users (admin only)
  static deactivateUser(userId: number, deactivatedBy: number, reason?: string): boolean {
    // Can't deactivate primary users
    if (userId <= 3) {
      throw new Error('Cannot deactivate primary users');
    }

    const dynamicUsers: User[] = JSON.parse(localStorage.getItem('vc_dynamic_users') || '[]');
    const userIndex = dynamicUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = dynamicUsers[userIndex];

    // Remove user from active list
    dynamicUsers.splice(userIndex, 1);
    localStorage.setItem('vc_dynamic_users', JSON.stringify(dynamicUsers));

    // Add to deactivated users archive
    const deactivatedUsers = JSON.parse(localStorage.getItem('vc_deactivated_users') || '[]');
    deactivatedUsers.push({
      ...user,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy,
      reason: reason || 'Administrative action'
    });
    localStorage.setItem('vc_deactivated_users', JSON.stringify(deactivatedUsers));

    // Notify user about deactivation
    addNotification({
      userId,
      type: 'salary_paid', // Using existing type for notification
      title: 'Account Deactivated',
      message: `Your account has been deactivated. Reason: ${reason || 'Administrative action'}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return true;
  }

  // DELETE - Bulk deactivate users
  static bulkDeactivateUsers(userIds: number[], deactivatedBy: number, reason?: string): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    userIds.forEach(userId => {
      try {
        if (this.deactivateUser(userId, deactivatedBy, reason)) {
          success++;
        }
      } catch (error) {
        failed++;
      }
    });

    return { success, failed };
  }

  // Utility methods
  static getDeactivatedUsers(): any[] {
    return JSON.parse(localStorage.getItem('vc_deactivated_users') || '[]');
  }

  static reactivateUser(userId: number, reactivatedBy: number): boolean {
    const deactivatedUsers = JSON.parse(localStorage.getItem('vc_deactivated_users') || '[]');
    const userIndex = deactivatedUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found in deactivated list');
    }

    const user = deactivatedUsers[userIndex];

    // Remove from deactivated list
    deactivatedUsers.splice(userIndex, 1);
    localStorage.setItem('vc_deactivated_users', JSON.stringify(deactivatedUsers));

    // Add back to active users
    const activeUser = {
      id: user.id,
      firstName: user.firstName,
      email: user.email
    };

    const dynamicUsers = JSON.parse(localStorage.getItem('vc_dynamic_users') || '[]');
    dynamicUsers.push(activeUser);
    localStorage.setItem('vc_dynamic_users', JSON.stringify(dynamicUsers));

    // Notify user about reactivation
    addNotification({
      userId,
      type: 'salary_paid', // Using existing type for notification
      title: 'Account Reactivated',
      message: 'Your account has been reactivated.',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return true;
  }
}

// ==================== REPORT MANAGEMENT CRUD ====================

export interface ReportInput {
  type: 'timesheet' | 'leave' | 'salary' | 'attendance' | 'performance';
  userId?: number;
  dateRange: { start: string; end: string };
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, any>;
}

export interface Report {
  id: string;
  type: string;
  userId?: number;
  title: string;
  generatedBy: number;
  dateRange: { start: string; end: string };
  format: string;
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

class ReportManagementCRUD {

  // CREATE - Generate various report types
  static generateReport(input: ReportInput, generatedBy: number): Report {
    const report: Report = {
      id: `report_${generateId()}`,
      type: input.type,
      userId: input.userId,
      title: this.generateReportTitle(input),
      generatedBy,
      dateRange: input.dateRange,
      format: input.format,
      status: 'generating',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    // Save report to storage
    const reports = this.getReports();
    reports.push(report);
    localStorage.setItem('vc_reports', JSON.stringify(reports));

    // Simulate report generation
    setTimeout(() => {
      this.completeReportGeneration(report.id);
    }, 2000);

    return report;
  }

  // READ - Report history
  static getReports(userId?: number): Report[] {
    const reports: Report[] = JSON.parse(localStorage.getItem('vc_reports') || '[]');
    const filtered = userId ? reports.filter(r => r.userId === userId) : reports;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getReportById(reportId: string): Report | null {
    const reports = this.getReports();
    return reports.find(r => r.id === reportId) || null;
  }

  // UPDATE - Modify report parameters
  static updateReport(reportId: string, updates: Partial<Report>): boolean {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === reportId);

    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates };
      localStorage.setItem('vc_reports', JSON.stringify(reports));
      return true;
    }
    return false;
  }

  // DELETE - Remove old reports
  static deleteReport(reportId: string): boolean {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === reportId);

    if (index !== -1) {
      reports.splice(index, 1);
      localStorage.setItem('vc_reports', JSON.stringify(reports));
      return true;
    }
    return false;
  }

  static cleanupExpiredReports(): void {
    const now = new Date();
    const reports = this.getReports().filter(report => {
      if (report.expiresAt) {
        return new Date(report.expiresAt) > now;
      }
      return true;
    });
    localStorage.setItem('vc_reports', JSON.stringify(reports));
  }

  // Helper methods
  private static generateReportTitle(input: ReportInput): string {
    const typeLabels = {
      timesheet: 'Timesheet Report',
      leave: 'Leave Report',
      salary: 'Salary Report',
      attendance: 'Attendance Report',
      performance: 'Performance Report'
    };

    const baseTitle = typeLabels[input.type] || 'Report';
    const userName = input.userId ? USERS.find(u => u.id === input.userId)?.firstName : 'All Users';

    return `${baseTitle} - ${userName} (${input.dateRange.start} to ${input.dateRange.end})`;
  }

  private static completeReportGeneration(reportId: string): void {
    this.updateReport(reportId, {
      status: 'ready',
      downloadUrl: `/api/reports/download/${reportId}`
    });
  }
}

// ==================== SETTINGS MANAGEMENT CRUD ====================

export interface Setting {
  id: string;
  key: string;
  value: any;
  category: 'working_hours' | 'holidays' | 'salary' | 'notifications' | 'general';
  description?: string;
  updatedBy: number;
  updatedAt: string;
}

class SettingsManagementCRUD {

  // CREATE - Add new settings
  static createSetting(
    key: string,
    value: any,
    category: Setting['category'],
    description?: string,
    updatedBy: number = 1
  ): Setting {
    const setting: Setting = {
      id: `setting_${generateId()}`,
      key,
      value,
      category,
      description,
      updatedBy,
      updatedAt: new Date().toISOString()
    };

    const settings = this.getSettings();
    settings.push(setting);
    localStorage.setItem('vc_settings', JSON.stringify(settings));

    return setting;
  }

  // READ - Current settings
  static getSettings(category?: Setting['category']): Setting[] {
    const settings: Setting[] = JSON.parse(localStorage.getItem('vc_settings') || '[]');
    return category ? settings.filter(s => s.category === category) : settings;
  }

  static getSettingByKey(key: string): Setting | null {
    const settings = this.getSettings();
    return settings.find(s => s.key === key) || null;
  }

  static getWorkingHoursSettings(): { startHour: number; endHour: number; lunchBreakMinutes: number } {
    const startSetting = this.getSettingByKey('working_hours_start');
    const endSetting = this.getSettingByKey('working_hours_end');
    const lunchSetting = this.getSettingByKey('lunch_break_minutes');

    return {
      startHour: startSetting?.value || 9,
      endHour: endSetting?.value || 18,
      lunchBreakMinutes: lunchSetting?.value || 60
    };
  }

  static getHolidays(): Array<{ date: string; name: string; type: 'regular' | 'special' }> {
    const holidaysSetting = this.getSettingByKey('company_holidays');
    return holidaysSetting?.value || [];
  }

  // UPDATE - Modify settings
  static updateSetting(key: string, value: any, updatedBy: number): boolean {
    const settings = this.getSettings();
    const index = settings.findIndex(s => s.key === key);

    if (index !== -1) {
      settings[index].value = value;
      settings[index].updatedBy = updatedBy;
      settings[index].updatedAt = new Date().toISOString();
      localStorage.setItem('vc_settings', JSON.stringify(settings));
      return true;
    }
    return false;
  }

  static updateWorkingHours(startHour: number, endHour: number, lunchMinutes: number, updatedBy: number): void {
    this.updateSetting('working_hours_start', startHour, updatedBy);
    this.updateSetting('working_hours_end', endHour, updatedBy);
    this.updateSetting('lunch_break_minutes', lunchMinutes, updatedBy);
  }

  static updateSalaryRates(monthlySalary: number, updatedBy: number): void {
    this.updateSetting('monthly_salary', monthlySalary, updatedBy);
  }

  static addHoliday(date: string, name: string, type: 'regular' | 'special' = 'regular', updatedBy: number): void {
    const holidays = this.getHolidays();
    holidays.push({ date, name, type });
    this.updateSetting('company_holidays', holidays, updatedBy);
  }

  // DELETE - Remove deprecated settings
  static deleteSetting(key: string): boolean {
    const settings = this.getSettings();
    const index = settings.findIndex(s => s.key === key);

    if (index !== -1) {
      settings.splice(index, 1);
      localStorage.setItem('vc_settings', JSON.stringify(settings));
      return true;
    }
    return false;
  }

  static removeHoliday(date: string, updatedBy: number): void {
    const holidays = this.getHolidays().filter(h => h.date !== date);
    this.updateSetting('company_holidays', holidays, updatedBy);
  }
}

// ==================== UTILITY FUNCTIONS ====================

export function confirmAction(message: string): boolean {
  return window.confirm(message);
}

export function showSuccessMessage(message: string): void {
  // In a real app, this would show a toast notification
  console.log('SUCCESS:', message);
  alert(message);
}

export function showErrorMessage(message: string): void {
  // In a real app, this would show an error toast
  console.error('ERROR:', message);
  alert(message);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  return new Date(startDate) <= new Date(endDate);
}

// Export all CRUD classes
export {
  TimeEntryCRUD,
  LeaveManagementCRUD,
  NotificationManagementCRUD,
  SalaryPaymentCRUD,
  UserProfileCRUD,
  ReportManagementCRUD,
  SettingsManagementCRUD
};

// Export types for external use
export type {
  TimeEntryInput,
  LeaveRequestInput,
  SalaryPaymentInput,
  UserProfileInput
};