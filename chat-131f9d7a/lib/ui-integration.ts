import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TimeEntryCRUD,
  LeaveManagementCRUD,
  NotificationManagementCRUD,
  SalaryPaymentCRUD,
  UserProfileCRUD,
  ReportManagementCRUD,
  SettingsManagementCRUD,
  confirmAction,
  showSuccessMessage,
  showErrorMessage,
  validateDateRange,
  validateEmail
} from './crud-operations';
import { getLeaveRequestsForUser, getSalaryRecordsForEmployee, getCurrentTimeEntry, getTimeEntriesForUser, getCurrentUserId, addNotification, formatDate } from './storage';
import { USERS, CURRENT_USER_ID } from './constants';

// ==================== LEAVE MANAGEMENT UI INTEGRATION ====================

export function useLeaveManagement(userId: number) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  const submitLeaveRequest = async (formData: {
    leaveType: 'annual' | 'sick';
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    reason: string;
  }) => {
    if (!validateDateRange(formData.startDate, formData.endDate)) {
      showErrorMessage('End date must be after start date');
      return false;
    }

    if (!formData.reason.trim()) {
      showErrorMessage('Please provide a reason for your leave request');
      return false;
    }

    setIsSubmitting(true);

    try {
      const leaveRequest = LeaveManagementCRUD.createLeaveRequest({
        userId,
        ...formData
      });

      // Create notification for managers/bosses
      const currentUser = getCurrentUser();
      if (currentUser) {
        const bossIds = [1, 2]; // Assuming users 1 and 2 are bosses
        bossIds.forEach(bossId => {
          addNotification({
            userId: bossId,
            type: 'leave_submitted',
            title: 'New Leave Request',
            message: `${currentUser.firstName} ${currentUser.lastName} submitted a leave request for ${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`,
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedId: leaveRequest.id.toString(),
            relatedType: 'leave'
          });
        });
      }

      showSuccessMessage('Leave request submitted successfully!');
      return leaveRequest;
    } catch (error) {
      showErrorMessage('Failed to submit leave request');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveLeaveRequest = (leaveId: number, approvedBy: number) => {
    if (confirmAction('Are you sure you want to approve this leave request?')) {
      const success = LeaveManagementCRUD.updateLeaveStatus(leaveId, 'approved', approvedBy);
      if (success) {
        // The handleLeaveAction function in data-integration.ts already creates notifications
        showSuccessMessage('Leave request approved successfully!');
        return true;
      } else {
        showErrorMessage('Failed to approve leave request');
        return false;
      }
    }
    return false;
  };

  const denyLeaveRequest = (leaveId: number, approvedBy: number) => {
    const reason = prompt('Please provide a reason for denial:');
    if (reason === null) return false;

    if (!reason.trim()) {
      showErrorMessage('Reason for denial is required');
      return false;
    }

    if (confirmAction('Are you sure you want to deny this leave request?')) {
      const success = LeaveManagementCRUD.updateLeaveStatus(leaveId, 'denied', approvedBy);
      if (success) {
        showSuccessMessage('Leave request denied successfully!');
        return true;
      } else {
        showErrorMessage('Failed to deny leave request');
        return false;
      }
    }
    return false;
  };

  const cancelLeaveRequest = (leaveId: number) => {
    if (confirmAction('Are you sure you want to cancel this leave request?')) {
      const success = LeaveManagementCRUD.cancelLeaveRequest(leaveId, userId);
      if (success) {
        showSuccessMessage('Leave request cancelled successfully!');
        return true;
      } else {
        showErrorMessage('Failed to cancel leave request');
        return false;
      }
    }
    return false;
  };

  const refreshLeaveHistory = () => {
    const history = LeaveManagementCRUD.getLeaveHistory(userId);
    setLeaveHistory(history);
  };

  return {
    submitLeaveRequest,
    approveLeaveRequest,
    denyLeaveRequest,
    cancelLeaveRequest,
    refreshLeaveHistory,
    isSubmitting,
    leaveHistory
  };
}

// ==================== TIME ENTRY MANAGEMENT UI INTEGRATION ====================

export function useTimeEntryManagement(userId: number) {
  const [isClocking, setIsClocking] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<any>(null);
  const [timeHistory, setTimeHistory] = useState<any[]>([]);

  const refreshCurrentTimeEntry = () => {
    const entry = getCurrentTimeEntry(userId);
    setCurrentTimeEntry(entry);
    return entry;
  };

  const refreshTimeHistory = () => {
    const history = TimeEntryCRUD.getTimeEntriesForDateRange(
      userId,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );
    setTimeHistory(history);
  };

  const clockIn = async (notes?: string) => {
    setIsClocking(true);

    try {
      const entry = TimeEntryCRUD.clockIn(userId, notes);
      setCurrentTimeEntry(entry);
      showSuccessMessage('Clocked in successfully!');
      return entry;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to clock in');
      return false;
    } finally {
      setIsClocking(false);
    }
  };

  const clockOut = async (notes?: string) => {
    setIsClocking(true);

    try {
      const entry = TimeEntryCRUD.clockOut(userId, notes);
      setCurrentTimeEntry(null);
      showSuccessMessage('Clocked out successfully!');
      refreshTimeHistory();
      return entry;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to clock out');
      return false;
    } finally {
      setIsClocking(false);
    }
  };

  const startLunchBreak = async () => {
    if (!confirmAction('Start your lunch break now?')) return false;

    setIsClocking(true);

    try {
      const entry = TimeEntryCRUD.startLunchBreak(userId);
      setCurrentTimeEntry(entry);
      showSuccessMessage('Lunch break started');
      return entry;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to start lunch break');
      return false;
    } finally {
      setIsClocking(false);
    }
  };

  const endLunchBreak = async () => {
    if (!confirmAction('End your lunch break now?')) return false;

    setIsClocking(true);

    try {
      const entry = TimeEntryCRUD.endLunchBreak(userId);
      setCurrentTimeEntry(entry);
      showSuccessMessage('Lunch break ended');
      return entry;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to end lunch break');
      return false;
    } finally {
      setIsClocking(false);
    }
  };

  const startShortBreak = async () => {
    setIsClocking(true);

    try {
      const entry = TimeEntryCRUD.startShortBreak(userId);
      setCurrentTimeEntry(entry);
      showSuccessMessage('Break started');
      return entry;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to start break');
      return false;
    } finally {
      setIsClocking(false);
    }
  };

  const endShortBreak = async () => {
    setIsClocking(true);

    try {
      const entry = TimeEntryCRUD.endShortBreak(userId);
      setCurrentTimeEntry(entry);
      showSuccessMessage('Break ended');
      return entry;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to end break');
      return false;
    } finally {
      setIsClocking(false);
    }
  };

  const deleteTimeEntry = async (entryId: number, isAdmin: boolean = false) => {
    if (!isAdmin) {
      showErrorMessage('Only administrators can delete time entries');
      return false;
    }

    if (!confirmAction('Are you sure you want to delete this time entry? This action cannot be undone.')) {
      return false;
    }

    try {
      const currentUserId = getCurrentUserId();
      const success = TimeEntryCRUD.deleteTimeEntry(entryId, currentUserId);

      if (success) {
        showSuccessMessage('Time entry deleted successfully');
        refreshTimeHistory();
        return true;
      }
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to delete time entry');
    }

    return false;
  };

  // Initialize
  useState(() => {
    refreshCurrentTimeEntry();
    refreshTimeHistory();
  });

  return {
    clockIn,
    clockOut,
    startLunchBreak,
    endLunchBreak,
    startShortBreak,
    endShortBreak,
    deleteTimeEntry,
    refreshCurrentTimeEntry,
    refreshTimeHistory,
    isClocking,
    currentTimeEntry,
    timeHistory
  };
}

// ==================== SALARY PAYMENT MANAGEMENT UI INTEGRATION ====================

export function useSalaryManagement(userId: number) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);

  const refreshPaymentData = () => {
    const history = SalaryPaymentCRUD.getPaymentHistory(userId);
    const stats = SalaryPaymentCRUD.getPaymentStatistics(userId);

    setPaymentHistory(history);
    setPaymentStats(stats);
  };

  const generateMonthlyPayment = async (month?: string, amount?: number) => {
    if (!confirmAction('Generate a new monthly payment?')) return false;

    setIsProcessing(true);

    try {
      const currentUserId = getCurrentUserId();
      const payment = SalaryPaymentCRUD.generateMonthlyPayment(userId, month, amount, currentUserId);
      showSuccessMessage(`Monthly payment generated for ${payment.month}`);
      refreshPaymentData();
      return payment;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to generate payment');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPayment = async (paymentId: number) => {
    if (!confirmAction('Confirm receipt of this payment?')) return false;

    setIsProcessing(true);

    try {
      const success = SalaryPaymentCRUD.confirmByEmployee(paymentId, userId);

      if (success) {
        showSuccessMessage('Payment confirmed successfully');
        refreshPaymentData();
        return true;
      }
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to confirm payment');
    } finally {
      setIsProcessing(false);
    }

    return false;
  };

  const markAsPaid = async (paymentId: number, isAdmin: boolean = false) => {
    if (!isAdmin) {
      showErrorMessage('Only administrators can mark payments as paid');
      return false;
    }

    if (!confirmAction('Mark this payment as processed?')) return false;

    setIsProcessing(true);

    try {
      const currentUserId = getCurrentUserId();
      const success = SalaryPaymentCRUD.markAsPaid(paymentId, currentUserId);

      if (success) {
        showSuccessMessage('Payment marked as processed');
        refreshPaymentData();
        return true;
      }
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }

    return false;
  };

  const generateBonusPayment = async (amount: number, reason: string, isAdmin: boolean = false) => {
    if (!isAdmin) {
      showErrorMessage('Only administrators can generate bonus payments');
      return false;
    }

    if (!confirmAction(`Generate bonus payment of ₱${amount.toLocaleString()}?`)) return false;

    setIsProcessing(true);

    try {
      const currentUserId = getCurrentUserId();
      const payment = SalaryPaymentCRUD.generateBonusPayment(userId, amount, reason, currentUserId);
      showSuccessMessage(`Bonus payment of ₱${amount.toLocaleString()} generated`);
      refreshPaymentData();
      return payment;
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to generate bonus payment');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePayment = async (paymentId: number, isAdmin: boolean = false) => {
    if (!isAdmin) {
      showErrorMessage('Only administrators can delete payments');
      return false;
    }

    const reason = prompt('Please provide a reason for deleting this payment:');
    if (!reason) return false;

    if (!confirmAction('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return false;
    }

    setIsProcessing(true);

    try {
      const currentUserId = getCurrentUserId();
      const success = SalaryPaymentCRUD.deletePayment(paymentId, currentUserId, reason);

      if (success) {
        showSuccessMessage('Payment deleted successfully');
        refreshPaymentData();
        return true;
      }
    } catch (error: any) {
      showErrorMessage(error.message || 'Failed to delete payment');
    } finally {
      setIsProcessing(false);
    }

    return false;
  };

  // Load admin-specific data
  const loadAdminData = () => {
    const currentUserId = getCurrentUserId();
    if (currentUserId === 1 || currentUserId === 2) {
      const pending = SalaryPaymentCRUD.getPendingPayments();
      setPendingPayments(pending);
    }
  };

  // Initialize
  useState(() => {
    refreshPaymentData();
    loadAdminData();
  });

  return {
    generateMonthlyPayment,
    confirmPayment,
    markAsPaid,
    generateBonusPayment,
    deletePayment,
    refreshPaymentData,
    loadAdminData,
    isProcessing,
    paymentHistory,
    pendingPayments,
    paymentStats
  };
}

// ==================== NOTIFICATION MANAGEMENT UI INTEGRATION ====================

export function useNotificationManagement(userId: number) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    const userNotifications = NotificationManagementCRUD.getNotificationsForUser(userId);
    setNotifications(userNotifications);
    setUnreadCount(NotificationManagementCRUD.getUnreadCount(userId));
  };

  const markAsRead = (notificationId: number) => {
    const success = NotificationManagementCRUD.markAsRead(notificationId);
    if (success) {
      loadNotifications(); // Refresh the list
    }
  };

  const markAllAsRead = () => {
    NotificationManagementCRUD.markAllAsRead(userId);
    loadNotifications();
    showSuccessMessage('All notifications marked as read');
  };

  const deleteNotification = (notificationId: number) => {
    if (confirmAction('Are you sure you want to delete this notification?')) {
      const success = NotificationManagementCRUD.deleteNotification(notificationId);
      if (success) {
        loadNotifications();
        showSuccessMessage('Notification deleted');
      } else {
        showErrorMessage('Failed to delete notification');
      }
    }
  };

  const clearOldNotifications = () => {
    if (confirmAction('Are you sure you want to clear notifications older than 30 days?')) {
      NotificationManagementCRUD.clearOldNotifications(userId);
      loadNotifications();
      showSuccessMessage('Old notifications cleared');
    }
  };

  return {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications
  };
}

// ==================== USER PROFILE MANAGEMENT UI INTEGRATION ====================

export function useUserProfileManagement() {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const createEmployee = async (userData: {
    firstName: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
    department: string;
  }) => {
    if (!userData.firstName.trim() || !userData.email.trim()) {
      showErrorMessage('Name and email are required');
      return false;
    }

    if (!validateEmail(userData.email)) {
      showErrorMessage('Please enter a valid email address');
      return false;
    }

    // Check if email already exists
    const existingUser = UserProfileCRUD.searchUsers(userData.email);
    if (existingUser.length > 0) {
      showErrorMessage('A user with this email already exists');
      return false;
    }

    setIsUpdating(true);

    try {
      const newEmployee = UserProfileCRUD.createEmployee(userData);
      showSuccessMessage(`Employee ${userData.firstName} created successfully!`);
      return newEmployee;
    } catch (error) {
      showErrorMessage('Failed to create employee');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateUserProfile = async (userId: number, updates: {
    firstName?: string;
    email?: string;
    department?: string;
    phoneNumber?: string;
  }) => {
    if (updates.email && !validateEmail(updates.email)) {
      showErrorMessage('Please enter a valid email address');
      return false;
    }

    setIsUpdating(true);

    try {
      const success = UserProfileCRUD.updateUserProfile(userId, updates);
      if (success) {
        showSuccessMessage('Profile updated successfully!');
        return true;
      } else {
        showErrorMessage('Failed to update profile');
        return false;
      }
    } catch (error) {
      showErrorMessage('Failed to update profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deactivateUser = (userId: number, userName: string) => {
    if (confirmAction(`Are you sure you want to deactivate ${userName}? This action cannot be undone.`)) {
      const success = UserProfileCRUD.deactivateUser(userId);
      if (success) {
        showSuccessMessage(`User ${userName} has been deactivated`);
        return true;
      } else {
        showErrorMessage('Failed to deactivate user');
        return false;
      }
    }
    return false;
  };

  const searchUsers = (query: string) => {
    return UserProfileCRUD.searchUsers(query);
  };

  return {
    createEmployee,
    updateUserProfile,
    deactivateUser,
    searchUsers,
    isUpdating
  };
}

// ==================== REPORT MANAGEMENT UI INTEGRATION ====================

export function useReportManagement(currentUserId: number) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  const generateReport = async (reportConfig: {
    type: 'timesheet' | 'leave' | 'salary' | 'attendance' | 'performance';
    userId?: number;
    dateRange: { start: string; end: string };
    format: 'pdf' | 'excel' | 'csv';
  }) => {
    if (!validateDateRange(reportConfig.dateRange.start, reportConfig.dateRange.end)) {
      showErrorMessage('End date must be after start date');
      return false;
    }

    setIsGenerating(true);

    try {
      const report = ReportManagementCRUD.generateReport(reportConfig, currentUserId);
      showSuccessMessage(`Report generation started. You'll be notified when it's ready.`);

      // Refresh reports list
      setTimeout(() => loadReports(), 1000);

      return report;
    } catch (error) {
      showErrorMessage('Failed to generate report');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    const report = ReportManagementCRUD.getReportById(reportId);
    if (report && report.status === 'ready' && report.downloadUrl) {
      // In a real app, this would trigger a download
      window.open(report.downloadUrl, '_blank');
      showSuccessMessage('Report download started');
    } else {
      showErrorMessage('Report is not ready for download');
    }
  };

  const deleteReport = (reportId: string) => {
    if (confirmAction('Are you sure you want to delete this report?')) {
      const success = ReportManagementCRUD.deleteReport(reportId);
      if (success) {
        loadReports();
        showSuccessMessage('Report deleted successfully');
        return true;
      } else {
        showErrorMessage('Failed to delete report');
        return false;
      }
    }
    return false;
  };

  const loadReports = () => {
    const userReports = ReportManagementCRUD.getReports();
    setReports(userReports);
  };

  const scheduleWeeklyReport = (reportConfig: any) => {
    // Placeholder for scheduling functionality
    showSuccessMessage('Weekly report scheduled successfully');
    return true;
  };

  return {
    generateReport,
    downloadReport,
    deleteReport,
    loadReports,
    scheduleWeeklyReport,
    isGenerating,
    reports
  };
}

// ==================== SETTINGS MANAGEMENT UI INTEGRATION ====================

export function useSettingsManagement(currentUserId: number) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateWorkingHours = async (config: {
    startHour: number;
    endHour: number;
    lunchBreakMinutes: number;
  }) => {
    if (config.startHour < 0 || config.startHour > 23 || config.endHour < 0 || config.endHour > 23) {
      showErrorMessage('Please enter valid hours (0-23)');
      return false;
    }

    if (config.startHour >= config.endHour) {
      showErrorMessage('End time must be after start time');
      return false;
    }

    setIsUpdating(true);

    try {
      SettingsManagementCRUD.updateWorkingHours(
        config.startHour,
        config.endHour,
        config.lunchBreakMinutes,
        currentUserId
      );
      showSuccessMessage('Working hours updated successfully!');
      return true;
    } catch (error) {
      showErrorMessage('Failed to update working hours');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateSalaryRates = async (monthlySalary: number) => {
    if (monthlySalary < 0) {
      showErrorMessage('Salary must be a positive number');
      return false;
    }

    setIsUpdating(true);

    try {
      SettingsManagementCRUD.updateSalaryRates(monthlySalary, currentUserId);
      showSuccessMessage('Salary rates updated successfully!');
      return true;
    } catch (error) {
      showErrorMessage('Failed to update salary rates');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const addHoliday = async (holidayData: {
    date: string;
    name: string;
    type: 'regular' | 'special';
  }) => {
    if (!holidayData.date || !holidayData.name.trim()) {
      showErrorMessage('Date and name are required');
      return false;
    }

    setIsUpdating(true);

    try {
      SettingsManagementCRUD.addHoliday(
        holidayData.date,
        holidayData.name,
        holidayData.type,
        currentUserId
      );
      showSuccessMessage('Holiday added successfully!');
      return true;
    } catch (error) {
      showErrorMessage('Failed to add holiday');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeHoliday = (date: string, name: string) => {
    if (confirmAction(`Are you sure you want to remove ${name} from the holidays list?`)) {
      try {
        SettingsManagementCRUD.removeHoliday(date, currentUserId);
        showSuccessMessage('Holiday removed successfully!');
        return true;
      } catch (error) {
        showErrorMessage('Failed to remove holiday');
        return false;
      }
    }
    return false;
  };

  const getWorkingHours = () => {
    return SettingsManagementCRUD.getWorkingHoursSettings();
  };

  const getHolidays = () => {
    return SettingsManagementCRUD.getHolidays();
  };

  const getSalaryRates = () => {
    const setting = SettingsManagementCRUD.getSettingByKey('monthly_salary');
    return setting?.value || 32444;
  };

  return {
    updateWorkingHours,
    updateSalaryRates,
    addHoliday,
    removeHoliday,
    getWorkingHours,
    getHolidays,
    getSalaryRates,
    isUpdating
  };
}

// ==================== QUICK ACTION HANDLERS ====================

export function useQuickActions(currentUserId: number) {
  const router = useRouter();

  const handleQuickClockIn = (userId: number) => {
    // This would integrate with the existing clock-in functionality
    router.push(`/user/${userId}`);
  };

  const handleQuickApproveLeave = (leaveId: number) => {
    const success = LeaveManagementCRUD.updateLeaveStatus(leaveId, 'approved', currentUserId);
    if (success) {
      showSuccessMessage('Leave request approved');
    } else {
      showErrorMessage('Failed to approve leave request');
    }
  };

  const handleQuickGenerateReport = () => {
    router.push('/reports');
  };

  const handleQuickExportData = (format: 'csv' | 'excel' | 'pdf') => {
    // Generate a quick export of current data
    const report = ReportManagementCRUD.generateReport({
      type: 'timesheet',
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      format
    }, currentUserId);

    showSuccessMessage(`Export started in ${format.toUpperCase()} format`);
  };

  return {
    handleQuickClockIn,
    handleQuickApproveLeave,
    handleQuickGenerateReport,
    handleQuickExportData
  };
}

// ==================== MODAL AND DIALOG MANAGEMENT ====================

export function useModalManagement() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const confirmWithModal = (message: string, onConfirm: () => void) => {
    if (confirmAction(message)) {
      onConfirm();
    }
  };

  return {
    activeModal,
    openModal,
    closeModal,
    confirmWithModal
  };
}

// ==================== SEARCH AND FILTER UTILITIES ====================

export function useSearchAndFilter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const applySearchFilter = (items: any[], searchFields: string[]) => {
    if (!searchTerm.trim()) return items;

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  };

  const applyFilters = (items: any[], filters: Record<string, any>) => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;
        return item[key] === value;
      });
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    applySearchFilter,
    applyFilters,
    clearFilters
  };
}

// ==================== EXPORT FUNCTIONS ====================

