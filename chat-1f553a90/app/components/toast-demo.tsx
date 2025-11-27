'use client'

import React from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useToastIntegration } from '@/hooks/use-toast-integration'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Coffee,
  Eye,
  FileText,
  Download,
  Upload,
  Settings,
  Users,
  Bell,
  Volume2,
} from 'lucide-react'

export function ToastDemo() {
  const toast = useToast()
  const toastIntegration = useToastIntegration()

  const basicExamples = [
    {
      title: 'Success Toast',
      description: 'Shows a success message with auto-dismiss',
      action: () => toast.success('Operation completed successfully!'),
      icon: CheckCircle,
      variant: 'success' as const,
    },
    {
      title: 'Error Toast',
      description: 'Shows an error message with longer duration',
      action: () => toast.error('Something went wrong!'),
      icon: AlertCircle,
      variant: 'error' as const,
    },
    {
      title: 'Warning Toast',
      description: 'Shows a warning message',
      action: () => toast.warning('Please review your input'),
      icon: AlertTriangle,
      variant: 'warning' as const,
    },
    {
      title: 'Info Toast',
      description: 'Shows an informational message',
      action: () => toast.info('Here\'s some useful information'),
      icon: Info,
      variant: 'info' as const,
    },
  ]

  const advancedExamples = [
    {
      title: 'Toast with Action',
      description: 'Toast with custom action button',
      action: () => toast.success('File uploaded successfully!', {
        action: {
          label: 'View File',
          onClick: () => console.log('View file clicked'),
        },
      }),
      icon: Upload,
    },
    {
      title: 'Persistent Toast',
      description: 'Toast that doesn\'t auto-dismiss',
      action: () => toast.warning('Important: Please review changes', {
        persistent: true,
      }),
      icon: AlertTriangle,
    },
    {
      title: 'Toast with Description',
      description: 'Toast with detailed description',
      action: () => toast.info('System maintenance scheduled', {
        description: 'The system will be unavailable from 2:00 AM to 4:00 AM EST tomorrow',
      }),
      icon: Clock,
    },
    {
      title: 'Custom Duration',
      description: 'Toast with custom 10-second duration',
      action: () => toast.success('This will stay for 10 seconds', {
        duration: 10000,
      }),
      icon: Clock,
    },
  ]

  const timeTrackingExamples = [
    {
      title: 'Clock In',
      description: 'Simulate clocking in',
      action: () => toastIntegration.clockInSuccess('9:00 AM'),
      icon: CheckCircle,
    },
    {
      title: 'Clock Out',
      description: 'Simulate clocking out',
      action: () => toastIntegration.clockOutSuccess('8h 30m'),
      icon: Clock,
    },
    {
      title: 'Start Break',
      description: 'Simulate starting a break',
      action: () => toastIntegration.breakStarted('15 minutes'),
      icon: Coffee,
    },
    {
      title: 'Eye Care Reminder',
      description: 'Simulate eye care reminder',
      action: () => toastIntegration.eyeCareReminder(),
      icon: Eye,
    },
    {
      title: 'Time Card Submitted',
      description: 'Simulate time card submission',
      action: () => toastIntegration.timeCardSubmitted('Nov 4 - Nov 10'),
      icon: FileText,
    },
  ]

  const collaborationExamples = [
    {
      title: 'Collaborator Joined',
      description: 'Simulate collaborator joining',
      action: () => toastIntegration.collaboratorJoined('Sarah Johnson'),
      icon: Users,
    },
    {
      title: 'Time Card Updated',
      description: 'Simulate time card update',
      action: () => toastIntegration.timeCardUpdated('Michael Chen'),
      icon: FileText,
    },
  ]

  const dataExamples = [
    {
      title: 'Export Data',
      description: 'Simulate data export',
      action: () => toastIntegration.exportSuccess('time-cards-2024-11.xlsx'),
      icon: Download,
    },
    {
      title: 'Import Success',
      description: 'Simulate data import',
      action: () => toastIntegration.importSuccess(42),
      icon: Upload,
    },
    {
      title: 'Theme Changed',
      description: 'Simulate theme change',
      action: () => toastIntegration.themeChanged('Dark'),
      icon: Settings,
    },
  ]

  const toggleSettings = [
    {
      title: 'Toggle Sounds',
      description: 'Enable/disable toast sounds',
      action: () => toast.updateSettings({ enableSounds: !toast.settings.enableSounds }),
      icon: Volume2,
    },
    {
      title: 'Toggle Browser Notifications',
      description: 'Enable/disable browser notifications',
      action: () => toast.updateSettings({ enableBrowserNotifications: !toast.settings.enableBrowserNotifications }),
      icon: Bell,
    },
  ]

  const renderExamples = (examples: any[], title: string) => (
    <Card className="shadow-premium-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example, index) => {
            const Icon = example.icon
            return (
              <Button
                key={index}
                variant="outline"
                onClick={example.action}
                className="h-auto p-4 flex flex-col items-center gap-2 text-left hover:bg-vc-primary-50 hover:border-vc-primary-300 dark:hover:bg-vc-primary-950/20"
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <div className="text-center">
                  <div className="font-medium text-sm">{example.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {example.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Toast Notification System Demo</h1>
        <p className="text-muted-foreground">
          Explore the comprehensive toast notification system with various types and features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderExamples(basicExamples, 'Basic Toasts')}
        {renderExamples(advancedExamples, 'Advanced Features')}
      </div>

      {renderExamples(timeTrackingExamples, 'Time Tracking Examples')}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderExamples(collaborationExamples, 'Collaboration Examples')}
        {renderExamples(dataExamples, 'Data Operations')}
      </div>

      {renderExamples(toggleSettings, 'Settings')}

      <Card className="shadow-premium-md">
        <CardHeader>
          <CardTitle className="text-lg">Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Sounds</div>
              <div className={toast.settings.enableSounds ? 'text-vc-success-600' : 'text-muted-foreground'}>
                {toast.settings.enableSounds ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <div className="font-medium">Browser Notifications</div>
              <div className={toast.settings.enableBrowserNotifications ? 'text-vc-success-600' : 'text-muted-foreground'}>
                {toast.settings.enableBrowserNotifications ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <div className="font-medium">History</div>
              <div className={toast.settings.enableHistory ? 'text-vc-success-600' : 'text-muted-foreground'}>
                {toast.settings.enableHistory ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <div className="font-medium">Active Toasts</div>
              <div className="text-vc-primary-600">{toast.toasts.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ToastDemo