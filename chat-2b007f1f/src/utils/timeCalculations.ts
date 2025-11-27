/**
 * Time calculation functions for VC Time Tracker
 */

import { TimeEntry, Break } from '../types';

/**
 * Calculate the duration of a time entry in minutes
 */
export function calculateTimeEntryDuration(timeEntry: TimeEntry): number {
  if (!timeEntry.clockOut || !timeEntry.clockIn) return 0;

  const endTime = timeEntry.clockOut.getTime();
  const startTime = timeEntry.clockIn.getTime();

  return Math.round((endTime - startTime) / (1000 * 60));
}

/**
 * Calculate the duration of a break in minutes
 */
export function calculateBreakDuration(breakEntry: Break): number {
  if (!breakEntry.endTime || !breakEntry.startTime) return 0;

  const endTime = breakEntry.endTime.getTime();
  const startTime = breakEntry.startTime.getTime();

  return Math.round((endTime - startTime) / (1000 * 60));
}

/**
 * Calculate total break duration for a time entry
 */
export function calculateTotalBreakDuration(breaks: Break[], timeEntryId: string): number {
  return breaks
    .filter(breakEntry => breakEntry.timeEntryId === timeEntryId && breakEntry.endTime)
    .reduce((total, breakEntry) => total + calculateBreakDuration(breakEntry), 0);
}

/**
 * Calculate productive time (total time minus breaks) for a time entry
 */
export function calculateProductiveTime(timeEntry: TimeEntry, breaks: Break[]): number {
  const totalDuration = calculateTimeEntryDuration(timeEntry);
  const totalBreakDuration = calculateTotalBreakDuration(breaks, timeEntry.id);

  return Math.max(0, totalDuration - totalBreakDuration);
}

/**
 * Calculate earnings for a time entry based on hourly rate
 */
export function calculateTimeEntryEarnings(timeEntry: TimeEntry, hourlyRate: number): number {
  const productiveMinutes = timeEntry.duration ? timeEntry.duration : 0;
  const hours = productiveMinutes / 60;
  return hours * hourlyRate;
}

/**
 * Calculate total hours worked in a day
 */
export function calculateDailyHours(timeEntries: TimeEntry[], breaks: Break[], date: Date): {
  totalMinutes: number;
  breakMinutes: number;
  productiveMinutes: number;
  overtimeMinutes: number;
} {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const dayTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.clockIn);
    return entryDate >= targetDate && entryDate < nextDay;
  });

  const totalMinutes = dayTimeEntries.reduce((total, entry) => {
    return total + (entry.duration || calculateTimeEntryDuration(entry));
  }, 0);

  const breakMinutes = dayTimeEntries.reduce((total, entry) => {
    return total + calculateTotalBreakDuration(breaks, entry.id);
  }, 0);

  const productiveMinutes = Math.max(0, totalMinutes - breakMinutes);
  const regularWorkMinutes = 8 * 60; // 8 hours
  const overtimeMinutes = Math.max(0, productiveMinutes - regularWorkMinutes);

  return {
    totalMinutes,
    breakMinutes,
    productiveMinutes,
    overtimeMinutes
  };
}

/**
 * Calculate total hours worked in a week
 */
export function calculateWeeklyHours(
  timeEntries: TimeEntry[],
  breaks: Break[],
  weekStart: Date
): {
  totalMinutes: number;
  breakMinutes: number;
  productiveMinutes: number;
  overtimeMinutes: number;
  dailyBreakdown: Array<{
    date: Date;
    totalMinutes: number;
    breakMinutes: number;
    productiveMinutes: number;
  }>;
} {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.clockIn);
    return entryDate >= weekStart && entryDate < weekEnd;
  });

  const dailyBreakdown: Array<{
    date: Date;
    totalMinutes: number;
    breakMinutes: number;
    productiveMinutes: number;
  }> = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(currentDate.getDate() + i);

    const dayHours = calculateDailyHours(timeEntries, breaks, currentDate);
    dailyBreakdown.push({
      date: currentDate,
      ...dayHours
    });
  }

  const totalMinutes = dailyBreakdown.reduce((sum, day) => sum + day.totalMinutes, 0);
  const breakMinutes = dailyBreakdown.reduce((sum, day) => sum + day.breakMinutes, 0);
  const productiveMinutes = dailyBreakdown.reduce((sum, day) => sum + day.productiveMinutes, 0);
  const regularWorkWeekMinutes = 40 * 60; // 40 hours
  const overtimeMinutes = Math.max(0, productiveMinutes - regularWorkWeekMinutes);

  return {
    totalMinutes,
    breakMinutes,
    productiveMinutes,
    overtimeMinutes,
    dailyBreakdown
  };
}

/**
 * Calculate total hours worked in a month
 */
export function calculateMonthlyHours(
  timeEntries: TimeEntry[],
  breaks: Break[],
  year: number,
  month: number
): {
  totalMinutes: number;
  breakMinutes: number;
  productiveMinutes: number;
  overtimeMinutes: number;
  weeklyBreakdown: Array<{
    weekStart: Date;
    weekEnd: Date;
    totalMinutes: number;
    breakMinutes: number;
    productiveMinutes: number;
  }>;
} {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  // Get all weeks in the month
  const weeks: Array<{ weekStart: Date; weekEnd: Date }> = [];
  const currentWeek = new Date(monthStart);

  // Adjust to start of week (Sunday)
  const dayOfWeek = currentWeek.getDay();
  currentWeek.setDate(currentWeek.getDate() - dayOfWeek);

  while (currentWeek < monthEnd) {
    const weekStart = new Date(currentWeek);
    const weekEnd = new Date(currentWeek);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (weekStart < monthEnd) {
      weeks.push({ weekStart, weekEnd });
    }

    currentWeek.setDate(currentWeek.getDate() + 7);
  }

  const weeklyBreakdown = weeks.map(({ weekStart, weekEnd }) => {
    const weekHours = calculateWeeklyHours(timeEntries, breaks, weekStart);
    return {
      weekStart,
      weekEnd,
      totalMinutes: weekHours.totalMinutes,
      breakMinutes: weekHours.breakMinutes,
      productiveMinutes: weekHours.productiveMinutes
    };
  });

  const totalMinutes = weeklyBreakdown.reduce((sum, week) => sum + week.totalMinutes, 0);
  const breakMinutes = weeklyBreakdown.reduce((sum, week) => sum + week.breakMinutes, 0);
  const productiveMinutes = weeklyBreakdown.reduce((sum, week) => sum + week.productiveMinutes, 0);

  // Calculate monthly overtime (based on average of 40 hours/week)
  const weeksInMonth = weeklyBreakdown.length;
  const regularWorkMonthMinutes = weeksInMonth * 40 * 60;
  const overtimeMinutes = Math.max(0, productiveMinutes - regularWorkMonthMinutes);

  return {
    totalMinutes,
    breakMinutes,
    productiveMinutes,
    overtimeMinutes,
    weeklyBreakdown
  };
}

/**
 * Calculate average work hours per day
 */
export function calculateAverageDailyHours(
  timeEntries: TimeEntry[],
  breaks: Break[],
  startDate: Date,
  endDate: Date
): {
  totalDays: number;
  workedDays: number;
  totalMinutes: number;
  averageMinutesPerWorkedDay: number;
  averageMinutesPerTotalDay: number;
} {
  const dayTimeEntries: TimeEntry[] = [];
  const dayBreaks: Break[] = [];

  // Filter time entries and breaks within the date range
  timeEntries.forEach(entry => {
    const entryDate = new Date(entry.clockIn);
    if (entryDate >= startDate && entryDate <= endDate) {
      dayTimeEntries.push(entry);
    }
  });

  breaks.forEach(breakEntry => {
    const breakTimeEntry = timeEntries.find(te => te.id === breakEntry.timeEntryId);
    if (breakTimeEntry) {
      const entryDate = new Date(breakTimeEntry.clockIn);
      if (entryDate >= startDate && entryDate <= endDate) {
        dayBreaks.push(breakEntry);
      }
    }
  });

  // Calculate total days
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate unique worked days
  const workedDaysSet = new Set<string>();
  dayTimeEntries.forEach(entry => {
    const entryDate = new Date(entry.clockIn);
    workedDaysSet.add(entryDate.toDateString());
  });
  const workedDays = workedDaysSet.size;

  // Calculate total minutes
  const totalMinutes = dayTimeEntries.reduce((total, entry) => {
    return total + (entry.duration || calculateTimeEntryDuration(entry));
  }, 0);

  return {
    totalDays,
    workedDays,
    totalMinutes,
    averageMinutesPerWorkedDay: workedDays > 0 ? Math.round(totalMinutes / workedDays) : 0,
    averageMinutesPerTotalDay: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0
  };
}

/**
 * Calculate time entry statistics
 */
export function calculateTimeEntryStats(timeEntry: TimeEntry, breaks: Break[]): {
  totalMinutes: number;
  breakMinutes: number;
  productiveMinutes: number;
  efficiency: number; // percentage of productive time
} {
  const totalMinutes = calculateTimeEntryDuration(timeEntry);
  const breakMinutes = calculateTotalBreakDuration(breaks, timeEntry.id);
  const productiveMinutes = Math.max(0, totalMinutes - breakMinutes);
  const efficiency = totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 0;

  return {
    totalMinutes,
    breakMinutes,
    productiveMinutes,
    efficiency
  };
}