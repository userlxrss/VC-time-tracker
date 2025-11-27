/**
 * Sample Implementations and Usage Examples
 *
 * Demonstrates practical implementation of the HR time tracker schema
 * with real-world examples and best practices.
 */

import {
  User,
  TimeEntry,
  LeaveRequest,
  SalaryRecord,
  Notification,
  LeaveBalance,
  UserRole,
  TimeEntryStatus,
  LeaveType,
  LeaveStatus,
  PaymentStatus,
  UserRepository,
  TimeEntryRepository,
  LeaveRequestRepository,
  SalaryRecordRepository,
  NotificationRepository
} from './database-schema';

import {
  ValidationHelper,
  LocalStorageHelper,
  CrossTabSyncManager,
  TimeCalculations,
  ManilaTimeManager
} from './database-helpers';

// ==================== MOCK IMPLEMENTATIONS ====================

/**
 * Mock UserRepository implementation for demonstration
 */
export class MockUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private timeManager = new ManilaTimeManager();

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User> {
    // Validate user data
    const validation = ValidationHelper.validateUser(userData);
    if (!validation.isValid) {
      throw new Error(`User validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate email
    const existingEmail = Array.from(this.users.values()).find(u => u.email === userData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Check for duplicate employee ID
    const existingEmployeeId = Array.from(this.users.values()).find(u => u.employeeId === userData.employeeId);
    if (existingEmployeeId) {
      throw new Error('Employee ID already exists');
    }

    const user: User = {
      ...userData,
      id: ValidationHelper.generateId(),
      createdAt: this.timeManager.now(),
      updatedAt: this.timeManager.now(),
      isActive: true,
      directReports: [],
      timeZone: 'Asia/Manila'
    };

    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user || null;
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.employeeId === employeeId);
    return user || null;
  }

  async findDirectReports(managerId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.managerId === managerId);
  }

  async findActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.isActive && !u.deletedAt);
  }

  async findFreelancers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.isFreelancer && u.isActive && !u.deletedAt);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate updates
    const validation = ValidationHelper.validateUser(updates);
    if (!validation.isValid) {
      throw new Error(`User validation failed: ${validation.errors.join(', ')}`);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: this.timeManager.now()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = this.timeManager.now();
      user.updatedAt = this.timeManager.now();
      this.users.set(id, user);
    }
  }

  async deactivate(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isActive = false;
      user.updatedAt = this.timeManager.now();
      this.users.set(id, user);
    }
  }

  async softDelete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.deletedAt = this.timeManager.now();
      user.isActive = false;
      user.updatedAt = this.timeManager.now();
      this.users.set(id, user);
    }
  }

  async hardDelete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

/**
 * Mock TimeEntryRepository implementation
 */
export class MockTimeEntryRepository implements TimeEntryRepository {
  private timeEntries: Map<string, TimeEntry> = new Map();
  private timeManager = new ManilaTimeManager();

  async create(entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<TimeEntry> {
    // Validate time entry
    const validation = ValidationHelper.validateTimeEntry(entryData);
    if (!validation.isValid) {
      throw new Error(`Time entry validation failed: ${validation.errors.join(', ')}`);
    }

    // Check if user already has an active entry
    const activeEntry = await this.findActiveEntry(entryData.userId);
    if (activeEntry) {
      throw new Error('User already has an active time entry');
    }

    const timeEntry: TimeEntry = {
      ...entryData,
      id: ValidationHelper.generateId(),
      createdAt: this.timeManager.now(),
      updatedAt: this.timeManager.now(),
      status: TimeEntryStatus.ACTIVE,
      breaks: [],
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0
    };

    // Calculate initial fields
    this.updateCalculatedFields(timeEntry);

    this.timeEntries.set(timeEntry.id, timeEntry);
    return timeEntry;
  }

  async findById(id: string): Promise<TimeEntry | null> {
    return this.timeEntries.get(id) || null;
  }

  async findByUserId(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    status?: TimeEntryStatus;
    limit?: number;
    offset?: number;
  }): Promise<TimeEntry[]> {
    let entries = Array.from(this.timeEntries.values())
      .filter(entry => entry.userId === userId && !entry.deletedAt);

    if (options?.startDate) {
      entries = entries.filter(entry => entry.clockIn >= options.startDate!);
    }

    if (options?.endDate) {
      entries = entries.filter(entry => entry.clockIn <= options.endDate!);
    }

    if (options?.status) {
      entries = entries.filter(entry => entry.status === options.status);
    }

    // Sort by clock in time (newest first)
    entries.sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime());

    // Apply pagination
    if (options?.offset) {
      entries = entries.slice(options.offset);
    }

    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  async findActiveEntry(userId: string): Promise<TimeEntry | null> {
    const entries = Array.from(this.timeEntries.values())
      .filter(entry => entry.userId === userId && entry.status === TimeEntryStatus.ACTIVE && !entry.deletedAt);

    return entries[0] || null;
  }

  async findPendingEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values())
      .filter(entry => entry.status === TimeEntryStatus.PENDING && !entry.deletedAt);
  }

  async clockOut(id: string, clockOutTime: Date): Promise<TimeEntry> {
    const entry = this.timeEntries.get(id);
    if (!entry) {
      throw new Error('Time entry not found');
    }

    if (entry.status !== TimeEntryStatus.ACTIVE) {
      throw new Error('Cannot clock out a non-active entry');
    }

    entry.clockOut = clockOutTime;
    entry.status = TimeEntryStatus.COMPLETED;
    entry.updatedAt = this.timeManager.now();

    // Update calculated fields
    this.updateCalculatedFields(entry);

    this.timeEntries.set(id, entry);
    return entry;
  }

  async addBreak(entryId: string, breakPeriod: Omit<BreakPeriod, 'id'>): Promise<TimeEntry> {
    const entry = this.timeEntries.get(entryId);
    if (!entry) {
      throw new Error('Time entry not found');
    }

    if (entry.status !== TimeEntryStatus.ACTIVE) {
      throw new Error('Cannot add break to a non-active entry');
    }

    const newBreak: BreakPeriod = {
      ...breakPeriod,
      id: ValidationHelper.generateId()
    };

    entry.breaks.push(newBreak);
    entry.updatedAt = this.timeManager.now();

    this.timeEntries.set(entryId, entry);
    return entry;
  }

  async endBreak(entryId: string, breakId: string, endTime: Date): Promise<TimeEntry> {
    const entry = this.timeEntries.get(entryId);
    if (!entry) {
      throw new Error('Time entry not found');
    }

    const breakPeriod = entry.breaks.find(b => b.id === breakId);
    if (!breakPeriod) {
      throw new Error('Break not found');
    }

    breakPeriod.endTime = endTime;
    breakPeriod.duration = (endTime.getTime() - breakPeriod.startTime.getTime()) / (1000 * 60); // in minutes

    entry.updatedAt = this.timeManager.now();
    this.updateCalculatedFields(entry);

    this.timeEntries.set(entryId, entry);
    return entry;
  }

  async approve(id: string, approverId: string): Promise<TimeEntry> {
    const entry = this.timeEntries.get(id);
    if (!entry) {
      throw new Error('Time entry not found');
    }

    entry.status = TimeEntryStatus.APPROVED;
    entry.approvedBy = approverId;
    entry.approvedAt = this.timeManager.now();
    entry.updatedAt = this.timeManager.now();

    this.timeEntries.set(id, entry);
    return entry;
  }

  async reject(id: string, approverId: string, reason: string): Promise<TimeEntry> {
    const entry = this.timeEntries.get(id);
    if (!entry) {
      throw new Error('Time entry not found');
    }

    entry.status = TimeEntryStatus.REJECTED;
    entry.approvedBy = approverId;
    entry.approvedAt = this.timeManager.now();
    entry.notes = `${entry.notes || ''}\n\nRejected: ${reason}`.trim();
    entry.updatedAt = this.timeManager.now();

    this.timeEntries.set(id, entry);
    return entry;
  }

  async softDelete(id: string): Promise<void> {
    const entry = this.timeEntries.get(id);
    if (entry) {
      entry.deletedAt = this.timeManager.now();
      entry.updatedAt = this.timeManager.now();
      this.timeEntries.set(id, entry);
    }
  }

  /**
   * Update calculated fields for a time entry
   */
  private updateCalculatedFields(entry: TimeEntry): void {
    if (entry.clockOut) {
      const totalHours = TimeCalculations.calculateTotalHours(entry);
      const overtimeHours = TimeCalculations.calculateOvertimeHours(entry);

      entry.totalHours = totalHours;
      entry.overtimeHours = overtimeHours;
      entry.regularHours = Math.max(0, totalHours - overtimeHours);
    }
  }
}

// ==================== SAMPLE USAGE EXAMPLES ====================

/**
 * Example of how to use the schema in a real application
 */
export class TimeTrackerService {
  private userRepo: UserRepository;
  private timeEntryRepo: TimeEntryRepository;
  private leaveRequestRepo: LeaveRequestRepository;
  private storageHelper: LocalStorageHelper;
  private syncManager: CrossTabSyncManager;
  private timeManager: ManilaTimeManager;

  constructor(
    userRepo: UserRepository,
    timeEntryRepo: TimeEntryRepository,
    leaveRequestRepo: LeaveRequestRepository
  ) {
    this.userRepo = userRepo;
    this.timeEntryRepo = timeEntryRepo;
    this.leaveRequestRepo = leaveRequestRepo;
    this.storageHelper = new LocalStorageHelper();
    this.syncManager = new CrossTabSyncManager();
    this.timeManager = new ManilaTimeManager();

    this.setupSyncListeners();
  }

  /**
   * Setup cross-tab synchronization listeners
   */
  private setupSyncListeners(): void {
    this.syncManager.addListener('CLOCK_IN', (event: any) => {
      console.log('User clocked in from another tab:', event);
      this.storageHelper.saveActiveEntry(event.data);
    });

    this.syncManager.addListener('CLOCK_OUT', (event: any) => {
      console.log('User clocked out from another tab:', event);
      this.storageHelper.clearActiveEntry();
    });
  }

  /**
   * Clock in a user
   */
  async clockIn(userId: string, notes?: string): Promise<TimeEntry> {
    // Check if user already has an active entry
    const activeEntry = await this.timeEntryRepo.findActiveEntry(userId);
    if (activeEntry) {
      throw new Error('User is already clocked in');
    }

    // Get user details
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('Invalid user');
    }

    // Create time entry
    const timeEntry = await this.timeEntryRepo.create({
      userId,
      clockIn: this.timeManager.now(),
      notes,
      status: TimeEntryStatus.ACTIVE,
      breaks: []
    });

    // Save to localStorage for real-time access
    this.storageHelper.saveActiveEntry(timeEntry);

    // Broadcast to other tabs
    this.syncManager.broadcastEvent('CLOCK_IN', userId, timeEntry);

    // Create notification
    const notification: Notification = {
      id: ValidationHelper.generateId(),
      userId,
      title: 'Clocked In Successfully',
      message: `You clocked in at ${this.timeManager.format(timeEntry.clockIn, '12h')}`,
      type: 'success' as any,
      priority: 'medium' as any,
      isRead: false,
      channel: 'toast',
      requiresSync: true,
      createdAt: this.timeManager.now(),
      updatedAt: this.timeManager.now()
    };

    this.storageHelper.addNotification(notification);

    return timeEntry;
  }

  /**
   * Clock out a user
   */
  async clockOut(userId: string): Promise<TimeEntry> {
    // Get active entry
    const activeEntry = await this.timeEntryRepo.findActiveEntry(userId);
    if (!activeEntry) {
      throw new Error('No active time entry found');
    }

    // Clock out
    const clockOutTime = this.timeManager.now();
    const updatedEntry = await this.timeEntryRepo.clockOut(activeEntry.id, clockOutTime);

    // Clear from localStorage
    this.storageHelper.clearActiveEntry();

    // Broadcast to other tabs
    this.syncManager.broadcastEvent('CLOCK_OUT', userId, updatedEntry);

    // Create notification
    const notification: Notification = {
      id: ValidationHelper.generateId(),
      userId,
      title: 'Clocked Out Successfully',
      message: `You worked ${updatedEntry.totalHours?.toFixed(2)} hours today`,
      type: 'success' as any,
      priority: 'medium' as any,
      isRead: false,
      channel: 'toast',
      requiresSync: true,
      createdAt: this.timeManager.now(),
      updatedAt: this.timeManager.now()
    };

    this.storageHelper.addNotification(notification);

    return updatedEntry;
  }

  /**
   * Add a break period
   */
  async addBreak(userId: string, breakType: 'lunch' | 'short_break' | 'extended_break'): Promise<TimeEntry> {
    const activeEntry = await this.timeEntryRepo.findActiveEntry(userId);
    if (!activeEntry) {
      throw new Error('No active time entry found');
    }

    const breakPeriod = await this.timeEntryRepo.addBreak(activeEntry.id, {
      type: breakType,
      startTime: this.timeManager.now(),
      isPaid: breakType === 'short_break' // Short breaks might be paid
    });

    // Update localStorage
    this.storageHelper.saveActiveEntry(breakPeriod);

    // Broadcast to other tabs
    this.syncManager.broadcastEvent('ADD_BREAK', userId, breakPeriod);

    return breakPeriod;
  }

  /**
   * End a break period
   */
  async endBreak(userId: string, breakId: string): Promise<TimeEntry> {
    const activeEntry = await this.timeEntryRepo.findActiveEntry(userId);
    if (!activeEntry) {
      throw new Error('No active time entry found');
    }

    const updatedEntry = await this.timeEntryRepo.endBreak(
      activeEntry.id,
      breakId,
      this.timeManager.now()
    );

    // Update localStorage
    this.storageHelper.saveActiveEntry(updatedEntry);

    // Broadcast to other tabs
    this.syncManager.broadcastEvent('END_BREAK', userId, updatedEntry);

    return updatedEntry;
  }

  /**
   * Create a leave request
   */
  async createLeaveRequest(
    userId: string,
    type: LeaveType,
    startDate: Date,
    endDate: Date,
    reason: string
  ): Promise<LeaveRequest> {
    // Validate dates
    const validation = ValidationHelper.validateLeaveRequest({
      type,
      startDate,
      endDate,
      reason,
      totalDays: TimeCalculations.calculateLeaveDays(startDate, endDate)
    });

    if (!validation.isValid) {
      throw new Error(`Leave request validation failed: ${validation.errors.join(', ')}`);
    }

    // Get user details
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check for conflicting leave requests
    const conflictingLeaves = await this.leaveRequestRepo.findConflictingLeaves(
      userId,
      startDate,
      endDate
    );

    if (conflictingLeaves.some(leave => leave.status !== LeaveStatus.REJECTED && leave.status !== LeaveStatus.CANCELLED)) {
      throw new Error('You already have a leave request for this period');
    }

    // Calculate total days
    const totalDays = TimeCalculations.calculateLeaveDays(startDate, endDate);

    // Create leave request
    const leaveRequest = await this.leaveRequestRepo.create({
      userId,
      type,
      startDate,
      endDate,
      totalDays,
      reason,
      status: LeaveStatus.PENDING,
      usePaidLeave: type !== LeaveType.UNPAID,
      deductedFromBalance: false,
      isEmergency: false
    });

    // Create notification for manager
    if (user.managerId) {
      const managerNotification: Notification = {
        id: ValidationHelper.generateId(),
        userId: user.managerId,
        title: 'New Leave Request',
        message: `${user.firstName} ${user.lastName} requested ${totalDays} day(s) of ${type} leave`,
        type: 'info' as any,
        priority: 'medium' as any,
        isRead: false,
        channel: 'inbox',
        actionUrl: `/leave-requests/${leaveRequest.id}`,
        requiresSync: true,
        createdAt: this.timeManager.now(),
        updatedAt: this.timeManager.now()
      };

      this.storageHelper.addNotification(managerNotification);
    }

    return leaveRequest;
  }

  /**
   * Get time entry summary for a user
   */
  async getTimeEntrySummary(userId: string, startDate: Date, endDate: Date): Promise<{
    totalEntries: number;
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    averageHoursPerDay: number;
  }> {
    const entries = await this.timeEntryRepo.findByUserId(userId, {
      startDate,
      endDate,
      status: TimeEntryStatus.COMPLETED
    });

    const totalEntries = entries.length;
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const regularHours = entries.reduce((sum, entry) => sum + (entry.regularHours || 0), 0);
    const overtimeHours = entries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);
    const averageHoursPerDay = totalEntries > 0 ? totalHours / totalEntries : 0;

    return {
      totalEntries,
      totalHours,
      regularHours,
      overtimeHours,
      averageHoursPerDay
    };
  }
}

// ==================== EXAMPLE USAGE ====================

/**
 * Example of how to initialize and use the system
 */
export async function exampleUsage() {
  // Initialize repositories
  const userRepo = new MockUserRepository();
  const timeEntryRepo = new MockTimeEntryRepository();
  // const leaveRequestRepo = new MockLeaveRequestRepository(); // Would need to implement this

  // Initialize service
  const timeTrackerService = new TimeTrackerService(
    userRepo,
    timeEntryRepo,
    null as any // leaveRequestRepo would be implemented
  );

  try {
    // Create a sample user
    const user = await userRepo.create({
      employeeId: 'EMP001',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan.delacruz@company.com',
      passwordHash: 'hashed_password',
      role: UserRole.EMPLOYEE,
      employmentStatus: EmploymentStatus.FULL_TIME,
      department: 'Engineering',
      position: 'Software Developer',
      hireDate: new Date('2023-01-15'),
      preferredWorkingHours: {
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 8,
        saturday: 0,
        sunday: 0
      },
      canWorkFromHome: true,
      flexibleSchedule: true,
      timeZone: 'Asia/Manila',
      isFreelancer: false,
      directReports: []
    });

    console.log('Created user:', user);

    // Clock in the user
    const timeEntry = await timeTrackerService.clockIn(user.id, 'Starting my workday');
    console.log('Clocked in:', timeEntry);

    // Simulate some work...

    // Add a lunch break
    const lunchBreak = await timeTrackerService.addBreak(user.id, 'lunch');
    console.log('Added lunch break:', lunchBreak);

    // End lunch break
    const endedBreak = await timeTrackerService.endBreak(user.id, lunchBreak.breaks[0].id);
    console.log('Ended lunch break:', endedBreak);

    // Clock out
    const clockedOut = await timeTrackerService.clockOut(user.id);
    console.log('Clocked out:', clockedOut);

    // Get time entry summary
    const summary = await timeTrackerService.getTimeEntrySummary(
      user.id,
      new Date('2024-01-01'),
      new Date('2024-01-31')
    );
    console.log('Monthly summary:', summary);

  } catch (error) {
    console.error('Error:', error);
  }
}

export default exampleUsage;