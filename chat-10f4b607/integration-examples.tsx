// ==================== INTEGRATION EXAMPLES ====================
// This file shows how to integrate the state management into existing components
// WITHOUT changing any HTML structure, CSS classes, or visual design

import React, { useEffect } from 'react';
import {
  GlobalProvider,
  useGlobalState,
  useDashboardState,
  useUserDetailState,
  useRealTimeSync
} from './state-management';

// ==================== APP LAYOUT INTEGRATION ====================

// Example: Wrap your existing layout.tsx with GlobalProvider
export const AppLayoutWithState: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GlobalProvider>
      {children}
      {/* Add real-time sync to enable cross-tab updates */}
      <RealTimeSyncManager />
    </GlobalProvider>
  );
};

// Helper component to enable real-time synchronization
const RealTimeSyncManager: React.FC = () => {
  useRealTimeSync();
  return null;
};

// ==================== DASHBOARD PAGE INTEGRATION ====================

// Example: Modify existing page.tsx to use state management
export const DashboardPageWithState: React.FC = () => {
  const {
    teamMembers,
    timeEntries,
    activeUsersCount,
    pendingRequestsCount,
    weeklyTrendsData,
    alerts,
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    refreshData,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    clockInUser,
    clockOutUser,
    approveLeaveRequest,
    denyLeaveRequest
  } = useDashboardState();

  const { unreadCount } = useGlobalState();

  // Auto-refresh data every 30 seconds (already handled by the hook)
  useEffect(() => {
    // The hook automatically handles data refresh, no need for manual refresh
  }, []);

  // Example: Dynamic data binding for existing UI elements
  // This replaces static data with dynamic state while preserving exact HTML structure

  // Header notification badge update
  const notificationBadge = unreadCount > 0 ? (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount}
    </span>
  ) : null;

  // Stats cards with dynamic data
  const statsCards = [
    {
      title: "Active Users",
      value: activeUsersCount.toString(),
      change: "+2 from yesterday",
      changeType: "positive" as const
    },
    {
      title: "Pending Requests",
      value: pendingRequestsCount.toString(),
      change: pendingRequestsCount > 0 ? "Action needed" : "All cleared",
      changeType: pendingRequestsCount > 0 ? "negative" as const : "positive" as const
    },
    // ... other cards
  ];

  // Filter and sort team members
  const filteredTeamMembers = teamMembers
    .filter(member => {
      const entry = timeEntries.find(e => e.userId === member.id);
      const status = entry?.status || 'clocked_out';

      // Search filter
      if (searchTerm && !member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !member.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const entryA = timeEntries.find(e => e.userId === a.id);
      const entryB = timeEntries.find(e => e.userId === b.id);

      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc'
            ? a.firstName.localeCompare(b.firstName)
            : b.firstName.localeCompare(a.firstName);
        case 'status':
          const statusA = entryA?.status || 'clocked_out';
          const statusB = entryB?.status || 'clocked_out';
          return sortOrder === 'asc'
            ? statusA.localeCompare(statusB)
            : statusB.localeCompare(statusA);
        case 'hours':
          const hoursA = entryA?.totalHours || 0;
          const hoursB = entryB?.totalHours || 0;
          return sortOrder === 'asc'
            ? hoursA - hoursB
            : hoursB - hoursA;
        default:
          return 0;
      }
    });

  // Event handlers that preserve existing UI behavior
  const handleClockIn = (userId: number) => {
    clockInUser(userId);
    // Existing UI feedback can remain unchanged
  };

  const handleClockOut = (userId: number) => {
    clockOutUser(userId);
    // Existing UI feedback can remain unchanged
  };

  const handleApproveLeave = (requestId: number) => {
    approveLeaveRequest(requestId);
    // Existing UI feedback can remain unchanged
  };

  const handleDenyLeave = (requestId: number) => {
    denyLeaveRequest(requestId);
    // Existing UI feedback can remain unchanged
  };

  // Weekly trends data for chart
  const chartData = {
    labels: weeklyTrendsData.map(d => d.day),
    datasets: [{
      label: 'Hours Worked',
      data: weeklyTrendsData.map(d => d.hours),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }]
  };

  // Alerts panel data
  const alertsList = alerts.map(alert => ({
    ...alert,
    className: alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                 alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                 'bg-green-50 border-green-200'
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Existing header structure remains exactly the same */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand - unchanged */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">VC Time Tracker</h1>
              </div>
            </div>

            {/* Search bar with state integration */}
            <div className="flex-1 max-w-lg mx-8">
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Navigation with notification badge */}
            <nav className="flex items-center space-x-4">
              <div className="relative">
                {/* Existing notification icon structure */}
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationBadge}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content area - unchanged structure, dynamic data */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              <p className={`mt-2 text-sm ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on_break">On Break</option>
            <option value="clocked_out">Clocked Out</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="hours">Sort by Hours</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {/* Team Members Table - exact same HTML structure */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Today
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeamMembers.map((member) => {
                const entry = timeEntries.find(e => e.userId === member.id);
                const status = entry?.status || 'clocked_out';
                const statusColor = status === 'clocked_in' ? 'bg-green-100 text-green-800' :
                                   status === 'on_lunch' ? 'bg-yellow-100 text-yellow-800' :
                                   status === 'on_break' ? 'bg-orange-100 text-orange-800' :
                                   'bg-gray-100 text-gray-800';

                return (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {member.firstName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.firstName}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry?.clockIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry?.totalHours ? `${entry.totalHours.toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {status === 'clocked_out' ? (
                        <button
                          onClick={() => handleClockIn(member.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Clock In
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClockOut(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Clock Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar with trends and alerts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Trends</h3>
            <div className="h-64 flex items-center justify-center">
              {/* Your existing chart component can use chartData */}
              <div className="text-gray-500 text-center">
                <p>Chart Component Here</p>
                <p className="text-sm mt-2">Using data: {JSON.stringify(chartData)}</p>
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {alertsList.length > 0 ? (
                alertsList.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${alert.className}`}>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent alerts</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ==================== USER DETAIL PAGE INTEGRATION ====================

export const UserDetailPageWithState: React.FC<{ userId: number }> = ({ userId }) => {
  const {
    user,
    timeEntries,
    leaveRequests,
    salaryPayments,
    isClockedIn,
    currentStatus,
    leaveBalance,
    activeTab,
    editingEntry,
    formMode,
    loading,
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
    confirmSalaryPayment
  } = useUserDetailState(userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">User not found</p>
        </div>
      </div>
    );
  }

  // Tab switching with state management
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timesheet', label: 'Timesheet' },
    { id: 'leave', label: 'Leave Balance' },
    { id: 'salary', label: 'Salary' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User header - unchanged structure */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-700">
                    {user.firstName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">{user.firstName}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2">
                  <span className={`px-3 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    currentStatus === 'clocked_in' ? 'bg-green-100 text-green-800' :
                    currentStatus === 'on_lunch' ? 'bg-yellow-100 text-yellow-800' :
                    currentStatus === 'on_break' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Clock In/Out buttons */}
            <div className="flex space-x-3">
              {currentStatus === 'clocked_out' ? (
                <button
                  onClick={clockIn}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Clock In
                </button>
              ) : (
                <div className="flex space-x-3">
                  {currentStatus === 'clocked_in' && (
                    <button
                      onClick={startLunchBreak}
                      className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                    >
                      Start Lunch
                    </button>
                  )}
                  {currentStatus === 'on_lunch' && (
                    <button
                      onClick={endLunchBreak}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      End Lunch
                    </button>
                  )}
                  {['clocked_in', 'on_lunch'].includes(currentStatus) && (
                    <button
                      onClick={startShortBreak}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      Start Break
                    </button>
                  )}
                  {currentStatus === 'on_break' && (
                    <button
                      onClick={endShortBreak}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      End Break
                    </button>
                  )}
                  <button
                    onClick={clockOut}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Clock Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation - unchanged structure */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Leave Balance</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Leave</span>
                  <span className="font-medium">{leaveBalance.annual} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium text-red-600">{leaveBalance.used} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-green-600">{leaveBalance.available} days</span>
                </div>
              </div>
            </div>

            {/* Additional overview cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Today's Status</h3>
              <div className="mt-4">
                <p className="text-gray-600">Status: <span className="font-medium">{currentStatus.replace('_', ' ')}</span></p>
                <p className="text-gray-600 mt-2">Time Entries: <span className="font-medium">{timeEntries.length}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                  Request Leave
                </button>
                <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                  View Timesheet
                </button>
                <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.clockIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.clockOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.totalHours ? `${entry.totalHours.toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entry.status === 'clocked_in' ? 'bg-green-100 text-green-800' :
                        entry.status === 'on_lunch' ? 'bg-yellow-100 text-yellow-800' :
                        entry.status === 'on_break' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leave Tab */}
        {activeTab === 'leave' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{leaveBalance.annual}</p>
                  <p className="text-sm text-gray-600">Annual Days</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{leaveBalance.used}</p>
                  <p className="text-sm text-gray-600">Used Days</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{leaveBalance.available}</p>
                  <p className="text-sm text-gray-600">Available Days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Requests</h3>
              <div className="space-y-3">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((request) => (
                    <div key={request.id} className="border-l-4 border-gray-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{request.leaveType === 'annual' ? 'Annual Leave' : 'Sick Leave'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{request.reason}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'denied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No leave requests</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.confirmedByEmployee ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmSalaryPayment(payment.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== USAGE INSTRUCTIONS ====================

/*
HOW TO INTEGRATE:

1. **Replace your layout.tsx:**
   ```tsx
   import { AppLayoutWithState } from './integration-examples';

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en">
         <body>
           <AppLayoutWithState>
             {children}
           </AppLayoutWithState>
         </body>
       </html>
     );
   }
   ```

2. **Replace your dashboard page.tsx:**
   ```tsx
   import { DashboardPageWithState } from './integration-examples';

   export default function DashboardPage() {
     return <DashboardPageWithState />;
   }
   ```

3. **Replace your user detail page:**
   ```tsx
   import { UserDetailPageWithState } from './integration-examples';

   export default function UserDetailPage({ params }: { params: { id: string } }) {
     return <UserDetailPageWithState userId={parseInt(params.id)} />;
   }
   ```

4. **Add state-management.ts to your project:**
   - Place the file in your root directory
   - Ensure you have the required dependencies: React, localStorage utilities, types

5. **No UI changes needed!**
   - All existing HTML structure, CSS classes, and visual design are preserved
   - Only data binding and event handlers are updated
   - The state management works behind the scenes

BENEFITS:
✅ Real-time data synchronization across tabs
✅ Automatic UI updates when data changes
✅ Centralized state management
✅ Error handling and loading states
✅ Cross-component data consistency
✅ localStorage integration
✅ Notification system
✅ Sorting, filtering, and pagination support
✅ Type-safe state management

The state management hooks handle all data operations, while your existing UI components remain visually identical.