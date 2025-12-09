/**
 * VC Time Tracker - React Integration Hooks
 *
 * This file provides React hooks that make it easy to use the data integration
 * functions in React components without modifying any existing UI.
 *
 * Usage:
 * ```tsx
 * import { useTimeTracking, useLeaveManagement, useSalaryManagement } from '@/lib/react-integration';
 *
 * function MyComponent() {
 *   const { clockIn, clockOut, currentStatus } = useTimeTracking(userId);
 *   const { approveLeave, denyLeave } = useLeaveManagement();
 *   const { confirmSalaryPayment } = useSalaryManagement();
 *
 *   const handleClockIn = () => {
 *     const result = clockIn();
 *     if (result.success) {
 *       // Show success message
 *     } else {
 *       // Show error message
 *     }
 *   };
 * }
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TimeTrackingIntegration,
  handleClockIn,
  handleClockOut,
  handleStartBreak,
  handleEndBreak,
  handleLeaveAction,
  handleSalaryPaymentConfirmation,
  dataSyncManager,
  ClockInOutResult,
  BreakResult,
  LeaveActionResult,
  SalaryPaymentResult,
  DataSyncEvent,
  TimeEntry,
  LeaveRequest
} from './data-integration';

import {
  getCurrentUserId,
  getTimeEntriesForUser,
  getLeaveRequests,
  getLeaveRequestsForUser,
  getCurrentTimeEntry,
  getUsersWithStatus,
  getSalaryRecordsForEmployee,
  getCurrentMonthSalary,
  getNotifications,
  getUnreadNotificationsForUser,
  markNotificationAsRead
} from './storage';

// ==================== TIME TRACKING HOOK ====================

export interface TimeTrackingState {
  currentStatus: {
    status: string;
    text: string;
    color: string;
    dotColor: string;
    icon: string;
    isWorking: boolean;
    canClockIn: boolean;
    canClockOut: boolean;
    canTakeBreak: boolean;
    entry?: TimeEntry;
    hoursWorked?: number;
  };
  isProcessing: boolean;
  todayHours: number;
  weekHours: number;
  monthHours: number;
}

export interface TimeTrackingActions {
  clockIn: (notes?: string) => ClockInOutResult;
  clockOut: () => ClockInOutResult;
  startLunch: () => BreakResult;
  startBreak: () => BreakResult;
  endBreak: () => BreakResult;
  refreshStatus: () => void;
}

export function useTimeTracking(userId: number): TimeTrackingState & TimeTrackingActions {
  const [state, setState] = useState<TimeTrackingState>(() => {
    const currentStatus = TimeTrackingIntegration.getUserCurrentStatus(userId);
    const todayHours = calculateTodayHours(userId);
    const weekHours = calculateWeekHours(userId);
    const monthHours = calculateMonthHours(userId);

    return {
      currentStatus,
      isProcessing: false,
      todayHours,
      weekHours,
      monthHours
    };
  });

  const refreshStatus = useCallback(() => {
    const currentStatus = TimeTrackingIntegration.getUserCurrentStatus(userId);
    const todayHours = calculateTodayHours(userId);
    const weekHours = calculateWeekHours(userId);
    const monthHours = calculateMonthHours(userId);

    setState(prev => ({
      ...prev,
      currentStatus,
      todayHours,
      weekHours,
      monthHours
    }));
  }, [userId]);

  // Set up real-time sync
  useEffect(() => {
    const handleDataSync = (event: DataSyncEvent) => {
      if (
        (event.type === 'time_entry' && (!event.userId || event.userId === userId)) ||
        event.type === 'notification'
      ) {
        refreshStatus();
      }
    };

    dataSyncManager.addListener(handleDataSync);

    return () => {
      dataSyncManager.removeListener(handleDataSync);
    };
  }, [userId, refreshStatus]);

  const clockIn = useCallback((notes?: string): ClockInOutResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleClockIn(userId, notes);

      if (result.success) {
        // Broadcast the change for real-time sync
        dataSyncManager.broadcastEvent({
          type: 'time_entry',
          action: 'create',
          userId,
          data: result.timeEntry
        });
        refreshStatus();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to clock in',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshStatus]);

  const clockOut = useCallback((): ClockInOutResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleClockOut(userId);

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'time_entry',
          action: 'update',
          userId,
          data: result.timeEntry
        });
        refreshStatus();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to clock out',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshStatus]);

  const startLunch = useCallback((): BreakResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleStartBreak(userId, 'lunch');

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'time_entry',
          action: 'update',
          userId,
          data: result.timeEntry
        });
        refreshStatus();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to start lunch break',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshStatus]);

  const startBreak = useCallback((): BreakResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleStartBreak(userId, 'short');

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'time_entry',
          action: 'update',
          userId,
          data: result.timeEntry
        });
        refreshStatus();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to start break',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshStatus]);

  const endBreak = useCallback((): BreakResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleEndBreak(userId);

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'time_entry',
          action: 'update',
          userId,
          data: result.timeEntry
        });
        refreshStatus();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to end break',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshStatus]);

  return {
    ...state,
    clockIn,
    clockOut,
    startLunch,
    startBreak,
    endBreak,
    refreshStatus
  };
}

// ==================== LEAVE MANAGEMENT HOOK ====================

export interface LeaveManagementState {
  pendingRequests: Array<LeaveRequest & { employeeName?: string }>;
  userLeaveRequests: LeaveRequest[];
  isProcessing: boolean;
  leaveBalance: {
    annual: { total: number; used: number; pending: number; remaining: number };
    sick: { total: number; used: number; pending: number; remaining: number };
  };
}

export interface LeaveManagementActions {
  approveLeave: (leaveId: number, notes?: string) => LeaveActionResult;
  denyLeave: (leaveId: number, notes?: string) => LeaveActionResult;
  refreshLeaveData: () => void;
}

export function useLeaveManagement(currentUserId?: number): LeaveManagementState & LeaveManagementActions {
  const userId = currentUserId || getCurrentUserId();
  const [state, setState] = useState<LeaveManagementState>(() => ({
    pendingRequests: getPendingLeaveRequests(),
    userLeaveRequests: getLeaveRequestsForUser(userId),
    isProcessing: false,
    leaveBalance: calculateLeaveBalance(userId)
  }));

  const refreshLeaveData = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendingRequests: getPendingLeaveRequests(),
      userLeaveRequests: getLeaveRequestsForUser(userId),
      leaveBalance: calculateLeaveBalance(userId)
    }));
  }, [userId]);

  // Set up real-time sync
  useEffect(() => {
    const handleDataSync = (event: DataSyncEvent) => {
      if (
        event.type === 'leave_request' ||
        (event.type === 'notification' && event.data?.type?.includes('leave'))
      ) {
        refreshLeaveData();
      }
    };

    dataSyncManager.addListener(handleDataSync);

    return () => {
      dataSyncManager.removeListener(handleDataSync);
    };
  }, [refreshLeaveData]);

  const approveLeave = useCallback((leaveId: number, notes?: string): LeaveActionResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleLeaveAction(leaveId, 'approve', userId, notes);

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'leave_request',
          action: 'update',
          data: result.leaveRequest
        });
        refreshLeaveData();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to approve leave request',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshLeaveData]);

  const denyLeave = useCallback((leaveId: number, notes?: string): LeaveActionResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleLeaveAction(leaveId, 'deny', userId, notes);

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'leave_request',
          action: 'update',
          data: result.leaveRequest
        });
        refreshLeaveData();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to deny leave request',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshLeaveData]);

  return {
    ...state,
    approveLeave,
    denyLeave,
    refreshLeaveData
  };
}

// ==================== SALARY MANAGEMENT HOOK ====================

export interface SalaryManagementState {
  currentMonthSalary: any;
  salaryHistory: any[];
  pendingSalaries: any[];
  isProcessing: boolean;
}

export interface SalaryManagementActions {
  markAsPaid: (salaryId: string) => SalaryPaymentResult;
  confirmReceipt: (salaryId: string) => SalaryPaymentResult;
  refreshSalaryData: () => void;
}

export function useSalaryManagement(
  currentUserId?: number,
  targetEmployeeId?: number
): SalaryManagementState & SalaryManagementActions {
  const userId = currentUserId || getCurrentUserId();
  const employeeId = targetEmployeeId || userId;

  const [state, setState] = useState<SalaryManagementState>(() => ({
    currentMonthSalary: getCurrentMonthSalary(employeeId),
    salaryHistory: getSalaryHistory(employeeId),
    pendingSalaries: getPendingSalaries(),
    isProcessing: false
  }));

  const refreshSalaryData = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentMonthSalary: getCurrentMonthSalary(employeeId),
      salaryHistory: getSalaryHistory(employeeId),
      pendingSalaries: getPendingSalaries()
    }));
  }, [employeeId]);

  // Set up real-time sync
  useEffect(() => {
    const handleDataSync = (event: DataSyncEvent) => {
      if (
        event.type === 'salary_payment' ||
        (event.type === 'notification' && event.data?.type?.includes('salary'))
      ) {
        refreshSalaryData();
      }
    };

    dataSyncManager.addListener(handleDataSync);

    return () => {
      dataSyncManager.removeListener(handleDataSync);
    };
  }, [refreshSalaryData]);

  const markAsPaid = useCallback((salaryId: string): SalaryPaymentResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleSalaryPaymentConfirmation(salaryId, userId, 'mark_paid');

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'salary_payment',
          action: 'update',
          data: result.payment
        });
        refreshSalaryData();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to mark salary as paid',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshSalaryData]);

  const confirmReceipt = useCallback((salaryId: string): SalaryPaymentResult => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = handleSalaryPaymentConfirmation(salaryId, userId, 'employee_confirm');

      if (result.success) {
        dataSyncManager.broadcastEvent({
          type: 'salary_payment',
          action: 'update',
          data: result.payment
        });
        refreshSalaryData();
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      return {
        success: false,
        message: 'Failed to confirm salary receipt',
        error: [{
          field: 'system',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'SYSTEM_ERROR'
        }]
      };
    }
  }, [userId, refreshSalaryData]);

  return {
    ...state,
    markAsPaid,
    confirmReceipt,
    refreshSalaryData
  };
}

// ==================== TEAM STATUS HOOK ====================

export interface TeamStatusState {
  teamMembers: Array<{
    id: number;
    name: string;
    status: any;
    todayHours: number;
    weekHours: number;
    monthHours: number;
  }>;
  teamStats: {
    totalTodayHours: number;
    totalWeekHours: number;
    totalMonthHours: number;
    clockedInCount: number;
    onBreakCount: number;
  };
}

export function useTeamStatus(): TeamStatusState {
  const [state, setState] = useState<TeamStatusState>(() => calculateTeamStatus());

  // Set up real-time sync
  useEffect(() => {
    const handleDataSync = (event: DataSyncEvent) => {
      if (event.type === 'time_entry') {
        setState(calculateTeamStatus());
      }
    };

    dataSyncManager.addListener(handleDataSync);

    return () => {
      dataSyncManager.removeListener(handleDataSync);
    };
  }, []);

  return state;
}

// ==================== NOTIFICATIONS HOOK ====================

export interface NotificationsState {
  notifications: any[];
  unreadCount: number;
  isProcessing: boolean;
}

export interface NotificationsActions {
  markAsRead: (notificationId: number) => void;
  refreshNotifications: () => void;
}

export function useNotifications(currentUserId?: number): NotificationsState & NotificationsActions {
  const userId = currentUserId || getCurrentUserId();

  const [state, setState] = useState<NotificationsState>(() => {
    const allNotifications = getNotifications().filter(n => n.userId === userId);
    const unreadNotifications = getUnreadNotificationsForUser(userId);

    return {
      notifications: allNotifications,
      unreadCount: unreadNotifications.length,
      isProcessing: false
    };
  });

  const refreshNotifications = useCallback(() => {
    const allNotifications = getNotifications().filter(n => n.userId === userId);
    const unreadNotifications = getUnreadNotificationsForUser(userId);

    setState(prev => ({
      ...prev,
      notifications: allNotifications,
      unreadCount: unreadNotifications.length
    }));
  }, [userId]);

  // Set up real-time sync
  useEffect(() => {
    const handleDataSync = (event: DataSyncEvent) => {
      if (event.type === 'notification') {
        refreshNotifications();
      }
    };

    dataSyncManager.addListener(handleDataSync);

    return () => {
      dataSyncManager.removeListener(handleDataSync);
    };
  }, [refreshNotifications]);

  const markAsRead = useCallback((notificationId: number) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      markNotificationAsRead(notificationId);
      refreshNotifications();

      // Broadcast the change
      dataSyncManager.broadcastEvent({
        type: 'notification',
        action: 'update',
        userId
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [userId, refreshNotifications]);

  return {
    ...state,
    markAsRead,
    refreshNotifications
  };
}

// ==================== UTILITY FUNCTIONS ====================

function calculateTodayHours(userId: number): number {
  const today = new Date().toISOString().split('T')[0];
  const entries = getTimeEntriesForUser(userId);
  const todayEntry = entries.find(e => e.date === today);
  return todayEntry?.totalHours || 0;
}

function calculateWeekHours(userId: number): number {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const entries = getTimeEntriesForUser(userId);
  const weekEntries = entries.filter(e => new Date(e.date) >= weekStart);
  return weekEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
}

function calculateMonthHours(userId: number): number {
  const monthStart = new Date();
  monthStart.setDate(1);
  const entries = getTimeEntriesForUser(userId);
  const monthEntries = entries.filter(e => new Date(e.date) >= monthStart);
  return monthEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
}

function getPendingLeaveRequests(): Array<LeaveRequest & { employeeName?: string }> {
  const leaveRequests = getLeaveRequests();
  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');

  // Add employee names for display
  const { USERS } = require('./constants');
  return pendingRequests.map(request => ({
    ...request,
    employeeName: USERS.find(u => u.id === request.userId)?.firstName
  }));
}

function calculateLeaveBalance(userId: number) {
  const leaveRequests = getLeaveRequestsForUser(userId);
  const currentYear = new Date().getFullYear();

  const annualRequests = leaveRequests.filter(req =>
    req.leaveType === 'annual' && new Date(req.startDate).getFullYear() === currentYear
  );

  const sickRequests = leaveRequests.filter(req =>
    req.leaveType === 'sick' && new Date(req.startDate).getFullYear() === currentYear
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

function getSalaryHistory(employeeId: number): any[] {
  const allSalaries = getSalaryRecordsForEmployee(employeeId);
  const currentSalary = getCurrentMonthSalary(employeeId);

  return allSalaries
    .filter(salary => salary.paymentMonth !== (currentSalary?.paymentMonth || ''))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);
}

function getPendingSalaries(): any[] {
  const salaryRecords = JSON.parse(localStorage.getItem('salary_records') || '[]');
  return salaryRecords.filter((record: any) => record.status === 'pending');
}

function calculateTeamStatus(): TeamStatusState {
  const { USERS } = require('./constants');

  const teamMembers = USERS.map(user => {
    const status = TimeTrackingIntegration.getUserCurrentStatus(user.id);
    const todayHours = calculateTodayHours(user.id);
    const weekHours = calculateWeekHours(user.id);
    const monthHours = calculateMonthHours(user.id);

    return {
      id: user.id,
      name: user.firstName,
      status,
      todayHours,
      weekHours,
      monthHours
    };
  });

  const teamStats = {
    totalTodayHours: teamMembers.reduce((sum, member) => sum + member.todayHours, 0),
    totalWeekHours: teamMembers.reduce((sum, member) => sum + member.weekHours, 0),
    totalMonthHours: teamMembers.reduce((sum, member) => sum + member.monthHours, 0),
    clockedInCount: teamMembers.filter(member => member.status.isWorking).length,
    onBreakCount: teamMembers.filter(member =>
      member.status.status === 'on_lunch' || member.status.status === 'on_break'
    ).length
  };

  return { teamMembers, teamStats };
}

// ==================== EXPORT ALL HOOKS ====================
// All hooks are already exported inline above

// Export types for external use
export type {
  TimeTrackingState,
  TimeTrackingActions,
  LeaveManagementState,
  LeaveManagementActions,
  SalaryManagementState,
  SalaryManagementActions,
  TeamStatusState,
  NotificationsState,
  NotificationsActions
};