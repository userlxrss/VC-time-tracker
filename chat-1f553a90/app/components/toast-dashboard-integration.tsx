'use client'

import React, { useEffect } from 'react'
import { useToastIntegration } from '@/hooks/use-toast-integration'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Clock,
  Coffee,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square,
  Eye,
  Download,
  Users,
  Bell,
} from 'lucide-react'

/**
 * Enhanced Dashboard Integration with Toast System
 * This component demonstrates how to integrate the toast system
 * with real VC Time Tracker functionality
 */
export function ToastDashboardIntegration() {
  const toastIntegration = useToastIntegration()

  // Simulate automatic notifications
  useEffect(() => {
    // Simulate break reminder after 10 seconds
    const breakTimer = setTimeout(() => {
      toastIntegration.breakWarning()
    }, 10000)

    // Simulate eye care reminder after 15 seconds
    const eyeCareTimer = setTimeout(() => {
      toastIntegration.eyeCareReminder()
    }, 15000)

    return () => {
      clearTimeout(breakTimer)
      clearTimeout(eyeCareTimer)
    }
  }, [toastIntegration])

  // Simulate real-time collaboration
  useEffect(() => {
    const collaborationTimer = setTimeout(() => {
      toastIntegration.collaboratorJoined('Sarah Johnson')
    }, 8000)

    return () => clearTimeout(collaborationTimer)
  }, [toastIntegration])

  // Time tracking actions
  const handleClockIn = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    toastIntegration.clockInSuccess(timeString)
  }

  const handleClockOut = () => {
    // Simulate a random duration
    const hours = Math.floor(Math.random() * 4) + 6
    const minutes = Math.floor(Math.random() * 60)
    const duration = `${hours}h ${minutes}m`
    toastIntegration.clockOutSuccess(duration)
  }

  const handleStartBreak = () => {
    const breakDurations = ['15 minutes', '30 minutes', '1 hour']
    const duration = breakDurations[Math.floor(Math.random() * breakDurations.length)]
    toastIntegration.breakStarted(duration)
  }

  const handleEndBreak = () => {
    toastIntegration.breakEnded()
  }

  // Time card actions
  const handleSubmitTimeCard = () => {
    const weekDates = [
      'Nov 4 - Nov 10',
      'Nov 11 - Nov 17',
      'Nov 18 - Nov 24',
    ]
    const week = weekDates[Math.floor(Math.random() * weekDates.length)]
    toastIntegration.timeCardSubmitted(week)
  }

  const handleTimeCardApproved = () => {
    const weekDates = [
      'Oct 28 - Nov 3',
      'Oct 21 - Oct 27',
    ]
    const week = weekDates[Math.floor(Math.random() * weekDates.length)]
    toastIntegration.timeCardApproved(week)
  }

  // Data actions
  const handleExport = () => {
    const files = [
      'time-cards-Nov-2024.xlsx',
      'hours-report-Q4-2024.pdf',
      'project-summary-2024.csv',
    ]
    const filename = files[Math.floor(Math.random() * files.length)]
    toastIntegration.exportSuccess(filename)
  }

  const handleImport = () => {
    const count = Math.floor(Math.random() * 50) + 10
    toastIntegration.importSuccess(count)
  }

  // Error simulation
  const simulateError = () => {
    const errors = [
      'Network connection failed',
      'Unable to save time entry',
      'Invalid time format detected',
      'Permission denied for this action',
    ]
    const error = errors[Math.floor(Math.random() * errors.length)]
    toastIntegration.formError([error])
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="shadow-premium-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Time Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={handleClockIn} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Clock In
            </Button>
            <Button onClick={handleClockOut} variant="outline" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Clock Out
            </Button>
            <Button onClick={handleStartBreak} variant="secondary" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Start Break
            </Button>
            <Button onClick={handleEndBreak} variant="outline" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              End Break
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Card Actions */}
      <Card className="shadow-premium-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Time Card Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={handleSubmitTimeCard} variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Submit Time Card
            </Button>
            <Button onClick={handleTimeCardApproved} variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approve Time Card
            </Button>
            <Button onClick={simulateError} variant="destructive" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Simulate Error
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-premium-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={handleImport} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4 rotate-180" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Notifications */}
      <Card className="shadow-premium-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Manual Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={() => toastIntegration.eyeCareReminder()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Eye Care
            </Button>
            <Button
              onClick={() => toastIntegration.breakWarning()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              Break Warning
            </Button>
            <Button
              onClick={() => toastIntegration.autoSave()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Auto-Save
            </Button>
            <Button
              onClick={() => toastIntegration.onlineStatus(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Online
            </Button>
            <Button
              onClick={() => toastIntegration.onlineStatus(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Offline
            </Button>
            <Button
              onClick={() => toastIntegration.themeChanged('Dark')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Theme Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Demo */}
      <Card className="shadow-premium-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => {
                const names = ['Michael Chen', 'Sarah Johnson', 'David Kim', 'Emily Brown']
                const name = names[Math.floor(Math.random() * names.length)]
                toastIntegration.collaboratorJoined(name)
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Collaborator Joined
            </Button>
            <Button
              onClick={() => {
                const names = ['Michael Chen', 'Sarah Johnson', 'David Kim', 'Emily Brown']
                const name = names[Math.floor(Math.random() * names.length)]
                toastIntegration.timeCardUpdated(name)
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Time Card Updated
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-vc-primary-50 to-vc-accent-50 dark:from-vc-primary-950/20 dark:to-vc-accent-950/20 border-vc-primary-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-vc-primary-600" />
            <div className="text-sm">
              <p className="font-medium text-vc-primary-900 dark:text-vc-primary-100">
                Automatic Notifications Active
              </p>
              <p className="text-vc-primary-700 dark:text-vc-primary-300">
                Break and eye care reminders will appear automatically. Check the notification history using the button in the bottom-right corner.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ToastDashboardIntegration