'use client';

import React from 'react';
import { BreakDashboard } from '@/components/break/break-dashboard';
import { BreakStatusIntegration } from '@/components/break/break-status-integration';
import { BreakTimer } from '@/components/break/break-timer';
import { BreakControls } from '@/components/break/break-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Timer, Clock, BarChart3, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BreakManagementPage() {
  return (
    <BreakStatusIntegration>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Break Management</h1>
          <p className="text-muted-foreground">
            Comprehensive break tracking system for optimal productivity and work-life balance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quick Start</p>
                  <p className="text-lg font-semibold">5-min Break</p>
                </div>
                <Coffee className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lunch Break</p>
                  <p className="text-lg font-semibold">30-60 min</p>
                </div>
                <Timer className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Auto Tracking</p>
                  <p className="text-lg font-semibold">Smart Timer</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Analytics</p>
                  <p className="text-lg font-semibold">Insights</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Break Management Interface */}
        <BreakDashboard />

        {/* Feature Showcase */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Break Management Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Real-time Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Live countdown display</li>
                  <li>• Progress tracking</li>
                  <li>• Pause/Resume functionality</li>
                  <li>• Auto-end notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Break Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Lunch breaks (30-60 min)</li>
                  <li>• Short breaks (5-30 min)</li>
                  <li>• Custom durations</li>
                  <li>• Quick preset buttons</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Break history tracking</li>
                  <li>• Time management insights</li>
                  <li>• Productivity analysis</li>
                  <li>• Export capabilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Smart Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Time tracking sync</li>
                  <li>• Status updates</li>
                  <li>• Break reminders</li>
                  <li>• Browser notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Persistence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Session recovery</li>
                  <li>• Auto-save progress</li>
                  <li>• Break continuity</li>
                  <li>• Data export options</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Break visibility</li>
                  <li>• Team coordination</li>
                  <li>• Status indicators</li>
                  <li>• Privacy controls</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Guidelines and Best Practices */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Break Guidelines & Best Practices</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Break Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Morning Routine</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Start work with fresh energy</li>
                      <li>• Take first short break after 90 minutes</li>
                      <li>• Stay hydrated and stretch</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Lunch Break (12:00-1:00 PM)</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Take a proper 30-60 minute break</li>
                      <li>• Eat away from your workspace</li>
                      <li>• Take a short walk if possible</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Afternoon Focus</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Take short breaks every 60-90 minutes</li>
                      <li>• Use breaks to combat post-lunch slump</li>
                      <li>• Maintain consistent break intervals</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productivity Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">20-20-20 Rule</h4>
                    <p className="text-sm text-muted-foreground">
                      Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Pomodoro Technique</h4>
                    <p className="text-sm text-muted-foreground">
                      Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Avoid Burnout</h4>
                    <p className="text-sm text-muted-foreground">
                      Listen to your body's signals. Take breaks when you feel tired, distracted, or stressed.
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Break Activities</h4>
                    <p className="text-sm text-muted-foreground">
                      Stand up, stretch, walk around, get water, practice deep breathing, or do quick exercises.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Start 5-minute break</span>
                  <Badge variant="outline">Ctrl + Shift + 5</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Start 10-minute break</span>
                  <Badge variant="outline">Ctrl + Shift + 10</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Start lunch break</span>
                  <Badge variant="outline">Ctrl + Shift + L</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">End current break</span>
                  <Badge variant="outline">Ctrl + Shift + E</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BreakStatusIntegration>
  );
}