"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/stats-cards";
import { TeamCards } from "@/components/team-cards";
import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, TrendingUp, BarChart3, Target } from "lucide-react";
import { USERS, CURRENT_USER_ID } from "@/constants/users";

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const currentUser = USERS.find(user => user.id === CURRENT_USER_ID);
  const isBoss = currentUser?.role === "boss";

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Implement logout logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      <div className="pt-16">
        <Dashboard isDarkMode={isDarkMode} />

        {/* Team Section with Toggle */}
        <div className="px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {isBoss ? "Team Overview" : "Team Members"}
                </h2>
                <p className="text-muted-foreground">
                  {isBoss
                    ? "Manage and monitor your team's time tracking"
                    : "View your team members' availability"
                  }
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant={showTeamView ? "default" : "outline"}
                  onClick={() => setShowTeamView(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team View
                </Button>
                <Button
                  variant={!showTeamView ? "default" : "outline"}
                  onClick={() => setShowTeamView(false)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats View
                </Button>
              </div>
            </div>

            {/* Team Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Active Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {USERS.filter(user => user.isClockedIn).length}/{USERS.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Team members currently working
                  </p>
                  <div className="mt-3 space-y-2">
                    {USERS.filter(user => user.isClockedIn).slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{user.firstName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {user.todayHours}h today
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Total Hours Today */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {USERS.reduce((sum, user) => sum + (user.todayHours || 0), 0).toFixed(1)}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all team members
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Daily Goal Progress</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">
                    Productivity score this week
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>On-time Arrival</span>
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Hours Completed</span>
                      <span className="font-medium text-blue-600">88%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Break Compliance</span>
                      <span className="font-medium text-yellow-600">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toggle between views */}
            {showTeamView ? (
              <div>
                <TeamCards isDarkMode={isDarkMode} />
              </div>
            ) : (
              <div>
                <StatsCards isDarkMode={isDarkMode} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}