/**
 * Leave Requests Table Component
 *
 * Comprehensive table showing all leave requests with status badges,
 * filtering options, and action buttons for managing requests.
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { LeaveRequest, LeaveType, LeaveStatus, User } from '../../../../database-schema';
import { LeaveManager } from '../../lib/leave/leaveManager';

interface LeaveRequestsTableProps {
  user: User;
  isManager?: boolean;
  teamMembers?: User[];
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

interface FilterOptions {
  type?: LeaveType;
  status?: LeaveStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const getStatusConfig = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return {
          color: 'green',
          label: 'Approved',
          icon: '✅',
        };
      case LeaveStatus.PENDING:
        return {
          color: 'yellow',
          label: 'Pending',
          icon: '🟡',
        };
      case LeaveStatus.REJECTED:
        return {
          color: 'red',
          label: 'Rejected',
          icon: '❌',
        };
      case LeaveStatus.CANCELLED:
        return {
          color: 'gray',
          label: 'Cancelled',
          icon: '⬜',
        };
      default:
        return {
          color: 'gray',
          label: status,
          icon: '❓',
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
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

function LeaveTypeIcon({ type }: { type: LeaveType }) {
  const getIcon = (type: LeaveType) => {
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

  return (
    <span className="text-lg" title={type}>
      {getIcon(type)}
    </span>
  );
}

function LeaveRequestRow({
  request,
  user,
  isManager,
  onRequestCancel,
  onRequestView
}: {
  request: LeaveRequest;
  user: User;
  isManager?: boolean;
  onRequestCancel: (request: LeaveRequest) => void;
  onRequestView: (request: LeaveRequest) => void;
}) {
  const canCancel = request.userId === user.id && request.status === LeaveStatus.PENDING;
  const isOwnRequest = request.userId === user.id;

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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <LeaveTypeIcon type={request.type} />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {getLeaveTypeLabel(request.type)}
            </div>
            {request.isEmergency && (
              <div className="text-xs text-red-600">Emergency</div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {request.startDate.toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {request.endDate.toLocaleDateString()}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {request.reason}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={request.status} />
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {request.createdAt.toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {request.createdAt.toLocaleTimeString()}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRequestView(request)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>

          {canCancel && (
            <button
              onClick={() => onRequestCancel(request)}
              className="text-red-600 hover:text-red-900"
              title="Cancel Request"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}

          {!isOwnRequest && isManager && request.status === LeaveStatus.PENDING && (
            <span className="text-xs text-green-600 font-medium">
              Awaiting Approval
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export function LeaveRequestsTable({ user, isManager = false, teamMembers = [] }: LeaveRequestsTableProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterOptions>({});

  const columns: TableColumn[] = [
    { key: 'type', label: 'Leave Type', sortable: true },
    { key: 'startDate', label: 'Date Range', sortable: true },
    { key: 'totalDays', label: 'Duration', sortable: true },
    { key: 'reason', label: 'Reason', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Submitted', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);

        let loadedRequests: LeaveRequest[];

        if (isManager) {
          // Managers see all team requests
          loadedRequests = await LeaveManager.getAllLeaveRequests();
        } else {
          // Employees see only their own requests
          loadedRequests = await LeaveManager.getLeaveRequests(user.id);
        }

        setRequests(loadedRequests);
      } catch (error) {
        console.error('Error loading leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user.id, isManager]);

  useEffect(() => {
    let filtered = [...requests];

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.userId) {
      filtered = filtered.filter(r => r.userId === filters.userId);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(r =>
        r.startDate >= filters.dateRange!.start &&
        r.endDate <= filters.dateRange!.end
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortColumn as keyof LeaveRequest];
      let bValue: any = b[sortColumn as keyof LeaveRequest];

      if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = (bValue as Date).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredRequests(filtered);
  }, [requests, filters, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (!columns.find(c => c.key === column)?.sortable) return;

    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRequestCancel = async (request: LeaveRequest) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await LeaveManager.cancelLeaveRequest(request.id, user.id);

        // Reload requests
        const updatedRequests = await LeaveManager.getLeaveRequests(user.id);
        setRequests(updatedRequests);
      } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Error cancelling request: ' + error);
      }
    }
  };

  const handleRequestView = (request: LeaveRequest) => {
    // Create a modal or expandable section to show full details
    alert(`Request Details:\n\nType: ${request.type}\nStatus: ${request.status}\nDates: ${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()}\nDays: ${request.totalDays}\nReason: ${request.reason}\nSubmitted: ${request.createdAt.toLocaleString()}\n${request.rejectionReason ? `Rejection Reason: ${request.rejectionReason}` : ''}`);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUpIcon className="h-4 w-4 text-gray-600" />
      : <ChevronDownIcon className="h-4 w-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Filters Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Leave Requests
            <span className="ml-2 text-sm text-gray-500">
              ({filteredRequests.length} of {requests.length})
            </span>
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Leave Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange({
                    type: e.target.value ? e.target.value as LeaveType : undefined
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {Object.values(LeaveType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange({
                    status: e.target.value ? e.target.value as LeaveStatus : undefined
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {Object.values(LeaveStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Team Member Filter (Managers only) */}
              {isManager && teamMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Member
                  </label>
                  <select
                    value={filters.userId || ''}
                    onChange={(e) => handleFilterChange({
                      userId: e.target.value || undefined
                    })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Team Members</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <LeaveRequestRow
                  key={request.id}
                  request={request}
                  user={user}
                  isManager={isManager}
                  onRequestCancel={handleRequestCancel}
                  onRequestView={handleRequestView}
                />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filters.type || filters.status || filters.userId
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by requesting your first leave.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}