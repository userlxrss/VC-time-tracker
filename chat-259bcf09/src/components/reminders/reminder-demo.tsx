/**
 * Reminder System Demo Component
 * Shows how to integrate and use the reminder system with time tracking
 */

'use client'

import React from 'react'
import { Clock, Eye, Settings, Play, Pause } from 'lucide-react'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { useReminderContext } from './reminder-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'

export function ReminderDemo() {
  const { theme } = useTheme()
  const {
    currentTimeEntry,
    currentUser,
    status,
    currentHours,
    isTracking,
    clockIn,
    clockOut,
    canClockIn,
    canClockOut
  } = useTimeTracking()

  const {
    showEyeCareReminder,
    showReminderSettings,
    isEyeCareModalOpen,
    eyeCarePreferences
  } = useReminderContext()

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    const s = Math.floor(((hours - h) * 60 - m) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    switch (status) {
      case 'clocked_in':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'clocked_out':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'clocked_in':
        return 'Clocked In'
      case 'clocked_out':
        return 'Clocked Out'
      case 'on_lunch':
        return 'On Lunch'
      case 'on_break':
        return 'On Break'
      default:
        return 'Not Started'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            VC Time Tracker with Reminders
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive reminder system for eye care and clock out notifications
          </p>
        </div>
        <Button
          onClick={showReminderSettings}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {currentUser?.initials || 'U'}
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.fullName || 'Unknown User'}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentUser?.position || 'Employee'}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className={`text-3xl font-mono font-bold ${
                  isTracking ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {formatTime(currentHours)}
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Hours Worked Today
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => clockIn()}
                  disabled={!canClockIn}
                  size="sm"
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Clock In
                </Button>
                <Button
                  onClick={() => clockOut()}
                  disabled={!canClockOut}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Clock Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Eye Care
                  </span>
                </div>
                <Badge variant={eyeCarePreferences.eyeCareEnabled ? 'default' : 'secondary'}>
                  {eyeCarePreferences.eyeCareEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Interval
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {eyeCarePreferences.eyeCareInterval}m
                </span>
              </div>
              <Button
                onClick={showEyeCareReminder}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Test Eye Care Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-medium mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Eye Care Reminders
              </h3>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Configurable interval (10-60 minutes)</li>
                <li>• 20-second countdown timer</li>
                <li>• Interactive modal with progress bar</li>
                <li>• Eye care tips and guidance</li>
                <li>• Skip or complete early options</li>
                <li>• Only active when clocked in</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                Clock Out Reminders
              </h3>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Configurable threshold (6-16 hours)</li>
                <li>• Toast notifications with action buttons</li>
                <li>• Shows exact time worked</li>
                <li>• Direct clock out action available</li>
                <li>• Prevents excessive work hours</li>
                <li>• Multi-tab synchronization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <p>
              <strong>1. Clock In:</strong> Start your work day by clicking the "Clock In" button
            </p>
            <p>
              <strong>2. Configure Reminders:</strong> Click the Settings button to customize your reminder preferences
            </p>
            <p>
              <strong>3. Eye Care Breaks:</strong> Receive automatic reminders to rest your eyes at regular intervals
            </p>
            <p>
              <strong>4. Clock Out Reminders:</strong> Get notified when you've been working for an extended period
            </p>
            <p>
              <strong>5. Clock Out:</strong> End your work day by clicking the "Clock Out" button
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}