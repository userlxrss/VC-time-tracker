/**
 * Break Management System
 *
 * Comprehensive break tracking for lunch periods and short breaks
 * with automatic duration calculation and validation.
 */

import { BreakPeriod, TimeEntryStatus } from '../../database-schema';
import { manilaTime } from '../utils/manilaTime';

/**
 * Break type configuration
 */
export interface BreakTypeConfig {
  type: 'lunch' | 'short_break' | 'extended_break';
  name: string;
  defaultDuration: number; // in minutes
  isPaid: boolean;
  maxDuration?: number; // maximum allowed duration in minutes
  minimumDuration?: number; // minimum duration in minutes
  maxPerDay?: number; // maximum number of this break type per day
  description: string;
  icon: string;
  color: string;
}

/**
 * Break statistics and analytics
 */
export interface BreakStatistics {
  totalBreaks: number;
  totalBreakTime: number; // in minutes
  paidBreakTime: number; // in minutes
  unpaidBreakTime: number; // in minutes
  averageBreakDuration: number; // in minutes
  longestBreak: BreakPeriod | null;
  shortestBreak: BreakPeriod | null;
  breakEfficiency: number; // percentage of work time vs break time
}

/**
 * Break validation result
 */
export interface BreakValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedDuration?: number;
}

/**
 * Custom error for break management operations
 */
class BreakError extends Error {
  constructor(message: string, public operation: string, public breakId?: string) {
    super(message);
    this.name = 'BreakError';
  }
}

/**
 * Break Manager implementation
 */
export class BreakManager {
  private readonly BREAK_TYPES: Record<string, BreakTypeConfig> = {
    lunch: {
      type: 'lunch',
      name: 'Lunch Break',
      defaultDuration: 60, // 1 hour
      isPaid: false,
      maxDuration: 120, // 2 hours max
      minimumDuration: 30, // 30 minutes min
      maxPerDay: 1, // Only one lunch break per day
      description: 'Unpaid lunch break (typically 1 hour)',
      icon: '🍽️',
      color: '#FF6B6B'
    },
    short_break: {
      type: 'short_break',
      name: 'Short Break',
      defaultDuration: 15, // 15 minutes
      isPaid: true,
      maxDuration: 30, // 30 minutes max
      minimumDuration: 5, // 5 minutes min
      maxPerDay: 6, // Maximum 6 short breaks per day
      description: 'Paid short break for rest and refreshment',
      icon: '☕',
      color: '#4ECDC4'
    },
    extended_break: {
      type: 'extended_break',
      name: 'Extended Break',
      defaultDuration: 45, // 45 minutes
      isPaid: false,
      maxDuration: 90, // 90 minutes max
      minimumDuration: 30, // 30 minutes min
      maxPerDay: 2, // Maximum 2 extended breaks per day
      description: 'Extended unpaid break for personal matters',
      icon: '⏰',
      color: '#95E1D3'
    }
  };

  /**
   * Generate unique break ID
   */
  private generateBreakId(): string {
    return `break_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get break type configuration
   */
  getBreakTypeConfig(type: BreakPeriod['type']): BreakTypeConfig | null {
    return this.BREAK_TYPES[type] || null;
  }

  /**
   * Get all available break types
   */
  getAllBreakTypes(): BreakTypeConfig[] {
    return Object.values(this.BREAK_TYPES);
  }

  /**
   * Start a new break period
   */
  startBreak(
    type: BreakPeriod['type'],
    customDuration?: number
  ): BreakPeriod {
    const config = this.getBreakTypeConfig(type);
    if (!config) {
      throw new BreakError(`Invalid break type: ${type}`, 'startBreak');
    }

    const breakId = this.generateBreakId();
    const now = manilaTime.now();

    return {
      id: breakId,
      type,
      startTime: now,
      isPaid: config.isPaid,
      duration: customDuration
    };
  }

  /**
   * End an active break period
   */
  endBreak(breakPeriod: BreakPeriod, endTime?: Date): BreakPeriod {
    if (!breakPeriod.startTime) {
      throw new BreakError('Break has no start time', 'endBreak', breakPeriod.id);
    }

    if (breakPeriod.endTime) {
      throw new BreakError('Break already ended', 'endBreak', breakPeriod.id);
    }

    const end = endTime || manilaTime.now();
    const duration = manilaTime.calculateBreakDuration(breakPeriod.startTime, end);

    const updatedBreak: BreakPeriod = {
      ...breakPeriod,
      endTime: end,
      duration: Math.round(duration * 60) // Convert to minutes
    };

    return updatedBreak;
  }

  /**
   * Validate break period
   */
  validateBreak(
    breakPeriod: BreakPeriod,
    existingBreaks: BreakPeriod[] = [],
    workDayStart: Date = manilaTime.startOfDay(manilaTime.now())
  ): BreakValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config = this.getBreakTypeConfig(breakPeriod.type);

    if (!config) {
      return {
        isValid: false,
        errors: [`Invalid break type: ${breakPeriod.type}`],
        warnings: []
      };
    }

    // Validate break ID
    if (!breakPeriod.id || breakPeriod.id.trim().length === 0) {
      errors.push('Break ID is required');
    }

    // Validate start time
    if (!breakPeriod.startTime) {
      errors.push('Break start time is required');
    }

    // Validate end time if present
    if (breakPeriod.endTime && breakPeriod.startTime) {
      if (breakPeriod.endTime <= breakPeriod.startTime) {
        errors.push('Break end time must be after start time');
      }

      const duration = manilaTime.calculateBreakDuration(breakPeriod.startTime, breakPeriod.endTime);
      const durationMinutes = Math.round(duration * 60);

      // Check minimum duration
      if (config.minimumDuration && durationMinutes < config.minimumDuration) {
        warnings.push(`Break is shorter than recommended minimum of ${config.minimumDuration} minutes`);
      }

      // Check maximum duration
      if (config.maxDuration && durationMinutes > config.maxDuration) {
        errors.push(`Break exceeds maximum duration of ${config.maxDuration} minutes`);
      }

      // Check if break is too long for the time of day
      if (breakPeriod.type === 'lunch' && !manilaTime.isLunchTime(breakPeriod.startTime)) {
        warnings.push('Lunch break is outside typical lunch hours (12:00 PM - 1:00 PM)');
      }
    }

    // Check daily limits
    if (config.maxPerDay) {
      const todayBreaks = existingBreaks.filter(b =>
        b.type === breakPeriod.type &&
        manilaTime.isToday(b.startTime) &&
        b.id !== breakPeriod.id
      );

      if (todayBreaks.length >= config.maxPerDay) {
        errors.push(`Maximum ${config.maxPerDay} ${config.name.toLowerCase()}${config.maxPerDay > 1 ? 's' : ''} allowed per day`);
      }
    }

    // Check for overlapping breaks
    if (breakPeriod.startTime) {
      const overlappingBreaks = existingBreaks.filter(b =>
        b.id !== breakPeriod.id &&
        b.startTime &&
        this.areBreaksOverlapping(breakPeriod, b)
      );

      if (overlappingBreaks.length > 0) {
        errors.push('Break overlaps with another break period');
      }
    }

    // Check if break is within reasonable work hours
    if (breakPeriod.startTime && !manilaTime.isWithinBusinessHours(breakPeriod.startTime)) {
      warnings.push('Break is outside typical business hours');
    }

    // Validate duration if set
    if (breakPeriod.duration !== undefined) {
      if (breakPeriod.duration <= 0) {
        errors.push('Break duration must be positive');
      }

      if (config.maxDuration && breakPeriod.duration > config.maxDuration) {
        errors.push(`Break duration exceeds maximum of ${config.maxDuration} minutes`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestedDuration: config.defaultDuration
    };
  }

  /**
   * Check if two break periods overlap
   */
  private areBreaksOverlapping(break1: BreakPeriod, break2: BreakPeriod): boolean {
    if (!break1.startTime || !break2.startTime) return false;

    const break1End = break1.endTime || manilaTime.now();
    const break2End = break2.endTime || manilaTime.now();

    return break1.startTime < break2End && break2.startTime < break1End;
  }

  /**
   * Calculate break statistics for a day
   */
  calculateBreakStatistics(
    breaks: BreakPeriod[],
    date: Date = manilaTime.now()
  ): BreakStatistics {
    const todayBreaks = breaks.filter(b => manilaTime.isToday(b.startTime));

    const completedBreaks = todayBreaks.filter(b => b.endTime);
    const totalBreaks = completedBreaks.length;

    if (totalBreaks === 0) {
      return {
        totalBreaks: 0,
        totalBreakTime: 0,
        paidBreakTime: 0,
        unpaidBreakTime: 0,
        averageBreakDuration: 0,
        longestBreak: null,
        shortestBreak: null,
        breakEfficiency: 100
      };
    }

    const totalBreakTime = completedBreaks.reduce((sum, b) => sum + (b.duration || 0), 0);
    const paidBreakTime = completedBreaks
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + (b.duration || 0), 0);
    const unpaidBreakTime = totalBreakTime - paidBreakTime;

    const averageBreakDuration = totalBreakTime / totalBreaks;

    const sortedBreaks = completedBreaks.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    const longestBreak = sortedBreaks[0] || null;
    const shortestBreak = sortedBreaks[sortedBreaks.length - 1] || null;

    // Calculate break efficiency (assuming 8-hour workday)
    const workMinutes = 8 * 60;
    const breakEfficiency = Math.max(0, ((workMinutes - unpaidBreakTime) / workMinutes) * 100);

    return {
      totalBreaks,
      totalBreakTime,
      paidBreakTime,
      unpaidBreakTime,
      averageBreakDuration,
      longestBreak,
      shortestBreak,
      breakEfficiency: Math.round(breakEfficiency * 100) / 100
    };
  }

  /**
   * Get currently active breaks
   */
  getActiveBreaks(breaks: BreakPeriod[]): BreakPeriod[] {
    return breaks.filter(b => b.startTime && !b.endTime);
  }

  /**
   * Check if user is currently on break
   */
  isOnBreak(breaks: BreakPeriod[]): boolean {
    return this.getActiveBreaks(breaks).length > 0;
  }

  /**
   * Get current break type if on break
   */
  getCurrentBreakType(breaks: BreakPeriod[]): BreakPeriod['type'] | null {
    const activeBreaks = this.getActiveBreaks(breaks);
    return activeBreaks.length > 0 ? activeBreaks[0].type : null;
  }

  /**
   * Get break duration for an active break
   */
  getActiveBreakDuration(breakPeriod: BreakPeriod): number {
    if (!breakPeriod.startTime || breakPeriod.endTime) {
      return 0;
    }

    return manilaTime.calculateBreakDuration(breakPeriod.startTime, manilaTime.now()) * 60; // Convert to minutes
  }

  /**
   * Auto-complete breaks that exceed maximum duration
   */
  autoCompleteBreaks(breaks: BreakPeriod[]): BreakPeriod[] {
    const now = manilaTime.now();
    const updatedBreaks = [...breaks];

    for (let i = 0; i < updatedBreaks.length; i++) {
      const breakPeriod = updatedBreaks[i];

      // Skip already completed breaks
      if (breakPeriod.endTime) continue;

      const config = this.getBreakTypeConfig(breakPeriod.type);
      if (!config?.maxDuration) continue;

      const currentDuration = this.getActiveBreakDuration(breakPeriod);

      if (currentDuration > config.maxDuration) {
        // Auto-complete the break at maximum duration
        const autoEndTime = new Date(breakPeriod.startTime.getTime() + (config.maxDuration * 60 * 1000));
        updatedBreaks[i] = this.endBreak(breakPeriod, autoEndTime);
      }
    }

    return updatedBreaks;
  }

  /**
   * Suggest optimal break times based on work patterns
   */
  suggestBreakTimes(
    workDayStart: Date,
    existingBreaks: BreakPeriod[] = []
  ): { lunch: Date | null; shortBreaks: Date[] } {
    const suggestions = {
      lunch: null as Date | null,
      shortBreaks: [] as Date[]
    };

    // Suggest lunch time (12:00 PM - 1:00 PM)
    const lunchStart = new Date(workDayStart);
    lunchStart.setHours(12, 0, 0, 0);

    // Check if lunch break already exists
    const existingLunch = existingBreaks.find(b => b.type === 'lunch' && manilaTime.isToday(b.startTime));
    if (!existingLunch) {
      suggestions.lunch = lunchStart;
    }

    // Suggest short breaks every 2 hours
    const breakInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const workDayEnd = new Date(workDayStart);
    workDayEnd.setHours(17, 0, 0, 0);

    let currentBreakTime = new Date(workDayStart.getTime() + (1.5 * 60 * 60 * 1000)); // First break after 1.5 hours

    while (currentBreakTime < workDayEnd) {
      // Check if break already exists at this time
      const existingAtTime = existingBreaks.find(b => {
        if (!b.startTime) return false;
        const diffMinutes = Math.abs(b.startTime.getTime() - currentBreakTime.getTime()) / (1000 * 60);
        return diffMinutes < 30; // Within 30 minutes
      });

      if (!existingAtTime && suggestions.shortBreaks.length < 4) {
        suggestions.shortBreaks.push(new Date(currentBreakTime));
      }

      currentBreakTime = new Date(currentBreakTime.getTime() + breakInterval);
    }

    return suggestions;
  }

  /**
   * Generate break report for analytics
   */
  generateBreakReport(
    breaks: BreakPeriod[],
    period: 'today' | 'week' | 'month' = 'today'
  ): {
    summary: BreakStatistics;
    breakDetails: Array<{
      break: BreakPeriod;
      config: BreakTypeConfig;
      duration: number;
      efficiency: number;
    }>;
    insights: string[];
  } {
    let filteredBreaks: BreakPeriod[];

    const now = manilaTime.now();

    switch (period) {
      case 'today':
        filteredBreaks = breaks.filter(b => manilaTime.isToday(b.startTime));
        break;
      case 'week':
        const weekStart = manilaTime.startOfWeek(now);
        const weekEnd = manilaTime.endOfWeek(now);
        filteredBreaks = breaks.filter(b => {
          if (!b.startTime) return false;
          return b.startTime >= weekStart && b.startTime <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = manilaTime.startOfMonth(now);
        const monthEnd = manilaTime.endOfMonth(now);
        filteredBreaks = breaks.filter(b => {
          if (!b.startTime) return false;
          return b.startTime >= monthStart && b.startTime <= monthEnd;
        });
        break;
    }

    const summary = this.calculateBreakStatistics(filteredBreaks);

    const breakDetails = filteredBreaks
      .filter(b => b.endTime)
      .map(b => {
        const config = this.getBreakTypeConfig(b.type)!;
        const duration = b.duration || 0;
        const efficiency = config.isPaid ? 100 : Math.max(0, 100 - (duration / 60) * 12.5); // Rough efficiency calculation

        return {
          break: b,
          config,
          duration,
          efficiency
        };
      })
      .sort((a, b) => b.break.startTime.getTime() - a.break.startTime.getTime());

    // Generate insights
    const insights: string[] = [];

    if (summary.totalBreaks === 0) {
      insights.push('No breaks taken - remember to take regular breaks for productivity!');
    } else {
      if (summary.averageBreakDuration < 15) {
        insights.push('Breaks are shorter than recommended - consider taking longer breaks for better rest');
      }

      if (summary.breakEfficiency < 85) {
        insights.push('High break ratio detected - consider optimizing break schedule');
      }

      if (summary.paidBreakTime > summary.unpaidBreakTime * 2) {
        insights.push('Good balance of paid and unpaid breaks');
      }
    }

    return {
      summary,
      breakDetails,
      insights
    };
  }

  /**
   * Export break data for reporting
   */
  exportBreakData(breaks: BreakPeriod[]): Array<{
    id: string;
    type: string;
    name: string;
    startTime: string;
    endTime?: string;
    duration: number;
    isPaid: boolean;
    date: string;
  }> {
    return breaks.map(b => {
      const config = this.getBreakTypeConfig(b.type);

      return {
        id: b.id,
        type: b.type,
        name: config?.name || b.type,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime?.toISOString(),
        duration: b.duration || 0,
        isPaid: b.isPaid,
        date: manilaTime.format(b.startTime, 'YYYY-MM-DD')
      };
    });
  }
}

// Export singleton instance
export const breakManager = new BreakManager();

