/**
 * Time Entry Detail Modal Component
 *
 * Detailed view of a time entry with complete timeline, breakdown, productivity insights,
 * and edit capabilities for current day entries.
 */

import React, { useState } from 'react';
import { TimeEntry, TimeEntryStatus } from '../../database-schema';
import { manilaTime } from '../../lib/utils/manilaTime';

interface TimeEntryDetailModalProps {
  entry: TimeEntry;
  onClose: () => void;
  formatDate: (date: Date, format?: string) => string;
  formatDuration: (hours: number) => string;
}

/**
 * Timeline component for visualizing the work day
 */
const Timeline: React.FC<{ entry: TimeEntry }> = ({ entry }) => {
  const startHour = 5; // 5 AM
  const endHour = 24; // 12 AM (midnight)
  const totalHours = endHour - startHour;

  const getEventPosition = (date: Date) => {
    const hours = date.getHours() + date.getMinutes() / 60;
    return ((hours - startHour) / totalHours) * 100;
  };

  const getEventWidth = (startTime: Date, endTime: Date) => {
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return (duration / totalHours) * 100;
  };

  const workEntryPosition = getEventPosition(entry.clockIn);
  const workEntryWidth = entry.clockOut
    ? getEventWidth(entry.clockIn, entry.clockOut)
    : getEventWidth(entry.clockIn, new Date());

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Daily Timeline</h4>

      {/* Hour markers */}
      <div className="relative h-12 mb-2">
        {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
          const hour = startHour + i;
          const position = (i / (endHour - startHour)) * 100;

          return (
            <div
              key={hour}
              className="absolute top-0 h-2 w-px bg-gray-300"
              style={{ left: `${position}%` }}
            >
              <span className="absolute top-3 text-xs text-gray-500 transform -translate-x-1/2">
                {hour % 12 || 12}{hour < 12 ? 'AM' : 'PM'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Work period */}
      <div className="relative h-8">
        <div
          className="absolute top-2 h-4 bg-blue-500 rounded-md flex items-center justify-center text-white text-xs"
          style={{
            left: `${workEntryPosition}%`,
            width: `${Math.max(workEntryWidth, 2)}%` // Minimum 2% width for visibility
          }}
        >
          {workEntryWidth > 10 && 'Work Time'}
        </div>

        {/* Break periods */}
        {entry.breaks.map((breakPeriod, index) => {
          if (!breakPeriod.startTime || !breakPeriod.endTime) return null;

          const position = getEventPosition(breakPeriod.startTime);
          const width = getEventWidth(breakPeriod.startTime, breakPeriod.endTime);

          return (
            <div
              key={breakPeriod.id || index}
              className="absolute top-2 h-4 bg-orange-400 rounded-md"
              style={{
                left: `${position}%`,
                width: `${Math.max(width, 1)}%`
              }}
              title={`${breakPeriod.type}: ${breakPeriod.duration} minutes`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-700">Work Time</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-400 rounded"></div>
          <span className="text-xs text-gray-700">Breaks</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Work pattern analysis component
 */
const WorkPatternAnalysis: React.FC<{ entry: TimeEntry }> = ({ entry }) => {
  const clockInHour = entry.clockIn.getHours();

  let pattern: { name: string; icon: string; description: string; color: string };

  if (clockInHour >= 5 && clockInHour < 8) {
    pattern = {
      name: 'Early Bird',
      icon: '🌅',
      description: 'You start work early and are most productive in the morning hours.',
      color: 'bg-orange-100 text-orange-800'
    };
  } else if (clockInHour >= 20 || clockInHour < 5) {
    pattern = {
      name: 'Night Owl',
      icon: '🌙',
      description: 'You prefer working late hours when distractions are minimal.',
      color: 'bg-indigo-100 text-indigo-800'
    };
  } else if (clockInHour >= 9 && clockInHour <= 17) {
    pattern = {
      name: 'Standard',
      icon: '⏰',
      description: 'You follow traditional business hours for maximum collaboration.',
      color: 'bg-blue-100 text-blue-800'
    };
  } else {
    pattern = {
      name: 'Flexer',
      icon: '🌈',
      description: 'You have a flexible schedule that adapts to your peak productivity times.',
      color: 'bg-purple-100 text-purple-800'
    };
  }

  return (
    <div className={`${pattern.color} rounded-lg p-4`}>
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{pattern.icon}</span>
        <h4 className="font-semibold">{pattern.name}</h4>
      </div>
      <p className="text-sm">{pattern.description}</p>
    </div>
  );
};

/**
 * Productivity insights component
 */
const ProductivityInsights: React.FC<{ entry: TimeEntry }> = ({ entry }) => {
  const insights = [];

  // Calculate break efficiency
  const totalBreakTime = entry.breaks.reduce((total, breakPeriod) => total + (breakPeriod.duration || 0), 0);
  const breakPercentage = entry.totalHours > 0 ? (totalBreakTime / 60) / entry.totalHours * 100 : 0;

  if (breakPercentage < 5) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      message: 'Minimal breaks! Remember to take regular breaks for optimal productivity.'
    });
  } else if (breakPercentage > 20) {
    insights.push({
      type: 'info',
      icon: '☕',
      message: 'Good break balance! Regular breaks help maintain focus and energy.'
    });
  } else {
    insights.push({
      type: 'success',
      icon: '✅',
      message: 'Excellent work-break balance for sustained productivity.'
    });
  }

  // Check work duration
  if (entry.totalHours && entry.totalHours > 10) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      message: 'Long workday detected. Consider splitting long sessions across multiple days.'
    });
  } else if (entry.totalHours && entry.totalHours >= 8) {
    insights.push({
      type: 'success',
      icon: '🎯',
      message: 'Excellent! You\'ve met your daily work hour goal.'
    });
  }

  // Check for consistent timing
  if (entry.clockIn.getHours() >= 9 && entry.clockIn.getHours() <= 10) {
    insights.push({
      type: 'info',
      icon: '📈',
      message: 'Consistent morning start time helps establish a productive routine.'
    });
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Productivity Insights</h4>
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`flex items-start space-x-2 p-3 rounded-lg ${
            insight.type === 'success' ? 'bg-green-50' :
            insight.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
          }`}
        >
          <span className="text-sm">{insight.icon}</span>
          <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Main Time Entry Detail Modal Component
 */
export const TimeEntryDetailModal: React.FC<TimeEntryDetailModalProps> = ({
  entry,
  onClose,
  formatDate,
  formatDuration
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(entry.notes || '');

  const handleSaveNotes = () => {
    // In a real implementation, this would save to the backend
    console.log('Saving notes:', notes);
    setIsEditing(false);
  };

  const totalBreakTime = entry.breaks.reduce((total, breakPeriod) => total + (breakPeriod.duration || 0), 0);
  const efficiencyRate = entry.totalHours > 0
    ? ((entry.totalHours - totalBreakTime / 60) / entry.totalHours) * 100
    : 0;

  const isToday = manilaTime.isToday(entry.clockIn);
  const canEdit = isToday && entry.status !== TimeEntryStatus.COMPLETED;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Time Entry Details</h2>
            <p className="text-gray-600 mt-1">
              {formatDate(entry.clockIn, 'dddd, MMMM DD, YYYY')}
              {isToday && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 text-sm font-medium mb-1">Clock In</div>
              <div className="text-lg font-bold text-blue-900">
                {formatDate(entry.clockIn, 'hh:mm A')}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium mb-1">Clock Out</div>
              <div className="text-lg font-bold text-green-900">
                {entry.clockOut ? formatDate(entry.clockOut, 'hh:mm A') : 'Active'}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 text-sm font-medium mb-1">Total Hours</div>
              <div className="text-lg font-bold text-purple-900">
                {formatDuration(entry.totalHours || 0)}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-orange-600 text-sm font-medium mb-1">Break Time</div>
              <div className="text-lg font-bold text-orange-900">
                {totalBreakTime} min
              </div>
            </div>
          </div>

          {/* Timeline Visualization */}
          <Timeline entry={entry} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Pattern Analysis */}
            <WorkPatternAnalysis entry={entry} />

            {/* Break Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Break Details</h4>
              {entry.breaks.length > 0 ? (
                <div className="space-y-2">
                  {entry.breaks.map((breakPeriod, index) => (
                    <div key={breakPeriod.id || index} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm capitalize">{breakPeriod.type.replace('_', ' ')}</span>
                        {breakPeriod.isPaid && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {breakPeriod.duration || 0} min
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Total Break Time:</span>
                      <span className="font-bold">{totalBreakTime} minutes</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No breaks recorded</p>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Work Efficiency</div>
                <div className="text-2xl font-bold text-gray-900">{efficiencyRate.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Active work vs total time</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="text-lg font-bold text-gray-900 capitalize">
                  {entry.status.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-600">Current entry status</div>
              </div>

              {entry.overtimeHours && entry.overtimeHours > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Overtime</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {entry.overtimeHours.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-600">Extra hours worked</div>
                </div>
              )}
            </div>
          </div>

          {/* Productivity Insights */}
          <ProductivityInsights entry={entry} />

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Notes</h4>
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit Notes
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Add notes about this work day..."
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 min-h-[80px]">
                {notes ? (
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">No notes recorded</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};