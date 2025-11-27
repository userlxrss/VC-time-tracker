/**
 * Leave Dashboard Component
 *
 * Comprehensive employee leave dashboard showing balance cards, statistics,
 * recent requests, and quick actions for leave management.
 */

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LeaveRequest, LeaveBalance, LeaveStatistics, LeaveType, LeaveStatus, User } from '../../../../database-schema';
import { LeaveManager } from '../../lib/leave/leaveManager';
import { manilaTime } from '../../lib/utils/manilaTime';
import { LeaveRequestModal } from './LeaveRequestModal';

interface LeaveDashboardProps {
  user: User;
}

interface BalanceCardProps {
  title: string;
  current: number;
  total: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  showResetDate?: boolean;
  resetDate?: Date;
}

function BalanceCard({ title, current, total, percentage, color, icon, showResetDate, resetDate }: BalanceCardProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      gray: 'bg-gray-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  const getTextColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      gray: 'text-gray-600',
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${getColorClasses(color)} bg-opacity-10`}>
          <div className={`${getColorClasses(color)}`}>
            {icon}
          </div>
        </div>
        <span className={`text-sm font-medium ${getTextColorClasses(color)}`}>
          {percentage.toFixed(0)}% Used
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-900 mb-3">
        {current} / {total} days
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`${getColorClasses(color)} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {showResetDate && resetDate && (
        <div className="text-xs text-gray-500">
          <ClockIcon className="inline h-3 w-3 mr-1" />
          Resets: {resetDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const getStatusConfig = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return {
          color: 'green',
          label: 'Approved',
          icon: <CheckCircleIcon className="h-4 w-4" />,
        };
      case LeaveStatus.PENDING:
        return {
          color: 'yellow',
          label: 'Pending',
          icon: <ClockIcon className="h-4 w-4" />,
        };
      case LeaveStatus.REJECTED:
        return {
          color: 'red',
          label: 'Rejected',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        };
      case LeaveStatus.CANCELLED:
        return {
          color: 'gray',
          label: 'Cancelled',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        };
      default:
        return {
          color: 'gray',
          label: status,
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        };
    }
  };

  const config = getStatusConfig(status);
  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(config.color)}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
}

function RecentLeaveRequest({ request }: { request: LeaveRequest }) {
  const getLeaveTypeLabel = (type: LeaveType) => {
    const labels = {
      [LeaveType.VACATION]: 'Vacation',
      [LeaveType.SICK]: 'Sick',
      [LeaveType.EMERGENCY]: 'Emergency',
      [LeaveType.PERSONAL]: 'Personal',
      [LeaveType.MATERNITY]: 'Maternity',
      [LeaveType.PATERNITY]: 'Paternity',
      [LeaveType.UNPAID]: 'Unpaid',
      [LeaveType.WORK_FROM_HOME]: 'WFH',
    };
    return labels[type];
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-1">
          <span className="font-medium text-gray-900">{getLeaveTypeLabel(request.type)}</span>
          <StatusBadge status={request.status} />
        </div>
        <div className="text-sm text-gray-600">
          {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
          <span className="mx-2">•</span>
          {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Submitted {request.createdAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export function LeaveDashboard({ user }: LeaveDashboardProps) {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leaveStatistics, setLeaveStatistics] = useState<LeaveStatistics | null>(null);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load leave balance
        const balance = await LeaveManager.getLeaveBalance(user.id, user);
        setLeaveBalance(balance);

        // Load statistics
        const stats = await LeaveManager.getLeaveStatistics(user.id);
        setLeaveStatistics(stats);

        // Load recent requests
        const requests = await LeaveManager.getLeaveRequests(user.id, { limit: 5 });
        setRecentRequests(requests);
      } catch (error) {
        console.error('Error loading leave data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id, user]);

  const handleLeaveRequestSubmit = async (formData: any) => {
    try {
      await LeaveManager.submitLeaveRequest(formData, user);

      // Reload data after successful submission
      const [balance, stats, requests] = await Promise.all([
        LeaveManager.getLeaveBalance(user.id, user),
        LeaveManager.getLeaveStatistics(user.id),
        LeaveManager.getLeaveRequests(user.id, { limit: 5 }),
      ]);

      setLeaveBalance(balance);
      setLeaveStatistics(stats);
      setRecentRequests(requests);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [balance, stats, requests] = await Promise.all([
        LeaveManager.getLeaveBalance(user.id, user),
        LeaveManager.getLeaveStatistics(user.id),
        LeaveManager.getLeaveRequests(user.id, { limit: 5 }),
      ]);

      setLeaveBalance(balance);
      setLeaveStatistics(stats);
      setRecentRequests(requests);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage your leave requests and track your balance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Request Leave
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      {leaveBalance && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Annual Leave Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BalanceCard
              title="Vacation Leave"
              current={leaveBalance.vacationUsed + leaveBalance.vacationPending}
              total={leaveBalance.vacationBalance}
              percentage={((leaveBalance.vacationUsed + leaveBalance.vacationPending) / leaveBalance.vacationBalance) * 100}
              color="blue"
              icon={<CalendarIcon className="h-6 w-6 text-blue-500" />}
              showResetDate={true}
              resetDate={leaveBalance.resetDate}
            />

            <BalanceCard
              title="Sick Leave"
              current={leaveBalance.sickUsed + leaveBalance.sickPending}
              total={leaveBalance.sickBalance}
              percentage={((leaveBalance.sickUsed + leaveBalance.sickPending) / leaveBalance.sickBalance) * 100}
              color="green"
              icon={<DocumentTextIcon className="h-6 w-6 text-green-500" />}
            />

            <BalanceCard
              title="Emergency Leave"
              current={leaveBalance.emergencyUsed + leaveBalance.emergencyPending}
              total={leaveBalance.emergencyBalance}
              percentage={((leaveBalance.emergencyUsed + leaveBalance.emergencyPending) / leaveBalance.emergencyBalance) * 100}
              color="red"
              icon={<ExclamationTriangleIcon className="h-6 w-6 text-red-500" />}
            />

            <BalanceCard
              title="Personal Leave"
              current={leaveBalance.personalUsed + leaveBalance.personalPending}
              total={leaveBalance.personalBalance}
              percentage={((leaveBalance.personalUsed + leaveBalance.personalPending) / leaveBalance.personalBalance) * 100}
              color="purple"
              icon={<ChartBarIcon className="h-6 w-6 text-purple-500" />}
            />
          </div>

          {/* Summary Card */}
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{leaveBalance.totalAnnualLeave}</div>
                <div className="text-blue-100">Total Annual Leave</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{leaveBalance.totalUsedLeave}</div>
                <div className="text-blue-100">Days Used</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{leaveBalance.totalPendingLeave}</div>
                <div className="text-blue-100">Days Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{leaveBalance.totalRemainingLeave}</div>
                <div className="text-blue-100">Days Remaining</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {leaveStatistics && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{leaveStatistics.totalRequests}</div>
                  <div className="text-gray-600">Total Requests</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{leaveStatistics.approvedRequests}</div>
                  <div className="text-gray-600">Approved Requests</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{leaveStatistics.pendingRequests}</div>
                  <div className="text-gray-600">Pending Requests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Leave Requests</h2>
        <div className="bg-white rounded-lg shadow">
          {recentRequests.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentRequests.map((request) => (
                <div key={request.id} className="p-4">
                  <RecentLeaveRequest request={request} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium">No leave requests yet</p>
              <p className="text-sm mt-1">Click "Request Leave" to submit your first leave request</p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLeaveRequestSubmit}
        user={user}
        leaveBalance={leaveBalance || undefined}
      />
    </div>
  );
}