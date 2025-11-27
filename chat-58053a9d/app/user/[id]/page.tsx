'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Moon, Sun, Bell } from 'lucide-react';
import { USERS, PTO_ANNUAL_DAYS } from '@/lib/constants';
import { getCurrentUserId, setCurrentUserId, getTheme, setTheme, getUnreadNotificationsForUser, getTimeEntriesForUser, getLeaveRequestsForUser, updateLeaveRequest, addNotification, autoGenerateMonthlySalaries, getCurrentMonthSalary, getSalaryRecordsForEmployee, markSalaryAsPaid } from '@/lib/storage';

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(3); // Default to Larina (employee)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('clocked-out'); // Add status state management
  const [currentMonthSalary, setCurrentMonthSalary] = useState<any>(null);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);

  const isOwnPage = userId === currentUserId;
  const canEdit = isOwnPage;

  // Determine user type: Boss (id: 1, 2) or Employee (id: 3)
  const isBoss = userId === 1 || userId === 2;
  const isEmployee = userId === 3;

  const calculateTeamStats = () => {
    let totalWeekHours = 0;
    let currentlyWorking = 0;
    let onBreak = 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    USERS.forEach(user => {
      const entries = getTimeEntriesForUser(user.id);
      const weekEntries = entries.filter(e => new Date(e.date) >= weekStart);
      totalWeekHours += weekEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);

      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(e => e.date === today);
      if (todayEntry && ['clocked_in', 'on_lunch', 'on_break'].includes(todayEntry.status)) {
        currentlyWorking++;
        if (todayEntry.status === 'on_lunch' || todayEntry.status === 'on_break') {
          onBreak++;
        }
      }
    });

    return { totalWeekHours, currentlyWorking, onBreak };
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const getStatusDisplay = (userId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const entries = getTimeEntriesForUser(userId);
    const todayEntry = entries.find(e => e.date === today);

    if (!todayEntry || todayEntry.status === 'clocked_out') {
      return { text: 'Clocked Out', color: 'text-clockedOut', icon: '⚪' };
    } else if (todayEntry.status === 'on_lunch' || todayEntry.status === 'on_break') {
      return { text: 'On Break', color: 'text-onBreak', icon: '🟠' };
    } else {
      return { text: 'Clocked In', color: 'text-clockedIn', icon: '🟢', pulse: true };
    }
  };

  const getUserHours = (userId: number) => {
    const entries = getTimeEntriesForUser(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.date === today);
    return todayEntry?.totalHours || 0;
  };

  const calculateLeaveBalance = (employeeId: number) => {
    const leaveRequests = getLeaveRequestsForUser(employeeId);
    const currentYear = new Date().getFullYear();

    // Filter for current year's approved and pending annual leave
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

  const handleLeaveAction = (leaveRequestId: number, action: 'approve' | 'deny') => {
    console.log(`Leave ${action} for request ${leaveRequestId}`);
    // TODO: Implement full functionality
  };

  const loadSalaryData = () => {
    const targetEmployeeId = isBoss ? selectedEmployeeId : userId;

    // Get current month salary
    const currentSalary = getCurrentMonthSalary(targetEmployeeId);
    setCurrentMonthSalary(currentSalary);

    // Get salary history (exclude current month)
    const allSalaries = getSalaryRecordsForEmployee(targetEmployeeId);
    const history = allSalaries
      .filter(salary => salary.paymentMonth !== (currentSalary?.paymentMonth || ''))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12); // Last 12 months
    setSalaryHistory(history);
  };

  const handleMarkAsPaid = () => {
    if (!currentMonthSalary) return;

    const success = markSalaryAsPaid(
      parseInt(currentMonthSalary.id.replace('sal_', '').split('_')[1]),
      currentUserId
    );

    if (success) {
      alert('Salary marked as paid! Employee has been notified.');
      // Reload salary data to show next month or updated status
      loadSalaryData();
    } else {
      alert('Error processing payment. Please try again.');
    }
  };

  const getStatusDisplayFromStatus = (status: string) => {
    switch (status) {
      case 'clocked-in':
        return { text: 'Clocked In', color: 'text-clockedIn', icon: '🟢', pulse: true };
      case 'break':
        return { text: 'On Break', color: 'text-onBreak', icon: '🟠' };
      case 'lunch':
        return { text: 'At Lunch', color: 'text-onBreak', icon: '🟡' };
      case 'clocked-out':
      default:
        return { text: 'Clocked Out', color: 'text-clockedOut', icon: '⚪' };
    }
  };

  const handleStatusChange = (newStatus: string) => {
    console.log(`🔄 Status changed to: ${newStatus}`);

    // Update the actual status state
    setCurrentStatus(newStatus);
    setIsStatusDropdownOpen(false);

    // Show success message with better UX
    const statusDisplay = getStatusDisplayFromStatus(newStatus);

    // You can replace this with your actual API call
    console.log(`✅ Status updated to: ${statusDisplay.text}`);

    // Optional: Show a toast notification instead of alert
    // showToast(`Status updated to: ${statusDisplay.text}`);
  };

  const getPendingLeaveRequests = () => {
    // Get all pending leave requests for all employees
    const pendingRequests = [];
    USERS.forEach(user => {
      const requests = getLeaveRequestsForUser(user.id);
      const pending = requests.filter(r => r.status === 'pending');
      pendingRequests.push(...pending.map(r => ({ ...r, employeeName: user.firstName })));
    });
    return pendingRequests;
  };

  useEffect(() => {
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    setTheme(savedTheme);

    const notifications = getUnreadNotificationsForUser(currentUserId);
    setUnreadNotifications(notifications.length);

    // Auto-generate monthly salaries if needed (only for boss)
    if (isBoss) {
      autoGenerateMonthlySalaries();
    }

    // Load salary data
    loadSalaryData();
  }, [userId, currentUserId, selectedEmployeeId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-status-dropdown')) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isStatusDropdownOpen]);

  if (!viewedUser) {
    return <div>User not found</div>;
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  const status = getStatusDisplayFromStatus(currentStatus); // Use managed status state
  const teamStats = calculateTeamStats();
  const pendingRequests = getPendingLeaveRequests();

  const tabs = [
    { id: 'time-tracking', label: 'Time Tracking' },
    { id: 'timesheet', label: 'Timesheet' },
    { id: 'leave-management', label: 'Leave Management' },
    { id: 'salary', label: 'Salary' },
    { id: 'calendar', label: 'Calendar' },
    ...(isOwnPage ? [{ id: 'settings', label: 'Settings' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Detail Page Wrapper - Use more screen space! */
        .detail-page-wrapper {
          max-width: 1600px; /* Much wider! */
          width: 95%; /* Use 95% of screen */
          margin: 0 auto;
          padding: 32px 0; /* Remove left/right padding */
        }

        /* Back Link (only one) */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #6B7280;
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 32px;
          padding: 0 32px; /* Add side padding here */
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #3B82F6;
        }

        /* Connected User Section (Header + Tabs + Content) */
        .user-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px 12px 0 0;
          padding: 20px 32px; /* More side padding */
          margin: 0 32px; /* Side margins */
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-avatar-compact {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #6366F1;
          color: white;
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .user-info-compact {
          flex: 1;
        }

        .user-name-compact {
          font-size: 18px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 2px;
        }

        .user-meta-compact {
          font-size: 13px;
          color: #737373;
        }

        .user-status-compact {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #F8FAFC;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
        }

        .status-icon-compact {
          font-size: 16px;
        }

        .status-text-compact {
          font-size: 13px;
          font-weight: 500;
          color: #171717;
        }

        /* Connected Tabs Section */
        .tabs-section {
          background: white;
          border-left: 1px solid #E5E5E5;
          border-right: 1px solid #E5E5E5;
          border-bottom: 1px solid #E5E5E5;
          padding: 0 32px; /* Match other sections */
          margin: 0 32px; /* Side margins */
          display: flex;
          gap: 32px;
          border-bottom: 2px solid #E5E5E5;
        }

        .tab-item {
          padding: 16px 0;
          font-size: 14px;
          font-weight: 500;
          color: #737373;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-item.active {
          color: #3B82F6;
          border-bottom-color: #3B82F6;
        }

        .tab-item:hover {
          color: #3B82F6;
        }

        /* Connected Content Section */
        .content-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-top: none;
          border-radius: 0 0 12px 12px;
          padding: 32px;
          margin: 0 32px 32px 32px; /* Side margins match, bottom margin too */
        }

        /* Professional Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }

        .stat-card {
          background: #F8FAFC;
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
        }

        .stat-card-label {
          font-size: 13px;
          color: #737373;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-card-value {
          font-size: 26px;
          font-weight: 700;
          color: #171717;
        }

        /* Better Clock Section */
        .clock-section {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
        }

        .status-row {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 24px;
        }

        .clock-button {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 14px 40px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          transition: all 0.2s ease;
        }

        .clock-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
        }

        .clock-status-display {
          font-size: 15px;
          color: #737373;
          margin-bottom: 8px;
        }

        .clock-hours-display {
          font-size: 18px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 24px;
        }

        /* Premium Navbar */
        .premium-navbar {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          height: 64px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .nav-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F5F5F5;
          transition: all 0.2s ease;
          position: relative;
          border: 1px solid #E5E5E5;
          color: #6B7280;
          cursor: pointer;
        }

        .nav-icon:hover {
          background: #E5E5E5;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        /* Action buttons for clock states */
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .action-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button-primary {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
        }

        .action-button-secondary {
          background: #F59E0B;
          color: white;
        }

        .action-button-tertiary {
          background: #6B7280;
          color: white;
        }

        /* Team Overview Section */
        .team-overview-section {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
        }

        .team-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        .team-stat-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
        }

        .team-status-table {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
        }

        .status-table {
          margin-top: 16px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 40px;
          gap: 16px;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 40px;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        /* Employee Timesheet Section */
        .employee-timesheet-section {
          background: #F8FAFC;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .timesheet-summary {
          margin-top: 16px;
          padding: 12px;
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          font-weight: 500;
          text-align: center;
        }

        /* Pending Leave Requests Section */
        .pending-requests-section {
          margin-top: 32px;
        }

        .no-pending-requests {
          background: #F8FAFC;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          color: #6B7280;
        }

        .leave-request-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .request-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .leave-type-icon {
          font-size: 24px;
        }

        .leave-type {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .request-details {
          margin-bottom: 20px;
        }

        .request-details p {
          margin-bottom: 8px;
          color: #4B5563;
        }

        .request-actions {
          display: flex;
          gap: 12px;
        }

        .approve-btn {
          padding: 10px 20px;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .approve-btn:hover {
          background: #059669;
        }

        .deny-btn {
          padding: 10px 20px;
          background: #EF4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .deny-btn:hover {
          background: #DC2626;
        }

        /* Calendar Legend and Holidays */
        .team-legend {
          background: #F8FAFC;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .legend-items {
          display: flex;
          gap: 20px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #E5E5E5;
        }

        .legend-color.worked {
          background: #10B981;
        }

        .legend-color.leave {
          background: #3B82F6;
        }

        .legend-color.sick {
          background: #F59E0B;
        }

        .legend-color.holiday {
          background: #EF4444;
        }

        .legend-color.weekend {
          background: #6B7280;
        }

        .holidays-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
        }

        .holidays-list {
          margin-top: 16px;
        }

        .holiday-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .holiday-date {
          font-weight: 500;
          color: #374151;
        }

        .holiday-name {
          color: #6B7280;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .detail-page-wrapper {
            padding: 20px 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tabs-section {
            overflow-x: auto;
            gap: 24px;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .team-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Premium Leave Management Styles */
        .leave-balance-container {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          max-width: none; /* Remove width restriction */
          width: 100%; /* Use all available space */
        }

        .leave-balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .leave-balance-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #171717;
        }

        .leave-year {
          font-size: 13px;
          color: #737373;
          background: #F5F5F5;
          padding: 4px 12px;
          border-radius: 6px;
        }

        .leave-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .leave-stat {
          background: #F8FAFC;
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .leave-stat.highlight {
          background: #ECFDF5;
          border-color: #22C55E;
        }

        .leave-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .leave-stat-content {
          flex: 1;
        }

        .leave-stat-label {
          font-size: 12px;
          color: #737373;
          margin-bottom: 4px;
        }

        .leave-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
        }

        .leave-progress-container {
          margin-top: 16px;
        }

        .leave-progress-bar {
          height: 8px;
          background: #F5F5F5;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          margin-bottom: 8px;
        }

        .leave-progress-used {
          background: #DC2626;
          height: 100%;
        }

        .leave-progress-pending {
          background: #F59E0B;
          height: 100%;
        }

        .leave-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #737373;
        }

        .pending-requests-section,
        .leave-history-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .pending-requests-section h3,
        .leave-history-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 16px;
        }

        .empty-state-nice {
          text-align: center;
          padding: 40px 20px;
          background: #F8FAFC;
          border-radius: 12px;
          border: 2px dashed #E5E5E5;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          background: #ECFDF5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 16px;
        }

        .empty-text {
          font-size: 16px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 6px;
        }

        .empty-subtext {
          font-size: 14px;
          color: #737373;
        }

        .leave-history-table {
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          overflow: hidden;
        }

        .history-header {
          display: grid;
          grid-template-columns: 1fr 1.5fr 80px 100px 1fr;
          background: #F9FAFB;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #E5E5E5;
        }

        .empty-state-subtle {
          padding: 32px;
          text-align: center;
          color: #737373;
          font-size: 14px;
        }

        /* Calendar Styles - EXACTLY AS SPECIFIED */
        /* Wrapper */
        .team-calendar-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .calendar-title {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
          margin-bottom: 20px;
        }

        /* Calendar Card */
        .calendar-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        /* Navigation */
        .calendar-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .month-year {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }

        .nav-arrow {
          width: 32px;
          height: 32px;
          border: 1px solid #E5E5E5;
          background: white;
          border-radius: 6px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #737373;
        }

        .nav-arrow:hover {
          background: #F5F5F5;
        }

        /* Legend */
        .legend-bar {
          display: flex;
          gap: 20px;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #737373;
          font-weight: 500;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.green { background: #22C55E; }
        .dot.blue { background: #3B82F6; }
        .dot.orange { background: #F59E0B; }
        .dot.red { background: #EF4444; }
        .dot.gray { background: #A3A3A3; }

        /* CALENDAR GRID - THIS IS THE KEY PART */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        /* Weekday Headers */
        .weekday {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #737373;
          padding: 10px 0;
          letter-spacing: 0.5px;
        }

        /* Day Cells */
        .day-cell {
          aspect-ratio: 1;
          border: 1px solid #F5F5F5;
          border-radius: 8px;
          padding: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .day-cell:hover:not(.empty) {
          background: #F8FAFC;
          border-color: #E5E5E5;
        }

        .day-cell.empty {
          border: none;
          cursor: default;
          background: transparent;
        }

        .day-cell.weekend {
          background: #FAFAFA;
        }

        .day-cell.today {
          background: #EFF6FF;
          border: 2px solid #3B82F6;
        }

        .day-num {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
        }

        .day-cell.weekend .day-num {
          color: #A3A3A3;
        }

        .today-tag {
          font-size: 8px;
          font-weight: 700;
          color: #3B82F6;
          text-transform: uppercase;
          margin-top: auto;
        }

        /* Holidays Section */
        .holidays-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .holidays-title {
          font-size: 16px;
          font-weight: 700;
          color: #171717;
          margin: 0 0 16px 0;
        }

        .holiday-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .holiday-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #FAFAFA;
          border-radius: 8px;
        }

        .h-date {
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        }

        .h-name {
          font-size: 13px;
          color: #171717;
          font-weight: 600;
        }

        /* Premium Calendar Styles */
        .calendar-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          max-width: none; /* Remove width restriction */
          width: 100%; /* Use all available space */
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .calendar-month {
          font-size: 20px;
          font-weight: 600;
          color: #171717;
        }

        .cal-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #E5E5E5;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cal-nav-btn:hover {
          background: #F5F5F5;
          border-color: #D4D4D4;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }

        .calendar-weekdays > div {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          padding: 8px 0;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .calendar-day {
          aspect-ratio: 1;
          border: 1px solid #F5F5F5;
          border-radius: 8px;
          padding: 8px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .calendar-day:hover:not(.empty) {
          background: #F8FAFC;
          border-color: #E5E5E5;
        }

        .calendar-day.empty {
          border: none;
          cursor: default;
        }

        .calendar-day.next-month {
          opacity: 0.3;
        }

        .calendar-day.weekend .day-number {
          color: #A3A3A3;
        }

        .calendar-day.today {
          background: #EFF6FF;
          border-color: #3B82F6;
        }

        .calendar-day.holiday {
          background: #FEF2F2;
          border-color: #FCA5A5;
        }

        .day-number {
          font-size: 14px;
          font-weight: 500;
          color: #171717;
          margin-bottom: 4px;
        }

        .day-badge {
          font-size: 9px;
          font-weight: 600;
          color: #3B82F6;
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          text-align: center;
        }

        .day-event {
          font-size: 9px;
          color: #DC2626;
          font-weight: 500;
          line-height: 1.2;
          margin-top: auto;
        }

        /* Calendar Legend and Holidays */
        .team-legend {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .team-legend h4 {
          font-size: 16px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 16px;
        }

        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #E5E5E5;
        }

        .legend-color.worked {
          background: #ECFDF5;
        }

        .legend-color.leave {
          background: #FEF3C7;
        }

        .legend-color.sick {
          background: #FEE2E2;
        }

        .legend-color.holiday {
          background: #F3E8FF;
        }

        .legend-color.weekend {
          background: #F8FAFC;
        }

        .holidays-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .holidays-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 16px;
        }

        .holidays-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .holiday-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #F8FAFC;
          border-radius: 8px;
        }

        .holiday-date {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .holiday-name {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
        }

        /* Status Dropdown Styles */
        .user-status-dropdown {
          position: relative;
          margin-left: auto;
        }

        .status-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          font-size: 14px;
          color: #171717;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          min-width: 150px;
        }

        .status-button:hover {
          background: #F8FAFC;
          border-color: #D4D4D4;
        }

        .status-button:active {
          transform: scale(0.98);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-dot.clocked-in {
          background: #22C55E;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }

        .status-dot.clocked-out {
          background: #D4D4D4;
        }

        .status-dot.break {
          background: #F59E0B;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }

        .status-dot.lunch {
          background: #3B82F6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .status-text {
          flex: 1;
        }

        .dropdown-icon {
          color: #737373;
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .status-button.open .dropdown-icon {
          transform: rotate(180deg);
        }

        /* Clean Professional Dropdown Menu */
        .status-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;

          /* Clean white background */
          background: white;

          /* Subtle border */
          border: 1px solid #E5E5E5;

          /* Smooth rounded corners */
          border-radius: 12px;

          /* Professional shadow */
          box-shadow:
            0 10px 40px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(0, 0, 0, 0.04);

          /* Size */
          min-width: 240px;
          padding: 8px;

          /* Animation */
          opacity: 0;
          visibility: hidden;
          transform: translateY(-4px);
          transition: all 0.15s ease;

          z-index: 1000;
        }

        .status-dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* Header */
        .dropdown-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #A3A3A3;
          padding: 8px 12px 8px;
          margin-bottom: 4px;
        }

        /* Clean Dropdown Items */
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          user-select: none;
        }

        .dropdown-item:hover {
          background: #F8FAFC;
        }

        .dropdown-item.active {
          background: #F0F9FF;
        }

        /* Clean Status Icons */
        .status-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .status-icon-box.green {
          background: #ECFDF5;
          color: #22C55E;
        }

        .status-icon-box.gray {
          background: #F5F5F5;
          color: #737373;
        }

        .status-icon-box.orange {
          background: #FEF3C7;
          color: #F59E0B;
        }

        .status-icon-box.blue {
          background: #EFF6FF;
          color: #3B82F6;
        }

        /* Status Content */
        .status-content {
          flex: 1;
          min-width: 0;
        }

        .status-title {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
          line-height: 1.2;
          margin-bottom: 2px;
        }

        .status-subtitle {
          font-size: 12px;
          color: #737373;
          line-height: 1.3;
        }

        /* Check Mark */
        .active-check {
          width: 18px;
          height: 18px;
          background: #3B82F6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Divider */
        .dropdown-divider {
          height: 1px;
          background: #F5F5F5;
          margin: 8px 4px;
        }

        /* COMPACT PREMIUM SALARY MANAGEMENT STYLES */

        /* Container */
        .salary-management-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
          margin-bottom: 20px;
        }

        /* Employee Selector */
        .employee-selector-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          transition: all 0.2s;
        }

        .employee-selector-card:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .selector-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 8px;
        }

        .employee-select-premium {
          width: 100%;
          height: 40px;
          padding: 0 14px;
          font-size: 14px;
          color: #171717;
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .employee-select-premium:hover {
          border-color: #D4D4D4;
        }

        .employee-select-premium:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Current Salary Card */
        .current-salary-section {
          margin-bottom: 20px;
        }

        .salary-card-premium {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          transition: all 0.2s;
        }

        .salary-card-premium:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .salary-card-header {
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
          padding: 16px 20px;
          border-bottom: 1px solid #BFDBFE;
        }

        .salary-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .salary-month {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }

        .status-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .status-badge.pending {
          background: #FEF3C7;
          color: #92400E;
        }

        .status-badge.paid {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-badge.overdue {
          background: #FEE2E2;
          color: #991B1B;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-badge.pending .status-dot {
          background: #F59E0B;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
        }

        .status-badge.paid .status-dot {
          background: #22C55E;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }

        .status-badge.overdue .status-dot {
          background: #EF4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        /* Salary Card Body */
        .salary-card-body {
          padding: 20px;
        }

        .salary-info-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr 1fr;
          gap: 16px;
          padding: 24px;
          background: white;
          margin-bottom: 16px;
          border-radius: 8px;
          border: 1px solid #F1F5F9;
        }

        .info-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-col.featured {
          background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
          border: 1px solid #86EFAC;
          border-radius: 8px;
          padding: 12px;
        }

        .info-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #737373;
        }

        .info-value {
          font-size: 15px;
          font-weight: 600;
          color: #171717;
        }

        .info-value.highlight {
          font-size: 24px;
          font-weight: 700;
          color: #16A34A;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge.pending {
          background: #FEF3C7;
          color: #92400E;
        }

        .badge.paid {
          background: #D1FAE5;
          color: #065F46;
        }

        .badge.overdue {
          background: #FEE2E2;
          color: #991B1B;
        }

        .info-value.status {
          text-transform: capitalize;
        }

        /* Mark as Paid Button */
        .btn-mark-paid {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
        }

        .btn-mark-paid:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35);
        }

        .btn-mark-paid:active {
          transform: translateY(0);
        }

        /* Paid Confirmation */
        .paid-confirmation {
          background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
          border: 2px solid #86EFAC;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }

        .confirmation-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .confirmation-header svg {
          color: #22C55E;
          width: 24px;
          height: 24px;
        }

        .confirmation-text {
          font-size: 18px;
          font-weight: 700;
          color: #166534;
        }

        .confirmation-subtext {
          font-size: 14px;
          color: #15803D;
        }

        /* Payment History Table */
        .payment-history-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          margin-bottom: 20px;
          transition: all 0.2s;
        }

        .payment-history-section:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #171717;
          margin-bottom: 16px;
        }

        .history-table {
          width: 100%;
        }

        .history-header {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 10px 14px;
          background: #F8FAFC;
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #737373;
        }

        .history-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid #F5F5F5;
          align-items: center;
          transition: all 0.2s;
        }

        .history-row:hover {
          background: #F8FAFC;
        }

        .history-row:last-child {
          border-bottom: none;
        }

        .month-label {
          font-size: 13px;
          font-weight: 600;
          color: #171717;
        }

        .col-period,
        .col-date {
          font-size: 13px;
          color: #6B7280;
        }

        .col-amount {
          font-size: 13px;
          font-weight: 700;
          color: #171717;
        }

        /* Empty States */
        .payment-history-empty {
          text-align: center;
          padding: 48px 24px;
          background: #FAFAFA;
          border-radius: 12px;
          border: 2px dashed #E5E5E5;
        }

        .empty-icon-circle {
          width: 64px;
          height: 64px;
          background: white;
          border: 2px solid #F5F5F5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .empty-icon-circle svg {
          color: #D4D4D4;
        }

        .empty-title {
          font-size: 15px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 6px;
        }

        .empty-subtitle {
          font-size: 13px;
          color: #737373;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #F8FAFC;
          border-radius: 12px;
          border: 2px dashed #E5E5E5;
          margin-top: 24px;
        }

        /* Employee Salary Card */
        .employee-salary-card {
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .employee-salary-card.pending {
          background: linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%);
          border: 2px solid #FDE047;
        }

        .employee-salary-card.paid {
          background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
          border: 2px solid #34D399;
        }

        .employee-salary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .employee-salary-title {
          font-size: 24px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }

        .employee-salary-body {
          text-align: center;
        }

        .salary-month-display {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 16px;
        }

        .salary-amount-display {
          font-size: 48px;
          font-weight: 800;
          color: #171717;
          margin-bottom: 16px;
        }

        .salary-work-period {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 24px;
        }

        .salary-status-info {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .paid-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #059669;
          font-weight: 600;
        }

        .paid-icon {
          font-size: 20px;
        }

        .pending-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #D97706;
          font-weight: 600;
        }

        .pending-icon {
          font-size: 20px;
        }

        /* Employee History Section */
        .employee-history-section {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .employee-history-title {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
          margin-bottom: 24px;
        }

        .employee-history-grid {
          display: grid;
          gap: 16px;
        }

        .employee-history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #F8FAFC;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .employee-history-item:hover {
          background: #F1F5F9;
        }

        .employee-history-month {
          font-size: 16px;
          font-weight: 600;
          color: #171717;
        }

        .employee-history-amount {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .salary-info-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .salary-management-container {
            padding: 20px 0;
          }

          .salary-card-header {
            padding: 24px;
          }

          .salary-card-body {
            padding: 24px;
          }

          .salary-info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .history-header,
          .history-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .history-header {
            display: none;
          }

          .history-row {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid #F5F5F5;
          }

          .col-month {
            font-weight: 700;
            margin-bottom: 4px;
          }

          .col-month::before {
            content: 'Month: ';
            font-weight: 600;
            color: #737373;
          }

          .col-period::before {
            content: 'Period: ';
            font-weight: 600;
            color: #737373;
          }

          .col-amount::before {
            content: 'Amount: ';
            font-weight: 600;
            color: #737373;
          }

          .col-date::before {
            content: 'Paid: ';
            font-weight: 600;
            color: #737373;
          }

        /* COMPLETE WORKING CALENDAR STYLES */

        /* Page Wrapper */
        .calendar-page-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .calendar-page-title {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
          margin-bottom: 20px;
        }

        /* Main Calendar Card */
        .calendar-main-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        /* Calendar Header */
        .cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .cal-month {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }

        .cal-nav-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #E5E5E5;
          background: white;
          border-radius: 6px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #737373;
        }

        .cal-nav-btn:hover {
          background: #F5F5F5;
        }

        /* Legend */
        .cal-legend {
          display: flex;
          gap: 20px;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #737373;
          font-weight: 500;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.green { background: #22C55E; }
        .dot.blue { background: #3B82F6; }
        .dot.orange { background: #F59E0B; }
        .dot.red { background: #EF4444; }
        .dot.gray { background: #A3A3A3; }

        /* Calendar Grid Wrapper */
        .cal-grid-wrapper {
          width: 100%;
        }

        /* Weekday Headers */
        .cal-weekdays {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 4px;
          margin-bottom: 4px;
        }

        .cal-weekdays div {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: #737373;
          padding: 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Days Grid - FORCE 7 COLUMN LAYOUT - MAXIMUM SPECIFICITY */
        div.calendar-main-card div.cal-grid-wrapper div.cal-days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 4px !important;
          width: 100% !important;
          grid-auto-rows: minmax(60px, auto) !important;
          flex-direction: unset !important;
        }

        /* Force every cal-day to be a grid cell - MAXIMUM SPECIFICITY */
        div.calendar-main-card div.cal-grid-wrapper div.cal-days div.cal-day {
          grid-column: auto !important;
          grid-row: auto !important;
          width: 100% !important;
          height: 60px !important;
          min-height: 60px !important;
          display: flex !important;
          flex-direction: column !important;
          float: none !important;
          clear: none !important;
        }

        /* Day Cell */
        .cal-day {
          aspect-ratio: 1.2;
          border: 1px solid #F5F5F5;
          border-radius: 8px;
          padding: 10px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .cal-day:hover:not(.empty) {
          background: #F8FAFC;
          border-color: #E5E5E5;
        }

        .cal-day.empty {
          border: none;
          cursor: default;
          background: transparent;
        }

        .cal-day.weekend {
          background: #FAFAFA;
        }

        .cal-day.today {
          background: #3B82F6;
          color: white;
        }

        .cal-day.today .day-num {
          color: white;
        }

        .cal-day.today .today-label {
          color: white;
          font-size: 9px;
          font-weight: 500;
        }

        .cal-day.holiday {
          background: #FEF2F2;
          border-color: #FCA5A5;
        }

        /* Day Number */
        .day-num {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 4px;
        }

        .cal-day.weekend .day-num {
          color: #A3A3A3;
        }

        /* Today Label */
        .today-label {
          font-size: 8px;
          font-weight: 700;
          color: #3B82F6;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: auto;
        }

        /* Event Labels (for holidays/leave) */
        .event-label {
          font-size: 9px;
          font-weight: 600;
          padding: 3px 5px;
          border-radius: 4px;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .event-label.holiday {
          background: #FEE2E2;
          color: #991B1B;
        }

        .event-label.leave {
          background: #DBEAFE;
          color: #1E40AF;
        }

        /* Holidays Card */
        .holidays-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .holidays-header {
          font-size: 16px;
          font-weight: 700;
          color: #171717;
          margin-bottom: 16px;
        }

        .holidays-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .holiday-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #FAFAFA;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .holiday-row:hover {
          background: #F5F5F5;
        }

        .h-date {
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        }

        .h-name {
          font-size: 13px;
          color: #171717;
          font-weight: 600;
        }

        /* Calendar Responsive */
        @media (max-width: 768px) {
          .cal-days {
            gap: 2px;
          }

          .cal-day {
            padding: 6px;
          }

          .day-num {
            font-size: 12px;
          }

          .event-label {
            font-size: 8px;
          }

          .cal-legend {
            gap: 12px;
          }
        }
        }
      `}</style>

      {/* Premium Navbar */}
      <nav className="premium-navbar fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-8 flex items-center justify-between">
          {/* Right Section only (no back button) */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="nav-icon"
            >
              {theme === 'light' ? <Moon className="w-6 h-6 text-gray-600" /> : <Sun className="w-6 h-6 text-gray-600" />}
            </button>

            {/* Notifications */}
            <button className="nav-icon relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>

            {/* User Avatar */}
            <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold ${
              isBoss ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {viewedUser.firstName[0]}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        <div className="detail-page-wrapper">
          {/* Single Back Link (only one) */}
          <a href="/" className="back-link">
            ← Back to Dashboard
          </a>

          {/* Connected User Section (Header + Tabs + Content) */}
          <div className="user-section">
            {/* Compact Avatar */}
            <div className={`user-avatar-compact ${
              isBoss ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {viewedUser.firstName[0]}
            </div>

            {/* User Info */}
            <div className="user-info-compact">
              <h1 className="user-name-compact">{viewedUser.firstName}</h1>
              <div className="user-meta-compact">
                {isBoss ? 'Management' : 'Employee'} • Sydney, Australia
              </div>
            </div>

            {/* Status Dropdown - Your Complete Solution */}
            <div className="user-status-dropdown">
              <button
                id="statusButton"
                className={`status-button ${isStatusDropdownOpen ? 'open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                }}
              >
                <span className={`status-dot ${status.text === 'Clocked In' ? 'clocked-in' : status.text === 'On Break' ? 'break' : status.text === 'At Lunch' ? 'lunch' : 'clocked-out'}`}></span>
                <span className="status-text">{status.text}</span>
                <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </button>

              <div id="statusMenu" className={`status-dropdown-menu ${isStatusDropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-header">Change Status</div>

                <div
                  data-status="clocked-in"
                  className={`dropdown-item ${currentStatus === 'clocked-in' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('clocked-in');
                  }}
                >
                  <div className="status-icon-box green">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M12 3.5L5.5 10L2 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="status-content">
                    <div className="status-title">Clock In</div>
                    <div className="status-subtitle">Start tracking time</div>
                  </div>
                  {currentStatus === 'clocked-in' && <div className="active-check">✓</div>}
                </div>

                <div
                  data-status="clocked-out"
                  className={`dropdown-item ${currentStatus === 'clocked-out' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('clocked-out');
                  }}
                >
                  <div className="status-icon-box gray">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="status-content">
                    <div className="status-title">Clock Out</div>
                    <div className="status-subtitle">Stop tracking time</div>
                  </div>
                  {currentStatus === 'clocked-out' && <div className="active-check">✓</div>}
                </div>

                <div className="dropdown-divider"></div>

                <div
                  data-status="break"
                  className={`dropdown-item ${currentStatus === 'break' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('break');
                  }}
                >
                  <div className="status-icon-box orange">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                      <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="status-content">
                    <div className="status-title">On Break</div>
                    <div className="status-subtitle">Taking a short break</div>
                  </div>
                  {currentStatus === 'break' && <div className="active-check">✓</div>}
                </div>

                <div
                  data-status="lunch"
                  className={`dropdown-item ${currentStatus === 'lunch' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('lunch');
                  }}
                >
                  <div className="status-icon-box blue">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5h8v6a1 1 0 01-1 1H4a1 1 0 01-1-1V5zM5 5V3M9 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="status-content">
                    <div className="status-title">At Lunch</div>
                    <div className="status-subtitle">Out for lunch break</div>
                  </div>
                  {currentStatus === 'lunch' && <div className="active-check">✓</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Connected Tabs Section */}
          <div className="tabs-section">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Connected Content Section */}
          <div className="content-section">
            {activeTab === 'time-tracking' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Time Tracking</h2>

                {isBoss ? (
                  // BOSS VIEW: Team Management Features
                  <>
                    {/* Team Overview Section */}
                    <div className="team-overview-section">
                      <h3>Team Overview</h3>
                      <div className="team-stats-grid">
                        <div className="team-stat-card">
                          <div className="stat-card-label">Team Hours</div>
                          <div className="stat-card-value">This Week</div>
                          <div className="stat-card-value">{formatHours(teamStats.totalWeekHours)}</div>
                        </div>
                        <div className="team-stat-card">
                          <div className="stat-card-label">Currently</div>
                          <div className="stat-card-value">Working</div>
                          <div className="stat-card-value">{teamStats.currentlyWorking}/{USERS.length}</div>
                        </div>
                        <div className="team-stat-card">
                          <div className="stat-card-label">On Break</div>
                          <div className="stat-card-value"></div>
                          <div className="stat-card-value">{teamStats.onBreak}/{USERS.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Team Status Table */}
                    <div className="team-status-table">
                      <h4>Team Status</h4>
                      <div className="status-table">
                        <div className="table-header">
                          <div>Name</div>
                          <div>Status</div>
                          <div>Today</div>
                          <div>Week</div>
                          <div>Month</div>
                          <div></div>
                        </div>
                        {USERS.map(user => {
                          const userStatus = getStatusDisplay(user.id);
                          const userHours = getUserHours(user.id);
                          return (
                            <div key={user.id} className="table-row">
                              <div>{user.firstName}</div>
                              <div>{userStatus.icon} {userStatus.text}</div>
                              <div>{formatHours(userHours)}</div>
                              <div>0h 00m</div>
                              <div>0h 00m</div>
                              <div>→</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  // EMPLOYEE VIEW: Personal Time Tracking Features
                  <>
                    {/* Professional Clock Section */}
                    <div className="clock-section">
                      <div className="status-row">
                        <div>
                          <div className="clock-status-display">Current Status</div>
                          <div className="font-semibold text-gray-900">{status.text}</div>
                        </div>
                        <div>
                          <div className="clock-status-display">Today's Hours</div>
                          <div className="clock-hours-display">{formatHours(getUserHours(userId))}</div>
                        </div>
                      </div>

                      {status.text === 'Clocked Out' ? (
                        <button className="clock-button">
                          🕐 CLOCK IN
                        </button>
                      ) : (
                        <div className="action-buttons">
                          <button className="action-button action-button-primary">
                            🛑 CLOCK OUT
                          </button>
                          <button className="action-button action-button-secondary">
                            ☕ START LUNCH
                          </button>
                          <button className="action-button action-button-tertiary">
                            ⏸ START BREAK
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Professional Stats Cards */}
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-card-label">Today</div>
                        <div className="stat-card-value">{formatHours(getUserHours(userId))}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-card-label">This Week</div>
                        <div className="stat-card-value">0h 0m</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-card-label">This Month</div>
                        <div className="stat-card-value">0h 0m</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'timesheet' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isBoss ? 'Team Timesheet' : 'Your Timesheet'}
                  </h2>
                  {isBoss && (
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                      ⬇ Export to CSV
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-1 mb-6">
                  <div className="flex space-x-1">
                    {['Today', 'This Week', 'This Month', 'All'].map((filter) => (
                      <button
                        key={filter}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          filter === 'All'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {isBoss ? (
                  // BOSS VIEW: All 3 employees' timesheets
                  <>
                    {USERS.map(user => {
                      const entries = getTimeEntriesForUser(user.id);
                      return (
                        <div key={user.id} className="employee-timesheet-section">
                          <h4>{user.firstName}'s Timesheet</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full bg-white rounded-lg">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock In</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock Out</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hours</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 text-gray-900">Nov 11</td>
                                  <td className="py-3 px-4 text-gray-600">9:00 AM</td>
                                  <td className="py-3 px-4 text-gray-600">5:30 PM</td>
                                  <td className="py-3 px-4 text-gray-900 font-medium">7h 15m</td>
                                  <td className="py-3 px-4"><span className="text-green-500 font-semibold">✓</span></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="timesheet-summary">Total: 7h 15m | Days: 1</div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  // EMPLOYEE VIEW: Personal timesheet
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Timesheet</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded-lg">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock In</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock Out</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Hours</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">Nov 11</td>
                            <td className="py-3 px-4 text-gray-600">9:00 AM</td>
                            <td className="py-3 px-4 text-gray-600">5:30 PM</td>
                            <td className="py-3 px-4 text-gray-900 font-medium">7h 15m</td>
                            <td className="py-3 px-4"><span className="text-green-500 font-semibold">✓</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leave-management' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {isBoss ? 'Leave Management' : 'Your Leave Management'}
                  </h2>
                  <p className="text-gray-600">
                    {isBoss ? 'Manage employee leave requests and balances.' : 'Manage your leave requests and balance.'}
                  </p>
                </div>

                {isBoss ? (
                  // BOSS VIEW: Leave Management with Approve/Deny
                  <>
                    {/* Select Employee */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Employee:
                      </label>
                      <select
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg text-base bg-white focus:border-blue-500 focus:outline-none"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))}
                      >
                        <option value={3}>Larina</option>
                        <option value={1}>Ella</option>
                        <option value={2}>Paul</option>
                      </select>
                    </div>

                    {/* Leave Balance Container */}
                    <div className="leave-balance-container mb-6">
                      <div className="leave-balance-header">
                        <h3>{selectedEmployeeId === 3 ? 'Larina' : selectedEmployeeId === 1 ? 'Ella' : 'Paul'}'s Annual Leave Balance</h3>
                        <span className="leave-year">2025 Period</span>
                      </div>

                      <div className="leave-stats-grid">
                        {/* Total Allocation */}
                        <div className="leave-stat">
                          <div className="leave-stat-icon" style={{background: '#EFF6FF', color: '#3B82F6'}}>
                            📋
                          </div>
                          <div className="leave-stat-content">
                            <div className="leave-stat-label">Total</div>
                            <div className="leave-stat-value">{PTO_ANNUAL_DAYS} days</div>
                          </div>
                        </div>

                        {/* Used */}
                        <div className="leave-stat">
                          <div className="leave-stat-icon" style={{background: '#FEE2E2', color: '#DC2626'}}>
                            ✓
                          </div>
                          <div className="leave-stat-content">
                            <div className="leave-stat-label">Used</div>
                            <div className="leave-stat-value">{calculateLeaveBalance(selectedEmployeeId).used} days</div>
                          </div>
                        </div>

                        {/* Pending */}
                        <div className="leave-stat">
                          <div className="leave-stat-icon" style={{background: '#FEF3C7', color: '#F59E0B'}}>
                            ⏳
                          </div>
                          <div className="leave-stat-content">
                            <div className="leave-stat-label">Pending</div>
                            <div className="leave-stat-value">{calculateLeaveBalance(selectedEmployeeId).pending} days</div>
                          </div>
                        </div>

                        {/* Remaining */}
                        <div className="leave-stat highlight">
                          <div className="leave-stat-icon" style={{background: '#ECFDF5', color: '#22C55E'}}>
                            ✨
                          </div>
                          <div className="leave-stat-content">
                            <div className="leave-stat-label">Remaining</div>
                            <div className="leave-stat-value">{calculateLeaveBalance(selectedEmployeeId).remaining} days</div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="leave-progress-container">
                        <div className="leave-progress-bar">
                          <div className="leave-progress-used" style={{width: `${(calculateLeaveBalance(selectedEmployeeId).used / PTO_ANNUAL_DAYS) * 100}%`}}></div>
                          <div className="leave-progress-pending" style={{width: `${(calculateLeaveBalance(selectedEmployeeId).pending / PTO_ANNUAL_DAYS) * 100}%`}}></div>
                        </div>
                        <div className="leave-progress-labels">
                          <span>Jan 1, 2025</span>
                          <span>Resets: Aug 25, 2026</span>
                        </div>
                      </div>
                    </div>

                    {/* Pending Leave Requests Section */}
                    <div className="pending-requests-section mb-6">
                      <h3>Pending Leave Requests</h3>
                      {pendingRequests.length === 0 ? (
                        <div className="empty-state-nice">
                          <div className="empty-icon">✓</div>
                          <div className="empty-text">All caught up!</div>
                          <div className="empty-subtext">No pending leave requests to review</div>
                        </div>
                      ) : (
                        pendingRequests.map(request => (
                          <div key={request.id} className="leave-request-card">
                            <div className="request-header">
                              <span className="leave-type-icon">📅</span>
                              <span className="leave-type">Annual Leave Request</span>
                            </div>
                            <div className="request-details">
                              <p><strong>Employee:</strong> {request.employeeName}</p>
                              <p><strong>Dates:</strong> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.daysRequested} days)</p>
                              <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                              <p><strong>Reason:</strong> {request.reason || 'Personal time'}</p>
                              <p><strong>Balance after approval:</strong> {Math.max(0, calculateLeaveBalance(request.employeeId).remaining - request.daysRequested)} days remaining</p>
                            </div>
                            <div className="request-actions">
                              <button
                                className="approve-btn"
                                onClick={() => handleLeaveAction(request.id, 'approve')}
                              >
                                ✓ Approve
                              </button>
                              <button
                                className="deny-btn"
                                onClick={() => handleLeaveAction(request.id, 'deny')}
                              >
                                ✗ Deny
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Leave History Section */}
                    <div className="leave-history-section">
                      <h3>Recent Leave History</h3>

                      <div className="leave-history-table">
                        <div className="history-header">
                          <div>Type</div>
                          <div>Dates</div>
                          <div>Days</div>
                          <div>Status</div>
                          <div>Approved By</div>
                        </div>

                        <div className="empty-state-subtle">
                          No leave history yet
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // EMPLOYEE VIEW: Personal Leave Balance
                  <div className="leave-balance-container mb-6">
                    <div className="leave-balance-header">
                      <h3>Your Annual Leave Balance</h3>
                      <span className="leave-year">2025 Period</span>
                    </div>

                    <div className="leave-stats-grid">
                      {/* Total Allocation */}
                      <div className="leave-stat">
                        <div className="leave-stat-icon" style={{background: '#EFF6FF', color: '#3B82F6'}}>
                          📋
                        </div>
                        <div className="leave-stat-content">
                          <div className="leave-stat-label">Total</div>
                          <div className="leave-stat-value">{PTO_ANNUAL_DAYS} days</div>
                        </div>
                      </div>

                      {/* Used */}
                      <div className="leave-stat">
                        <div className="leave-stat-icon" style={{background: '#FEE2E2', color: '#DC2626'}}>
                          ✓
                        </div>
                        <div className="leave-stat-content">
                          <div className="leave-stat-label">Used</div>
                          <div className="leave-stat-value">{calculateLeaveBalance(userId).used} days</div>
                        </div>
                      </div>

                      {/* Pending */}
                      <div className="leave-stat">
                        <div className="leave-stat-icon" style={{background: '#FEF3C7', color: '#F59E0B'}}>
                          ⏳
                        </div>
                        <div className="leave-stat-content">
                          <div className="leave-stat-label">Pending</div>
                          <div className="leave-stat-value">{calculateLeaveBalance(userId).pending} days</div>
                        </div>
                      </div>

                      {/* Remaining */}
                      <div className="leave-stat highlight">
                        <div className="leave-stat-icon" style={{background: '#ECFDF5', color: '#22C55E'}}>
                          ✨
                        </div>
                        <div className="leave-stat-content">
                          <div className="leave-stat-label">Remaining</div>
                          <div className="leave-stat-value">{calculateLeaveBalance(userId).remaining} days</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="leave-progress-container">
                      <div className="leave-progress-bar">
                        <div className="leave-progress-used" style={{width: `${(calculateLeaveBalance(userId).used / PTO_ANNUAL_DAYS) * 100}%`}}></div>
                        <div className="leave-progress-pending" style={{width: `${(calculateLeaveBalance(userId).pending / PTO_ANNUAL_DAYS) * 100}%`}}></div>
                      </div>
                      <div className="leave-progress-labels">
                        <span>Jan 1, 2025</span>
                        <span>Resets: Aug 25, 2026</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="salary-management-container">
                <h2 className="page-title">
                  {isBoss ? 'Employee Salary Management' : 'Salary Information'}
                </h2>

                {isBoss ? (
                  // PREMIUM BOSS SALARY MANAGEMENT INTERFACE
                  <>
                    {/* Employee Selector Card */}
                    <div className="employee-selector-card">
                      <label className="selector-label">Select Employee:</label>
                      <select
                        className="employee-select-premium"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))}
                      >
                        <option value="">Choose an employee...</option>
                        <option value={3}>Larina - Operations</option>
                        {/* Add more employees here - NEVER include Ella or Paul */}
                      </select>
                    </div>

                    {selectedEmployeeId && currentMonthSalary && (
                      <>
                        {/* Current Salary Card - PREMIUM DESIGN */}
                        <div className="current-salary-section">
                          <div className="salary-card-premium">
                            <div className="salary-card-header">
                              <div className="salary-title-row">
                                <h3 className="salary-month">💰 {currentMonthSalary.paymentMonth} Salary</h3>
                                <span className={`status-badge ${currentMonthSalary.status}`}>
                                  <span className="status-dot"></span>
                                  {currentMonthSalary.status === 'paid' ? 'Paid' :
                                   currentMonthSalary.status === 'overdue' ? 'Overdue' :
                                   'Pending Payment'}
                                </span>
                              </div>
                            </div>

                            <div className="salary-card-body">
                              <div className="salary-info-row">
                                <div className="info-col">
                                  <div className="info-label">WORK PERIOD</div>
                                  <div className="info-value">
                                    {new Date(currentMonthSalary.workPeriodStart).toLocaleDateString()} - {new Date(currentMonthSalary.workPeriodEnd).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="info-col">
                                  <div className="info-label">DUE DATE</div>
                                  <div className="info-value">{new Date(currentMonthSalary.dueDate).toLocaleDateString()}</div>
                                </div>

                                <div className="info-col featured">
                                  <div className="info-label">AMOUNT</div>
                                  <div className="info-value highlight">₱{currentMonthSalary.amount.toLocaleString()}.00</div>
                                </div>

                                <div className="info-col">
                                  <div className="info-label">STATUS</div>
                                  <div className="info-value">
                                    <span className={`badge ${currentMonthSalary.status}`}>
                                      {currentMonthSalary.status === 'paid' ? 'Paid' :
                                       currentMonthSalary.status === 'overdue' ? 'Overdue' :
                                       'Pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {currentMonthSalary.status !== 'paid' && (
                                <button
                                  onClick={handleMarkAsPaid}
                                  className="btn-mark-paid"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  Mark as Paid and Notify Employee
                                </button>
                              )}

                              {currentMonthSalary.status === 'paid' && (
                                <div className="paid-confirmation">
                                  <div className="confirmation-header">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z" fill="currentColor"/>
                                    </svg>
                                    <span className="confirmation-text">
                                      Paid on {new Date(currentMonthSalary.paidDate!).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="confirmation-subtext">
                                    Employee has been notified successfully
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Payment History Table - PREMIUM */}
                        <div className="payment-history-section">
                          <h3 className="section-title">Payment History</h3>

                          {salaryHistory.length > 0 ? (
                            <div className="history-table">
                              <div className="history-header">
                                <div className="col-month">Month</div>
                                <div className="col-period">Work Period</div>
                                <div className="col-amount">Amount</div>
                                <div className="col-date">Paid Date</div>
                                <div className="col-status">Status</div>
                              </div>

                              {salaryHistory.map((salary) => (
                                <div key={salary.id} className="history-row">
                                  <div className="col-month">
                                    <div className="month-label">{salary.paymentMonth}</div>
                                  </div>
                                  <div className="col-period">
                                    {new Date(salary.workPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(salary.workPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="col-amount">₱{salary.amount.toLocaleString()}.00</div>
                                  <div className="col-date">
                                    {salary.paidDate ? new Date(salary.paidDate).toLocaleDateString() : '-'}
                                  </div>
                                  <div className="col-status">
                                    <span className={`status-badge ${salary.status}`}>
                                      <span className="status-dot"></span>
                                      {salary.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="payment-history-empty">
                              <div className="empty-icon-circle">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <path d="M8 12h16M8 16h10M8 20h12" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round"/>
                                  <rect x="6" y="8" width="20" height="18" rx="2" stroke="#D4D4D4" strokeWidth="2"/>
                                </svg>
                              </div>
                              <div className="empty-title">No payment history yet</div>
                              <div className="empty-subtitle">Payment records will appear here once salary is marked as paid</div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {!selectedEmployeeId && (
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <div className="empty-title">Select an Employee</div>
                        <div className="empty-subtitle">Choose an employee from the dropdown above to manage their salary</div>
                      </div>
                    )}
                  </>
                ) : (
                  // EMPLOYEE SALARY VIEW - PREMIUM
                  <>
                    {currentMonthSalary && (
                      <div className={`employee-salary-card ${currentMonthSalary.status}`}>
                        <div className="employee-salary-header">
                          <h3 className="employee-salary-title">
                            💰 Your Salary Status
                          </h3>
                          <span className={`status-badge ${currentMonthSalary.status}`}>
                            <span className="status-dot"></span>
                            {currentMonthSalary.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>

                        <div className="employee-salary-body">
                          <div className="salary-month-display">{currentMonthSalary.paymentMonth}</div>
                          <div className="salary-amount-display">₱{currentMonthSalary.amount.toLocaleString()}.00</div>
                          <div className="salary-work-period">
                            Work Period: {new Date(currentMonthSalary.workPeriodStart).toLocaleDateString()} - {new Date(currentMonthSalary.workPeriodEnd).toLocaleDateString()}
                          </div>

                          <div className="salary-status-info">
                            {currentMonthSalary.status === 'paid' ? (
                              <div className="paid-info">
                                <span className="paid-icon">✓</span>
                                <span className="paid-text">
                                  Paid on {new Date(currentMonthSalary.paidDate!).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <div className="pending-info">
                                <span className="pending-icon">⏳</span>
                                <span className="pending-text">Pending Payment</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Employee Payment History */}
                    {salaryHistory.length > 0 && (
                      <div className="employee-history-section">
                        <h3 className="employee-history-title">Your Payment History</h3>
                        <div className="employee-history-grid">
                          {salaryHistory.map((salary) => (
                            <div key={salary.id} className="employee-history-item">
                              <div className="employee-history-month">{salary.paymentMonth}</div>
                              <div className="employee-history-amount">₱{salary.amount.toLocaleString()}.00</div>
                              <div className="employee-history-status">
                                <span className="status-badge paid">
                                  <span className="status-dot"></span>
                                  Paid {new Date(salary.paidDate!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="team-calendar-wrapper">
                <h2 className="calendar-title">Team Calendar</h2>

                {/* Calendar Card */}
                <div className="calendar-card">
                  {/* Navigation */}
                  <div className="calendar-nav">
                    <button className="nav-arrow">‹</button>
                    <h3 className="month-year">November 2025</h3>
                    <button className="nav-arrow">›</button>
                  </div>

                  {/* Legend */}
                  <div className="legend-bar">
                    <div className="legend-item"><span className="dot green"></span>Worked</div>
                    <div className="legend-item"><span className="dot blue"></span>Leave</div>
                    <div className="legend-item"><span className="dot orange"></span>Sick</div>
                    <div className="legend-item"><span className="dot red"></span>Holiday</div>
                    <div className="legend-item"><span className="dot gray"></span>Weekend</div>
                  </div>

                  {/* CALENDAR GRID */}
                  <div className="calendar-grid">
                    {/* Weekday Headers */}
                    <div className="weekday">Sun</div>
                    <div className="weekday">Mon</div>
                    <div className="weekday">Tue</div>
                    <div className="weekday">Wed</div>
                    <div className="weekday">Thu</div>
                    <div className="weekday">Fri</div>
                    <div className="weekday">Sat</div>

                    {/* Empty cells (Nov 2025 starts on Saturday) */}
                    <div className="day-cell empty"></div>
                    <div className="day-cell empty"></div>
                    <div className="day-cell empty"></div>
                    <div className="day-cell empty"></div>
                    <div className="day-cell empty"></div>
                    <div className="day-cell empty"></div>

                    {/* Nov 1 (Sat) */}
                    <div className="day-cell weekend">
                      <span className="day-num">1</span>
                    </div>

                    {/* Nov 2 (Sun) */}
                    <div className="day-cell weekend">
                      <span className="day-num">2</span>
                    </div>

                    {/* Nov 3-8 */}
                    <div className="day-cell">
                      <span className="day-num">3</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">4</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">5</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">6</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">7</span>
                    </div>
                    <div className="day-cell weekend">
                      <span className="day-num">8</span>
                    </div>

                    {/* Nov 9 (Sun) */}
                    <div className="day-cell weekend">
                      <span className="day-num">9</span>
                    </div>

                    {/* Nov 10-14 */}
                    <div className="day-cell">
                      <span className="day-num">10</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">11</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">12</span>
                    </div>

                    {/* Nov 13 (TODAY) */}
                    <div className="day-cell today">
                      <span className="day-num">13</span>
                      <span className="today-tag">Today</span>
                    </div>

                    <div className="day-cell">
                      <span className="day-num">14</span>
                    </div>
                    <div className="day-cell weekend">
                      <span className="day-num">15</span>
                    </div>

                    {/* Nov 16 (Sun) */}
                    <div className="day-cell weekend">
                      <span className="day-num">16</span>
                    </div>

                    {/* Nov 17-22 */}
                    <div className="day-cell">
                      <span className="day-num">17</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">18</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">19</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">20</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">21</span>
                    </div>
                    <div className="day-cell weekend">
                      <span className="day-num">22</span>
                    </div>

                    {/* Nov 23 (Sun) */}
                    <div className="day-cell weekend">
                      <span className="day-num">23</span>
                    </div>

                    {/* Nov 24-29 */}
                    <div className="day-cell">
                      <span className="day-num">24</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">25</span>
                    </div>
                    <div className="day-cell holiday">
                      <span className="day-num">26</span>
                      <span className="today-tag" style={{ color: '#EF4444' }}>Boxing Day</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">27</span>
                    </div>
                    <div className="day-cell">
                      <span className="day-num">28</span>
                    </div>
                    <div className="day-cell weekend">
                      <span className="day-num">29</span>
                    </div>

                    {/* Nov 30 (Sun) */}
                    <div className="day-cell weekend">
                      <span className="day-num">30</span>
                    </div>
                  </div>
                </div>

                {/* Holidays Section */}
                <div className="holidays-section">
                  <h4 className="holidays-title">🇦🇺 Upcoming Australian Public Holidays</h4>
                  <div className="holiday-list">
                    <div className="holiday-item">
                      <span className="h-date">December 25, 2025 (Thu)</span>
                      <span className="h-name">Christmas Day</span>
                    </div>
                    <div className="holiday-item">
                      <span className="h-date">December 26, 2025 (Fri)</span>
                      <span className="h-name">Boxing Day</span>
                    </div>
                    <div className="holiday-item">
                      <span className="h-date">January 1, 2026 (Thu)</span>
                      <span className="h-name">New Year's Day</span>
                    </div>
                    <div className="holiday-item">
                      <span className="h-date">January 26, 2026 (Mon)</span>
                      <span className="h-name">Australia Day</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && isOwnPage && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">Settings panel coming soon.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}