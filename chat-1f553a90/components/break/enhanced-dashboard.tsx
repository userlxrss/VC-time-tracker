"use client"

import * as React from "react"
import { Users, Clock, TrendingUp, Calendar, Search, Filter, Plus, Download, Settings, Bell, Coffee, Timer } from "lucide-react"

import { PremiumNavbar } from "../premium/navbar"
import { EnhancedUserCard } from "./enhanced-user-card"
import { BreakStatusIntegration } from "./break-status-integration"
import { BreakDashboard } from "./break-dashboard"
import { BreakTimer } from "./break-timer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClockInOutButton } from "@/components/reminder/clock-in-out-button"
import { ReminderSettings } from "@/components/reminder/reminder-settings"
import { useReminder } from "@/contexts/ReminderContext"
import { useBreak } from "@/contexts/BreakContext"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: 'clocked_in' | 'clocked_out' | 'on_break'
  todayHours: number
  weekHours: number
  monthlyHours: number
  department: string
  joinedAt: string
  lastActive: string
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@vcfirm.com',
    avatar: '/avatars/sarah.jpg',
    role: 'Partner',
    status: 'clocked_in',
    todayHours: 6.5,
    weekHours: 32.5,
    monthlyHours: 140.5,
    department: 'Investment Team',
    joinedAt: 'Jan 2020',
    lastActive: '2 min ago'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@vcfirm.com',
    role: 'Associate',
    status: 'clocked_in',
    todayHours: 8.0,
    weekHours: 40.0,
    monthlyHours: 160.0,
    department: 'Investment Team',
    joinedAt: 'Mar 2021',
    lastActive: 'Active now'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@vcfirm.com',
    role: 'Analyst',
    status: 'on_break',
    todayHours: 5.5,
    weekHours: 28.5,
    monthlyHours: 125.0,
    department: 'Research Team',
    joinedAt: 'Jun 2022',
    lastActive: '15 min ago'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@vcfirm.com',
    role: 'Manager',
    status: 'clocked_out',
    todayHours: 7.0,
    weekHours: 35.0,
    monthlyHours: 155.5,
    department: 'Operations',
    joinedAt: 'Feb 2019',
    lastActive: '1 hour ago'
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@vcfirm.com',
    role: 'Associate',
    status: 'clocked_in',
    todayHours: 4.5,
    weekHours: 30.5,
    monthlyHours: 145.0,
    department: 'Investment Team',
    joinedAt: 'Sep 2021',
    lastActive: '5 min ago'
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex.thompson@vcfirm.com',
    role: 'Analyst',
    status: 'clocked_out',
    todayHours: 0,
    weekHours: 25.0,
    monthlyHours: 110.5,
    department: 'Research Team',
    joinedAt: 'Jan 2023',
    lastActive: '2 hours ago'
  }
]

interface EnhancedDashboardProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
}

export function EnhancedDashboard({
  userName = "Sarah Johnson",
  userEmail = "sarah.johnson@vcfirm.com",
  userAvatar,
}: EnhancedDashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showSettings, setShowSettings] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('team')

  const { clockInStatus, preferences } = useReminder()
  const { isOnBreak, stats } = useBreak()

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeUsers = mockUsers.filter(user => user.status === 'clocked_in').length
  const totalTodayHours = mockUsers.reduce((sum, user) => sum + user.todayHours, 0)
  const totalWeekHours = mockUsers.reduce((sum, user) => sum + user.weekHours, 0)

  const handleClockIn = (userId: string) => {
    console.log('Clock in user:', userId)
  }

  const handleClockOut = (userId: string) => {
    console.log('Clock out user:', userId)
  }

  const handleViewProfile = (userId: string) => {
    console.log('View profile:', userId)
  }

  const handleSendMessage = (userId: string) => {
    console.log('Send message:', userId)
  }

  return (
    <BreakStatusIntegration>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-black dark:to-slate-900">
        <PremiumNavbar
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          notificationCount={3}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="pt-20 px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Dashboard Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Enhanced Team Dashboard
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Monitor team productivity with integrated break management
                  </p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {/* Clock In/Out Button */}
                  <ClockInOutButton />

                  {/* Break Management Quick Access */}
                  {isOnBreak && (
                    <Button variant="outline" size="sm" className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                      <Coffee className="h-4 w-4 mr-2" />
                      On Break
                    </Button>
                  )}

                  {/* Settings Button */}
                  <div className="relative">
                    {clockInStatus.isClockedIn && preferences.eyeCareEnabled && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="relative"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>

                  {/* Notifications Button */}
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Alerts
                  </Button>
                </div>
              </div>

              {/* Enhanced Quick Stats with Break Integration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="group hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Active Now
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {activeUsers}/{mockUsers.length}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-vc-success-400 to-vc-success-600 flex items-center justify-center shadow-premium-md">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Today's Total
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {totalTodayHours.toFixed(1)}h
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-vc-primary-400 to-vc-primary-600 flex items-center justify-center shadow-premium-md">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          This Week
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {totalWeekHours.toFixed(1)}h
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-vc-accent-400 to-vc-accent-600 flex items-center justify-center shadow-premium-md">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Avg Hours/Day
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {(totalWeekHours / 5 / mockUsers.length).toFixed(1)}h
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-vc-warning-400 to-vc-warning-600 flex items-center justify-center shadow-premium-md">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Break Stats Card */}
                <Card className="group hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02] bg-orange-50 dark:bg-orange-900/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Today's Breaks
                        </p>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.totalBreaksToday}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-premium-md">
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      {stats.totalBreakTimeToday > 0 ? `${stats.totalBreakTimeToday} min total` : 'No breaks yet'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Reminder Settings Panel */}
            {showSettings && (
              <ReminderSettings />
            )}

            {/* Active Break Banner */}
            {isOnBreak && (
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          You're currently on a break
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Take this time to recharge and refresh your mind
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      On Break
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team View
                </TabsTrigger>
                <TabsTrigger value="breaks" className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Break Management
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Overview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="team" className="space-y-6">
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-vc-primary-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        List
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="default" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team Member
                    </Button>
                  </div>
                </div>

                {/* Team Members Grid/List */}
                <div className={viewMode === 'grid' ?
                  "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" :
                  "space-y-4"
                }>
                  {filteredUsers.map((user) => (
                    <EnhancedUserCard
                      key={user.id}
                      user={user}
                      compact={viewMode === 'list'}
                      onClockIn={handleClockIn}
                      onClockOut={handleClockOut}
                      onViewProfile={handleViewProfile}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                  <Card className="p-12 text-center">
                    <div className="h-20 w-20 rounded-full bg-vc-primary-100 dark:bg-vc-primary-900/20 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-10 w-10 text-vc-primary-600 dark:text-vc-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No team members found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search terms or filters
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="breaks">
                <BreakDashboard />
              </TabsContent>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Break Timer */}
                  {isOnBreak && (
                    <div className="lg:col-span-2">
                      <BreakTimer />
                    </div>
                  )}

                  {/* Quick Break Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coffee className="h-5 w-5" />
                        Quick Break Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-16 flex-col">
                          <Coffee className="h-6 w-6 mb-2" />
                          5-min Break
                        </Button>
                        <Button variant="outline" className="h-16 flex-col">
                          <Timer className="h-6 w-6 mb-2" />
                          10-min Break
                        </Button>
                        <Button variant="outline" className="h-16 flex-col">
                          <Coffee className="h-6 w-6 mb-2" />
                          Lunch Break
                        </Button>
                        <Button variant="outline" className="h-16 flex-col">
                          <Timer className="h-6 w-6 mb-2" />
                          Custom Break
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Today's Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Work Time</span>
                          <span className="font-medium">{totalTodayHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Break Time</span>
                          <span className="font-medium">{stats.totalBreakTimeToday} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Productivity</span>
                          <span className="font-medium">
                            {Math.round((totalTodayHours * 60 / (totalTodayHours * 60 + stats.totalBreakTimeToday)) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Team Active</span>
                          <span className="font-medium">{activeUsers}/{mockUsers.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </BreakStatusIntegration>
  )
}