import { LeaveRequest, PTOBalance, LeaveValidationError, LeavePolicy } from '@/types/leave'
import { getLeaveRequests, getPTOBalance, savePTOBalance, getLeavePolicy } from './leave-storage'

/**
 * Calculate the number of business days between two dates (excluding weekends)
 */
export const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  let businessDays = 0
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return businessDays
}

/**
 * Calculate the number of days for a leave request
 */
export const calculateLeaveDays = (request: Omit<LeaveRequest, 'daysCount'>): number => {
  if (request.isHalfDay) {
    return 0.5
  }

  const startDate = new Date(request.startDate)
  const endDate = new Date(request.endDate)
  return calculateBusinessDays(startDate, endDate)
}

/**
 * Check if a date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

/**
 * Check if a date range is valid (start <= end)
 */
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate
}

/**
 * Check if dates are in the future
 */
export const areDatesInFuture = (startDate: Date, endDate: Date): boolean => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Both dates should be after today
  return startDate >= today && endDate >= today
}

/**
 * Check if sufficient advance notice is given
 */
export const hasSufficientAdvanceNotice = (
  startDate: Date,
  minDays: number
): boolean => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntilStart >= minDays
}

/**
 * Check if a date range overlaps with existing approved leaves
 */
export const hasDateOverlap = (
  userId: number,
  startDate: Date,
  endDate: Date,
  excludeRequestId?: string
): boolean => {
  const existingRequests = getLeaveRequests()

  return existingRequests.some(request => {
    // Skip if this is the same request being updated
    if (request.id === excludeRequestId) return false

    // Only check approved leaves for the same user
    if (request.userId !== userId || request.status !== 'approved') return false

    const existingStart = new Date(request.startDate)
    const existingEnd = new Date(request.endDate)

    // Check if date ranges overlap
    return (
      (startDate <= existingEnd && endDate >= existingStart)
    )
  })
}

/**
 * Validate a leave request
 */
export const validateLeaveRequest = (
  request: Omit<LeaveRequest, 'id' | 'createdAt' | 'daysCount' | 'status' | 'userName' | 'approverId' | 'approverName' | 'approvedAt' | 'denialReason'>,
  excludeRequestId?: string
): LeaveValidationError[] => {
  const errors: LeaveValidationError[] = []
  const policy = getLeavePolicy()

  // Basic field validation
  if (!request.reason && request.type === 'annual') {
    errors.push({ field: 'reason', message: 'Reason is required for annual leave requests' })
  }

  if (request.isHalfDay && !request.halfDayType) {
    errors.push({ field: 'halfDayType', message: 'Please specify morning or afternoon for half-day leave' })
  }

  // Date validation
  const startDate = new Date(request.startDate)
  const endDate = new Date(request.endDate)

  if (!isValidDateRange(startDate, endDate)) {
    errors.push({ field: 'dates', message: 'End date must be after or equal to start date' })
  }

  if (!areDatesInFuture(startDate, endDate)) {
    errors.push({ field: 'dates', message: 'Leave dates must be in the future' })
  }

  if (request.type === 'annual' && !hasSufficientAdvanceNotice(startDate, policy.minAdvanceNoticeDays)) {
    errors.push({
      field: 'dates',
      message: `Annual leave requires at least ${policy.minAdvanceNoticeDays} days advance notice`
    })
  }

  // Check for weekends in date range (unless it's just a weekend avoidance)
  if (!request.isHalfDay) {
    let hasWeekends = false
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      if (isWeekend(currentDate)) {
        hasWeekends = true
        break
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (hasWeekends) {
      errors.push({ field: 'dates', message: 'Leave requests cannot include weekends' })
    }
  }

  // Check for overlapping approved leaves
  if (hasDateOverlap(request.userId, startDate, endDate, excludeRequestId)) {
    errors.push({ field: 'dates', message: 'You already have approved leave during this period' })
  }

  // Check consecutive days limit
  if (!request.isHalfDay) {
    const businessDays = calculateBusinessDays(startDate, endDate)
    if (businessDays > policy.maxConsecutiveDays) {
      errors.push({
        field: 'dates',
        message: `Maximum consecutive days allowed is ${policy.maxConsecutiveDays}`
      })
    }
  }

  // Check PTO balance for annual leave
  if (request.type === 'annual') {
    const balance = getPTOBalance(request.userId)
    if (balance) {
      const daysRequested = calculateLeaveDays(request)
      if (daysRequested > balance.annualLeaveRemaining + balance.rolloverDays) {
        errors.push({
          field: 'balance',
          message: 'Insufficient PTO balance for this request'
        })
      }
    }
  }

  return errors
}

/**
 * Update PTO balance when leave is approved
 */
export const updatePTOBalanceOnApproval = (request: LeaveRequest): void => {
  if (request.type !== 'annual' || request.status !== 'approved') return

  const balance = getPTOBalance(request.userId)
  if (!balance) return

  const daysToDeduct = request.daysCount

  // First use rollover days, then annual leave
  let remainingDaysToDeduct = daysToDeduct
  let newRolloverDays = balance.rolloverDays

  if (newRolloverDays > 0) {
    const rolloverUsed = Math.min(newRolloverDays, remainingDaysToDeduct)
    newRolloverDays -= rolloverUsed
    remainingDaysToDeduct -= rolloverUsed
  }

  // Deduct remaining from annual leave
  const newAnnualLeaveUsed = balance.annualLeaveUsed + remainingDaysToDeduct
  const newAnnualLeaveRemaining = balance.annualLeaveTotal - newAnnualLeaveUsed

  const updatedBalance: PTOBalance = {
    ...balance,
    annualLeaveUsed: newAnnualLeaveUsed,
    annualLeaveRemaining: newAnnualLeaveRemaining,
    rolloverDays: newRolloverDays,
    lastUpdated: new Date().toISOString()
  }

  savePTOBalance(updatedBalance)
}

/**
 * Check if PTO balance needs to be reset (anniversary date has passed)
 */
export const checkAndResetPTOBalance = (userId: number): PTOBalance | null => {
  const balance = getPTOBalance(userId)
  const policy = getLeavePolicy()

  if (!balance || !policy.anniversaryReset) return balance

  const today = new Date()
  const currentYear = today.getFullYear()
  const anniversaryDate = new Date(`${currentYear}-${policy.resetDate}`)

  // If anniversary has passed this year, check if balance was already updated
  if (today >= anniversaryDate) {
    const lastUpdateDate = new Date(balance.lastUpdated)

    // If last update was before this year's anniversary, reset the balance
    if (lastUpdateDate < anniversaryDate) {
      const rolloverDaysToKeep = Math.min(
        balance.annualLeaveRemaining,
        policy.maxRolloverDays
      )

      const resetBalance: PTOBalance = {
        ...balance,
        annualLeaveUsed: 0,
        annualLeaveRemaining: policy.annualLeaveDays + rolloverDaysToKeep,
        rolloverDays: rolloverDaysToKeep,
        lastUpdated: new Date().toISOString(),
        anniversaryDate: anniversaryDate.toISOString()
      }

      savePTOBalance(resetBalance)
      return resetBalance
    }
  }

  return balance
}

/**
 * Get leave statistics for a user
 */
export const getLeaveStatistics = (userId: number) => {
  const requests = getLeaveRequests()
  const userRequests = requests.filter(req => req.userId === userId)

  const currentYear = new Date().getFullYear()
  const currentYearRequests = userRequests.filter(req => {
    const reqYear = new Date(req.startDate).getFullYear()
    return reqYear === currentYear
  })

  const stats = {
    totalRequests: userRequests.length,
    approvedRequests: userRequests.filter(req => req.status === 'approved').length,
    pendingRequests: userRequests.filter(req => req.status === 'pending').length,
    deniedRequests: userRequests.filter(req => req.status === 'denied').length,
    currentYearStats: {
      annualLeaveUsed: currentYearRequests
        .filter(req => req.type === 'annual' && req.status === 'approved')
        .reduce((sum, req) => sum + req.daysCount, 0),
      sickLeaveUsed: currentYearRequests
        .filter(req => req.type === 'sick' && req.status === 'approved')
        .reduce((sum, req) => sum + req.daysCount, 0),
      totalDaysUsed: currentYearRequests
        .filter(req => req.status === 'approved')
        .reduce((sum, req) => sum + req.daysCount, 0)
    }
  }

  return stats
}

/**
 * Format date for display
 */
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString)

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Generate leave request ID
 */
export const generateLeaveRequestId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `leave_${timestamp}_${random}`
}