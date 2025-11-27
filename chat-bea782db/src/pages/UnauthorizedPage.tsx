/**
 * UnauthorizedPage Component
 *
 * Shows when a user tries to access a page they don't have permission for.
 * Provides clear messaging and navigation options.
 */

import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What this means:
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Your current role doesn't have access to this feature
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                This page requires manager or administrator privileges
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Contact your manager if you need access to this functionality
              </li>
            </ul>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Need help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you believe this is an error or need access to this feature, please contact your system administrator.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              to="/dashboard"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Go to Dashboard
            </Link>

            <Link
              to="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}