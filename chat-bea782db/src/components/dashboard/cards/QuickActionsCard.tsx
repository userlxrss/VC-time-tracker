/**
 * Quick Actions Card Component
 *
 * Provides context-aware quick action buttons for clock in/out,
 * lunch, and breaks. Responsive design with loading states.
 */

import React, { useState } from 'react';
import { BreakPeriod } from '../../../database-schema';

interface QuickActionsCardProps {
  isClockedIn: boolean;
  isOnBreak: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: (type: BreakPeriod['type']) => void;
  onEndBreak: () => void;
  isLoading: boolean;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  isClockedIn,
  isOnBreak,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  isLoading
}) => {
  const [showBreakOptions, setShowBreakOptions] = useState(false);

  const getBreakTypeConfig = (type: BreakPeriod['type']) => {
    const configs = {
      lunch: {
        name: 'Lunch Break',
        description: '60 min unpaid',
        icon: '🍽️',
        color: 'orange',
        duration: 60
      },
      short_break: {
        name: 'Short Break',
        description: '15 min paid',
        icon: '☕',
        color: 'yellow',
        duration: 15
      },
      extended_break: {
        name: 'Extended Break',
        description: '30 min paid',
        icon: '😌',
        color: 'green',
        duration: 30
      }
    };
    return configs[type];
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 hover:bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200'
      },
      blue: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      orange: {
        bg: 'bg-orange-50 hover:bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200'
      },
      yellow: {
        bg: 'bg-yellow-50 hover:bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200'
      },
      purple: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200'
      },
      red: {
        bg: 'bg-red-50 hover:bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const clockInColor = getColorClasses('green');
  const clockOutColor = getColorClasses('red');
  const lunchColor = getColorClasses('orange');
  const breakColor = getColorClasses('yellow');
  const endBreakColor = getColorClasses('green');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Processing...</span>
        </div>
      )}

      {/* On Break State */}
      {!isLoading && isOnBreak && (
        <div className="space-y-3">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">☕</span>
              <div>
                <p className="font-medium text-yellow-900">Currently on Break</p>
                <p className="text-sm text-yellow-700">Ready to get back to work?</p>
              </div>
            </div>
          </div>

          <button
            onClick={onEndBreak}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${endBreakColor.bg} ${endBreakColor.text} ${endBreakColor.border}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏁</span>
              <div className="text-left">
                <p className="font-medium">End Break</p>
                <p className="text-sm opacity-75">Return to work</p>
              </div>
            </div>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Clocked In State */}
      {!isLoading && isClockedIn && !isOnBreak && (
        <div className="space-y-3">
          {/* Quick Lunch Button */}
          <button
            onClick={() => onStartBreak('lunch')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${lunchColor.bg} ${lunchColor.text} ${lunchColor.border}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🍽️</span>
              <div className="text-left">
                <p className="font-medium">Start Lunch</p>
                <p className="text-sm opacity-75">60 min unpaid break</p>
              </div>
            </div>
          </button>

          {/* Break Options Dropdown */}
          <div>
            <button
              onClick={() => setShowBreakOptions(!showBreakOptions)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${breakColor.bg} ${breakColor.text} ${breakColor.border}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">☕</span>
                <div className="text-left">
                  <p className="font-medium">Start Break</p>
                  <p className="text-sm opacity-75">Choose break type</p>
                </div>
              </div>
              <svg
                className={`h-5 w-5 transform transition-transform ${showBreakOptions ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showBreakOptions && (
              <div className="mt-2 space-y-2 border border-gray-200 rounded-lg overflow-hidden">
                {(['short_break', 'extended_break'] as const).map((breakType) => {
                  const config = getBreakTypeConfig(breakType);
                  const colors = getColorClasses(config.color);
                  return (
                    <button
                      key={breakType}
                      onClick={() => {
                        onStartBreak(breakType);
                        setShowBreakOptions(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 text-left transition-colors duration-200 ${colors.bg} ${colors.text}`}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{config.name}</p>
                        <p className="text-xs opacity-75">{config.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clock Out Button */}
          <button
            onClick={onClockOut}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${clockOutColor.bg} ${clockOutColor.text} ${clockOutColor.border}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏠</span>
              <div className="text-left">
                <p className="font-medium">Clock Out</p>
                <p className="text-sm opacity-75">End your workday</p>
              </div>
            </div>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Not Clocked In State */}
      {!isLoading && !isClockedIn && (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌅</span>
              <div>
                <p className="font-medium text-blue-900">Ready to Start?</p>
                <p className="text-sm text-blue-700">Clock in to begin your productive day</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClockIn}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${clockInColor.bg} ${clockInColor.text} ${clockInColor.border}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">⏰</span>
              <div className="text-left">
                <p className="font-medium">Clock In</p>
                <p className="text-sm opacity-75">Start your workday</p>
              </div>
            </div>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-medium text-gray-900">Flexible Work Culture</p>
            <p className="text-xs text-gray-600 mt-1">
              Work when you're most productive. Focus on results, not schedules!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;