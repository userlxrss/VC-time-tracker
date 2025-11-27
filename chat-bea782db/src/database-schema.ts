/**
 * HR Time Tracker Database Schema
 *
 * Comprehensive TypeScript interfaces for a flexible work culture HR time tracker.
 * All timestamps are in Manila Time (Asia/Manila, UTC+8).
 *
 * Features:
 * - Role-based access control
 * - Flexible time tracking (total hours focus, not schedules)
 * - Freelancer payment structure (no deductions)
 * - Real-time notifications
 * - Cross-tab synchronization
 * - Production-ready scalability
 */

// ==================== ENUMS ====================

/**
 * User roles for access control
 */
export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
  FREELANCER = 'freelancer'
}

/**
 * Employment status types
 */
export enum EmploymentStatus {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERN = 'intern'
}

/**
 * Time entry status tracking
 */
export enum TimeEntryStatus {
  ACTIVE = 'active',           // Currently clocked in
  COMPLETED = 'completed',     // Normal completion with clock out
  PENDING = 'pending',         // Missing clock out, requires review
  OVERDUE = 'overdue',         // No clock out after 24 hours
  REJECTED = 'rejected',       // Manager rejected the entry
  APPROVED = 'approved'        // Manager approved the entry
}

/**
 * Leave request types
 */
export enum LeaveType {
  VACATION = 'vacation',
  SICK = 'sick',
  EMERGENCY = 'emergency',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
  WORK_FROM_HOME = 'work_from_home'
}

/**
 * Leave request status
 */
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

/**
 * Payment status for freelancers
 */
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

/**
 * Notification types
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TIME_REMINDER = 'time_reminder',
  LEAVE_UPDATE = 'leave_update',
  PAYMENT_UPDATE = 'payment_update'
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ==================== CORE INTERFACES ====================

/**
 * Base interface for all entities
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * User Schema with role-based access
 */
export interface User extends BaseEntity {
  /** Unique employee ID or identifier */
  employeeId: string;

  /** Basic user information */
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;

  /** Authentication */
  passwordHash: string;
  lastLoginAt?: Date;

  /** Employment details */
  role: UserRole;
  employmentStatus: EmploymentStatus;
  department: string;
  position: string;
  hireDate: Date;

  /** Reporting structure */
  managerId?: string;
  directReports: string[]; // Array of user IDs

  /** Work preferences */
  preferredWorkingHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };

  /** Flexible work settings */
  canWorkFromHome: boolean;
  flexibleSchedule: boolean;
  timeZone: string; // Always "Asia/Manila" for this app

  /** Profile */
  avatarUrl?: string;
  isActive: boolean;

  /** Freelancer specific */
  isFreelancer: boolean;
  hourlyRate?: number; // Only for freelancers
  paymentMethod?: string; // Bank account, GCash, etc.
}

/**
 * Time Entry Schema with comprehensive tracking
 */
export interface TimeEntry extends BaseEntity {
  /** User relationship */
  userId: string;

  /** Timestamps (all in Manila Time) */
  clockIn: Date;
  clockOut?: Date;

  /** Break tracking */
  breaks: BreakPeriod[];

  /** Status and approval */
  status: TimeEntryStatus;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;

  /** Location tracking (optional for remote verification) */
  clockInLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  clockOutLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  /** Computed fields */
  totalHours?: number; // Calculated: (clockOut - clockIn) - breaks
  regularHours?: number;
  overtimeHours?: number;

  /** Validation flags */
  isLate?: boolean;
  isEarlyDeparture?: boolean;
}

/**
 * Break period within a time entry
 */
export interface BreakPeriod {
  id: string;
  type: 'lunch' | 'short_break' | 'extended_break';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  isPaid: boolean; // Usually false for breaks
}

/**
 * Leave Request Schema with approval workflow
 */
export interface LeaveRequest extends BaseEntity {
  /** User relationship */
  userId: string;

  /** Leave details */
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number; // Including partial days

  /** Reason and documentation */
  reason: string;
  attachments?: string[]; // File URLs for medical certificates, etc.

  /** Approval workflow */
  status: LeaveStatus;
  approverId?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  /** Leave balance impact */
  usePaidLeave: boolean;
  deductedFromBalance: boolean;

  /** Emergency leave flag */
  isEmergency: boolean;
  emergencyContact?: string;
}

/**
 * Enhanced Salary Record Schema for freelancer payments
 */
export interface SalaryRecord extends BaseEntity {
  /** User relationship */
  userId: string;

  /** Pay period */
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payPeriodMonth: number; // 1-12
  payPeriodYear: number;

  /** Work summary */
  daysWorked: number;
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  requiredHours: number; // Standard monthly hours (160)

  /** Payment calculation */
  hourlyRate: number;
  overtimeRate: number; // Usually 1.25x hourly rate for freelancers

  /** Base payment calculations */
  baseSalary: number; // regular hours × hourly rate
  overtimePay: number; // overtime hours × overtime rate
  grossAmount: number; // baseSalary + overtimePay
  totalAmount: number; // grossAmount + bonus + incentives

  /** Additional compensation */
  bonusAmount?: number;
  incentiveAmount?: number;
  adjustmentAmount?: number; // Positive or negative adjustments
  adjustmentReason?: string;

  /** Freelancer-specific fields (NO DEDUCTIONS) */
  isFreelancer: boolean;
  taxWithheld?: number; // Only if client requires withholding (rare)
  netAmount: number; // For freelancers, this equals totalAmount

  /** Status and workflow */
  status: PaymentStatus;
  confirmedBy?: string; // Manager who confirmed
  confirmedAt?: Date;
  paymentDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  processedBy?: string; // Admin who processed payment

  /** Documentation */
  notes?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  payslipUrl?: string;

  /** Audit trail */
  generatedBy: string; // System or user who generated
  lastNotificationAt?: Date;
  paymentDueDate?: Date;

  /** Validation flags */
  isValidated: boolean;
  validationErrors?: string[];

  /** Export status */
  exportedToPayroll: boolean;
  exportDate?: Date;
}

/**
 * Salary Record Generation Configuration
 */
export interface SalaryGenerationConfig {
  /** Generation timing */
  autoGenerateMonthly: boolean;
  generateOnLastDay: boolean;
  generationTime: string; // HH:mm format in Manila time

  /** Validation settings */
  requireManagerApproval: boolean;
  validateHours: boolean;
  minimumHoursRequired: number;

  /** Notification settings */
  notifyOnGeneration: boolean;
  notifyOnConfirmation: boolean;
  notifyOnPayment: boolean;

  /** Proration settings */
  prorateNewHires: boolean;
  prorateTerminations: boolean;
  prorationMethod: 'daily' | 'hourly';
}

/**
 * Payroll Processing Batch
 */
export interface PayrollBatch extends BaseEntity {
  /** Batch information */
  batchId: string;
  batchName: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;

  /** Batch statistics */
  totalEmployees: number;
  totalAmount: number;
  confirmedCount: number;
  paidCount: number;
  pendingCount: number;

  /** Processing */
  status: 'draft' | 'review' | 'confirmed' | 'processing' | 'completed';
  processedBy?: string;
  processedAt?: Date;

  /** Export */
  exportUrl?: string;
  exportFormat?: 'excel' | 'pdf' | 'csv';
}

/**
 * Invoice Data Structure
 */
export interface InvoiceData {
  /** Invoice information */
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;

  /** Company information */
  companyName: string;
  companyAddress: string;
  companyContact: string;
  companyTaxId?: string;

  /** Freelancer information */
  freelancerName: string;
  freelancerAddress: string;
  freelancerEmail: string;
  freelancerTaxId?: string;

  /** Service details */
  serviceDescription: string;
  payPeriod: string;

  /** Financial breakdown */
  regularHours: number;
  regularRate: number;
  regularAmount: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  bonusAmount: number;
  totalAmount: number;
  currency: string;

  /** Payment information */
  paymentMethod: string;
  paymentTerms: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };

  /** Notes */
  notes: string;
  taxNote: string; // "Freelancer - No tax withholding applied"
}

/**
 * Payroll Report Data
 */
export interface PayrollReport {
  /** Report information */
  reportId: string;
  reportName: string;
  reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  generatedAt: Date;
  generatedBy: string;

  /** Period */
  startDate: Date;
  endDate: Date;

  /** Summary */
  totalEmployees: number;
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalPayroll: number;
  averageHourlyRate: number;

  /** Breakdown by status */
  pendingCount: number;
  confirmedCount: number;
  paidCount: number;
  overdueCount: number;

  /** Department breakdown */
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    totalHours: number;
    totalPayroll: number;
  }>;

  /** Employee details */
  employeeDetails: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    hours: number;
    overtimeHours: number;
    hourlyRate: number;
    totalAmount: number;
    status: PaymentStatus;
  }>;
}

/**
 * Enhanced Leave Balance Schema
 */
export interface LeaveBalance extends BaseEntity {
  userId: string;

  /** Annual leave entitlements */
  vacationBalance: number;
  sickBalance: number;
  emergencyBalance: number;
  personalBalance: number;

  /** Used leave */
  vacationUsed: number;
  sickUsed: number;
  emergencyUsed: number;
  personalUsed: number;

  /** Pending leave (awaiting approval) */
  vacationPending: number;
  sickPending: number;
  emergencyPending: number;
  personalPending: number;

  /** Remaining leave */
  vacationRemaining: number;
  sickRemaining: number;
  emergencyRemaining: number;
  personalRemaining: number;

  /** Total calculations */
  totalAnnualLeave: number;
  totalUsedLeave: number;
  totalPendingLeave: number;
  totalRemainingLeave: number;

  /** Year tracking */
  calendarYear: number;
  resetDate: Date; // When leave balances reset
  lastUpdated: Date;
}

/**
 * Leave Policy Configuration
 */
export interface LeavePolicy {
  id: string;
  name: string;
  employmentStatus: EmploymentStatus;

  /** Leave entitlements per year */
  vacationDays: number;
  sickDays: number;
  emergencyDays: number;
  personalDays: number;

  /** Carry-over policy */
  maxCarryOverDays: number;
  carryOverExpiryMonths: number;

  /** Proration settings */
  prorateForNewHires: boolean;
  prorationPeriodDays: number;

  /** Approval requirements */
  requiresApproval: boolean;
  autoApprovalTypes: LeaveType[];
  minAdvanceNoticeDays: number;

  /** Documentation requirements */
  requiresDoctorNote: boolean;
  doctorNoteMaxDays: number;

  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Leave Request Form Data
 */
export interface LeaveRequestFormData {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  isEmergency?: boolean;
  emergencyContact?: string;
  attachments?: File[];
}

/**
 * Leave Request Validation Result
 */
export interface LeaveRequestValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  availableBalance: number;
  requestedDays: number;
  remainingBalanceAfter: number;
}

/**
 * Leave Statistics
 */
export interface LeaveStatistics {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;

  totalDaysTaken: number;
  averageRequestDuration: number;

  byType: Record<LeaveType, {
    count: number;
    days: number;
    percentage: number;
  }>;

  byStatus: Record<LeaveStatus, number>;

  currentYearUsage: {
    vacation: number;
    sick: number;
    emergency: number;
    personal: number;
  };
}

/**
 * Notification Schema for toast and real-time updates
 */
export interface Notification extends BaseEntity {
  /** Target user(s) */
  userId: string; // Primary recipient
  ccUserIds?: string[]; // Secondary recipients

  /** Content */
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;

  /** Actionability */
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;

  /** Status */
  isRead: boolean;
  readAt?: Date;

  /** Delivery */
  channel: 'toast' | 'inbox' | 'email' | 'push';
  expiresAt?: Date;

  /** Cross-tab sync */
  sessionId?: string;
  tabId?: string;
  requiresSync: boolean;
}

// ==================== CRUD INTERFACES ====================

/**
 * User CRUD operations
 */
export interface UserRepository {
  // Create
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User>;

  // Read
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmployeeId(employeeId: string): Promise<User | null>;
  findDirectReports(managerId: string): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findFreelancers(): Promise<User[]>;

  // Update
  update(id: string, updates: Partial<User>): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;

  // Delete
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}

/**
 * TimeEntry CRUD operations
 */
export interface TimeEntryRepository {
  // Create
  create(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<TimeEntry>;

  // Read
  findById(id: string): Promise<TimeEntry | null>;
  findByUserId(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    status?: TimeEntryStatus;
    limit?: number;
    offset?: number;
  }): Promise<TimeEntry[]>;

  findActiveEntry(userId: string): Promise<TimeEntry | null>;
  findPendingEntries(): Promise<TimeEntry[]>;

  // Update
  clockOut(id: string, clockOutTime: Date): Promise<TimeEntry>;
  addBreak(entryId: string, breakPeriod: Omit<BreakPeriod, 'id'>): Promise<TimeEntry>;
  endBreak(entryId: string, breakId: string, endTime: Date): Promise<TimeEntry>;

  approve(id: string, approverId: string): Promise<TimeEntry>;
  reject(id: string, approverId: string, reason: string): Promise<TimeEntry>;

  // Delete
  softDelete(id: string): Promise<void>;
}

/**
 * LeaveRequest CRUD operations
 */
export interface LeaveRequestRepository {
  // Create
  create(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<LeaveRequest>;

  // Read
  findById(id: string): Promise<LeaveRequest | null>;
  findByUserId(userId: string, options?: {
    year?: number;
    status?: LeaveStatus;
    type?: LeaveType;
  }): Promise<LeaveRequest[]>;

  findPendingApprovals(managerId: string): Promise<LeaveRequest[]>;
  findConflictingLeaves(userId: string, startDate: Date, endDate: Date): Promise<LeaveRequest[]>;

  // Update
  approve(id: string, approverId: string): Promise<LeaveRequest>;
  reject(id: string, approverId: string, reason: string): Promise<LeaveRequest>;
  cancel(id: string, userId: string): Promise<LeaveRequest>;

  // Delete
  softDelete(id: string): Promise<void>;
}

/**
 * SalaryRecord CRUD operations
 */
export interface SalaryRecordRepository {
  // Create
  create(record: Omit<SalaryRecord, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<SalaryRecord>;

  // Read
  findById(id: string): Promise<SalaryRecord | null>;
  findByUserId(userId: string, options?: {
    year?: number;
    month?: number;
    status?: PaymentStatus;
  }): Promise<SalaryRecord[]>;

  findPendingPayments(): Promise<SalaryRecord[]>;
  findOverduePayments(): Promise<SalaryRecord[]>;

  // Calculate
  calculatePayroll(userId: string, startDate: Date, endDate: Date): Promise<{
    regularHours: number;
    overtimeHours: number;
    grossAmount: number;
    totalAmount: number;
  }>;

  // Update
  approve(id: string, approverId: string): Promise<SalaryRecord>;
  markAsPaid(id: string, paymentDate: Date, transactionId: string): Promise<SalaryRecord>;

  // Delete
  softDelete(id: string): Promise<void>;
}

/**
 * Notification CRUD operations
 */
export interface NotificationRepository {
  // Create
  create(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Notification>;

  // Read
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, options?: {
    unreadOnly?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    limit?: number;
  }): Promise<Notification[]>;

  findUnreadCount(userId: string): Promise<number>;
  findByTabId(tabId: string): Promise<Notification[]>;

  // Update
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;

  // Sync
  markForSync(ids: string[]): Promise<void>;
  clearSyncedNotifications(tabId: string): Promise<void>;

  // Delete
  softDelete(id: string): Promise<void>;
  cleanupExpired(): Promise<void>;
}

// ==================== VALIDATION SCHEMAS ====================
// Note: Validation schemas temporarily removed due to TypeScript compilation issues
// These can be re-added later with proper type definitions

// ==================== LOCAL STORAGE UTILITIES ====================

/**
 * LocalStorage keys for cross-tab synchronization
 */
export const STORAGE_KEYS = {
  USER: 'hr_tracker_user',
  ACTIVE_TIME_ENTRY: 'hr_tracker_active_entry',
  NOTIFICATIONS: 'hr_tracker_notifications',
  LAST_SYNC: 'hr_tracker_last_sync',
  TAB_ID: 'hr_tracker_tab_id',
  SETTINGS: 'hr_tracker_settings'
} as const;

/**
 * Cross-tab sync events
 */
export interface SyncEvent {
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'ADD_BREAK' | 'END_BREAK' | 'NOTIFICATION_READ';
  timestamp: Date;
  userId: string;
  data: any;
  tabId: string;
}

/**
 * LocalStorage utility interface
 */
export interface LocalStorageManager {
  // User session
  saveUserSession(user: User): void;
  getUserSession(): User | null;
  clearUserSession(): void;

  // Active time entry
  saveActiveEntry(entry: TimeEntry | null): void;
  getActiveEntry(): TimeEntry | null;
  clearActiveEntry(): void;

  // Notifications
  saveNotifications(notifications: Notification[]): void;
  getNotifications(): Notification[];
  addNotification(notification: Notification): void;

  // Cross-tab sync
  saveSyncEvent(event: SyncEvent): void;
  getSyncEvents(): SyncEvent[];
  clearSyncEvents(): void;

  // Settings
  saveSettings(settings: Record<string, any>): void;
  getSettings(): Record<string, any>;
}

// ==================== TIMEZONE UTILITIES ====================

/**
 * Manila Time utilities
 */
export interface ManilaTimeUtils {
  /** Get current time in Manila timezone */
  now(): Date;

  /** Convert date to Manila time */
  toManilaTime(date: Date): Date;

  /** Format date in Manila timezone */
  format(date: Date, format: string): string;

  /** Check if date is today in Manila timezone */
  isToday(date: Date): boolean;

  /** Get start of day in Manila timezone */
  startOfDay(date: Date): Date;

  /** Get end of day in Manila timezone */
  endOfDay(date: Date): Date;

  /** Add business days (excluding weekends) */
  addBusinessDays(date: Date, days: number): Date;

  /** Calculate working hours between two dates */
  calculateWorkingHours(start: Date, end: Date): number;
}

// ==================== EXPORTS ====================
// Note: All interfaces and enums are already exported above with their declarations
// This section removed to avoid duplicate export errors