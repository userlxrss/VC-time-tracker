'use client';

import React, { useState } from 'react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { Clock, Coffee, AlertCircle, Play, Square, Pause, PlayCircle } from 'lucide-react';

interface TimeTrackingWidgetProps {
  className?: string;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({ className = '' }) => {
  const {
    todayEntry,
    timeStats,
    handleClockIn,
    handleClockOut,
    handleStartLunchBreak,
    handleEndLunchBreak,
    handleStartShortBreak,
    handleEndShortBreak,
    currentSessionDuration,
    liveHoursToday,
    isLoading,
  } = useTimeTracking();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<{ success: boolean; error?: string }>, actionName: string) => {
    setActionLoading(actionName);
    try {
      const result = await action();
      if (!result.success && result.error) {
        // You could show a toast notification here
        console.error(result.error);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'on_break':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'clocked_out':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'Clocked In';
      case 'on_break':
        return 'On Break';
      case 'clocked_out':
        return 'Clocked Out';
      default:
        return 'Not Started';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(timeStats.currentStatus)}`}>
          {getStatusText(timeStats.currentStatus)}
        </div>
      </div>

      {/* Current Session Timer */}
      {todayEntry && todayEntry.clockIn && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-blue-900 mb-2">
              {currentSessionDuration}
            </div>
            <div className="text-sm text-blue-700">
              Current Session • {liveHoursToday.toFixed(2)} hours today
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{timeStats.todayHours.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Today</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{timeStats.weekHours.toFixed(1)}</div>
          <div className="text-xs text-gray-600">This Week</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{timeStats.monthHours.toFixed(1)}</div>
          <div className="text-xs text-gray-600">This Month</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="flex gap-2">
          {!todayEntry || todayEntry.status === 'not_started' || todayEntry.status === 'clocked_out' ? (
            <button
              onClick={() => handleAction(handleClockIn, 'clockIn')}
              disabled={actionLoading === 'clockIn'}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {actionLoading === 'clockIn' ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              Clock In
            </button>
          ) : (
            <button
              onClick={() => handleAction(handleClockOut, 'clockOut')}
              disabled={actionLoading === 'clockOut'}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {actionLoading === 'clockOut' ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Clock Out
            </button>
          )}
        </div>

        {/* Break Actions - only show when clocked in */}
        {todayEntry && todayEntry.status === 'clocked_in' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(handleStartLunchBreak, 'lunchBreak')}
              disabled={actionLoading === 'lunchBreak'}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {actionLoading === 'lunchBreak' ? (
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Coffee className="w-3 h-3" />
              )}
              Lunch Break
            </button>
            <button
              onClick={() => handleAction(handleStartShortBreak, 'shortBreak')}
              disabled={actionLoading === 'shortBreak'}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {actionLoading === 'shortBreak' ? (
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
              Short Break
            </button>
          </div>
        )}

        {/* End Break Actions - only show when on break */}
        {todayEntry && todayEntry.status === 'on_break' && (
          <div className="space-y-2">
            {todayEntry.lunchBreakStart && !todayEntry.lunchBreakEnd && (
              <button
                onClick={() => handleAction(handleEndLunchBreak, 'endLunchBreak')}
                disabled={actionLoading === 'endLunchBreak'}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {actionLoading === 'endLunchBreak' ? (
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Coffee className="w-3 h-3" />
                )}
                End Lunch Break
              </button>
            )}

            {todayEntry.shortBreaks.some(b => b.start && !b.end) && (
              <button
                onClick={() => handleAction(handleEndShortBreak, 'endShortBreak')}
                disabled={actionLoading === 'endShortBreak'}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {actionLoading === 'endShortBreak' ? (
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                End Short Break
              </button>
            )}
          </div>
        )}

        {/* Current Break Info */}
        {todayEntry && todayEntry.status === 'on_break' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {todayEntry.lunchBreakStart && !todayEntry.lunchBreakEnd
                  ? 'Currently on lunch break'
                  : 'Currently on short break'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Today's Entry Details */}
      {todayEntry && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 space-y-2">
            {todayEntry.clockIn && (
              <div className="flex justify-between">
                <span>Clock In:</span>
                <span className="font-medium">{new Date(todayEntry.clockIn).toLocaleTimeString()}</span>
              </div>
            )}
            {todayEntry.clockOut && (
              <div className="flex justify-between">
                <span>Clock Out:</span>
                <span className="font-medium">{new Date(todayEntry.clockOut).toLocaleTimeString()}</span>
              </div>
            )}
            {todayEntry.lunchBreakStart && (
              <div className="flex justify-between">
                <span>Lunch Break:</span>
                <span className="font-medium">
                  {new Date(todayEntry.lunchBreakStart).toLocaleTimeString()}
                  {todayEntry.lunchBreakEnd && ` - ${new Date(todayEntry.lunchBreakEnd).toLocaleTimeString()}`}
                </span>
              </div>
            )}
            {todayEntry.shortBreaks.length > 0 && (
              <div className="flex justify-between">
                <span>Short Breaks:</span>
                <span className="font-medium">{todayEntry.shortBreaks.length} taken</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};