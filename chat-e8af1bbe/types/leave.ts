export interface User {
  id: number
  name: string
  email: string
  role: 'boss' | 'employee'
  department: string
  avatar?: string
}

export interface PTOBalance {
  userId: number
  annualLeaveTotal: number // Total annual leave days (15)
  annualLeaveUsed: number // Used annual leave days
  annualLeaveRemaining: number // Remaining annual leave days
  sickLeaveUsed: number // Used sick leave days (unlimited)
  rolloverDays: number // Rollover days from previous year
  lastUpdated: string // ISO date string of last update
  anniversaryDate: string // Anniversary date (August 25)
}

export interface LeaveRequest {
  id: string
  userId: number
  userName: string
  type: 'annual' | 'sick'
  status: 'pending' | 'approved' | 'denied'
  startDate: string // ISO date string
  endDate: string // ISO date string
  isHalfDay: boolean
  halfDayType?: 'morning' | 'afternoon' // For half-day requests
  reason?: string // For annual leave requests
  approverId?: number // ID of the boss who approved/denied
  approverName?: string // Name of the boss who approved/denied
  createdAt: string // ISO date string when request was created
  approvedAt?: string // ISO date string when approved/denied
  denialReason?: string // Reason for denial
  daysCount: number // Number of days requested (calculated)
}

export interface LeaveBalance {
  annualLeave: number
  sickLeave: number
  rolloverDays: number
}

export interface LeaveValidationError {
  field: string
  message: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  browserNotifications: boolean
  notifyOnApproval: boolean
  notifyOnDenial: boolean
  notifyOnRequest: boolean
}

export interface LeavePolicy {
  annualLeaveDays: number
  maxConsecutiveDays: number
  minAdvanceNoticeDays: number
  allowHalfDays: boolean
  allowRollover: boolean
  maxRolloverDays: number
  anniversaryReset: boolean
  resetDate: string // MM-DD format (08-25)
}