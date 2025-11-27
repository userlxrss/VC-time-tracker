'use client'
import { AlertCircle, Lock } from 'lucide-react'

interface PermissionAlertProps {
  currentUserRole: 'boss' | 'employee'
  viewedUserRole: 'boss' | 'employee'
  viewedUserName: string
}

export function PermissionAlert({ currentUserRole, viewedUserRole, viewedUserName }: PermissionAlertProps) {
  const isEmployeeViewingBoss = currentUserRole === 'employee' && viewedUserRole === 'boss'

  if (!isEmployeeViewingBoss) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <Lock size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                View-Only Access
              </h3>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You are viewing {viewedUserName}&apos;s profile in read-only mode. As an employee, you don&apos;t have permission to edit manager information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}