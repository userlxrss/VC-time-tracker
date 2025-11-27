'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Bell, Search, Filter, Download, ChevronRight, Users, Clock, Coffee, TrendingUp, CheckCircle, AlertCircle, Calendar, BarChart3, UserCheck, Settings, LogOut } from 'lucide-react';
import { USERS, CURRENT_USER_ID } from '@/lib/constants';
import { getCurrentUserId, setCurrentUserId, getTheme, setTheme, getUnreadNotificationsForUser, getTimeEntriesForUser, getLeaveRequestsForUser, getSalaryPaymentsForUser } from '@/lib/storage';

export default function Dashboard() {
  const router = useRouter();
  const [currentUserId, setCurrentUserIdState] = useState(CURRENT_USER_ID);
  const [currentUser, setCurrentUser] = useState(USERS.find(u => u.id === currentUserId)!);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState('Today');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Initialize theme and user data
  useEffect(() => {
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    setTheme(savedTheme);

    const savedUserId = getCurrentUserId();
    if (savedUserId !== CURRENT_USER_ID) {
      setCurrentUserIdState(savedUserId);
      setCurrentUser(USERS.find(u => u.id === savedUserId)!);
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Update notifications
  useEffect(() => {
    const notifications = getUnreadNotificationsForUser(currentUserId);
    setUnreadNotifications(notifications.length);
  }, [currentUserId]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  const switchUser = (userId: number) => {
    setCurrentUserIdState(userId);
    setCurrentUserId(userId);
    setCurrentUser(USERS.find(u => u.id === userId)!);
    setIsUserDropdownOpen(false);
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

  // Get weekly chart data with demo variation
  const getWeeklyData = () => {
    // Demo data with realistic variation for better visualization
    const demoData = [
      { day: 'Mon', hours: 6.5 },
      { day: 'Tue', hours: 7.2 },
      { day: 'Wed', hours: 6.8 },
      { day: 'Thu', hours: 7.5 },
      { day: 'Fri', hours: 5.2 }
    ];

    // Map to the format expected by the component
    return demoData.map(data => ({
      day: data.day,
      hours: data.hours,
      height: Math.max(data.hours * 10, 20) // Scale to px, minimum 20px
    }));
  };

  // Filter users based on search
  const filteredUsers = USERS.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamStats = getTeamStats();
  const weeklyData = getWeeklyData();

  return (
    <div className="min-h-screen bg-gray-50">
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
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart3 className="w-4 h-4" />
                Reports
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <div className="relative">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="stats-grid mb-8">
          <div className="stat-card">
            <div className="stat-icon">
              <Clock className="w-5 h-5" />
            </div>
            <div className="stat-label">Total Team Hours</div>
            <div className="stat-value">{teamStats.totalHours}</div>
            <div className="stat-change">
              <TrendingUp className="w-3 h-3" />
              <span>vs Last Week: --</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ECFDF5', color: '#22C55E' }}>
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="stat-label">Clocked In</div>
            <div className="stat-value">{teamStats.clockedIn}</div>
            <div className="stat-change">
              <span>{parseInt(teamStats.clockedIn.split('/')[0]) * 33}% active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
              <Coffee className="w-5 h-5" />
            </div>
            <div className="stat-label">On Break</div>
            <div className="stat-value">{teamStats.onBreak}</div>
            <div className="stat-change">
              <span>{parseInt(teamStats.onBreak.split('/')[0]) * 33}% on break</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F3E8FF', color: '#A855F7' }}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="stat-label">Avg Hours/Day</div>
            <div className="stat-value">{teamStats.avgHours}</div>
            <div className="stat-change">
              <span>Target: 8h/day</span>
            </div>
          </div>
        </div>

        <div className="dashboard-layout">
          <div className="main-content">
            <div className="team-table">
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
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as CSV</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as Excel</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Export as PDF</a>
                        <hr className="my-2" />
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Schedule Weekly Report</a>
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
                    <div className="row-arrow">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <button className="row-quick-action" onClick={(e) => {
                      e.stopPropagation();
                      // Handle quick action
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
          </div>

          <div className="sidebar">
            {/* Weekly Trends Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <BarChart3 className="w-5 h-5" />
                  This Week Trends
                </div>
                <select className="date-selector">
                  <option>Today</option>
                  <option selected>This Week</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="chart-container">
                {weeklyData.map((data, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${data.height}px` }}
                    data-hours={`${data.hours}h`}
                  >
                    <div className="bar-label">{data.day}</div>
                  </div>
                ))}
              </div>
            </div>

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
                    <div className="alert-text">0 pending leave requests</div>
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

        @media (max-width: 767px) {
          .stats-grid { grid-template-columns: 1fr; }
          .table-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .search-input { width: 100%; }
          .table-actions { flex-direction: column; gap: 8px; }
        }
      `}</style>
    </div>
  );
}