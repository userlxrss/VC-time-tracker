/**
 * User data models and interfaces for VC Time Tracker
 */

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string; // URL to profile photo
  initials: string; // Fallback display
  isActive: boolean;
  department?: string;
  position?: string;
}

export enum UserRole {
  EMPLOYEE = 'employee',
  BOSS = 'boss',
  ADMIN = 'admin'
}

export enum Permission {
  VIEW_OWN_TIME = 'view_own_time',
  EDIT_OWN_TIME = 'edit_own_time',
  VIEW_ALL_TIME = 'view_all_time',
  EDIT_ALL_TIME = 'edit_all_time',
  VIEW_REPORTS = 'view_reports',
  MANAGE_USERS = 'manage_users',
  APPROVE_TIME = 'approve_time'
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    clockInReminder: boolean;
    clockOutReminder: boolean;
  };
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  defaultBreakDuration: number; // minutes
  autoClockOut?: {
    enabled: boolean;
    time: string; // HH:MM format
  };
}

// Hardcoded users configuration
export const HARDCODED_USERS: UserProfile[] = [
  {
    id: 'user-001',
    firstName: 'Maria',
    lastName: 'Villanueva',
    fullName: 'Maria Villanueva',
    email: 'maria.villanueva@vctime.com',
    role: UserRole.BOSS,
    permissions: [
      Permission.VIEW_OWN_TIME,
      Permission.EDIT_OWN_TIME,
      Permission.VIEW_ALL_TIME,
      Permission.EDIT_ALL_TIME,
      Permission.VIEW_REPORTS,
      Permission.APPROVE_TIME
    ],
    initials: 'MV',
    isActive: true,
    department: 'Management',
    position: 'CEO'
  },
  {
    id: 'user-002',
    firstName: 'Carlos',
    lastName: 'Villanueva',
    fullName: 'Carlos Villanueva',
    email: 'carlos.villanueva@vctime.com',
    role: UserRole.BOSS,
    permissions: [
      Permission.VIEW_OWN_TIME,
      Permission.EDIT_OWN_TIME,
      Permission.VIEW_ALL_TIME,
      Permission.EDIT_ALL_TIME,
      Permission.VIEW_REPORTS,
      Permission.APPROVE_TIME
    ],
    initials: 'CV',
    isActive: true,
    department: 'Management',
    position: 'COO'
  },
  {
    id: 'user-003',
    firstName: 'Larina',
    lastName: 'Villanueva',
    fullName: 'Larina Villanueva',
    email: 'larina.villanueva@vctime.com',
    role: UserRole.EMPLOYEE,
    permissions: [
      Permission.VIEW_OWN_TIME,
      Permission.EDIT_OWN_TIME,
      Permission.VIEW_ALL_TIME // Can view all time entries as per requirements
    ],
    initials: 'LV',
    isActive: true,
    department: 'Operations',
    position: 'Employee'
  }
];

// Default current user (Larina Villanueva)
export const DEFAULT_CURRENT_USER_ID = 'user-003';

// User utility functions
export const getUserById = (userId: string): UserProfile | undefined => {
  return HARDCODED_USERS.find(user => user.id === userId);
};

export const hasPermission = (user: UserProfile, permission: Permission): boolean => {
  return user.permissions.includes(permission);
};

export const canControlUserCard = (currentUser: UserProfile, targetUserId: string): boolean => {
  // Users can control their own card
  if (currentUser.id === targetUserId) {
    return true;
  }

  // Bosses can control all cards
  if (currentUser.role === UserRole.BOSS || currentUser.role === UserRole.ADMIN) {
    return true;
  }

  return false;
};

export const canViewUserCard = (currentUser: UserProfile, targetUserId: string): boolean => {
  // All users can view all cards as per requirements
  return true;
};

export const formatUserDisplayName = (user: UserProfile): string => {
  return user.fullName;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};