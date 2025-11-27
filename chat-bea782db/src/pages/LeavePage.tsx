/**
 * Leave Management Page
 *
 * Main leave management page that integrates all leave components with role-based access.
 * Shows different views based on user role (employee vs manager).
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeaveDashboard } from '../components/leave/LeaveDashboard';
import { LeaveRequestsTable } from '../components/leave/LeaveRequestsTable';
import { ManagerApprovalInterface } from '../components/leave/ManagerApprovalInterface';
import { TabIndicator, TabList, TabPanel, Tabs } from '../components/ui/Tabs';
import { LeaveRequest, User } from '../../database-schema';
import { LeaveManager } from '../lib/leave/leaveManager';
import { isManagerOrAbove } from '../context/AuthContext';

type TabKey = 'dashboard' | 'my-requests' | 'team-requests' | 'approvals';

export function LeavePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isManager = user ? isManagerOrAbove(user.role) : false;

  useEffect(() => {
    if (!user || !isManager) return;

    const loadTeamMembers = async () => {
      try {
        // Mock team members - in a real app, this would come from an API
        const mockUsers: User[] = [
          {
            id: '1',
            employeeId: 'EMP001',
            firstName: 'Larina',
            lastName: 'Cruz',
            email: 'larina@company.com',
            passwordHash: 'password123',
            role: 'employee' as any,
            employmentStatus: 'freelance' as any,
            department: 'Operations',
            position: 'Operations Specialist',
            hireDate: new Date('2024-01-15'),
            managerId: user.id,
            directReports: [],
            preferredWorkingHours: {
              monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8,
              saturday: 0, sunday: 0,
            },
            canWorkFromHome: true,
            flexibleSchedule: true,
            timeZone: 'Asia/Manila',
            isActive: true,
            isFreelancer: true,
            hourlyRate: 350,
            paymentMethod: 'GCash',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
          {
            id: '3',
            employeeId: 'EMP003',
            firstName: 'Peej',
            lastName: 'Santos',
            email: 'peej@company.com',
            passwordHash: 'password123',
            role: 'manager' as any,
            employmentStatus: 'full_time' as any,
            department: 'IT',
            position: 'IT Manager',
            hireDate: new Date('2023-03-15'),
            managerId: user.id,
            directReports: [],
            preferredWorkingHours: {
              monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8,
              saturday: 4, sunday: 0,
            },
            canWorkFromHome: true,
            flexibleSchedule: true,
            timeZone: 'Asia/Manila',
            isActive: true,
            isFreelancer: false,
            createdAt: new Date('2023-03-15'),
            updatedAt: new Date('2023-03-15'),
          },
        ];

        setTeamMembers(mockUsers);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    loadTeamMembers();
  }, [user, isManager]);

  const handleApprovalComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    {
      key: 'dashboard' as TabKey,
      label: 'Dashboard',
      icon: '📊',
    },
    {
      key: 'my-requests' as TabKey,
      label: 'My Requests',
      icon: '📋',
    },
    ...(isManager ? [
      {
        key: 'team-requests' as TabKey,
        label: 'Team Requests',
        icon: '👥',
      },
      {
        key: 'approvals' as TabKey,
        label: 'Pending Approvals',
        icon: '✅',
      },
    ] : []),
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your leave requests and {isManager ? 'team leave approvals' : 'track your leave balance'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as TabKey)}>
          <div className="bg-white rounded-lg shadow mb-6">
            <TabList className="border-b border-gray-200">
              {tabs.map((tab) => (
                <TabIndicator
                  key={tab.key}
                  value={tab.key}
                  className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent focus:outline-none focus:text-gray-900 focus:border-blue-500 data-[selected]:text-blue-600 data-[selected]:border-blue-500"
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </TabIndicator>
              ))}
            </TabList>
          </div>

          {/* Tab Panels */}
          <div className="space-y-6">
            <TabPanel value="dashboard">
              <LeaveDashboard user={user} />
            </TabPanel>

            <TabPanel value="my-requests">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">My Leave Requests</h2>
                <LeaveRequestsTable
                  user={user}
                  isManager={false}
                  teamMembers={[]}
                />
              </div>
            </TabPanel>

            {isManager && (
              <TabPanel value="team-requests">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Leave Requests</h2>
                  <LeaveRequestsTable
                    user={user}
                    isManager={true}
                    teamMembers={teamMembers}
                  />
                </div>
              </TabPanel>
            )}

            {isManager && (
              <TabPanel value="approvals">
                <ManagerApprovalInterface
                  manager={user}
                  teamMembers={teamMembers}
                  onApprovalComplete={handleApprovalComplete}
                />
              </TabPanel>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}