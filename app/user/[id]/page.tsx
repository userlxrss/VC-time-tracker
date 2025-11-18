'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Moon, Sun, Bell, Clock, Calendar, DollarSign, FileText, TrendingUp, Users, CheckCircle, XCircle, AlertCircle, Edit3, Save, X, Coffee } from 'lucide-react';
import { USERS, PTO_ANNUAL_DAYS, MONTHLY_SALARY } from '@/lib/constants';
import {
  getCurrentUserId,
  setCurrentUserId,
  getTheme,
  setTheme,
  getUnreadNotificationsForUser,
  getTimeEntriesForUser,
  getLeaveRequestsForUser,
  getSalaryRecordsForEmployee,
  getCurrentMonthSalary,
  getPendingLeaveRequests,
  autoGenerateMonthlySalaries,
  markSalaryAsPaid,
  updateLeaveRequest,
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateBusinessDays,
  formatDuration
} from '@/lib/storage';
import {
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
  SalaryPaymentResult
} from '@/lib/data-integration';
import { useTimeTracking, useLeaveManagement, useSalaryManagement, useNotifications } from '@/lib/react-integration';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  const currentUserId = getCurrentUserId();
  const currentUser = USERS.find(u => u.id === currentUserId)!;
  const viewedUser = USERS.find(u => u.id === userId);

  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeTab, setActiveTab] = useState('time-tracking');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(3);
  const [currentMonthSalary, setCurrentMonthSalary] = useState<any>(null);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Integration hooks
  const { clockIn, clockOut, startBreak, endBreak, currentStatus } = useTimeTracking(userId);
  const { approveLeave, denyLeave, pendingRequests } = useLeaveManagement();
  const { confirmSalaryPayment, pendingSalaries } = useSalaryManagement();
  const { markAsRead, notifications } = useNotifications(currentUserId);

  // Form states for CRUD operations
  const [editingLeave, setEditingLeave] = useState<number | null>(null);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: ''
  });

  const isOwnPage = userId === currentUserId;
  const canEdit = isOwnPage || [1, 2].includes(currentUserId); // Bosses can edit
  const isBoss = currentUserId === 1 || currentUserId === 2;
  const isEmployee = userId === 3;

  // Initialize data
  useEffect(() => {
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    setTheme(savedTheme);

    const notifications = getUnreadNotificationsForUser(currentUserId);
    setUnreadNotifications(notifications.length);

    if (isBoss) {
      autoGenerateMonthlySalaries();
    }

    loadSalaryData();
    setupDataSync();
  }, [userId, currentUserId, selectedEmployeeId]);

  const setupDataSync = () => {
    const unsubscribe = dataSyncManager.subscribe((event) => {
      switch (event.type) {
        case 'TIME_ENTRY_CREATED':
        case 'TIME_ENTRY_UPDATED':
          setToast({ message: 'Time tracking updated', type: 'success' });
          break;
        case 'LEAVE_REQUEST_UPDATED':
          setToast({ message: 'Leave request updated', type: 'success' });
          break;
        case 'SALARY_PAYMENT_UPDATED':
          setToast({ message: 'Salary payment processed', type: 'success' });
          loadSalaryData();
          break;
      }
    });

    return unsubscribe;
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSalaryData = () => {
    const targetEmployeeId = isBoss ? selectedEmployeeId : userId;
    const currentSalary = getCurrentMonthSalary(targetEmployeeId);
    setCurrentMonthSalary(currentSalary);

    const allSalaries = getSalaryRecordsForEmployee(targetEmployeeId);
    const history = allSalaries
      .filter(salary => salary.paymentMonth !== (currentSalary?.paymentMonth || ''))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
    setSalaryHistory(history);
  };

  // Time tracking handlers
  const handleTimeTrackingAction = async (action: 'clock_in' | 'clock_out' | 'start_break' | 'end_break') => {
    try {
      let result: ClockInOutResult | BreakResult;

      switch (action) {
        case 'clock_in':
          result = clockIn();
          break;
        case 'clock_out':
          result = clockOut();
          break;
        case 'start_break':
          result = startBreak();
          break;
        case 'end_break':
          result = endBreak();
          break;
      }

      if (result.success) {
        showToast(`Action completed at ${result.timestamp}`);
      } else {
        showToast(result.error || 'Action failed', 'error');
      }
    } catch (error) {
      showToast(`Action failed: ${error}`, 'error');
    }
  };

  // Leave management handlers
  const handleLeaveSubmit = async () => {
    try {
      if (!leaveFormData.startDate || !leaveFormData.endDate) {
        showToast('Please select start and end dates', 'error');
        return;
      }

      const startDate = new Date(leaveFormData.startDate);
      const endDate = new Date(leaveFormData.endDate);
      const businessDays = calculateBusinessDays(startDate, endDate);

      // This would integrate with the leave request creation
      showToast(`Leave request submitted for ${businessDays} day(s)`, 'success');
      setLeaveFormData({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        isHalfDay: false,
        reason: ''
      });
    } catch (error) {
      showToast(`Failed to submit leave request: ${error}`, 'error');
    }
  };

  const handleLeaveApproval = async (leaveId: number, action: 'approve' | 'deny') => {
    try {
      const result = action === 'approve'
        ? await approveLeave(leaveId)
        : await denyLeave(leaveId);

      if (result.success) {
        showToast(`Leave request ${action}d successfully`, 'success');
      } else {
        showToast(result.error || `Failed to ${action} leave request`, 'error');
      }
    } catch (error) {
      showToast(`Failed to ${action} leave request: ${error}`, 'error');
    }
  };

  // Salary management handlers
  const handleSalaryConfirmation = async () => {
    try {
      if (currentMonthSalary && isBoss) {
        const result = await confirmSalaryPayment(
          parseInt(currentMonthSalary.id.replace('sal_', '').split('_')[1]),
          currentUserId
        );

        if (result.success) {
          showToast('Salary payment confirmed and processed', 'success');
          loadSalaryData();
        } else {
          showToast(result.error || 'Failed to process salary payment', 'error');
        }
      } else if (isOwnPage && currentMonthSalary) {
        // Employee confirmation
        showToast('Salary receipt confirmed', 'success');
      }
    } catch (error) {
      showToast(`Failed to process salary: ${error}`, 'error');
    }
  };

  // Helper functions
  const getStatusDisplay = () => {
    const today = new Date().toISOString().split('T')[0];
    const entries = getTimeEntriesForUser(userId);
    const todayEntry = entries.find(e => e.date === today);

    if (!todayEntry || todayEntry.status === 'clocked_out') {
      return { text: 'Clocked Out', color: '#737373', icon: '⚪' };
    } else if (todayEntry.status === 'on_lunch' || todayEntry.status === 'on_break') {
      return { text: 'On Break', color: '#F59E0B', icon: '🟠' };
    } else {
      return { text: 'Clocked In', color: '#22C55E', icon: '🟢' };
    }
  };

  const getUserHours = () => {
    const entries = getTimeEntriesForUser(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.date === today);
    return todayEntry?.totalHours || 0;
  };

  const calculateLeaveBalance = () => {
    const leaveRequests = getLeaveRequestsForUser(userId);
    const currentYear = new Date().getFullYear();

    const currentYearRequests = leaveRequests.filter(request => {
      const requestYear = new Date(request.startDate).getFullYear();
      return requestYear === currentYear && request.leaveType === 'annual';
    });

    const approvedDays = currentYearRequests
      .filter(r => r.status === 'approved' || r.status === 'auto_approved')
      .reduce((total, r) => total + r.daysRequested, 0);

    const pendingDays = currentYearRequests
      .filter(r => r.status === 'pending')
      .reduce((total, r) => total + r.daysRequested, 0);

    const remaining = PTO_ANNUAL_DAYS - approvedDays - pendingDays;

    return {
      total: PTO_ANNUAL_DAYS,
      used: approvedDays,
      pending: pendingDays,
      remaining: Math.max(0, remaining)
    };
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  if (!viewedUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay();
  const userHours = getUserHours();
  const leaveBalance = calculateLeaveBalance();
  const tabs = [
    { id: 'time-tracking', label: 'Time Tracking', icon: Clock },
    { id: 'timesheet', label: 'Timesheet', icon: FileText },
    { id: 'leave-management', label: 'Leave Management', icon: Calendar },
    { id: 'salary', label: 'Salary', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const pendingLeaveRequests = getPendingLeaveRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  userId === 1 || userId === 2 ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {viewedUser.firstName[0]}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{viewedUser.firstName}'s Profile</h1>
                  <p className="text-sm text-gray-500">
                    {userId === 1 || userId === 2 ? 'Management • Sydney, Australia' : 'Operations • Manila, Philippines'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${status.icon === '🟢' ? 'bg-green-500' : status.icon === '🟠' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">{status.text}</span>
              </div>
              {isOwnPage && (
                <button
                  onClick={() => setThemeState(theme === 'light' ? 'dark' : 'light')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Time Tracking Tab */}
        {activeTab === 'time-tracking' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {status.text === 'Clocked Out' ? (
                  <button
                    onClick={() => handleTimeTrackingAction('clock_in')}
                    className="flex flex-col items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Clock className="w-8 h-8 text-green-600" />
                    <span className="font-medium text-green-700">Clock In</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleTimeTrackingAction('start_break')}
                      className="flex flex-col items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <Coffee className="w-8 h-8 text-yellow-600" />
                      <span className="font-medium text-yellow-700">Start Break</span>
                    </button>
                    <button
                      onClick={() => handleTimeTrackingAction('clock_out')}
                      className="flex flex-col items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Clock className="w-8 h-8 text-red-600" />
                      <span className="font-medium text-red-700">Clock Out</span>
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Today's Hours</span>
                  <span className="text-lg font-bold text-blue-900">{formatHours(userHours)}</span>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{formatHours(userHours)}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{status.text}</div>
                  <div className="text-sm text-gray-500 mt-1">Current Status</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Current Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Management Tab */}
        {activeTab === 'leave-management' && (
          <div className="space-y-6">
            {/* Leave Balance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{leaveBalance.total}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Days</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{leaveBalance.used}</div>
                  <div className="text-sm text-gray-500 mt-1">Used</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{leaveBalance.pending}</div>
                  <div className="text-sm text-gray-500 mt-1">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{leaveBalance.remaining}</div>
                  <div className="text-sm text-gray-500 mt-1">Remaining</div>
                </div>
              </div>
            </div>

            {/* Leave Request Form */}
            {isOwnPage && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Leave</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={leaveFormData.startDate}
                        onChange={(e) => setLeaveFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={leaveFormData.endDate}
                        onChange={(e) => setLeaveFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                      value={leaveFormData.leaveType}
                      onChange={(e) => setLeaveFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={leaveFormData.reason}
                      onChange={(e) => setLeaveFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reason for leave..."
                    />
                  </div>
                  <button
                    onClick={handleLeaveSubmit}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Leave Request
                  </button>
                </div>
              </div>
            )}

            {/* Pending Leave Requests (for bosses) */}
            {isBoss && pendingLeaveRequests.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Leave Requests</h2>
                <div className="space-y-4">
                  {pendingLeaveRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.employeeName}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.daysRequested} days)
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLeaveApproval(request.id, 'approve')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveApproval(request.id, 'deny')}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div className="space-y-6">
            {/* Current Month Salary */}
            {currentMonthSalary && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Month Salary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Payment Month</div>
                    <div className="text-xl font-bold text-gray-900">{currentMonthSalary.paymentMonth}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Amount</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(currentMonthSalary.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      currentMonthSalary.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentMonthSalary.status === 'paid' ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Work Period</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(currentMonthSalary.workPeriodStart)} - {formatDate(currentMonthSalary.workPeriodEnd)}
                    </div>
                  </div>
                </div>

                {isBoss && currentMonthSalary.status === 'pending' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSalaryConfirmation}
                      className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Mark as Paid
                    </button>
                  </div>
                )}

                {isOwnPage && currentMonthSalary.status === 'paid' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Salary paid and confirmed</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Salary History */}
            {salaryHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryHistory.map((salary) => (
                        <tr key={salary.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{salary.paymentMonth}</td>
                          <td className="py-3 px-4 font-medium">{formatCurrency(salary.amount)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              salary.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {salary.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {salary.paidDate ? formatDate(salary.paidDate) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timesheet</h2>
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Detailed timesheet view will be displayed here</p>
              <p className="text-sm mt-2">Including daily entries, breaks, and total hours</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics and reporting features will be displayed here</p>
                <p className="text-sm mt-2">Including charts, trends, and productivity insights</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}