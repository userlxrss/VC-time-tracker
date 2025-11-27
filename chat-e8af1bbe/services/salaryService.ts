import { SalaryPayment, SalaryNotification, SalaryFormData, User } from '@/types/salary'

// Constants
const MONTHLY_SALARY = 32444
const CURRENCY = 'PHP'
const SALARY_STORAGE_KEY = 'salary_payments'
const NOTIFICATIONS_STORAGE_KEY = 'salary_notifications'
const USERS_STORAGE_KEY = 'users'

// Mock current user (Larina - Employee ID: 3)
export const CURRENT_USER: User = {
  id: 3,
  name: 'Larina',
  email: 'larina@example.com',
  role: 'Developer',
  department: 'Engineering',
  location: 'Manila, Philippines',
  avatar: 'https://ui-avatars.com/api/?name=Larina&background=6366f1&color=fff',
  status: 'online',
  hoursThisWeek: 32,
  timesheetStatus: 'submitted',
  lastActive: '2 hours ago'
}

// Mock employees
export const MOCK_EMPLOYEES: User[] = [
  CURRENT_USER,
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'Admin',
    department: 'Management',
    location: 'New York, USA',
    avatar: 'https://ui-avatars.com/api/?name=Alex&background=6366f1&color=fff',
    status: 'online',
    hoursThisWeek: 40,
    timesheetStatus: 'submitted',
    lastActive: '1 hour ago'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'Developer',
    department: 'Engineering',
    location: 'Singapore',
    avatar: 'https://ui-avatars.com/api/?name=Sarah&background=ec4899&color=fff',
    status: 'busy',
    hoursThisWeek: 35,
    timesheetStatus: 'pending',
    lastActive: '30 minutes ago'
  },
  {
    id: 4,
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    role: 'Developer',
    department: 'Engineering',
    location: 'Manila, Philippines',
    avatar: 'https://ui-avatars.com/api/?name=Carlos&background=10b981&color=fff',
    status: 'away',
    hoursThisWeek: 38,
    timesheetStatus: 'submitted',
    lastActive: '3 hours ago'
  },
  {
    id: 5,
    name: 'Maya Patel',
    email: 'maya@example.com',
    role: 'Developer',
    department: 'Engineering',
    location: 'Bangalore, India',
    avatar: 'https://ui-avatars.com/api/?name=Maya&background=f59e0b&color=fff',
    status: 'offline',
    hoursThisWeek: 36,
    timesheetStatus: 'overdue',
    lastActive: '1 day ago'
  }
]

export class SalaryService {
  // Storage helpers
  private static getStorageData<T>(key: string): T[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error)
      return []
    }
  }

  private static setStorageData<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error)
    }
  }

  // Initialize with sample data
  static initializeSampleData(): void {
    const existingPayments = this.getStorageData<SalaryPayment>(SALARY_STORAGE_KEY)
    if (existingPayments.length === 0) {
      const samplePayments: SalaryPayment[] = [
        {
          id: '1',
          employeeId: CURRENT_USER.id,
          employeeName: CURRENT_USER.name,
          amount: MONTHLY_SALARY,
          currency: CURRENCY,
          month: '2025-09',
          workPeriod: 'September 2025',
          paymentDate: '2025-10-25',
          markedAsPaidDate: '2025-10-24T10:30:00',
          confirmedByEmployeeDate: '2025-10-25T09:15:00',
          status: 'confirmed',
          notes: 'Payment for September work',
          markedByBossId: 1,
          markedByBossName: 'Alex Johnson'
        },
        {
          id: '2',
          employeeId: CURRENT_USER.id,
          employeeName: CURRENT_USER.name,
          amount: MONTHLY_SALARY,
          currency: CURRENCY,
          month: '2025-10',
          workPeriod: 'October 2025',
          paymentDate: '2025-11-25',
          markedAsPaidDate: '2025-11-10T14:45:00',
          confirmedByEmployeeDate: null,
          status: 'marked_as_paid',
          notes: 'Payment for October work',
          markedByBossId: 1,
          markedByBossName: 'Alex Johnson'
        },
        {
          id: '3',
          employeeId: CURRENT_USER.id,
          employeeName: CURRENT_USER.name,
          amount: MONTHLY_SALARY,
          currency: CURRENCY,
          month: '2025-11',
          workPeriod: 'November 2025',
          paymentDate: '2025-12-25',
          markedAsPaidDate: null,
          confirmedByEmployeeDate: null,
          status: 'pending',
          notes: null,
          markedByBossId: null,
          markedByBossName: null
        }
      ]
      this.setStorageData(SALARY_STORAGE_KEY, samplePayments)
    }
  }

  // Get all payments (for boss view)
  static getAllPayments(): SalaryPayment[] {
    this.initializeSampleData()
    return this.getStorageData<SalaryPayment>(SALARY_STORAGE_KEY).sort((a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )
  }

  // Get payments for current employee
  static getEmployeePayments(employeeId: number = CURRENT_USER.id): SalaryPayment[] {
    this.initializeSampleData()
    return this.getStorageData<SalaryPayment>(SALARY_STORAGE_KEY)
      .filter(payment => payment.employeeId === employeeId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
  }

  // Get payment by ID
  static getPaymentById(paymentId: string): SalaryPayment | null {
    const payments = this.getStorageData<SalaryPayment>(SALARY_STORAGE_KEY)
    return payments.find(payment => payment.id === paymentId) || null
  }

  // Mark salary as paid (boss function)
  static markSalaryAsPaid(formData: SalaryFormData, bossId: number = 1): SalaryPayment {
    const payments = this.getStorageData<SalaryPayment>(SALARY_STORAGE_KEY)

    // Check if payment already exists for this employee and month
    const existingPaymentIndex = payments.findIndex(
      p => p.employeeId === formData.employeeId && p.month === formData.month
    )

    const newPayment: SalaryPayment = {
      id: existingPaymentIndex >= 0 ? payments[existingPaymentIndex].id : Date.now().toString(),
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      amount: formData.amount,
      currency: CURRENCY,
      month: formData.month,
      workPeriod: formData.workPeriod,
      paymentDate: formData.paymentDate,
      markedAsPaidDate: new Date().toISOString(),
      confirmedByEmployeeDate: existingPaymentIndex >= 0 ? payments[existingPaymentIndex].confirmedByEmployeeDate : null,
      status: 'marked_as_paid',
      notes: formData.notes,
      markedByBossId: bossId,
      markedByBossName: MOCK_EMPLOYEES.find(emp => emp.id === bossId)?.name || 'Unknown'
    }

    if (existingPaymentIndex >= 0) {
      payments[existingPaymentIndex] = newPayment
    } else {
      payments.push(newPayment)
    }

    this.setStorageData(SALARY_STORAGE_KEY, payments)

    // Create notification for employee
    this.createNotification({
      id: Date.now().toString(),
      type: 'salary_marked_paid',
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      amount: formData.amount,
      month: formData.month,
      timestamp: new Date().toISOString(),
      message: `Your salary of ₱${formData.amount.toLocaleString()} for ${formData.workPeriod} has been marked as paid and will be processed on ${formData.paymentDate}`,
      read: false
    })

    return newPayment
  }

  // Confirm salary receipt (employee function)
  static confirmSalaryReceipt(paymentId: string, employeeId: number = CURRENT_USER.id): boolean {
    const payments = this.getStorageData<SalaryPayment>(SALARY_STORAGE_KEY)
    const paymentIndex = payments.findIndex(
      p => p.id === paymentId && p.employeeId === employeeId
    )

    if (paymentIndex === -1 || payments[paymentIndex].status !== 'marked_as_paid') {
      return false
    }

    payments[paymentIndex].status = 'confirmed'
    payments[paymentIndex].confirmedByEmployeeDate = new Date().toISOString()

    this.setStorageData(SALARY_STORAGE_KEY, payments)

    // Create notification
    const payment = payments[paymentIndex]
    this.createNotification({
      id: Date.now().toString(),
      type: 'salary_confirmed',
      employeeId: employeeId,
      employeeName: payment.employeeName,
      amount: payment.amount,
      month: payment.month,
      timestamp: new Date().toISOString(),
      message: `${payment.employeeName} has confirmed receipt of salary payment for ${payment.workPeriod}`,
      read: false
    })

    return true
  }

  // Get notifications for current user
  static getNotifications(employeeId: number = CURRENT_USER.id): SalaryNotification[] {
    const notifications = this.getStorageData<SalaryNotification>(NOTIFICATIONS_STORAGE_KEY)
    const userNotifications = notifications.filter(notif => {
      // Employee sees their own notifications
      if (notif.type === 'salary_marked_paid') {
        return notif.employeeId === employeeId
      }
      // Boss sees all confirmations
      return notif.type === 'salary_confirmed' && employeeId === 1 // Assuming boss has ID 1
    })

    return userNotifications.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  // Create notification
  private static createNotification(notification: SalaryNotification): void {
    const notifications = this.getStorageData<SalaryNotification>(NOTIFICATIONS_STORAGE_KEY)
    notifications.push(notification)

    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(0, notifications.length - 50)
    }

    this.setStorageData(NOTIFICATIONS_STORAGE_KEY, notifications)
  }

  // Mark notification as read
  static markNotificationAsRead(notificationId: string): boolean {
    const notifications = this.getStorageData<SalaryNotification>(NOTIFICATIONS_STORAGE_KEY)
    const notificationIndex = notifications.findIndex(n => n.id === notificationId)

    if (notificationIndex === -1) return false

    notifications[notificationIndex].read = true
    this.setStorageData(NOTIFICATIONS_STORAGE_KEY, notifications)
    return true
  }

  // Mark all notifications as read
  static markAllNotificationsAsRead(employeeId: number = CURRENT_USER.id): void {
    const notifications = this.getStorageData<SalaryNotification>(NOTIFICATIONS_STORAGE_KEY)
    notifications.forEach(notif => {
      if (notif.employeeId === employeeId || (notif.type === 'salary_confirmed' && employeeId === 1)) {
        notif.read = true
      }
    })
    this.setStorageData(NOTIFICATIONS_STORAGE_KEY, notifications)
  }

  // Get salary status summary
  static getSalaryStatus(employeeId: number = CURRENT_USER.id): {
    currentMonth: SalaryPayment | null
    previousMonth: SalaryPayment | null
    pendingCount: number
    markedAsPaidCount: number
    confirmedCount: number
  } {
    const payments = this.getEmployeePayments(employeeId)
    const currentDate = new Date()
    const currentMonth = currentDate.toISOString().slice(0, 7)
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).toISOString().slice(0, 7)

    const currentMonthPayment = payments.find(p => p.month === currentMonth) || null
    const previousMonthPayment = payments.find(p => p.month === previousMonth) || null

    return {
      currentMonth: currentMonthPayment,
      previousMonth: previousMonthPayment,
      pendingCount: payments.filter(p => p.status === 'pending').length,
      markedAsPaidCount: payments.filter(p => p.status === 'marked_as_paid').length,
      confirmedCount: payments.filter(p => p.status === 'confirmed').length
    }
  }

  // Check if user is boss
  static isBoss(userId: number = CURRENT_USER.id): boolean {
    return userId === 1 // Assuming boss has ID 1
  }

  // Get users
  static getUsers(): User[] {
    this.initializeSampleData()
    return MOCK_EMPLOYEES
  }

  // Get month/year display format
  static getMonthDisplay(monthString: string): string {
    const [year, month] = monthString.split('-')
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = CURRENCY): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
}