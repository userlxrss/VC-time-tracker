/**
 * Authentication Context and Types
 *
 * Provides authentication state management and role-based access control
 * for the HR Time Tracker application.
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserRole, EmploymentStatus } from '../../database-schema';

// ==================== AUTH TYPES ====================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_REFRESH'; payload: User };

// ==================== INITIAL STATE ====================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ==================== AUTH REDUCER ====================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_REFRESH':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// ==================== LOCAL STORAGE UTILITIES ====================

const STORAGE_KEY = 'hr_tracker_auth';

class AuthStorage {
  static saveUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  }

  static getUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const user = JSON.parse(stored);
      // Convert string dates back to Date objects
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
      if (user.hireDate) user.hireDate = new Date(user.hireDate);
      if (user.lastLoginAt) user.lastLoginAt = new Date(user.lastLoginAt);

      return user;
    } catch (error) {
      console.warn('Failed to parse user from localStorage:', error);
      this.clearUser();
      return null;
    }
  }

  static clearUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear user from localStorage:', error);
    }
  }
}

// ==================== MOCK USER DATABASE ====================

const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'Larina',
    lastName: 'Cruz',
    email: 'larina@company.com',
    passwordHash: 'password123', // In production, this would be properly hashed
    role: UserRole.EMPLOYEE,
    employmentStatus: EmploymentStatus.FREELANCE,
    department: 'Operations',
    position: 'Operations Specialist',
    hireDate: new Date('2024-01-15'),
    managerId: '2',
    directReports: [],
    preferredWorkingHours: {
      monday: 8,
      tuesday: 8,
      wednesday: 8,
      thursday: 8,
      friday: 8,
      saturday: 0,
      sunday: 0,
    },
    canWorkFromHome: true,
    flexibleSchedule: true,
    timeZone: 'Asia/Manila',
    isActive: true,
    isFreelancer: true,
    hourlyRate: 350,
    paymentMethod: 'GCash',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Ella',
    lastName: 'Rodriguez',
    email: 'ella@company.com',
    passwordHash: 'password123', // In production, this would be properly hashed
    role: UserRole.MANAGER,
    employmentStatus: EmploymentStatus.FULL_TIME,
    department: 'Management',
    position: 'Operations Manager',
    hireDate: new Date('2023-06-01'),
    directReports: ['1', '3'],
    preferredWorkingHours: {
      monday: 9,
      tuesday: 9,
      wednesday: 9,
      thursday: 9,
      friday: 9,
      saturday: 0,
      sunday: 0,
    },
    canWorkFromHome: true,
    flexibleSchedule: true,
    timeZone: 'Asia/Manila',
    isActive: true,
    isFreelancer: false,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Peej',
    lastName: 'Santos',
    email: 'peej@company.com',
    passwordHash: 'password123', // In production, this would be properly hashed
    role: UserRole.MANAGER,
    employmentStatus: EmploymentStatus.FULL_TIME,
    department: 'IT',
    position: 'IT Manager',
    hireDate: new Date('2023-03-15'),
    directReports: [],
    preferredWorkingHours: {
      monday: 8,
      tuesday: 8,
      wednesday: 8,
      thursday: 8,
      friday: 8,
      saturday: 4,
      sunday: 0,
    },
    canWorkFromHome: true,
    flexibleSchedule: true,
    timeZone: 'Asia/Manila',
    isActive: true,
    isFreelancer: false,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-03-15'),
  },
];

// ==================== AUTH PROVIDER ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = AuthStorage.getUser();
        if (storedUser) {
          // Verify user still exists in our "database"
          const userExists = mockUsers.find(u => u.id === storedUser.id);
          if (userExists) {
            // Update last login time
            const updatedUser = {
              ...userExists,
              lastLoginAt: new Date(),
            };
            AuthStorage.saveUser(updatedUser);
            dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
          } else {
            // User no longer exists in our database
            AuthStorage.clearUser();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find user by email
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'User not found' });
        return false;
      }

      // In a real app, we would hash the password and compare
      if (user.passwordHash !== password) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid password' });
        return false;
      }

      if (!user.isActive) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Account is inactive' });
        return false;
      }

      // Update last login time
      const updatedUser = {
        ...user,
        lastLoginAt: new Date(),
      };

      // Save to localStorage
      AuthStorage.saveUser(updatedUser);

      // Update state
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const logout = () => {
    AuthStorage.clearUser();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    if (!state.user) return;

    try {
      // In a real app, this would fetch fresh user data from the API
      const freshUser = mockUsers.find(u => u.id === state.user!.id);
      if (freshUser) {
        const updatedUser = {
          ...freshUser,
          lastLoginAt: state.user.lastLoginAt, // Preserve last login time
        };
        AuthStorage.saveUser(updatedUser);
        dispatch({ type: 'AUTH_REFRESH', payload: updatedUser });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== AUTH HOOK ====================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ==================== AUTH GUARD HOOK ====================

interface UseRequireAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { requiredRole, redirectTo = '/login' } = options;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = redirectTo;
      return;
    }

    if (user && requiredRole && user.role !== requiredRole) {
      // User doesn't have required role
      window.location.href = '/unauthorized';
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, redirectTo]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRequiredRole: !requiredRole || (user?.role === requiredRole),
  };
}

// ==================== ROLE-BASED ACCESS HELPERS ====================

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.EMPLOYEE]: 0,
    [UserRole.FREELANCER]: 0,
    [UserRole.MANAGER]: 1,
    [UserRole.ADMIN]: 2,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canManageTeam(userRole: UserRole): boolean {
  return hasPermission(userRole, UserRole.MANAGER);
}

export function canAccessAllData(userRole: UserRole): boolean {
  return hasPermission(userRole, UserRole.MANAGER);
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, UserRole.ADMIN);
}

export function isManagerOrAbove(userRole: UserRole): boolean {
  return userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
}