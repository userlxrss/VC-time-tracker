/**
 * Manager Dashboard Component
 *
 * Comprehensive manager dashboard with team overview, analytics, and real-time monitoring.
 * Focuses on team results rather than micromanagement, celebrating flexible work patterns.
 * Features real-time updates, professional enterprise UI, and streamlined approval workflows.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User, TimeEntry, LeaveRequest, PaymentStatus } from '../../database-schema';
import { manilaTime } from '../../lib/utils/manilaTime';
import { ToastNotification } from '../ui/ToastNotification';

// Component imports
import { TeamOverviewPanel } from './cards/TeamOverviewPanel';
import { TeamMembersTable } from './cards/TeamMembersTable';
import { PendingActionsQueue } from './cards/PendingActionsQueue';
import { TeamAnalyticsWidget } from './cards/TeamAnalyticsWidget';
import { QuickActionsPanel } from './cards/QuickActionsPanel';
import { AlertsNotificationPanel } from './cards/AlertsNotificationPanel';

// Types for dashboard state
interface DashboardState {
  currentTime: Date;
  teamData: {
    totalMembers: number;
    currentlyWorking: number;
    onBreak: number;
    onLunch: number;
    finished: number;
    todayProgress: number;
    weeklyProgress: number;
  };
  teamMembers: User[];
  pendingLeaveRequests: LeaveRequest[];
  pendingSalaryConfirmations: any[];
  toast: {
    show: boolean;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
  } | null;
  isLoading: boolean;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    currentTime: new Date(),
    teamData: {
      totalMembers: 0,
      currentlyWorking: 0,
      onBreak: 0,
      onLunch: 0,
      finished: 0,
      todayProgress: 0,
      weeklyProgress: 0,
    },
    teamMembers: [],
    pendingLeaveRequests: [],
    pendingSalaryConfirmations: [],
    toast: null,
    isLoading: true,
  });

  // Update current time every second for real-time feel
  useEffect(() => {
    const timer = setInterval(() => {
      setDashboardState(prev => ({
        ...prev,
        currentTime: manilaTime.now()
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load team data and dashboard information
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardState(prev => ({ ...prev, isLoading: true }));

        // Simulate API calls - in production, these would be real API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock team data based on auth context
        const mockTeamMembers: User[] = [
          {
            id: '1',
            employeeId: 'EMP001',
            firstName: 'Larina',
            lastName: 'Cruz',
            email: 'larina@company.com',
            passwordHash: 'password123',
            role: UserRole.EMPLOYEE,
            employmentStatus: 'freelance' as any,
            department: 'Operations',
            position: 'Operations Specialist',
            hireDate: new Date('2024-01-15'),
            managerId: user?.id,
            directReports: [],
            preferredWorkingHours: {
              monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, saturday: 0, sunday: 0,
            },
            canWorkFromHome: true,
            flexibleSchedule: true,
            timeZone: 'Asia/Manila',
            isActive: true,
            isFreelancer: true,
            hourlyRate: 350,
            paymentMethod: 'GCash',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
          {
            id: '3',
            employeeId: 'EMP003',
            firstName: 'Alex',
            lastName: 'Chen',
            email: 'alex@company.com',
            passwordHash: 'password123',
            role: UserRole.EMPLOYEE,
            employmentStatus: 'full_time' as any,
            department: 'IT',
            position: 'Developer',
            hireDate: new Date('2023-08-01'),
            managerId: user?.id,
            directReports: [],
            preferredWorkingHours: {
              monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, saturday: 0, sunday: 0,
            },
            canWorkFromHome: true,
            flexibleSchedule: true,
            timeZone: 'Asia/Manila',
            isActive: true,
            isFreelancer: false,
            createdAt: new Date('2023-08-01'),
            updatedAt: new Date('2023-08-01'),
          },
        ];

        const mockPendingLeave: LeaveRequest[] = [
          {
            id: 'leave1',
            userId: '1',
            type: 'vacation' as any,
            startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            reason: 'Family vacation',
            status: 'pending' as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const mockPendingSalaries = [
          {
            id: 'sal1',
            userId: '1',
            period: '2024-01',
            baseSalary: 28000,
            overtimeHours: 2,
            overtimePay: 700,
            totalPayment: 28700,
            status: PaymentStatus.PENDING,
            createdAt: new Date(),
          },
        ];

        // Calculate team statistics
        const now = manilaTime.now();
        const currentHour = now.getHours();

        // Simulate current work status based on time
        const workingCount = Math.floor(mockTeamMembers.length * 0.6);
        const breakCount = Math.floor(mockTeamMembers.length * 0.2);
        const lunchCount = Math.floor(mockTeamMembers.length * 0.1);
        const finishedCount = mockTeamMembers.length - workingCount - breakCount - lunchCount;

        setDashboardState(prev => ({
          ...prev,
          teamMembers: mockTeamMembers,
          pendingLeaveRequests: mockPendingLeave,
          pendingSalaryConfirmations: mockPendingSalaries,
          teamData: {
            totalMembers: mockTeamMembers.length,
            currentlyWorking: workingCount,
            onBreak: breakCount,
            onLunch: lunchCount,
            finished: finishedCount,
            todayProgress: 75, // Mock progress percentage
            weeklyProgress: 82, // Mock progress percentage
          },
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setDashboardState(prev => ({
          ...prev,
          isLoading: false,
        }));
        showToast('error', 'Failed to Load Data', 'Unable to load team dashboard data. Please refresh the page.');
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Handle toast notifications
  const showToast = useCallback((type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    setDashboardState(prev => ({
      ...prev,
      toast: { show: true, type, title, message }
    }));

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setDashboardState(prev => ({
        ...prev,
        toast: null
      }));
    }, 5000);
  }, []);

  // Handle approval actions
  const handleApproveLeaveRequest = useCallback(async (leaveId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setDashboardState(prev => ({
        ...prev,
        pendingLeaveRequests: prev.pendingLeaveRequests.filter(req => req.id !== leaveId)
      }));

      showToast('success', '✅ Leave Approved', 'Leave request has been approved successfully.');
    } catch (error) {
      showToast('error', '❌ Approval Failed', 'Failed to approve leave request. Please try again.');
    }
  }, [showToast]);

  const handleConfirmSalary = useCallback(async (salaryId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setDashboardState(prev => ({
        ...prev,
        pendingSalaryConfirmations: prev.pendingSalaryConfirmations.filter(sal => sal.id !== salaryId)
      }));

      showToast('success', '✅ Salary Confirmed', 'Salary payment has been confirmed successfully.');
    } catch (error) {
      showToast('error', '❌ Confirmation Failed', 'Failed to confirm salary. Please try again.');
    }
  }, [showToast]);

  const handleApproveAllLeave = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const count = dashboardState.pendingLeaveRequests.length;
      setDashboardState(prev => ({
        ...prev,
        pendingLeaveRequests: []
      }));

      showToast('success', '✅ All Leave Approved', `${count} leave request(s) have been approved.`);
    } catch (error) {
      showToast('error', '❌ Bulk Approval Failed', 'Failed to approve all leave requests. Please try again.');
    }
  }, [dashboardState.pendingLeaveRequests.length, showToast]);

  const handleConfirmAllSalaries = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const count = dashboardState.pendingSalaryConfirmations.length;
      setDashboardState(prev => ({
        ...prev,
        pendingSalaryConfirmations: []
      }));

      showToast('success', '✅ All Salaries Confirmed', `${count} salary payment(s) have been confirmed.`);
    } catch (error) {
      showToast('error', '❌ Bulk Confirmation Failed', 'Failed to confirm all salaries. Please try again.');
    }
  }, [dashboardState.pendingSalaryConfirmations.length, showToast]);

  if (!user || !isManagerOrAbove(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">This dashboard is available for managers and administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {dashboardState.toast && (
        <ToastNotification
          type={dashboardState.toast.type}
          title={dashboardState.toast.title}
          message={dashboardState.toast.message}
          onClose={() => setDashboardState(prev => ({ ...prev, toast: null }))}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Team Dashboard, {user.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {manilaTime.format(dashboardState.currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Team Overview</p>
              <p className="text-lg font-semibold text-blue-600">
                {dashboardState.teamData.totalMembers} Members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {dashboardState.isLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading team dashboard...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Team Overview Panel */}
              <TeamOverviewPanel
                teamData={dashboardState.teamData}
                currentTime={dashboardState.currentTime}
              />

              {/* Real-Time Team Members Table */}
              <TeamMembersTable
                teamMembers={dashboardState.teamMembers}
                currentTime={dashboardState.currentTime}
              />

              {/* Team Analytics Widget */}
              <TeamAnalyticsWidget
                teamMembers={dashboardState.teamMembers}
                teamData={dashboardState.teamData}
              />
            </div>

            {/* Right Column - Actions and Notifications */}
            <div className="space-y-6">
              {/* Pending Actions Queue */}
              <PendingActionsQueue
                pendingLeaveRequests={dashboardState.pendingLeaveRequests}
                pendingSalaryConfirmations={dashboardState.pendingSalaryConfirmations}
                onApproveLeave={handleApproveLeaveRequest}
                onConfirmSalary={handleConfirmSalary}
              />

              {/* Quick Actions Panel */}
              <QuickActionsPanel
                pendingLeaveCount={dashboardState.pendingLeaveRequests.length}
                pendingSalaryCount={dashboardState.pendingSalaryConfirmations.length}
                onApproveAllLeave={handleApproveAllLeave}
                onConfirmAllSalaries={handleConfirmAllSalaries}
                onExportReport={() => showToast('info', '📊 Export Started', 'Team report is being generated...')}
                onSendNotification={() => showToast('info', '📢 Compose Notification', 'Notification composer coming soon!')}
              />

              {/* Alerts & Notifications */}
              <AlertsNotificationPanel />
            </div>
          </div>

          {/* Flexible Work Philosophy Banner */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">🌟</span>
              <h3 className="text-lg font-semibold text-gray-900">Flexible Work Leadership</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Your team embraces flexibility and autonomy. Focus on results and outcomes rather than schedules.
              Trust builds accountability, and flexibility drives innovation. Celebrate your team's ability
              to deliver exceptional results on their own terms!
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Results-Oriented
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                🤝 Trust-Based
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                🌈 Schedule Flexible
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                🚀 Innovation-Focused
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for role checking
function isManagerOrAbove(role: UserRole): boolean {
  return role === UserRole.MANAGER || role === UserRole.ADMIN;
}

export { ManagerDashboard };