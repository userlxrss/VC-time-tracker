/**
 * Enhanced Dashboard Page with Complete VC Time Tracker Integration
 * Production-ready with all components, real-time updates, and premium UX
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Users, TrendingUp, Calendar, Activity, ArrowRight } from 'lucide-react';

import { PremiumUserGridEnhanced } from '@/components/dashboard/premium-user-grid-enhanced';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Dashboard - VC Time Tracker',
  description: 'Real-time team time tracking dashboard with enterprise features',
  keywords: ['dashboard', 'time tracking', 'team management', 'VC'],
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Time Tracker Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time team productivity monitoring
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="hidden sm:flex gap-1 items-center animate-pulse"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Live
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/vc-dashboard">
                  Premium Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button className="gap-2">
                <Calendar className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Today's Overview</h2>
              <p className="text-muted-foreground">
                Key metrics and real-time statistics
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Activity className="w-3 h-3" />
              Auto-updating
            </Badge>
          </div>

          <QuickStats />
        </section>

        {/* Team Performance Cards */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Team Time Cards</h2>
              <p className="text-muted-foreground">
                Real-time status and time tracking for all team members
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600 gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Active Now
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-600">
                <Users className="w-3 h-3 mr-1" />
                3 Total
              </Badge>
            </div>
          </div>

          <PremiumUserGridEnhanced
            enableRealTime={true}
            showOnlyActive={false}
            className="mt-0"
          />
        </section>

        {/* Quick Stats Summary */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">3</div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                2 active now
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                Hours Today
              </CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">24.5</div>
              <p className="text-xs text-green-700 dark:text-green-300">
                +2.1 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">112.5</div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                5 days tracked
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Efficiency
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">94%</div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                +5% from last week
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Features Section */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                Real-time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Automatic time tracking with live updates across all devices
              </p>
              <Badge variant="secondary">Active</Badge>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor team productivity and coordinate breaks efficiently
              </p>
              <Badge variant="secondary">3 Users</Badge>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                Analytics & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive insights and exportable reports
              </p>
              <Badge variant="secondary">Premium</Badge>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <p>• Last updated automatically •</p>
            <p>• Data stored locally •</p>
            <p>• Premium Dashboard v2.0 •</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/premium-cards">
                View Demo Cards
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/vc-dashboard">
                Try Premium Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}