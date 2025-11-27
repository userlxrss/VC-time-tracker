/**
 * Comprehensive Time Tracker Component for VC Time Tracker
 * Provides full time tracking functionality with real-time updates
 */

'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  PlayCircle,
  PauseCircle,
  Square,
  Coffee,
  Clock,
  Users,
  Calendar,
  AlertCircle,
  RefreshCw,
  Timer
} from 'lucide-react'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { useTeamTimeTracking } from '@/hooks/useTeamTimeTracking'
import {
  TimeEntryStatus,
  BreakType,
  UserProfile,
  TimeCalculator
} from '@/src/types'
import { cn } from '@/lib/utils'

interface TimeTrackerProps {
  className?: string
  showTeamStats?: boolean
  compact?: boolean
}

// Status indicator component
const StatusIndicator: React.FC<{ status: TimeEntryStatus; isLive?: boolean }> = ({ status, isLive = false }) => {
  const statusConfig = {
    [TimeEntryStatus.NOT_STARTED]: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      borderColor: 'border-gray-300 dark:border-gray-600',
      label: 'Not Started',
      icon: '⚪'
    },
    [TimeEntryStatus.CLOCKED_IN]: {
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-300 dark:border-green-700',
      label: 'Clocked In',
      icon: '🟢'
    },
    [TimeEntryStatus.ON_LUNCH]: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-300 dark:border-orange-700',
      label: 'On Lunch',
      icon: '🟠'
    },
    [TimeEntryStatus.ON_BREAK]: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-700',
      label: 'On Break',
      icon: '🔵'
    },
    [TimeEntryStatus.CLOCKED_OUT]: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      borderColor: 'border-gray-300 dark:border-gray-600',
      label: 'Clocked Out',
      icon: '⚪'
    }
  }

  const config = statusConfig[status] || statusConfig[TimeEntryStatus.NOT_STARTED]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn(
          "w-3 h-3 rounded-full border-2",
          config.color,
          config.borderColor,
          "bg-current",
          isLive && "animate-pulse"
        )} />
        {isLive && (
          <motion.div
            className={cn(
              "absolute inset-0 w-3 h-3 rounded-full",
              config.color.replace('text-', 'bg-')
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
      </div>
      <span className={cn("text-sm font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  )
}

// Time display component
const TimeDisplay: React.FC<{
  hours: number
  isLive?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ hours, isLive = false, label, size = 'md' }) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold'
  }

  return (
    <div className="text-center">
      {label && (
        <div className="text-sm text-muted-foreground mb-1">{label}</div>
      )}
      <div className={cn(
        "text-primary font-mono",
        sizeClasses[size],
        isLive && "animate-pulse"
      )}>
        {wholeHours}h {minutes.toString().padStart(2, '0')}m
      </div>
    </div>
  )
}

// Break timer component
const BreakTimer: React.FC<{
  breakTimeRemaining: number
  breakType: BreakType
}> = ({ breakTimeRemaining, breakType }) => {
  const minutes = Math.floor(breakTimeRemaining / 60)
  const seconds = breakTimeRemaining % 60

  const breakTypeLabels = {
    [BreakType.SHORT_BREAK]: 'Short Break',
    [BreakType.COFFEE_BREAK]: 'Coffee Break',
    [BreakType.RESTROOM]: 'Restroom',
    [BreakType.PERSONAL]: 'Personal',
    [BreakType.MEETING]: 'Meeting',
    [BreakType.OTHER]: 'Other'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {breakTypeLabels[breakType] || 'Break'}
          </span>
        </div>
        <div className="text-lg font-mono font-bold text-blue-600">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  )
}

// Action buttons component
const ActionButtons: React.FC<{
  timeTracking: ReturnType<typeof useTimeTracking>
  compact?: boolean
}> = ({ timeTracking, compact = false }) => {
  const {
    status,
    canClockIn,
    canClockOut,
    canStartLunch,
    canEndLunch,
    canStartBreak,
    canEndBreak,
    onLunchBreak,
    activeBreak,
    isUpdating,
    clockIn,
    clockOut,
    startLunch,
    endLunch,
    startBreak,
    endBreak
  } = timeTracking

  const handleStartBreak = useCallback(() => {
    startBreak(BreakType.SHORT_BREAK)
  }, [startBreak])

  const handleEndBreak = useCallback(() => {
    endBreak()
  }, [endBreak])

  if (compact) {
    return (
      <div className="flex gap-2">
        {canClockIn && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => clockIn()}
            disabled={isUpdating}
          >
            <PlayCircle className="w-4 h-4" />
          </Button>
        )}
        {canClockOut && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => clockOut()}
            disabled={isUpdating}
          >
            <Square className="w-4 h-4" />
          </Button>
        )}
        {canStartLunch && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => startLunch()}
            disabled={isUpdating}
          >
            <Coffee className="w-4 h-4" />
          </Button>
        )}
        {canEndLunch && (
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => endLunch()}
            disabled={isUpdating}
          >
            <PlayCircle className="w-4 h-4" />
          </Button>
        )}
        {canStartBreak && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartBreak}
            disabled={isUpdating}
          >
            <PauseCircle className="w-4 h-4" />
          </Button>
        )}
        {canEndBreak && (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleEndBreak}
            disabled={isUpdating}
          >
            <PlayCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-2"
      >
        {canClockIn && (
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            onClick={() => clockIn()}
            disabled={isUpdating}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        )}

        {canClockOut && (
          <Button
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            onClick={() => clockOut()}
            disabled={isUpdating}
          >
            <Square className="w-4 h-4 mr-2" />
            Clock Out
          </Button>
        )}

        {(canStartLunch || canStartBreak) && (
          <div className="grid grid-cols-2 gap-2">
            {canStartLunch && (
              <Button
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                onClick={() => startLunch()}
                disabled={isUpdating}
              >
                <Coffee className="w-4 h-4 mr-1" />
                Lunch
              </Button>
            )}
            {canStartBreak && (
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={handleStartBreak}
                disabled={isUpdating}
              >
                <PauseCircle className="w-4 h-4 mr-1" />
                Break
              </Button>
            )}
          </div>
        )}

        {canEndLunch && (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            onClick={() => endLunch()}
            disabled={isUpdating}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            End Lunch
          </Button>
        )}

        {canEndBreak && (
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            onClick={handleEndBreak}
            disabled={isUpdating}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            End Break
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Main Time Tracker component
export const TimeTracker: React.FC<TimeTrackerProps> = ({
  className,
  showTeamStats = true,
  compact = false
}) => {
  const timeTracking = useTimeTracking()
  const teamTracking = useTeamTimeTracking({ updateInterval: 30000 }) // Update team every 30 seconds

  const {
    currentTimeEntry,
    currentUser,
    currentHours,
    isTracking,
    activeBreak,
    breakTimeRemaining,
    onLunchBreak,
    status,
    isLoading,
    error,
    refresh
  } = timeTracking

  const {
    activeCount,
    totalCount,
    onLunchCount,
    onBreakCount,
    totalHoursToday
  } = teamTracking

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Main Time Tracker Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentUser && (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.fullName} />
                  <AvatarFallback>{currentUser.initials}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="font-semibold">
                  {currentUser?.fullName || 'Time Tracker'}
                </h3>
                <StatusIndicator status={status} isLive={isTracking} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Time Display */}
          <TimeDisplay
            hours={currentHours}
            isLive={isTracking}
            label="Today"
            size={compact ? "sm" : "lg"}
          />

          {/* Active Break Timer */}
          {activeBreak && (
            <BreakTimer
              breakTimeRemaining={breakTimeRemaining}
              breakType={activeBreak.type}
            />
          )}

          {/* Lunch Break Indicator */}
          {onLunchBreak && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-600">
                <Coffee className="w-4 h-4" />
                <span className="text-sm font-medium">On Lunch Break</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <ActionButtons timeTracking={timeTracking} compact={compact} />

          {/* Time Entry Details */}
          {currentTimeEntry && !compact && (
            <div className="text-sm text-muted-foreground space-y-1">
              {currentTimeEntry.clockIn && (
                <div>Clock In: {TimeCalculator.formatTimeString(currentTimeEntry.clockIn, '12h')}</div>
              )}
              {currentTimeEntry.clockOut && (
                <div>Clock Out: {TimeCalculator.formatTimeString(currentTimeEntry.clockOut, '12h')}</div>
              )}
              {currentTimeEntry.lunchBreak.start && (
                <div>
                  Lunch: {TimeCalculator.formatTimeString(currentTimeEntry.lunchBreak.start, '12h')}
                  {currentTimeEntry.lunchBreak.end && (
                    <> - {TimeCalculator.formatTimeString(currentTimeEntry.lunchBreak.end, '12h')}</>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Statistics */}
      {showTeamStats && !compact && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold">Team Status</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              {onLunchCount > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{onLunchCount}</div>
                  <div className="text-sm text-muted-foreground">Lunch</div>
                </div>
              )}
              {onBreakCount > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{onBreakCount}</div>
                  <div className="text-sm text-muted-foreground">Break</div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Hours Today</span>
                <span className="font-semibold">
                  {TimeCalculator.formatHours(totalHoursToday)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TimeTracker