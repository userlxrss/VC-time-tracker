/**
 * Timesheet Filters Component
 *
 * Advanced filtering system with date range picker, status filters, work pattern filters,
 * and quick filter presets. Includes sorting options.
 */

import React, { useState } from 'react';
import { TimeEntryStatus } from '../../database-schema';
import { manilaTime } from '../../lib/utils/manilaTime';

interface FilterState {
  dateRange: {
    start: Date;
    end: Date;
  };
  status: TimeEntryStatus | 'all';
  workPattern: 'all' | 'early_bird' | 'night_owl' | 'flexer' | 'standard';
}

interface SortState {
  column: 'date' | 'hours' | 'status';
  direction: 'asc' | 'desc';
}

interface TimesheetFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onQuickFilter: (preset: 'this_week' | 'last_7_days' | 'this_month') => void;
  onSortChange: (column: SortState['column']) => void;
  sort: SortState;
}

/**
 * Date Range Picker Component
 */
const DateRangePicker: React.FC<{
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}> = ({ startDate, endDate, onChange }) => {
  const [showCustomRange, setShowCustomRange] = useState(false);

  const handlePresetSelect = (preset: 'this_month' | 'last_month' | 'this_year') => {
    const now = manilaTime.now();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'this_month':
        start = manilaTime.startOfMonth(now);
        end = manilaTime.endOfMonth(now);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
    }

    onChange(start, end);
    setShowCustomRange(false);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCustomDateChange = (start: string, end: string) => {
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T23:59:59');
    onChange(startDate, endDate);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowCustomRange(!showCustomRange)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm text-gray-600">📅</span>
        <span className="text-sm font-medium text-gray-900">
          {manilaTime.format(startDate, 'MMM DD, YYYY')} - {manilaTime.format(endDate, 'MMM DD, YYYY')}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {showCustomRange && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Date Range</h3>

            {/* Preset Options */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => handlePresetSelect('this_month')}
                className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                This Month
              </button>
              <button
                onClick={() => handlePresetSelect('last_month')}
                className="px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Last Month
              </button>
              <button
                onClick={() => handlePresetSelect('this_year')}
                className="px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                This Year
              </button>
            </div>

            {/* Custom Date Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formatDateForInput(startDate)}
                  onChange={(e) => handleCustomDateChange(e.target.value, formatDateForInput(endDate))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formatDateForInput(endDate)}
                  onChange={(e) => handleCustomDateChange(formatDateForInput(startDate), e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowCustomRange(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Status Filter Component
 */
const StatusFilter: React.FC<{
  value: TimeEntryStatus | 'all';
  onChange: (value: TimeEntryStatus | 'all') => void;
}> = ({ value, onChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Complete', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];

  const selectedOption = statusOptions.find(option => option.value === value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeEntryStatus | 'all')}
        className="appearance-none flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors pr-8"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-400">▼</span>
      </div>
    </div>
  );
};

/**
 * Work Pattern Filter Component
 */
const WorkPatternFilter: React.FC<{
  value: FilterState['workPattern'];
  onChange: (value: FilterState['workPattern']) => void;
}> = ({ value, onChange }) => {
  const patternOptions = [
    { value: 'all', label: 'All Patterns', icon: '⏰' },
    { value: 'early_bird', label: 'Early Bird 🌅', icon: '🌅' },
    { value: 'night_owl', label: 'Night Owl 🌙', icon: '🌙' },
    { value: 'flexer', label: 'Flexer 🌈', icon: '🌈' },
    { value: 'standard', label: 'Standard ⏰', icon: '⏰' }
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FilterState['workPattern'])}
        className="appearance-none flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors pr-8"
      >
        {patternOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-400">▼</span>
      </div>
    </div>
  );
};

/**
 * Quick Filter Buttons
 */
const QuickFilterButtons: React.FC<{
  onQuickFilter: (preset: 'this_week' | 'last_7_days' | 'this_month') => void;
}> = ({ onQuickFilter }) => {
  const quickFilters = [
    { key: 'this_week', label: 'This Week', description: 'Current work week' },
    { key: 'last_7_days', label: 'Last 7 Days', description: 'Past week' },
    { key: 'this_month', label: 'This Month', description: 'Current calendar month' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Quick:</span>
      {quickFilters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onQuickFilter(filter.key as any)}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          title={filter.description}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Sort Controls
 */
const SortControls: React.FC<{
  sort: SortState;
  onSortChange: (column: SortState['column']) => void;
}> = ({ sort, onSortChange }) => {
  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'hours', label: 'Hours' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Sort by:</span>
      {sortOptions.map(option => (
        <button
          key={option.key}
          onClick={() => onSortChange(option.key as SortState['column'])}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            sort.column === option.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
          {sort.column === option.key && (
            <span className="ml-1">
              {sort.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * Main Timesheet Filters Component
 */
export const TimesheetFilters: React.FC<TimesheetFiltersProps> = ({
  filters,
  onFilterChange,
  onQuickFilter,
  onSortChange,
  sort
}) => {
  const handleDateRangeChange = (start: Date, end: Date) => {
    onFilterChange({ dateRange: { start, end } });
  };

  const handleStatusChange = (status: TimeEntryStatus | 'all') => {
    onFilterChange({ status });
  };

  const handlePatternChange = (workPattern: FilterState['workPattern']) => {
    onFilterChange({ workPattern });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Sorting</h3>

      {/* Main Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Date Range Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <DateRangePicker
            startDate={filters.dateRange.start}
            endDate={filters.dateRange.end}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <StatusFilter
            value={filters.status}
            onChange={handleStatusChange}
          />
        </div>

        {/* Work Pattern Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Pattern</label>
          <WorkPatternFilter
            value={filters.workPattern}
            onChange={handlePatternChange}
          />
        </div>
      </div>

      {/* Quick Filters and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <QuickFilterButtons onQuickFilter={onQuickFilter} />
        <SortControls sort={sort} onSortChange={onSortChange} />
      </div>

      {/* Filter Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Showing entries from {manilaTime.format(filters.dateRange.start, 'MMM DD, YYYY')} to{' '}
            {manilaTime.format(filters.dateRange.end, 'MMM DD, YYYY')}
          </span>
          <span>
            {filters.status !== 'all' && `Status: ${filters.status} • `}
            {filters.workPattern !== 'all' && `Pattern: ${filters.workPattern.replace('_', ' ')} • `}
            Sorted by {sort.column} ({sort.direction === 'asc' ? 'ascending' : 'descending'})
          </span>
        </div>
      </div>
    </div>
  );
};