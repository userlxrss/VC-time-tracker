/**
 * Desktop Sidebar Component
 *
 * Collapsible sidebar navigation for desktop and tablet views.
 * Features smooth transitions, role-based menu items, and active state highlighting.
 */

import { Link } from 'react-router-dom';
import { useNavigation } from './NavigationContext';
import { useNavigationItems } from './NavigationItems';
import { DynamicNavigationIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/NavigationIcons';
import { Badge } from '../ui/Badge';

export function DesktopSidebar() {
  const {
    sidebarCollapsed,
    sidebarOpen,
    setSidebarCollapsed,
    activePath,
    isDesktop,
    isTablet,
  } = useNavigation();

  const navigationItems = useNavigationItems();

  // Don't render on mobile
  if (!isDesktop && !isTablet) {
    return null;
  }

  return (
    <>
      {/* Sidebar backdrop for tablet when sidebar is open */}
      {isTablet && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 z-30
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${isTablet && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
          ${isDesktop ? 'translate-x-0' : ''}
          flex flex-col
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Collapse Toggle Button */}
        <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon size="md" />
            ) : (
              <ChevronLeftIcon size="md" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                  ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
                `}
                aria-current={isActive ? 'page' : undefined}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <div className="flex items-center min-w-0">
                  <DynamicNavigationIcon
                    icon={item.icon}
                    size="md"
                    active={isActive}
                    className={sidebarCollapsed ? '' : 'mr-3'}
                  />

                  {/* Show text when not collapsed */}
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {/* Show badges and indicators when not collapsed */}
                {!sidebarCollapsed && (
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
                        className="text-xs text-gray-500 dark:text-gray-400"
                        aria-label={`${item.adminOnly ? 'Admin' : 'Manager'} only`}
                      >
                        {item.adminOnly ? '👑' : '👤'}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Status Section (when expanded) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold" aria-hidden="true">
                    ✓
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    Status: Active
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Clocked in
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Status (when collapsed) */}
        {sidebarCollapsed && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <div
                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors"
                title="Status: Active - Clocked in"
              >
                <span className="text-white text-sm font-bold" aria-hidden="true">
                  ✓
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content margin for desktop */}
      {isDesktop && (
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        />
      )}
    </>
  );
}