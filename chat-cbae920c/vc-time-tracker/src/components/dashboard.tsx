"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, TrendingUp, Calendar, Activity } from "lucide-react";
import { USERS, CURRENT_USER_ID } from "@/constants/users";

interface DashboardProps {
  isDarkMode: boolean;
}

export function Dashboard({ isDarkMode }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentUser = USERS.find(user => user.id === CURRENT_USER_ID);
  const isBoss = currentUser?.role === "boss";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Calculate some metrics
  const activeUsers = USERS.filter(user => user.isClockedIn).length;
  const totalHoursToday = USERS.reduce((sum, user) => sum + (user.todayHours || 0), 0);
  const avgProductivity = totalHoursToday / USERS.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <div className="px-4 lg:px-8 pt-20 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser?.firstName}!
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-muted-foreground">
              <div className="space-y-1">
                <p className="text-lg">{formatDate(currentTime)}</p>
                <p className="text-2xl font-mono font-semibold text-foreground">
                  {formatTime(currentTime)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                <Badge variant={currentUser?.isClockedIn ? "default" : "secondary"} className="text-sm px-3 py-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    currentUser?.isClockedIn ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  {currentUser?.isClockedIn ? 'Currently Active' : 'On Break'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Progress */}
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentUser?.todayHours || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  {isBoss ? 'Your hours today' : 'Hours worked today'}
                </p>
                <div className="mt-3 w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((currentUser?.todayHours || 0) / 8) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* This Week */}
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentUser?.weekHours || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  {isBoss ? 'Your weekly total' : 'Hours this week'}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  On track for weekly goal
                </p>
              </CardContent>
            </Card>

            {/* Team Status (Boss only) */}
            {isBoss && (
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Status</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeUsers}/{USERS.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                  <div className="flex -space-x-2 mt-3">
                    {USERS.filter(user => user.isClockedIn).slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                        title={user.firstName}
                      >
                        <span className="text-xs font-medium text-primary">
                          {user.firstName[0].toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {activeUsers > 5 && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">
                          +{activeUsers - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Productivity Score */}
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isBoss ? 'Team Productivity' : 'Performance'}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isBoss ? `${Math.round(avgProductivity * 10)}%` : 'Good'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isBoss ? 'Average team output' : 'Performance rating'}
                </p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">
                    {isBoss ? 'Above average' : 'Improving'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quick Time Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1"
                    variant={currentUser?.isClockedIn ? "destructive" : "default"}
                    onClick={() => console.log('Toggle clock status')}
                  >
                    {currentUser?.isClockedIn ? 'Clock Out' : 'Clock In'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => console.log('Start break')}
                  >
                    Start Break
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  View Time Logs
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {USERS.filter(user => user.isClockedIn).slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.firstName[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.firstName}</p>
                          <p className="text-xs text-muted-foreground">
                            Clocked in 2h ago
                          </p>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}