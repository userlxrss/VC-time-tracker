/**
 * RoleBasedRoute Component
 *
 * Renders different components based on the user's role.
 * Useful for showing different dashboards or interfaces to different user types.
 */

import { ReactNode } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';

interface RoleBasedRouteProps {
  employeeComponent?: ReactNode;
  freelancerComponent?: ReactNode;
  managerComponent?: ReactNode;
  adminComponent?: ReactNode;
  fallbackComponent?: ReactNode;
}

export function RoleBasedRoute({
  employeeComponent,
  freelancerComponent,
  managerComponent,
  adminComponent,
  fallbackComponent,
}: RoleBasedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallbackComponent}</>;
  }

  switch (user.role) {
    case UserRole.EMPLOYEE:
      return <>{employeeComponent || fallbackComponent}</>;
    case UserRole.FREELANCER:
      return <>{freelancerComponent || employeeComponent || fallbackComponent}</>;
    case UserRole.MANAGER:
      return <>{managerComponent || fallbackComponent}</>;
    case UserRole.ADMIN:
      return <>{adminComponent || managerComponent || fallbackComponent}</>;
    default:
      return <>{fallbackComponent}</>;
  }
}