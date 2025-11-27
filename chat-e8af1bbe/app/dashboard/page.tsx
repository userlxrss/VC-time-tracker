'use client'

import DashboardLayout from '@/components/DashboardLayout'
import QuickStats from '@/components/QuickStats'
import UserCardsGrid from '@/components/UserCardsGrid'
import { CalendarDaysIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const recentActivity = [
    { id: 1, type: 'timesheet', user: 'Michael Chen', action: 'submitted timesheet', time: '2 minutes ago' },
    { id: 2, type: 'request', user: 'Sarah Johnson', action: 'requested time off', time: '15 minutes ago' },
    { id: 3, type: 'approval', user: 'David Kim', action: 'timesheet approved', time: '1 hour ago' },
    { id: 4, type: 'request', user: 'Emily Rodriguez', action: 'updated profile', time: '2 hours ago' },
  ]

  const upcomingEvents = [
    { id: 1, title: 'Team Meeting', date: 'Today, 2:00 PM', type: 'meeting' },
    { id: 2, title: 'Timesheet Deadline', date: 'Friday, 5:00 PM', type: 'deadline' },
    { id: 3, title: 'Company Holiday', date: 'Next Monday', type: 'holiday' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Here's what's happening with your team today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Generate Report
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              Export Data
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Cards - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Members
              </h2>
              <UserCardsGrid />
            </div>
          </div>

          {/* Sidebar Content - Takes 1 column on large screens */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <UserGroupIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{activity.user}</span>{' '}
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                  View all activity
                </button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          event.type === 'meeting' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          event.type === 'deadline' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          <CalendarDaysIcon className={`h-4 w-4 ${
                            event.type === 'meeting' ? 'text-blue-600 dark:text-blue-400' :
                            event.type === 'deadline' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {event.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                  View calendar
                </button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <UserGroupIcon className="h-6 w-6 mx-auto text-gray-600 dark:text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Add Employee</span>
                  </button>
                  <button className="p-3 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <CalendarDaysIcon className="h-6 w-6 mx-auto text-gray-600 dark:text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Schedule</span>
                  </button>
                  <button className="p-3 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 mx-auto text-gray-600 dark:text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Reports</span>
                  </button>
                  <button className="p-3 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 mx-auto text-gray-600 dark:text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Settings</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}