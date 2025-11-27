// Production-ready hooks for HR Time Tracker
// Based on patterns from enterprise applications and production repositories

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeEntry, LeaveRequest, PaymentRecord, User, UserRole, ExportConfig } from '../types';
import { storageService, userPreferences, draftTimeEntry } from '../utils/storage';
import { rbac, usePermission } from '../utils/rbac';
import { ExportService } from '../utils/export';

/**
 * Time Entry Management Hook
 * Based on time tracking patterns from Clockify and Toggl
 */
export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load time entries from storage/API
  const loadTimeEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would be an API call
      const stored = storageService.get('TIME_ENTRIES', []);
      setTimeEntries(stored);
    } catch (err) {
      setError('Failed to load time entries');
      console.error('Error loading time entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start timer for new entry
  const startTimer = useCallback((description: string, projectId?: string) => {
    if (isTimerRunning) {
      stopTimer();
    }

    const entry: Partial<TimeEntry> = {
      description,
      projectId,
      start: new Date(),
      billable: true,
      userId: rbac.getCurrentUser()?.id
    };

    setCurrentEntry(entry);
    setIsTimerRunning(true);

    // Auto-save draft
    draftTimeEntry.saveDraft(entry);
    draftTimeEntry.startAutoSave(entry);

    // Start timer updates
    timerRef.current = setInterval(() => {
      if (entry.start) {
        const duration = Math.floor((Date.now() - entry.start.getTime()) / 1000 / 60);
        setCurrentEntry(prev => prev ? { ...prev, duration } : null);
      }
    }, 1000);
  }, [isTimerRunning]);

  // Stop current timer
  const stopTimer = useCallback(() => {
    if (currentEntry && currentEntry.start) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentEntry.start.getTime()) / 1000 / 60);

      const completedEntry: TimeEntry = {
        id: `entry_${Date.now()}`,
        description: currentEntry.description || '',
        billable: currentEntry.billable || false,
        start: currentEntry.start,
        end: endTime,
        duration,
        userId: currentEntry.userId || rbac.getCurrentUser()?.id || '',
        created: new Date(),
        updated: new Date(),
        projectId: currentEntry.projectId
      };

      setTimeEntries(prev => [...prev, completedEntry]);
      storageService.set('TIME_ENTRIES', [...timeEntries, completedEntry]);
    }

    // Clean up
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCurrentEntry(null);
    setIsTimerRunning(false);
    draftTimeEntry.clearDraft();
    draftTimeEntry.stopAutoSave();
  }, [currentEntry, timeEntries]);

  // Manual time entry creation
  const createTimeEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'created' | 'updated'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: `entry_${Date.now()}`,
      created: new Date(),
      updated: new Date()
    };

    setTimeEntries(prev => [...prev, newEntry]);
    storageService.set('TIME_ENTRIES', [...timeEntries, newEntry]);
    return newEntry;
  }, [timeEntries]);

  // Update time entry
  const updateTimeEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(prev => prev.map(entry =>
      entry.id === id
        ? { ...entry, ...updates, updated: new Date() }
        : entry
    ));

    const updated = timeEntries.map(entry =>
      entry.id === id
        ? { ...entry, ...updates, updated: new Date() }
        : entry
    );
    storageService.set('TIME_ENTRIES', updated);
  }, [timeEntries]);

  // Delete time entry
  const deleteTimeEntry = useCallback((id: string) => {
    if (!rbac.hasPermission('time_entries' as any, 'delete' as any)) {
      throw new Error('Permission denied');
    }

    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    const filtered = timeEntries.filter(entry => entry.id !== id);
    storageService.set('TIME_ENTRIES', filtered);
  }, [timeEntries]);

  // Load draft on mount
  useEffect(() => {
    const draft = draftTimeEntry.getDraft();
    if (draft && draft.start && !draft.end) {
      setCurrentEntry(draft);
      setIsTimerRunning(true);
      // Resume timer if draft is recent
      const age = Date.now() - new Date(draft.start).getTime();
      if (age < 24 * 60 * 60 * 1000) { // Less than 24 hours
        draftTimeEntry.startAutoSave(draft);
      } else {
        draftTimeEntry.clearDraft();
      }
    }

    loadTimeEntries();
  }, [loadTimeEntries]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      draftTimeEntry.stopAutoSave();
    };
  }, []);

  return {
    timeEntries,
    loading,
    error,
    currentEntry,
    isTimerRunning,
    loadTimeEntries,
    startTimer,
    stopTimer,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry
  };
}

/**
 * Leave Management Hook
 * Based on leave approval workflow patterns from fairnesscoop/permacoop
 */
export function useLeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canApprove } = usePermission('leave_requests' as any, 'approve' as any);

  const loadLeaveRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = storageService.get('LEAVE_REQUESTS', []);
      const filtered = rbac.filterDataByPermission(stored, 'leave_requests' as any);
      setLeaveRequests(filtered);
    } catch (err) {
      setError('Failed to load leave requests');
      console.error('Error loading leave requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLeaveRequest = useCallback((request: Omit<LeaveRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `leave_${Date.now()}`,
      status: 'PENDING' as any,
      requestedAt: new Date()
    };

    setLeaveRequests(prev => [...prev, newRequest]);
    const updated = [...leaveRequests, newRequest];
    storageService.set('LEAVE_REQUESTS', updated);
    return newRequest;
  }, [leaveRequests]);

  const approveLeaveRequest = useCallback((id: string, approverComments?: string) => {
    if (!canApprove) {
      throw new Error('You do not have permission to approve leave requests');
    }

    const approverId = rbac.getCurrentUser()?.id;
    if (!approverId) {
      throw new Error('User not authenticated');
    }

    const updated = leaveRequests.map(request =>
      request.id === id
        ? {
            ...request,
            status: 'APPROVED' as any,
            approverId,
            approverComments,
            reviewedAt: new Date()
          }
        : request
    );

    setLeaveRequests(updated);
    storageService.set('LEAVE_REQUESTS', updated);
  }, [canApprove, leaveRequests]);

  const rejectLeaveRequest = useCallback((id: string, approverComments?: string) => {
    if (!canApprove) {
      throw new Error('You do not have permission to reject leave requests');
    }

    const approverId = rbac.getCurrentUser()?.id;
    if (!approverId) {
      throw new Error('User not authenticated');
    }

    const updated = leaveRequests.map(request =>
      request.id === id
        ? {
            ...request,
            status: 'REFUSED' as any,
            approverId,
            approverComments,
            reviewedAt: new Date()
          }
        : request
    );

    setLeaveRequests(updated);
    storageService.set('LEAVE_REQUESTS', updated);
  }, [canApprove, leaveRequests]);

  const cancelLeaveRequest = useCallback((id: string) => {
    const userRequests = leaveRequests.filter(request =>
      request.userId === rbac.getCurrentUser()?.id
    );

    const requestToCancel = userRequests.find(request => request.id === id);
    if (!requestToCancel) {
      throw new Error('Leave request not found or permission denied');
    }

    const updated = leaveRequests.map(request =>
      request.id === id
        ? { ...request, status: 'CANCELLED' as any }
        : request
    );

    setLeaveRequests(updated);
    storageService.set('LEAVE_REQUESTS', updated);
  }, [leaveRequests]);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  return {
    leaveRequests,
    loading,
    error,
    canApprove,
    loadLeaveRequests,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest
  };
}

/**
 * Payment and Salary Hook
 * Based on payment processing patterns from MedusaJS and WooCommerce
 */
export function usePaymentRecords() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canAccess } = usePermission('payment_records' as any, 'read' as any);

  const loadPaymentRecords = useCallback(async () => {
    if (!canAccess) {
      setError('Access denied');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const stored = storageService.get('PAYMENT_RECORDS', []);
      const filtered = rbac.filterDataByPermission(stored, 'payment_records' as any);
      setPaymentRecords(filtered);
    } catch (err) {
      setError('Failed to load payment records');
      console.error('Error loading payment records:', err);
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  const calculateNetSalary = useCallback((
    baseSalary: number,
    overtimeHours: number,
    overtimeRate: number,
    bonuses: { amount: number }[],
    deductions: { amount: number }[]
  ) => {
    const overtimePay = overtimeHours * overtimeRate;
    const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);

    const grossAmount = baseSalary + overtimePay + totalBonuses;
    const netAmount = grossAmount - totalDeductions;

    return {
      grossAmount,
      netAmount,
      overtimePay,
      totalBonuses,
      totalDeductions
    };
  }, []);

  useEffect(() => {
    loadPaymentRecords();
  }, [loadPaymentRecords]);

  return {
    paymentRecords,
    loading,
    error,
    canAccess,
    loadPaymentRecords,
    calculateNetSalary
  };
}

/**
 * Export Hook
 * Based on export patterns from Bitwarden and Actual Budget
 */
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const exportService = ExportService.getInstance();

  const exportData = useCallback(async (
    data: any[],
    config: ExportConfig,
    onProgress?: (progress: number) => void
  ) => {
    setIsExporting(true);
    setProgress(0);
    setError(null);

    try {
      await exportService.exportWithProgress(data, config, (prog) => {
        setProgress(prog);
        onProgress?.(prog);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, [exportService]);

  const getExportHistory = useCallback(() => {
    return exportService.getExportHistory();
  }, [exportService]);

  const clearExportHistory = useCallback(() => {
    exportService.clearExportHistory();
  }, [exportService]);

  return {
    isExporting,
    progress,
    error,
    exportData,
    getExportHistory,
    clearExportHistory
  };
}

/**
 * User Preferences Hook
 * Based on preference management patterns from GitLab
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState(userPreferences.getPreferences());

  useEffect(() => {
    return userPreferences.onPreferencesChanged(setPreferences);
  }, []);

  const updatePreference = useCallback(<K extends keyof any>(
    key: K,
    value: any[K]
  ) => {
    userPreferences.updatePreference(key, value);
  }, []);

  const resetPreferences = useCallback(() => {
    userPreferences.resetPreferences();
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences
  };
}

/**
 * Dashboard Analytics Hook
 */
export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { timeEntries } = useTimeEntries();
  const { leaveRequests } = useLeaveManagement();

  const calculateAnalytics = useCallback(() => {
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const pendingLeaves = leaveRequests.filter(request => request.status === 'PENDING').length;
    const approvedLeaves = leaveRequests.filter(request => request.status === 'APPROVED').length;

    // Calculate daily average for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = timeEntries.filter(entry =>
      new Date(entry.start) >= sevenDaysAgo
    );

    const dailyAverage = recentEntries.length > 0
      ? totalHours / 7
      : 0;

    setAnalytics({
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      averageDailyHours: dailyAverage,
      pendingLeaveRequests: pendingLeaves,
      approvedLeaveRequests: approvedLeaves,
      totalEntries: timeEntries.length,
      billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0
    });
  }, [timeEntries, leaveRequests]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  return {
    analytics,
    loading,
    refresh: calculateAnalytics
  };
}