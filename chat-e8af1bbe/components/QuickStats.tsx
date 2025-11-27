'use client'

import { Card, CardContent } from './ui/card'
import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'red'
}

const stats: StatCard[] = [
  {
    title: 'Total Employees',
    value: '248',
    change: '+12 from last month',
    changeType: 'increase',
    icon: UserGroupIcon,
    color: 'blue'
  },
  {
    title: 'Hours Tracked This Week',
    value: '1,847',
    change: '+5.2% from last week',
    changeType: 'increase',
    icon: ClockIcon,
    color: 'green'
  },
  {
    title: 'Pending Approvals',
    value: '23',
    change: '-8 from yesterday',
    changeType: 'decrease',
    icon: CheckCircleIcon,
    color: 'yellow'
  },
  {
    title: 'Overdue Timesheets',
    value: '7',
    change: 'No change',
    changeType: 'neutral',
    icon: ExclamationTriangleIcon,
    color: 'red'
  }
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400'
  }
}

const changeColorClasses = {
  increase: 'text-green-600 dark:text-green-400',
  decrease: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-500 dark:text-gray-400'
}

export default function QuickStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="hover:shadow-md transition-shadow duration-200 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${changeColorClasses[stat.changeType]}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color].bg}`}>
                <stat.icon className={`h-6 w-6 ${colorClasses[stat.color].icon}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}