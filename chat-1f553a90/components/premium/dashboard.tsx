"use client"

import * as React from "react"
import { Users, Clock, TrendingUp, Calendar, Search, Filter, Plus, Download, Settings, Bell } from "lucide-react"

import { PremiumNavbar } from "./navbar"
import { PremiumUserCard } from "./user-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClockInOutButton } from "@/components/reminder/clock-in-out-button"
import { ReminderSettings } from "@/components/reminder/reminder-settings"
import { useReminder } from "@/contexts/ReminderContext"

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

interface DashboardProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
}

export function PremiumDashboard({
  userName = "Sarah Johnson",
  userEmail = "sarah.johnson@vcfirm.com",
  userAvatar,
}: DashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showSettings, setShowSettings] = React.useState(false)

  const { clockInStatus, preferences } = useReminder()

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
                  Team Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Monitor team productivity and time tracking in real-time
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-3">
                {/* Clock In/Out Button */}
                <ClockInOutButton />

                {/* Settings Button with Status Indicator */}
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
          </div>

          {/* Reminder Settings Panel */}
          {showSettings && (
            <ReminderSettings />
          )}

          {/* Status Banner */}
          {clockInStatus.isClockedIn && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        You're clocked in and tracking time
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {preferences.eyeCareEnabled
                          ? `Eye care reminders every ${preferences.eyeCareInterval} minutes`
                          : 'Eye care reminders are disabled'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

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
              <PremiumUserCard
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
        </div>
      </main>
    </div>
  )
}