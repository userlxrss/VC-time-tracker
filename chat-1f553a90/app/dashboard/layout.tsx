'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Building2, LogOut, User, Settings, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data for demo purposes
  const mockUser = {
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'user',
    profilePhoto: null
  };

  const userInitials = mockUser.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-vc-primary-50 via-white to-vc-accent-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-vc-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-vc-primary-600 to-vc-primary-700 p-2 rounded-xl shadow-premium-md">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-vc-primary-900">VC Time Tracker</h1>
                <p className="text-xs text-vc-primary-600">Villanueva Capital</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-vc-primary-900">{mockUser.name}</p>
                <p className="text-xs text-vc-primary-600 capitalize">{mockUser.role}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={mockUser.profilePhoto} alt={mockUser.name} />
                      <AvatarFallback className="bg-gradient-to-r from-vc-primary-600 to-vc-primary-700 text-white font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-vc-primary-900">{mockUser.name}</p>
                      <p className="text-xs text-vc-primary-600">{mockUser.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {mockUser.role === 'boss' && (
                    <DropdownMenuItem className="flex items-center gap-2" asChild>
                      <Link href="/dashboard/admin">
                        <Clock className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    onClick={() => console.log('Demo mode - no logout')}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}