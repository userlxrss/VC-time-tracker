/**
 * Team Members Table Component
 *
 * Real-time team members table showing current status, work patterns, and hours.
 * Celebrates flexible work patterns without micromanagement. Focuses on results
 * rather than schedules, with color-coded status indicators and work pattern badges.
 */

import React from 'react';
import { User } from '../../../database-schema';
import { manilaTime } from '../../../lib/utils/manilaTime';

interface TeamMembersTableProps {
  teamMembers: User[];
  currentTime: Date;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  teamMembers,
  currentTime
}) => {
  // Simulate team member statuses and work patterns
  const getTeamMemberStatus = (member: User) => {
    // In a real app, this would come from actual time tracking data
    const hour = manilaTime.format(currentTime, 'HH');
    const hourNum = parseInt(hour);

    // Mock work patterns based on flexible schedules
    const patterns = ['early-bird', 'flexer', 'night-owl'] as const;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    // Mock statuses based on time and work patterns
    let status: 'working' | 'break' | 'lunch' | 'finished' | 'not-started';
    let statusColor: string;
    let statusText: string;

    if (hourNum >= 22 || hourNum < 5) {
      status = pattern === 'night-owl' ? 'working' : 'finished';
    } else if (hourNum >= 5 && hourNum < 8) {
      status = pattern === 'early-bird' ? 'working' : 'not-started';
    } else if (hourNum >= 12 && hourNum < 13) {
      status = Math.random() > 0.3 ? 'lunch' : 'working';
    } else if (hourNum >= 15 && hourNum < 16) {
      status = Math.random() > 0.7 ? 'break' : 'working';
    } else if (hourNum >= 18 && hourNum < 20) {
      status = Math.random() > 0.5 ? 'working' : 'finished';
    } else if (hourNum >= 20) {
      status = 'finished';
    } else {
      status = 'working';
    }

    switch (status) {
      case 'working':
        statusColor = 'bg-green-100 text-green-800 border-green-200';
        statusText = 'Working';
        break;
      case 'break':
        statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
        statusText = 'Break';
        break;
      case 'lunch':
        statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        statusText = 'Lunch';
        break;
      case 'finished':
        statusColor = 'bg-purple-100 text-purple-800 border-purple-200';
        statusText = 'Finished';
        break;
      case 'not-started':
        statusColor = 'bg-gray-100 text-gray-800 border-gray-200';
        statusText = 'Not Started';
        break;
    }

    return { status, statusColor, statusText, pattern };
  };

  const getWorkPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'early-bird': return '🌅';
      case 'night-owl': return '🦉';
      case 'flexer': return '🌈';
      default: return '⭐';
    }
  };

  const getWorkPatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'early-bird': return 'Early Bird';
      case 'night-owl': return 'Night Owl';
      case 'flexer': return 'Flexer';
      default: return 'Newcomer';
    }
  };

  const getWorkPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'early-bird': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'night-owl': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'flexer': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mock hours data (in real app, this would come from time tracking)
  const getMockHours = (member: User) => {
    const status = getTeamMemberStatus(member);
    let todayHours = 0;
    let weekHours = 0;
    let monthHours = 0;

    if (status.status === 'working') {
      todayHours = Math.floor(Math.random() * 6) + 2; // 2-8 hours
    } else if (status.status === 'finished') {
      todayHours = Math.floor(Math.random() * 3) + 7; // 7-10 hours (completed day)
    } else {
      todayHours = Math.floor(Math.random() * 5) + 1; // 1-6 hours (partial day)
    }

    weekHours = todayHours * 4 + Math.floor(Math.random() * 10); // Rough estimate
    monthHours = weekHours * 4 + Math.floor(Math.random() * 40); // Rough estimate

    return { todayHours, weekHours, monthHours };
  };

  const formatLastActivity = (member: User) => {
    const status = getTeamMemberStatus(member);
    const minutesAgo = Math.floor(Math.random() * 60); // Mock time

    if (status.status === 'working') {
      return `Active now`;
    } else if (minutesAgo < 5) {
      return 'Just now';
    } else if (minutesAgo < 60) {
      return `${minutesAgo} minutes ago`;
    } else {
      const hours = Math.floor(minutesAgo / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  };

  if (teamMembers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
          <p className="text-gray-600">No team members assigned to your management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time status and work patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Live
          </span>
          <span className="text-xs text-gray-500">
            {manilaTime.format(currentTime, 'h:mm a')}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Pattern
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Today's Hours
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This Week
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This Month
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => {
                const statusData = getTeamMemberStatus(member);
                const hoursData = getMockHours(member);
                const lastActivity = formatLastActivity(member);

                return (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    {/* Team Member Info */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.position} • {member.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Current Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusData.statusColor}`}>
                        {statusData.statusText}
                      </span>
                    </td>

                    {/* Work Pattern */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getWorkPatternColor(statusData.pattern)}`}>
                        <span className="mr-1">{getWorkPatternIcon(statusData.pattern)}</span>
                        {getWorkPatternLabel(statusData.pattern)}
                      </span>
                    </td>

                    {/* Today's Hours */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {hoursData.todayHours.toFixed(1)}h
                      </div>
                      {hoursData.todayHours >= 8 && (
                        <span className="text-xs text-green-600">✅ Goal met</span>
                      )}
                    </td>

                    {/* This Week */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hoursData.weekHours}h
                      </div>
                      <div className="text-xs text-gray-500">/ 40h target</div>
                    </td>

                    {/* This Month */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hoursData.monthHours}h
                      </div>
                      <div className="text-xs text-gray-500">~{Math.round(hoursData.monthHours / 4)}h/week</div>
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lastActivity}
                      </div>
                      {statusData.status === 'working' && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-1"></div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with Team Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Working
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Break
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Lunch
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              Finished
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export { TeamMembersTable };