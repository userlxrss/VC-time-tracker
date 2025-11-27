/**
 * Pending Actions Queue Component
 *
 * Displays leave requests and salary confirmations needing manager approval.
 * Provides quick action buttons for each item with streamlined approval workflows.
 * Focuses on efficiency and clear communication for management tasks.
 */

import React from 'react';
import { LeaveRequest } from '../../../database-schema';
import { manilaTime } from '../../../lib/utils/manilaTime';

interface PendingActionsQueueProps {
  pendingLeaveRequests: LeaveRequest[];
  pendingSalaryConfirmations: any[];
  onApproveLeave: (leaveId: string) => Promise<void>;
  onConfirmSalary: (salaryId: string) => Promise<void>;
}

const PendingActionsQueue: React.FC<PendingActionsQueueProps> = ({
  pendingLeaveRequests,
  pendingSalaryConfirmations,
  onApproveLeave,
  onConfirmSalary
}) => {
  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick': return '🤒';
      case 'emergency': return '🚨';
      case 'personal': return '👤';
      case 'maternity': return '🤱';
      case 'paternity': return '👨‍👧‍👦';
      case 'unpaid': return '💸';
      case 'work_from_home': return '🏠';
      default: return '📅';
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacation';
      case 'sick': return 'Sick Leave';
      case 'emergency': return 'Emergency';
      case 'personal': return 'Personal';
      case 'maternity': return 'Maternity';
      case 'paternity': return 'Paternity';
      case 'unpaid': return 'Unpaid';
      case 'work_from_home': return 'Work From Home';
      default: return 'Leave';
    }
  };

  const calculateDays = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const totalPendingItems = pendingLeaveRequests.length + pendingSalaryConfirmations.length;

  if (totalPendingItems === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            All Clear
          </span>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-sm text-gray-600">
            No pending actions requiring your attention.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {totalPendingItems} pending
        </span>
      </div>

      <div className="space-y-6">
        {/* Leave Requests Section */}
        {pendingLeaveRequests.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">📅</span>
              <h3 className="text-sm font-medium text-gray-900">Leave Requests</h3>
              <span className="ml-2 text-xs text-gray-500">
                ({pendingLeaveRequests.length} pending)
              </span>
            </div>

            <div className="space-y-3">
              {pendingLeaveRequests.map((leaveRequest) => (
                <div
                  key={leaveRequest.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getLeaveTypeIcon(leaveRequest.type)}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getLeaveTypeLabel(leaveRequest.type)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {manilaTime.format(leaveRequest.createdAt, 'MMM d')}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    <div className="flex items-center space-x-4">
                      <span>
                        {manilaTime.format(leaveRequest.startDate, 'MMM d')} - {manilaTime.format(leaveRequest.endDate, 'MMM d, yyyy')}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{calculateDays(leaveRequest.startDate, leaveRequest.endDate)} days</span>
                    </div>
                    {leaveRequest.reason && (
                      <div className="mt-1 text-gray-500">
                        Reason: {leaveRequest.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onApproveLeave(leaveRequest.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salary Confirmations Section */}
        {pendingSalaryConfirmations.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">💰</span>
              <h3 className="text-sm font-medium text-gray-900">Salary Confirmations</h3>
              <span className="ml-2 text-xs text-gray-500">
                ({pendingSalaryConfirmations.length} pending)
              </span>
            </div>

            <div className="space-y-3">
              {pendingSalaryConfirmations.map((salary) => (
                <div
                  key={salary.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💵</span>
                      <span className="text-sm font-medium text-gray-900">
                        {salary.period} Salary
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {manilaTime.format(salary.createdAt, 'MMM d')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mb-2">
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span className="font-medium">{formatCurrency(salary.baseSalary)}</span>
                    </div>
                    {salary.overtimeHours > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime ({salary.overtimeHours}h):</span>
                        <span className="font-medium">{formatCurrency(salary.overtimePay)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-200">
                      <span className="font-medium">Total Payment:</span>
                      <span className="font-bold text-green-600">{formatCurrency(salary.totalPayment)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onConfirmSalary(salary.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Review Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Actions requiring your attention</span>
          <span>Updated {manilaTime.format(new Date(), 'h:mm a')}</span>
        </div>
      </div>
    </div>
  );
};

export { PendingActionsQueue };