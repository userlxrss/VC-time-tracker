/**
 * VC Time Tracker - Complete Data Integration Layer
 *
 * This file provides complete data integration functions that connect all UI actions
 * to the existing storage system without requiring any UI modifications.
 *
 * Key Features:
 * - Clock in/out functionality with automatic time tracking
 * - Break and lunch break management
 * - Leave request approval/denial workflow
 * - Salary payment confirmation system
 * - Real-time data synchronization
 * - Comprehensive error handling and validation
 * - Notification system integration
 */

import {
  TimeEntry,
  LeaveRequest,
  SalaryPayment,
  Notification
} from './types';

import {
  getTimeEntries,
  saveTimeEntry,
  getLeaveRequests,
  saveLeaveRequest,
  getSalaryPayments,
  saveSalaryPayment,
  getNotifications,
  saveNotification,
  getCurrentUserId,
  generateId,
  addNotification,
  updateLeaveRequest as updateLeaveRequestInStorage,
  getCurrentTimeEntry,
  getTimeEntriesForUser,
  getLeaveRequestsForUser,
  getSalaryRecordsForEmployee,
  markSalaryAsPaid,
  isLateArrival,
  calculateHoursWorked,
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime
} from './storage';

import { USERS } from './constants';

// ==================== DATA VALIDATION UTILITIES ====================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

/**
 * Validates time entry data before saving
 */
export function validateTimeEntry(entry: Partial<TimeEntry>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!entry.userId || entry.userId <= 0) {
    errors.push({
      field: 'userId',
      message: 'Valid user ID is required',
      code: 'INVALID_USER_ID'
    });
  }

  if (!entry.date) {
    errors.push({
      field: 'date',
      message: 'Date is required',
      code: 'MISSING_DATE'
    });
  }

  if (entry.status && !['clocked_in', 'on_lunch', 'on_break', 'clocked_out'].includes(entry.status)) {
    errors.push({
      field: 'status',
      message: 'Invalid time entry status',
      code: 'INVALID_STATUS'
    });
  }

  if (entry.clockIn && entry.clockOut && new Date(entry.clockOut) <= new Date(entry.clockIn)) {
    errors.push({
      field: 'clockOut',
      message: 'Clock out time must be after clock in time',
      code: 'INVALID_TIME_RANGE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: entry
  };
}

/**
 * Validates leave request data
 */
export function validateLeaveRequest(request: Partial<LeaveRequest>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!request.userId || request.userId <= 0) {
    errors.push({
      field: 'userId',
      message: 'Valid user ID is required',
      code: 'INVALID_USER_ID'
    });
  }

  if (!request.leaveType || !['annual', 'sick'].includes(request.leaveType)) {
    errors.push({
      field: 'leaveType',
      message: 'Valid leave type is required',
      code: 'INVALID_LEAVE_TYPE'
    });
  }

  if (!request.startDate) {
    errors.push({
      field: 'startDate',
      message: 'Start date is required',
      code: 'MISSING_START_DATE'
    });
  }

  if (!request.endDate) {
    errors.push({
      field: 'endDate',
      message: 'End date is required',
      code: 'MISSING_END_DATE'
    });
  }

  if (request.startDate && request.endDate && new Date(request.startDate) > new Date(request.endDate)) {
    errors.push({
      field: 'dateRange',
      message: 'Start date must be before end date',
      code: 'INVALID_DATE_RANGE'
    });
  }

  if (!request.reason || request.reason.trim().length < 3) {
    errors.push({
      field: 'reason',
      message: 'Reason must be at least 3 characters long',
      code: 'INSUFFICIENT_REASON'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: request
  };
}

// ==================== CLOCK IN/CLOCK OUT INTEGRATION ====================

export interface ClockInOutResult {
  success: boolean;
  message: string;
  timeEntry?: TimeEntry;
  error?: ValidationError[];
}

/**
 * Handles clock in functionality with validation and notifications
 */
export function handleClockIn(userId: number, notes?: string): ClockInOutResult {
  try {
    // Check if user is already clocked in
    const currentEntry = getCurrentTimeEntry(userId);
    if (currentEntry) {
      return {
        success: false,
        message: 'Already clocked in',
        error: [{
          field: 'status',
          message: 'User is already clocked in',
          code: 'ALREADY_CLOCKED_IN'
        }]
      };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Create new time entry
    const newEntry: TimeEntry = {
      id: generateId(),
      userId,
      date: today,
      clockIn: now.toISOString(),
      clockOut: null,
      lunchBreakStart: null,
      lunchBreakEnd: null,
      shortBreaks: [],
      totalHours: null,
      status: 'clocked_in',
      isLate: isLateArrival(now),
      notes: notes || ''
    };

    // Validate the entry
    const validation = validateTimeEntry(newEntry);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid time entry data',
        error: validation.errors
      };
    }

    // Save the entry
    saveTimeEntry(newEntry);

    // Flexible work schedule - no late notifications needed
    // Focus on total hours worked, not start time

    return {
      success: true,
      message: `Clocked in successfully at ${formatTime(newEntry.clockIn)}`,
      timeEntry: newEntry
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to clock in. Please try again.',
      error: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SYSTEM_ERROR'
      }]
    };
  }
}

/**
 * Handles clock out functionality with automatic hour calculation
 */
export function handleClockOut(userId: number): ClockInOutResult {
  try {
    const currentEntry = getCurrentTimeEntry(userId);

    if (!currentEntry) {
      return {
        success: false,
        message: 'No active clock-in found',
        error: [{
          field: 'status',
          message: 'You must clock in before clocking out',
          code: 'NO_ACTIVE_ENTRY'
        }]
      };
    }

    const now = new Date();

    // Update the current entry
    const updatedEntry: TimeEntry = {
      ...currentEntry,
      clockOut: now.toISOString(),
      status: 'clocked_out',
      totalHours: calculateHoursWorked(
        new Date(currentEntry.clockIn),
        now,
        60, // Default lunch minutes (will be calculated from breaks)
        0   // Default break minutes (will be calculated from breaks)
      )
    };

    // Validate the updated entry
    const validation = validateTimeEntry(updatedEntry);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid time entry data',
        error: validation.errors
      };
    }

    // Save the updated entry
    saveTimeEntry(updatedEntry);

    return {
      success: true,
      message: `Clocked out successfully. Total hours: ${formatDuration(updatedEntry.totalHours || 0)}`,
      timeEntry: updatedEntry
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to clock out. Please try again.',
      error: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SYSTEM_ERROR'
      }]
    };
  }
}

// ==================== BREAK MANAGEMENT ====================

export interface BreakResult {
  success: boolean;
  message: string;
  timeEntry?: TimeEntry;
  error?: ValidationError[];
}

/**
 * Starts a break (lunch or short break)
 */
export function handleStartBreak(userId: number, breakType: 'lunch' | 'short'): BreakResult {
  try {
    const currentEntry = getCurrentTimeEntry(userId);

    if (!currentEntry || currentEntry.status !== 'clocked_in') {
      return {
        success: false,
        message: 'You must be clocked in to take a break',
        error: [{
          field: 'status',
          message: 'No active clock-in found',
          code: 'NO_ACTIVE_ENTRY'
        }]
      };
    }

    const now = new Date();
    const updatedEntry: TimeEntry = {
      ...currentEntry,
      status: breakType === 'lunch' ? 'on_lunch' : 'on_break',
      ...(breakType === 'lunch'
        ? { lunchBreakStart: now.toISOString() }
        : {
            shortBreaks: [
              ...currentEntry.shortBreaks,
              { start: now.toISOString(), end: null }
            ]
          }
      )
    };

    saveTimeEntry(updatedEntry);

    const breakTypeText = breakType === 'lunch' ? 'lunch break' : 'break';
    return {
      success: true,
      message: `Started ${breakTypeText} at ${formatTime(now)}`,
      timeEntry: updatedEntry
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to start break. Please try again.',
      error: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SYSTEM_ERROR'
      }]
    };
  }
}

/**
 * Ends a break and returns to work
 */
export function handleEndBreak(userId: number): BreakResult {
  try {
    const currentEntry = getCurrentTimeEntry(userId);

    if (!currentEntry || !['on_lunch', 'on_break'].includes(currentEntry.status)) {
      return {
        success: false,
        message: 'No active break found',
        error: [{
          field: 'status',
          message: 'You must be on a break to end it',
          code: 'NO_ACTIVE_BREAK'
        }]
      };
    }

    const now = new Date();
    const updatedEntry: TimeEntry = { ...currentEntry, status: 'clocked_in' };

    if (currentEntry.status === 'on_lunch' && currentEntry.lunchBreakStart) {
      updatedEntry.lunchBreakEnd = now.toISOString();
    } else if (currentEntry.status === 'on_break' && currentEntry.shortBreaks.length > 0) {
      // End the most recent break
      updatedEntry.shortBreaks = currentEntry.shortBreaks.map((breakItem, index) =>
        index === currentEntry.shortBreaks.length - 1
          ? { ...breakItem, end: now.toISOString() }
          : breakItem
      );
    }

    saveTimeEntry(updatedEntry);

    return {
      success: true,
      message: `Break ended at ${formatTime(now)}`,
      timeEntry: updatedEntry
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to end break. Please try again.',
      error: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SYSTEM_ERROR'
      }]
    };
  }
}

// ==================== LEAVE MANAGEMENT INTEGRATION ====================

export interface LeaveActionResult {
  success: boolean;
  message: string;
  leaveRequest?: LeaveRequest;
  error?: ValidationError[];
}

/**
 * Processes leave request approval/denial with full workflow
 */
export function handleLeaveAction(
  leaveId: number,
  action: 'approve' | 'deny',
  approvedBy: number,
  notes?: string
): LeaveActionResult {
  try {
    const leaveRequests = getLeaveRequests();
    const requestIndex = leaveRequests.findIndex(r => r.id === leaveId);

    if (requestIndex === -1) {
      return {
        success: false,
        message: 'Leave request not found',
        error: [{
          field: 'leaveId',
          message: 'The specified leave request does not exist',
          code: 'LEAVE_NOT_FOUND'
        }]
      };
    }

    const request = leaveRequests[requestIndex];

    if (request.status !== 'pending') {
      return {
        success: false,
        message: `Leave request already ${request.status}`,
        error: [{
          field: 'status',
          message: 'This leave request has already been processed',
          code: 'ALREADY_PROCESSED'
        }]
      };
    }

    // Update the leave request
    const updatedRequest: LeaveRequest = {
      ...request,
      status: action === 'approve' ? 'approved' : 'denied',
      approvedBy
    };

    // Validate the update
    const validation = validateLeaveRequest(updatedRequest);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid leave request data',
        error: validation.errors
      };
    }

    // Save the updated request
    saveLeaveRequest(updatedRequest);

    // Create notification for employee
    addNotification({
      userId: request.userId,
      type: action === 'approve' ? 'leave_approved' : 'leave_denied',
      title: `Leave Request ${action === 'approve' ? 'Approved' : 'Denied'}`,
      message: `Your leave request for ${formatDate(request.startDate)} - ${formatDate(request.endDate)} has been ${action === 'approve' ? 'approved' : 'denied'}.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: leaveId,
      relatedType: 'leave'
    });

    // Add notification notes if provided
    if (notes && notes.trim()) {
      addNotification({
        userId: request.userId,
        type: action === 'approve' ? 'leave_approved' : 'leave_denied',
        title: `Leave ${action === 'approve' ? 'Approval' : 'Denial'} Notes`,
        message: `Manager's notes: ${notes}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: leaveId,
        relatedType: 'leave'
      });
    }

    return {
      success: true,
      message: `Leave request ${action === 'approve' ? 'approved' : 'denied'} successfully`,
      leaveRequest: updatedRequest
    };

  } catch (error) {
    return {
      success: false,
      message: `Failed to ${action} leave request. Please try again.`,
      error: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SYSTEM_ERROR'
      }]
    };
  }
}

// ==================== SALARY PAYMENT INTEGRATION ====================

export interface SalaryPaymentResult {
  success: boolean;
  message: string;
  payment?: SalaryPayment;
  error?: ValidationError[];
}

/**
 * Handles salary payment confirmation with full workflow
 */
export function handleSalaryPaymentConfirmation(
  salaryId: string,
  confirmedBy: number,
  confirmationType: 'mark_paid' | 'employee_confirm'
): SalaryPaymentResult {
  try {
    // Get salary records
    const salaryRecords = JSON.parse(localStorage.getItem('salary_records') || '[]');
    const salaryIndex = salaryRecords.findIndex((r: any) => r.id === salaryId);

    if (salaryIndex === -1) {
      return {
        success: false,
        message: 'Salary record not found',
        error: [{
          field: 'salaryId',
          message: 'The specified salary record does not exist',
          code: 'SALARY_NOT_FOUND'
        }]
      };
    }

    const salary = salaryRecords[salaryIndex];

    if (confirmationType === 'mark_paid') {
      // Mark salary as paid by admin/manager
      salary.status = 'paid';
      salary.paidDate = new Date().toISOString();
      salary.paidBy = confirmedBy;
      salary.employeeNotified = true;
      salary.updatedAt = new Date().toISOString();

      // Create notification for employee
      addNotification({
        userId: salary.employeeId,
        type: 'salary_paid',
        title: 'Salary Payment Confirmation',
        message: `Your salary for ${salary.paymentMonth} (${formatCurrency(salary.amount)}) has been processed and paid.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: parseInt(salaryId.replace(/[^\d]/g, '')),
        relatedType: 'salary'
      });

      // Also create SalaryPayment record for compatibility
      const paymentRecord: SalaryPayment = {
        id: generateId(),
        userId: salary.employeeId,
        month: salary.paymentMonth,
        amount: salary.amount,
        paymentDate: salary.paidDate,
        markedPaidBy: confirmedBy,
        confirmedByEmployee: false,
        confirmedAt: null
      };

      saveSalaryPayment(paymentRecord);

    } else if (confirmationType === 'employee_confirm') {
      // Employee confirms receipt of payment
      if (salary.employeeId !== confirmedBy) {
        return {
          success: false,
          message: 'You can only confirm your own salary payments',
          error: [{
            field: 'authorization',
            message: 'Not authorized to confirm this salary payment',
            code: 'UNAUTHORIZED_CONFIRMATION'
          }]
        };
      }

      if (salary.status !== 'paid') {
        return {
          success: false,
          message: 'Salary must be marked as paid before confirmation',
          error: [{
            field: 'status',
            message: 'Payment not yet processed',
            code: 'PAYMENT_NOT_PROCESSED'
          }]
        };
      }

      // Create or update SalaryPayment record
      const existingPayments = getSalaryPayments();
      const existingPayment = existingPayments.find(p =>
        p.userId === salary.employeeId && p.month === salary.paymentMonth
      );

      const paymentRecord: SalaryPayment = {
        id: existingPayment?.id || generateId(),
        userId: salary.employeeId,
        month: salary.paymentMonth,
        amount: salary.amount,
        paymentDate: salary.paidDate || new Date().toISOString(),
        markedPaidBy: salary.paidBy || 1,
        confirmedByEmployee: true,
        confirmedAt: new Date().toISOString()
      };

      saveSalaryPayment(paymentRecord);

      // Notify managers
      const managers = USERS.filter(u => u.id === 1 || u.id === 2);
      const user = USERS.find(u => u.id === confirmedBy);

      managers.forEach(manager => {
        addNotification({
          userId: manager.id,
          type: 'salary_confirmed',
          title: 'Salary Receipt Confirmed',
          message: `${user?.firstName} has confirmed receipt of salary for ${salary.paymentMonth}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
    }

    // Save updated salary record
    salaryRecords[salaryIndex] = salary;
    localStorage.setItem('salary_records', JSON.stringify(salaryRecords));

    const actionText = confirmationType === 'mark_paid' ? 'marked as paid' : 'confirmed';
    return {
      success: true,
      message: `Salary payment ${actionText} successfully`,
      payment: salary
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to process salary payment. Please try again.',
      error: [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SYSTEM_ERROR'
      }]
    };
  }
}

// ==================== REAL-TIME DATA SYNCHRONIZATION ====================

export type DataSyncEvent = {
  type: 'time_entry' | 'leave_request' | 'salary_payment' | 'notification';
  action: 'create' | 'update' | 'delete';
  userId?: number;
  data?: any;
  timestamp: string;
};

export type DataSyncListener = (event: DataSyncEvent) => void;

class DataSyncManager {
  private listeners: DataSyncListener[] = [];
  private storageKey = 'vc_data_sync_events';

  constructor() {
    // Listen for storage events from other tabs/windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === this.storageKey && event.newValue) {
      try {
        const syncEvent: DataSyncEvent = JSON.parse(event.newValue);
        this.notifyListeners(syncEvent);
      } catch (error) {
        console.warn('Failed to parse sync event:', error);
      }
    }
  }

  private notifyListeners(event: DataSyncEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in data sync listener:', error);
      }
    });
  }

  public addListener(listener: DataSyncListener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: DataSyncListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public broadcastEvent(event: Omit<DataSyncEvent, 'timestamp'>) {
    const syncEvent: DataSyncEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Store event for cross-tab synchronization
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(syncEvent));

      // Clear the event after a short delay
      setTimeout(() => {
        localStorage.removeItem(this.storageKey);
      }, 100);
    }

    // Notify current tab
    this.notifyListeners(syncEvent);
  }
}

export const dataSyncManager = new DataSyncManager();

// ==================== COMPREHENSIVE DATA OPERATIONS ====================

/**
 * Handles all time tracking operations in a single interface
 */
export class TimeTrackingIntegration {

  /**
   * Comprehensive clock in/out/break handling
   */
  static handleTimeAction(
    userId: number,
    action: 'clock_in' | 'clock_out' | 'start_lunch' | 'start_break' | 'end_break',
    notes?: string
  ): ClockInOutResult | BreakResult {

    switch (action) {
      case 'clock_in':
        return handleClockIn(userId, notes);

      case 'clock_out':
        return handleClockOut(userId);

      case 'start_lunch':
        return handleStartBreak(userId, 'lunch');

      case 'start_break':
        return handleStartBreak(userId, 'short');

      case 'end_break':
        return handleEndBreak(userId);

      default:
        return {
          success: false,
          message: 'Unknown action',
          error: [{
            field: 'action',
            message: 'The specified action is not supported',
            code: 'UNKNOWN_ACTION'
          }]
        };
    }
  }

  /**
   * Get comprehensive user status for UI display
   */
  static getUserCurrentStatus(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const entries = getTimeEntriesForUser(userId);
    const todayEntry = entries.find(e => e.date === today);

    if (!todayEntry || todayEntry.status === 'clocked_out') {
      return {
        status: 'clocked_out',
        text: 'Clocked Out',
        color: '#737373',
        dotColor: '#D4D4D4',
        icon: '⚪',
        isWorking: false,
        canClockIn: true,
        canClockOut: false,
        canTakeBreak: false
      };
    }

    const statusConfig = {
      clocked_in: {
        status: 'clocked_in',
        text: 'Clocked In',
        color: '#22C55E',
        dotColor: '#22C55E',
        icon: '🟢',
        isWorking: true,
        canClockIn: false,
        canClockOut: true,
        canTakeBreak: true
      },
      on_lunch: {
        status: 'on_lunch',
        text: 'At Lunch',
        color: '#F59E0B',
        dotColor: '#F59E0B',
        icon: '🟡',
        isWorking: false,
        canClockIn: false,
        canClockOut: false,
        canTakeBreak: true
      },
      on_break: {
        status: 'on_break',
        text: 'On Break',
        color: '#F59E0B',
        dotColor: '#F59E0B',
        icon: '🟠',
        isWorking: false,
        canClockIn: false,
        canClockOut: false,
        canTakeBreak: true
      }
    };

    return {
      ...statusConfig[todayEntry.status as keyof typeof statusConfig],
      entry: todayEntry,
      hoursWorked: todayEntry.totalHours || 0
    };
  }

  /**
   * Get pending actions for the current user
   */
  static getPendingActions(userId: number) {
    const pendingLeaveRequests = getLeaveRequests().filter(r =>
      r.status === 'pending' && [1, 2].includes(userId) // Bosses can approve
    );

    const pendingSalaries = JSON.parse(localStorage.getItem('salary_records') || '[]')
      .filter((r: any) => r.status === 'pending' && [1, 2].includes(userId));

    return {
      leaveApprovals: pendingLeaveRequests.length,
      salaryPayments: pendingSalaries.length,
      total: pendingLeaveRequests.length + pendingSalaries.length
    };
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format duration in hours to readable format
 */
export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Show user-friendly error messages
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0].message;
  }

  return `${errors[0].message} (${errors.length - 1} more issues)`;
}

/**
 * Generic success/error result wrapper
 */
export class Result<T = any> {
  public readonly success: boolean;
  public readonly data?: T;
  public readonly error?: string;
  public readonly errors?: ValidationError[];

  constructor(success: boolean, data?: T, error?: string, errors?: ValidationError[]) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.errors = errors;
  }

  static success<T>(data: T): Result<T> {
    return new Result(true, data);
  }

  static failure(error: string, errors?: ValidationError[]): Result {
    return new Result(false, undefined, error, errors);
  }
}

// ==================== EXPORT ALL INTEGRATION FUNCTIONS ====================
// dataSyncManager is already exported inline at line 806

// Export type utilities for external use
export type {
  ClockInOutResult,
  BreakResult,
  LeaveActionResult,
  SalaryPaymentResult,
  DataSyncEvent,
  DataSyncListener
};