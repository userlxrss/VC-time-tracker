/**
 * Validation functions for time entries and other data
 */

import { TimeEntry, Break, User, UserPreferences } from '../types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Base validator class
 */
abstract class Validator<T> {
  abstract validate(data: T): ValidationResult;

  protected addError(errors: string[], message: string): void {
    errors.push(message);
  }

  protected addWarning(warnings: string[], message: string): void {
    warnings.push(message);
  }

  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  }

  protected isValidCurrencyCode(code: string): boolean {
    // Common currency codes (simplified list)
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'];
    return validCurrencies.includes(code.toUpperCase());
  }
}

/**
 * User data validator
 */
export class UserValidator extends Validator<User> {
  validate(user: User): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!user.id || user.id.trim() === '') {
      this.addError(errors, 'User ID is required');
    }

    if (!user.name || user.name.trim() === '') {
      this.addError(errors, 'Name is required');
    } else if (user.name.length < 2) {
      this.addError(errors, 'Name must be at least 2 characters long');
    } else if (user.name.length > 100) {
      this.addError(errors, 'Name cannot exceed 100 characters');
    }

    if (!user.email || user.email.trim() === '') {
      this.addError(errors, 'Email is required');
    } else if (!this.isValidEmail(user.email)) {
      this.addError(errors, 'Invalid email format');
    }

    // Optional fields validation
    if (user.hourlyRate !== undefined) {
      if (typeof user.hourlyRate !== 'number') {
        this.addError(errors, 'Hourly rate must be a number');
      } else if (user.hourlyRate < 0) {
        this.addError(errors, 'Hourly rate cannot be negative');
      } else if (user.hourlyRate > 10000) {
        this.addWarning(warnings, 'Hourly rate seems unusually high');
      }
    }

    if (user.currency && !this.isValidCurrencyCode(user.currency)) {
      this.addWarning(warnings, 'Currency code may not be valid');
    }

    // Date validation
    if (!(user.createdAt instanceof Date) || isNaN(user.createdAt.getTime())) {
      this.addError(errors, 'Invalid created date');
    }

    if (!(user.updatedAt instanceof Date) || isNaN(user.updatedAt.getTime())) {
      this.addError(errors, 'Invalid updated date');
    }

    if (user.createdAt && user.updatedAt && user.updatedAt < user.createdAt) {
      this.addError(errors, 'Updated date cannot be before created date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Time entry validator
 */
export class TimeEntryValidator extends Validator<TimeEntry> {
  validate(timeEntry: TimeEntry): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!timeEntry.id || timeEntry.id.trim() === '') {
      this.addError(errors, 'Time entry ID is required');
    }

    if (!timeEntry.userId || timeEntry.userId.trim() === '') {
      this.addError(errors, 'User ID is required');
    }

    if (!timeEntry.clockIn || !(timeEntry.clockIn instanceof Date) || isNaN(timeEntry.clockIn.getTime())) {
      this.addError(errors, 'Valid clock-in time is required');
    }

    // Clock-out validation
    if (timeEntry.clockOut) {
      if (!(timeEntry.clockOut instanceof Date) || isNaN(timeEntry.clockOut.getTime())) {
        this.addError(errors, 'Invalid clock-out time');
      } else if (timeEntry.clockOut <= timeEntry.clockIn) {
        this.addError(errors, 'Clock-out time must be after clock-in time');
      } else {
        // Check for reasonable work hours
        const durationMs = timeEntry.clockOut.getTime() - timeEntry.clockIn.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours > 24) {
          this.addWarning(warnings, 'Time entry exceeds 24 hours - may be an error');
        } else if (durationHours > 16) {
          this.addWarning(warnings, 'Very long work day - please verify accuracy');
        } else if (durationHours < 0.25) {
          this.addWarning(warnings, 'Time entry is very short - may be incomplete');
        }
      }
    }

    // Duration validation
    if (timeEntry.duration !== undefined) {
      if (typeof timeEntry.duration !== 'number' || timeEntry.duration < 0) {
        this.addError(errors, 'Duration must be a non-negative number');
      } else if (timeEntry.clockOut) {
        // Check if duration matches clock-in/clock-out times
        const calculatedDuration = Math.round((timeEntry.clockOut.getTime() - timeEntry.clockIn.getTime()) / (1000 * 60));
        if (Math.abs(calculatedDuration - timeEntry.duration) > 5) { // Allow 5 minute tolerance
          this.addWarning(warnings, 'Duration does not match clock-in/clock-out times');
        }
      }
    }

    // Break duration validation
    if (timeEntry.totalBreakDuration !== undefined) {
      if (typeof timeEntry.totalBreakDuration !== 'number' || timeEntry.totalBreakDuration < 0) {
        this.addError(errors, 'Total break duration must be a non-negative number');
      } else if (timeEntry.duration && timeEntry.totalBreakDuration > timeEntry.duration) {
        this.addError(errors, 'Break duration cannot exceed total work duration');
      }
    }

    // String field length validation
    if (timeEntry.project && timeEntry.project.length > 100) {
      this.addError(errors, 'Project name cannot exceed 100 characters');
    }

    if (timeEntry.task && timeEntry.task.length > 100) {
      this.addError(errors, 'Task name cannot exceed 100 characters');
    }

    if (timeEntry.notes && timeEntry.notes.length > 1000) {
      this.addError(errors, 'Notes cannot exceed 1000 characters');
    }

    // Date validation
    if (!(timeEntry.createdAt instanceof Date) || isNaN(timeEntry.createdAt.getTime())) {
      this.addError(errors, 'Invalid created date');
    }

    if (!(timeEntry.updatedAt instanceof Date) || isNaN(timeEntry.updatedAt.getTime())) {
      this.addError(errors, 'Invalid updated date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate time overlap with existing entries
   */
  validateTimeOverlap(
    timeEntry: TimeEntry,
    existingEntries: TimeEntry[],
    excludeId?: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!timeEntry.clockIn || !timeEntry.clockOut) {
      return { isValid: false, errors: ['Clock-in and clock-out times are required for overlap validation'], warnings };
    }

    const overlappingEntries = existingEntries.filter(entry => {
      if (entry.id === timeEntry.id || entry.id === excludeId) return false;
      if (!entry.clockOut) return false;

      return (
        (timeEntry.clockIn < entry.clockOut && timeEntry.clockOut > entry.clockIn)
      );
    });

    if (overlappingEntries.length > 0) {
      this.addError(errors, 'Time entry overlaps with existing time entries');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Break validator
 */
export class BreakValidator extends Validator<Break> {
  validate(break: Break): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!break.id || break.id.trim() === '') {
      this.addError(errors, 'Break ID is required');
    }

    if (!break.timeEntryId || break.timeEntryId.trim() === '') {
      this.addError(errors, 'Time entry ID is required');
    }

    if (!break.startTime || !(break.startTime instanceof Date) || isNaN(break.startTime.getTime())) {
      this.addError(errors, 'Valid break start time is required');
    }

    // End time validation
    if (break.endTime) {
      if (!(break.endTime instanceof Date) || isNaN(break.endTime.getTime())) {
        this.addError(errors, 'Invalid break end time');
      } else if (break.endTime <= break.startTime) {
        this.addError(errors, 'Break end time must be after start time');
      } else {
        // Check for reasonable break duration
        const durationMs = break.endTime.getTime() - break.startTime.getTime();
        const durationMinutes = durationMs / (1000 * 60);

        if (durationMinutes > 240) { // 4 hours
          this.addWarning(warnings, 'Break is very long - may be an error');
        } else if (durationMinutes < 5) {
          this.addWarning(warnings, 'Break is very short - may not be worth recording');
        }
      }
    }

    // Duration validation
    if (break.duration !== undefined) {
      if (typeof break.duration !== 'number' || break.duration < 0) {
        this.addError(errors, 'Break duration must be a non-negative number');
      } else if (break.endTime) {
        // Check if duration matches start/end times
        const calculatedDuration = Math.round((break.endTime.getTime() - break.startTime.getTime()) / (1000 * 60));
        if (Math.abs(calculatedDuration - break.duration) > 2) { // Allow 2 minute tolerance
          this.addWarning(warnings, 'Break duration does not match start/end times');
        }
      }
    }

    // Break type validation
    const validTypes = ['lunch', 'coffee', 'meeting', 'other'];
    if (!validTypes.includes(break.type)) {
      this.addError(errors, 'Invalid break type');
    }

    // Notes validation
    if (break.notes && break.notes.length > 500) {
      this.addError(errors, 'Break notes cannot exceed 500 characters');
    }

    // Date validation
    if (!(break.createdAt instanceof Date) || isNaN(break.createdAt.getTime())) {
      this.addError(errors, 'Invalid created date');
    }

    if (!(break.updatedAt instanceof Date) || isNaN(break.updatedAt.getTime())) {
      this.addError(errors, 'Invalid updated date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * User preferences validator
 */
export class UserPreferencesValidator extends Validator<UserPreferences> {
  validate(preferences: UserPreferences): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!preferences.userId || preferences.userId.trim() === '') {
      this.addError(errors, 'User ID is required');
    }

    // Currency validation
    if (!this.isValidCurrencyCode(preferences.currency)) {
      this.addError(errors, 'Invalid currency code');
    }

    // Hourly rate validation
    if (typeof preferences.hourlyRate !== 'number' || preferences.hourlyRate < 0) {
      this.addError(errors, 'Hourly rate must be a non-negative number');
    } else if (preferences.hourlyRate > 10000) {
      this.addWarning(warnings, 'Hourly rate seems unusually high');
    }

    // Working days validation
    if (!Array.isArray(preferences.workingDays) || preferences.workingDays.length === 0) {
      this.addError(errors, 'Working days must be a non-empty array');
    } else if (preferences.workingDays.some(day => day < 0 || day > 6)) {
      this.addError(errors, 'Working days must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Working hours validation
    if (!preferences.workingHours) {
      this.addError(errors, 'Working hours are required');
    } else {
      if (!this.isValidTime(preferences.workingHours.start)) {
        this.addError(errors, 'Invalid working start time format (use HH:MM)');
      }

      if (!this.isValidTime(preferences.workingHours.end)) {
        this.addError(errors, 'Invalid working end time format (use HH:MM)');
      }

      if (this.isValidTime(preferences.workingHours.start) &&
          this.isValidTime(preferences.workingHours.end)) {
        const startTime = this.timeToMinutes(preferences.workingHours.start);
        const endTime = this.timeToMinutes(preferences.workingHours.end);

        if (endTime <= startTime) {
          this.addError(errors, 'Working end time must be after start time');
        } else if (endTime - startTime > 16 * 60) { // More than 16 hours
          this.addWarning(warnings, 'Working day seems very long');
        } else if (endTime - startTime < 4 * 60) { // Less than 4 hours
          this.addWarning(warnings, 'Working day seems very short');
        }
      }
    }

    // Notification settings validation
    if (preferences.notifications.eyeCareInterval <= 0 || preferences.notifications.eyeCareInterval > 480) {
      this.addError(errors, 'Eye care interval must be between 1 and 480 minutes');
    }

    if (preferences.notifications.forgotClockOutDelay <= 0 || preferences.notifications.forgotClockOutDelay > 1440) {
      this.addError(errors, 'Forgot clock out delay must be between 1 and 1440 minutes');
    }

    // Appearance validation
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(preferences.appearance.theme)) {
      this.addError(errors, 'Invalid theme preference');
    }

    const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
    if (!validDateFormats.includes(preferences.appearance.dateFormat)) {
      this.addError(errors, 'Invalid date format preference');
    }

    const validTimeFormats = ['12h', '24h'];
    if (!validTimeFormats.includes(preferences.appearance.timeFormat)) {
      this.addError(errors, 'Invalid time format preference');
    }

    // Date validation
    if (!(preferences.createdAt instanceof Date) || isNaN(preferences.createdAt.getTime())) {
      this.addError(errors, 'Invalid created date');
    }

    if (!(preferences.updatedAt instanceof Date) || isNaN(preferences.updatedAt.getTime())) {
      this.addError(errors, 'Invalid updated date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

/**
 * Validation utility functions
 */
export class ValidationUtils {
  private static userValidator = new UserValidator();
  private static timeEntryValidator = new TimeEntryValidator();
  private static breakValidator = new BreakValidator();
  private static preferencesValidator = new UserPreferencesValidator();

  static validateUser(user: User): ValidationResult {
    return this.userValidator.validate(user);
  }

  static validateTimeEntry(timeEntry: TimeEntry, existingEntries: TimeEntry[] = []): ValidationResult {
    const result = this.timeEntryValidator.validate(timeEntry);
    const overlapResult = this.timeEntryValidator.validateTimeOverlap(timeEntry, existingEntries);

    return {
      isValid: result.isValid && overlapResult.isValid,
      errors: [...result.errors, ...overlapResult.errors],
      warnings: [...result.warnings, ...overlapResult.warnings]
    };
  }

  static validateBreak(break: Break): ValidationResult {
    return this.breakValidator.validate(break);
  }

  static validateUserPreferences(preferences: UserPreferences): ValidationResult {
    return this.preferencesValidator.validate(preferences);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate time format (HH:MM)
   */
  static isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  }

  /**
   * Validate project name
   */
  static validateProjectName(name: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!name || name.trim() === '') {
      this.addError(errors, 'Project name is required');
    } else {
      if (name.length < 2) {
        this.addError(errors, 'Project name must be at least 2 characters long');
      } else if (name.length > 100) {
        this.addError(errors, 'Project name cannot exceed 100 characters');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate task name
   */
  static validateTaskName(name: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!name || name.trim() === '') {
      this.addError(errors, 'Task name is required');
    } else {
      if (name.length < 2) {
        this.addError(errors, 'Task name must be at least 2 characters long');
      } else if (name.length > 100) {
        this.addError(errors, 'Task name cannot exceed 100 characters');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private static addError(errors: string[], message: string): void {
    errors.push(message);
  }

  private static addWarning(warnings: string[], message: string): void {
    warnings.push(message);
  }
}

/**
 * Create a time entry with validation
 */
export function createValidatedTimeEntry(data: Partial<TimeEntry>): {
  timeEntry?: TimeEntry;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Generate required fields if missing
  const timeEntry: TimeEntry = {
    id: data.id || Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
    userId: data.userId || '',
    clockIn: data.clockIn || new Date(),
    clockOut: data.clockOut,
    duration: data.duration,
    totalBreakDuration: data.totalBreakDuration || 0,
    project: data.project,
    task: data.task,
    notes: data.notes,
    isAutomaticClockOut: data.isAutomaticClockOut || false,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date()
  };

  const validation = ValidationUtils.validateTimeEntry(timeEntry);

  return {
    timeEntry: validation.isValid ? timeEntry : undefined,
    errors: [...errors, ...validation.errors],
    warnings: [...warnings, ...validation.warnings]
  };
}