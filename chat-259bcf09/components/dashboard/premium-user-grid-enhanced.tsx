/**
 * Enhanced Premium User Grid Container
 * Integrates with the PremiumTimeEntryService for real-time updates and localStorage persistence
 * Enhanced with ToastManager for better user feedback
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumUserCard } from './premium-user-card';
import { UserProfile, HARDCODED_USERS, DEFAULT_CURRENT_USER_ID, UserRole } from '@/src/types/user';
import { TimeEntry, TimeEntryStatus, getCurrentDateString } from '@/src/types/timeEntry';
import { PremiumTimeEntryService } from '@/src/services/premiumTimeEntryService';
import { ToastManager } from '@/components/notifications/toast-manager';
import { TimeCalculator } from '@/src/utils/timeCalculations';

// Props interface
interface PremiumUserGridEnhancedProps {
  currentUser?: UserProfile;
  className?: string;
  enableRealTime?: boolean;
  showOnlyActive?: boolean;
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

export const PremiumUserGridEnhanced: React.FC<PremiumUserGridEnhancedProps> = ({
  currentUser = HARDCODED_USERS.find(u => u.id === DEFAULT_CURRENT_USER_ID),
  className = '',
  enableRealTime = true,
  showOnlyActive = false
}) => {
  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Get current user or default to Larina
  const currentUserId = currentUser?.id || DEFAULT_CURRENT_USER_ID;
  const currentUserProfile = HARDCODED_USERS.find(u => u.id === currentUserId) || HARDCODED_USERS[2];

  // Load time entries from service
  const loadTimeEntries = useCallback(() => {
    try {
      const entries = PremiumTimeEntryService.getAllTimeEntries();
      setTimeEntries(entries);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load time entries:', error);
      ToastManager.generalError('Failed to load time entries', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize and set up real-time updates
  useEffect(() => {
    loadTimeEntries();

    // Subscribe to changes
    const unsubscribe = PremiumTimeEntryService.subscribe(() => {
      loadTimeEntries();
    });

    // Set up real-time updates
    let interval: NodeJS.Timeout;
    if (enableRealTime) {
      interval = setInterval(() => {
        PremiumTimeEntryService.updateLiveEntries();
      }, 5000); // Update every 5 seconds
    }

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [loadTimeEntries, enableRealTime]);

  // Sort users: current user first, then bosses, then others
  const sortedUsers = useMemo(() => {
    let filtered = [...HARDCODED_USERS];

    // Filter by active status if requested
    if (showOnlyActive) {
      const activeUsers = PremiumTimeEntryService.getActiveUsers(filtered.map(u => u.id));
      filtered = filtered.filter(u => activeUsers.includes(u.id));
    }

    return filtered.sort((a, b) => {
      // Current user first
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;

      // Then bosses
      if (a.role === UserRole.BOSS && b.role !== UserRole.BOSS) return -1;
      if (b.role === UserRole.BOSS && a.role !== UserRole.BOSS) return 1;

      // Then by name
      return a.fullName.localeCompare(b.fullName);
    });
  }, [currentUserId, showOnlyActive]);

  // Get or create time entry for user
  const getTimeEntryForUser = useCallback((user: UserProfile): TimeEntry => {
    const today = getCurrentDateString();
    let entry = timeEntries[`time-${user.id}-${today}`];

    if (!entry) {
      // Create a default entry for today
      entry = {
        id: `time-${user.id}-${today}`,
        userId: user.id,
        date: today,
        lunchBreak: {},
        shortBreaks: [],
        status: TimeEntryStatus.NOT_STARTED,
        lastModified: new Date().toISOString(),
        modifiedBy: user.id
      };
    }

    return entry;
  }, [timeEntries]);

  // Enhanced action handlers with better toast notifications
  const handleClockIn = async (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    const userName = user?.fullName || 'User';
    const isCurrentUser = userId === currentUserId;

    try {
      // Check if already clocked in
      const todayEntry = getTimeEntryForUser(user!);
      if (todayEntry.status === TimeEntryStatus.CLOCKED_IN) {
        ToastManager.validationWarning(`${userName} is already clocked in!`);
        return;
      }

      await PremiumTimeEntryService.clockIn(userId);

      if (isCurrentUser) {
        ToastManager.clockInSuccess();
      } else {
        ToastManager.clockInSuccess(userName);
      }
    } catch (error) {
      console.error('Clock in error:', error);
      ToastManager.clockInError((error as Error).message);
    }
  };

  const handleClockOut = async (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    const userName = user?.fullName || 'User';
    const isCurrentUser = userId === currentUserId;

    try {
      // Check if can clock out
      const todayEntry = getTimeEntryForUser(user!);
      if (todayEntry.status === TimeEntryStatus.CLOCKED_OUT || todayEntry.status === TimeEntryStatus.NOT_STARTED) {
        ToastManager.validationWarning(`${userName} needs to clock in first!`);
        return;
      }

      const clockInTime = todayEntry.clockIn;
      await PremiumTimeEntryService.clockOut(userId);

      if (isCurrentUser) {
        ToastManager.clockOutSuccess('You', clockInTime!);
      } else {
        ToastManager.clockOutSuccess(userName, clockInTime!);
      }
    } catch (error) {
      console.error('Clock out error:', error);
      ToastManager.clockOutError((error as Error).message);
    }
  };

  const handleStartLunch = async (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    const userName = user?.fullName || 'User';
    const isCurrentUser = userId === currentUserId;

    try {
      // Check if can start lunch
      const todayEntry = getTimeEntryForUser(user!);
      if (todayEntry.status !== TimeEntryStatus.CLOCKED_IN) {
        ToastManager.validationWarning(`${userName} needs to be clocked in to start lunch!`);
        return;
      }
      if (todayEntry.lunchBreak.start) {
        ToastManager.validationWarning(`${userName} is already on lunch!`);
        return;
      }

      await PremiumTimeEntryService.startLunch(userId);

      if (isCurrentUser) {
        ToastManager.lunchStartSuccess();
      } else {
        ToastManager.lunchStartSuccess(userName);
      }
    } catch (error) {
      console.error('Start lunch error:', error);
      ToastManager.lunchError((error as Error).message);
    }
  };

  const handleEndLunch = async (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    const userName = user?.fullName || 'User';
    const isCurrentUser = userId === currentUserId;

    try {
      // Check if can end lunch
      const todayEntry = getTimeEntryForUser(user!);
      if (!todayEntry.lunchBreak.start) {
        ToastManager.validationWarning(`${userName} is not on lunch!`);
        return;
      }
      if (todayEntry.lunchBreak.end) {
        ToastManager.validationWarning(`${userName} already finished lunch!`);
        return;
      }

      const lunchStartTime = todayEntry.lunchBreak.start;
      await PremiumTimeEntryService.endLunch(userId);

      if (isCurrentUser) {
        ToastManager.lunchEndSuccess('You', lunchStartTime);
      } else {
        ToastManager.lunchEndSuccess(userName, lunchStartTime);
      }
    } catch (error) {
      console.error('End lunch error:', error);
      ToastManager.lunchError((error as Error).message);
    }
  };

  const handleStartBreak = async (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    const userName = user?.fullName || 'User';
    const isCurrentUser = userId === currentUserId;

    try {
      // Check if can start break
      const todayEntry = getTimeEntryForUser(user!);
      if (todayEntry.status !== TimeEntryStatus.CLOCKED_IN) {
        ToastManager.validationWarning(`${userName} needs to be clocked in to start a break!`);
        return;
      }

      // Check if already on break
      const activeBreak = todayEntry.shortBreaks.find(b => !b.end);
      if (activeBreak) {
        ToastManager.validationWarning(`${userName} is already on a break!`);
        return;
      }

      await PremiumTimeEntryService.startBreak(userId);

      if (isCurrentUser) {
        ToastManager.breakStartSuccess();
      } else {
        ToastManager.breakStartSuccess(userName);
      }
    } catch (error) {
      console.error('Start break error:', error);
      ToastManager.breakError((error as Error).message);
    }
  };

  const handleEndBreak = async (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    const userName = user?.fullName || 'User';
    const isCurrentUser = userId === currentUserId;

    try {
      // Check if can end break
      const todayEntry = getTimeEntryForUser(user!);
      const activeBreak = todayEntry.shortBreaks.find(b => !b.end);

      if (!activeBreak) {
        ToastManager.validationWarning(`${userName} is not on a break!`);
        return;
      }

      const breakStartTime = activeBreak.start;
      await PremiumTimeEntryService.endBreak(userId);

      if (isCurrentUser) {
        ToastManager.breakEndSuccess('You', breakStartTime);
      } else {
        ToastManager.breakEndSuccess(userName, breakStartTime);
      }
    } catch (error) {
      console.error('End break error:', error);
      ToastManager.breakError((error as Error).message);
    }
  };

  const handleViewDetails = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    ToastManager.info(`Viewing details for ${user?.fullName}`);
    // In a real app, this would navigate to a details page or open a modal
  };

  // Calculate enhanced statistics
  const statistics = useMemo(() => {
    const today = getCurrentDateString();
    const activeUsers = sortedUsers.filter(user => {
      const entry = getTimeEntryForUser(user);
      return [
        TimeEntryStatus.CLOCKED_IN,
        TimeEntryStatus.ON_LUNCH,
        TimeEntryStatus.ON_BREAK
      ].includes(entry.status);
    });

    const totalUsers = sortedUsers.length;
    const activeCount = activeUsers.length;

    // Calculate total hours worked today
    let totalHoursToday = 0;
    sortedUsers.forEach(user => {
      const entry = getTimeEntryForUser(user);
      if (entry.clockIn) {
        totalHoursToday += TimeCalculator.calculateWorkHours(entry);
      }
    });

    // Calculate users on breaks
    const usersOnBreak = sortedUsers.filter(user => {
      const entry = getTimeEntryForUser(user);
      return entry.status === TimeEntryStatus.ON_LUNCH || entry.status === TimeEntryStatus.ON_BREAK;
    });

    return {
      totalUsers,
      activeCount,
      inactiveCount: totalUsers - activeCount,
      activeUsers,
      totalHoursToday,
      usersOnBreak: usersOnBreak.length,
      onLunch: sortedUsers.filter(u => getTimeEntryForUser(u).status === TimeEntryStatus.ON_LUNCH).length,
      onBreak: sortedUsers.filter(u => getTimeEntryForUser(u).status === TimeEntryStatus.ON_BREAK).length
    };
  }, [sortedUsers, getTimeEntryForUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading time entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Enhanced statistics header */}
      <div className="mb-6 p-6 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm rounded-xl border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Team Status Overview
            </h3>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()} • Real-time tracking enabled
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{statistics.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.activeCount}</div>
              <div className="text-xs text-muted-foreground">Active Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.usersOnBreak}</div>
              <div className="text-xs text-muted-foreground">On Break</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalHoursToday.toFixed(1)}h</div>
              <div className="text-xs text-muted-foreground">Hours Today</div>
            </div>
          </div>
        </div>

        {/* Progress bar showing active vs inactive */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Team Activity</span>
            <span>{Math.round((statistics.activeCount / statistics.totalUsers) * 100)}% active</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${(statistics.activeCount / statistics.totalUsers) * 100}%` }}
              />
              <div
                className="bg-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${(statistics.usersOnBreak / statistics.totalUsers) * 100}%` }}
              />
              <div
                className="bg-gray-400 transition-all duration-500 ease-out"
                style={{ width: `${(statistics.inactiveCount / statistics.totalUsers) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-600">Working</span>
            <span className="text-orange-600">Break</span>
            <span className="text-gray-600">Inactive</span>
          </div>
        </div>
      </div>

      {/* User grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`
          grid gap-8 mt-10
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
        `}
      >
        <AnimatePresence>
          {sortedUsers.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const userTimeEntry = getTimeEntryForUser(user);

            return (
              <motion.div
                key={user.id}
                variants={itemVariants}
                layout
                className="min-h-[360px]"
              >
                <PremiumUserCard
                  user={user}
                  timeEntry={userTimeEntry}
                  isCurrentUser={isCurrentUser}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  onStartLunch={handleStartLunch}
                  onEndLunch={handleEndLunch}
                  onStartBreak={handleStartBreak}
                  onEndBreak={handleEndBreak}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced empty state */}
      {sortedUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">
            {showOnlyActive ? 'No active users at the moment.' : 'No users to display.'}
          </p>
          {showOnlyActive && (
            <Button
              variant="outline"
              onClick={() => setShowOnlyActive(false)}
            >
              Show All Users
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PremiumUserGridEnhanced;