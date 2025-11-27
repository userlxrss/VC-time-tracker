/**
 * Validation Schemas for HR Time Tracker
 *
 * Comprehensive validation rules for all data entities with detailed
 * error messages and business logic constraints.
 */

import { ValidationSchema } from '../errors/errorHandler';
import {
  User,
  TimeEntry,
  BreakPeriod,
  LeaveRequest,
  SalaryRecord,
  UserRole,
  EmploymentStatus,
  TimeEntryStatus,
  LeaveType,
  LeaveStatus,
  PaymentStatus,
  NotificationType,
  NotificationPriority
} from '../../database-schema';

// ==================== COMMON VALIDATION RULES ====================

/**
 * Email validation
 */
const emailRule = {
  validate: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Invalid email format';
  }
};

/**
 * Phone number validation (Philippines)
 */
const phoneRule = {
  validate: (value: string) => {
    const phoneRegex = /^(\+63|0)[0-9]{10}$/;
    return !value || phoneRegex.test(value) || 'Invalid Philippine phone number format';
  }
};

/**
 * Employee ID validation
 */
const employeeIdRule = {
  validate: (value: string) => {
    const idRegex = /^[A-Z0-9-]+$/;
    return idRegex.test(value) || 'Employee ID must contain only uppercase letters, numbers, and hyphens';
  }
};

/**
 * Date validation (not in future for most cases)
 */
const notFutureRule = {
  validate: (value: Date) => {
    const now = new Date();
    const maxFuture = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes allowance
    return value <= maxFuture || 'Date cannot be more than 5 minutes in the future';
  }
};

/**
 * Positive number validation
 */
const positiveNumberRule = {
  validate: (value: number) => value > 0 || 'Value must be positive'
};

/**
 * Non-negative number validation
 */
const nonNegativeNumberRule = {
  validate: (value: number) => value >= 0 || 'Value cannot be negative'
};

/**
 * String length validation
 */
const lengthRule = (min: number, max: number) => ({
  validate: (value: string) => {
    if (value.length < min) return `Must be at least ${min} characters`;
    if (value.length > max) return `Must be no more than ${max} characters`;
    return true;
  }
});

/**
 * Array size validation
 */
const arraySizeRule = (min: number = 0, max?: number) => ({
  validate: (value: any[]) => {
    if (value.length < min) return `Must have at least ${min} items`;
    if (max && value.length > max) return `Must have no more than ${max} items`;
    return true;
  }
});

// ==================== USER VALIDATION SCHEMA ====================

export const userValidationSchema: ValidationSchema = {
  employeeId: {
    required: true,
    validate: (value: string) => {
      if (!value) return 'Employee ID is required';
      if (value.length < 3) return 'Employee ID must be at least 3 characters';
      if (value.length > 20) return 'Employee ID must be no more than 20 characters';
      return employeeIdRule.validate(value);
    }
  },

  firstName: {
    required: true,
    validate: (value: string) => {
      if (!value) return 'First name is required';
      if (value.length < 2) return 'First name must be at least 2 characters';
      if (value.length > 50) return 'First name must be no more than 50 characters';
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      return nameRegex.test(value) || 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }
  },

  lastName: {
    required: true,
    validate: (value: string) => {
      if (!value) return 'Last name is required';
      if (value.length < 2) return 'Last name must be at least 2 characters';
      if (value.length > 50) return 'Last name must be no more than 50 characters';
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      return nameRegex.test(value) || 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }
  },

  email: {
    required: true,
    validate: (value: string) => {
      if (!value) return 'Email is required';
      return emailRule.validate(value);
    }
  },

  phoneNumber: {
    required: false,
    validate: (value: string) => phoneRule.validate(value)
  },

  role: {
    required: true,
    validate: (value: UserRole) => {
      if (!value) return 'Role is required';
      return Object.values(UserRole).includes(value) || 'Invalid user role';
    }
  },

  employmentStatus: {
    required: true,
    validate: (value: EmploymentStatus) => {
      if (!value) return 'Employment status is required';
      return Object.values(EmploymentStatus).includes(value) || 'Invalid employment status';
    }
  },

  department: {
    required: true,
    validate: lengthRule(2, 100)
  },

  position: {
    required: true,
    validate: lengthRule(2, 100)
  },

  hireDate: {
    required: true,
    validate: (value: Date) => {
      if (!value) return 'Hire date is required';
      if (isNaN(value.getTime())) return 'Invalid hire date';
      return true;
    }
  },

  preferredWorkingHours: {
    required: true,
    validate: (value: any) => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        const hours = value[day];
        if (typeof hours !== 'number' || hours < 0 || hours > 24) {
          return `${day} hours must be a number between 0 and 24`;
        }
      }
      return true;
    }
  },

  canWorkFromHome: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  flexibleSchedule: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  timeZone: {
    required: true,
    validate: (value: string) => value === 'Asia/Manila' || 'Time zone must be Asia/Manila'
  },

  isActive: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  isFreelancer: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  hourlyRate: {
    required: false,
    validate: (value: number) => {
      if (value !== undefined) {
        if (value < 0) return 'Hourly rate cannot be negative';
        if (value > 10000) return 'Hourly rate seems unusually high';
      }
      return true;
    }
  }
};

// ==================== TIME ENTRY VALIDATION SCHEMA ====================

export const timeEntryValidationSchema: ValidationSchema = {
  userId: {
    required: true,
    validate: (value: string) => {
      if (!value) return 'User ID is required';
      return typeof value === 'string' && value.length > 0 || 'Invalid user ID';
    }
  },

  clockIn: {
    required: true,
    validate: (value: Date) => {
      if (!value) return 'Clock in time is required';
      if (isNaN(value.getTime())) return 'Invalid clock in time';
      return notFutureRule.validate(value);
    }
  },

  clockOut: {
    required: false,
    validate: (value: Date, data: any) => {
      if (!value) return true;
      if (isNaN(value.getTime())) return 'Invalid clock out time';
      if (data.clockIn && value <= data.clockIn) return 'Clock out time must be after clock in time';

      // Check maximum duration (24 hours)
      if (data.clockIn) {
        const duration = (value.getTime() - data.clockIn.getTime()) / (1000 * 60 * 60);
        if (duration > 24) return 'Duration cannot exceed 24 hours';
      }

      return true;
    }
  },

  breaks: {
    required: true,
    validate: arraySizeRule(0, 10)
  },

  status: {
    required: true,
    validate: (value: TimeEntryStatus) => {
      if (!value) return 'Status is required';
      return Object.values(TimeEntryStatus).includes(value) || 'Invalid status';
    }
  },

  notes: {
    required: false,
    validate: lengthRule(0, 500)
  },

  totalHours: {
    required: false,
    validate: nonNegativeNumberRule
  },

  regularHours: {
    required: false,
    validate: nonNegativeNumberRule
  },

  overtimeHours: {
    required: false,
    validate: nonNegativeNumberRule
  }
};

// ==================== BREAK PERIOD VALIDATION SCHEMA ====================

export const breakPeriodValidationSchema: ValidationSchema = {
  id: {
    required: true,
    validate: (value: string) => value && value.length > 0 || 'Break ID is required'
  },

  type: {
    required: true,
    validate: (value: string) => {
      if (!value) return 'Break type is required';
      const validTypes = ['lunch', 'short_break', 'extended_break'];
      return validTypes.includes(value) || 'Invalid break type';
    }
  },

  startTime: {
    required: true,
    validate: (value: Date) => {
      if (!value) return 'Start time is required';
      return !isNaN(value.getTime()) || 'Invalid start time';
    }
  },

  endTime: {
    required: false,
    validate: (value: Date, data: any) => {
      if (!value) return true;
      if (isNaN(value.getTime())) return 'Invalid end time';
      if (data.startTime && value <= data.startTime) return 'End time must be after start time';
      return true;
    }
  },

  duration: {
    required: false,
    validate: (value: number) => {
      if (value !== undefined) {
        if (typeof value !== 'number') return 'Duration must be a number';
        if (value < 0) return 'Duration cannot be negative';
        if (value > 480) return 'Duration cannot exceed 8 hours';
      }
      return true;
    }
  },

  isPaid: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  }
};

// ==================== LEAVE REQUEST VALIDATION SCHEMA ====================

export const leaveRequestValidationSchema: ValidationSchema = {
  userId: {
    required: true,
    validate: (value: string) => value && value.length > 0 || 'User ID is required'
  },

  type: {
    required: true,
    validate: (value: LeaveType) => {
      if (!value) return 'Leave type is required';
      return Object.values(LeaveType).includes(value) || 'Invalid leave type';
    }
  },

  startDate: {
    required: true,
    validate: (value: Date) => {
      if (!value) return 'Start date is required';
      if (isNaN(value.getTime())) return 'Invalid start date';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) return 'Start date cannot be in the past';
      return true;
    }
  },

  endDate: {
    required: true,
    validate: (value: Date, data: any) => {
      if (!value) return 'End date is required';
      if (isNaN(value.getTime())) return 'Invalid end date';
      if (data.startDate && value < data.startDate) return 'End date must be after or same as start date';

      // Check maximum duration (1 year)
      if (data.startDate) {
        const maxEnd = new Date(data.startDate);
        maxEnd.setFullYear(maxEnd.getFullYear() + 1);
        if (value > maxEnd) return 'Leave duration cannot exceed 1 year';
      }

      return true;
    }
  },

  totalDays: {
    required: true,
    validate: (value: number) => {
      if (typeof value !== 'number') return 'Total days must be a number';
      if (value < 0.5) return 'Minimum leave duration is 0.5 days';
      if (value > 365) return 'Maximum leave duration is 365 days';
      return true;
    }
  },

  reason: {
    required: true,
    validate: lengthRule(10, 1000)
  },

  attachments: {
    required: false,
    validate: arraySizeRule(0, 10)
  },

  status: {
    required: true,
    validate: (value: LeaveStatus) => {
      if (!value) return 'Status is required';
      return Object.values(LeaveStatus).includes(value) || 'Invalid status';
    }
  },

  usePaidLeave: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  deductedFromBalance: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  isEmergency: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  }
};

// ==================== SALARY RECORD VALIDATION SCHEMA ====================

export const salaryRecordValidationSchema: ValidationSchema = {
  userId: {
    required: true,
    validate: (value: string) => value && value.length > 0 || 'User ID is required'
  },

  payPeriodStart: {
    required: true,
    validate: (value: Date) => {
      if (!value) return 'Pay period start is required';
      return !isNaN(value.getTime()) || 'Invalid pay period start date';
    }
  },

  payPeriodEnd: {
    required: true,
    validate: (value: Date, data: any) => {
      if (!value) return 'Pay period end is required';
      if (isNaN(value.getTime())) return 'Invalid pay period end date';
      if (data.payPeriodStart && value <= data.payPeriodStart) return 'Pay period end must be after start';
      return true;
    }
  },

  totalRegularHours: {
    required: true,
    validate: (value: number) => {
      if (typeof value !== 'number') return 'Total regular hours must be a number';
      if (value < 0) return 'Total regular hours cannot be negative';
      if (value > 200) return 'Total regular hours seem unusually high';
      return true;
    }
  },

  totalOvertimeHours: {
    required: true,
    validate: (value: number) => {
      if (typeof value !== 'number') return 'Total overtime hours must be a number';
      if (value < 0) return 'Total overtime hours cannot be negative';
      if (value > 100) return 'Total overtime hours seem unusually high';
      return true;
    }
  },

  hourlyRate: {
    required: true,
    validate: (value: number) => {
      if (typeof value !== 'number') return 'Hourly rate must be a number';
      if (value <= 0) return 'Hourly rate must be positive';
      if (value > 10000) return 'Hourly rate seems unusually high';
      return true;
    }
  },

  grossAmount: {
    required: true,
    validate: positiveNumberRule
  },

  overtimeRate: {
    required: true,
    validate: (value: number) => {
      if (typeof value !== 'number') return 'Overtime rate must be a number';
      if (value <= 0) return 'Overtime rate must be positive';
      if (value > 3) return 'Overtime rate seems unusually high';
      return true;
    }
  },

  overtimeAmount: {
    required: true,
    validate: nonNegativeNumberRule
  },

  totalAmount: {
    required: true,
    validate: positiveNumberRule
  },

  status: {
    required: true,
    validate: (value: PaymentStatus) => {
      if (!value) return 'Status is required';
      return Object.values(PaymentStatus).includes(value) || 'Invalid status';
    }
  },

  notes: {
    required: false,
    validate: lengthRule(0, 1000)
  }
};

// ==================== NOTIFICATION VALIDATION SCHEMA ====================

export const notificationValidationSchema: ValidationSchema = {
  userId: {
    required: true,
    validate: (value: string) => value && value.length > 0 || 'User ID is required'
  },

  title: {
    required: true,
    validate: lengthRule(1, 200)
  },

  message: {
    required: true,
    validate: lengthRule(1, 1000)
  },

  type: {
    required: true,
    validate: (value: NotificationType) => {
      if (!value) return 'Type is required';
      return Object.values(NotificationType).includes(value) || 'Invalid notification type';
    }
  },

  priority: {
    required: true,
    validate: (value: NotificationPriority) => {
      if (!value) return 'Priority is required';
      return Object.values(NotificationPriority).includes(value) || 'Invalid priority';
    }
  },

  actionUrl: {
    required: false,
    validate: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return 'Invalid URL format';
      }
    }
  },

  actionText: {
    required: false,
    validate: lengthRule(0, 100)
  },

  channel: {
    required: true,
    validate: (value: string) => {
      const validChannels = ['toast', 'inbox', 'email', 'push'];
      return validChannels.includes(value) || 'Invalid channel';
    }
  },

  isRead: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  },

  requiresSync: {
    required: true,
    validate: (value: boolean) => typeof value === 'boolean' || 'Must be a boolean value'
  }
};

// ==================== BUSINESS LOGIC VALIDATIONS ====================

/**
 * Validate that user can clock in (not already clocked in)
 */
export const validateCanClockIn = (activeEntries: TimeEntry[]) => {
  const activeEntry = activeEntries.find(entry => entry.status === TimeEntryStatus.ACTIVE);
  return !activeEntry || 'You are already clocked in';
};

/**
 * Validate that user can clock out (has active entry)
 */
export const validateCanClockOut = (activeEntries: TimeEntry[]) => {
  const activeEntry = activeEntries.find(entry => entry.status === TimeEntryStatus.ACTIVE);
  return activeEntry || 'You are not currently clocked in';
};

/**
 * Validate that break can be started (user is clocked in and not on break)
 */
export const validateCanStartBreak = (activeEntry: TimeEntry | null, existingBreaks: BreakPeriod[]) => {
  if (!activeEntry) return 'You must be clocked in to take a break';

  const activeBreaks = existingBreaks.filter(b => !b.endTime);
  if (activeBreaks.length > 0) return 'You are already on a break';

  return true;
};

/**
 * Validate that break can be ended (has active break)
 */
export const validateCanEndBreak = (existingBreaks: BreakPeriod[]) => {
  const activeBreaks = existingBreaks.filter(b => !b.endTime);
  return activeBreaks.length > 0 || 'You are not currently on a break';
};

/**
 * Validate time entry duration
 */
export const validateTimeEntryDuration = (clockIn: Date, clockOut?: Date, breaks: BreakPeriod[] = []) => {
  if (!clockOut) return true;

  const totalDuration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
  const totalBreakTime = breaks.reduce((sum, b) => sum + (b.duration || 0), 0) / 60;
  const workTime = totalDuration - totalBreakTime;

  if (workTime < 0) return 'Work time cannot be negative';
  if (workTime > 24) return 'Work time cannot exceed 24 hours';
  if (totalBreakTime > totalDuration) return 'Break time cannot exceed total duration';

  return true;
};

// ==================== CROSS-FIELD VALIDATIONS ====================

/**
 * Validate leave request against available balance
 */
export const validateLeaveBalance = (totalDays: number, availableBalance: number, usePaidLeave: boolean) => {
  if (!usePaidLeave) return true;
  return totalDays <= availableBalance || `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${totalDays} days`;
};

/**
 * Validate salary record calculations
 */
export const validateSalaryCalculations = (
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  overtimeRate: number,
  grossAmount: number,
  overtimeAmount: number,
  totalAmount: number
) => {
  const expectedGross = regularHours * hourlyRate;
  const expectedOvertime = overtimeHours * hourlyRate * overtimeRate;
  const expectedTotal = expectedGross + expectedOvertime;

  if (Math.abs(grossAmount - expectedGross) > 0.01) {
    return 'Gross amount calculation is incorrect';
  }

  if (Math.abs(overtimeAmount - expectedOvertime) > 0.01) {
    return 'Overtime amount calculation is incorrect';
  }

  if (Math.abs(totalAmount - expectedTotal) > 0.01) {
    return 'Total amount calculation is incorrect';
  }

  return true;
};

// Export all schemas for registration
export const validationSchemas = {
  user: userValidationSchema,
  timeEntry: timeEntryValidationSchema,
  breakPeriod: breakPeriodValidationSchema,
  leaveRequest: leaveRequestValidationSchema,
  salaryRecord: salaryRecordValidationSchema,
  notification: notificationValidationSchema
};