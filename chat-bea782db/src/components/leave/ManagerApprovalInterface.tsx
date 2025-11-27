/**
 * Manager Approval Interface Component
 *
 * Comprehensive interface for managers to review and approve/reject leave requests
 * with detailed information, bulk actions, and impact previews.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus, User } from '../../../../database-schema';
import { LeaveManager } from '../../lib/leave/leaveManager';

interface ManagerApprovalInterfaceProps {
  manager: User;
  teamMembers: User[];
  onApprovalComplete?: () => void;
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  employee: User;
  employeeBalance?: LeaveBalance;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onViewDetails: (request: LeaveRequest) => void;
}

function LeaveRequestCard({
  request,
  employee,
  employeeBalance,
  onApprove,
  onReject,
  onViewDetails
}: LeaveRequestCardProps) {
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getLeaveTypeLabel = (type: LeaveType) => {
    const labels = {
      [LeaveType.VACATION]: 'Vacation Leave',
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.EMERGENCY]: 'Emergency Leave',
      [LeaveType.PERSONAL]: 'Personal Leave',
      [LeaveType.MATERNITY]: 'Maternity Leave',
      [LeaveType.PATERNITY]: 'Paternity Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
      [LeaveType.WORK_FROM_HOME]: 'Work From Home',
    };
    return labels[type];
  };

  const getLeaveTypeIcon = (type: LeaveType) => {
    const icons = {
      [LeaveType.VACATION]: '🏖️',
      [LeaveType.SICK]: '🤒',
      [LeaveType.EMERGENCY]: '🚨',
      [LeaveType.PERSONAL]: '👤',
      [LeaveType.MATERNITY]: '👶',
      [LeaveType.PATERNITY]: '👨‍👧‍👦',
      [LeaveType.UNPAID]: '💸',
      [LeaveType.WORK_FROM_HOME]: '🏠',
    };
    return icons[type];
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    const colors = {
      [LeaveType.VACATION]: 'blue',
      [LeaveType.SICK]: 'green',
      [LeaveType.EMERGENCY]: 'red',
      [LeaveType.PERSONAL]: 'purple',
      [LeaveType.MATERNITY]: 'pink',
      [LeaveType.PATERNITY]: 'pink',
      [LeaveType.UNPAID]: 'gray',
      [LeaveType.WORK_FROM_HOME]: 'indigo',
    };
    return colors[type];
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await onApprove(request.id);
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(request.id, rejectionReason);
      setShowRejectionForm(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const availableBalance = employeeBalance ?
    (employeeBalance as any)[`${request.type}Remaining`] || 0 : 0;

  const willExceedBalance = availableBalance < request.totalDays && request.usePaidLeave;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-${getLeaveTypeColor(request.type)}-100`}>
            <span className="text-2xl">{getLeaveTypeIcon(request.type)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getLeaveTypeLabel(request.type)}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="h-4 w-4" />
              <span>{employee.firstName} {employee.lastName}</span>
              <span>•</span>
              <span>{employee.employeeId}</span>
              {request.isEmergency && (
                <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                  Emergency
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Submitted</div>
          <div className="text-sm font-medium text-gray-900">
            {request.createdAt.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-900">Duration</div>
            <div className="text-sm text-gray-600">
              {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Reason</div>
            <div className="text-sm text-gray-600 truncate">
              {request.reason}
            </div>
          </div>
        </div>

        {employeeBalance && (
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Balance Impact</div>
              <div className={`text-sm ${willExceedBalance ? 'text-red-600' : 'text-gray-600'}`}>
                Available: {availableBalance} days
              </div>
              <div className="text-xs text-gray-500">
                After approval: {Math.max(0, availableBalance - request.totalDays)} days
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Reason */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 mb-1">Full Reason:</div>
        <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
          {request.reason}
        </div>
      </div>

      {/* Balance Warning */}
      {willExceedBalance && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Balance Warning</p>
              <p>
                This request will exceed the employee's available {request.type} leave balance.
                Available: {availableBalance} days, Requested: {request.totalDays} days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {request.emergencyContact && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">
            <p className="font-semibold">Emergency Contact:</p>
            <p>{request.emergencyContact}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(request)}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Full Details
        </button>

        <div className="flex items-center space-x-3">
          {showRejectionForm ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason..."
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ width: '250px' }}
              />
              <button
                onClick={() => setShowRejectionForm(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowRejectionForm(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={isProcessing}
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ManagerApprovalInterface({
  manager,
  teamMembers,
  onApprovalComplete
}: ManagerApprovalInterfaceProps) {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeBalances, setEmployeeBalances] = useState<Map<string, LeaveBalance>>(new Map());

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setLoading(true);

        // Load pending requests
        const requests = await LeaveManager.getPendingApprovals(manager.id, teamMembers);
        setPendingRequests(requests);

        // Load employee balances
        const balances = new Map<string, LeaveBalance>();
        for (const member of teamMembers) {
          try {
            const balance = await LeaveManager.getLeaveBalance(member.id, member);
            balances.set(member.id, balance);
          } catch (error) {
            console.error(`Error loading balance for ${member.id}:`, error);
          }
        }
        setEmployeeBalances(balances);
      } catch (error) {
        console.error('Error loading pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();
  }, [manager.id, teamMembers]);

  const handleApprove = async (requestId: string) => {
    try {
      await LeaveManager.approveLeaveRequest(requestId, manager.id);

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      // Refresh data if callback provided
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request: ' + error);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      await LeaveManager.rejectLeaveRequest(requestId, manager.id, reason);

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      // Refresh data if callback provided
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request: ' + error);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    const details = `
LEAVE REQUEST DETAILS
===================

Type: ${request.type}
Status: ${request.status}
Emergency: ${request.isEmergency ? 'Yes' : 'No'}

Duration: ${request.totalDays} days
Start: ${request.startDate.toLocaleDateString()}
End: ${request.endDate.toLocaleDateString()}

Reason:
${request.reason}

Submitted: ${request.createdAt.toLocaleString()}
${request.emergencyContact ? `Emergency Contact: ${request.emergencyContact}` : ''}
${request.rejectionReason ? `Rejection Reason: ${request.rejectionReason}` : ''}
${request.approvedAt ? `Approved: ${request.approvedAt.toLocaleString()}` : ''}
    `.trim();

    alert(details);
  };

  const getEmployee = (userId: string) => {
    return teamMembers.find(m => m.id === userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
          <p className="text-gray-600 mt-1">
            Review and action leave requests from your team members
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const employee = getEmployee(request.userId);
            if (!employee) return null;

            return (
              <LeaveRequestCard
                key={request.id}
                request={request}
                employee={employee}
                employeeBalance={employeeBalances.get(request.userId)}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={handleViewDetails}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">
            No pending leave requests to review at this time.
          </p>
        </div>
      )}

      {/* Statistics */}
      {teamMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {employeeBalances.size}
              </div>
              <div className="text-sm text-gray-600">Balance Data Loaded</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}