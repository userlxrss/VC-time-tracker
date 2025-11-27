/**
 * Time entry data models and interfaces for VC Time Tracker
 */

import { UserProfile } from './user';

export interface TimeEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  clockIn?: string; // HH:MM format
  clockOut?: string; // HH:MM format
  lunchBreak: {
    start?: string; // HH:MM format
    end?: string; // HH:MM format
    duration?: number; // in minutes, calculated
  };
  shortBreaks: ShortBreak[];
  totalHours?: number; // calculated field
  status: TimeEntryStatus;
  notes?: string;
  lastModified: string; // ISO string
  modifiedBy: string; // userId
  isApproved?: boolean;
  approvedBy?: string; // userId
  approvedAt?: string; // ISO string
}

export interface ShortBreak {
  id: string;
  start: string; // HH:MM format
  end: string; // HH:MM format
  duration: number; // in minutes
  type: BreakType;
  notes?: string;
}

export enum BreakType {
  SHORT_BREAK = 'short_break',
  COFFEE_BREAK = 'coffee_break',
  RESTROOM = 'restroom',
  PERSONAL = 'personal',
  MEETING = 'meeting',
  OTHER = 'other'
}

export enum TimeEntryStatus {
  NOT_STARTED = 'not_started',
  CLOCKED_IN = 'clocked_in',
  ON_LUNCH = 'on_lunch',
  ON_BREAK = 'on_break',
  CLOCKED_OUT = 'clocked_out',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface TimeEntrySummary {
  userId: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHours: number;
  workHours: number;
  breakHours: number;
  status: TimeEntryStatus;
  hasNotes: boolean;
}

export interface TimeEntryFilters {
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: TimeEntryStatus;
  isApproved?: boolean;
}

export interface TimeEntryValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Time entry utility functions
export const createTimeEntryId = (userId: string, date: string): string => {
  return `time-${userId}-${date}`;
};

export const createBreakId = (timeEntryId: string, index: number): string => {
  return `break-${timeEntryId}-${index}`;
};

export const calculateBreakDuration = (start: string, end: string): number => {
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes
};

export const calculateTotalBreakHours = (lunchBreak: TimeEntry['lunchBreak'], shortBreaks: ShortBreak[]): number => {
  let totalMinutes = 0;

  // Lunch break
  if (lunchBreak.duration) {
    totalMinutes += lunchBreak.duration;
  }

  // Short breaks
  shortBreaks.forEach(breakItem => {
    totalMinutes += breakItem.duration;
  });

  return totalMinutes / 60; // convert to hours
};

export const calculateTotalHours = (
  clockIn?: string,
  clockOut?: string,
  lunchBreak: TimeEntry['lunchBreak'] = {},
  shortBreaks: ShortBreak[] = []
): number => {
  if (!clockIn || !clockOut) return 0;

  const startTime = parseTime(clockIn);
  const endTime = parseTime(clockOut);
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const breakMinutes = calculateTotalBreakHours(lunchBreak, shortBreaks) * 60;

  const workMinutes = Math.max(0, totalMinutes - breakMinutes);
  return workMinutes / 60;
};

export const parseTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5); // HH:MM format
};

export const getCurrentTimeString = (): string => {
  return formatTime(new Date());
};

export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

export const updateTimeEntryStatus = (entry: TimeEntry): TimeEntryStatus => {
  const now = getCurrentTimeString();
  const currentTime = parseTime(now);

  if (!entry.clockIn) {
    return TimeEntryStatus.NOT_STARTED;
  }

  const clockInTime = parseTime(entry.clockIn);

  if (entry.clockOut) {
    return TimeEntryStatus.CLOCKED_OUT;
  }

  if (entry.lunchBreak.start && !entry.lunchBreak.end) {
    return TimeEntryStatus.ON_LUNCH;
  }

  if (entry.shortBreaks.some(b => b.start && !b.end)) {
    return TimeEntryStatus.ON_BREAK;
  }

  if (entry.clockIn && !entry.clockOut) {
    return TimeEntryStatus.CLOCKED_IN;
  }

  return TimeEntryStatus.NOT_STARTED;
};

export const validateTimeEntry = (entry: TimeEntry): TimeEntryValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Clock in validation
  if (entry.clockIn && entry.clockOut) {
    const clockInTime = parseTime(entry.clockIn);
    const clockOutTime = parseTime(entry.clockOut);

    if (clockOutTime <= clockInTime) {
      errors.push('Clock out time must be after clock in time');
    }

    // Calculate total hours worked
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    if (totalHours > 24) {
      errors.push('Total hours cannot exceed 24 hours');
    } else if (totalHours > 12) {
      warnings.push('Long shift detected (over 12 hours)');
    } else if (totalHours < 4) {
      warnings.push('Short shift detected (under 4 hours)');
    }
  }

  // Lunch break validation
  if (entry.lunchBreak.start && entry.lunchBreak.end) {
    const lunchStart = parseTime(entry.lunchBreak.start);
    const lunchEnd = parseTime(entry.lunchBreak.end);

    if (lunchEnd <= lunchStart) {
      errors.push('Lunch break end time must be after start time');
    }

    const lunchDuration = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
    if (lunchDuration > 120) {
      warnings.push('Long lunch break detected (over 2 hours)');
    } else if (lunchDuration < 15) {
      warnings.push('Very short lunch break detected (under 15 minutes)');
    }
  }

  // Short breaks validation
  entry.shortBreaks.forEach((breakItem, index) => {
    const breakStart = parseTime(breakItem.start);
    const breakEnd = parseTime(breakItem.end);

    if (breakEnd <= breakStart) {
      errors.push(`Break ${index + 1} end time must be after start time`);
    }

    if (breakItem.duration > 60) {
      warnings.push(`Break ${index + 1} is over 1 hour`);
    }
  });

  // Check for overlapping times
  if (entry.clockIn && entry.clockOut) {
    const clockInTime = parseTime(entry.clockIn);
    const clockOutTime = parseTime(entry.clockOut);

    // Check lunch break overlap
    if (entry.lunchBreak.start && entry.lunchBreak.end) {
      const lunchStart = parseTime(entry.lunchBreak.start);
      const lunchEnd = parseTime(entry.lunchBreak.end);

      if (lunchStart < clockInTime || lunchEnd > clockOutTime) {
        errors.push('Lunch break must be within clock in/out times');
      }
    }

    // Check short breaks overlap
    entry.shortBreaks.forEach((breakItem, index) => {
      const breakStart = parseTime(breakItem.start);
      const breakEnd = parseTime(breakItem.end);

      if (breakStart < clockInTime || breakEnd > clockOutTime) {
        errors.push(`Break ${index + 1} must be within clock in/out times`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const createEmptyTimeEntry = (userId: string, date?: string): TimeEntry => {
  const entryDate = date || getCurrentDateString();
  const now = new Date().toISOString();

  return {
    id: createTimeEntryId(userId, entryDate),
    userId,
    date: entryDate,
    lunchBreak: {},
    shortBreaks: [],
    status: TimeEntryStatus.NOT_STARTED,
    lastModified: now,
    modifiedBy: userId
  };
};