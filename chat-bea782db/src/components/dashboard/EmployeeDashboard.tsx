/**
 * Employee Dashboard Component
 *
 * Comprehensive employee dashboard with real-time status tracking, progress monitoring,
 * and flexible work culture focus. Features live updates, motivational elements,
 * and professional enterprise quality UI.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { UserRole, BreakPeriod, TimeEntry } from '../../database-schema';
import { manilaTime } from '../../lib/utils/manilaTime';
import { format } from 'date-fns';

// Component imports
import { RealTimeStatusCard } from './cards/RealTimeStatusCard';
import { TodayProgressCard } from './cards/TodayProgressCard';
import { ActivityTimelineCard } from './cards/ActivityTimelineCard';
import { WeeklySummaryCard } from './cards/WeeklySummaryCard';
import { QuickActionsCard } from './cards/QuickActionsCard';
import { FlexibleWorkBanner } from './banners/FlexibleWorkBanner';
import { ToastNotification } from '../ui/ToastNotification';

// Types for dashboard state
interface DashboardState {
  currentTime: Date;
  workPattern: 'early-bird' | 'night-owl' | 'flexer' | 'newcomer';
  motivationalMessage: string;
  toast: {
    show: boolean;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
  } | null;
}

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const timeTracking = useTimeTracking(user?.id);

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    currentTime: new Date(),
    workPattern: 'newcomer',
    motivationalMessage: '',
    toast: null
  });

  // Update current time every second for real-time feel
  useEffect(() => {
    const timer = setInterval(() => {
      setDashboardState(prev => ({
        ...prev,
        currentTime: manilaTime.now()
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Determine work pattern based on clock-in history
  useEffect(() => {
    if (timeTracking.todayProgress) {
      const determineWorkPattern = () => {
        const clockIn = timeTracking.activeEntry?.clockIn;
        if (!clockIn) return 'newcomer';

        const hour = manilaTime.format(clockIn, 'HH');
        const hourNum = parseInt(hour);

        if (hourNum >= 5 && hourNum < 9) return 'early-bird';
        if (hourNum >= 20 || hourNum < 5) return 'night-owl';
        return 'flexer';
      };

      setDashboardState(prev => ({
        ...prev,
        workPattern: determineWorkPattern()
      }));
    }
  }, [timeTracking.activeEntry, timeTracking.todayProgress]);

  // Generate motivational messages based on progress and time
  useEffect(() => {
    const generateMotivationalMessage = () => {
      const hours = timeTracking.todayProgress?.totalHours || 0;
      const isClockedIn = timeTracking.isClockedIn;
      const isOnBreak = timeTracking.isOnBreak;
      const hour = manilaTime.format(dashboardState.currentTime, 'HH');
      const hourNum = parseInt(hour);

      if (!isClockedIn && !timeTracking.activeEntry) {
        return 'Ready to start your day? Clock in when you\'re ready to begin!';
      }

      if (isOnBreak) {
        return 'Enjoy your break! Taking time to recharge helps you stay productive.';
      }

      if (hours >= 8) {
        return '🎉 Congratulations! You\'ve completed your daily goal. Amazing work!';
      }

      if (hours >= 6) {
        return 'Almost there! You\'re doing fantastic. Just a little more to reach your goal.';
      }

      if (hours >= 4) {
        return 'Great progress! You\'re halfway through your daily goal. Keep it up!';
      }

      if (hours >= 2) {
        return 'Good momentum! You\'re building a productive rhythm.';
      }

      return 'Welcome! Let\'s make today productive and successful.';
    };

    setDashboardState(prev => ({
      ...prev,
      motivationalMessage: generateMotivationalMessage()
    }));
  }, [timeTracking.todayProgress, timeTracking.isClockedIn, timeTracking.isOnBreak, dashboardState.currentTime]);

  // Handle toast notifications
  const showToast = useCallback((type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    setDashboardState(prev => ({
      ...prev,
      toast: { show: true, type, title, message }
    }));

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setDashboardState(prev => ({
        ...prev,
        toast: null
      }));
    }, 5000);
  }, []);

  // Handle time tracking actions with success feedback
  const handleClockIn = useCallback(async () => {
    try {
      await timeTracking.clockIn();
      showToast('success', '✅ Clocked In Successfully',
        `Welcome back, ${user?.firstName}! Have a productive day.`);
    } catch (error) {
      showToast('error', '❌ Clock In Failed',
        error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [timeTracking, user?.firstName, showToast]);

  const handleClockOut = useCallback(async () => {
    try {
      await timeTracking.clockOut();
      const hours = timeTracking.todayProgress?.totalHours?.toFixed(2) || '0.00';
      showToast('success', '✅ Clocked Out Successfully',
        `Great work today! You completed ${hours} hours.`);
    } catch (error) {
      showToast('error', '❌ Clock Out Failed',
        error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [timeTracking, showToast]);

  const handleStartBreak = useCallback(async (breakType: BreakPeriod['type']) => {
    try {
      await timeTracking.startBreak(breakType);
      showToast('info', '☕ Break Started', 'Enjoy your break time!');
    } catch (error) {
      showToast('error', '❌ Break Start Failed',
        error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [timeTracking, showToast]);

  const handleEndBreak = useCallback(async () => {
    try {
      await timeTracking.endBreak();
      showToast('success', '🏁 Break Ended', 'Welcome back! Ready to continue?');
    } catch (error) {
      showToast('error', '❌ End Break Failed',
        error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [timeTracking, showToast]);

  // Calculate weekly progress for display
  const weeklyProgress = timeTracking.todayProgress ? {
    targetHours: 40, // 5 days * 8 hours
    completedHours: timeTracking.todayProgress.totalHours * 5, // Rough estimate
    workDays: 5,
    completedDays: Math.min(5, Math.floor((timeTracking.todayProgress.totalHours / 8) + 1)),
    averageHours: timeTracking.todayProgress.totalHours,
    streak: 3 // Placeholder - would come from analytics
  } : null;

  if (!user || user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">This dashboard is available for employees only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {dashboardState.toast && (
        <ToastNotification
          type={dashboardState.toast.type}
          title={dashboardState.toast.title}
          message={dashboardState.toast.message}
          onClose={() => setDashboardState(prev => ({ ...prev, toast: null }))}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {manilaTime.format(dashboardState.currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Status</p>
              <p className="text-lg font-semibold text-blue-600">
                {dashboardState.workPattern.charAt(0).toUpperCase() + dashboardState.workPattern.slice(1).replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Flexible Work Philosophy Banner */}
        <FlexibleWorkBanner
          message={dashboardState.motivationalMessage}
          workPattern={dashboardState.workPattern}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Status and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Status Card */}
            <RealTimeStatusCard
              isClockedIn={timeTracking.isClockedIn}
              isOnBreak={timeTracking.isOnBreak}
              currentBreakType={timeTracking.currentBreakType}
              activeEntry={timeTracking.activeEntry}
              projectedFinishTime={timeTracking.projectedFinishTime}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onStartBreak={handleStartBreak}
              onEndBreak={handleEndBreak}
              currentTime={dashboardState.currentTime}
            />

            {/* Today's Progress Card */}
            <TodayProgressCard
              todayProgress={timeTracking.todayProgress}
              workPattern={dashboardState.workPattern}
            />

            {/* Activity Timeline Card */}
            <ActivityTimelineCard
              activeEntry={timeTracking.activeEntry}
              todayProgress={timeTracking.todayProgress}
              currentTime={dashboardState.currentTime}
            />
          </div>

          {/* Right Column - Summary and Actions */}
          <div className="space-y-6">
            {/* Weekly Summary Card */}
            <WeeklySummaryCard
              weeklyProgress={weeklyProgress}
              workPattern={dashboardState.workPattern}
            />

            {/* Quick Actions Card */}
            <QuickActionsCard
              isClockedIn={timeTracking.isClockedIn}
              isOnBreak={timeTracking.isOnBreak}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onStartBreak={handleStartBreak}
              onEndBreak={handleEndBreak}
              isLoading={timeTracking.isLoading}
            />
          </div>
        </div>

        {/* Additional Insights Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Work Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Work Pattern Insights */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <span className="text-xl">🦉</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Work Pattern</h3>
              <p className="text-sm text-gray-600">
                {dashboardState.workPattern === 'early-bird' && 'You shine brightest in the morning!'}
                {dashboardState.workPattern === 'night-owl' && 'You find focus during quiet hours!'}
                {dashboardState.workPattern === 'flexer' && 'You adapt beautifully to any schedule!'}
                {dashboardState.workPattern === 'newcomer' && 'Your pattern is emerging as you work!'}
              </p>
            </div>

            {/* Productivity Insights */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Productivity Style</h3>
              <p className="text-sm text-gray-600">
                {timeTracking.todayProgress?.totalHours >= 6
                  ? 'Consistent and steady - excellent pace!'
                  : 'Building your daily routine. You\'ve got this!'}
              </p>
            </div>

            {/* Flexibility Score */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <span className="text-xl">🌟</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Flexibility Champion</h3>
              <p className="text-sm text-gray-600">
                Embracing flexible work culture and delivering results on your terms!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;