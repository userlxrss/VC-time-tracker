/**
 * Leave Management System
 *
 * Comprehensive leave management with approval workflow, balance tracking,
 * validation, and policy enforcement. All dates are in Manila Time.
 */

import {
  LeaveRequest,
  LeaveBalance,
  LeavePolicy,
  LeaveRequestFormData,
  LeaveRequestValidation,
  LeaveStatistics,
  LeaveType,
  LeaveStatus,
  EmploymentStatus,
  User
} from '../../../database-schema';
import { manilaTime } from '../utils/manilaTime';
import { LeaveNotificationManager } from './leaveNotifications';

// ==================== LEAVE POLICIES ====================

const DEFAULT_LEAVE_POLICIES: LeavePolicy[] = [
  {
    id: 'full-time-policy',
    name: 'Full-Time Employee Policy',
    employmentStatus: EmploymentStatus.FULL_TIME,
    vacationDays: 15,
    sickDays: 10,
    emergencyDays: 5,
    personalDays: 5,
    maxCarryOverDays: 5,
    carryOverExpiryMonths: 3,
    prorateForNewHires: true,
    prorationPeriodDays: 90,
    requiresApproval: true,
    autoApprovalTypes: [LeaveType.SICK],
    minAdvanceNoticeDays: 3,
    requiresDoctorNote: true,
    doctorNoteMaxDays: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'freelance-policy',
    name: 'Freelancer Policy',
    employmentStatus: EmploymentStatus.FREELANCE,
    vacationDays: 10,
    sickDays: 5,
    emergencyDays: 3,
    personalDays: 3,
    maxCarryOverDays: 0,
    carryOverExpiryMonths: 0,
    prorateForNewHires: false,
    prorationPeriodDays: 0,
    requiresApproval: true,
    autoApprovalTypes: [],
    minAdvanceNoticeDays: 7,
    requiresDoctorNote: false,
    doctorNoteMaxDays: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'part-time-policy',
    name: 'Part-Time Employee Policy',
    employmentStatus: EmploymentStatus.PART_TIME,
    vacationDays: 8,
    sickDays: 5,
    emergencyDays: 2,
    personalDays: 2,
    maxCarryOverDays: 2,
    carryOverExpiryMonths: 6,
    prorateForNewHires: true,
    prorationPeriodDays: 90,
    requiresApproval: true,
    autoApprovalTypes: [LeaveType.SICK],
    minAdvanceNoticeDays: 5,
    requiresDoctorNote: false,
    doctorNoteMaxDays: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
  },
];

// ==================== MOCK DATA STORAGE ====================

let mockLeaveRequests: LeaveRequest[] = [];
let mockLeaveBalances: LeaveBalance[] = [];
let nextLeaveRequestId = '1';
let nextLeaveBalanceId = '1';

// ==================== UTILITY FUNCTIONS ====================

function generateId(): string {
  const id = nextLeaveRequestId;
  nextLeaveRequestId = (parseInt(id) + 1).toString();
  return id;
}

function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const start = manilaTime.startOfDay(startDate);
  const end = manilaTime.startOfDay(endDate);

  if (end < start) return 0;

  let days = 0;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

function getLeavePolicy(user: User): LeavePolicy {
  const policy = DEFAULT_LEAVE_POLICIES.find(p =>
    p.employmentStatus === user.employmentStatus && p.isActive
  );

  if (!policy) {
    throw new Error(`No active leave policy found for employment status: ${user.employmentStatus}`);
  }

  return policy;
}

function getOrCreateLeaveBalance(userId: string, user: User): LeaveBalance {
  let balance = mockLeaveBalances.find(b => b.userId === userId);

  if (!balance) {
    const policy = getLeavePolicy(user);
    const now = manilaTime.now();
    const resetDate = new Date(user.hireDate);
    resetDate.setFullYear(resetDate.getFullYear() + 1);

    balance = {
      id: nextLeaveBalanceId++,
      userId,
      vacationBalance: policy.vacationDays,
      sickBalance: policy.sickDays,
      emergencyBalance: policy.emergencyDays,
      personalBalance: policy.personalDays,
      vacationUsed: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      personalUsed: 0,
      vacationPending: 0,
      sickPending: 0,
      emergencyPending: 0,
      personalPending: 0,
      vacationRemaining: policy.vacationDays,
      sickRemaining: policy.sickDays,
      emergencyRemaining: policy.emergencyDays,
      personalRemaining: policy.personalDays,
      totalAnnualLeave: policy.vacationDays + policy.sickDays + policy.emergencyDays + policy.personalDays,
      totalUsedLeave: 0,
      totalPendingLeave: 0,
      totalRemainingLeave: policy.vacationDays + policy.sickDays + policy.emergencyDays + policy.personalDays,
      calendarYear: now.getFullYear(),
      resetDate,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
    };

    mockLeaveBalances.push(balance);
  }

  return balance;
}

function updateLeaveBalance(
  balance: LeaveBalance,
  leaveType: LeaveType,
  days: number,
  isPending: boolean,
  isAdding: boolean = false
): void {
  const multiplier = isAdding ? 1 : -1;
  const pendingMultiplier = isPending ? multiplier : 0;
  const usedMultiplier = !isPending ? multiplier : 0;

  switch (leaveType) {
    case LeaveType.VACATION:
      balance.vacationPending += pendingMultiplier * days;
      balance.vacationUsed += usedMultiplier * days;
      balance.vacationRemaining = balance.vacationBalance - balance.vacationUsed - balance.vacationPending;
      break;

    case LeaveType.SICK:
      balance.sickPending += pendingMultiplier * days;
      balance.sickUsed += usedMultiplier * days;
      balance.sickRemaining = balance.sickBalance - balance.sickUsed - balance.sickPending;
      break;

    case LeaveType.EMERGENCY:
      balance.emergencyPending += pendingMultiplier * days;
      balance.emergencyUsed += usedMultiplier * days;
      balance.emergencyRemaining = balance.emergencyBalance - balance.emergencyUsed - balance.emergencyPending;
      break;

    case LeaveType.PERSONAL:
      balance.personalPending += pendingMultiplier * days;
      balance.personalUsed += usedMultiplier * days;
      balance.personalRemaining = balance.personalBalance - balance.personalUsed - balance.personalPending;
      break;

    case LeaveType.MATERNITY:
    case LeaveType.PATERNITY:
    case LeaveType.UNPAID:
    case LeaveType.WORK_FROM_HOME:
      // These don't affect the balance
      break;
  }

  // Update totals
  balance.totalUsedLeave = balance.vacationUsed + balance.sickUsed + balance.emergencyUsed + balance.personalUsed;
  balance.totalPendingLeave = balance.vacationPending + balance.sickPending + balance.emergencyPending + balance.personalPending;
  balance.totalRemainingLeave = balance.vacationRemaining + balance.sickRemaining + balance.emergencyRemaining + balance.personalRemaining;

  balance.lastUpdated = manilaTime.now();
}

// ==================== LEAVE MANAGER CLASS ====================

export class LeaveManager {
  /**
   * Validate leave request data
   */
  static validateLeaveRequest(
    formData: LeaveRequestFormData,
    user: User,
    existingRequests: LeaveRequest[] = []
  ): LeaveRequestValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Calculate requested days
    const requestedDays = calculateLeaveDays(formData.startDate, formData.endDate);

    if (requestedDays <= 0) {
      errors.push('Leave period must include at least one working day');
    }

    if (formData.startDate > formData.endDate) {
      errors.push('Start date must be before or equal to end date');
    }

    // Check for past dates (unless emergency)
    const now = manilaTime.now();
    const startOfToday = manilaTime.startOfDay(now);

    if (formData.startDate < startOfToday && !formData.isEmergency) {
      errors.push('Cannot request leave for past dates unless it\'s an emergency');
    }

    // Check reason length
    if (formData.reason.trim().length < 10) {
      errors.push('Please provide a detailed reason (minimum 10 characters)');
    }

    // Check advance notice
    const policy = getLeavePolicy(user);
    const daysDifference = Math.ceil((formData.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference < policy.minAdvanceNoticeDays && !formData.isEmergency) {
      warnings.push(`Leave requests should be submitted at least ${policy.minAdvanceNoticeDays} days in advance`);
    }

    // Get current balance
    const balance = getOrCreateLeaveBalance(user.id, user);
    let availableBalance = 0;
    let remainingBalanceAfter = 0;

    switch (formData.type) {
      case LeaveType.VACATION:
        availableBalance = balance.vacationRemaining;
        remainingBalanceAfter = balance.vacationRemaining - requestedDays;
        break;
      case LeaveType.SICK:
        availableBalance = balance.sickRemaining;
        remainingBalanceAfter = balance.sickRemaining - requestedDays;
        break;
      case LeaveType.EMERGENCY:
        availableBalance = balance.emergencyRemaining;
        remainingBalanceAfter = balance.emergencyRemaining - requestedDays;
        break;
      case LeaveType.PERSONAL:
        availableBalance = balance.personalRemaining;
        remainingBalanceAfter = balance.personalRemaining - requestedDays;
        break;
      default:
        availableBalance = 999; // Unlimited for unpaid, maternity, etc.
        remainingBalanceAfter = 999;
    }

    // Check sufficient balance
    if (remainingBalanceAfter < 0 && !formData.isEmergency && formData.type !== LeaveType.UNPAID) {
      errors.push(`Insufficient ${formData.type} leave balance. Available: ${availableBalance} days, Requested: ${requestedDays} days`);
    }

    // Check for overlapping requests
    const overlappingRequests = existingRequests.filter(request => {
      if (request.status === LeaveStatus.CANCELLED || request.status === LeaveStatus.REJECTED) {
        return false;
      }

      return (
        (formData.startDate <= request.endDate && formData.endDate >= request.startDate)
      );
    });

    if (overlappingRequests.length > 0) {
      errors.push('Leave dates overlap with existing leave requests');
    }

    // Doctor note warning for sick leave
    if (formData.type === LeaveType.SICK && requestedDays > policy.doctorNoteMaxDays) {
      warnings.push('Doctor\'s note may be required for sick leave exceeding ' + policy.doctorNoteMaxDays + ' days');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      availableBalance,
      requestedDays,
      remainingBalanceAfter,
    };
  }

  /**
   * Submit a new leave request
   */
  static async submitLeaveRequest(
    formData: LeaveRequestFormData,
    user: User
  ): Promise<LeaveRequest> {
    // Get existing requests for validation
    const userRequests = mockLeaveRequests.filter(r => r.userId === user.id);

    // Validate the request
    const validation = this.validateLeaveRequest(formData, user, userRequests);

    if (!validation.isValid) {
      throw new Error(validation.errors.join('; '));
    }

    // Create the leave request
    const now = manilaTime.now();
    const requestedDays = calculateLeaveDays(formData.startDate, formData.endDate);

    const leaveRequest: LeaveRequest = {
      id: generateId(),
      userId: user.id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: requestedDays,
      reason: formData.reason,
      status: LeaveStatus.PENDING,
      isEmergency: formData.isEmergency || false,
      emergencyContact: formData.emergencyContact,
      usePaidLeave: formData.type !== LeaveType.UNPAID,
      deductedFromBalance: false, // Will be set to true when approved
      createdAt: now,
      updatedAt: now,
    };

    // Add to storage
    mockLeaveRequests.push(leaveRequest);

    // Update leave balance (allocate as pending)
    const balance = getOrCreateLeaveBalance(user.id, user);
    updateLeaveBalance(balance, formData.type, requestedDays, true, true);

    // Update balance in storage
    const balanceIndex = mockLeaveBalances.findIndex(b => b.userId === user.id);
    if (balanceIndex >= 0) {
      mockLeaveBalances[balanceIndex] = { ...balance };
    }

    // Send notification (async - don't await to avoid blocking)
    LeaveNotificationManager.notifyLeaveSubmitted(leaveRequest, user).catch(console.error);

    return leaveRequest;
  }

  /**
   * Get leave balance for a user
   */
  static async getLeaveBalance(userId: string, user: User): Promise<LeaveBalance> {
    return getOrCreateLeaveBalance(userId, user);
  }

  /**
   * Get leave requests for a user
   */
  static async getLeaveRequests(
    userId: string,
    options: {
      year?: number;
      status?: LeaveStatus;
      type?: LeaveType;
      limit?: number;
    } = {}
  ): Promise<LeaveRequest[]> {
    let requests = mockLeaveRequests.filter(r => r.userId === userId);

    // Filter by year
    if (options.year) {
      requests = requests.filter(r =>
        r.startDate.getFullYear() === options.year ||
        r.endDate.getFullYear() === options.year
      );
    }

    // Filter by status
    if (options.status) {
      requests = requests.filter(r => r.status === options.status);
    }

    // Filter by type
    if (options.type) {
      requests = requests.filter(r => r.type === options.type);
    }

    // Sort by creation date (newest first)
    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply limit
    if (options.limit) {
      requests = requests.slice(0, options.limit);
    }

    return requests;
  }

  /**
   * Get pending approvals for a manager
   */
  static async getPendingApprovals(managerId: string, users: User[]): Promise<LeaveRequest[]> {
    // Get users that report to this manager
    const directReports = users.filter(u => u.managerId === managerId);
    const directReportIds = directReports.map(u => u.id);

    return mockLeaveRequests.filter(r =>
      directReportIds.includes(r.userId) &&
      r.status === LeaveStatus.PENDING
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Approve a leave request
   */
  static async approveLeaveRequest(
    requestId: string,
    approverId: string
  ): Promise<LeaveRequest> {
    const requestIndex = mockLeaveRequests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const request = mockLeaveRequests[requestIndex];

    if (request.status !== LeaveStatus.PENDING) {
      throw new Error('Leave request is not pending approval');
    }

    // Update request status
    request.status = LeaveStatus.APPROVED;
    request.approverId = approverId;
    request.approvedAt = manilaTime.now();
    request.deductedFromBalance = request.usePaidLeave;
    request.updatedAt = manilaTime.now();

    // Update balance (move from pending to used)
    const balance = getOrCreateLeaveBalance(request.userId, { id: request.userId } as User);
    updateLeaveBalance(balance, request.type, request.totalDays, true, false); // Remove from pending
    if (request.usePaidLeave) {
      updateLeaveBalance(balance, request.type, request.totalDays, false, false); // Add to used
    }

    // Update balance in storage
    const balanceIndex = mockLeaveBalances.findIndex(b => b.userId === request.userId);
    if (balanceIndex >= 0) {
      mockLeaveBalances[balanceIndex] = { ...balance };
    }

    mockLeaveRequests[requestIndex] = { ...request };

    // Send notification (async - don't await to avoid blocking)
    const requestUser = { id: request.userId } as User;
    const approverUser = { id: approverId } as User;
    LeaveNotificationManager.notifyLeaveApproved(request, requestUser, approverUser).catch(console.error);

    return request;
  }

  /**
   * Reject a leave request
   */
  static async rejectLeaveRequest(
    requestId: string,
    approverId: string,
    rejectionReason: string
  ): Promise<LeaveRequest> {
    const requestIndex = mockLeaveRequests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const request = mockLeaveRequests[requestIndex];

    if (request.status !== LeaveStatus.PENDING) {
      throw new Error('Leave request is not pending approval');
    }

    // Update request status
    request.status = LeaveStatus.REJECTED;
    request.approverId = approverId;
    request.approvedAt = manilaTime.now();
    request.rejectionReason = rejectionReason;
    request.updatedAt = manilaTime.now();

    // Restore balance (remove from pending)
    const balance = getOrCreateLeaveBalance(request.userId, { id: request.userId } as User);
    updateLeaveBalance(balance, request.type, request.totalDays, true, false); // Remove from pending

    // Update balance in storage
    const balanceIndex = mockLeaveBalances.findIndex(b => b.userId === request.userId);
    if (balanceIndex >= 0) {
      mockLeaveBalances[balanceIndex] = { ...balance };
    }

    mockLeaveRequests[requestIndex] = { ...request };

    // Send notification (async - don't await to avoid blocking)
    const requestUser = { id: request.userId } as User;
    const approverUser = { id: approverId } as User;
    LeaveNotificationManager.notifyLeaveRejected(request, requestUser, approverUser, rejectionReason).catch(console.error);

    return request;
  }

  /**
   * Cancel a leave request
   */
  static async cancelLeaveRequest(requestId: string, userId: string): Promise<LeaveRequest> {
    const requestIndex = mockLeaveRequests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Leave request not found');
    }

    const request = mockLeaveRequests[requestIndex];

    if (request.userId !== userId) {
      throw new Error('You can only cancel your own leave requests');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new Error('Only pending leave requests can be cancelled');
    }

    // Update request status
    request.status = LeaveStatus.CANCELLED;
    request.updatedAt = manilaTime.now();

    // Restore balance (remove from pending)
    const balance = getOrCreateLeaveBalance(request.userId, { id: request.userId } as User);
    updateLeaveBalance(balance, request.type, request.totalDays, true, false); // Remove from pending

    // Update balance in storage
    const balanceIndex = mockLeaveBalances.findIndex(b => b.userId === request.userId);
    if (balanceIndex >= 0) {
      mockLeaveBalances[balanceIndex] = { ...balance };
    }

    mockLeaveRequests[requestIndex] = { ...request };

    // Send notification (async - don't await to avoid blocking)
    const requestUser = { id: request.userId } as User;
    LeaveNotificationManager.notifyLeaveCancelled(request, requestUser).catch(console.error);

    return request;
  }

  /**
   * Get leave statistics for a user
   */
  static async getLeaveStatistics(userId: string): Promise<LeaveStatistics> {
    const userRequests = mockLeaveRequests.filter(r => r.userId === userId);
    const currentYear = manilaTime.now().getFullYear();

    const stats: LeaveStatistics = {
      totalRequests: userRequests.length,
      approvedRequests: 0,
      pendingRequests: 0,
      rejectedRequests: 0,
      cancelledRequests: 0,
      totalDaysTaken: 0,
      averageRequestDuration: 0,
      byType: {} as Record<LeaveType, { count: number; days: number; percentage: number }>,
      byStatus: {} as Record<LeaveStatus, number>,
      currentYearUsage: {
        vacation: 0,
        sick: 0,
        emergency: 0,
        personal: 0,
      },
    };

    // Initialize counters
    Object.values(LeaveType).forEach(type => {
      stats.byType[type] = { count: 0, days: 0, percentage: 0 };
    });

    Object.values(LeaveStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });

    let totalDays = 0;

    userRequests.forEach(request => {
      // Count by status
      stats.byStatus[request.status]++;

      // Count by type
      stats.byType[request.type].count++;
      stats.byType[request.type].days += request.totalDays;
      totalDays += request.totalDays;

      // Current year usage
      if (request.status === LeaveStatus.APPROVED) {
        if (request.startDate.getFullYear() === currentYear || request.endDate.getFullYear() === currentYear) {
          switch (request.type) {
            case LeaveType.VACATION:
              stats.currentYearUsage.vacation += request.totalDays;
              break;
            case LeaveType.SICK:
              stats.currentYearUsage.sick += request.totalDays;
              break;
            case LeaveType.EMERGENCY:
              stats.currentYearUsage.emergency += request.totalDays;
              break;
            case LeaveType.PERSONAL:
              stats.currentYearUsage.personal += request.totalDays;
              break;
          }
        }
        stats.totalDaysTaken += request.totalDays;
      }

      // Status counts
      switch (request.status) {
        case LeaveStatus.APPROVED:
          stats.approvedRequests++;
          break;
        case LeaveStatus.PENDING:
          stats.pendingRequests++;
          break;
        case LeaveStatus.REJECTED:
          stats.rejectedRequests++;
          break;
        case LeaveStatus.CANCELLED:
          stats.cancelledRequests++;
          break;
      }
    });

    // Calculate percentages
    Object.keys(stats.byType).forEach(type => {
      const leaveType = type as LeaveType;
      if (totalDays > 0) {
        stats.byType[leaveType].percentage = (stats.byType[leaveType].days / totalDays) * 100;
      }
    });

    // Calculate average duration
    if (userRequests.length > 0) {
      stats.averageRequestDuration = totalDays / userRequests.length;
    }

    return stats;
  }

  /**
   * Get all leave requests (for managers/admins)
   */
  static async getAllLeaveRequests(options: {
    userId?: string;
    status?: LeaveStatus;
    type?: LeaveType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<LeaveRequest[]> {
    let requests = [...mockLeaveRequests];

    // Apply filters
    if (options.userId) {
      requests = requests.filter(r => r.userId === options.userId);
    }

    if (options.status) {
      requests = requests.filter(r => r.status === options.status);
    }

    if (options.type) {
      requests = requests.filter(r => r.type === options.type);
    }

    if (options.startDate) {
      requests = requests.filter(r => r.startDate >= options.startDate!);
    }

    if (options.endDate) {
      requests = requests.filter(r => r.endDate <= options.endDate!);
    }

    // Sort by creation date (newest first)
    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply limit
    if (options.limit) {
      requests = requests.slice(0, options.limit);
    }

    return requests;
  }
}

// Export helper functions
export { calculateLeaveDays, getLeavePolicy };