'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Sun,
  Moon,
  Clock,
  Calendar,
  Activity,
  Users,
  Play,
  Stop,
  Coffee,
  Pause,
  Check
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  User,
  TimeEntry,
  QuickStats,
  getCurrentUser,
  getAllUsers,
  getUserById,
  getTodayTimeEntry,
  calculateQuickStats,
  formatDateTime,
  getUserInitials
} from '@/utils/timeTracker'
import '@/utils/initData' // Initialize sample data
import { UserCard } from './UserCard'

export function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Initialize data
    const user = getCurrentUser()
    const users = getAllUsers()
    const stats = calculateQuickStats(user?.id || 3, users)

    setCurrentUser(user)
    setAllUsers(users)
    setQuickStats(stats)
  }, [])

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Recalculate stats every minute
    const statsTimer = setInterval(() => {
      if (currentUser) {
        const stats = calculateQuickStats(currentUser.id, allUsers)
        setQuickStats(stats)
      }
    }, 60000)

    return () => clearInterval(statsTimer)
  }, [currentUser, allUsers])

  const handleNotificationClick = () => {
    setShowNotifications(true)
    setTimeout(() => {
      setShowNotifications(false)
      // This would use a toast library in real implementation
      alert('Notifications coming in Phase 2')
    }, 100)
  }

  const formatCurrentDateTime = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' • ' + currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatIcon = (statType: string) => {
    switch (statType) {
      case 'hours':
        return <Clock className="w-5 h-5" />
      case 'week':
        return <Calendar className="w-5 h-5" />
      case 'status':
        return <Activity className="w-5 h-5" />
      case 'team':
        return <Users className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Clocked In':
        return 'text-green-600 dark:text-green-400'
      case 'On Break':
        return 'text-orange-600 dark:text-orange-400'
      case 'Clocked Out':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (!currentUser || !quickStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm z-50">
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Left Section - Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VC</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Villanueva Creative</span>
                </div>
              </div>
            </div>

            {/* Center Section - Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications Bell */}
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials(currentUser.name)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {formatCurrentDateTime()}
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Hours Today */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{quickStats.hoursToday}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hours This Week */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{quickStats.hoursThisWeek}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className={`text-xl font-bold ${getStatusColor(quickStats.status)}`}>
                        {quickStats.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Team Active */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Team Active</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{quickStats.teamActive}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUser.id}
                onUpdate={() => {
                  // Refresh stats when user card updates
                  if (currentUser) {
                    const stats = calculateQuickStats(currentUser.id, allUsers)
                    setQuickStats(stats)
                  }
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}