'use client';

import React from 'react';
import { TimeTrackingWidget } from '@/components/time-tracking/TimeTrackingWidget';
import { TimeTrackingWithAuth } from '@/hooks/useTimeTrackingWithAuth';

/**
 * Example: How to integrate time tracking into the existing dashboard
 *
 * This file shows different ways to add time tracking to your existing dashboard layout.
 */

// Option 1: Add as a sidebar widget
export const DashboardWithTimeTrackingSidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <TimeTrackingWithAuth>
      <div className="flex h-screen">
        {/* Existing sidebar */}
        <div className="w-64 bg-gray-100 p-4">
          {/* Your existing sidebar content */}
          <nav>
            {/* Navigation items */}
          </nav>

          {/* Add time tracking widget to sidebar */}
          <div className="mt-8">
            <TimeTrackingWidget className="shadow-sm" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </TimeTrackingWithAuth>
  );
};

// Option 2: Add as a dedicated page/route
export const TimeTrackingPage = () => {
  return (
    <TimeTrackingWithAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget on the left */}
          <div className="lg:col-span-1">
            <TimeTrackingWidget />
          </div>

          {/* Full dashboard on the right */}
          <div className="lg:col-span-2">
            {/* Add your TimeTrackingDashboard here */}
            <h2 className="text-2xl font-bold mb-6">Time Reports</h2>
            {/* Report content */}
          </div>
        </div>
      </div>
    </TimeTrackingWithAuth>
  );
};

// Option 3: Add as a modal or dropdown
export const HeaderWithQuickTimeTracking = () => {
  const [showTimeTracking, setShowTimeTracking] = React.useState(false);

  return (
    <TimeTrackingWithAuth>
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex justify-between items-center">
          {/* Your existing header content */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">VC Dashboard</h1>
          </div>

          {/* Quick time tracking access */}
          <div className="relative">
            <button
              onClick={() => setShowTimeTracking(!showTimeTracking)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quick Time Track
            </button>

            {showTimeTracking && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <TimeTrackingWidget className="border-0 shadow-none" />
              </div>
            )}
          </div>
        </div>
      </header>
    </TimeTrackingWithAuth>
  );
};

// Option 4: Minimal integration - just add to existing dashboard
export const EnhancedDashboard = () => {
  return (
    <TimeTrackingWithAuth>
      <div className="p-6">
        {/* Your existing dashboard layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Existing metric cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Projects</h3>
            <p className="text-3xl font-bold">12</p>
          </div>

          {/* Add time tracking as another metric card */}
          <div className="col-span-2">
            <TimeTrackingWidget className="h-full" />
          </div>

          {/* Other existing cards */}
        </div>

        {/* Rest of your dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your existing dashboard sections */}
        </div>
      </div>
    </TimeTrackingWithAuth>
  );
};

// Option 5: Integration with role-based access
export const RoleBasedDashboard = () => {
  const { user, isBoss } = useTimeTrackingWithAuth();

  return (
    <TimeTrackingWithAuth>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {isBoss ? 'Team Dashboard' : 'My Dashboard'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time tracking widget for all users */}
          <div className="lg:col-span-1">
            <TimeTrackingWidget />
          </div>

          {/* Different dashboard content based on role */}
          <div className="lg:col-span-2">
            {isBoss ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Team Time Overview</h2>
                {/* Boss sees team time tracking */}
                <TimeTrackingDashboard user={user} viewAllUsers={true} />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Time Reports</h2>
                {/* Employee sees only their own time tracking */}
                <TimeTrackingDashboard user={user} viewAllUsers={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </TimeTrackingWithAuth>
  );
};

// Option 6: Mobile-optimized integration
export const MobileDashboard = () => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'time'>('overview');

  return (
    <TimeTrackingWithAuth>
      <div className="flex flex-col h-screen">
        {/* Mobile navigation */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Time Track
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'overview' ? (
            <div>
              {/* Your existing dashboard content */}
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              {/* Dashboard widgets */}
            </div>
          ) : (
            <div>
              <TimeTrackingWidget className="mb-6" />
              <TimeTrackingDashboard user={undefined} viewAllUsers={false} />
            </div>
          )}
        </div>
      </div>
    </TimeTrackingWithAuth>
  );
};

// Example of updating existing navigation to include time tracking
export const NavigationWithTimeTracking = () => {
  const { user, isTimeTrackingEnabled } = useTimeTrackingWithAuth();

  return (
    <TimeTrackingWithAuth>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {/* Existing navigation items */}
            <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
            <a href="/projects" className="hover:text-gray-300">Projects</a>

            {/* Add time tracking link */}
            {isTimeTrackingEnabled && (
              <a href="/time-tracking" className="hover:text-gray-300">Time Tracking</a>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <span>{user?.name}</span>
            {/* Quick time status */}
            <div className="w-3 h-3 bg-green-500 rounded-full" title="Clocked In" />
          </div>
        </div>
      </nav>
    </TimeTrackingWithAuth>
  );
};