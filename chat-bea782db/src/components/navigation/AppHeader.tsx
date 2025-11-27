/**
 * App Header Component
 *
 * Main application header with logo, user profile, notifications,
 * and responsive mobile menu. Integrates with navigation context.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from './NavigationContext';
import {
  BellIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  UserIcon
} from './icons/NavigationIcons';
import { UserProfileDropdown } from '../auth/UserProfileDropdown';

export function AppHeader() {
  const { user } = useAuth();
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    darkMode,
    toggleDarkMode,
    notificationCount,
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useNavigation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">

        {/* Left side: Logo and mobile menu toggle */}
        <div className="flex items-center">
          {/* Mobile menu toggle */}
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <XIcon size="lg" />
              ) : (
                <MenuIcon size="lg" />
              )}
            </button>
          )}

          {/* Desktop sidebar toggle */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 mr-4 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle sidebar"
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <MenuIcon size="md" />
              ) : (
                <XIcon size="md" />
              )}
            </button>
          )}

          {/* Company Logo and Brand */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold" aria-hidden="true">
                ⏰
              </span>
            </div>

            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                VC Time Tracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Flexible Work Culture
              </p>
            </div>

            {/* Mobile only brand name */}
            <div className="sm:hidden">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                VC Tracker
              </h1>
            </div>
          </Link>
        </div>

        {/* Right side: Actions and user profile */}
        <div className="flex items-center space-x-3">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon size="md" />
            ) : (
              <MoonIcon size="md" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
            >
              <BellIcon size="md" />

              {/* Notification badge */}
              {notificationCount > 0 && (
                <span
                  className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notification dropdown (placeholder for future implementation) */}
            {notificationCount > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Notifications
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        You have pending timesheet entries to review
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Leave request awaiting your approval
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <UserProfileDropdown />

          {/* Mobile user avatar (fallback if dropdown doesn't work) */}
          <div className="sm:hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile backdrop when menu is open */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}