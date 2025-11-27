/**
 * Team Overview Panel Component
 *
 * Displays real-time team status summary cards showing current work states,
 * progress metrics, and team performance indicators. Focuses on team achievements
 * rather than individual monitoring, celebrating flexible work patterns.
 */

import React from 'react';
import { manilaTime } from '../../../lib/utils/manilaTime';

interface TeamData {
  totalMembers: number;
  currentlyWorking: number;
  onBreak: number;
  onLunch: number;
  finished: number;
  todayProgress: number;
  weeklyProgress: number;
}

interface TeamOverviewPanelProps {
  teamData: TeamData;
  currentTime: Date;
}

const TeamOverviewPanel: React.FC<TeamOverviewPanelProps> = ({
  teamData,
  currentTime
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusMessage = () => {
    const hour = parseInt(manilaTime.format(currentTime, 'HH'));

    if (hour < 6) return 'Team in Various Time Zones';
    if (hour < 9) return 'Early Birds Starting Their Day';
    if (hour < 12) return 'Morning Productivity Peak';
    if (hour < 14) return 'Lunch Break Time';
    if (hour < 17) return 'Afternoon Focus Session';
    if (hour < 20) return 'Extended Hours Contributors';
    return 'Night Owls and Global Team';
  };

  const getWorkPatternInsight = () => {
    const workingPercentage = (teamData.currentlyWorking / teamData.totalMembers) * 100;

    if (workingPercentage >= 70) return 'High engagement - team delivering excellent results!';
    if (workingPercentage >= 50) return 'Good productivity - balanced work approach';
    if (workingPercentage >= 30) return 'Flexible scheduling - team working diverse hours';
    return 'Global team - spanning multiple time zones';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team Overview</h2>
          <p className="text-sm text-gray-600 mt-1">{getStatusMessage()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Team Productivity</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.round((teamData.currentlyWorking / teamData.totalMembers) * 100)}%
          </p>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Currently Working */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💼</span>
            <span className="text-2xl font-bold text-green-700">{teamData.currentlyWorking}</span>
          </div>
          <p className="text-sm font-medium text-green-800">Currently Working</p>
          <p className="text-xs text-green-600 mt-1">Delivering results</p>
        </div>

        {/* On Break */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">☕</span>
            <span className="text-2xl font-bold text-blue-700">{teamData.onBreak}</span>
          </div>
          <p className="text-sm font-medium text-blue-800">On Break</p>
          <p className="text-xs text-blue-600 mt-1">Recharging energy</p>
        </div>

        {/* On Lunch */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-2xl font-bold text-yellow-700">{teamData.onLunch}</span>
          </div>
          <p className="text-sm font-medium text-yellow-800">Lunch Break</p>
          <p className="text-xs text-yellow-600 mt-1">Fueling up</p>
        </div>

        {/* Finished for Day */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🎉</span>
            <span className="text-2xl font-bold text-purple-700">{teamData.finished}</span>
          </div>
          <p className="text-sm font-medium text-purple-800">Finished</p>
          <p className="text-xs text-purple-600 mt-1">Goals achieved</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        {/* Today's Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Team Progress</span>
            <span className="text-sm text-gray-900 font-semibold">{teamData.todayProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(teamData.todayProgress)}`}
              style={{ width: `${teamData.todayProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Target: {teamData.totalMembers * 8} hours collective
          </p>
        </div>

        {/* Weekly Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Weekly Team Progress</span>
            <span className="text-sm text-gray-900 font-semibold">{teamData.weeklyProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(teamData.weeklyProgress)}`}
              style={{ width: `${teamData.weeklyProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Target: {teamData.totalMembers * 40} hours collective
          </p>
        </div>
      </div>

      {/* Team Insight */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <span className="text-lg mt-0.5">💡</span>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Team Insight</h3>
            <p className="text-xs text-gray-600">{getWorkPatternInsight()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{teamData.totalMembers}</p>
          <p className="text-xs text-gray-500">Total Members</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">
            {Math.round((teamData.currentlyWorking / teamData.totalMembers) * 100)}%
          </p>
          <p className="text-xs text-gray-500">Active Rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {manilaTime.format(currentTime, 'EEE')}
          </p>
          <p className="text-xs text-gray-500">Current Day</p>
        </div>
      </div>
    </div>
  );
};

export { TeamOverviewPanel };