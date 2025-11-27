import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import {
  User,
  TimeEntry,
  LeaveRequest,
  SalaryPayment,
  Notification
} from './lib/types';
import {
  getTimeEntries,
  saveTimeEntry,
  getLeaveRequests,
  saveLeaveRequest,
  getSalaryPayments,
  saveSalaryPayment,
  getNotifications,
  saveNotification,
  markNotificationAsRead,
  getCurrentTimeEntry,
  getPendingLeaveRequests,
  getUsers,
  STORAGE_KEYS,
  generateId,
  formatDate,
  formatTime,
  calculateHoursWorked
} from './lib/storage';

// ==================== GLOBAL APP STATE ====================

interface GlobalState {
  currentUser: User | null;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

interface GlobalContextType extends GlobalState {
  setCurrentUser: (user: User | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: number) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Load current user
        const users = getUsers();
        const user = users.find(u => u.id === 3) || users[0]; // Larina as default
        setCurrentUser(user);

        // Load notifications
        const notifs = getNotifications();
        setNotifications(notifs);

        // Load theme preference
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
        if (savedTheme) {
          setTheme(savedTheme);
        }

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load initial data');
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.NOTIFICATIONS) {
        const notifs = getNotifications();
        setNotifications(notifs);
      }
      if (e.key === STORAGE_KEYS.THEME) {
        const newTheme = e.newValue as 'light' | 'dark';
        if (newTheme) setTheme(newTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    saveNotification(newNotification);
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const markAsRead = useCallback((notificationId: number) => {
    markNotificationAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: GlobalContextType = {
    currentUser,
    notifications,
    unreadCount,
    isLoading,
    error,
    theme,
    setCurrentUser,
    addNotification,
    markAsRead,
    clearError,
    setLoading: setIsLoading,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalProvider');
  }
  return context;
};

// ==================== DASHBOARD STATE MANAGEMENT ====================

interface DashboardState {
  teamMembers: User[];
  timeEntries: TimeEntry[];
  leaveRequests: LeaveRequest[];
  activeUsersCount: number;
  pendingRequestsCount: number;
  weeklyTrendsData: { day: string; hours: number }[];
  alerts: Array<{
    id: number;
    type: 'warning' | 'info' | 'success';
    message: string;
    timestamp: string;
  }>;
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'on_break' | 'clocked_out';
  sortBy: 'name' | 'status' | 'hours';
  sortOrder: 'asc' | 'desc';
}

interface DashboardActions {
  refreshData: () => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: 'all' | 'active' | 'on_break' | 'clocked_out') => void;
  setSortBy: (sortBy: 'name' | 'status' | 'hours') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  updateUserStatus: (userId: number, status: TimeEntry['status']) => void;
  clockInUser: (userId: number) => void;
  clockOutUser: (userId: number) => void;
  approveLeaveRequest: (requestId: number) => void;
  denyLeaveRequest: (requestId: number) => void;
}

export const useDashboardState = (): DashboardState & DashboardActions => {
  const { addNotification, currentUser } = useGlobalState();
  const [state, setState] = useState<DashboardState>({
    teamMembers: [],
    timeEntries: [],
    leaveRequests: [],
    activeUsersCount: 0,
    pendingRequestsCount: 0,
    weeklyTrendsData: [],
    alerts: [],
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Load and refresh data
  const refreshData = useCallback(() => {
    try {
      const members = getUsers();
      const entries = getTimeEntries();
      const leaves = getLeaveRequests();
      const pendingLeaves = getPendingLeaveRequests();

      // Calculate active users
      const activeUsers = entries.filter(entry =>
        ['clocked_in', 'on_lunch', 'on_break'].includes(entry.status)
      ).length;

      // Calculate weekly trends (last 7 days)
      const weeklyData = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);

        const dayEntries = entries.filter(entry => entry.date === dateStr);
        const totalHours = dayEntries.reduce((sum, entry) =>
          sum + (entry.totalHours || 0), 0
        );

        weeklyData.push({
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          hours: Math.round(totalHours * 10) / 10
        });
      }

      // Generate alerts
      const alerts = [];

      // Late clock-ins today
      const todayStr = formatDate(new Date());
      const lateUsers = entries.filter(entry =>
        entry.date === todayStr && entry.isLate && entry.status !== 'clocked_out'
      );

      if (lateUsers.length > 0) {
        alerts.push({
          id: generateId(),
          type: 'warning' as const,
          message: `${lateUsers.length} team members clocked in late today`,
          timestamp: new Date().toISOString()
        });
      }

      // Pending leave requests
      if (pendingLeaves.length > 0) {
        alerts.push({
          id: generateId(),
          type: 'info' as const,
          message: `${pendingLeaves.length} leave requests pending approval`,
          timestamp: new Date().toISOString()
        });
      }

      setState(prev => ({
        ...prev,
        teamMembers: members,
        timeEntries: entries,
        leaveRequests: leaves,
        activeUsersCount: activeUsers,
        pendingRequestsCount: pendingLeaves.length,
        weeklyTrendsData: weeklyData,
        alerts
      }));
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    refreshData();

    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ([
        STORAGE_KEYS.TIME_ENTRIES,
        STORAGE_KEYS.LEAVE_REQUESTS,
        STORAGE_KEYS.USERS
      ].includes(e.key || '')) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setStatusFilter = useCallback((filter: 'all' | 'active' | 'on_break' | 'clocked_out') => {
    setState(prev => ({ ...prev, statusFilter: filter }));
  }, []);

  const setSortBy = useCallback((sortBy: 'name' | 'status' | 'hours') => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortOrder: order }));
  }, []);

  const updateUserStatus = useCallback((userId: number, status: TimeEntry['status']) => {
    const currentEntry = getCurrentTimeEntry(userId);
    if (currentEntry) {
      const updatedEntry = { ...currentEntry, status };
      saveTimeEntry(updatedEntry);
      refreshData();
    }
  }, [refreshData]);

  const clockInUser = useCallback((userId: number) => {
    const user = getUsers().find(u => u.id === userId);
    if (!user) return;

    const now = new Date();
    const timeEntry: TimeEntry = {
      id: generateId(),
      userId,
      date: formatDate(now),
      clockIn: formatTime(now),
      clockOut: null,
      lunchBreakStart: null,
      lunchBreakEnd: null,
      shortBreaks: [],
      totalHours: null,
      status: 'clocked_in',
      isLate: now.getHours() > 9, // 9 AM threshold
      notes: ''
    };

    saveTimeEntry(timeEntry);
    addNotification({
      userId: userId,
      type: 'salary_paid', // Generic notification type
      title: 'Clock In',
      message: `${user.firstName} clocked in at ${formatTime(now)}`,
      isRead: false
    });

    refreshData();
  }, [addNotification, refreshData]);

  const clockOutUser = useCallback((userId: number) => {
    const currentEntry = getCurrentTimeEntry(userId);
    if (!currentEntry || currentEntry.status === 'clocked_out') return;

    const now = new Date();
    const updatedEntry = {
      ...currentEntry,
      clockOut: formatTime(now),
      status: 'clocked_out' as const,
      totalHours: calculateHoursWorked(currentEntry.clockIn, formatTime(now))
    };

    saveTimeEntry(updatedEntry);
    refreshData();
  }, [refreshData]);

  const approveLeaveRequest = useCallback((requestId: number) => {
    const requests = getLeaveRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request || !currentUser) return;

    const updatedRequest = {
      ...request,
      status: 'approved' as const,
      approvedBy: currentUser.id
    };

    saveLeaveRequest(updatedRequest);

    addNotification({
      userId: request.userId,
      type: 'leave_approved',
      title: 'Leave Approved',
      message: `Your leave request has been approved`,
      isRead: false,
      relatedId: requestId,
      relatedType: 'leave'
    });

    refreshData();
  }, [addNotification, currentUser, refreshData]);

  const denyLeaveRequest = useCallback((requestId: number) => {
    const requests = getLeaveRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request || !currentUser) return;

    const updatedRequest = {
      ...request,
      status: 'denied' as const,
      approvedBy: currentUser.id
    };

    saveLeaveRequest(updatedRequest);

    addNotification({
      userId: request.userId,
      type: 'leave_denied',
      title: 'Leave Denied',
      message: `Your leave request has been denied`,
      isRead: false,
      relatedId: requestId,
      relatedType: 'leave'
    });

    refreshData();
  }, [addNotification, currentUser, refreshData]);

  return {
    ...state,
    refreshData,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    updateUserStatus,
    clockInUser,
    clockOutUser,
    approveLeaveRequest,
    denyLeaveRequest
  };
};

// ==================== USER DETAIL PAGE STATE MANAGEMENT ====================

interface UserDetailState {
  user: User | null;
  timeEntries: TimeEntry[];
  leaveRequests: LeaveRequest[];
  salaryPayments: SalaryPayment[];
  currentTimeEntry: TimeEntry | null;
  isClockedIn: boolean;
  currentStatus: TimeEntry['status'];
  leaveBalance: {
    annual: number;
    sick: number;
    used: number;
    available: number;
  };
  activeTab: 'overview' | 'timesheet' | 'leave' | 'salary';
  editingEntry: TimeEntry | null;
  formMode: 'view' | 'edit' | 'add';
  loading: boolean;
  error: string | null;
}

interface UserDetailActions {
  setActiveTab: (tab: 'overview' | 'timesheet' | 'leave' | 'salary') => void;
  clockIn: () => void;
  clockOut: () => void;
  startLunchBreak: () => void;
  endLunchBreak: () => void;
  startShortBreak: () => void;
  endShortBreak: () => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  updateTimeEntry: (entryId: number, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (entryId: number) => void;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'approvedBy'>) => void;
  cancelLeaveRequest: (requestId: number) => void;
  confirmSalaryPayment: (paymentId: number) => void;
  setEditingEntry: (entry: TimeEntry | null) => void;
  setFormMode: (mode: 'view' | 'edit' | 'add') => void;
  refreshUserData: () => void;
}

export const useUserDetailState = (userId: number): UserDetailState & UserDetailActions => {
  const { addNotification, currentUser } = useGlobalState();
  const [state, setState] = useState<UserDetailState>({
    user: null,
    timeEntries: [],
    leaveRequests: [],
    salaryPayments: [],
    currentTimeEntry: null,
    isClockedIn: false,
    currentStatus: 'clocked_out',
    leaveBalance: {
      annual: 15,
      sick: 10,
      used: 0,
      available: 15
    },
    activeTab: 'overview',
    editingEntry: null,
    formMode: 'view',
    loading: true,
    error: null
  });

  const refreshUserData = useCallback(() => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const user = getUsers().find(u => u.id === userId);
      if (!user) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'User not found'
        }));
        return;
      }

      const entries = getTimeEntriesForUser(userId);
      const leaves = getLeaveRequests().filter(l => l.userId === userId);
      const salaries = getSalaryPayments().filter(s => s.userId === userId);
      const currentEntry = getCurrentTimeEntry(userId);

      // Calculate leave balance
      const approvedLeaves = leaves.filter(l => l.status === 'approved');
      const usedLeaveDays = approvedLeaves.reduce((sum, leave) => sum + leave.daysRequested, 0);

      setState(prev => ({
        ...prev,
        user,
        timeEntries: entries,
        leaveRequests: leaves,
        salaryPayments: salaries,
        currentTimeEntry: currentEntry,
        isClockedIn: currentEntry ? ['clocked_in', 'on_lunch', 'on_break'].includes(currentEntry.status) : false,
        currentStatus: currentEntry?.status || 'clocked_out',
        leaveBalance: {
          annual: 15,
          sick: 10,
          used: usedLeaveDays,
          available: 15 - usedLeaveDays
        },
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load user data'
      }));
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ([
        STORAGE_KEYS.TIME_ENTRIES,
        STORAGE_KEYS.LEAVE_REQUESTS,
        STORAGE_KEYS.SALARY_PAYMENTS
      ].includes(e.key || '')) {
        refreshUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUserData]);

  const setActiveTab = useCallback((tab: 'overview' | 'timesheet' | 'leave' | 'salary') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const clockIn = useCallback(() => {
    if (!state.user) return;

    const now = new Date();
    const timeEntry: TimeEntry = {
      id: generateId(),
      userId: state.user.id,
      date: formatDate(now),
      clockIn: formatTime(now),
      clockOut: null,
      lunchBreakStart: null,
      lunchBreakEnd: null,
      shortBreaks: [],
      totalHours: null,
      status: 'clocked_in',
      isLate: now.getHours() > 9,
      notes: ''
    };

    saveTimeEntry(timeEntry);
    addNotification({
      userId: state.user.id,
      type: 'salary_paid',
      title: 'Clock In',
      message: `Clocked in at ${formatTime(now)}`,
      isRead: false
    });

    refreshUserData();
  }, [state.user, addNotification, refreshUserData]);

  const clockOut = useCallback(() => {
    if (!state.currentTimeEntry) return;

    const now = new Date();
    const updatedEntry = {
      ...state.currentTimeEntry,
      clockOut: formatTime(now),
      status: 'clocked_out' as const,
      totalHours: calculateHoursWorked(
        state.currentTimeEntry.clockIn,
        formatTime(now),
        state.currentTimeEntry.lunchBreakStart,
        state.currentTimeEntry.lunchBreakEnd,
        state.currentTimeEntry.shortBreaks
      )
    };

    saveTimeEntry(updatedEntry);
    refreshUserData();
  }, [state.currentTimeEntry, refreshUserData]);

  const startLunchBreak = useCallback(() => {
    if (!state.currentTimeEntry || state.currentTimeEntry.status !== 'clocked_in') return;

    const updatedEntry = {
      ...state.currentTimeEntry,
      status: 'on_lunch' as const,
      lunchBreakStart: formatTime(new Date())
    };

    saveTimeEntry(updatedEntry);
    refreshUserData();
  }, [state.currentTimeEntry, refreshUserData]);

  const endLunchBreak = useCallback(() => {
    if (!state.currentTimeEntry || state.currentTimeEntry.status !== 'on_lunch') return;

    const updatedEntry = {
      ...state.currentTimeEntry,
      status: 'clocked_in' as const,
      lunchBreakEnd: formatTime(new Date())
    };

    saveTimeEntry(updatedEntry);
    refreshUserData();
  }, [state.currentTimeEntry, refreshUserData]);

  const startShortBreak = useCallback(() => {
    if (!state.currentTimeEntry || !['clocked_in', 'on_lunch'].includes(state.currentTimeEntry.status)) return;

    const breakObj = { start: formatTime(new Date()), end: null };
    const updatedEntry = {
      ...state.currentTimeEntry,
      status: 'on_break' as const,
      shortBreaks: [...state.currentTimeEntry.shortBreaks, breakObj]
    };

    saveTimeEntry(updatedEntry);
    refreshUserData();
  }, [state.currentTimeEntry, refreshUserData]);

  const endShortBreak = useCallback(() => {
    if (!state.currentTimeEntry || state.currentTimeEntry.status !== 'on_break') return;

    const updatedBreaks = [...state.currentTimeEntry.shortBreaks];
    const lastBreak = updatedBreaks[updatedBreaks.length - 1];
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = formatTime(new Date());
    }

    const updatedEntry = {
      ...state.currentTimeEntry,
      status: 'clocked_in' as const,
      shortBreaks: updatedBreaks
    };

    saveTimeEntry(updatedEntry);
    refreshUserData();
  }, [state.currentTimeEntry, refreshUserData]);

  const addTimeEntry = useCallback((entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId()
    };

    saveTimeEntry(newEntry);
    refreshUserData();
  }, [refreshUserData]);

  const updateTimeEntry = useCallback((entryId: number, updates: Partial<TimeEntry>) => {
    const entries = getTimeEntries();
    const entry = entries.find(e => e.id === entryId);

    if (!entry) return;

    const updatedEntry = { ...entry, ...updates };
    saveTimeEntry(updatedEntry);
    refreshUserData();
  }, [refreshUserData]);

  const deleteTimeEntry = useCallback((entryId: number) => {
    const entries = getTimeEntries();
    const filteredEntries = entries.filter(e => e.id !== entryId);

    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(filteredEntries));
    refreshUserData();
  }, [refreshUserData]);

  const submitLeaveRequest = useCallback((request: Omit<LeaveRequest, 'id' | 'status' | 'approvedBy'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: generateId(),
      status: 'pending' as const,
      approvedBy: null
    };

    saveLeaveRequest(newRequest);

    // Send notification to bosses (users with id 1 or 2)
    [1, 2].forEach(bossId => {
      addNotification({
        userId: bossId,
        type: 'leave_submitted',
        title: 'New Leave Request',
        message: `${state.user?.firstName} submitted a leave request`,
        isRead: false,
        relatedId: newRequest.id,
        relatedType: 'leave'
      });
    });

    refreshUserData();
  }, [state.user, addNotification, refreshUserData]);

  const cancelLeaveRequest = useCallback((requestId: number) => {
    const requests = getLeaveRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request || request.status !== 'pending') return;

    const updatedRequest = {
      ...request,
      status: 'denied' as const,
      approvedBy: state.user?.id || null
    };

    saveLeaveRequest(updatedRequest);
    refreshUserData();
  }, [state.user, refreshUserData]);

  const confirmSalaryPayment = useCallback((paymentId: number) => {
    const payments = getSalaryPayments();
    const payment = payments.find(p => p.id === paymentId);

    if (!payment) return;

    const updatedPayment = {
      ...payment,
      confirmedByEmployee: true,
      confirmedAt: new Date().toISOString()
    };

    saveSalaryPayment(updatedPayment);

    addNotification({
      userId: 1, // Notify boss
      type: 'salary_confirmed',
      title: 'Salary Confirmed',
      message: `${state.user?.firstName} confirmed salary payment`,
      isRead: false,
      relatedId: paymentId,
      relatedType: 'salary'
    });

    refreshUserData();
  }, [state.user, addNotification, refreshUserData]);

  const setEditingEntry = useCallback((entry: TimeEntry | null) => {
    setState(prev => ({ ...prev, editingEntry: entry }));
  }, []);

  const setFormMode = useCallback((mode: 'view' | 'edit' | 'add') => {
    setState(prev => ({ ...prev, formMode: mode }));
  }, []);

  return {
    ...state,
    setActiveTab,
    clockIn,
    clockOut,
    startLunchBreak,
    endLunchBreak,
    startShortBreak,
    endShortBreak,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    submitLeaveRequest,
    cancelLeaveRequest,
    confirmSalaryPayment,
    setEditingEntry,
    setFormMode,
    refreshUserData
  };
};

// ==================== REAL-TIME SYNCHRONIZATION ====================

export const useRealTimeSync = () => {
  const { refreshData } = useDashboardState();
  const { refreshUserData } = useUserDetailState(3); // Default to current user
  const { addNotification } = useGlobalState();

  useEffect(() => {
    // Custom storage event dispatcher for same-tab updates
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function(key, value) {
      const result = originalSetItem.apply(this, arguments);

      // Dispatch custom event for same-tab listeners
      window.dispatchEvent(new CustomEvent('localstorage-update', {
        detail: { key, value }
      }));

      return result;
    };

    const handleStorageUpdate = (e: CustomEvent) => {
      const { key } = e.detail;

      // Refresh relevant data based on what changed
      if ([
        STORAGE_KEYS.TIME_ENTRIES,
        STORAGE_KEYS.LEAVE_REQUESTS,
        STORAGE_KEYS.SALARY_PAYMENTS,
        STORAGE_KEYS.NOTIFICATIONS
      ].includes(key)) {

        // Add notification for real-time updates
        if (key !== STORAGE_KEYS.NOTIFICATIONS) {
          addNotification({
            userId: 3, // Current user
            type: 'salary_paid',
            title: 'Data Updated',
            message: 'Your data has been synchronized',
            isRead: false
          });
        }

        refreshData();
        refreshUserData();
      }
    };

    window.addEventListener('localstorage-update', handleStorageUpdate as EventListener);

    return () => {
      localStorage.setItem = originalSetItem;
      window.removeEventListener('localstorage-update', handleStorageUpdate as EventListener);
    };
  }, [refreshData, refreshUserData, addNotification]);

  // Periodic sync every 60 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
      refreshData();
    }, 60000);

    return () => clearInterval(syncInterval);
  }, [refreshData]);
};

// ==================== UTILITY HOOKS ====================

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useFilteredData = <T>(
  data: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
) => {
  return useMemo(() => {
    if (!searchTerm) return data;

    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(lowercasedTerm)
      )
    );
  }, [data, searchTerm, searchKeys]);
};

// Import useMemo from React
import { useMemo } from 'react';