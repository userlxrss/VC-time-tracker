import { UserPreferences, ClockInStatus } from './types';

const STORAGE_KEYS = {
  USER_PREFERENCES: (userId: number) => `vc-user-preferences-${userId}`,
  CLOCK_IN_STATUS: (userId: number) => `vc-clock-in-status-${userId}`,
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  eyeCareEnabled: true,
  eyeCareInterval: 20, // 20 minutes default
  lastReminderTime: new Date(0).toISOString(), // Start from epoch
};

export class ReminderStorage {
  static getUserPreferences(userId: number): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  static saveUserPreferences(userId: number, preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getUserPreferences(userId);
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES(userId), JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  static getClockInStatus(userId: number): ClockInStatus {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLOCK_IN_STATUS(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate if the clock in is still valid (not too old)
        if (parsed.isClockedIn && parsed.clockInTime) {
          const clockInTime = new Date(parsed.clockInTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

          // If more than 24 hours have passed, reset the status
          if (hoursDiff > 24) {
            this.setClockOut(userId);
            return { isClockedIn: false };
          }
        }
        return parsed;
      }
      return { isClockedIn: false };
    } catch (error) {
      console.error('Failed to load clock in status:', error);
      return { isClockedIn: false };
    }
  }

  static setClockIn(userId: number): void {
    try {
      const status: ClockInStatus = {
        isClockedIn: true,
        clockInTime: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.CLOCK_IN_STATUS(userId), JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save clock in status:', error);
    }
  }

  static setClockOut(userId: number): void {
    try {
      const status: ClockInStatus = {
        isClockedIn: false,
      };
      localStorage.setItem(STORAGE_KEYS.CLOCK_IN_STATUS(userId), JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save clock out status:', error);
    }
  }

  static clearUserData(userId: number): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES(userId));
      localStorage.removeItem(STORAGE_KEYS.CLOCK_IN_STATUS(userId));
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  static getHoursWorked(userId: number): number {
    const status = this.getClockInStatus(userId);
    if (!status.isClockedIn || !status.clockInTime) {
      return 0;
    }

    const clockInTime = new Date(status.clockInTime);
    const now = new Date();
    return (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
  }
}