/**
 * Real-Time Status Card Component
 *
 * Displays current work status with smart dropdown actions, live progress bar,
 * and projected completion time. Context-aware based on current state.
 */

import React, { useState } from 'react';
import { BreakPeriod, TimeEntry } from '../../../database-schema';
import { manilaTime } from '../../../lib/utils/manilaTime';

interface RealTimeStatusCardProps {
  isClockedIn: boolean;
  isOnBreak: boolean;
  currentBreakType: BreakPeriod['type'] | null;
  activeEntry: TimeEntry | null;
  projectedFinishTime: Date | null;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: (type: BreakPeriod['type']) => void;
  onEndBreak: () => void;
  currentTime: Date;
}

const RealTimeStatusCard: React.FC<RealTimeStatusCardProps> = ({
  isClockedIn,
  isOnBreak,
  currentBreakType,
  activeEntry,
  projectedFinishTime,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  currentTime
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Calculate time since last action
  const getTimeSinceLastAction = () => {
    if (!activeEntry) return null;

    const lastTime = isOnBreak
      ? activeEntry.breaks.find(b => !b.endTime)?.startTime
      : activeEntry.clockIn;

    if (!lastTime) return null;

    const diff = currentTime.getTime() - lastTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get current status text and color
  const getStatusInfo = () => {
    if (isOnBreak) {
      const config = getBreakTypeConfig(currentBreakType);
      return {
        text: `On ${config?.name || 'Break'}`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: '☕'
      };
    }

    if (isClockedIn) {
      return {
        text: 'Working',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '💪'
      };
    }

    return {
      text: 'Not Clocked In',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '😴'
    };
  };

  // Get break type configuration
  const getBreakTypeConfig = (type: BreakPeriod['type'] | null) => {
    const configs = {
      lunch: { name: 'Lunch Break', duration: 60, isPaid: false },
      short_break: { name: 'Short Break', duration: 15, isPaid: true },
      extended_break: { name: 'Extended Break', duration: 30, isPaid: true }
    };
    return type ? configs[type] : null;
  };

  // Get available actions based on current state
  const getAvailableActions = () => {
    if (isOnBreak) {
      return [
        {
          label: 'End Break',
          action: onEndBreak,
          color: 'text-green-600 hover:bg-green-50',
          icon: '🏁'
        }
      ];
    }

    if (isClockedIn) {
      return [
        {
          label: 'Start Lunch',
          action: () => onStartBreak('lunch'),
          color: 'text-blue-600 hover:bg-blue-50',
          icon: '🍽️'
        },
        {
          label: 'Start Break',
          action: () => onStartBreak('short_break'),
          color: 'text-yellow-600 hover:bg-yellow-50',
          icon: '☕'
        },
        {
          label: 'Clock Out',
          action: onClockOut,
          color: 'text-red-600 hover:bg-red-50',
          icon: '🏠'
        }
      ];
    }

    return [
      {
        label: 'Clock In',
        action: onClockIn,
        color: 'text-green-600 hover:bg-green-50',
        icon: '⏰'
      }
    ];
  };

  const statusInfo = getStatusInfo();
  const timeSince = getTimeSinceLastAction();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.text}
          </span>
          {timeSince && (
            <span className="text-sm text-gray-500">
              for {timeSince}
            </span>
          )}
        </div>
      </div>

      {/* Current Time Display */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {manilaTime.format(currentTime, 'h:mm:ss a')}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Manila Time
        </div>
      </div>

      {/* Live Progress Bar */}
      {isClockedIn && activeEntry && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Daily Progress</span>
            <span className="text-sm text-gray-500">
              {activeEntry.totalHours?.toFixed(1) || '0.0'} / 8.0 hours
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.min(100, ((activeEntry.totalHours || 0) / 8) * 100)}%`
              }}
            />
          </div>
          {projectedFinishTime && (
            <p className="text-sm text-gray-600 mt-2">
              🎯 Projected completion: {manilaTime.format(projectedFinishTime, 'h:mm a')}
            </p>
          )}
        </div>
      )}

      {/* Smart Action Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <span className="font-medium text-gray-900">Quick Actions</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              {getAvailableActions().map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${action.color}`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Status Information */}
      {activeEntry && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Started at</p>
              <p className="font-medium text-gray-900">
                {manilaTime.format(activeEntry.clockIn, 'h:mm a')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Breaks taken</p>
              <p className="font-medium text-gray-900">
                {activeEntry.breaks.length} {activeEntry.breaks.length === 1 ? 'break' : 'breaks'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* When not clocked in */}
      {!isClockedIn && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-900 font-medium">Ready to start your day?</p>
          <p className="text-blue-700 text-sm mt-1">Clock in when you're ready to begin working</p>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatusCard;