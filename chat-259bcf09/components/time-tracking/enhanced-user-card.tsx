/**
 * Enhanced User Card Component with Full Time Tracking Integration
 * Provides comprehensive time tracking functionality for individual users
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
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
  TrendingUp,
  Eye,
  Timer,
  AlertCircle
} from 'lucide-react'
import { useTimeTracking } from '@/hooks/useTimeTracking'
import { useTeamTimeTracking } from '@/hooks/useTeamTimeTracking'
import {
  TimeEntryStatus,
  BreakType,
  UserProfile,
  UserRole,
  TimeCalculator,
  UserService
} from '@/src/types'
import { cn } from '@/lib/utils'

interface EnhancedUserCardProps {
  user: UserProfile
  className?: string
  showActions?: boolean
  showDetails?: boolean
  compact?: boolean
  onStatusChange?: (userId: string, status: TimeEntryStatus) => void
}

// Status indicator with live animation
const StatusIndicator: React.FC<{
  status: TimeEntryStatus
  isLive?: boolean
  size?: 'sm' | 'md' | 'lg'
}> = ({ status, isLive = false, size = 'md' }) => {
  const statusConfig = {
    [TimeEntryStatus.NOT_STARTED]: {
      color: 'bg-gray-500',
      label: 'Not Started',
      icon: '⚪',
      textColor: 'text-gray-600'
    },
    [TimeEntryStatus.CLOCKED_IN]: {
      color: 'bg-green-500',
      label: 'Clocked In',
      icon: '🟢',
      textColor: 'text-green-600'
    },
    [TimeEntryStatus.ON_LUNCH]: {
      color: 'bg-orange-500',
      label: 'On Lunch',
      icon: '🟠',
      textColor: 'text-orange-600'
    },
    [TimeEntryStatus.ON_BREAK]: {
      color: 'bg-blue-500',
      label: 'On Break',
      icon: '🔵',
      textColor: 'text-blue-600'
    },
    [TimeEntryStatus.CLOCKED_OUT]: {
      color: 'bg-gray-500',
      label: 'Clocked Out',
      icon: '⚪',
      textColor: 'text-gray-600'
    }
  }

  const config = statusConfig[status] || statusConfig[TimeEntryStatus.NOT_STARTED]
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn(
          "rounded-full border-2 border-background",
          sizeClasses[size],
          config.color,
          isLive && "animate-pulse"
        )} />
        {isLive && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full",
              sizeClasses[size],
              config.color
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
      <span className={cn("text-sm font-medium", config.textColor)}>
        {config.label}
      </span>
    </div>
  )
}

// Time display with live updates
const LiveTimeDisplay: React.FC<{
  hours: number
  isLive?: boolean
  size?: 'sm' | 'md'
  label?: string
}> = ({ hours, isLive = false, size = 'md', label }) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-bold'
  }

  return (
    <div className="text-center">
      {label && (
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
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

// Break timer for active breaks
const BreakTimerDisplay: React.FC<{
  breakTimeRemaining: number
  breakType: BreakType
}> = ({ breakTimeRemaining, breakType }) => {
  const minutes = Math.floor(breakTimeRemaining / 60)
  const seconds = breakTimeRemaining % 60

  const breakTypeLabels = {
    [BreakType.SHORT_BREAK]: 'Break',
    [BreakType.COFFEE_BREAK]: 'Coffee',
    [BreakType.RESTROOM]: 'Restroom',
    [BreakType.PERSONAL]: 'Personal',
    [BreakType.MEETING]: 'Meeting',
    [BreakType.OTHER]: 'Other'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Timer className="w-3 h-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-600">
            {breakTypeLabels[breakType] || 'Break'}
          </span>
        </div>
        <div className="text-sm font-mono font-bold text-blue-600">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  )
}

// Action buttons for time tracking
const TimeTrackingActions: React.FC<{
  timeTracking: ReturnType<typeof useTimeTracking>
  user: UserProfile
  isCurrentUser: boolean
  showActions?: boolean
  compact?: boolean
}> = ({ timeTracking, user, isCurrentUser, showActions = true, compact = false }) => {
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

  // If not showing actions or user can't control this card, show view button
  if (!showActions || !isCurrentUser) {
    return (
      <Button
        variant="outline"
        className={compact ? "w-full h-8" : "w-full"}
        size={compact ? "sm" : "default"}
      >
        <Eye className={compact ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"} />
        View Details
      </Button>
    )
  }

  if (compact) {
    return (
      <div className="flex gap-1">
        {canClockIn && (
          <Button
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700"
            onClick={() => clockIn()}
            disabled={isUpdating}
          >
            <PlayCircle className="w-3 h-3" />
          </Button>
        )}
        {canClockOut && (
          <Button
            size="sm"
            variant="destructive"
            className="h-8"
            onClick={() => clockOut()}
            disabled={isUpdating}
          >
            <Square className="w-3 h-3" />
          </Button>
        )}
        {canStartLunch && (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => startLunch()}
            disabled={isUpdating}
          >
            <Coffee className="w-3 h-3" />
          </Button>
        )}
        {canStartBreak && (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={handleStartBreak}
            disabled={isUpdating}
          >
            <PauseCircle className="w-3 h-3" />
          </Button>
        )}
        {canEndLunch && (
          <Button
            size="sm"
            className="h-8 bg-orange-600 hover:bg-orange-700"
            onClick={() => endLunch()}
            disabled={isUpdating}
          >
            <PlayCircle className="w-3 h-3" />
          </Button>
        )}
        {canEndBreak && (
          <Button
            size="sm"
            className="h-8 bg-blue-600 hover:bg-blue-700"
            onClick={handleEndBreak}
            disabled={isUpdating}
          >
            <PlayCircle className="w-3 h-3" />
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

// Main Enhanced User Card component
export const EnhancedUserCard: React.FC<EnhancedUserCardProps> = ({
  user,
  className,
  showActions = true,
  showDetails = true,
  compact = false,
  onStatusChange
}) => {
  // Get current user session
  const currentSession = UserService.getCurrentSession()
  const isCurrentUser = currentSession.user.id === user.id
  const canControl = UserService.currentUserCanControlUserCard(user.id)

  // Use team tracking to get this user's status
  const teamTracking = useTeamTimeTracking()
  const memberStatus = teamTracking.getTeamMemberStatus(user.id)

  // For current user, use detailed time tracking
  const timeTracking = useTimeTracking()
  const detailedTracking = isCurrentUser ? timeTracking : null

  // Determine which tracking data to use
  const trackingData = detailedTracking || {
    status: memberStatus?.status || TimeEntryStatus.NOT_STARTED,
    currentHours: memberStatus?.currentHours || 0,
    isTracking: memberStatus?.isActive || false,
    activeBreak: null,
    breakTimeRemaining: 0,
    onLunchBreak: memberStatus?.status === TimeEntryStatus.ON_LUNCH,
    canClockIn: !memberStatus?.timeEntry?.clockIn,
    canClockOut: !!(memberStatus?.timeEntry?.clockIn && !memberStatus?.timeEntry?.clockOut),
    canStartLunch: !!(memberStatus?.timeEntry?.clockIn && !memberStatus?.timeEntry?.clockOut && !memberStatus?.timeEntry?.lunchBreak.start),
    canEndLunch: !!(memberStatus?.timeEntry?.lunchBreak.start && !memberStatus?.timeEntry?.lunchBreak.end),
    canStartBreak: !!(memberStatus?.timeEntry?.clockIn && !memberStatus?.timeEntry?.clockOut && !memberStatus?.timeEntry?.lunchBreak.start && !memberStatus?.timeEntry?.lunchBreak.end),
    canEndBreak: false, // Would need more detailed tracking
    isUpdating: false
  }

  const {
    status,
    currentHours,
    isTracking,
    activeBreak,
    breakTimeRemaining,
    onLunchBreak
  } = trackingData

  // Role badge color
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case UserRole.BOSS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case UserRole.EMPLOYEE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  // Determine border color based on current user
  const getBorderColor = () => {
    if (isCurrentUser) return 'border-green-500 shadow-green-500/20'
    if (user.role === UserRole.BOSS) return 'border-blue-500 shadow-blue-500/20'
    return 'border-border shadow-border/20'
  }

  // Calculate week stats (mock data for now)
  const weekHours = useMemo(() => {
    return currentHours * 3 // Simple mock calculation
  }, [currentHours])

  const monthHours = useMemo(() => {
    return currentHours * 15 // Simple mock calculation
  }, [currentHours])

  // Notify status change
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(user.id, status)
    }
  }, [status, user.id, onStatusChange])

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300",
          isCurrentUser ? 'border-2' : 'border',
          getBorderColor(),
          className
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className={cn(
                    "text-sm font-bold",
                    isCurrentUser ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    getRoleBadgeColor()
                  )}>
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                  status === TimeEntryStatus.CLOCKED_IN ? 'bg-green-500 animate-pulse' :
                  status === TimeEntryStatus.ON_LUNCH || status === TimeEntryStatus.ON_BREAK ? 'bg-orange-500' :
                  'bg-gray-500'
                )} />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "font-semibold truncate",
                    isCurrentUser && "text-green-600 dark:text-green-400"
                  )}>
                    {user.fullName}
                  </h4>
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <StatusIndicator status={status} isLive={isTracking} size="sm" />
              </div>

              {/* Time Display */}
              <div className="text-right">
                <LiveTimeDisplay hours={currentHours} isLive={isTracking} size="sm" />
              </div>
            </div>

            {/* Break Timer */}
            {activeBreak && (
              <div className="mt-2">
                <BreakTimerDisplay
                  breakTimeRemaining={breakTimeRemaining}
                  breakType={activeBreak.type}
                />
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="mt-3">
                <TimeTrackingActions
                  timeTracking={trackingData}
                  user={user}
                  isCurrentUser={isCurrentUser}
                  showActions={showActions}
                  compact={compact}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={cn(
        "h-full min-h-[400px] relative overflow-hidden transition-all duration-300",
        isCurrentUser ? 'border-2' : 'border',
        getBorderColor()
      )}>
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className={cn(
                  "text-xl font-bold",
                  isCurrentUser ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  getRoleBadgeColor()
                )}>
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator ring */}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background",
                status === TimeEntryStatus.CLOCKED_IN ? 'bg-green-500 animate-pulse' :
                status === TimeEntryStatus.ON_LUNCH || status === TimeEntryStatus.ON_BREAK ? 'bg-orange-500' :
                'bg-gray-500'
              )} />
            </div>

            {/* User info */}
            <div className="space-y-2">
              <h3 className={cn(
                "text-xl font-bold",
                isCurrentUser ? 'text-green-600 dark:text-green-400' : 'text-foreground'
              )}>
                {user.fullName}
                {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
              </h3>
              <Badge className={getRoleBadgeColor()}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <StatusIndicator status={status} isLive={isTracking} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <LiveTimeDisplay hours={currentHours} isLive={isTracking} label="TODAY" />
            <LiveTimeDisplay hours={weekHours} label="WEEK" />
            <LiveTimeDisplay hours={monthHours} label="MONTH" />
          </div>

          {/* Break Timer */}
          {activeBreak && (
            <div className="mt-2">
              <BreakTimerDisplay
                breakTimeRemaining={breakTimeRemaining}
                breakType={activeBreak.type}
              />
            </div>
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

          {/* Time Entry Details */}
          {showDetails && trackingData.currentTimeEntry && (
            <div className="text-sm text-muted-foreground space-y-1">
              {trackingData.currentTimeEntry.clockIn && (
                <div>Clock In: {TimeCalculator.formatTimeString(trackingData.currentTimeEntry.clockIn, '12h')}</div>
              )}
              {trackingData.currentTimeEntry.clockOut && (
                <div>Clock Out: {TimeCalculator.formatTimeString(trackingData.currentTimeEntry.clockOut, '12h')}</div>
              )}
              {trackingData.currentTimeEntry.lunchBreak.start && (
                <div>
                  Lunch: {TimeCalculator.formatTimeString(trackingData.currentTimeEntry.lunchBreak.start, '12h')}
                  {trackingData.currentTimeEntry.lunchBreak.end && (
                    <> - {TimeCalculator.formatTimeString(trackingData.currentTimeEntry.lunchBreak.end, '12h')}</>
                  )}
                </div>
              )}
              {trackingData.currentTimeEntry.shortBreaks.length > 0 && (
                <div>
                  Breaks: {trackingData.currentTimeEntry.shortBreaks.length} taken
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <TimeTrackingActions
              timeTracking={trackingData}
              user={user}
              isCurrentUser={isCurrentUser}
              showActions={showActions && canControl}
              compact={compact}
            />
          )}
        </CardContent>

        {/* Subtle glow effect for current user */}
        {isCurrentUser && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
        )}
      </Card>
    </motion.div>
  )
}

export default EnhancedUserCard