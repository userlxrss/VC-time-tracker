/**
 * Complete VC Time Tracker Dashboard
 * Enterprise-ready dashboard with all components integrated
 * Real-time updates, toast notifications, eye care reminders, and responsive design
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Activity,
  Settings,
  Bell,
  Moon,
  Sun,
  RefreshCw,
  Download,
  Filter,
  Search,
  Menu,
  X
} from 'lucide-react'

import { PremiumUserGridEnhanced } from '@/components/dashboard/premium-user-grid-enhanced'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { EyeCareReminder } from '@/components/notifications/eye-care-reminder'
import { ToastManager } from '@/components/notifications/toast-manager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useRealTimeStats } from '@/hooks/useRealTimeStats'
import { TimeEntryStatus } from '@/src/types'
import { cn } from '@/lib/utils'

// Dashboard layout animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
}

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header skeleton */}
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    {/* Stats skeleton */}
    <div className="container mx-auto px-6 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[100px] bg-muted rounded-xl animate-pulse" />
        ))}
      </div>

      {/* User cards skeleton */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[360px] bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
)

// Filter and search component
const DashboardFilters = ({
  onFilterChange,
  onSearchChange,
  showOnlyActive,
  searchTerm
}: {
  onFilterChange: (active: boolean) => void
  onSearchChange: (term: string) => void
  showOnlyActive: boolean
  searchTerm: string
}) => (
  <motion.div
    variants={itemVariants}
    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Team View</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={showOnlyActive}
          onCheckedChange={onFilterChange}
        />
        <span className="text-sm text-muted-foreground">Active Only</span>
      </div>
    </div>

    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search team members..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full sm:w-64"
      />
    </div>
  </motion.div>
)

// Main Dashboard Component
export default function VCDashboard() {
  const { theme, setTheme } = useTheme()
  const { isUpdating, refresh } = useRealTimeStats()
  const [showOnlyActive, setShowOnlyActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      ToastManager.welcome('Welcome to VC Time Tracker!')
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh()
      setLastSync(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [refresh])

  // Manual refresh handler
  const handleRefresh = async () => {
    const loadingToast = ToastManager.loading('Refreshing dashboard...')
    try {
      await refresh()
      setLastSync(new Date())
      ToastManager.dataSaved('Dashboard refreshed successfully!')
    } catch (error) {
      ToastManager.generalError('Failed to refresh dashboard', error as Error)
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  // Export data handler
  const handleExport = () => {
    ToastManager.info('Export feature coming soon! 📊')
  }

  // Settings toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    ToastManager.info(`Switched to ${newTheme} mode`)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">VC Time Tracker</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Enterprise Time Management Dashboard
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="hidden sm:flex">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Live
              </Badge>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isUpdating}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
                {isUpdating ? 'Updating...' : 'Refresh'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleThemeToggle}
                className="gap-2"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="default" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pt-4 border-t mt-4"
              >
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isUpdating}
                    className="justify-start gap-2"
                  >
                    <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
                    Refresh
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleThemeToggle}
                    className="justify-start gap-2"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>

                  <Button variant="default" size="sm" className="justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Quick Stats Section */}
          <motion.div variants={itemVariants}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                  <p className="text-muted-foreground">
                    Real-time team productivity metrics
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Last sync</div>
                  <div className="text-sm font-medium">
                    {lastSync.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
            <QuickStats />
          </motion.div>

          {/* Filters and Search */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <DashboardFilters
                  onFilterChange={setShowOnlyActive}
                  onSearchChange={setSearchTerm}
                  showOnlyActive={showOnlyActive}
                  searchTerm={searchTerm}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Status Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Team Time Cards</h2>
                <p className="text-muted-foreground">
                  Real-time status and time tracking for all team members
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Activity className="w-3 h-3 mr-1" />
                  Active Now
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Premium User Grid */}
          <motion.div variants={itemVariants}>
            <Suspense fallback={<DashboardSkeleton />}>
              <PremiumUserGridEnhanced
                enableRealTime={true}
                showOnlyActive={showOnlyActive}
                className="mt-0"
              />
            </Suspense>
          </motion.div>

          {/* Dashboard Footer */}
          <motion.div
            variants={itemVariants}
            className="pt-8 border-t text-center text-sm text-muted-foreground"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <p>• Data stored locally • Auto-sync every 30 seconds •</p>
              <p>• Premium Dashboard v2.0 •</p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Eye Care Reminder System */}
      <EyeCareReminder />

      {/* Floating Action Button for Quick Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 left-6 z-40"
      >
        <Button
          onClick={() => ToastManager.info('Quick actions coming soon!')}
          className="rounded-full w-14 h-14 shadow-lg gap-0"
        >
          <Activity className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  )
}