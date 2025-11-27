/**
 * Today's Progress Card Component
 *
 * Shows daily goal progress with visual progress bar, completion percentage,
 * and encouraging messages. Focuses on achievement rather than schedule.
 */

import React from 'react';
import { DailyWorkSummary } from '../../../lib/analytics/overtimeCalculator';

interface TodayProgressCardProps {
  todayProgress: DailyWorkSummary | null;
  workPattern: 'early-bird' | 'night-owl' | 'flexer' | 'newcomer';
}

const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
  todayProgress,
  workPattern
}) => {
  const DAILY_GOAL_HOURS = 8;
  const completedHours = todayProgress?.totalHours || 0;
  const remainingHours = Math.max(0, DAILY_GOAL_HOURS - completedHours);
  const completionPercentage = Math.min(100, (completedHours / DAILY_GOAL_HOURS) * 100);
  const isComplete = completedHours >= DAILY_GOAL_HOURS;

  // Get encouraging message based on progress
  const getProgressMessage = () => {
    if (isComplete) {
      return '🎉 Fantastic! You\'ve reached your daily goal!';
    }

    if (completionPercentage >= 75) {
      return '🔥 Almost there! You\'re doing amazing!';
    }

    if (completionPercentage >= 50) {
      return '💪 Halfway there! Keep up the great work!';
    }

    if (completionPercentage >= 25) {
      return '🚀 Great start! Building momentum!';
    }

    if (completedHours > 0) {
      return '🌟 Good beginning! Every hour counts!';
    }

    return 'Ready to start your productive day?';
  };

  // Get work pattern insight
  const getWorkPatternInsight = () => {
    switch (workPattern) {
      case 'early-bird':
        return {
          icon: '🌅',
          title: 'Early Bird',
          description: 'You shine brightest in the morning hours!'
        };
      case 'night-owl':
        return {
          icon: '🦉',
          title: 'Night Owl',
          description: 'You find your focus during quiet evening hours!'
        };
      case 'flexer':
        return {
          icon: '🌈',
          title: 'Flexible Worker',
          description: 'You adapt beautifully to any schedule!'
        };
      default:
        return {
          icon: '🌟',
          title: 'Building Your Pattern',
          description: 'Your unique work style is emerging!'
        };
    }
  };

  const patternInsight = getWorkPatternInsight();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Daily Goal:</span>
          <span className="font-bold text-gray-900">{DAILY_GOAL_HOURS}h</span>
        </div>
      </div>

      {/* Main Progress Display */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionPercentage / 100)}`}
                className={isComplete ? 'text-green-500' : 'text-blue-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">
                {completedHours.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">hours</div>
              {isComplete && (
                <div className="text-xs text-green-600 font-medium mt-1">Complete!</div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Message */}
        <p className="mt-4 text-lg font-medium text-gray-900">
          {getProgressMessage()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress Bar</span>
          <span className="text-sm text-gray-500">{completionPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-gradient-to-r from-blue-400 to-blue-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Hours Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-xl font-bold text-gray-900">{completedHours.toFixed(1)}h</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className="text-xl font-bold text-gray-900">{remainingHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Work Pattern Insight */}
      <div className="p-4 bg-purple-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{patternInsight.icon}</span>
          <div>
            <p className="font-medium text-purple-900">{patternInsight.title}</p>
            <p className="text-sm text-purple-700">{patternInsight.description}</p>
          </div>
        </div>
      </div>

      {/* Completion Celebrations */}
      {isComplete && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
          <div className="flex justify-center space-x-2 mb-2">
            <span className="text-2xl">🎊</span>
            <span className="text-2xl">🎉</span>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-green-900 font-bold">Goal Achieved!</p>
          <p className="text-green-700 text-sm">You've completed your daily work goal. Incredible dedication!</p>
        </div>
      )}
    </div>
  );
};

export default TodayProgressCard;