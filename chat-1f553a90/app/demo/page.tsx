'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClockInOutButton } from '@/components/reminder/clock-in-out-button';
import { ReminderSettings } from '@/components/reminder/reminder-settings';
import { useReminder } from '@/contexts/ReminderContext';
import { Eye, Bell, Clock, Settings, Zap } from 'lucide-react';

export default function DemoPage() {
  const {
    clockInStatus,
    preferences,
    reminderState,
    toggleEyeCare,
    setEyeCareInterval,
    startEyeCareCountdown,
    requestNotificationPermission,
    notificationPermissionGranted,
  } = useReminder();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-black dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Reminder Systems Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test the comprehensive eye care and clock-out reminder features for the VC Time Tracker
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Clock Status</CardTitle>
              <CardDescription>Track your work time</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge
                variant={clockInStatus.isClockedIn ? 'default' : 'secondary'}
                className="mb-4"
              >
                {clockInStatus.isClockedIn ? 'Clocked In' : 'Clocked Out'}
              </Badge>
              <ClockInOutButton />
            </CardContent>
          </Card>

          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Eye Care</CardTitle>
              <CardDescription>20-20-20 rule protection</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <Badge
                variant={preferences.eyeCareEnabled ? 'default' : 'secondary'}
              >
                {preferences.eyeCareEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Interval: {preferences.eyeCareInterval} minutes
              </div>
              <Button
                size="sm"
                onClick={() => toggleEyeCare(!preferences.eyeCareEnabled)}
                disabled={!clockInStatus.isClockedIn}
              >
                {preferences.eyeCareEnabled ? 'Disable' : 'Enable'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-premium-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Browser alerts</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <Badge
                variant={notificationPermissionGranted ? 'default' : 'secondary'}
              >
                {notificationPermissionGranted ? 'Granted' : 'Not Set'}
              </Badge>
              <Button
                size="sm"
                onClick={requestNotificationPermission}
                disabled={notificationPermissionGranted}
              >
                {notificationPermissionGranted ? 'Enabled' : 'Request'
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Manual Testing Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle>Manual Testing Controls</CardTitle>
            </div>
            <CardDescription>
              Test the reminder systems manually (bypassing the automatic timers)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Eye Care Reminder</h4>
                <Button
                  onClick={startEyeCareCountdown}
                  disabled={reminderState.showEyeCareModal}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Trigger Eye Care Reminder Now
                </Button>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Interval Change:</label>
                  <div className="flex gap-2">
                    {[15, 20, 30].map((interval) => (
                      <Button
                        key={interval}
                        size="sm"
                        variant="outline"
                        onClick={() => setEyeCareInterval(interval)}
                      >
                        {interval}min
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Reminder Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Modal Showing:</span>
                    <Badge variant={reminderState.showEyeCareModal ? 'default' : 'secondary'}>
                      {reminderState.showEyeCareModal ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Countdown:</span>
                    <span className="font-mono">{reminderState.countdownSeconds}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Countdown Active:</span>
                    <Badge variant={reminderState.countdownActive ? 'default' : 'secondary'}>
                      {reminderState.countdownActive ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <CardTitle>Configuration Settings</CardTitle>
            </div>
            <CardDescription>
              Full reminder configuration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReminderSettings />
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the reminder systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">Eye Care Reminders</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Only triggers when user is clocked in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Configurable intervals (15-60 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Beautiful modal with 20-second countdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Skip or complete actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Stores last reminder time per user</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-orange-600">Clock Out Reminders</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span>Triggers after 10+ hours of work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span>Checks every hour when clocked in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span>Shows in-app toast notification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span>Browser notification (if permitted)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span>Direct clock-out action button</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold text-blue-600 mb-3">Technical Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Storage</div>
                  <ul className="space-y-1">
                    <li>• Per-user localStorage</li>
                    <li>• Persistent preferences</li>
                    <li>• Clock-in status tracking</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Background Processing</div>
                  <ul className="space-y-1">
                    <li>• Works when tab unfocused</li>
                    <li>• Automatic cleanup on logout</li>
                    <li>• Proper interval management</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Integration</div>
                  <ul className="space-y-1">
                    <li>• Auth system integration</li>
                    <li>• Toast notifications</li>
                    <li>• Browser notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}