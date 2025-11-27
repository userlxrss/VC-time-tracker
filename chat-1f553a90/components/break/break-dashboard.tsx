'use client';

import React, { useState } from 'react';
import { Clock, TrendingUp, Calendar, Settings, BarChart3, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useBreak } from '@/contexts/BreakContext';
import { BreakTimer } from './break-timer';
import { BreakControls } from './break-controls';
import { BreakHistory } from './break-history';
import { formatBreakDuration, calculateBreakEfficiency } from '@/lib/break-utils';

interface BreakDashboardProps {
  compact?: boolean;
  showHistory?: boolean;
  className?: string;
}

export function BreakDashboard({
  compact = false,
  showHistory = true,
  className
}: BreakDashboardProps) {
  // Mock user for demo purposes
  const mockUser = { id: 'demo-user-id', name: 'Demo User' };
  const {
    stats,
    isOnBreak,
    currentActiveBreak,
    getBreaksHistory,
    getTodaysBreaks
  } = useBreak();

  const [activeTab, setActiveTab] = useState('overview');

  // Calculate efficiency stats (assuming 8-hour workday)
  const workDayMinutes = 8 * 60;
  const breakMinutes = stats.totalBreakTimeToday;
  const efficiency = calculateBreakEfficiency(workDayMinutes, breakMinutes);
  const weekBreaks = getBreaksHistory(7);
  const weekTotalMinutes = weekBreaks.reduce((sum, b) => sum + (b.duration || 0), 0);

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        {isOnBreak && <BreakTimer compact />}
        <BreakControls compact />

        {showHistory && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Breaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-xl font-bold">{formatBreakDuration(breakMinutes)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Break Count</p>
                  <p className="text-xl font-bold">{stats.totalBreaksToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Break Timer */}
      {isOnBreak && currentActiveBreak && (
        <BreakTimer />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Break Controls
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Breaks</p>
                    <p className="text-2xl font-bold">{stats.totalBreaksToday}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="text-2xl font-bold">{formatBreakDuration(breakMinutes)}</p>
                  </div>
                  <Timer className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">{formatBreakDuration(weekTotalMinutes)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                    <p className="text-2xl font-bold">{efficiency}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Break Pattern Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Break Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lunch Break</span>
                    <Badge variant={stats.lunchBreakTaken ? 'default' : 'secondary'}>
                      {stats.lunchBreakTaken ? '✓ Taken' : 'Not taken'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Short Breaks</span>
                    <Badge variant="outline">
                      {stats.shortBreaksToday} taken
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Break Length</span>
                    <Badge variant="outline">
                      {stats.totalBreaksToday > 0
                        ? formatBreakDuration(Math.round(breakMinutes / stats.totalBreaksToday))
                        : 'N/A'
                      }
                    </Badge>
                  </div>
                </div>

                {/* Break Recommendations */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Recommendations 💡
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {!stats.lunchBreakTaken && (
                      <li>• Don't forget to take your lunch break today</li>
                    )}
                    {stats.shortBreaksToday < 2 && breakMinutes < 30 && (
                      <li>• Consider taking more short breaks to maintain productivity</li>
                    )}
                    {efficiency < 85 && (
                      <li>• Your break ratio is optimal for maintaining focus</li>
                    )}
                    {stats.shortBreaksToday > 6 && (
                      <li>• You might be taking too many breaks today</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Break Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTodaysBreaks().slice(-5).reverse().map((breakItem) => (
                    <div key={breakItem.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {breakItem.type === 'lunch' ? '🍽️' : '☕'}
                        </span>
                        <div>
                          <p className="font-medium">
                            {breakItem.type === 'lunch' ? 'Lunch Break' : 'Short Break'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(breakItem.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatBreakDuration(breakItem.duration || 0)}</p>
                        {breakItem.isActive && (
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {getTodaysBreaks().length === 0 && (
                    <div className="text-center py-8">
                      <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No breaks taken today</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start taking breaks to see your activity here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls">
          <BreakControls />
        </TabsContent>

        <TabsContent value="history">
          <BreakHistory days={30} showExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}