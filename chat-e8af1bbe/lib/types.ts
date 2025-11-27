export interface User {
  id: number
  name: string
  email: string
  role: 'boss' | 'employee'
  department: string
  location: string
  avatar: string
  status: 'online' | 'offline' | 'away' | 'busy'
  hoursThisWeek: number
  timesheetStatus: 'submitted' | 'pending' | 'overdue'
  lastActive: string
  clockedIn: boolean
  salary?: number
  leaveBalance?: number
}

export interface AuthUser {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  canAccessUser: (targetUserId: number) => boolean
}

export type Permission =
  | 'view_all_users'
  | 'edit_own_profile'
  | 'edit_all_profiles'
  | 'approve_leave'
  | 'manage_salary'
  | 'view_dashboard'
  | 'access_boss_pages'
  | 'edit_timesheet'

export const USERS: User[] = [
  {
    id: 1,
    name: 'Maria',
    email: 'maria@vc.com',
    role: 'boss',
    department: 'Management',
    location: 'San Francisco, CA',
    avatar: '/avatars/maria.jpg',
    status: 'online',
    hoursThisWeek: 42,
    timesheetStatus: 'submitted',
    lastActive: '2 minutes ago',
    clockedIn: true,
    salary: 120000,
    leaveBalance: 15
  },
  {
    id: 2,
    name: 'Carlos',
    email: 'carlos@vc.com',
    role: 'boss',
    department: 'Management',
    location: 'New York, NY',
    avatar: '/avatars/carlos.jpg',
    status: 'online',
    hoursThisWeek: 40,
    timesheetStatus: 'submitted',
    lastActive: '10 minutes ago',
    clockedIn: true,
    salary: 115000,
    leaveBalance: 12
  },
  {
    id: 3,
    name: 'Larina',
    email: 'larina@vc.com',
    role: 'employee',
    department: 'Development',
    location: 'Austin, TX',
    avatar: '/avatars/larina.jpg',
    status: 'online',
    hoursThisWeek: 38,
    timesheetStatus: 'pending',
    lastActive: '5 minutes ago',
    clockedIn: true,
    salary: 75000,
    leaveBalance: 10
  }
]

export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  boss: [
    'view_all_users',
    'edit_own_profile',
    'edit_all_profiles',
    'approve_leave',
    'manage_salary',
    'view_dashboard',
    'access_boss_pages',
    'edit_timesheet'
  ],
  employee: [
    'edit_own_profile',
    'view_dashboard',
    'edit_timesheet'
  ]
}

export const DEFAULT_USER_ID = 3 // Larina