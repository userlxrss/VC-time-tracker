/**
 * Weekly Summary Card Component
 *
 * Displays week-at-a-glance metrics including total hours, days completed,
  * average hours, weekly progress, and current streak.
 */

import React from 'react';

interface WeeklyProgress {
  targetHours: number;
  completedHours: number;
  workDays: number;
  completedDays: number;
  averageHours: number;
  streak: number;
}

interface WeeklySummaryCardProps {
  weeklyProgress: WeeklyProgress | null;
  workPattern: 'early-bird' | 'night-owl' | 'flexer' | 'newcomer';
}

const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  weeklyProgress,
  workPattern
}) => {
  if (!weeklyProgress) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week Summary</h2>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-gray-600">Loading weekly data...</p>
        </div>
      </div>
    );
  }

  const {
    targetHours,
    completedHours,
    workDays,
    completedDays,
    averageHours,
    streak
  } = weeklyProgress;

  const weeklyPercentage = Math.min(100, (completedHours / targetHours) * 100);
  const daysPercentage = (completedDays / workDays) * 100;

  // Get streak message
  const getStreakMessage = () => {
    if (streak >= 5) return '🔥 Amazing consistency!';
    if (streak >= 3) return '👏 Great momentum!';
    if (streak >= 1) return '💪 Building habits!';
    return '🌱 Start your streak!';
  };

  // Get work week status
  const getWorkWeekStatus = () => {
    if (weeklyPercentage >= 100) return {
      text: 'Weekly Goal Complete!',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
    if (weeklyPercentage >= 75) return {
      text: 'Almost There!',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    };
    if (weeklyPercentage >= 50) return {
      text: 'Good Progress',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
    return {
      text: 'Getting Started',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const workWeekStatus = getWorkWeekStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">This Week Summary</h2>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${workWeekStatus.bgColor} ${workWeekStatus.color}`}>
          {workWeekStatus.text}
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Hours */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-blue-900">{completedHours.toFixed(1)}</p>
          <p className="text-xs text-blue-600">of {targetHours}h goal</p>
        </div>

        {/* Days Completed */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium mb-1">Days Completed</p>
          <p className="text-2xl font-bold text-green-900">{completedDays}</p>
          <p className="text-xs text-green-600">of {workDays} days</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        {/* Weekly Hours Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Weekly Hours Progress</span>
            <span className="text-sm text-gray-500">{weeklyPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${weeklyPercentage}%` }}
            />
          </div>
        </div>

        {/* Work Days Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Work Days Progress</span>
            <span className="text-sm text-gray-500">{daysPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${daysPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Average Hours */}
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Daily Average</p>
            <p className="text-xl font-bold text-purple-900">{averageHours.toFixed(1)} hours</p>
          </div>
          <div className="text-3xl">📈</div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-600 font-medium">Current Streak</p>
            <p className="text-lg font-bold text-yellow-900">{streak} days</p>
            <p className="text-xs text-yellow-700">{getStreakMessage()}</p>
          </div>
          <div className="text-3xl">{streak >= 5 ? '🔥' : streak >= 3 ? '✨' : '🌟'}</div>
        </div>
      </div>

      {/* Work Pattern Badge */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="text-gray-500">Your Style:</span>
          <span className="font-medium text-gray-900 capitalize">
            {workPattern.replace('-', ' ')}
          </span>
          {workPattern === 'early-bird' && <span>🌅</span>}
          {workPattern === 'night-owl' && <span>🦉</span>}
          {workPattern === 'flexer' && <span>🌈</span>}
          {workPattern === 'newcomer' && <span>🌟</span>}
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;