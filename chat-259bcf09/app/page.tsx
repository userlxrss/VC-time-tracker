"use client"

import { useState, useEffect } from 'react'

// Hardcoded users as specified in requirements
const HARDCODED_USERS = [
  {
    id: 1,
    name: "Maria Villanueva",
    email: "maria@vc.com",
    role: "boss",
    profilePhoto: null
  },
  {
    id: 2,
    name: "Carlos Villanueva",
    email: "carlos@vc.com",
    role: "boss",
    profilePhoto: null
  },
  {
    id: 3,
    name: "Larina Villanueva",
    email: "larina@vc.com",
    role: "employee",
    profilePhoto: null
  }
]

// Current logged-in user (Larina by default - employee)
const CURRENT_USER_ID = 3

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  const currentUser = HARDCODED_USERS.find(user => user.id === CURRENT_USER_ID)

  // Update current time every minute
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Format date and time
  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Get user initials
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Simple status
  const userStatuses = {
    1: 'Clocked In',
    2: 'On Break',
    3: 'Clocked Out'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left Section - VC Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">VC</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  Villanueva Creative
                </div>
                <div className="text-xs text-gray-500">
                  Time Tracker & HR Management
                </div>
              </div>
            </div>

            {/* Center Section - Page Title */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-700">
                Dashboard
              </h1>
            </div>

            {/* Right Section - User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-white font-bold text-sm">
                  {getUserInitials(currentUser?.name || 'U')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {currentUser?.name}! 👋
            </h2>
            <p className="text-gray-600">
              {formatDateTime(currentTime)}
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hours Today</p>
                <p className="text-2xl font-bold text-gray-900">0h 0m</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">0h 0m</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-bold text-gray-400">Clocked Out</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Team Active</p>
                <p className="text-2xl font-bold text-gray-900">1/3</p>
              </div>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Team Overview
            </h3>
            <p className="text-gray-600">
              View and manage time tracking for all team members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HARDCODED_USERS.map((user) => (
              <div
                key={user.id}
                className={`bg-white rounded-2xl shadow-lg p-6 ${
                  user.id === CURRENT_USER_ID ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* Header */}
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full ${
                    user.role === 'boss' ? 'bg-blue-500' : 'bg-green-500'
                  } text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold`}>
                    {getUserInitials(user.name)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                    user.role === 'boss'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'boss' ? 'Boss' : 'Employee'}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className={`w-3 h-3 rounded-full ${
                      userStatuses[user.id] === 'Clocked In' ? 'bg-green-500' :
                      userStatuses[user.id] === 'On Break' ? 'bg-orange-500' : 'bg-gray-400'
                    } ${
                      userStatuses[user.id] === 'Clocked In' ? 'animate-pulse' : ''
                    }`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {userStatuses[user.id]}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {user.id === 1 ? '4h 30m' : user.id === 2 ? '3h 15m' : '0h 0m'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {user.id === 1 ? '22h 30m' : user.id === 2 ? '18h 45m' : '0h 0m'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {user.id === 1 ? '89h 20m' : user.id === 2 ? '75h 10m' : '0h 0m'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-4 py-3 bg-gray-50 rounded-b-2xl -mx-6 -mb-6">
                  {user.id === CURRENT_USER_ID ? (
                    <button
                      className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      Clock In
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 px-4 rounded-lg font-semibold text-blue-600 border-2 border-blue-200"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}