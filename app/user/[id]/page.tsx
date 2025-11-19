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
  const [timesheetView, setTimesheetView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    const listener = (event: any) => {
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
    };

    dataSyncManager.addListener(listener);

    return () => dataSyncManager.removeListener(listener);
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
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 12);
    setSalaryHistory(history);
  };

  const regenerateSalaryHistory = () => {
    if (typeof window !== 'undefined') {
      // Clear old salary data
      localStorage.removeItem('salary_records');
      // Force regeneration
      autoGenerateMonthlySalaries();
      // Reload data
      loadSalaryData();
      showToast('Salary history regenerated successfully!', 'success');
    }
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
      <div className="p-3 bg-gray-50">
        {/* Time Tracking Tab */}
        {activeTab === 'time-tracking' && (
          <div className="space-y-3">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-3">
              <h2 className="text-base font-bold text-gray-800">🏢 Welcome to Your Flexible Workspace!</h2>
              <p className="text-xs text-gray-600">Work whenever you're most productive. No fixed hours - just deliver 8 hours of quality work daily. 🚀</p>
            </div>

            {/* Today's Progress Card */}
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-3">TODAY'S PROGRESS</h3>

              {/* Progress Metrics */}
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-gray-600">⏰ {formatHours(userHours)} / 8h</span>
                <span className="text-gray-600">🎯 Daily Goal</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{width: `${Math.min((userHours / 8) * 100, 100)}%`}}
                />
              </div>

              {/* Status Badge + Progress Text Combined */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full font-medium text-xs ${
                  status.text === 'Clocked Out'
                    ? 'bg-gray-100 text-gray-700'
                    : status.text === 'Clocked In'
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : status.text === 'At Lunch'
                    ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    : 'bg-purple-50 text-purple-600 border border-purple-200'
                }`}>
                  {status.icon} {status.text}
                </span>
                <span className="text-xs text-gray-600">💪 {Math.min((userHours / 8) * 100, 100).toFixed(0)}% complete</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-2 flex-wrap">
                {status.text === 'Clocked Out' ? (
                  <button
                    onClick={() => handleTimeTrackingAction('clock_in')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-md inline-flex items-center gap-2 text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Clock In
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleTimeTrackingAction('start_break')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md inline-flex items-center gap-1.5 text-xs"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      Start Lunch
                    </button>
                    <button
                      onClick={() => handleTimeTrackingAction('start_break')}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md inline-flex items-center gap-1.5 text-xs"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      Start Break
                    </button>
                    <button
                      onClick={() => handleTimeTrackingAction('clock_out')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md inline-flex items-center gap-1.5 text-xs"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Clock Out
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* This Week's Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">📊 Total Hours</p>
                  <p className="text-sm font-bold text-gray-800">{formatHours(userHours)} / 40h</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">📅 Days Done</p>
                  <p className="text-sm font-bold text-gray-800">0 / 5</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">⭐ Avg/Day</p>
                  <p className="text-sm font-bold text-gray-800">{userHours > 0 ? formatHours(userHours) : '0h'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">🔥 Streak</p>
                  <p className="text-sm font-bold text-gray-800">0 days</p>
                </div>
              </div>
            </div>

            {/* Activity Timeline - Only show when clocked in */}
            {status.text !== 'Clocked Out' && (
              <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3">TODAY'S ACTIVITY</h3>
                <div className="space-y-2">
                  {/* Example timeline entries */}
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">Clocked In</p>
                      <p className="text-[10px] text-gray-500">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-[10px] text-green-600 font-medium">Active</span>
                  </div>
                  <div className="text-center py-3">
                    <p className="text-xs text-gray-400">Activity log will appear here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leave Management Tab */}
        {activeTab === 'leave-management' && (
          <div className="space-y-3">
            {/* Leave Balance */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-3">📅 Leave Balance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{leaveBalance.total}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">Total Days</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-lg font-bold text-green-700">{leaveBalance.used}</div>
                  <div className="text-[10px] text-green-600 mt-0.5">Used</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-700">{leaveBalance.pending}</div>
                  <div className="text-[10px] text-yellow-600 mt-0.5">Pending</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{leaveBalance.remaining}</div>
                  <div className="text-[10px] text-blue-600 mt-0.5">Remaining</div>
                </div>
              </div>
            </div>

            {/* Leave Request Form */}
            {isOwnPage && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-800 mb-3">✍️ Request Leave</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={leaveFormData.startDate}
                        onChange={(e) => setLeaveFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={leaveFormData.endDate}
                        onChange={(e) => setLeaveFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                      value={leaveFormData.leaveType}
                      onChange={(e) => setLeaveFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={leaveFormData.reason}
                      onChange={(e) => setLeaveFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reason for leave..."
                    />
                  </div>
                  <button
                    onClick={handleLeaveSubmit}
                    className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}

            {/* Pending Leave Requests (for bosses) */}
            {isBoss && pendingLeaveRequests.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-800 mb-3">⏳ Pending Requests</h2>
                <div className="space-y-2">
                  {pendingLeaveRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-semibold text-gray-900">{request.employeeName}</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.daysRequested} days)
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{request.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLeaveApproval(request.id, 'approve')}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveApproval(request.id, 'deny')}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
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
          <div className="space-y-3">
            {/* Current Month Salary */}
            {currentMonthSalary && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-800 mb-3">💰 Current Month Salary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <div className="text-[10px] text-blue-600 mb-0.5">Payment Month</div>
                    <div className="text-base font-bold text-blue-900">{currentMonthSalary.paymentMonth}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                    <div className="text-[10px] text-green-600 mb-0.5">Amount</div>
                    <div className="text-base font-bold text-green-900">
                      {formatCurrency(currentMonthSalary.amount)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                    <div className="text-[10px] text-gray-600 mb-0.5">Status</div>
                    <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      currentMonthSalary.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentMonthSalary.status === 'paid' ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                    <div className="text-[10px] text-purple-600 mb-0.5">Work Period</div>
                    <div className="text-[10px] text-purple-900">
                      {formatDate(currentMonthSalary.workPeriodStart)} - {formatDate(currentMonthSalary.workPeriodEnd)}
                    </div>
                  </div>
                </div>

                {isBoss && currentMonthSalary.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={handleSalaryConfirmation}
                      className="px-4 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors font-medium inline-flex items-center gap-1"
                    >
                      <DollarSign className="w-3 h-3" />
                      Mark as Paid
                    </button>
                  </div>
                )}

                {isOwnPage && currentMonthSalary.status === 'paid' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Salary paid and confirmed</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Salary History */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">📊 Salary History</h2>
                <button
                  onClick={regenerateSalaryHistory}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  🔄 Refresh History
                </button>
              </div>
              {salaryHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Type</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Description</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Work Period</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Amount</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {salaryHistory.map((salary) => {
                        const isReimbursement = salary.id.toString().startsWith('reimb_');
                        return (
                          <tr key={salary.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                isReimbursement
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {isReimbursement ? '🏢 Reimburse' : '💰 Salary'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-xs font-semibold text-gray-800">
                              {isReimbursement ? salary.paymentMonth : `${salary.paymentMonth} Salary`}
                            </td>
                            <td className="py-2 px-3 text-xs text-gray-600">
                              {isReimbursement ? '-' : `${formatDate(salary.workPeriodStart)} - ${formatDate(salary.workPeriodEnd)}`}
                            </td>
                            <td className="py-2 px-3 text-xs font-bold text-green-700">{formatCurrency(salary.amount)}</td>
                            <td className="py-2 px-3 text-xs text-gray-600">
                              {salary.paidDate ? formatDate(salary.paidDate) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-xs font-medium">No salary history yet</p>
                  <p className="text-[10px] mt-1">Click "Refresh History" above to generate your payment records</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="space-y-3">
            {/* Timesheet Header with Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-bold text-gray-800">📋 Timesheet</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimesheetView('daily')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      timesheetView === 'daily'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimesheetView('weekly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      timesheetView === 'weekly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimesheetView('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      timesheetView === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-[10px] text-blue-600 mb-1">⏱️ Total Hours</p>
                  <p className="text-lg font-bold text-blue-900">
                    {(() => {
                      const entries = getTimeEntriesForUser(userId);
                      const totalHours = entries
                        .filter(e => e.totalHours !== null)
                        .reduce((sum, e) => sum + (e.totalHours || 0), 0);
                      return formatHours(totalHours);
                    })()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <p className="text-[10px] text-green-600 mb-1">✅ Days Worked</p>
                  <p className="text-lg font-bold text-green-900">
                    {getTimeEntriesForUser(userId).filter(e => e.status === 'clocked_out').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <p className="text-[10px] text-purple-600 mb-1">☕ Break Time</p>
                  <p className="text-lg font-bold text-purple-900">
                    {(() => {
                      const entries = getTimeEntriesForUser(userId);
                      let totalBreakMinutes = 0;

                      entries.forEach(entry => {
                        // Calculate lunch break duration
                        if (entry.lunchBreakStart && entry.lunchBreakEnd) {
                          const lunchDuration = (new Date(entry.lunchBreakEnd).getTime() - new Date(entry.lunchBreakStart).getTime()) / (1000 * 60);
                          totalBreakMinutes += lunchDuration;
                        }

                        // Calculate short breaks duration
                        entry.shortBreaks.forEach(breakItem => {
                          if (breakItem.end) {
                            const breakDuration = (new Date(breakItem.end).getTime() - new Date(breakItem.start).getTime()) / (1000 * 60);
                            totalBreakMinutes += breakDuration;
                          }
                        });
                      });

                      const hours = Math.floor(totalBreakMinutes / 60);
                      const minutes = Math.round(totalBreakMinutes % 60);
                      return totalBreakMinutes > 0 ? `${hours}h ${minutes}m` : '0m';
                    })()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <p className="text-[10px] text-orange-600 mb-1">🎯 Avg Hours</p>
                  <p className="text-lg font-bold text-orange-900">
                    {(() => {
                      const entries = getTimeEntriesForUser(userId).filter(e => e.totalHours !== null);
                      if (entries.length === 0) return '0h';
                      const totalHours = entries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
                      const avgHours = totalHours / entries.length;
                      return formatHours(avgHours);
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Entries Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Date</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Clock In</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Clock Out</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Lunch</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Breaks</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Total Hours</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getTimeEntriesForUser(userId)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, timesheetView === 'daily' ? 7 : timesheetView === 'weekly' ? 30 : 90)
                      .map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-xs">
                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs text-gray-900">
                              {new Date(entry.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-900">
                            {entry.clockOut
                              ? new Date(entry.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-900">
                            {entry.lunchBreakStart && entry.lunchBreakEnd
                              ? `${Math.round(
                                  (new Date(entry.lunchBreakEnd).getTime() - new Date(entry.lunchBreakStart).getTime()) /
                                    (1000 * 60)
                                )}m`
                              : '-'}
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-900">
                            {entry.shortBreaks.length > 0 ? `${entry.shortBreaks.length}` : '-'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-gray-900 text-xs">
                              {entry.totalHours ? formatHours(entry.totalHours) : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                entry.status === 'clocked_out'
                                  ? 'bg-gray-100 text-gray-700'
                                  : entry.status === 'clocked_in'
                                  ? 'bg-green-100 text-green-700'
                                  : entry.status === 'on_lunch'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {entry.status === 'clocked_out'
                                ? '✓ Complete'
                                : entry.status === 'clocked_in'
                                ? '🟢 Active'
                                : entry.status === 'on_lunch'
                                ? '🍽️ Lunch'
                                : '☕ Break'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {getTimeEntriesForUser(userId).length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 font-medium">No time entries yet</p>
                    <p className="text-xs text-gray-400 mt-1">Clock in to start tracking your time</p>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Activity Timeline */}
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const todayEntry = getTimeEntriesForUser(userId).find(e => e.date === today);

              if (!todayEntry) return null;

              return (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">⏰ Today's Activity Timeline</h3>
                  <div className="space-y-2">
                    {/* Clock In */}
                    <div className="flex items-start gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-800">Clocked In</p>
                          <span className="text-[10px] text-gray-500">
                            {new Date(todayEntry.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lunch Break */}
                    {todayEntry.lunchBreakStart && (
                      <div className="flex items-start gap-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-800">Lunch Break</p>
                            <span className="text-[10px] text-gray-500">
                              {new Date(todayEntry.lunchBreakStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              {todayEntry.lunchBreakEnd &&
                                ` - ${new Date(todayEntry.lunchBreakEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Short Breaks */}
                    {todayEntry.shortBreaks.map((breakItem, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-800">Break #{index + 1}</p>
                            <span className="text-[10px] text-gray-500">
                              {new Date(breakItem.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              {breakItem.end &&
                                ` - ${new Date(breakItem.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Clock Out */}
                    {todayEntry.clockOut && (
                      <div className="flex items-start gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-800">Clocked Out</p>
                            <span className="text-[10px] text-gray-500">
                              {new Date(todayEntry.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-green-600 mt-0.5">
                            ✓ Total: {todayEntry.totalHours ? formatHours(todayEntry.totalHours) : '0h'}
                          </p>
                        </div>
                      </div>
                    )}

                    {!todayEntry.clockOut && (
                      <div className="text-center py-3">
                        <p className="text-xs text-blue-600">🔵 Currently {todayEntry.status === 'clocked_in' ? 'working' : todayEntry.status === 'on_lunch' ? 'on lunch' : 'on break'}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800 mb-3">📈 Analytics Dashboard</h2>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-xs font-medium">Analytics and reporting features</p>
                <p className="text-[10px] mt-1">Charts, trends, and productivity insights coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}