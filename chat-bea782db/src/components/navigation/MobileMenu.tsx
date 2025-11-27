/**
 * Mobile Menu Component
 *
 * Slide-out mobile menu with navigation items and user actions.
 * Features smooth animations, role-based visibility, and touch interactions.
 */

import { Link } from 'react-router-dom';
import { useAuth, canManageTeam } from '../../context/AuthContext';
import { useNavigation } from './NavigationContext';
import { useNavigationItems } from './NavigationItems';
import { DynamicNavigationIcon, XIcon } from './icons/NavigationIcons';
import { Badge } from '../ui/Badge';
import { UserProfileDropdown } from '../auth/UserProfileDropdown';

export function MobileMenu() {
  const { user } = useAuth();
  const { mobileMenuOpen, setMobileMenuOpen, activePath, isMobile } = useNavigation();
  const navigationItems = useNavigationItems();

  // Don't render if not mobile or menu is closed
  if (!isMobile || !mobileMenuOpen) {
    return null;
  }

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <>
      {/* Mobile Menu Panel */}
      <div className="fixed inset-0 z-40 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div className="relative flex flex-col w-80 max-w-full bg-white dark:bg-gray-800 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Menu
            </h2>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label="Close menu"
            >
              <XIcon size="lg" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {user?.firstName?.[0] || 'U'}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role || 'Employee'}
                </p>
              </div>

              <UserProfileDropdown />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = activePath === item.href || activePath.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <DynamicNavigationIcon
                    icon={item.icon}
                    size="md"
                    active={isActive}
                    className="mr-3 flex-shrink-0"
                  />

                  <span className="flex-1 truncate">{item.name}</span>

                  <div className="flex items-center space-x-2">
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant={isActive ? 'primary' : 'secondary'}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}

                    {/* Role indicator for manager/admin items */}
                    {(item.managerOnly || item.adminOnly) && (
                      <span
                        className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0"
                        aria-label={`${item.adminOnly ? 'Admin' : 'Manager'} only`}
                      >
                        {item.adminOnly ? '👑' : '👤'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer with status and quick actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Quick Status */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold" aria-hidden="true">
                    ✓
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-800 dark:text-green-200 truncate">
                    Status: Active
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 truncate">
                    Clocked in since 9:00 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label="Clock out"
              >
                Clock Out
              </button>
              <button
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label="Start break"
              >
                Start Break
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}