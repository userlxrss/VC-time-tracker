'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  Calendar,
  Users,
  TrendingUp,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target
} from 'lucide-react';
import { formatHours, formatDate } from '@/lib/utils';

// Mock data for demonstration
const mockTimeCards = [
  {
    id: '1',
    userId: 3,
    userName: 'Larina Villanueva',
    weekStartDate: '2024-11-04',
    totalHours: 42.5,
    status: 'submitted' as const,
    submittedAt: '2024-11-08',
    approvedAt: null,
    projects: ['Portfolio Analysis', 'Due Diligence', 'Partner Meeting']
  },
  {
    id: '2',
    userId: 1,
    userName: 'Maria Villanueva',
    weekStartDate: '2024-11-04',
    totalHours: 38.0,
    status: 'approved' as const,
    submittedAt: '2024-11-07',
    approvedAt: '2024-11-08',
    approvedBy: 2,
    projects: ['Board Meeting', 'Strategy Session', 'Investment Review']
  },
  {
    id: '3',
    userId: 2,
    userName: 'Carlos Villanueva',
    weekStartDate: '2024-11-04',
    totalHours: 45.0,
    status: 'draft' as const,
    submittedAt: null,
    approvedAt: null,
    projects: ['Portfolio Management', 'Client Calls', 'Market Research']
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-vc-success-50 text-vc-success-700 border-vc-success-200';
    case 'submitted':
      return 'bg-vc-warning-50 text-vc-warning-700 border-vc-warning-200';
    case 'draft':
      return 'bg-vc-primary-50 text-vc-primary-700 border-vc-primary-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'submitted':
      return <AlertCircle className="h-4 w-4" />;
    case 'draft':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function DashboardPage() {
  const { user } = useAuth();

  const userInitials = user?.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || 'U';

  const canEdit = true;
  const canApprove = true;

  // Show all cards for demo purposes
  const displayCards = mockTimeCards;

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-vc-primary-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-vc-primary-600">
                Here's your time tracking overview for this week
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-vc-primary-600 to-vc-primary-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-vc-primary-600">This Week</p>
                  <p className="text-2xl font-bold text-vc-primary-900">
                    {formatHours(displayCards.reduce((sum, card) => sum + card.totalHours, 0))}
                  </p>
                </div>
                <div className="bg-vc-primary-100 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-vc-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-vc-primary-600">Active Projects</p>
                  <p className="text-2xl font-bold text-vc-primary-900">12</p>
                </div>
                <div className="bg-vc-accent-100 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-vc-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-vc-primary-600">Submitted</p>
                  <p className="text-2xl font-bold text-vc-primary-900">
                    {displayCards.filter(card => card.status === 'submitted').length}
                  </p>
                </div>
                <div className="bg-vc-warning-100 p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-vc-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium-md hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-vc-primary-600">Approved</p>
                  <p className="text-2xl font-bold text-vc-primary-900">
                    {displayCards.filter(card => card.status === 'approved').length}
                  </p>
                </div>
                <div className="bg-vc-success-100 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-vc-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Cards Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-vc-primary-900">Time Cards</h2>
          {canEdit && (
            <Button className="shadow-premium-md hover:shadow-premium-lg">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Time Card
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayCards.map((card) => (
            <Card key={card.id} className="shadow-premium-md hover:shadow-premium-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {card.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{card.userName}</CardTitle>
                      <CardDescription>
                        Week of {formatDate(new Date(card.weekStartDate))}
                      </CardDescription>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(card.status)}`}>
                    {getStatusIcon(card.status)}
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-vc-primary-600">Total Hours</span>
                    <span className="text-lg font-semibold text-vc-primary-900">
                      {formatHours(card.totalHours)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-vc-primary-700 mb-2">Projects</p>
                    <div className="flex flex-wrap gap-2">
                      {card.projects.map((project, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-vc-primary-50 text-vc-primary-700 text-xs rounded-md border border-vc-primary-100"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>

                  {card.submittedAt && (
                    <div className="text-xs text-vc-primary-500">
                      Submitted: {formatDate(new Date(card.submittedAt))}
                    </div>
                  )}

                  {card.approvedAt && (
                    <div className="text-xs text-vc-success-600">
                      Approved: {formatDate(new Date(card.approvedAt))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {canEdit && (
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                    )}
                    {card.status === 'draft' && canEdit && (
                      <Button size="sm" className="flex-1">
                        Submit
                      </Button>
                    )}
                    {card.status === 'submitted' && canApprove && (
                      <Button variant="success" size="sm" className="flex-1">
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayCards.length === 0 && (
          <Card className="shadow-premium-md">
            <CardContent className="p-12 text-center">
              <div className="bg-vc-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-vc-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-vc-primary-900 mb-2">
                No time cards found
              </h3>
              <p className="text-vc-primary-600 mb-6">
                Create your first time card to start tracking your hours
              </p>
              {canEdit && (
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Time Card
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
  );
}