'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { UserPreferences, ReminderState, ClockInStatus } from '@/lib/types';
import { ReminderStorage } from '@/lib/reminder-storage';
import { toast } from 'sonner';

interface ReminderContextType {
  preferences: UserPreferences;
  reminderState: ReminderState;
  clockInStatus: ClockInStatus;

  // Eye Care Reminder
  toggleEyeCare: (enabled: boolean) => void;
  setEyeCareInterval: (interval: number) => void;
  startEyeCareCountdown: () => void;
  stopEyeCareCountdown: () => void;
  skipEyeCareReminder: () => void;
  completeEyeCareReminder: () => void;

  // Clock In/Out
  clockIn: () => void;
  clockOut: () => void;

  // Notification permissions
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermissionGranted: boolean;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
};

interface ReminderProviderProps {
  children: ReactNode;
}

export const ReminderProvider: React.FC<ReminderProviderProps> = ({ children }) => {
  // Mock user for demo purposes
  const mockUser = { id: 'demo-user-id', name: 'Demo User' };
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);

  // State management
  const [preferences, setPreferences] = useState<UserPreferences>({
    eyeCareEnabled: true,
    eyeCareInterval: 20,
    lastReminderTime: new Date(0).toISOString(),
  });

  const [reminderState, setReminderState] = useState<ReminderState>({
    showEyeCareModal: false,
    countdownSeconds: 20,
    countdownActive: false,
  });

  const [clockInStatus, setClockInStatus] = useState<ClockInStatus>({
    isClockedIn: false,
  });

  // Refs for intervals
  const eyeCareIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockOutCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize user data when authenticated
  useEffect(() => {
    if (mockUser) {
      // Load preferences
      const loadedPreferences = ReminderStorage.getUserPreferences(mockUser.id);
      setPreferences(loadedPreferences);

      // Load clock in status
      const loadedStatus = ReminderStorage.getClockInStatus(mockUser.id);
      setClockInStatus(loadedStatus);

      // Request notification permission
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationPermissionGranted(true);
        } else if (Notification.permission !== 'denied') {
          // Will request on first interaction
        }
      }
    } else {
      // Clear intervals when logged out
      clearAllIntervals();
      setReminderState({
        showEyeCareModal: false,
        countdownSeconds: 20,
        countdownActive: false,
      });
    }
  }, [mockUser]);

  // Eye Care Reminder Logic
  const checkEyeCareReminder = useCallback(() => {
    if (!mockUser || !preferences.eyeCareEnabled || !clockInStatus.isClockedIn) {
      return;
    }

    const now = new Date();
    const lastReminder = new Date(preferences.lastReminderTime);
    const minutesSinceLastReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60);

    if (minutesSinceLastReminder >= preferences.eyeCareInterval) {
      startEyeCareCountdown();
    }
  }, [mockUser, preferences, clockInStatus.isClockedIn]);

  // Clock Out Reminder Logic
  const checkClockOutReminder = useCallback(() => {
    if (!mockUser || !clockInStatus.isClockedIn) {
      return;
    }

    const hoursWorked = ReminderStorage.getHoursWorked(mockUser.id);

    if (hoursWorked >= 10) {
      // Show in-app toast
      toast.warning(`Don't forget to clock out! You've been working for ${Math.floor(hoursWorked)} hours.`, {
        duration: 10000,
        action: {
          label: 'Clock Out Now',
          onClick: () => clockOut(),
        },
      });

      // Show browser notification if permitted
      if (notificationPermissionGranted) {
        new Notification('Time to Clock Out!', {
          body: `You've been working for ${Math.floor(hoursWorked)} hours. Don't forget to clock out!`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'clock-out-reminder',
        });
      }
    }
  }, [mockUser, clockInStatus.isClockedIn, notificationPermissionGranted]);

  // Setup intervals
  useEffect(() => {
    if (mockUser && clockInStatus.isClockedIn) {
      // Eye care check every minute
      eyeCareIntervalRef.current = setInterval(checkEyeCareReminder, 60000);

      // Clock out check every hour
      clockOutCheckIntervalRef.current = setInterval(checkClockOutReminder, 3600000);
    }

    return () => {
      clearAllIntervals();
    };
  }, [mockUser, clockInStatus.isClockedIn, checkEyeCareReminder, checkClockOutReminder]);

  const clearAllIntervals = () => {
    if (eyeCareIntervalRef.current) {
      clearInterval(eyeCareIntervalRef.current);
      eyeCareIntervalRef.current = null;
    }
    if (clockOutCheckIntervalRef.current) {
      clearInterval(clockOutCheckIntervalRef.current);
      clockOutCheckIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Eye Care Reminder Functions
  const toggleEyeCare = (enabled: boolean) => {
    if (!mockUser) return;

    const updatedPreferences = { ...preferences, eyeCareEnabled: enabled };
    setPreferences(updatedPreferences);
    ReminderStorage.saveUserPreferences(mockUser.id, { eyeCareEnabled: enabled });
  };

  const setEyeCareInterval = (interval: number) => {
    if (!mockUser) return;

    const updatedPreferences = { ...preferences, eyeCareInterval: interval };
    setPreferences(updatedPreferences);
    ReminderStorage.saveUserPreferences(mockUser.id, { eyeCareInterval: interval });
  };

  const startEyeCareCountdown = () => {
    setReminderState(prev => ({
      ...prev,
      showEyeCareModal: true,
      countdownSeconds: 20,
      countdownActive: true,
    }));

    // Update last reminder time
    if (mockUser) {
      ReminderStorage.saveUserPreferences(mockUser.id, {
        lastReminderTime: new Date().toISOString(),
      });
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setReminderState(prev => {
        if (prev.countdownSeconds <= 1) {
          clearInterval(countdownIntervalRef.current!);
          return {
            ...prev,
            countdownSeconds: 0,
            countdownActive: false,
          };
        }
        return {
          ...prev,
          countdownSeconds: prev.countdownSeconds - 1,
        };
      });
    }, 1000);
  };

  const stopEyeCareCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setReminderState(prev => ({
      ...prev,
      showEyeCareModal: false,
      countdownActive: false,
      countdownSeconds: 20,
    }));
  };

  const skipEyeCareReminder = () => {
    stopEyeCareCountdown();
  };

  const completeEyeCareReminder = () => {
    stopEyeCareCountdown();
    toast.success('Great job! Your eyes thank you.');
  };

  // Clock In/Out Functions
  const clockIn = () => {
    if (!mockUser) return;

    ReminderStorage.setClockIn(mockUser.id);
    setClockInStatus({
      isClockedIn: true,
      clockInTime: new Date().toISOString(),
    });

    toast.success('Clocked in successfully!');
  };

  const clockOut = () => {
    if (!mockUser) return;

    ReminderStorage.setClockOut(mockUser.id);
    setClockInStatus({ isClockedIn: false });

    const hoursWorked = ReminderStorage.getHoursWorked(mockUser.id);
    toast.success(`Clocked out successfully! Total hours: ${hoursWorked.toFixed(2)}`);
  };

  // Notification Permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in your browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermissionGranted(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setNotificationPermissionGranted(granted);

        if (granted) {
          toast.success('Notifications enabled successfully!');
        } else {
          toast.error('Notifications were denied');
        }

        return granted;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast.error('Failed to request notification permission');
        return false;
      }
    }

    toast.error('Notifications are blocked in your browser settings');
    return false;
  };

  const value: ReminderContextType = {
    preferences,
    reminderState,
    clockInStatus,
    toggleEyeCare,
    setEyeCareInterval,
    startEyeCareCountdown,
    stopEyeCareCountdown,
    skipEyeCareReminder,
    completeEyeCareReminder,
    clockIn,
    clockOut,
    requestNotificationPermission,
    notificationPermissionGranted,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};