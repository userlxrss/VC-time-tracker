/**
 * Team Dashboard Component for VC Time Tracker
 * Displays comprehensive team status and time tracking information
 */

'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Coffee,
  Activity,
  Filter,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react'
import { useTeamTimeTracking } from '@/hooks/useTeamTimeTracking'
import { useRealTimeStats } from '@/hooks/useRealTimeStats'
import {
  TimeEntryStatus,
  UserProfile,
  UserRole,
  TimeCalculator,
  UserService
} from '@/src/types'
import { EnhancedUserCard } from './enhanced-user-card'
import { cn } from '@/lib/utils'

interface TeamDashboardProps {
  className?: string
  showCompact?: boolean
  refreshInterval?: number
  filters?: {
    roles?: UserRole[]
    statuses?: TimeEntryStatus[]
  }
}

// Filter options
type FilterOption = 'all' | 'active' | 'on-break' | 'inactive' | 'bosses' | 'employees'

// Team statistics card
const TeamStatsCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  trend?: {
    value: string
    isPositive: boolean
  }
}> = ({ title, value, subtitle, icon: Icon, color, bgColor, trend }) => {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            "p-2 rounded-lg",
            bgColor
          )}>
            <Icon className={cn("w-5 h-5", color)} />
          </div>
          {trend && (
            <Badge
              variant={trend.isPositive ? "default" : "secondary"}
              className="text-xs"
            >
              {trend.value}
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Quick filter buttons
const FilterButtons: React.FC<{
  activeFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  teamStats: ReturnType<typeof useTeamTimeTracking>
}> = ({ activeFilter, onFilterChange, teamStats }) => {
  const filters = [
    { key: 'all' as FilterOption, label: 'All', count: teamStats.totalCount },
    { key: 'active' as FilterOption, label: 'Active', count: teamStats.activeCount },
    { key: 'on-break' as FilterOption, label: 'On Break', count: teamStats.onLunchCount + teamStats.onBreakCount },
    { key: 'inactive' as FilterOption, label: 'Inactive', count: teamStats.totalCount - teamStats.activeCount },
    { key: 'bosses' as FilterOption, label: 'Bosses', count: UserService.getBossUsers().length },
    { key: 'employees' as FilterOption, label: 'Employees', count: UserService.getEmployeeUsers().length }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className="relative"
        >
          {filter.label}
          <Badge
            variant="secondary"
            className={cn(
              "ml-2 text-xs",
              activeFilter === filter.key && "bg-primary/20"
            )}
          >
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  )
}

// Team member list item (compact view)
const TeamMemberListItem: React.FC<{
  member: ReturnType<typeof useTeamTimeTracking>['teamMembers'][0]
  isCurrentUser: boolean
}> = ({ member, isCurrentUser }) => {
  const statusColors = {
    [TimeEntryStatus.NOT_STARTED]: 'text-gray-600',
    [TimeEntryStatus.CLOCKED_IN]: 'text-green-600',
    [TimeEntryStatus.ON_LUNCH]: 'text-orange-600',
    [TimeEntryStatus.ON_BREAK]: 'text-blue-600',
    [TimeEntryStatus.CLOCKED_OUT]: 'text-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
        isCurrentUser && "border-green-500 bg-green-50 dark:bg-green-950/20",
        member.isActive && "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
        "hover:shadow-sm"
      )}
    >
      {/* Avatar with status indicator */}
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={member.user.avatar} alt={member.user.fullName} />
          <AvatarFallback className={cn(
            "text-sm font-bold",
            member.user.role === UserRole.BOSS ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            member.user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          )}>
            {member.user.initials}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
          member.status === TimeEntryStatus.CLOCKED_IN ? 'bg-green-500 animate-pulse' :
          member.status === TimeEntryStatus.ON_LUNCH || member.status === TimeEntryStatus.ON_BREAK ? 'bg-orange-500' :
          'bg-gray-500'
        )} />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-medium truncate",
            isCurrentUser && "text-green-600 dark:text-green-400"
          )}>
            {member.user.fullName}
          </h4>
          {isCurrentUser && (
            <span className="text-xs text-muted-foreground">(You)</span>
          )}
          <Badge variant="outline" className="text-xs">
            {member.user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
        <div className={cn(
          "text-sm",
          statusColors[member.status]
        )}>
          {member.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>

      {/* Time info */}
      <div className="text-right">
        <div className="font-mono font-semibold">
          {TimeCalculator.formatHours(member.currentHours)}
        </div>
        <div className="text-xs text-muted-foreground">
          {member.isOnBreak ? 'On Break' : member.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
    </motion.div>
  )
}

// Main Team Dashboard component
export const TeamDashboard: React.FC<TeamDashboardProps> = ({
  className,
  showCompact = false,
  refreshInterval = 30000,
  filters
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'status'>('name')

  const teamTracking = useTeamTimeTracking({ updateInterval: refreshInterval })
  const realTimeStats = useRealTimeStats(60000) // Update stats every minute

  const {
    teamMembers,
    activeCount,
    totalCount,
    onLunchCount,
    onBreakCount,
    totalHoursToday,
    currentUser,
    isLoading,
    error,
    refresh
  } = teamTracking

  // Filter team members based on active filter
  const filteredMembers = useMemo(() => {
    let filtered = [...teamMembers]

    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(member => member.isActive)
        break
      case 'on-break':
        filtered = filtered.filter(member => member.isOnBreak)
        break
      case 'inactive':
        filtered = filtered.filter(member => !member.isActive)
        break
      case 'bosses':
        filtered = filtered.filter(member => member.user.role === UserRole.BOSS)
        break
      case 'employees':
        filtered = filtered.filter(member => member.user.role === UserRole.EMPLOYEE)
        break
      // 'all' - no filtering
    }

    // Apply additional filters if provided
    if (filters?.roles) {
      filtered = filtered.filter(member => filters.roles!.includes(member.user.role))
    }
    if (filters?.statuses) {
      filtered = filtered.filter(member => filters.statuses!.includes(member.status))
    }

    // Sort members
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.user.fullName.localeCompare(b.user.fullName)
        case 'hours':
          return b.currentHours - a.currentHours
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [teamMembers, activeFilter, sortBy, filters])

  // Calculate trends and statistics
  const teamStatistics = useMemo(() => {
    const averageHours = totalCount > 0 ? totalHoursToday / totalCount : 0
    const utilizationRate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0

    return {
      averageHours,
      utilizationRate,
      productivityScore: averageHours > 6 ? 'Excellent' : averageHours > 4 ? 'Good' : 'Needs Improvement'
    }
  }, [activeCount, totalCount, totalHoursToday])

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Team Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TeamStatsCard
          title="Active Now"
          value={activeCount}
          subtitle={`of ${totalCount} team members`}
          icon={Users}
          color="text-green-600"
          bgColor="bg-green-100 dark:bg-green-900/30"
          trend={{
            value: `${Math.round(teamStatistics.utilizationRate)}% utilization`,
            isPositive: teamStatistics.utilizationRate > 50
          }}
        />

        <TeamStatsCard
          title="Team Hours Today"
          value={TimeCalculator.formatHours(totalHoursToday)}
          subtitle={`Average: ${TimeCalculator.formatHours(teamStatistics.averageHours)}`}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
          trend={{
            value: teamStatistics.productivityScore,
            isPositive: teamStatistics.productivityScore === 'Excellent'
          }}
        />

        <TeamStatsCard
          title="On Break"
          value={onLunchCount + onBreakCount}
          subtitle={`${onLunchCount} lunch, ${onBreakCount} short breaks`}
          icon={Coffee}
          color="text-orange-600"
          bgColor="bg-orange-100 dark:bg-orange-900/30"
        />

        <TeamStatsCard
          title="My Hours"
          value={TimeCalculator.formatHours(realTimeStats.hoursToday)}
          subtitle={realTimeStats.currentStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          icon={Calendar}
          color="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          teamStats={teamTracking}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy('name')}
            className={sortBy === 'name' ? 'bg-primary/10' : ''}
          >
            Name
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy('hours')}
            className={sortBy === 'hours' ? 'bg-primary/10' : ''}
          >
            Hours
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy('status')}
            className={sortBy === 'status' ? 'bg-primary/10' : ''}
          >
            Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Team Members Display */}
      {showCompact ? (
        // Compact list view
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <TeamMemberListItem
              key={member.user.id}
              member={member}
              isCurrentUser={currentUser?.id === member.user.id}
            />
          ))}
        </div>
      ) : (
        // Card grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <EnhancedUserCard
              key={member.user.id}
              user={member.user}
              compact={false}
              showActions={currentUser?.id === member.user.id}
              showDetails={true}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-muted-foreground">
              {activeFilter === 'all'
                ? 'No team members available.'
                : `No team members match the "${activeFilter}" filter.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TeamDashboard