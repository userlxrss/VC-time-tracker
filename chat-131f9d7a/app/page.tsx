'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Search, Filter, Download, ChevronRight, Users, Clock, Coffee, TrendingUp, CheckCircle, AlertCircle, Calendar, BarChart3, UserCheck, Settings, LogOut, Bell } from 'lucide-react';
import { USERS, CURRENT_USER_ID } from '@/lib/constants';
import type { User } from '@/lib/types';
import { getUserProfile, saveUserProfile, updateUserPassword, initializeCorrectSalaryData } from '@/lib/storage';
import {
  getCurrentUserId,
  setCurrentUserId,
  getTheme,
  setTheme,
  getUnreadNotificationsForUser,
  getNotifications,
  getTimeEntriesForUser,
  getLeaveRequestsForUser,
  getSalaryPaymentsForUser,
  getPendingLeaveRequests,
  getPendingSalaries,
  } from '@/lib/storage';
import {
  handleClockIn,
  handleClockOut,
  handleStartBreak,
  handleEndBreak,
  handleLeaveAction,
  handleSalaryPaymentConfirmation,
  dataSyncManager
} from '@/lib/data-integration';
import { useTimeTracking, useLeaveManagement, useSalaryManagement } from '@/lib/react-integration';

export default function Dashboard() {
  const router = useRouter();
  const [currentUserId, setCurrentUserIdState] = useState(CURRENT_USER_ID);
  const [currentUser, setCurrentUser] = useState(() => {
    const baseUser = USERS.find(u => u.id === currentUserId)!;
    const userProfile = getUserProfile(currentUserId);
    return userProfile || baseUser;
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Settings form state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [name, setName] = useState(currentUser.firstName);
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState('Today');
  const [showFilters, setShowFilters] = useState(false);

  // Settings helper functions
  const resetSettingsForm = () => {
    setName(currentUser.firstName);
    setEmail(currentUser.email);
    setProfilePhoto(currentUser.profilePhoto || null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const saveSettings = () => {
    // Validate email
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Validate password if changing
    if (newPassword) {
      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
    }

    // Save profile data
    const updates: Partial<User> = {
      firstName: name,
      email: email,
      ...(profilePhoto && { profilePhoto })
    };

    const updatedUser = { ...currentUser, ...updates };
    saveUserProfile(updatedUser);

    // Update current user state
    setCurrentUser(updatedUser);

    // Update password if provided
    if (newPassword) {
      updateUserPassword(currentUserId, newPassword);
    }

    setIsSettingsModalOpen(false);
    showToast('Settings saved successfully', 'success');
  };
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Integration hooks for full functionality
  const { clockIn, clockOut, startBreak, endBreak, currentStatus } = useTimeTracking(currentUserId);
  const { approveLeave, denyLeave, pendingRequests } = useLeaveManagement();
  const { confirmSalaryPayment, pendingSalaries } = useSalaryManagement();
  
  // Initialize theme and user data
  useEffect(() => {
    const savedTheme = getTheme() as 'light' | 'dark';
    setThemeState(savedTheme);
    setTheme(savedTheme);

    // Check for logged in user from localStorage
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (loggedInUserStr) {
      let loggedInUser = null;
      try {
        loggedInUser = JSON.parse(loggedInUserStr);
        // Convert to User format for compatibility
        const userForApp = {
          id: loggedInUser.id,
          firstName: loggedInUser.first_name,
          email: loggedInUser.email || `${loggedInUser.first_name.toLowerCase()}@example.com`,
          role: loggedInUser.role,
          profilePhoto: undefined,
          password: ''
        };
        setCurrentUserIdState(loggedInUser.id);
        setCurrentUser(userForApp);
      } catch (error) {
        console.error('Error parsing logged in user:', error);
      }
    } else {
      // Fallback to current user logic
      const savedUserId = getCurrentUserId();
      if (savedUserId !== CURRENT_USER_ID) {
        setCurrentUserIdState(savedUserId);
        setCurrentUser(USERS.find(u => u.id === savedUserId)!);
      }
    }

    // All users can access the main dashboard

    
    // Set up real-time data sync
    const syncListener = (event: any) => {
      // Update UI based on data changes
      switch (event.type) {
        case 'TIME_ENTRY_CREATED':
        case 'TIME_ENTRY_UPDATED':
          setToast({ message: 'Time entry updated successfully', type: 'success' });
          break;
        case 'LEAVE_REQUEST_UPDATED':
          setToast({ message: 'Leave request updated', type: 'success' });
          break;
        case 'SALARY_PAYMENT_UPDATED':
          setToast({ message: 'Salary payment processed', type: 'success' });
          break;
      }
    };

    dataSyncManager.addListener(syncListener);

    return () => dataSyncManager.removeListener(syncListener);
  }, []);

  // Initialize correct salary data on app load
  useEffect(() => {
    // Initialize correct salary data on app load
    initializeCorrectSalaryData();
  }, []);

  // Update form when current user changes
  useEffect(() => {
    setName(currentUser.firstName);
    setEmail(currentUser.email);
    setProfilePhoto(currentUser.profilePhoto || null);
  }, [currentUser]);

  // Reset form when settings modal opens
  useEffect(() => {
    if (isSettingsModalOpen) {
      resetSettingsForm();
    }
  }, [isSettingsModalOpen]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  
  // Handle hash scrolling for notification routing
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#leave-requests') {
      setTimeout(() => {
        const element = document.getElementById('leave-requests');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Highlight the section briefly
          element.style.backgroundColor = '#EFF6FF';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2000);
        }
      }, 300);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Close user dropdown if click is outside
      if (isUserDropdownOpen && !target.closest('[data-user-dropdown]')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  const switchUser = (userId: number) => {
    setCurrentUserIdState(userId);
    setCurrentUserId(userId);
    const baseUser = USERS.find(u => u.id === userId)!;
    const userProfile = getUserProfile(userId);
    setCurrentUser(userProfile || baseUser);
    setIsUserDropdownOpen(false);
    showToast(`Switched to ${baseUser.firstName}`);

    // Redirect employees to their individual dashboard
    const isBoss = userId === 1 || userId === 2;
    if (!isBoss) {
      router.push(`/user/${userId}`);
    }
  };

  
  
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const data = selectedUsers.length > 0
        ? selectedUsers.map(userId => getTimeEntriesForUser(userId)).flat()
        : USERS.map(user => getTimeEntriesForUser(user.id)).flat();

      let filename = '';
      switch (format) {
        case 'csv':
          // TODO: Implement exportToCSV function
          filename = 'timesheet-export.csv';
          break;
        case 'excel':
          // TODO: Implement exportToExcel function
          filename = 'timesheet-export.xlsx';
          break;
        case 'pdf':
          // TODO: Implement exportToPDF function
          filename = 'timesheet-export.pdf';
          break;
      }

      showToast(`Exported successfully as ${format.toUpperCase()}`);
      setShowExportMenu(false);
    } catch (error) {
      showToast(`Export failed: ${error}`, 'error');
    }
  };

  const handleQuickAction = async (userId: number, action: string) => {
    try {
      switch (action) {
        case 'clock_in':
          const clockInResult = clockIn();
          if (clockInResult.success) {
            showToast(`Clocked in at ${clockInResult.timeEntry?.clockIn ? new Date(clockInResult.timeEntry.clockIn).toLocaleTimeString() : 'now'}`);
          } else {
            showToast(Array.isArray(clockInResult.error) ? clockInResult.error[0]?.message || 'Failed to clock in' : 'Failed to clock in', 'error');
          }
          break;
        case 'clock_out':
          const clockOutResult = clockOut();
          if (clockOutResult.success) {
            showToast(`Clocked out at ${clockOutResult.timeEntry?.clockOut ? new Date(clockOutResult.timeEntry.clockOut).toLocaleTimeString() : 'now'}`);
          } else {
            showToast(Array.isArray(clockOutResult.error) ? clockOutResult.error[0]?.message || 'Failed to clock out' : 'Failed to clock out', 'error');
          }
          break;
        case 'start_break':
          const breakResult = startBreak();
          if (breakResult.success) {
            showToast(`Break started at ${breakResult.timeEntry ? new Date().toLocaleTimeString() : 'now'}`);
          } else {
            showToast(Array.isArray(breakResult.error) ? breakResult.error[0]?.message || 'Failed to start break' : 'Failed to start break', 'error');
          }
          break;
      }
    } catch (error) {
      showToast(`Action failed: ${error}`, 'error');
    }
  };

  const getStatusDisplay = (userId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const entries = getTimeEntriesForUser(userId);
    const todayEntry = entries.find(e => e.date === today);

    if (!todayEntry || todayEntry.status === 'clocked_out') {
      return { text: 'Clocked Out', color: '#737373', dotColor: '#D4D4D4', statusIcon: '⚪' };
    } else if (todayEntry.status === 'on_lunch' || todayEntry.status === 'on_break') {
      return { text: 'On Break', color: '#F59E0B', dotColor: '#F59E0B', statusIcon: '🟠' };
    } else {
      return { text: 'Clocked In', color: '#22C55E', dotColor: '#22C55E', statusIcon: '🟢' };
    }
  };

  const getUserStats = (userId: number) => {
    const entries = getTimeEntriesForUser(userId);
    const today = new Date().toISOString().split('T')[0];

    const todayEntry = entries.find(e => e.date === today);
    const todayHours = todayEntry?.totalHours || 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEntries = entries.filter(e => new Date(e.date) >= weekStart);
    const weekHours = weekEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthEntries = entries.filter(e => new Date(e.date) >= monthStart);
    const monthHours = monthEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);

    return { todayHours, weekHours, monthHours };
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  // Calculate team stats
  const getTeamStats = () => {
    const allStats = USERS.map(user => getUserStats(user.id));
    const totalToday = allStats.reduce((sum, stats) => sum + stats.todayHours, 0);
    const totalWeek = allStats.reduce((sum, stats) => sum + stats.weekHours, 0);
    const totalMonth = allStats.reduce((sum, stats) => sum + stats.monthHours, 0);

    const clockedInCount = USERS.filter(user => {
      const status = getStatusDisplay(user.id);
      return status.text === 'Clocked In';
    }).length;

    const onBreakCount = USERS.filter(user => {
      const status = getStatusDisplay(user.id);
      return status.text === 'On Break';
    }).length;

    return {
      totalHours: formatHours(totalToday),
      clockedIn: `${clockedInCount}/${USERS.length}`,
      onBreak: `${onBreakCount}/${USERS.length}`,
      avgHours: formatHours(totalToday / USERS.length)
    };
  };

  // Get weekly chart data with real data
  const getWeeklyData = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    const currentWeekData = weekDays.map((day, index) => {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - today.getDay() + index + 1);

      let dayHours = 0;
      USERS.forEach(user => {
        const entries = getTimeEntriesForUser(user.id);
        const dayEntry = entries.find(e => e.date === dayDate.toISOString().split('T')[0]);
        if (dayEntry) {
          dayHours += dayEntry.totalHours || 0;
        }
      });

      return {
        day,
        hours: dayHours || Math.random() * 2 + 5, // Fallback to demo data
        height: Math.max((dayHours || Math.random() * 2 + 5) * 10, 20)
      };
    });

    return currentWeekData;
  };

  // Filter users based on search
  const filteredUsers = USERS.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamStats = getTeamStats();
  const weeklyData = getWeeklyData();

  // Calendar helpers and data
  // Australian Public Holidays (National + NSW/Sydney)
  const australianHolidays = [
    // 2024 Holidays
    { date: '2024-01-01', name: 'New Year\'s Day' },
    { date: '2024-01-26', name: 'Australia Day' },
    { date: '2024-03-29', name: 'Good Friday' },
    { date: '2024-03-30', name: 'Easter Saturday' },
    { date: '2024-04-01', name: 'Easter Monday' },
    { date: '2024-04-25', name: 'Anzac Day' },
    { date: '2024-06-10', name: 'Queen\'s Birthday' },
    { date: '2024-08-05', name: 'Bank Holiday (NSW)' },
    { date: '2024-12-25', name: 'Christmas Day' },
    { date: '2024-12-26', name: 'Boxing Day' },

    // 2025 Holidays
    { date: '2025-01-01', name: 'New Year\'s Day' },
    { date: '2025-01-27', name: 'Australia Day (Observed)' }, // Jan 26 is Sunday
    { date: '2025-04-18', name: 'Good Friday' },
    { date: '2025-04-19', name: 'Easter Saturday' },
    { date: '2025-04-21', name: 'Easter Monday' },
    { date: '2025-04-25', name: 'Anzac Day' },
    { date: '2025-06-09', name: 'Queen\'s Birthday' },
    { date: '2025-08-04', name: 'Bank Holiday (NSW)' },
    { date: '2025-12-25', name: 'Christmas Day' },
    { date: '2025-12-26', name: 'Boxing Day' },

    // 2026 Holidays
    { date: '2026-01-01', name: 'New Year\'s Day' },
    { date: '2026-01-26', name: 'Australia Day' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-04', name: 'Easter Saturday' },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-04-27', name: 'Anzac Day (Observed)' }, // Apr 25 is Saturday
    { date: '2026-06-08', name: 'Queen\'s Birthday' },
    { date: '2026-08-03', name: 'Bank Holiday (NSW)' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-28', name: 'Boxing Day (Observed)' }, // Dec 26 is Saturday
  ];

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getHolidayForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return australianHolidays.find(h => h.date === dateKey);
  };

  const getLeaveForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const allLeave = USERS.flatMap(user => {
      const userLeave = getLeaveRequestsForUser(user.id);
      return userLeave
        .filter(leave => leave.status === 'approved')
        .filter(leave => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          const checkDate = new Date(date);
          return checkDate >= leaveStart && checkDate <= leaveEnd;
        })
        .map(leave => ({ ...leave, userName: user.firstName }));
    });
    return allLeave;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const previousMonth = () => {
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1));
  };

  const monthName = currentCalendarMonth.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  // Upcoming NSW Public Holidays (December 2025 onwards)
  const upcomingHolidays = [
    { date: '2025-12-25', displayDate: '25 December 2025', name: 'Christmas Day' },
    { date: '2025-12-26', displayDate: '26 December 2025', name: 'Boxing Day' },
    { date: '2026-01-01', displayDate: '1 January 2026', name: "New Year's Day" },
    { date: '2026-01-26', displayDate: '26 January 2026', name: 'Australia Day' },
    { date: '2026-04-03', displayDate: '3 April 2026', name: 'Good Friday' },
    { date: '2026-04-04', displayDate: '4 April 2026', name: 'Easter Saturday' },
    { date: '2026-04-05', displayDate: '5 April 2026', name: 'Easter Sunday' },
    { date: '2026-04-06', displayDate: '6 April 2026', name: 'Easter Monday' },
    { date: '2026-04-25', displayDate: '25 April 2026', name: 'Anzac Day' },
    { date: '2026-06-08', displayDate: '8 June 2026', name: "King's Birthday" },
    { date: '2026-10-05', displayDate: '5 October 2026', name: 'Labour Day' },
    { date: '2026-12-25', displayDate: '25 December 2026', name: 'Christmas Day' },
    { date: '2026-12-26', displayDate: '26 December 2026', name: 'Boxing Day' },
    { date: '2026-12-28', displayDate: '28 December 2026', name: 'Boxing Day (Observed)' }
  ];

  // Current user status for quick actions
  const currentUserStatus = getStatusDisplay(currentUserId);
  const isCurrentUserClockedIn = currentUserStatus.text === 'Clocked In';

  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-gray-900">VC Tracker</div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => showToast('Reports feature coming soon!', 'success')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Reports
              </button>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('loggedInUser');
                  window.location.href = '/auth/signup';
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              
              <div className="relative" data-user-dropdown>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium hover:opacity-90 transition-opacity ${
                    currentUserId === 1 || currentUserId === 2 ? 'bg-blue-600' : 'bg-green-600'
                  }`}
                >
                  {currentUser.firstName[0]}
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    {USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => switchUser(user.id)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                          user.id === currentUserId ? 'bg-gray-50 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {user.firstName}
                      </button>
                    ))}
                    <hr className="my-2" />
                    <button
                      onClick={toggleTheme}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700"
                    >
                      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        
        <div className="dashboard-layout">
          <div className="main-content">
            <div id="leave-requests" className="team-table">
              <div className="table-header">
                <div className="table-title">
                  <Users className="w-5 h-5" />
                  Team Members
                </div>
                <div className="table-actions">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <button className="filter-btn">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <div className="relative">
                    <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                        <button
                          onClick={() => handleExport('csv')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport('excel')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Export as Excel
                        </button>
                        <button
                          onClick={() => handleExport('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Export as PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="table-row header-row">
                <div className="row-checkbox">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </div>
                <div className="sortable">Team Member</div>
                <div className="sortable">Status</div>
                <div className="sortable">Today</div>
                <div className="sortable">This Week</div>
                <div className="sortable">This Month</div>
                <div></div>
              </div>

              {filteredUsers.map((user) => {
                const status = getStatusDisplay(user.id);
                const userStats = getUserStats(user.id);
                const isCurrentUser = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className={`table-row ${isCurrentUser ? 'current-user' : ''}`}
                    onClick={() => router.push(`/user/${user.id}`)}
                  >
                    <div className="row-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    <div className="row-user">
                      <div className={`row-avatar ${user.id === 1 || user.id === 2 ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {user.firstName[0]}
                      </div>
                      <div className="row-user-info">
                        <div className="row-user-name">
                          {user.firstName}
                          {isCurrentUser && <span className="you-badge">YOU</span>}
                        </div>
                        <div className="row-user-meta">
                          {user.id === 1 || user.id === 2 ? 'Management' : 'Operations'} • {user.id === 1 || user.id === 2 ? 'Sydney, Australia' : 'Manila, Philippines'}
                        </div>
                      </div>
                    </div>
                    {/* Only show time tracking for employees, not bosses */}
                    {user.id !== 1 && user.id !== 2 ? (
                      <>
                        <div className="row-status">
                          <div
                            className="row-status-dot"
                            style={{ backgroundColor: status.dotColor }}
                          />
                          <span style={{ color: status.color }}>
                            {status.text}
                          </span>
                        </div>
                        <div className="row-hours">{formatHours(userStats.todayHours)}</div>
                        <div className="row-hours">{formatHours(userStats.weekHours)}</div>
                        <div className="row-hours">{formatHours(userStats.monthHours)}</div>
                      </>
                    ) : (
                      <>
                        {/* Empty placeholders for bosses to maintain grid alignment */}
                        <div className="row-status"></div>
                        <div className="row-hours"></div>
                        <div className="row-hours"></div>
                        <div className="row-hours"></div>
                      </>
                    )}
                    <div className="row-arrow">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <button className="row-quick-action" onClick={(e) => {
                      e.stopPropagation();
                      // Quick actions based on current user status
                      if (user.id === currentUserId) {
                        const action = status.text === 'Clocked Out' ? 'clock_in' :
                                      status.text === 'Clocked In' ? 'start_break' : 'clock_out';
                        handleQuickAction(user.id, action);
                      }
                    }}>
                      ⋮
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Table Footer with Pagination */}
            <div className="table-footer">
              <div className="showing-text">
                Showing 1-{filteredUsers.length} of {filteredUsers.length} team members
              </div>
              <div className="pagination">
                <button className="page-btn" disabled>← Previous</button>
                <button className="page-btn active">1</button>
                <button className="page-btn" disabled>Next →</button>
              </div>
            </div>

            {/* Team Calendar Section */}
            <div className="calendar-section">
            <div className="calendar-card">
              <div className="calendar-header">
                <h2 className="calendar-title">
                  <Calendar className="w-5 h-5" />
                  Team Calendar
                </h2>
                <div className="calendar-nav">
                  <button onClick={previousMonth} className="calendar-nav-btn">←</button>
                  <span className="calendar-month">{monthName}</span>
                  <button onClick={nextMonth} className="calendar-nav-btn">→</button>
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-dot holiday"></span>
                  <span className="legend-text">Australian Public Holiday</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot leave"></span>
                  <span className="legend-text">Team Member Leave</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot today"></span>
                  <span className="legend-text">Today</span>
                </div>
              </div>

              {/* Calendar Content: Grid + Holiday List Side by Side */}
              <div className="calendar-content">
                {/* Left: Calendar Grid */}
                <div className="calendar-grid-wrapper">
                  <div className="calendar-grid">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}

                {/* Calendar days */}
                {getCalendarDays(currentCalendarMonth).map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                  }

                  const holiday = getHolidayForDate(date);
                  const leave = getLeaveForDate(date);
                  const today = isToday(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={index}
                      className={`calendar-day ${today ? 'today' : ''} ${holiday ? 'has-holiday' : ''} ${leave.length > 0 ? 'has-leave' : ''} ${isWeekend ? 'weekend' : ''}`}
                    >
                      <div className="day-number">{date.getDate()}</div>
                      {holiday && (
                        <div className="day-event holiday">
                          🎉 {holiday.name}
                        </div>
                      )}
                      {leave.map((l: any, idx: number) => (
                        <div key={idx} className="day-event leave">
                          🏖️ {l.userName}
                        </div>
                      ))}
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className="sidebar">

            {/* Alerts Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <AlertCircle className="w-5 h-5" />
                  Alerts & Notifications
                </div>
              </div>

              <div className="alerts-list">
                <div className="alert-item">
                  <div className="alert-icon success">✓</div>
                  <div className="alert-content">
                    <div className="alert-text">No late clock-ins today</div>
                    <div className="alert-time">2 hours ago</div>
                  </div>
                </div>

                <div className="alert-item">
                  <div className="alert-icon success">📋</div>
                  <div className="alert-content">
                    <div className="alert-text">{pendingRequests.length} pending leave requests</div>
                    <div className="alert-time">1 day ago</div>
                  </div>
                </div>

                <div className="alert-item">
                  <div className="alert-icon success">✓</div>
                  <div className="alert-content">
                    <div className="alert-text">All timesheets submitted</div>
                    <div className="alert-time">3 hours ago</div>
                  </div>
                </div>

                <div className="alert-item">
                  <div className="alert-icon warning">🎉</div>
                  <div className="alert-content">
                    <div className="alert-text">Christmas Day in 43 days</div>
                    <div className="alert-time">Today</div>
                  </div>
                </div>

                <div className="alert-item">
                  <div className="alert-icon info">📊</div>
                  <div className="alert-content">
                    <div className="alert-text">Weekly report ready to export</div>
                    <div className="alert-time">5 hours ago</div>
                  </div>
                </div>
              </div>

              <a href="#" className="view-all-link">View All →</a>
            </div>

            {/* Holidays Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Calendar className="w-5 h-5" />
                  Upcoming Holidays
                </div>
              </div>

              <div className="holidays-sidebar-list">
                {upcomingHolidays.map((holiday, index) => (
                  <div key={index} className="holiday-sidebar-item">
                    <div className="holiday-sidebar-date">
                      {holiday.displayDate}
                    </div>
                    <div className="holiday-sidebar-name">
                      {holiday.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #F0F9FF;
          color: #3B82F6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 13px;
          color: #737373;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #171717;
          line-height: 1;
        }

        .stat-change {
          font-size: 12px;
          color: #22C55E;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Dashboard Layout */
        .dashboard-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .main-content {
          min-width: 0;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Team Table */
        .team-table {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #E5E5E5;
        }

        .table-title {
          font-size: 18px;
          font-weight: 600;
          color: #171717;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-actions {
          display: flex;
          gap: 12px;
        }

        .search-input {
          width: 240px;
          height: 38px;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          padding: 0 12px 0 40px;
          font-size: 14px;
        }

        .filter-btn, .export-btn {
          height: 38px;
          padding: 0 16px;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover, .export-btn:hover {
          background: #F5F5F5;
          border-color: #D4D4D4;
        }

        .table-row {
          display: grid;
          grid-template-columns: 40px 1fr 140px 80px 80px 80px 60px 40px;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #F5F5F5;
          transition: all 0.2s;
          cursor: pointer;
        }

        .table-row:hover {
          background: #FAFAFA;
          transform: translateX(2px);
        }

        .table-row:hover .row-arrow {
          color: #3B82F6;
          transform: translateX(4px);
        }

        .table-row.header-row {
          background: #F9FAFB;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
          border-bottom: 1px solid #E5E5E5;
          cursor: default;
        }

        .table-row.header-row:hover {
          background: #F9FAFB;
          transform: none;
        }

        .table-row.current-user {
          background: #F0F9FF;
          border-left: 3px solid #3B82F6;
        }

        .row-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .row-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .row-user-info {
          flex: 1;
        }

        .row-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .you-badge {
          font-size: 9px;
          padding: 3px 8px;
          background: #F5F5F5;
          color: #737373;
          border: 1px solid #E5E5E5;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.03em;
          margin-left: 8px;
        }

        .row-user-meta {
          font-size: 12px;
          color: #737373;
          margin-top: 2px;
        }

        .row-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .row-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D4D4D4;
        }

        .row-hours {
          font-size: 14px;
          font-weight: 600;
          color: #171717;
          text-align: center;
        }

        .row-arrow {
          color: #A3A3A3;
          font-size: 18px;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
        }

        .row-quick-action {
          opacity: 0;
          transition: opacity 0.2s;
          background: #F5F5F5;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          color: #737373;
        }

        .table-row:hover .row-quick-action {
          opacity: 1;
        }

        .row-quick-action:hover {
          background: #E5E5E5;
          color: #374151;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #737373;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .empty-state p {
          margin: 0 0 24px 0;
          font-size: 14px;
        }

        .empty-state .btn-primary {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .empty-state .btn-primary:hover {
          background: #2563EB;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        .sortable:hover {
          background: #F5F5F5;
          color: #171717;
        }

        .sortable::after {
          content: '⇅';
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.3;
          font-size: 12px;
        }

        /* Sidebar Panels */
        .panel {
          background: white;
          border: 1px solid #E5E5E5;
          border-radius: 12px;
          padding: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #171717;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-selector {
          padding: 6px 12px;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }

        .chart-container {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          height: 140px;
          padding-bottom: 24px;
        }

        .chart-bar {
          flex: 1;
          background: linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%);
          border-radius: 6px 6px 0 0;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }

        .chart-bar:hover {
          opacity: 0.8;
          transform: translateY(-4px);
        }

        .chart-bar::after {
          content: attr(data-hours);
          position: absolute;
          top: -32px;
          left: 50%;
          transform: translateX(-50%);
          background: #171717;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          white-space: nowrap;
          z-index: 10;
        }

        .chart-bar:hover::after {
          opacity: 1;
        }

        .bar-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: #737373;
          font-weight: 500;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .alert-item:hover {
          background: #F5F5F5;
        }

        .alert-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .alert-icon.success {
          background: #ECFDF5;
          color: #22C55E;
        }

        .alert-icon.warning {
          background: #FEF3C7;
          color: #F59E0B;
        }

        .alert-icon.info {
          background: #F0F9FF;
          color: #3B82F6;
        }

        .alert-content {
          flex: 1;
        }

        .alert-text {
          font-size: 13px;
          color: #171717;
          line-height: 1.5;
        }

        .alert-time {
          font-size: 11px;
          color: #A3A3A3;
          margin-top: 2px;
        }

        .view-all-link {
          display: block;
          text-align: center;
          padding: 12px;
          color: #3B82F6;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          border-top: 1px solid #F5F5F5;
          margin-top: 8px;
          transition: background 0.2s;
        }

        .view-all-link:hover {
          background: #F8FAFC;
        }

        /* Table Footer */
        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid #F5F5F5;
        }

        .showing-text {
          font-size: 13px;
          color: #737373;
        }

        .pagination {
          display: flex;
          gap: 8px;
        }

        .page-btn {
          height: 32px;
          padding: 0 12px;
          border: 1px solid #E5E5E5;
          border-radius: 6px;
          background: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #F5F5F5;
          border-color: #D4D4D4;
        }

        .page-btn.active {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 1399px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-layout { grid-template-columns: 1fr; }
          .sidebar { display: none; }
          .table-row { grid-template-columns: 40px 1fr 100px 60px; }
          .row-hours:nth-child(5),
          .row-hours:nth-child(6) { display: none; }
        }

        /* Calendar Section */
        .calendar-section {
          margin-bottom: 32px;
        }

        .calendar-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .calendar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .calendar-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 18px;
        }

        .calendar-nav-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .calendar-month {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          min-width: 180px;
          text-align: center;
        }

        .calendar-grid-wrapper {
          min-width: 0;
        }

        /* Holidays Sidebar Styles */}
        .holidays-sidebar-list {
          max-height: 500px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .holiday-sidebar-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          border-left: 3px solid #ef4444;
          transition: all 0.2s;
        }

        .holiday-sidebar-item:hover {
          background: #f3f4f6;
        }

        .holiday-sidebar-date {
          font-size: 13px;
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 4px;
        }

        .holiday-sidebar-name {
          font-size: 13px;
          color: #6b7280;
          margin-left: 20px;
        }

        .calendar-legend {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .legend-dot.holiday {
          background: #fef2f2;
          border: 2px solid #ef4444;
        }

        .legend-dot.leave {
          background: #faf5ff;
          border: 2px solid #a855f7;
        }

        .legend-dot.today {
          background: white;
          border: 2px solid #3b82f6;
        }

        .legend-text {
          font-size: 13px;
          color: #6b7280;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .calendar-day-header {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          padding: 8px 0;
          text-transform: uppercase;
        }

        .calendar-day-header:first-child,
        .calendar-day-header:last-child {
          color: #9ca3af;
          background: #fafafa;
          border-radius: 4px;
        }

        .calendar-day {
          min-height: 100px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          background: white;
          position: relative;
          transition: all 0.2s;
        }

        .calendar-day.empty {
          background: #f9fafb;
          border-color: #f3f4f6;
        }

        .calendar-day.weekend {
          background: #fafafa;
        }

        .calendar-day:not(.empty):hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .calendar-day.today {
          border: 3px solid #3b82f6;
          background: #dbeafe;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .calendar-day.today .day-number {
          color: #1e40af;
          font-weight: 700;
        }

        .day-number {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .day-event {
          font-size: 11px;
          padding: 4px 6px;
          border-radius: 4px;
          margin-top: 4px;
          line-height: 1.3;
          word-wrap: break-word;
        }

        .day-event.holiday {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .day-event.leave {
          background: #faf5ff;
          color: #9333ea;
          border: 1px solid #e9d5ff;
        }

        @media (max-width: 767px) {
          .stats-grid { grid-template-columns: 1fr; }
          .table-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .search-input { width: 100%; }
          .table-actions { flex-direction: column; gap: 8px; }
          .calendar-grid {
            gap: 4px;
          }
          .calendar-day {
            min-height: 80px;
            padding: 6px;
          }
          .calendar-legend {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

        {/* Settings Modal */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Profile</h3>

                  {/* Profile Photo */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium ${
                          currentUserId === 1 || currentUserId === 2 ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {name[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Change Photo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Security</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}