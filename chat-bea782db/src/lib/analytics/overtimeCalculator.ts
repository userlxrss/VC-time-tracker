/**
 * Overtime Calculation and Daily Progress Tracking System
 *
 * Comprehensive analytics for work hours, overtime calculation, and progress
 * tracking with configurable policies and detailed reporting.
 */

import { TimeEntry, User } from '../../database-schema';
import { manilaTime } from '../utils/manilaTime';

/**
 * Overtime policy configuration
 */
export interface OvertimePolicy {
  standardWorkHours: number; // Standard work hours per day (default: 8)
  overtimeThreshold: number; // Hours after which overtime starts (default: 8)
  overtimeRate: number; // Overtime multiplier (default: 1.25)
  doubleOvertimeThreshold?: number; // Hours for double overtime (optional)
  doubleOvertimeRate?: number; // Double overtime multiplier (optional)
  maxOvertimePerDay?: number; // Maximum overtime hours per day
  maxOvertimePerWeek?: number; // Maximum overtime hours per week
  restDayRate?: number; // Rate for work on rest days
  holidayRate?: number; // Rate for work on holidays
}

/**
 * Daily work summary
 */
export interface DailyWorkSummary {
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours?: number;
  breakMinutes: number;
  netWorkHours: number;
  efficiency: number; // Work efficiency percentage
  status: 'absent' | 'incomplete' | 'complete' | 'overtime';
  goalHours: number;
  completionPercentage: number;
  projectedFinishTime?: Date;
  isWorkingDay: boolean;
  isHoliday: boolean;
  earnings?: {
    regularPay: number;
    overtimePay: number;
    doubleOvertimePay?: number;
    totalPay: number;
  };
}

/**
 * Weekly work summary
 */
export interface WeeklyWorkSummary {
  weekStart: Date;
  weekEnd: Date;
  dailySummaries: DailyWorkSummary[];
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours?: number;
  totalBreakMinutes: number;
  averageDailyHours: number;
  mostProductiveDay: string;
  leastProductiveDay: string;
  overtimeOccurrences: number;
  goalHours: number; // Weekly goal (5 days x 8 hours = 40 hours)
  completionPercentage: number;
  earnings?: {
    regularPay: number;
    overtimePay: number;
    doubleOvertimePay?: number;
    totalPay: number;
  };
}

/**
 * Monthly work summary
 */
export interface MonthlyWorkSummary {
  month: Date;
  weeklySummaries: WeeklyWorkSummary[];
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  doubleOvertimeHours?: number;
  totalBreakMinutes: number;
  averageDailyHours: number;
  averageWeeklyHours: number;
  workDays: number;
  daysWorked: number;
  overtimeDays: number;
  goalHours: number; // Monthly goal (approximately 22 days x 8 hours)
  completionPercentage: number;
  earnings?: {
    regularPay: number;
    overtimePay: number;
    doubleOvertimePay?: number;
    totalPay: number;
  };
}

/**
 * Work progress metrics
 */
export interface WorkProgressMetrics {
  currentStreak: number; // Current consecutive days meeting goals
  longestStreak: number; // Longest consecutive days meeting goals
  totalDaysWorked: number; // Total days worked in period
  averageArrivalTime: string; // Average clock-in time
  averageDepartureTime: string; // Average clock-out time
  punctualityRate: number; // Percentage of on-time arrivals
  breakCompliance: number; // Percentage of appropriate break usage
  overtimeTrend: 'increasing' | 'decreasing' | 'stable';
  productivityTrend: 'improving' | 'declining' | 'stable';
}

/**
 * Custom error for overtime calculations
 */
class OvertimeCalculatorError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'OvertimeCalculatorError';
  }
}

/**
 * Overtime Calculator implementation
 */
export class OvertimeCalculator {
  private readonly DEFAULT_POLICY: OvertimePolicy = {
    standardWorkHours: 8,
    overtimeThreshold: 8,
    overtimeRate: 1.25,
    doubleOvertimeThreshold: 12,
    doubleOvertimeRate: 1.5,
    maxOvertimePerDay: 4,
    maxOvertimePerWeek: 20,
    restDayRate: 1.5,
    holidayRate: 2.0
  };

  /**
   * Calculate overtime hours for a single time entry
   */
  calculateEntryOvertime(
    entry: TimeEntry,
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): {
    regularHours: number;
    overtimeHours: number;
    doubleOvertimeHours?: number;
    earnings: {
      regularPay: number;
      overtimePay: number;
      doubleOvertimePay?: number;
      totalPay: number;
    };
  } {
    const fullPolicy = { ...this.DEFAULT_POLICY, ...policy };
    const totalHours = entry.totalHours || 0;

    let regularHours = Math.min(totalHours, fullPolicy.standardWorkHours);
    let overtimeHours = 0;
    let doubleOvertimeHours = 0;

    if (totalHours > fullPolicy.overtimeThreshold) {
      const excessHours = totalHours - fullPolicy.overtimeThreshold;

      if (fullPolicy.doubleOvertimeThreshold && totalHours > fullPolicy.doubleOvertimeThreshold) {
        const doubleOvertimeExcess = totalHours - fullPolicy.doubleOvertimeThreshold;
        doubleOvertimeHours = Math.min(doubleOvertimeExcess, fullPolicy.maxOvertimePerDay || 4);
        overtimeHours = excessHours - doubleOvertimeHours;
      } else {
        overtimeHours = Math.min(excessHours, fullPolicy.maxOvertimePerDay || 4);
      }
    }

    // Calculate earnings
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * fullPolicy.overtimeRate;
    const doubleOvertimePay = doubleOvertimeHours
      ? doubleOvertimeHours * hourlyRate * (fullPolicy.doubleOvertimeRate || 1.5)
      : 0;
    const totalPay = regularPay + overtimePay + doubleOvertimePay;

    return {
      regularHours,
      overtimeHours,
      doubleOvertimeHours,
      earnings: {
        regularPay,
        overtimePay,
        doubleOvertimePay,
        totalPay
      }
    };
  }

  /**
   * Generate daily work summary
   */
  generateDailySummary(
    entries: TimeEntry[],
    date: Date,
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): DailyWorkSummary {
    const dayEntries = entries.filter(entry =>
      manilaTime.isToday(entry.clockIn, date)
    );

    const isWorkingDay = manilaTime.isWorkingDay(date);
    const isHoliday = manilaTime.isHoliday(date);

    if (dayEntries.length === 0) {
      return {
        date,
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        breakMinutes: 0,
        netWorkHours: 0,
        efficiency: 0,
        status: isWorkingDay ? 'absent' : 'complete',
        goalHours: isWorkingDay ? this.DEFAULT_POLICY.standardWorkHours : 0,
        completionPercentage: 0,
        isWorkingDay,
        isHoliday
      };
    }

    // Calculate totals for the day
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let doubleOvertimeHours = 0;
    let breakMinutes = 0;
    let totalPay = 0;
    let regularPay = 0;
    let overtimePay = 0;
    let doubleOvertimePay = 0;

    const clockInTimes: Date[] = [];
    const clockOutTimes: Date[] = [];

    dayEntries.forEach(entry => {
      const overtime = this.calculateEntryOvertime(entry, policy, hourlyRate);

      totalHours += entry.totalHours || 0;
      regularHours += overtime.regularHours;
      overtimeHours += overtime.overtimeHours;
      doubleOvertimeHours += overtime.doubleOvertimeHours || 0;

      breakMinutes += entry.breaks.reduce((total, breakPeriod) =>
        total + (breakPeriod.duration || 0), 0
      );

      regularPay += overtime.earnings.regularPay;
      overtimePay += overtime.earnings.overtimePay;
      doubleOvertimePay += overtime.earnings.doubleOvertimePay || 0;
      totalPay += overtime.earnings.totalPay;

      if (entry.clockIn) clockInTimes.push(entry.clockIn);
      if (entry.clockOut) clockOutTimes.push(entry.clockOut);
    });

    const netWorkHours = totalHours - (breakMinutes / 60);
    const goalHours = isWorkingDay ? (policy.standardWorkHours || this.DEFAULT_POLICY.standardWorkHours) : 0;
    const completionPercentage = goalHours > 0 ? (netWorkHours / goalHours) * 100 : 0;

    // Determine status
    let status: DailyWorkSummary['status'] = 'incomplete';
    if (completionPercentage >= 100) {
      status = overtimeHours > 0 ? 'overtime' : 'complete';
    } else if (completionPercentage === 0 && !isWorkingDay) {
      status = 'complete'; // Non-working days are considered complete
    }

    // Calculate efficiency (work hours vs total time at work)
    const totalWorkTime = totalHours > 0 ? totalHours : 1;
    const efficiency = (netWorkHours / totalWorkTime) * 100;

    // Calculate projected finish time for incomplete days
    let projectedFinishTime: Date | undefined;
    if (status === 'incomplete' && clockInTimes.length > 0) {
      const firstClockIn = new Date(Math.min(...clockInTimes.map(d => d.getTime())));
      const remainingHours = Math.max(0, goalHours - netWorkHours);

      if (remainingHours > 0) {
        projectedFinishTime = new Date(firstClockIn.getTime() + (remainingHours * 60 * 60 * 1000));
      }
    }

    return {
      date,
      clockIn: clockInTimes.length > 0 ? new Date(Math.min(...clockInTimes.map(d => d.getTime()))) : undefined,
      clockOut: clockOutTimes.length > 0 ? new Date(Math.max(...clockOutTimes.map(d => d.getTime()))) : undefined,
      totalHours,
      regularHours,
      overtimeHours,
      doubleOvertimeHours,
      breakMinutes,
      netWorkHours,
      efficiency: Math.min(100, Math.max(0, efficiency)),
      status,
      goalHours,
      completionPercentage,
      projectedFinishTime,
      isWorkingDay,
      isHoliday,
      earnings: hourlyRate > 0 ? {
        regularPay,
        overtimePay,
        doubleOvertimePay,
        totalPay
      } : undefined
    };
  }

  /**
   * Generate weekly work summary
   */
  generateWeeklySummary(
    entries: TimeEntry[],
    weekStart: Date,
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): WeeklyWorkSummary {
    const weekEnd = manilaTime.endOfWeek(weekStart);
    const dailySummaries: DailyWorkSummary[] = [];

    let totalRegularPay = 0;
    let totalOvertimePay = 0;
    let totalDoubleOvertimePay = 0;

    // Generate daily summaries for each day of the week
    for (let date = new Date(weekStart); date <= weekEnd; date.setDate(date.getDate() + 1)) {
      const dailySummary = this.generateDailySummary(entries, new Date(date), policy, hourlyRate);
      dailySummaries.push(dailySummary);

      if (dailySummary.earnings) {
        totalRegularPay += dailySummary.earnings.regularPay;
        totalOvertimePay += dailySummary.earnings.overtimePay;
        totalDoubleOvertimePay += dailySummary.earnings.doubleOvertimePay || 0;
      }
    }

    const totalHours = dailySummaries.reduce((sum, day) => sum + day.totalHours, 0);
    const regularHours = dailySummaries.reduce((sum, day) => sum + day.regularHours, 0);
    const overtimeHours = dailySummaries.reduce((sum, day) => sum + day.overtimeHours, 0);
    const doubleOvertimeHours = dailySummaries.reduce((sum, day) => sum + (day.doubleOvertimeHours || 0), 0);
    const totalBreakMinutes = dailySummaries.reduce((sum, day) => sum + day.breakMinutes, 0);

    const workingDays = dailySummaries.filter(day => day.isWorkingDay);
    const averageDailyHours = workingDays.length > 0 ? totalHours / workingDays.length : 0;

    const overtimeOccurrences = dailySummaries.filter(day => day.status === 'overtime').length;
    const goalHours = workingDays.length * (policy.standardWorkHours || this.DEFAULT_POLICY.standardWorkHours);
    const completionPercentage = goalHours > 0 ? (totalHours / goalHours) * 100 : 0;

    // Find most and least productive days
    const productiveDays = dailySummaries
      .filter(day => day.isWorkingDay && day.totalHours > 0)
      .sort((a, b) => b.efficiency - a.efficiency);

    const mostProductiveDay = productiveDays.length > 0
      ? manilaTime.format(productiveDays[0].date, 'dddd')
      : 'N/A';
    const leastProductiveDay = productiveDays.length > 1
      ? manilaTime.format(productiveDays[productiveDays.length - 1].date, 'dddd')
      : 'N/A';

    return {
      weekStart,
      weekEnd,
      dailySummaries,
      totalHours,
      regularHours,
      overtimeHours,
      doubleOvertimeHours,
      totalBreakMinutes,
      averageDailyHours,
      mostProductiveDay,
      leastProductiveDay,
      overtimeOccurrences,
      goalHours,
      completionPercentage,
      earnings: hourlyRate > 0 ? {
        regularPay: totalRegularPay,
        overtimePay: totalOvertimePay,
        doubleOvertimePay: totalDoubleOvertimePay,
        totalPay: totalRegularPay + totalOvertimePay + totalDoubleOvertimePay
      } : undefined
    };
  }

  /**
   * Generate monthly work summary
   */
  generateMonthlySummary(
    entries: TimeEntry[],
    month: Date,
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): MonthlyWorkSummary {
    const monthStart = manilaTime.startOfMonth(month);
    const monthEnd = manilaTime.endOfMonth(month);
    const weeklySummaries: WeeklyWorkSummary[] = [];

    let totalRegularPay = 0;
    let totalOvertimePay = 0;
    let totalDoubleOvertimePay = 0;

    // Generate weekly summaries for each week in the month
    let currentWeekStart = manilaTime.startOfWeek(monthStart);
    while (currentWeekStart <= monthEnd) {
      const weekEnd = manilaTime.endOfWeek(currentWeekStart);
      const weekSummary = this.generateWeeklySummary(entries, currentWeekStart, policy, hourlyRate);

      // Only include weeks that overlap with the month
      if (weekEnd >= monthStart && currentWeekStart <= monthEnd) {
        weeklySummaries.push(weekSummary);

        if (weekSummary.earnings) {
          totalRegularPay += weekSummary.earnings.regularPay;
          totalOvertimePay += weekSummary.earnings.overtimePay;
          totalDoubleOvertimePay += weekSummary.earnings.doubleOvertimePay || 0;
        }
      }

      currentWeekStart = new Date(currentWeekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
    }

    const totalHours = weeklySummaries.reduce((sum, week) => sum + week.totalHours, 0);
    const regularHours = weeklySummaries.reduce((sum, week) => sum + week.regularHours, 0);
    const overtimeHours = weeklySummaries.reduce((sum, week) => sum + week.overtimeHours, 0);
    const doubleOvertimeHours = weeklySummaries.reduce((sum, week) => sum + (week.doubleOvertimeHours || 0), 0);
    const totalBreakMinutes = weeklySummaries.reduce((sum, week) => sum + week.totalBreakMinutes, 0);

    const workingDays = weeklySummaries.flatMap(week =>
      week.dailySummaries.filter(day => day.isWorkingDay)
    ).length;

    const daysWorked = weeklySummaries.flatMap(week =>
      week.dailySummaries.filter(day => day.totalHours > 0)
    ).length;

    const overtimeDays = weeklySummaries.flatMap(week =>
      week.dailySummaries.filter(day => day.status === 'overtime')
    ).length;

    const averageDailyHours = daysWorked > 0 ? totalHours / daysWorked : 0;
    const averageWeeklyHours = weeklySummaries.length > 0 ? totalHours / weeklySummaries.length : 0;

    const goalHours = workingDays * (policy.standardWorkHours || this.DEFAULT_POLICY.standardWorkHours);
    const completionPercentage = goalHours > 0 ? (totalHours / goalHours) * 100 : 0;

    return {
      month,
      weeklySummaries,
      totalHours,
      regularHours,
      overtimeHours,
      doubleOvertimeHours,
      totalBreakMinutes,
      averageDailyHours,
      averageWeeklyHours,
      workDays: workingDays,
      daysWorked,
      overtimeDays,
      goalHours,
      completionPercentage,
      earnings: hourlyRate > 0 ? {
        regularPay: totalRegularPay,
        overtimePay: totalOvertimePay,
        doubleOvertimePay: totalDoubleOvertimePay,
        totalPay: totalRegularPay + totalOvertimePay + totalDoubleOvertimePay
      } : undefined
    };
  }

  /**
   * Calculate work progress metrics
   */
  calculateProgressMetrics(
    entries: TimeEntry[],
    period: { start: Date; end: Date }
  ): WorkProgressMetrics {
    const dailySummaries: DailyWorkSummary[] = [];
    let currentDate = new Date(period.start);

    while (currentDate <= period.end) {
      const summary = this.generateDailySummary(entries, new Date(currentDate));
      dailySummaries.push(summary);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    dailySummaries.forEach(summary => {
      if (summary.isWorkingDay && summary.completionPercentage >= 100) {
        tempStreak++;
        if (summary.date >= manilaTime.startOfDay(manilaTime.now())) {
          currentStreak = tempStreak;
        }
      } else if (summary.isWorkingDay) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate arrival and departure times
    const clockInTimes = dailySummaries
      .map(s => s.clockIn)
      .filter((time): time is Date => time !== undefined);

    const clockOutTimes = dailySummaries
      .map(s => s.clockOut)
      .filter((time): time is Date => time !== undefined);

    const averageArrivalTime = clockInTimes.length > 0
      ? this.calculateAverageTime(clockInTimes)
      : 'N/A';

    const averageDepartureTime = clockOutTimes.length > 0
      ? this.calculateAverageTime(clockOutTimes)
      : 'N/A';

    // Calculate punctuality (arrivals before 9:30 AM)
    const onTimeArrivals = clockInTimes.filter(time => {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      return (hours < 9) || (hours === 9 && minutes <= 30);
    }).length;

    const punctualityRate = clockInTimes.length > 0
      ? (onTimeArrivals / clockInTimes.length) * 100
      : 0;

    // Calculate break compliance (breaks between 30-90 minutes)
    const workingDaysWithBreaks = dailySummaries.filter(s =>
      s.isWorkingDay && s.breakMinutes > 0
    );

    const properBreaks = workingDaysWithBreaks.filter(s =>
      s.breakMinutes >= 30 && s.breakMinutes <= 90
    ).length;

    const breakCompliance = workingDaysWithBreaks.length > 0
      ? (properBreaks / workingDaysWithBreaks.length) * 100
      : 100; // Perfect if no breaks were needed/taken

    // Calculate overtime trend
    const overtimeTrend = this.calculateTrend(
      dailySummaries.map(s => s.overtimeHours)
    );

    // Calculate productivity trend
    const productivityTrend = this.calculateTrend(
      dailySummaries.map(s => s.efficiency)
    );

    return {
      currentStreak,
      longestStreak,
      totalDaysWorked: dailySummaries.filter(s => s.totalHours > 0).length,
      averageArrivalTime,
      averageDepartureTime,
      punctualityRate,
      breakCompliance,
      overtimeTrend,
      productivityTrend
    };
  }

  /**
   * Calculate average time from array of dates
   */
  private calculateAverageTime(times: Date[]): string {
    const totalMinutes = times.reduce((sum, time) => {
      return sum + (time.getHours() * 60) + time.getMinutes();
    }, 0);

    const averageMinutes = totalMinutes / times.length;
    const hours = Math.floor(averageMinutes / 60);
    const minutes = Math.round(averageMinutes % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate trend from array of numbers
   */
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% threshold

    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Get today's progress for a user
   */
  async getTodayProgress(
    userId: string,
    entries: TimeEntry[],
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): Promise<DailyWorkSummary> {
    const today = manilaTime.now();
    return this.generateDailySummary(entries, today, policy, hourlyRate);
  }

  /**
   * Get current week's progress
   */
  async getCurrentWeekProgress(
    userId: string,
    entries: TimeEntry[],
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): Promise<WeeklyWorkSummary> {
    const weekStart = manilaTime.startOfWeek(manilaTime.now());
    return this.generateWeeklySummary(entries, weekStart, policy, hourlyRate);
  }

  /**
   * Get current month's progress
   */
  async getCurrentMonthProgress(
    userId: string,
    entries: TimeEntry[],
    policy: Partial<OvertimePolicy> = {},
    hourlyRate: number = 0
  ): Promise<MonthlyWorkSummary> {
    const monthStart = manilaTime.startOfMonth(manilaTime.now());
    return this.generateMonthlySummary(entries, monthStart, policy, hourlyRate);
  }

  /**
   * Export data for reporting
   */
  exportData(
    summary: DailyWorkSummary | WeeklyWorkSummary | MonthlyWorkSummary,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): string | object {
    switch (format) {
      case 'json':
        return JSON.stringify(summary, null, 2);

      case 'csv':
        if ('dailySummaries' in summary) {
          // Weekly or Monthly summary
          const headers = 'Date,Total Hours,Regular Hours,Overtime Hours,Break Minutes,Efficiency,Status,Completion %\n';
          const rows = summary.dailySummaries.map(day =>
            `${manilaTime.format(day.date, 'YYYY-MM-DD')},${day.totalHours},${day.regularHours},${day.overtimeHours},${day.breakMinutes},${day.efficiency}%,${day.status},${day.completionPercentage}%`
          ).join('\n');
          return headers + rows;
        } else {
          // Daily summary
          const daily = summary as DailyWorkSummary;
          return `Metric,Value\nDate,${manilaTime.format(daily.date, 'YYYY-MM-DD')}\nTotal Hours,${daily.totalHours}\nRegular Hours,${daily.regularHours}\nOvertime Hours,${daily.overtimeHours}\nBreak Minutes,${daily.breakMinutes}\nEfficiency,${daily.efficiency}%\nStatus,${daily.status}\nCompletion %,${daily.completionPercentage}%`;
        }

      case 'excel':
        // Return structured data for Excel export
        return summary;

      default:
        throw new OvertimeCalculatorError(`Unsupported export format: ${format}`, 'exportData');
    }
  }
}

// Export singleton instance
export const overtimeCalculator = new OvertimeCalculator();

// Export the class for testing
