'use client'

import { useState } from 'react'
import UserCard from './UserCard'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Badge } from './ui/badge'

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

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Team Lead',
    department: 'Engineering',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c101?w=64&h=64&fit=crop&crop=face',
    status: 'online',
    hoursThisWeek: 42,
    timesheetStatus: 'submitted',
    lastActive: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Developer',
    department: 'Engineering',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    status: 'online',
    hoursThisWeek: 38,
    timesheetStatus: 'pending',
    lastActive: '5 minutes ago'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'Designer',
    department: 'Design',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    status: 'away',
    hoursThisWeek: 40,
    timesheetStatus: 'submitted',
    lastActive: '1 hour ago'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'Developer',
    department: 'Engineering',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face',
    status: 'offline',
    hoursThisWeek: 35,
    timesheetStatus: 'overdue',
    lastActive: '3 hours ago'
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@company.com',
    role: 'HR Manager',
    department: 'Human Resources',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&crop=face',
    status: 'online',
    hoursThisWeek: 45,
    timesheetStatus: 'submitted',
    lastActive: 'Active now'
  },
  {
    id: '6',
    name: 'Robert Anderson',
    email: 'robert.anderson@company.com',
    role: 'Admin',
    department: 'IT',
    location: 'Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    status: 'busy',
    hoursThisWeek: 44,
    timesheetStatus: 'pending',
    lastActive: '15 minutes ago'
  }
]

const departments = ['All', 'Engineering', 'Design', 'Human Resources', 'IT', 'Marketing']
const timesheetFilters = ['All', 'Submitted', 'Pending', 'Overdue']

export default function UserCardsGrid() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedTimesheetStatus, setSelectedTimesheetStatus] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid')

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === 'All' || user.department === selectedDepartment
    const matchesTimesheetStatus = selectedTimesheetStatus === 'All' ||
                                  user.timesheetStatus.toLowerCase() === selectedTimesheetStatus.toLowerCase()

    return matchesSearch && matchesDepartment && matchesTimesheetStatus
  })

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex gap-2">
            {departments.map(dept => (
              <Badge
                key={dept}
                variant={selectedDepartment === dept ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept}
              </Badge>
            ))}
          </div>

          {/* Timesheet Status Filter */}
          <div className="flex gap-2">
            {timesheetFilters.map(status => (
              <Badge
                key={status}
                variant={selectedTimesheetStatus === status ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                onClick={() => setSelectedTimesheetStatus(status)}
              >
                {status}
              </Badge>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Badge
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Badge>
            <Badge
              variant={viewMode === 'compact' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setViewMode('compact')}
            >
              Compact
            </Badge>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredUsers.length} of {mockUsers.length} employees
        </p>
        <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <FunnelIcon className="h-4 w-4" />
          Advanced Filters
        </button>
      </div>

      {/* User Cards Grid */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            compact={viewMode === 'compact'}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No employees found</div>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}