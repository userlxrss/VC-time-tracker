/**
 * Main App Component
 *
 * Root component that integrates authentication, routing, and the overall application structure.
 * Includes role-based routing with protected routes and comprehensive error handling.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TimesheetPage } from './pages/TimesheetPage';
import { LeavePage } from './pages/LeavePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Loading component for authentication checks
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        <p className="text-gray-600 mt-2">Setting up your workspace</p>
      </div>
    </div>
  );
}

// Landing page component
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-8">
            <span className="text-white text-3xl font-bold">⏰</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            HR Time Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive time tracking solution designed for flexible work cultures.
            Track hours, manage leave requests, and streamline HR operations.
          </p>

          <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Key Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Time Tracking</h3>
                <p className="text-sm text-gray-600">
                  Flexible hour tracking with break periods and overtime calculation
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Role Management</h3>
                <p className="text-sm text-gray-600">
                  Employee, manager, and admin roles with appropriate permissions
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reporting</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive reports with CSV, Excel, and PDF export options
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Leave Management</h3>
                <p className="text-sm text-gray-600">
                  Request and approve leave with automated balance tracking
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Freelancer Support</h3>
                <p className="text-sm text-gray-600">
                  Specialized features for freelancers with payment tracking
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Sync</h3>
                <p className="text-sm text-gray-600">
                  Cross-tab synchronization and real-time updates
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Quick Start Demo
              </h3>
              <p className="text-blue-800 mb-4">
                Try the demo with these pre-configured users:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium text-blue-900">Larina (Employee)</p>
                  <p className="text-blue-700">larina@company.com</p>
                  <p className="text-blue-600">Password: password123</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium text-blue-900">Ella (Manager)</p>
                  <p className="text-blue-700">ella@company.com</p>
                  <p className="text-blue-600">Password: password123</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium text-blue-900">Peej (Manager)</p>
                  <p className="text-blue-700">peej@company.com</p>
                  <p className="text-blue-600">Password: password123</p>
                </div>
              </div>
            </div>

            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Get Started →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/timesheet"
            element={
              <ProtectedRoute>
                <TimesheetPage />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for navigation */}
          <Route
            path="/time-tracking"
            element={
              <ProtectedRoute>
                <TimesheetPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Team Management</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600">Team management functionality coming soon...</p>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Reports</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600">Reporting functionality coming soon...</p>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave"
            element={
              <ProtectedRoute>
                <LeavePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Calendar</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600">Calendar functionality coming soon...</p>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App