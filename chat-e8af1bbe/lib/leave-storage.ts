import { LeaveRequest, PTOBalance, User, LeavePolicy } from '@/types/leave'

// Storage keys
const STORAGE_KEYS = {
  LEAVE_REQUESTS: 'vc-leave-requests',
  PTO_BALANCES: 'vc-pto-balances',
  USERS: 'vc-users',
  LEAVE_POLICY: 'vc-leave-policy',
  CURRENT_USER: 'vc-current-user'
}

// Default users
export const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: 'Maria',
    email: 'maria@vctime.com',
    role: 'boss',
    department: 'Management',
    avatar: '/avatars/maria.jpg'
  },
  {
    id: 2,
    name: 'Carlos',
    email: 'carlos@vctime.com',
    role: 'boss',
    department: 'Management',
    avatar: '/avatars/carlos.jpg'
  },
  {
    id: 3,
    name: 'Larina',
    email: 'larina@vctime.com',
    role: 'employee',
    department: 'Development',
    avatar: '/avatars/larina.jpg'
  }
]

// Default leave policy
export const DEFAULT_LEAVE_POLICY: LeavePolicy = {
  annualLeaveDays: 15,
  maxConsecutiveDays: 10,
  minAdvanceNoticeDays: 3,
  allowHalfDays: true,
  allowRollover: true,
  maxRolloverDays: 5,
  anniversaryReset: true,
  resetDate: '08-25'
}

// Generic storage helpers
const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
    return defaultValue
  }
}

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error)
  }
}

// Leave Requests Storage
export const getLeaveRequests = (): LeaveRequest[] => {
  return getItem(STORAGE_KEYS.LEAVE_REQUESTS, [] as LeaveRequest[])
}

export const saveLeaveRequests = (requests: LeaveRequest[]): void => {
  setItem(STORAGE_KEYS.LEAVE_REQUESTS, requests)
}

export const addLeaveRequest = (request: LeaveRequest): void => {
  const requests = getLeaveRequests()
  requests.push(request)
  saveLeaveRequests(requests)
}

export const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>): void => {
  const requests = getLeaveRequests()
  const index = requests.findIndex(req => req.id === id)
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates }
    saveLeaveRequests(requests)
  }
}

export const deleteLeaveRequest = (id: string): void => {
  const requests = getLeaveRequests().filter(req => req.id !== id)
  saveLeaveRequests(requests)
}

// PTO Balances Storage
export const getPTOBalances = (): PTOBalance[] => {
  return getItem(STORAGE_KEYS.PTO_BALANCES, [] as PTOBalance[])
}

export const savePTOBalances = (balances: PTOBalance[]): void => {
  setItem(STORAGE_KEYS.PTO_BALANCES, balances)
}

export const getPTOBalance = (userId: number): PTOBalance | null => {
  const balances = getPTOBalances()
  return balances.find(balance => balance.userId === userId) || null
}

export const savePTOBalance = (balance: PTOBalance): void => {
  const balances = getPTOBalances()
  const existingIndex = balances.findIndex(b => b.userId === balance.userId)

  if (existingIndex !== -1) {
    balances[existingIndex] = balance
  } else {
    balances.push(balance)
  }

  savePTOBalances(balances)
}

export const initializePTOBalance = (userId: number): PTOBalance => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const anniversaryDate = `${currentYear}-08-25` // August 25

  const balance: PTOBalance = {
    userId,
    annualLeaveTotal: DEFAULT_LEAVE_POLICY.annualLeaveDays,
    annualLeaveUsed: 0,
    annualLeaveRemaining: DEFAULT_LEAVE_POLICY.annualLeaveDays,
    sickLeaveUsed: 0,
    rolloverDays: 0,
    lastUpdated: new Date().toISOString(),
    anniversaryDate
  }

  savePTOBalance(balance)
  return balance
}

// Users Storage
export const getUsers = (): User[] => {
  return getItem(STORAGE_KEYS.USERS, DEFAULT_USERS)
}

export const getCurrentUser = (): User | null => {
  return getItem(STORAGE_KEYS.CURRENT_USER, null as User | null)
}

export const setCurrentUser = (user: User): void => {
  setItem(STORAGE_KEYS.CURRENT_USER, user)
}

// Leave Policy Storage
export const getLeavePolicy = (): LeavePolicy => {
  return getItem(STORAGE_KEYS.LEAVE_POLICY, DEFAULT_LEAVE_POLICY)
}

export const saveLeavePolicy = (policy: LeavePolicy): void => {
  setItem(STORAGE_KEYS.LEAVE_POLICY, policy)
}

// Initialize data if not exists
export const initializeData = (): void => {
  if (typeof window === 'undefined') return

  // Initialize users if not exists
  const users = getItem(STORAGE_KEYS.USERS, null)
  if (!users) {
    setItem(STORAGE_KEYS.USERS, DEFAULT_USERS)
  }

  // Initialize leave policy if not exists
  const policy = getItem(STORAGE_KEYS.LEAVE_POLICY, null)
  if (!policy) {
    setItem(STORAGE_KEYS.LEAVE_POLICY, DEFAULT_LEAVE_POLICY)
  }

  // Initialize PTO balances for all users if not exists
  const balances = getPTOBalances()
  const allUsers = getUsers()

  allUsers.forEach(user => {
    const userBalance = balances.find(b => b.userId === user.id)
    if (!userBalance) {
      initializePTOBalance(user.id)
    }
  })

  // Set current user if not exists (default to Larina for demo)
  const currentUser = getCurrentUser()
  if (!currentUser) {
    setCurrentUser(DEFAULT_USERS.find(u => u.id === 3) || DEFAULT_USERS[0])
  }
}

// Clear all data (for testing/reset)
export const clearAllLeaveData = (): void => {
  if (typeof window === 'undefined') return

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

// Data export/import functionality
export const exportData = (): string => {
  const data = {
    leaveRequests: getLeaveRequests(),
    ptoBalances: getPTOBalances(),
    users: getUsers(),
    leavePolicy: getLeavePolicy(),
    exportDate: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString)

    if (data.leaveRequests) {
      setItem(STORAGE_KEYS.LEAVE_REQUESTS, data.leaveRequests)
    }

    if (data.ptoBalances) {
      setItem(STORAGE_KEYS.PTO_BALANCES, data.ptoBalances)
    }

    if (data.users) {
      setItem(STORAGE_KEYS.USERS, data.users)
    }

    if (data.leavePolicy) {
      setItem(STORAGE_KEYS.LEAVE_POLICY, data.leavePolicy)
    }

    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}