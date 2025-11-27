/**
 * Empty State Component
 *
 * Helpful empty state when no timesheet data exists with quick action buttons,
 * educational content about flexible work, and tips for consistent time tracking.
 */

import React from 'react';

interface EmptyStateProps {
  onQuickFilter: (preset: 'this_week' | 'last_7_days' | 'this_month') => void;
}

/**
 * Quick action button component
 */
const QuickActionButton: React.FC<{
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}> = ({ icon, label, description, onClick, primary = false }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        primary
          ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
};

/**
 * Tip card component
 */
const TipCard: React.FC<{
  icon: string;
  title: string;
  tips: string[];
}> = ({ icon, title, tips }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-2">{title}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Empty State Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ onQuickFilter }) => {
  const quickActions = [
    {
      icon: '⏰',
      label: 'Clock In Now',
      description: 'Start tracking your work hours',
      onClick: () => {
        // Navigate to dashboard or show clock in modal
        window.location.href = '/dashboard';
      },
      primary: true
    },
    {
      icon: '📅',
      label: 'This Week',
      description: 'View current week entries',
      onClick: () => onQuickFilter('this_week')
    },
    {
      icon: '🗓️',
      label: 'This Month',
      description: 'Browse monthly summary',
      onClick: () => onQuickFilter('this_month')
    },
    {
      icon: '📊',
      label: 'Analytics',
      description: 'View productivity insights',
      onClick: () => {
        // Navigate to analytics or show overview
        window.location.href = '/dashboard';
      }
    }
  ];

  const tips = {
    flexibleWork: {
      icon: '🌈',
      title: 'Flexible Work Culture',
      tips: [
        'Focus on results, not rigid schedules',
        'Track total hours, not specific time blocks',
        'Take breaks when you need them for optimal productivity',
        'Your work patterns are unique and valuable'
      ]
    },
    timeTracking: {
      icon: '✅',
      title: 'Time Tracking Best Practices',
      tips: [
        'Clock in when you start working, not when you arrive',
        'Include all work activities in your time tracking',
        'Take regular breaks to maintain focus and energy',
        'Add notes to remember important tasks or achievements'
      ]
    },
    productivity: {
      icon: '🚀',
      title: 'Productivity Tips',
      tips: [
        'Track your most productive hours and schedule accordingly',
        'Use break times effectively - short breaks boost focus',
        'Consistent tracking leads to better work-life balance',
        'Review your patterns weekly to optimize your schedule'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⏱️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Timesheet
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start tracking your work hours to build insights into your productivity patterns
            and maintain a healthy work-life balance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                description={action.description}
                onClick={action.onClick}
                primary={action.primary}
              />
            ))}
          </div>
        </div>

        {/* Educational Content */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Embrace Flexible Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(tips).map((tipSet, index) => (
              <TipCard
                key={index}
                icon={tipSet.icon}
                title={tipSet.title}
                tips={tipSet.tips}
              />
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Timesheet Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">
                Track your work patterns, productivity insights, and hourly breakdowns
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌈</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Work Pattern Recognition</h3>
              <p className="text-sm text-gray-600">
                Discover if you're an Early Bird, Night Owl, or Flexer
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📤</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Exports</h3>
              <p className="text-sm text-gray-600">
                Export to CSV, Excel, or PDF for reporting and sharing
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">☕</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Break Tracking</h3>
              <p className="text-sm text-gray-600">
                Automatic break detection and productivity analysis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Sync</h3>
              <p className="text-sm text-gray-600">
                Cross-tab synchronization and live updates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Goal Tracking</h3>
              <p className="text-sm text-gray-600">
                Set and achieve daily and monthly work hour goals
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Begin tracking your work hours today to build valuable insights into your productivity
              patterns and achieve a better work-life balance.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>⏰</span>
              <span>Start Tracking Time</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};