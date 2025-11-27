/**
 * Activity Timeline Card Component
 *
 * Displays today's timeline with all activities including clock in, breaks,
 * and current status. Visual timeline with icons, colors, and time tracking.
 */

import React from 'react';
import { TimeEntry, BreakPeriod } from '../../../database-schema';
import { manilaTime } from '../../../lib/utils/manilaTime';

interface ActivityTimelineCardProps {
  activeEntry: TimeEntry | null;
  todayProgress: any;
  currentTime: Date;
}

const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({
  activeEntry,
  todayProgress,
  currentTime
}) => {
  // Get break type configuration
  const getBreakTypeConfig = (type: BreakPeriod['type']) => {
    const configs = {
      lunch: {
        name: 'Lunch Break',
        icon: '🍽️',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        isPaid: false
      },
      short_break: {
        name: 'Short Break',
        icon: '☕',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        isPaid: true
      },
      extended_break: {
        name: 'Extended Break',
        icon: '😌',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        isPaid: true
      }
    };
    return configs[type];
  };

  // Build timeline activities
  const getTimelineActivities = () => {
    const activities = [];

    if (activeEntry) {
      // Clock in activity
      activities.push({
        type: 'clock-in',
        time: activeEntry.clockIn,
        title: 'Started Work',
        description: 'Clocked in for the day',
        icon: '⏰',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });

      // Break activities
      activeEntry.breaks.forEach((breakPeriod) => {
        const config = getBreakTypeConfig(breakPeriod.type);
        activities.push({
          type: 'break-start',
          time: breakPeriod.startTime,
          title: `Started ${config.name}`,
          description: config.isPaid ? 'Paid break time' : 'Unpaid break time',
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor
        });

        if (breakPeriod.endTime) {
          activities.push({
            type: 'break-end',
            time: breakPeriod.endTime,
            title: `Ended ${config.name}`,
            description: `Duration: ${breakPeriod.duration || 0} minutes`,
            icon: '🏁',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
          });
        }
      });

      // Current activity (if not clocked out)
      if (!activeEntry.clockOut) {
        const activeBreak = activeEntry.breaks.find(b => !b.endTime);

        if (activeBreak) {
          const config = getBreakTypeConfig(activeBreak.type);
          activities.push({
            type: 'current-break',
            time: activeBreak.startTime,
            title: `Currently on ${config.name}`,
            description: `Started ${manilaTime.format(activeBreak.startTime, 'h:mm a')}`,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            isCurrent: true
          });
        } else {
          activities.push({
            type: 'current-work',
            time: activeEntry.clockIn,
            title: 'Currently Working',
            description: `Started ${manilaTime.format(activeEntry.clockIn, 'h:mm a')}`,
            icon: '💪',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            isCurrent: true
          });
        }
      }
    }

    // Sort by time
    return activities.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  const activities = getTimelineActivities();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Today's Activity Timeline</h2>
        <div className="text-sm text-gray-500">
          {manilaTime.format(currentTime, 'MMM d, yyyy')}
        </div>
      </div>

      {/* Timeline */}
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              {/* Timeline Icon */}
              <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center ${activity.color}`}>
                {activity.icon}
                {activity.isCurrent && (
                  <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-25" />
                )}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  {activity.isCurrent && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {manilaTime.format(activity.time, 'h:mm a')}
                </p>
              </div>

              {/* Timeline Line */}
              {index < activities.length - 1 && (
                <div className="absolute left-5 mt-10 w-0.5 h-6 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-gray-600">
            Your timeline will appear here once you start your workday.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {activeEntry && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Total Breaks</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeEntry.breaks.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Break Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeEntry.breaks.reduce((total, b) => total + (b.duration || 0), 0)}m
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-lg font-semibold text-gray-900">
                3 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Tip */}
      {activeEntry && !activeEntry.clockOut && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-blue-900">Productivity Tip</p>
              <p className="text-sm text-blue-700">
                {activeEntry.totalHours && activeEntry.totalHours > 4
                  ? 'You\'ve been working for a while. Consider taking a short break to stay fresh!'
                  : 'Great focus! Remember to take breaks when you need them.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimelineCard;