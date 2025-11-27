"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, TrendingUp, Calendar } from "lucide-react";
import { USERS, CURRENT_USER_ID } from "@/constants/users";

interface StatsCardsProps {
  isDarkMode: boolean;
}

export function StatsCards({ isDarkMode }: StatsCardsProps) {
  const currentUser = USERS.find(user => user.id === CURRENT_USER_ID);
  const isBoss = currentUser?.role === "boss";

  // Calculate stats
  const totalUsers = USERS.length;
  const clockedInUsers = USERS.filter(user => user.isClockedIn).length;
  const totalHoursToday = USERS.reduce((sum, user) => sum + (user.todayHours || 0), 0);
  const avgHoursPerUser = totalHoursToday / totalUsers;

  const stats = isBoss
    ? [
        {
          title: "Total Employees",
          value: totalUsers,
          subtitle: "Active team members",
          icon: Users,
          trend: "+2 this month",
          trendUp: true,
        },
        {
          title: "Clocked In Now",
          value: clockedInUsers,
          subtitle: `${totalUsers - clockedInUsers} on break`,
          icon: Clock,
          trend: "+1 from yesterday",
          trendUp: true,
        },
        {
          title: "Total Hours Today",
          value: totalHoursToday.toFixed(1),
          subtitle: "Across all employees",
          icon: TrendingUp,
          trend: "+5.2h from yesterday",
          trendUp: true,
        },
        {
          title: "Avg Hours/Employee",
          value: avgHoursPerUser.toFixed(1),
          subtitle: "Daily average",
          icon: Calendar,
          trend: "+0.3h from yesterday",
          trendUp: true,
        },
      ]
    : [
        {
          title: "Today",
          value: `${currentUser?.todayHours || 0}h`,
          subtitle: "Hours worked",
          icon: Clock,
          trend: "+0.5h from yesterday",
          trendUp: true,
        },
        {
          title: "This Week",
          value: `${currentUser?.weekHours || 0}h`,
          subtitle: "Total this week",
          icon: Calendar,
          trend: "On track",
          trendUp: true,
        },
        {
          title: "This Month",
          value: `${currentUser?.monthHours || 0}h`,
          subtitle: "Monthly total",
          icon: TrendingUp,
          trend: "+12h from last month",
          trendUp: true,
        },
        {
          title: "Status",
          value: currentUser?.isClockedIn ? "Active" : "Break",
          subtitle: currentUser?.isClockedIn ? "Currently working" : "On break",
          icon: Users,
          trend: "",
          trendUp: true,
        },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              {stat.trend && (
                <Badge
                  variant={stat.trendUp ? "default" : "destructive"}
                  className="text-xs mt-2"
                >
                  {stat.trend}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}