"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Sun, LogOut, Settings } from "lucide-react";
import { USERS, CURRENT_USER_ID } from "@/constants/users";

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

export function Navbar({ isDarkMode, toggleDarkMode, onLogout }: NavbarProps) {
  const currentUser = USERS.find(user => user.id === CURRENT_USER_ID);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 px-4 lg:px-8">
      <div className="h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VC</span>
            </div>
            <span className="font-semibold text-lg">TimeTracker Pro</span>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Enterprise
          </Badge>
        </div>

        {/* Center - Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="font-medium">
            Dashboard
          </Button>
          {currentUser?.role === "boss" && (
            <>
              <Button variant="ghost" className="font-medium">
                Team
              </Button>
              <Button variant="ghost" className="font-medium">
                Reports
              </Button>
              <Button variant="ghost" className="font-medium">
                Analytics
              </Button>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 h-10 px-3"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser?.firstName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{currentUser?.firstName}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {currentUser?.role}
                </div>
              </div>
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 text-destructive hover:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}