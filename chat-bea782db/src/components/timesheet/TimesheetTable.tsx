/**
 * Timesheet Table Component
 *
 * Interactive table displaying time entries with color coding, work pattern badges,
 * sorting capabilities, and responsive design.
 */

import React, { useState } from 'react';
import { TimeEntry, TimeEntryStatus } from '../../database-schema';

interface TimesheetTableProps {
  entries: TimeEntry[];
  onEntryClick: (entry: TimeEntry) => void;
  formatDate: (date: Date, format?: string) => string;
  formatDuration: (hours: number) => string;
}

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: TimeEntryStatus }> = ({ status }) => {
  const config = {
    active: {
      color: 'bg-blue-100 text-blue-800',
      icon: '🔄',
      label: 'Active'
    },
    completed: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      label: 'Complete'
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳',
      label: 'Pending'
    },
    overdue: {
      color: 'bg-red-100 text-red-800',
      icon: '⚠️',
      label: 'Overdue'
    },
    rejected: {
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      label: 'Rejected'
    },
    approved: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      label: 'Approved'
    }
  };

  const { color, icon, label } = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </span>
  );
};

/**
 * Work pattern badge component
 */
const WorkPatternBadge: React.FC<{ clockIn: Date }> = ({ clockIn }) => {
  const hour = clockIn.getHours();

  let pattern: { label: string; icon: string; color: string };

  if (hour >= 5 && hour < 8) {
    pattern = { label: 'Early Bird', icon: '🌅', color: 'bg-orange-100 text-orange-800' };
  } else if (hour >= 20 || hour < 5) {
    pattern = { label: 'Night Owl', icon: '🌙', color: 'bg-indigo-100 text-indigo-800' };
  } else if (hour >= 9 && hour <= 17) {
    pattern = { label: 'Standard', icon: '⏰', color: 'bg-blue-100 text-blue-800' };
  } else {
    pattern = { label: 'Flexer', icon: '🌈', color: 'bg-purple-100 text-purple-800' };
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pattern.color}`}>
      <span className="mr-1">{pattern.icon}</span>
      {pattern.label}
    </span>
  );
};

/**
 * Sortable table header component
 */
const SortableHeader: React.FC<{
  label: string;
  isActive: boolean;
  direction: 'asc' | 'desc';
  onClick: () => void;
}> = ({ label, isActive, direction, onClick }) => (
  <th
    onClick={onClick}
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
  >
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      {isActive && (
        <span className="text-blue-600">
          {direction === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </div>
  </th>
);

/**
 * Main Timesheet Table Component
 */
export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  entries,
  onEntryClick,
  formatDate,
  formatDuration
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const handleRowClick = (entry: TimeEntry) => {
    setSelectedRow(entry.id);
    onEntryClick(entry);
  };

  const getTotalBreakTime = (breaks: TimeEntry['breaks']) => {
    return breaks.reduce((total, breakPeriod) => total + (breakPeriod.duration || 0), 0);
  };

  const getRowColorClass = (entry: TimeEntry) => {
    if (!entry.totalHours) return '';

    if (entry.totalHours >= 8) return 'bg-green-50';
    if (entry.totalHours >= 6) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or select a different date range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader
                label="Date"
                isActive={false}
                direction="asc"
                onClick={() => {}}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Started
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Finished
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lunch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Breaks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Pattern
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                onClick={() => handleRowClick(entry)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === entry.id ? 'ring-2 ring-blue-500 ring-inset' : ''
                } ${getRowColorClass(entry)}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDate(entry.clockIn, 'MMM DD, YYYY')}
                  {index === 0 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(entry.clockIn, 'hh:mm A')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {entry.clockOut ? formatDate(entry.clockOut, 'hh:mm A') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDuration(entry.totalHours || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {entry.breaks.some(b => b.type === 'lunch')
                    ? `${entry.breaks.find(b => b.type === 'lunch')?.duration || 0} min`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {getTotalBreakTime(entry.breaks)} min total
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <WorkPatternBadge clockIn={entry.clockIn} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => handleRowClick(entry)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRow === entry.id ? 'ring-2 ring-blue-500 ring-inset' : ''
              } ${getRowColorClass(entry)}`}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(entry.clockIn, 'MMM DD, YYYY')}
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <StatusBadge status={entry.status} />
              </div>

              {/* Time Information */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Start</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(entry.clockIn, 'hh:mm A')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">End</div>
                  <div className="text-sm font-medium text-gray-900">
                    {entry.clockOut ? formatDate(entry.clockOut, 'hh:mm A') : '-'}
                  </div>
                </div>
              </div>

              {/* Hours and Breaks */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Hours</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDuration(entry.totalHours || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Break Time</div>
                  <div className="text-sm font-medium text-gray-900">
                    {getTotalBreakTime(entry.breaks)} min
                  </div>
                </div>
              </div>

              {/* Work Pattern Badge */}
              <div className="flex justify-between items-center">
                <WorkPatternBadge clockIn={entry.clockIn} />
                <div className="text-xs text-blue-600">
                  Click for details →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{entries.length}</span> time entries
          </div>
          <div className="text-sm text-gray-500">
            All times in Manila Time (UTC+8)
          </div>
        </div>
      </div>
    </div>
  );
};