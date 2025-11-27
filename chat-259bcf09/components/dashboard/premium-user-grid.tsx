/**
 * Premium User Grid Container
 * Manages the responsive grid layout and state for multiple user cards
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumUserCard } from './premium-user-card';
import { UserProfile, HARDCODED_USERS, DEFAULT_CURRENT_USER_ID, UserRole } from '@/src/types/user';
import { TimeEntry, TimeEntryStatus, getCurrentTimeString, getCurrentDateString, createEmptyTimeEntry } from '@/src/types/timeEntry';
import { TimeCalculator } from '@/src/utils/timeCalculations';
import { toast } from 'sonner';

// Props interface
interface PremiumUserGridProps {
  currentUser?: UserProfile;
  className?: string;
}

// Mock time entries data (in real app, this would come from a service)
const mockTimeEntries: Record<string, TimeEntry> = {
  'user-001': {
    id: 'time-user-001-2025-01-11',
    userId: 'user-001',
    date: getCurrentDateString(),
    clockIn: '09:00',
    clockOut: '17:00',
    lunchBreak: {
      start: '12:30',
      end: '13:00',
      duration: 30
    },
    shortBreaks: [
      { id: 'break-1', start: '10:30', end: '10:45', duration: 15, type: 'coffee_break' },
      { id: 'break-2', start: '15:00', end: '15:15', duration: 15, type: 'short_break' }
    ],
    status: TimeEntryStatus.CLOCKED_OUT,
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-001'
  },
  'user-002': {
    id: 'time-user-002-2025-01-11',
    userId: 'user-002',
    date: getCurrentDateString(),
    clockIn: '08:45',
    lunchBreak: {
      start: '12:15',
      end: '13:15',
      duration: 60
    },
    shortBreaks: [],
    status: TimeEntryStatus.ON_LUNCH,
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-002'
  },
  'user-003': {
    id: 'time-user-003-2025-01-11',
    userId: 'user-003',
    date: getCurrentDateString(),
    clockIn: '09:15',
    lunchBreak: {},
    shortBreaks: [],
    status: TimeEntryStatus.CLOCKED_IN,
    lastModified: new Date().toISOString(),
    modifiedBy: 'user-003'
  }
};

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

export const PremiumUserGrid: React.FC<PremiumUserGridProps> = ({
  currentUser = HARDCODED_USERS.find(u => u.id === DEFAULT_CURRENT_USER_ID),
  className = ''
}) => {
  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry>>(mockTimeEntries);
  const [isLoading, setIsLoading] = useState(false);

  // Get current user or default to Larina
  const currentUserId = currentUser?.id || DEFAULT_CURRENT_USER_ID;
  const currentUserProfile = HARDCODED_USERS.find(u => u.id === currentUserId) || HARDCODED_USERS[2];

  // Sort users: current user first, then bosses, then others
  const sortedUsers = useMemo(() => {
    return [...HARDCODED_USERS].sort((a, b) => {
      // Current user first
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;

      // Then bosses
      if (a.role === UserRole.BOSS && b.role !== UserRole.BOSS) return -1;
      if (b.role === UserRole.BOSS && a.role !== UserRole.BOSS) return 1;

      // Then by name
      return a.fullName.localeCompare(b.fullName);
    });
  }, [currentUserId]);

  // Update real-time status for clocked-in users
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeEntries(prev => {
        const updated = { ...prev };

        Object.keys(updated).forEach(userId => {
          const entry = updated[userId];

          // Update live status for clocked-in users
          if (entry.status === TimeEntryStatus.CLOCKED_IN ||
              entry.status === TimeEntryStatus.ON_LUNCH ||
              entry.status === TimeEntryStatus.ON_BREAK) {
            updated[userId] = {
              ...entry,
              lastModified: new Date().toISOString()
            };
          }
        });

        return updated;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Clock in handler
  const handleClockIn = async (userId: string) => {
    setIsLoading(true);
    try {
      const currentTime = getCurrentTimeString();
      const today = getCurrentDateString();

      setTimeEntries(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          id: `time-${userId}-${today}`,
          userId,
          date: today,
          clockIn: currentTime,
          clockOut: undefined,
          lunchBreak: {},
          shortBreaks: [],
          status: TimeEntryStatus.CLOCKED_IN,
          lastModified: new Date().toISOString(),
          modifiedBy: userId
        }
      }));

      const user = HARDCODED_USERS.find(u => u.id === userId);
      toast.success(`${user?.fullName} clocked in at ${currentTime}`);
    } catch (error) {
      toast.error('Failed to clock in');
      console.error('Clock in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clock out handler
  const handleClockOut = async (userId: string) => {
    setIsLoading(true);
    try {
      const currentTime = getCurrentTimeString();

      setTimeEntries(prev => {
        const entry = prev[userId];
        if (!entry) return prev;

        const updatedEntry = {
          ...entry,
          clockOut: currentTime,
          status: TimeEntryStatus.CLOCKED_OUT,
          lastModified: new Date().toISOString(),
          modifiedBy: userId
        };

        // Calculate total hours
        const summary = TimeCalculator.getTimeSummary(updatedEntry);
        updatedEntry.totalHours = summary.totalHours;

        return {
          ...prev,
          [userId]: updatedEntry
        };
      });

      const user = HARDCODED_USERS.find(u => u.id === userId);
      toast.success(`${user?.fullName} clocked out at ${currentTime}`);
    } catch (error) {
      toast.error('Failed to clock out');
      console.error('Clock out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start lunch handler
  const handleStartLunch = async (userId: string) => {
    setIsLoading(true);
    try {
      const currentTime = getCurrentTimeString();

      setTimeEntries(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          lunchBreak: {
            start: currentTime
          },
          status: TimeEntryStatus.ON_LUNCH,
          lastModified: new Date().toISOString(),
          modifiedBy: userId
        }
      }));

      const user = HARDCODED_USERS.find(u => u.id === userId);
      toast.success(`${user?.fullName} started lunch at ${currentTime}`);
    } catch (error) {
      toast.error('Failed to start lunch');
      console.error('Start lunch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // End lunch handler
  const handleEndLunch = async (userId: string) => {
    setIsLoading(true);
    try {
      const currentTime = getCurrentTimeString();

      setTimeEntries(prev => {
        const entry = prev[userId];
        if (!entry.lunchBreak?.start) return prev;

        const startTime = entry.lunchBreak.start;
        const duration = TimeCalculator.getTimeDifference(startTime, currentTime);

        return {
          ...prev,
          [userId]: {
            ...entry,
            lunchBreak: {
              start: startTime,
              end: currentTime,
              duration
            },
            status: TimeEntryStatus.CLOCKED_IN,
            lastModified: new Date().toISOString(),
            modifiedBy: userId
          }
        };
      });

      const user = HARDCODED_USERS.find(u => u.id === userId);
      toast.success(`${user?.fullName} ended lunch at ${currentTime}`);
    } catch (error) {
      toast.error('Failed to end lunch');
      console.error('End lunch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start break handler
  const handleStartBreak = async (userId: string) => {
    setIsLoading(true);
    try {
      const currentTime = getCurrentTimeString();
      const breakId = `break-${userId}-${Date.now()}`;

      setTimeEntries(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          shortBreaks: [
            ...prev[userId].shortBreaks,
            {
              id: breakId,
              start: currentTime,
              end: '',
              duration: 0,
              type: 'short_break'
            }
          ],
          status: TimeEntryStatus.ON_BREAK,
          lastModified: new Date().toISOString(),
          modifiedBy: userId
        }
      }));

      const user = HARDCODED_USERS.find(u => u.id === userId);
      toast.success(`${user?.fullName} started break at ${currentTime}`);
    } catch (error) {
      toast.error('Failed to start break');
      console.error('Start break error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // End break handler
  const handleEndBreak = async (userId: string) => {
    setIsLoading(true);
    try {
      const currentTime = getCurrentTimeString();

      setTimeEntries(prev => {
        const entry = prev[userId];
        const activeBreak = entry.shortBreaks.find(b => !b.end);

        if (!activeBreak) return prev;

        const duration = TimeCalculator.getTimeDifference(activeBreak.start, currentTime);

        const updatedBreaks = entry.shortBreaks.map(b =>
          b.id === activeBreak.id
            ? { ...b, end: currentTime, duration }
            : b
        );

        return {
          ...prev,
          [userId]: {
            ...entry,
            shortBreaks: updatedBreaks,
            status: TimeEntryStatus.CLOCKED_IN,
            lastModified: new Date().toISOString(),
            modifiedBy: userId
          }
        };
      });

      const user = HARDCODED_USERS.find(u => u.id === userId);
      toast.success(`${user?.fullName} ended break at ${currentTime}`);
    } catch (error) {
      toast.error('Failed to end break');
      console.error('End break error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // View details handler
  const handleViewDetails = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.info(`Viewing details for ${user?.fullName}`);
    // In a real app, this would navigate to a details page or open a modal
  };

  return (
    <div className={`w-full ${className}`}>
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
            const userTimeEntry = timeEntries[user.id] || createEmptyTimeEntry(user.id);

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

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumUserGrid;