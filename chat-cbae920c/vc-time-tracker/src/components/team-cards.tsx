"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Circle, MoreHorizontal } from "lucide-react";
import { USERS, CURRENT_USER_ID } from "@/constants/users";
import { useRouter } from "next/navigation";

interface TeamCardsProps {
  isDarkMode: boolean;
}

export function TeamCards({ isDarkMode }: TeamCardsProps) {
  const router = useRouter();
  const currentUser = USERS.find(user => user.id === CURRENT_USER_ID);
  const isBoss = currentUser?.role === "boss";

  const handleUserClick = (user: typeof USERS[0]) => {
    // Employees can't access other users' pages
    if (!isBoss && user.id !== CURRENT_USER_ID) {
      return;
    }

    // Navigate to user detail page (we'll create this later)
    console.log(`Navigate to user ${user.firstName}'s page`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {USERS.map((user) => {
        const isCurrentUser = user.id === CURRENT_USER_ID;
        const canClick = isBoss || isCurrentUser;

        return (
          <Card
            key={user.id}
            className={`
              relative overflow-hidden transition-all duration-200
              ${canClick ? 'hover:shadow-lg cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed opacity-75'}
              ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''}
            `}
            onClick={() => handleUserClick(user)}
          >
            {isCurrentUser && (
              <div className="absolute top-3 right-3">
                <Badge variant="default" className="text-xs">
                  You
                </Badge>
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                        {user.firstName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background ${
                      user.isClockedIn ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <div className="w-full h-full rounded-full animate-pulse opacity-75 bg-inherit"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.firstName}</h3>
                    <Badge
                      variant={user.role === "boss" ? "default" : "secondary"}
                      className="capitalize text-xs"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
                {isBoss && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Circle className={`h-3 w-3 fill-current ${
                    user.isClockedIn ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">
                    {user.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>

                {/* Time Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {user.todayHours || 0}h
                    </div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {user.weekHours || 0}h
                    </div>
                    <div className="text-xs text-muted-foreground">Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {user.monthHours || 0}h
                    </div>
                    <div className="text-xs text-muted-foreground">Month</div>
                  </div>
                </div>

                {/* Quick action for bosses */}
                {isBoss && !isCurrentUser && (
                  <div className="pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`View ${user.firstName}'s details`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                )}

                {/* Quick action for current user */}
                {isCurrentUser && (
                  <div className="pt-3 border-t border-border">
                    <Button
                      variant={user.isClockedIn ? "destructive" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Toggle clock status for ${user.firstName}`);
                      }}
                    >
                      {user.isClockedIn ? 'Clock Out' : 'Clock In'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}