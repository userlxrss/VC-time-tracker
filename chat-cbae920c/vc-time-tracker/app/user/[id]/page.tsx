'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { USERS, CURRENT_USER_ID, User } from '../../constants/users'
import { UserHeader } from './components/UserHeader'
import { TabNavigation } from './components/TabNavigation'
import { PermissionAlert } from './components/PermissionAlert'
import { TimeTrackingTab } from './components/tabs/TimeTrackingTab'
import { TimesheetTab } from './components/tabs/TimesheetTab'
import { LeaveTab } from './components/tabs/LeaveTab'
import { SalaryTab } from './components/tabs/SalaryTab'
import { CalendarTab } from './components/tabs/CalendarTab'
import { SettingsTab } from './components/tabs/SettingsTab'
import ClientOnlySalaryManagement from '../../../components/ClientOnlySalaryManagement'
import { ArrowLeft } from 'lucide-react'

type TabType = 'time-tracking' | 'timesheet' | 'leave' | 'salary' | 'calendar' | 'settings'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('time-tracking')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userId = parseInt(params.id as string)
  const isOwnProfile = userId === CURRENT_USER_ID
  const currentUser = USERS.find(u => u.id === CURRENT_USER_ID)
  const viewedUser = USERS.find(u => u.id === userId)

  useEffect(() => {
    // Simulate API call
    const fetchUser = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))

      const foundUser = USERS.find(u => u.id === userId)
      if (foundUser) {
        setUser(foundUser)
      } else {
        router.push('/')
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [userId, router])

  // Current user can edit own profile
// Boss users can edit employee profiles (not applicable for current hardcoded user)
const canEdit: boolean = Boolean(isOwnProfile)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'time-tracking':
        return <TimeTrackingTab userId={userId} canEdit={canEdit} />
      case 'timesheet':
        return <TimesheetTab userId={userId} canEdit={canEdit} />
      case 'leave':
        return <LeaveTab userId={userId} canEdit={canEdit} />
      case 'salary':
        return <SalaryTab userId={userId} canEdit={canEdit} />
      case 'calendar':
        return <CalendarTab userId={userId} canEdit={canEdit} />
      case 'settings':
        return isOwnProfile ? <SettingsTab userId={userId} /> : null
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h2>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'time-tracking', label: 'Time Tracking', icon: '⏱️' },
    { id: 'timesheet', label: 'Timesheet', icon: '📊' },
    { id: 'leave', label: 'Leave', icon: '🏖️' },
    { id: 'salary', label: 'Salary', icon: '💰' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
  ]

  if (isOwnProfile) {
    tabs.push({ id: 'settings', label: 'Settings', icon: '⚙️' })
  }

  return (
    <ClientOnlySalaryManagement
      currentUserId={CURRENT_USER_ID}
      targetEmployeeId={userId}
      useSharedHistory={true}
    >
      {({ markAsPaid, confirmReceipt, salaryHistory, pendingSalaries, isProcessing }) => (
        <div className="min-h-screen bg-gray-50 overflow-y-auto">
          {/* Navigation Header */}
          <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.firstName}'s Profile
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                  {currentUser?.firstName[0]}
                </div>
              </div>
            </div>
          </nav>

          {/* User Header */}
          <UserHeader user={user} canEdit={canEdit} />

          {/* Permission Alert */}
          {!canEdit && viewedUser && (
            <PermissionAlert
              currentUserRole={currentUser?.role || 'employee'}
              viewedUserRole={viewedUser.role}
              viewedUserName={viewedUser.firstName}
            />
          )}

          {/* Tab Navigation */}
          <div className="max-w-7xl mx-auto px-6">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              canEdit={canEdit}
            />
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-6 pb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}
    </ClientOnlySalaryManagement>
  )
}