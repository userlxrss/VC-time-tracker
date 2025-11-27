'use client';

import React from 'react';
import { TimeTrackingWidget } from '@/components/time-tracking/TimeTrackingWidget';
import { TimeTrackingDashboard } from '@/components/time-tracking/TimeTrackingDashboard';
import { TimeTrackingWithAuth, useTimeTrackingWithAuth } from '@/hooks/useTimeTrackingWithAuth';

const TimeTrackingPage: React.FC = () => {
  const { user, isTimeTrackingEnabled, isBoss } = useTimeTrackingWithAuth();

  if (!isTimeTrackingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Time Tracking</h1>
          <p className="text-gray-600">Please log in to access time tracking features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Time Tracking
          </h1>
          <p className="mt-2 text-gray-600">
            Track your work hours, breaks, and generate reports.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Time Tracking Widget - Takes up 1 column on large screens */}
          <div className="lg:col-span-1">
            <TimeTrackingWidget />
          </div>

          {/* Dashboard - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <TimeTrackingDashboard
              user={user}
              viewAllUsers={isBoss}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Start Guide
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Click "Clock In" when you start working</li>
              <li>2. Take breaks using the lunch/short break buttons</li>
              <li>3. Click "Clock Out" when you finish working</li>
              <li>4. View your reports in the dashboard</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Break Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Lunch breaks: Typically 30-60 minutes</li>
              <li>• Short breaks: 5-15 minutes</li>
              <li>• Multiple short breaks allowed per day</li>
              <li>• Break time is automatically deducted from total hours</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Real-time session timer</li>
              <li>• Automatic hours calculation</li>
              <li>• Weekly and monthly reports</li>
              <li>• Data saved locally in your browser</li>
              {isBoss && <li>• View team time tracking</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the page with TimeTrackingWithAuth provider
export default function TimeTrackingPageWrapper() {
  return (
    <TimeTrackingWithAuth>
      <TimeTrackingPage />
    </TimeTrackingWithAuth>
  );
}