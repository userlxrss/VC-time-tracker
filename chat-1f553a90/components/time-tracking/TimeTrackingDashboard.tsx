'use client';

import React, { useState, useEffect } from 'react';
import { useTimeTracking, useAllUsersTimeStats } from '@/contexts/TimeTrackingContext';
import { TimeTrackingEntry, WeeklyReport, MonthlyReport, User } from '@/lib/types';
import { Calendar, Download, Users, Clock, TrendingUp, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeTrackingDashboardProps {
  user?: User;
  viewAllUsers?: boolean;
}

export const TimeTrackingDashboard: React.FC<TimeTrackingDashboardProps> = ({
  user,
  viewAllUsers = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'monthly'>('overview');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeTrackingEntry[]>([]);

  const { timeStats, getWeeklyReportData, getMonthlyReportData } = useTimeTracking();
  const { allStats, isLoading: allStatsLoading } = useAllUsersTimeStats();

  useEffect(() => {
    // Set default week and month
    const now = new Date();

    // Current week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    setSelectedWeek(weekStart.toISOString().split('T')[0]);

    // Current month
    setSelectedMonth(now.toISOString().slice(0, 7));
  }, []);

  useEffect(() => {
    if (selectedWeek && user) {
      const report = getWeeklyReportData(selectedWeek);
      setWeeklyReport(report);
    }
  }, [selectedWeek, user, getWeeklyReportData]);

  useEffect(() => {
    if (selectedMonth && user) {
      const report = getMonthlyReportData(selectedMonth);
      setMonthlyReport(report);
    }
  }, [selectedMonth, user, getMonthlyReportData]);

  useEffect(() => {
    // Load recent entries (last 10 entries)
    if (user) {
      // This would be implemented in the time tracking context
      // For now, using a placeholder
      setRecentEntries([]);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeekRange = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentWeek = new Date(selectedWeek);
    currentWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(currentWeek.toISOString().split('T')[0]);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newDate.toISOString().slice(0, 7));
  };

  const exportToCSV = (data: any[], filename: string) => {
    // Simple CSV export - in a real app, you'd want more robust CSV generation
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">Please log in to view time tracking data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {viewAllUsers ? 'Team Time Tracking' : `${user.name}'s Time Tracking`}
            </h2>
          </div>
          <button
            onClick={() => {
              // Export functionality
              if (activeTab === 'weekly' && weeklyReport) {
                exportToCSV(weeklyReport.dailyBreakdown, `time-report-weekly-${selectedWeek}.csv`);
              } else if (activeTab === 'monthly' && monthlyReport) {
                exportToCSV(monthlyReport.weeklyBreakdown, `time-report-monthly-${selectedMonth}.csv`);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['overview', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {timeStats.todayHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Today's Hours</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {timeStats.weekHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {timeStats.monthHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>

          {/* All Users Stats (if viewAllUsers) */}
          {viewAllUsers && !allStatsLoading && allStats.size > 0 && (
            <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Today</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Week</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(allStats.entries()).map(([userId, stats]) => (
                      <tr key={userId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          User {userId}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            stats.isClockedIn
                              ? 'bg-green-100 text-green-800'
                              : stats.currentStatus === 'on_break'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {stats.currentStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-900">
                          {stats.todayHours.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-900">
                          {stats.weekHours.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-900">
                          {stats.monthHours.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Tab */}
      {activeTab === 'weekly' && weeklyReport && (
        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatWeekRange(weeklyReport.weekStart, weeklyReport.weekEnd)}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {weeklyReport.totalHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Total Hours This Week</div>
              </div>
              <div className="space-y-2">
                {weeklyReport.dailyBreakdown.map((day) => (
                  <div key={day.date} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {day.hours.toFixed(1)}h
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        day.status === 'clocked_in' ? 'bg-green-500' :
                        day.status === 'on_break' ? 'bg-yellow-500' :
                        day.status === 'clocked_out' ? 'bg-gray-400' :
                        'bg-gray-300'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
            <div className="space-y-3">
              {weeklyReport.dailyBreakdown.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{formatDate(day.date)}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {day.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{day.hours.toFixed(1)}h</div>
                    {day.hours > 8 && (
                      <div className="text-xs text-orange-600">+{(day.hours - 8).toFixed(1)}h overtime</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Tab */}
      {activeTab === 'monthly' && monthlyReport && (
        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatMonth(monthlyReport.month)}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {monthlyReport.totalHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {monthlyReport.daysWorked}
                </div>
                <div className="text-sm text-gray-600">Days Worked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {monthlyReport.averageDailyHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Daily Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {monthlyReport.weeklyBreakdown.length}
                </div>
                <div className="text-sm text-gray-600">Work Weeks</div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Weekly Breakdown</h4>
              <div className="space-y-2">
                {monthlyReport.weeklyBreakdown.map((week) => (
                  <div key={week.weekStart} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatWeekRange(week.weekStart, week.weekEnd)}
                      </div>
                      <div className="text-sm text-gray-600">{week.entries.length} days tracked</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{week.totalHours.toFixed(1)}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};