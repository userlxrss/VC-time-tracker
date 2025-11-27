'use client'

import { Card, CardContent } from './ui/card'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import {
  EllipsisVerticalIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  location: string
  avatar: string
  status: 'online' | 'offline' | 'away' | 'busy'
  hoursThisWeek: number
  timesheetStatus: 'submitted' | 'pending' | 'overdue'
  lastActive: string
}

interface UserCardProps {
  user: User
  compact?: boolean
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500'
}

const roleBadgeColors = {
  'Admin': 'default',
  'HR Manager': 'secondary',
  'Team Lead': 'success',
  'Developer': 'outline',
  'Designer': 'warning'
} as const

const timesheetStatusColors = {
  submitted: 'success',
  pending: 'warning',
  overdue: 'danger'
} as const

export default function UserCard({ user, compact = false }: UserCardProps) {
  if (compact) {
    return (
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar
                src={user.avatar}
                alt={user.name}
                size="md"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[user.status]}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.role}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.hoursThisWeek}h
              </p>
              <Badge
                variant={timesheetStatusColors[user.timesheetStatus]}
                className="text-xs"
              >
                {user.timesheetStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar
                src={user.avatar}
                alt={user.name}
                size="xl"
              />
              <span
                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-3 border-white dark:border-gray-800 ${statusColors[user.status]} animate-pulse-soft`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={roleBadgeColors[user.role as keyof typeof roleBadgeColors] || 'outline'}>
                  {user.role}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {user.department}
                </Badge>
              </div>
            </div>
          </div>
          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            {user.location}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                <ClockIcon className="h-4 w-4 mr-1" />
                This Week
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.hoursThisWeek}h
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Timesheet
              </div>
              <Badge
                variant={timesheetStatusColors[user.timesheetStatus]}
                className="mt-1"
              >
                {user.timesheetStatus}
              </Badge>
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            Last active: {user.lastActive}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}