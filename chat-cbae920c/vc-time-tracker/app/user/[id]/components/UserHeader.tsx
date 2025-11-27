'use client'
import { useState, useEffect } from 'react'
import { User } from '../../../constants/users'
import { StatusIndicator } from './StatusIndicator'
import { Camera, Mail, Phone, MapPin } from 'lucide-react'

interface UserHeaderProps {
  user: User
  canEdit: boolean
}

export function UserHeader({ user, canEdit }: UserHeaderProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'away' | 'busy'>('offline')
  const [lastSeen, setLastSeen] = useState<string>('')

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      const random = Math.random()
      if (random < 0.3) {
        setStatus('online')
        setLastSeen('')
      } else if (random < 0.5) {
        setStatus('away')
        setLastSeen('5 minutes ago')
      } else if (random < 0.7) {
        setStatus('busy')
        setLastSeen('2 minutes ago')
      } else {
        setStatus('offline')
        setLastSeen('15 minutes ago')
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const getRoleColor = (role: string) => {
    return role === 'boss' ? 'bg-blue-500' : 'bg-green-500'
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'boss'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-5xl font-bold text-white shadow-lg`}>
                {user.firstName[0]}
              </div>
              {canEdit && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-800">
                  <Camera size={18} />
                </button>
              )}
              <StatusIndicator status={status} className="absolute bottom-2 right-2" />
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role === 'boss' ? 'Manager' : 'Employee'}
              </span>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            </div>

            {/* Department Info */}
            <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div>
                <span className="font-medium">Department:</span> {user.department}
              </div>
              <div>
                <span className="font-medium">Start Date:</span> {new Date(user.startDate).toLocaleDateString()}
              </div>
            </div>

            {/* Status Information */}
            <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <StatusIndicator status={status} />
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {status === 'online' ? 'Available' : status}
                </span>
                {lastSeen && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    • Last seen {lastSeen}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            {canEdit && (
              <>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                  Send Message
                </button>
              </>
            )}
            {!canEdit && (
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}