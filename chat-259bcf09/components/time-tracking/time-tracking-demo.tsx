/**
 * Time Tracking Demo Component
 * Demonstrates all features of the comprehensive time tracking system
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock,
  Users,
  PlayCircle,
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import { TimeTracker } from './time-tracker'
import { TeamDashboard } from './team-dashboard'
import { EnhancedUserCard } from './enhanced-user-card'
import { useRealTimeStats } from '@/hooks/useRealTimeStats'
import { useTeamTimeTracking } from '@/hooks/useTeamTimeTracking'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { UserService, HARDCODED_USERS } from '@/src/types'
import { loadTestData } from '@/utils/testData'

export const TimeTrackingDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState<'live' | 'sample'>('sample')
  const realTimeStats = useRealTimeStats(5000) // Update every 5 seconds for demo
  const teamTracking = useTeamTimeTracking(10000) // Update team every 10 seconds
  const timeTracking = useTimeTracking(1000) // Update current user every second

  // Load sample data for demonstration
  const handleLoadSampleData = () => {
    try {
      const sampleEntries = loadTestData()
      console.log(`Loaded ${sampleEntries.length} sample time entries`)

      // Refresh all hooks to show the new data
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Error loading sample data:', error)
    }
  }

  // Clear all data
  const handleClearData = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(window.localStorage)
        keys.forEach(key => {
          if (key.startsWith('vctime_')) {
            window.localStorage.removeItem(key)
          }
        })
      }

      // Refresh all hooks
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }

  // Get current user
  const currentUser = UserService.getCurrentSession().user

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              VC Time Tracker - Comprehensive Demo
            </h1>
            <p className="text-muted-foreground mt-2">
              Full-featured time tracking system with real-time updates, break management, and team monitoring
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              {realTimeStats.isUpdating ? 'Updating...' : 'Live'}
            </Badge>
            <Badge variant={demoMode === 'live' ? 'default' : 'secondary'}>
              {demoMode === 'live' ? 'Live Data' : 'Sample Data'}
            </Badge>
          </div>
        </div>

        {/* Demo Controls */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a comprehensive demo of the VC Time Tracker system.
            {!currentUser && ' Please load sample data to see the full functionality.'}
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={handleLoadSampleData} variant="outline">
            <PlayCircle className="w-4 h-4 mr-2" />
            Load Sample Data
          </Button>
          <Button onClick={handleClearData} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
          <Button
            onClick={() => setDemoMode(demoMode === 'live' ? 'sample' : 'live')}
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            Switch to {demoMode === 'live' ? 'Sample' : 'Live'} Mode
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal Tracker</TabsTrigger>
            <TabsTrigger value="team">Team Dashboard</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current User Time Tracker */}
              <div className="lg:col-span-1">
                <TimeTracker
                  showTeamStats={false}
                  compact={false}
                />
              </div>

              {/* Team Stats */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {teamTracking.activeCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Now</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {teamTracking.totalCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Team</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {teamTracking.onLunchCount}
                        </div>
                        <div className="text-sm text-muted-foreground">On Lunch</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {realTimeStats.hoursToday.toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Your Hours</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members Preview */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamTracking.teamMembers.slice(0, 4).map(member => (
                      <EnhancedUserCard
                        key={member.user.id}
                        user={member.user}
                        compact={true}
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Personal Tracker Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <TimeTracker
                showTeamStats={true}
                compact={false}
              />

              {/* Additional Personal Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Personal Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">
                        {realTimeStats.hoursToday.toFixed(1)} hours
                      </div>
                      <div className="text-sm text-muted-foreground">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">
                        {realTimeStats.hoursThisWeek.toFixed(1)} hours
                      </div>
                      <div className="text-sm text-muted-foreground">This Week</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant="outline">
                        {realTimeStats.currentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily Goal Progress:</span>
                      <span>{realTimeStats.dailyGoalProgress.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Week Progress:</span>
                      <span>{realTimeStats.weekProgress.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Dashboard Tab */}
          <TabsContent value="team" className="space-y-6">
            <TeamDashboard
              showCompact={false}
              refreshInterval={15000}
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Core Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Clock In/Out with timestamp</li>
                    <li>✓ Real-time hour calculation</li>
                    <li>✓ Automatic break deduction</li>
                    <li>✓ Live status updates</li>
                    <li>✓ Cross-tab synchronization</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Break Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Lunch break tracking</li>
                    <li>✓ Short breaks (up to 4/day)</li>
                    <li>✓ Live break timers</li>
                    <li>✓ Automatic time deduction</li>
                    <li>✓ Break type categorization</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Team Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Real-time team status</li>
                    <li>✓ Team activity monitoring</li>
                    <li>✓ Active/inactive tracking</li>
                    <li>✓ Role-based permissions</li>
                    <li>✓ Team statistics</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-600" />
                    Data Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Full localStorage integration</li>
                    <li>✓ Persistent data storage</li>
                    <li>✓ Data validation</li>
                    <li>✓ Error handling</li>
                    <li>✓ Import/export capabilities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Real-time Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Per-second timer updates</li>
                    <li>✓ Live hour calculations</li>
                    <li>✓ Real-time status changes</li>
                    <li>✓ Team synchronization</li>
                    <li>✓ Cross-tab updates</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Business Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Lunch required for 6+ hour shifts</li>
                    <li>✓ Maximum 4 short breaks per day</li>
                    <li>✓ 60-minute break limit</li>
                    <li>✓ Time validation</li>
                    <li>✓ Overlap prevention</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Session Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Current Status:</span>
                      <Badge variant="outline">
                        {realTimeStats.currentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Tracking:</span>
                      <Badge variant={realTimeStats.isTracking ? "default" : "secondary"}>
                        {realTimeStats.isTracking ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>On Break:</span>
                      <Badge variant={realTimeStats.onBreak ? "destructive" : "secondary"}>
                        {realTimeStats.onBreak ? realTimeStats.breakType || 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours Today:</span>
                      <span className="font-mono">{realTimeStats.hoursToday.toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours This Week:</span>
                      <span className="font-mono">{realTimeStats.hoursThisWeek.toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Goal Progress:</span>
                      <span>{realTimeStats.dailyGoalProgress.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Week Progress:</span>
                      <span>{realTimeStats.weekProgress.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Team Active:</span>
                      <span>{teamTracking.activeCount}/{teamTracking.totalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On Lunch:</span>
                      <span>{teamTracking.onLunchCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On Break:</span>
                      <span>{teamTracking.onBreakCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team Hours Today:</span>
                      <span className="font-mono">{teamTracking.totalHoursToday.toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Update:</span>
                      <span className="text-sm text-muted-foreground">
                        {teamTracking.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updating:</span>
                      <Badge variant={teamTracking.isUpdating ? "default" : "secondary"}>
                        {teamTracking.isUpdating ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TimeTrackingDemo