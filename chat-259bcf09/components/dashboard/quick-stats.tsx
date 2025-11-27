/**
 * Premium Quick Stats Section for VC Time Tracker Dashboard
 * Real-time statistics with glassmorphism effects and animations
 */

'use client'

import { motion } from 'framer-motion'
import { Clock, Calendar, Activity, Users, Pulse } from 'lucide-react'
import { useRealTimeStats } from '@/hooks/useRealTimeStats'
import { TimeEntryStatus } from '@/src/types'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number | React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  trend?: {
    value: string
    isPositive: boolean
  }
  delay?: number
  isAnimated?: boolean
}

// Premium Stat Card with glassmorphism and hover effects
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
  delay = 0,
  isAnimated = false
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={cn(
        "relative group",
        "h-[100px] p-5 rounded-xl",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg",
        "border border-white/20 dark:border-gray-700/20",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
        "transition-all duration-300 ease-out",
        "overflow-hidden"
      )}
    >
      {/* Glassmorphism background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-gray-800/10 to-transparent" />

      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative h-full flex flex-col justify-between">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "p-2 rounded-lg",
            bgColor,
            "transition-all duration-300 group-hover:scale-110"
          )}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>

          {/* Trend indicator */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400"
              )}
            >
              {trend.value}
            </motion.div>
          )}
        </div>

        {/* Main content */}
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {isAnimated ? (
              <motion.span
                key={String(value)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                {value}
              </motion.span>
            ) : (
              value
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {title}
          </div>
        </div>
      </div>

      {/* Subtle animated corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent to-white/10 dark:to-gray-700/10 rounded-bl-2xl" />
    </motion.div>
  )
}

// Status indicator with pulse animation
const StatusIndicator = ({ status }: { status: TimeEntryStatus }) => {
  const statusConfig = {
    [TimeEntryStatus.CLOCKED_IN]: {
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      pulseColor: 'bg-green-500',
      label: 'Clocked In'
    },
    [TimeEntryStatus.ON_LUNCH]: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      pulseColor: 'bg-orange-500',
      label: 'On Lunch'
    },
    [TimeEntryStatus.ON_BREAK]: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      pulseColor: 'bg-orange-500',
      label: 'On Break'
    },
    [TimeEntryStatus.CLOCKED_OUT]: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800/30',
      borderColor: 'border-gray-200 dark:border-gray-700',
      pulseColor: 'bg-gray-500',
      label: 'Clocked Out'
    },
    [TimeEntryStatus.NOT_STARTED]: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800/30',
      borderColor: 'border-gray-200 dark:border-gray-700',
      pulseColor: 'bg-gray-500',
      label: 'Not Started'
    }
  }

  const config = statusConfig[status] || statusConfig[TimeEntryStatus.NOT_STARTED]
  const isPulsing = status === TimeEntryStatus.CLOCKED_IN

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {isPulsing && (
          <motion.div
            className={cn(
              "absolute inset-0 w-3 h-3 rounded-full",
              config.pulseColor
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <div className={cn(
          "w-3 h-3 rounded-full border-2",
          config.color,
          config.borderColor,
          "bg-current"
        )} />
      </div>
      <span className={cn("text-sm font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  )
}

// Team Active indicator
const TeamActiveIndicator = ({ activeCount, totalCount }: { activeCount: number; totalCount: number }) => {
  const percentage = totalCount > 0 ? (activeCount / totalCount) * 100 : 0

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {activeCount}/{totalCount}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Active</span>
        <span className="text-gray-600 dark:text-gray-400">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <motion.div
          className="bg-blue-600 h-1.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Format hours for display
const formatHours = (hours: number) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (minutes === 0) {
    return `${wholeHours}h`
  }
  return `${wholeHours}h ${minutes}m`
}

// Main Quick Stats Component
export function QuickStats() {
  const stats = useRealTimeStats()

  // Get trend based on hours worked
  const getHoursTrend = (hours: number) => {
    if (hours === 0) return { value: 'Not Started', isPositive: false }
    if (hours >= 8) return { value: 'Excellent!', isPositive: true }
    if (hours >= 6) return { value: 'On Track', isPositive: true }
    if (hours >= 4) return { value: 'Good Progress', isPositive: true }
    return { value: 'Keep Going', isPositive: true }
  }

  // Get week trend based on total hours
  const getWeekTrend = (hours: number) => {
    if (hours >= 40) return { value: 'Great!', isPositive: true }
    if (hours >= 30) return { value: 'Good', isPositive: true }
    if (hours >= 20) return { value: 'On Track', isPositive: true }
    return { value: 'Keep Going', isPositive: true }
  }

  const statCards = [
    {
      title: 'Hours Today',
      value: formatHours(stats.hoursToday),
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      trend: getHoursTrend(stats.hoursToday),
      delay: 0,
      isAnimated: stats.isUpdating && stats.currentStatus === TimeEntryStatus.CLOCKED_IN
    },
    {
      title: 'Hours This Week',
      value: formatHours(stats.hoursThisWeek),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50',
      trend: getWeekTrend(stats.hoursThisWeek),
      delay: 0.1,
      isAnimated: false
    },
    {
      title: 'Status',
      value: (
        <StatusIndicator status={stats.currentStatus} />
      ),
      icon: Activity,
      color: stats.currentStatus === TimeEntryStatus.CLOCKED_IN ? 'text-green-600' :
             stats.currentStatus === TimeEntryStatus.ON_LUNCH || stats.currentStatus === TimeEntryStatus.ON_BREAK ? 'text-orange-600' :
             'text-gray-600',
      bgColor: stats.currentStatus === TimeEntryStatus.CLOCKED_IN ? 'bg-green-50 dark:bg-green-950/50' :
                stats.currentStatus === TimeEntryStatus.ON_LUNCH || stats.currentStatus === TimeEntryStatus.ON_BREAK ? 'bg-orange-50 dark:bg-orange-950/50' :
                'bg-gray-50 dark:bg-gray-800/50',
      delay: 0.2,
      isAnimated: false
    },
    {
      title: 'Team Active',
      value: (
        <TeamActiveIndicator
          activeCount={stats.teamActiveCount}
          totalCount={stats.teamTotalCount}
        />
      ),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      delay: 0.3,
      isAnimated: false
    }
  ]

  if (!stats.currentUser) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[100px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}