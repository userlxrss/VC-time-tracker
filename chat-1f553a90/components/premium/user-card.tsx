"use client"

import * as React from "react"
import { Clock, Users, TrendingUp, Calendar, MoreHorizontal } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusIndicator } from "@/components/ui/status-indicator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatHours } from "@/lib/utils"

interface UserCardProps {
  user: {
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
  onClockIn?: (userId: string) => void
  onClockOut?: (userId: string) => void
  onViewProfile?: (userId: string) => void
  onSendMessage?: (userId: string) => void
  compact?: boolean
}

export function PremiumUserCard({
  user,
  onClockIn,
  onClockOut,
  onViewProfile,
  onSendMessage,
  compact = false,
}: UserCardProps) {
  const isClockedIn = user.status === 'clocked_in'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'success'
      case 'clocked_out':
        return 'secondary'
      case 'on_break':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'partner':
        return 'default'
      case 'associate':
        return 'secondary'
      case 'analyst':
        return 'outline'
      case 'manager':
        return 'default'
      default:
        return 'outline'
    }
  }

  if (compact) {
    return (
      <Card className="group hover:shadow-premium-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-vc-primary-100 dark:ring-vc-primary-800">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <StatusIndicator status={user.status} size="sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                <Badge variant={getRoleColor(user.role)} size="sm">
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.department}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatHours(user.todayHours)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatHours(user.weekHours)} this week
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Badge
                variant={getStatusColor(user.status)}
                size="sm"
                className="whitespace-nowrap"
              >
                {user.status === 'clocked_in' ? 'Active' :
                 user.status === 'on_break' ? 'On Break' : 'Offline'}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProfile?.(user.id)}>
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSendMessage?.(user.id)}>
                    Send Message
                  </DropdownMenuItem>
                  {isClockedIn ? (
                    <DropdownMenuItem onClick={() => onClockOut?.(user.id)}>
                      Clock Out
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onClockIn?.(user.id)}>
                      Clock In
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-premium-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 overflow-hidden">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-vc-primary-500/20 via-transparent to-vc-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-vc-primary-100 dark:ring-vc-primary-800 shadow-premium-md">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <StatusIndicator status={user.status} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
                <Badge variant={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{user.department}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={getStatusColor(user.status)}
              className="animate-fade-in"
            >
              {user.status === 'clocked_in' ? '🟢 Clocked In' :
               user.status === 'on_break' ? '🟡 On Break' : '⚫ Clocked Out'}
            </Badge>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Last active</p>
              <p className="text-sm font-medium">{user.lastActive}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-vc-primary-50/50 dark:bg-vc-primary-900/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-vc-primary-600 dark:text-vc-primary-400" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-lg font-bold text-vc-primary-600 dark:text-vc-primary-400">
              {formatHours(user.todayHours)}
            </p>
          </div>

          <div className="text-center p-3 rounded-xl bg-vc-accent-50/50 dark:bg-vc-accent-900/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-vc-accent-600 dark:text-vc-accent-400" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-lg font-bold text-vc-accent-600 dark:text-vc-accent-400">
              {formatHours(user.weekHours)}
            </p>
          </div>

          <div className="text-center p-3 rounded-xl bg-vc-success-50/50 dark:bg-vc-success-900/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-vc-success-600 dark:text-vc-success-400" />
              <span className="text-xs text-muted-foreground">Monthly</span>
            </div>
            <p className="text-lg font-bold text-vc-success-600 dark:text-vc-success-400">
              {formatHours(user.monthlyHours)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isClockedIn ? (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onClockOut?.(user.id)}
            >
              Clock Out
            </Button>
          ) : (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onClockIn?.(user.id)}
            >
              Clock In
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => onViewProfile?.(user.id)}
          >
            Profile
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSendMessage?.(user.id)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Button>
        </div>

        {/* Joined Date */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Team member since</span>
            <span className="font-medium">{user.joinedAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}