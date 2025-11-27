/**
 * DashboardPage Component
 *
 * Role-based dashboard that shows appropriate interface based on user role.
 * Employees see the comprehensive real-time dashboard, while managers/admins
 * see management-focused interfaces.
 */

import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { UserRole } from '../../database-schema';

// Dashboard Components
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import { ManagerDashboard } from '../components/dashboard/ManagerDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.EMPLOYEE:
      case UserRole.FREELANCER:
        return <EmployeeDashboard />;

      case UserRole.MANAGER:
        return <ManagerDashboard />;

      case UserRole.ADMIN:
        return <ManagerDashboard />; // Admins see manager dashboard for now

      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Role Not Recognized</h2>
              <p className="text-gray-600">Your role ({user.role}) doesn't have a dashboard configuration.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {renderDashboard()}
    </div>
  );
}