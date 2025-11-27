'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user } = useAuth()

  const goBack = () => {
    router.back()
  }

  const goDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {user ? (
            <>
              Sorry, {user.name}. You don't have permission to access this page.
              {user.role === 'employee' && ' This feature is only available to managers.'}
            </>
          ) : (
            'You need to be logged in to access this page.'
          )}
        </p>

        <div className="space-y-3">
          <button
            onClick={goDashboard}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </button>

          <button
            onClick={goBack}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>

        {user && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Your role:</strong> {user.role}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}