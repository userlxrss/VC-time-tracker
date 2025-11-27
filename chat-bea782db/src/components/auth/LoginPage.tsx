/**
 * LoginPage Component
 *
 * Complete login interface with form validation, role-based login,
 * and demo user suggestions for the HR Time Tracker.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole, EmploymentStatus } from '../../../database-schema';

interface LoginFormData {
  email: string;
  password: string;
}

interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  avatar: string;
}

export function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(true);

  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Demo users for quick login
  const demoUsers: DemoUser[] = [
    {
      name: 'Larina Cruz',
      email: 'larina@company.com',
      password: 'password123',
      role: 'Employee',
      department: 'Operations',
      avatar: '👩‍💼',
    },
    {
      name: 'Ella Rodriguez',
      email: 'ella@company.com',
      password: 'password123',
      role: 'Manager',
      department: 'Management',
      avatar: '👩‍💼',
    },
    {
      name: 'Peej Santos',
      email: 'peej@company.com',
      password: 'password123',
      role: 'Manager',
      department: 'IT',
      avatar: '👨‍💼',
    },
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Clear errors when form changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDemoUserClick = (demoUser: DemoUser) => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password,
    });
    setShowDemoUsers(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">⏰</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            HR Time Tracker
          </h2>
          <p className="text-gray-600">
            Sign in to manage your time and attendance
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Demo Users</span>
            </div>
          </div>

          {/* Demo Users */}
          {showDemoUsers && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center mb-3">
                Click on a user to quickly sign in:
              </p>
              {demoUsers.map((demoUser) => (
                <button
                  key={demoUser.email}
                  onClick={() => handleDemoUserClick(demoUser)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{demoUser.avatar}</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{demoUser.name}</p>
                      <p className="text-xs text-gray-500">
                        {demoUser.role} • {demoUser.department}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {demoUser.email}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            This is a demo application. Use any of the demo users above to explore.
          </p>
          <p className="mt-2">
            All users have the password: <code className="bg-gray-200 px-2 py-1 rounded">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}