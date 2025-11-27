/**
 * User Service for VC Time Tracker
 * Business logic layer for user operations and permissions
 */

import {
  UserProfile,
  UserPreferences,
  UserRole,
  Permission,
  HARDCODED_USERS,
  DEFAULT_CURRENT_USER_ID,
  hasPermission,
  canControlUserCard,
  canViewUserCard,
  getInitials
} from '../types';
import { UserPreferencesStorage, CurrentUserStorage } from '../utils/localStorage';

export interface UserSession {
  user: UserProfile;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  lastActivity: string;
}

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  details?: any;
}

export class UserService {
  /**
   * Get all available users
   */
  static getAllUsers(): UserProfile[] {
    return HARDCODED_USERS.filter(user => user.isActive);
  }

  /**
   * Get user by ID
   */
  static getUserById(userId: string): UserProfile | null {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    return user?.isActive ? user : null;
  }

  /**
   * Get current user session
   */
  static getCurrentSession(): UserSession {
    const userId = CurrentUserStorage.getCurrentUserId();
    const user = this.getUserById(userId);

    if (!user) {
      // Fallback to default user
      const defaultUser = this.getUserById(DEFAULT_CURRENT_USER_ID);
      if (!defaultUser) {
        throw new Error('Default user not found');
      }
      CurrentUserStorage.setCurrentUserId(DEFAULT_CURRENT_USER_ID);
      return this.createSession(defaultUser);
    }

    return this.createSession(user);
  }

  /**
   * Create user session
   */
  private static createSession(user: UserProfile): UserSession {
    const preferences = UserPreferencesStorage.getOrCreateUserPreferences(user.id);

    return {
      user,
      preferences,
      isAuthenticated: true,
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * Switch current user
   */
  static switchUser(userId: string): { success: boolean; session?: UserSession; message?: string } {
    const user = this.getUserById(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found or inactive'
      };
    }

    const success = CurrentUserStorage.setCurrentUserId(userId);

    if (success) {
      const session = this.createSession(user);
      this.logUserActivity(userId, 'user_switch', { previousUser: CurrentUserStorage.getCurrentUserId() });

      return {
        success: true,
        session,
        message: `Switched to ${user.fullName}`
      };
    }

    return {
      success: false,
      message: 'Failed to switch user'
    };
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(userId: string, permission: Permission): boolean {
    const user = this.getUserById(userId);
    return user ? hasPermission(user, permission) : false;
  }

  /**
   * Check if current user has specific permission
   */
  static currentUserHasPermission(permission: Permission): boolean {
    const session = this.getCurrentSession();
    return hasPermission(session.user, permission);
  }

  /**
   * Check if user can control another user's card
   */
  static canControlUserCard(currentUserId: string, targetUserId: string): boolean {
    const currentUser = this.getUserById(currentUserId);
    return currentUser ? canControlUserCard(currentUser, targetUserId) : false;
  }

  /**
   * Check if current user can control another user's card
   */
  static currentUserCanControlUserCard(targetUserId: string): boolean {
    const session = this.getCurrentSession();
    return canControlUserCard(session.user, targetUserId);
  }

  /**
   * Check if user can view another user's card
   */
  static canViewUserCard(currentUserId: string, targetUserId: string): boolean {
    const currentUser = this.getUserById(currentUserId);
    return currentUser ? canViewUserCard(currentUser, targetUserId) : false;
  }

  /**
   * Check if current user can view another user's card
   */
  static currentUserCanViewUserCard(targetUserId: string): boolean {
    const session = this.getCurrentSession();
    return canViewUserCard(session.user, targetUserId);
  }

  /**
   * Get user preferences
   */
  static getUserPreferences(userId: string): UserPreferences {
    return UserPreferencesStorage.getOrCreateUserPreferences(userId);
  }

  /**
   * Get current user preferences
   */
  static getCurrentUserPreferences(): UserPreferences {
    const session = this.getCurrentSession();
    return session.preferences;
  }

  /**
   * Update user preferences
   */
  static updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): { success: boolean; message?: string } {
    const currentPreferences = this.getUserPreferences(userId);
    const updatedPreferences: UserPreferences = {
      ...currentPreferences,
      ...preferences,
      id: currentPreferences.id, // Preserve ID
      userId: currentPreferences.userId // Preserve userId
    };

    const success = UserPreferencesStorage.saveUserPreferences(updatedPreferences);

    if (success) {
      this.logUserActivity(userId, 'preferences_updated', preferences);
      return {
        success: true,
        message: 'Preferences updated successfully'
      };
    }

    return {
      success: false,
      message: 'Failed to update preferences'
    };
  }

  /**
   * Update current user preferences
   */
  static updateCurrentUserPreferences(preferences: Partial<UserPreferences>): { success: boolean; message?: string } {
    const session = this.getCurrentSession();
    return this.updateUserPreferences(session.user.id, preferences);
  }

  /**
   * Get users by role
   */
  static getUsersByRole(role: UserRole): UserProfile[] {
    return HARDCODED_USERS.filter(user => user.isActive && user.role === role);
  }

  /**
   * Get all boss users
   */
  static getBossUsers(): UserProfile[] {
    return this.getUsersByRole(UserRole.BOSS);
  }

  /**
   * Get all employee users
   */
  static getEmployeeUsers(): UserProfile[] {
    return this.getUsersByRole(UserRole.EMPLOYEE);
  }

  /**
   * Get user display information
   */
  static getUserDisplayInfo(user: UserProfile): {
    name: string;
    initials: string;
    avatar?: string;
    role: string;
    department?: string;
    position?: string;
  } {
    return {
      name: user.fullName,
      initials: user.initials,
      avatar: user.avatar,
      role: user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      department: user.department,
      position: user.position
    };
  }

  /**
   * Search users by name or email
   */
  static searchUsers(query: string): UserProfile[] {
    const lowerQuery = query.toLowerCase();
    return HARDCODED_USERS.filter(user =>
      user.isActive && (
        user.fullName.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.initials.toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Get user statistics
   */
  static getUserStatistics(): {
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<UserRole, number>;
    usersByDepartment: Record<string, number>;
  } {
    const activeUsers = HARDCODED_USERS.filter(user => user.isActive);

    const usersByRole = HARDCODED_USERS.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    const usersByDepartment = HARDCODED_USERS.reduce((acc, user) => {
      if (user.department) {
        acc[user.department] = (acc[user.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: HARDCODED_USERS.length,
      activeUsers: activeUsers.length,
      usersByRole,
      usersByDepartment
    };
  }

  /**
   * Validate user session
   */
  static validateSession(session: UserSession): boolean {
    if (!session.isAuthenticated || !session.user.isActive) {
      return false;
    }

    // Check if session is not too old (24 hours)
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    return hoursDiff < 24;
  }

  /**
   * Refresh user session
   */
  static refreshSession(): UserSession {
    const currentSession = this.getCurrentSession();

    // Update last activity
    const refreshedSession: UserSession = {
      ...currentSession,
      lastActivity: new Date().toISOString()
    };

    // Optionally, refresh preferences
    refreshedSession.preferences = this.getUserPreferences(currentSession.user.id);

    return refreshedSession;
  }

  /**
   * Logout current user (switch to default)
   */
  static logout(): { success: boolean; message: string } {
    const currentSession = this.getCurrentSession();
    this.logUserActivity(currentSession.user.id, 'logout', {});

    const success = CurrentUserStorage.resetToDefaultUser();

    return {
      success,
      message: success ? 'Logged out successfully' : 'Failed to logout'
    };
  }

  /**
   * Get user's work schedule (for future use)
   */
  static getUserWorkSchedule(userId: string): {
    standardHours: number;
    workDays: number[];
    lunchBreakDuration: number;
    shortBreakAllowance: number;
  } {
    const user = this.getUserById(userId);

    // Default schedule - could be customized per user in the future
    return {
      standardHours: 8,
      workDays: [1, 2, 3, 4, 5], // Monday - Friday
      lunchBreakDuration: 30, // minutes
      shortBreakAllowance: 60 // minutes per day
    };
  }

  /**
   * Check if user should be reminded to clock in/out
   */
  static shouldShowReminder(userId: string, reminderType: 'clock_in' | 'clock_out'): boolean {
    const preferences = this.getUserPreferences(userId);

    switch (reminderType) {
      case 'clock_in':
        return preferences.notifications.clockInReminder;
      case 'clock_out':
        return preferences.notifications.clockOutReminder;
      default:
        return false;
    }
  }

  /**
   * Log user activity
   */
  private static logUserActivity(userId: string, action: string, details?: any): void {
    const activity: UserActivity = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      details
    };

    // Store in localStorage for debugging/audit trail
    const activities = JSON.parse(localStorage.getItem('vctime_user_activities') || '[]');
    activities.push(activity);

    // Keep only last 500 activities
    if (activities.length > 500) {
      activities.splice(0, activities.length - 500);
    }

    localStorage.setItem('vctime_user_activities', JSON.stringify(activities));
  }

  /**
   * Get user activity log
   */
  static getUserActivityLog(userId?: string, limit: number = 50): UserActivity[] {
    const activities = JSON.parse(localStorage.getItem('vctime_user_activities') || '[]');

    let filtered = activities;
    if (userId) {
      filtered = activities.filter((activity: UserActivity) => activity.userId === userId);
    }

    return filtered
      .sort((a: UserActivity, b: UserActivity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Initialize user service
   */
  static initialize(): void {
    // Ensure current user is set
    const currentUserId = CurrentUserStorage.getCurrentUserId();
    const currentUser = this.getUserById(currentUserId);

    if (!currentUser) {
      CurrentUserStorage.setCurrentUserId(DEFAULT_CURRENT_USER_ID);
    }

    // Log initialization
    this.logUserActivity(CurrentUserStorage.getCurrentUserId(), 'service_initialized');
  }
}