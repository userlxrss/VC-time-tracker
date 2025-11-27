/**
 * Mobile Bottom Navigation Component
 *
 * Touch-friendly bottom navigation for mobile devices.
 * Features smooth animations, active states, and badge notifications.
 */

import { Link } from 'react-router-dom';
import { useNavigation } from './NavigationContext';
import { useMobileNavigationItems } from './NavigationItems';
import { DynamicNavigationIcon } from './icons/NavigationIcons';
import { Badge } from '../ui/Badge';

export function MobileBottomNav() {
  const { bottomNavVisible, activePath } = useNavigation();
  const navigationItems = useMobileNavigationItems();

  // Don't render if bottom navigation shouldn't be visible
  if (!bottomNavVisible) {
    return null;
  }

  // Limit to 5 items for optimal mobile UX
  const maxItems = 5;
  const displayItems = navigationItems.slice(0, maxItems);

  return (
    <>
      {/* Spacer for safe area on iOS devices */}
      <div className="h-safe-or-20" />

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {displayItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[44px] max-w-[72px] h-12 mx-1
                  rounded-lg transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                title={item.name}
              >
                {/* Icon with badge */}
                <div className="relative">
                  <DynamicNavigationIcon
                    icon={item.icon}
                    size="lg"
                    active={isActive}
                  />

                  {/* Badge for notifications */}
                  {item.badge && item.badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs font-medium mt-1 text-center leading-tight
                    transition-all duration-200
                    ${isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {item.name}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <span
                    className="absolute top-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe area padding for iOS notch */}
        <div className="h-safe-or-0 pb-safe-or-2" />
      </nav>
    </>
  );
}