'use client';

import React, { useState } from 'react';
import { Bell, BellOff, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReminder } from '@/contexts/ReminderContext';

export function ReminderSettings() {
  const {
    preferences,
    clockInStatus,
    toggleEyeCare,
    setEyeCareInterval,
    requestNotificationPermission,
    notificationPermissionGranted,
  } = useReminder();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleNotificationToggle = async () => {
    if (!notificationPermissionGranted) {
      await requestNotificationPermission();
    }
  };

  const intervalOptions = [15, 20, 25, 30, 45, 60];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Reminder Settings</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <CardDescription>
          Configure your personalized reminder preferences
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Eye Care Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Eye Care Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    20-20-20 rule to reduce eye strain
                  </p>
                </div>
              </div>
              <Button
                variant={preferences.eyeCareEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEyeCare(!preferences.eyeCareEnabled)}
                disabled={!clockInStatus.isClockedIn}
              >
                {preferences.eyeCareEnabled ? (
                  <Bell className="h-4 w-4 mr-2" />
                ) : (
                  <BellOff className="h-4 w-4 mr-2" />
                )}
                {preferences.eyeCareEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {preferences.eyeCareEnabled && (
              <div className="ml-12 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Reminder Interval
                </label>
                <div className="flex flex-wrap gap-2">
                  {intervalOptions.map((interval) => (
                    <Button
                      key={interval}
                      variant={preferences.eyeCareInterval === interval ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEyeCareInterval(interval)}
                    >
                      {interval} min
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Next reminder in approximately {preferences.eyeCareInterval} minutes
                </p>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Browser Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notifications even when the app is in the background
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notificationPermissionGranted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Enabled
                  </Badge>
                )}
                <Button
                  variant={notificationPermissionGranted ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleNotificationToggle}
                  disabled={notificationPermissionGranted}
                >
                  {notificationPermissionGranted ? 'Configured' : 'Enable'}
                </Button>
              </div>
            </div>

            {notificationPermissionGranted && (
              <div className="ml-12 space-y-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Clock-out reminders after 10+ hours of work</p>
                  <p>• Eye care reminders (when enabled)</p>
                  <p>• Works even when browser tab is not focused</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Information */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Work Status:</span>
              <Badge variant={clockInStatus.isClockedIn ? 'default' : 'secondary'}>
                {clockInStatus.isClockedIn ? 'Clocked In' : 'Clocked Out'}
              </Badge>
            </div>
            {clockInStatus.isClockedIn && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Reminders are active while you're clocked in</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}