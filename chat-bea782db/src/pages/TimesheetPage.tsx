/**
 * Comprehensive Timesheet Page
 *
 * Enterprise-grade timesheet with filtering, export functionality, and detailed time entry management.
 * Features monthly summaries, interactive tables, advanced filtering, and professional export options.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { timeEntryManager } from '../lib/timeTracking/timeEntryManager';
import { overtimeCalculator } from '../lib/analytics/overtimeCalculator';
import { manilaTime } from '../lib/utils/manilaTime';
import { TimeEntry, TimeEntryStatus } from '../database-schema';

// Import components
import { MonthlySummary } from '../components/timesheet/MonthlySummary';
import { TimesheetTable } from '../components/timesheet/TimesheetTable';
import { TimesheetFilters } from '../components/timesheet/TimesheetFilters';
import { ExportModal } from '../components/timesheet/ExportModal';
import { TimeEntryDetailModal } from '../components/timesheet/TimeEntryDetailModal';
import { EmptyState } from '../components/timesheet/EmptyState';

// Types
interface TimesheetData {
  entries: TimeEntry[];
  summary: {
    totalDays: number;
    totalHours: number;
    targetHours: number;
    averageHours: number;
    status: 'complete' | 'exceeded' | 'approaching' | 'needs_attention';
    workPatterns: {
      earlyBird: number;
      nightOwl: number;
      flexer: number;
      standard: number;
    };
  };
}

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

/**
 * Main Timesheet Page Component
 */
export function TimesheetPage() {
  const { user, formatDate, formatDuration } = useTimeTracking();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [timesheetData, setTimesheetData] = useState<TimesheetData | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);

  // UI state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: manilaTime.startOfMonth(manilaTime.now()),
      end: manilaTime.endOfMonth(manilaTime.now())
    },
    status: 'all',
    workPattern: 'all'
  });

  const [sort, setSort] = useState<SortState>({
    column: 'date',
    direction: 'desc'
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Load timesheet data
  const loadTimesheetData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const entries = await timeEntryManager.findByUserId(user.id, {
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end
      });

      // Calculate summary statistics
      const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
      const targetHours = calculateTargetHours(filters.dateRange.start, filters.dateRange.end);
      const averageHours = entries.length > 0 ? totalHours / entries.length : 0;

      // Determine status
      let status: TimesheetData['summary']['status'] = 'needs_attention';
      if (totalHours >= targetHours) {
        status = totalHours > targetHours * 1.1 ? 'exceeded' : 'complete';
      } else if (totalHours >= targetHours * 0.8) {
        status = 'approaching';
      }

      // Analyze work patterns
      const workPatterns = analyzeWorkPatterns(entries);

      setTimesheetData({
        entries,
        summary: {
          totalDays: entries.length,
          totalHours,
          targetHours,
          averageHours,
          status,
          workPatterns
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timesheet data');
    } finally {
      setLoading(false);
    }
  }, [user, filters.dateRange]);

  // Apply filters and sorting
  useEffect(() => {
    if (!timesheetData) return;

    let filtered = [...timesheetData.entries];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    // Apply work pattern filter
    if (filters.workPattern !== 'all') {
      filtered = filtered.filter(entry =>
        getWorkPattern(entry) === filters.workPattern
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sort.column) {
        case 'date':
          compareValue = a.clockIn.getTime() - b.clockIn.getTime();
          break;
        case 'hours':
          compareValue = (a.totalHours || 0) - (b.totalHours || 0);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
      }

      return sort.direction === 'asc' ? compareValue : -compareValue;
    });

    setFilteredEntries(filtered);
  }, [timesheetData, filters, sort]);

  // Initial data load
  useEffect(() => {
    loadTimesheetData();
  }, [loadTimesheetData]);

  // Calculate target hours for date range
  const calculateTargetHours = (start: Date, end: Date): number => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const workdays = countWorkdays(start, end);
    return workdays * 8; // 8 hours per workday
  };

  // Count workdays (excluding weekends)
  const countWorkdays = (start: Date, end: Date): number => {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  // Analyze work patterns
  const analyzeWorkPatterns = (entries: TimeEntry[]) => {
    const patterns = {
      earlyBird: 0,
      nightOwl: 0,
      flexer: 0,
      standard: 0
    };

    entries.forEach(entry => {
      const pattern = getWorkPattern(entry);
      patterns[pattern]++;
    });

    return patterns;
  };

  // Get work pattern for a time entry
  const getWorkPattern = (entry: TimeEntry): 'early_bird' | 'night_owl' | 'flexer' | 'standard' => {
    const hour = entry.clockIn.getHours();

    if (hour >= 5 && hour < 8) return 'early_bird';
    if (hour >= 20 || hour < 5) return 'night_owl';
    if (hour >= 9 && hour <= 17) return 'standard';
    return 'flexer';
  };

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((column: SortState['column']) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle entry selection
  const handleEntryClick = useCallback((entry: TimeEntry) => {
    setSelectedEntry(entry);
  }, []);

  // Handle export
  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (!timesheetData || !user) return;

    try {
      setExportProgress(0);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Perform export
      const exportData = await timeEntryManager.exportData({
        format,
        dateRange: filters.dateRange,
        includeBreaks: true,
        includeAnalytics: true
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      // Download the file
      downloadFile(exportData, format, filters.dateRange);

      setTimeout(() => {
        setShowExportModal(false);
        setExportProgress(0);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setExportProgress(0);
    }
  }, [timesheetData, user, filters.dateRange]);

  // Download file helper
  const downloadFile = (data: any, format: string, dateRange: { start: Date; end: Date }) => {
    const filename = `timesheet_${manilaTime.format(dateRange.start, 'YYYY-MM-DD')}_to_${manilaTime.format(dateRange.end, 'YYYY-MM-DD')}.${format}`;

    let content: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        content = data as string;
        mimeType = 'text/csv';
        break;
      case 'excel':
        content = JSON.stringify(data);
        mimeType = 'application/json';
        break;
      case 'pdf':
        content = data as string;
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick filter presets
  const applyQuickFilter = useCallback((preset: 'this_week' | 'last_7_days' | 'this_month') => {
    const now = manilaTime.now();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'this_week':
        start = manilaTime.startOfWeek(now);
        end = manilaTime.endOfWeek(now);
        break;
      case 'last_7_days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = manilaTime.endOfDay(now);
        break;
      case 'this_month':
        start = manilaTime.startOfMonth(now);
        end = manilaTime.endOfMonth(now);
        break;
    }

    handleFilterChange({ dateRange: { start, end } });
  }, [handleFilterChange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Timesheet...</h2>
          <p className="text-gray-600 mt-2">Preparing your time tracking data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Timesheet</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadTimesheetData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!timesheetData || timesheetData.entries.length === 0) {
    return <EmptyState onQuickFilter={applyQuickFilter} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Timesheet</h1>
              <p className="text-sm text-gray-600">
                {manilaTime.format(filters.dateRange.start, 'MMM DD, YYYY')} - {manilaTime.format(filters.dateRange.end, 'MMM DD, YYYY')}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Monthly Summary */}
        <MonthlySummary
          summary={timesheetData.summary}
          userName={`${user?.firstName} ${user?.lastName}`}
        />

        {/* Filters */}
        <div className="mt-8">
          <TimesheetFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onQuickFilter={applyQuickFilter}
            onSortChange={handleSortChange}
            sort={sort}
          />
        </div>

        {/* Timesheet Table */}
        <div className="mt-6">
          <TimesheetTable
            entries={filteredEntries}
            onEntryClick={handleEntryClick}
            formatDate={formatDate}
            formatDuration={formatDuration}
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          progress={exportProgress}
          entriesCount={filteredEntries.length}
        />
      )}

      {/* Time Entry Detail Modal */}
      {selectedEntry && (
        <TimeEntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />
      )}
    </div>
  );
}