/**
 * Monthly Summary Component
 *
 * Displays comprehensive monthly timesheet summary with status indicators,
 * work pattern analysis, and progress tracking.
 */

import React from 'react';

interface MonthlySummaryProps {
  summary: {
    totalDays: number;
    totalHours: number;
    targetHours: number;
    averageHours: number;
    status: 'complete' | 'exceeded' | 'approaching' | 'needs_attention';
    workPatterns: {
      earlyBird: number;
      nightOwl: number;
      flexer: number;
      standard: number;
    };
  };
  userName: string;
}

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: MonthlySummaryProps['summary']['status'] }> = ({ status }) => {
  const config = {
    complete: {
      color: 'bg-green-100 text-green-800',
      icon: '🟢',
      label: 'Complete'
    },
    exceeded: {
      color: 'bg-purple-100 text-purple-800',
      icon: '🟣',
      label: 'Exceeded Goal'
    },
    approaching: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: '🟡',
      label: 'Approaching Goal'
    },
    needs_attention: {
      color: 'bg-red-100 text-red-800',
      icon: '🔴',
      label: 'Needs Attention'
    }
  };

  const { color, icon, label } = config[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </span>
  );
};

/**
 * Progress bar component
 */
const ProgressBar: React.FC<{ current: number; target: number }> = ({ current, target }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isExceeded = current > target;

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ease-out ${
          isExceeded ? 'bg-purple-600' : percentage >= 100 ? 'bg-green-600' : 'bg-blue-600'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/**
 * Work pattern analysis component
 */
const WorkPatternAnalysis: React.FC<{ patterns: MonthlySummaryProps['summary']['workPatterns'] }> = ({ patterns }) => {
  const total = patterns.earlyBird + patterns.nightOwl + patterns.flexer + patterns.standard;

  if (total === 0) return null;

  const patternData = [
    { key: 'earlyBird', label: 'Early Bird 🌅', count: patterns.earlyBird, color: 'bg-orange-500' },
    { key: 'nightOwl', label: 'Night Owl 🌙', count: patterns.nightOwl, color: 'bg-indigo-500' },
    { key: 'flexer', label: 'Flexer 🌈', count: patterns.flexer, color: 'bg-purple-500' },
    { key: 'standard', label: 'Standard ⏰', count: patterns.standard, color: 'bg-blue-500' }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">Work Style Analysis</h4>
      <div className="space-y-2">
        {patternData.map((pattern) => {
          const percentage = (pattern.count / total) * 100;
          return (
            <div key={pattern.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${pattern.color}`} />
                <span className="text-sm text-gray-700">{pattern.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{pattern.count} days</span>
                <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 italic">
        Your flexible work style celebrates productivity over rigid schedules.
      </p>
    </div>
  );
};

/**
 * Main Monthly Summary Component
 */
export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary, userName }) => {
  const completionPercentage = Math.min((summary.totalHours / summary.targetHours) * 100, 100);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate insights based on data
  const insights = React.useMemo(() => {
    const insights = [];

    if (summary.status === 'exceeded') {
      insights.push({
        type: 'success',
        message: `Excellent work! You've exceeded your target by ${(summary.totalHours - summary.targetHours).toFixed(1)} hours.`
      });
    } else if (summary.status === 'complete') {
      insights.push({
        type: 'success',
        message: 'Great job! You\'ve met your monthly work hour goal.'
      });
    } else if (summary.status === 'approaching') {
      insights.push({
        type: 'warning',
        message: `You're ${Math.round(100 - completionPercentage)}% away from your target. Keep going!`
      });
    } else {
      insights.push({
        type: 'error',
        message: `You need ${(summary.targetHours - summary.totalHours).toFixed(1)} more hours to reach your target.`
      });
    }

    if (summary.averageHours >= 8) {
      insights.push({
        type: 'info',
        message: 'Your daily average is on track for optimal productivity.'
      });
    }

    if (summary.workPatterns.earlyBird > summary.workPatterns.standard) {
      insights.push({
        type: 'info',
        message: 'You tend to be most productive in the early hours.'
      });
    }

    return insights;
  }, [summary, completionPercentage]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{currentMonth} Summary</h2>
          <p className="text-gray-600 mt-1">Welcome back, {userName}!</p>
        </div>
        <StatusBadge status={summary.status} />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium mb-1">Days Worked</div>
          <div className="text-2xl font-bold text-blue-900">{summary.totalDays}</div>
          <div className="text-blue-700 text-xs mt-1">Total active days</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium mb-1">Total Hours</div>
          <div className="text-2xl font-bold text-green-900">{summary.totalHours.toFixed(1)}</div>
          <div className="text-green-700 text-xs mt-1">
            {summary.totalHours >= summary.targetHours ? '✅ Goal achieved' : 'In progress'}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-purple-600 text-sm font-medium mb-1">Target Hours</div>
          <div className="text-2xl font-bold text-purple-900">{summary.targetHours.toFixed(0)}</div>
          <div className="text-purple-700 text-xs mt-1">Monthly goal</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-orange-600 text-sm font-medium mb-1">Daily Average</div>
          <div className="text-2xl font-bold text-orange-900">{summary.averageHours.toFixed(1)}</div>
          <div className="text-orange-700 text-xs mt-1">Hours per day</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Progress</h3>
          <span className="text-sm text-gray-600">
            {summary.totalHours.toFixed(1)} / {summary.targetHours.toFixed(0)} hours
            ({completionPercentage.toFixed(0)}%)
          </span>
        </div>
        <ProgressBar current={summary.totalHours} target={summary.targetHours} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Work Pattern Analysis */}
        <div className="bg-gray-50 rounded-lg p-5">
          <WorkPatternAnalysis patterns={summary.workPatterns} />
        </div>

        {/* Insights */}
        <div className="bg-gray-50 rounded-lg p-5">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Insights</h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 p-3 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-100' :
                  insight.type === 'warning' ? 'bg-yellow-100' :
                  insight.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}
              >
                <span className="text-sm">
                  {insight.type === 'success' ? '✅' :
                   insight.type === 'warning' ? '⚠️' :
                   insight.type === 'error' ? '❌' : '💡'}
                </span>
                <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
              </div>
            ))}
          </div>

          {/* Positive Reinforcement */}
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Flexible Work Culture:</strong> We value results over rigid schedules.
              Your work patterns show great adaptability and commitment to excellence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};