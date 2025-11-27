"use client"

import * as React from "react"
import { Bell, Menu, X, Search, Settings, Zap } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface NavbarProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  notificationCount?: number
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function PremiumNavbar({
  userName = "Sarah Johnson",
  userEmail = "sarah.johnson@vcfirm.com",
  userAvatar,
  notificationCount = 3,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-premium border-b border-border/50 shadow-premium-sm">
      <div className="h-full px-4 lg:px-8">
        <div className="flex h-full items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-vc-primary-500 to-vc-primary-700 flex items-center justify-center shadow-premium-md group-hover:shadow-premium-lg transition-all duration-300 group-hover:scale-[1.05]">
                <span className="text-white font-bold text-lg">VC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground group-hover:text-vc-primary-600 dark:group-hover:text-vc-primary-400 transition-colors duration-300">
                  TimeTracker
                </h1>
                <p className="text-xs text-muted-foreground">Smart Reminders</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300"
            >
              Dashboard
            </Link>
            <Link
              href="/team"
              className="text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300"
            >
              Team
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300"
            >
              <Zap className="h-3.5 w-3.5" />
              Demo
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300"
            >
              Analytics
            </Link>
            <Link
              href="/reports"
              className="text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300"
            >
              Reports
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button (Desktop) */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-vc-primary-500 to-vc-primary-700 text-white">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMobileMenuToggle}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-premium-lg">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/dashboard"
                className="block text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300 py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/team"
                className="block text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300 py-2"
              >
                Team
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300 py-2"
              >
                <Zap className="h-3.5 w-3.5" />
                Demo
              </Link>
              <Link
                href="/analytics"
                className="block text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300 py-2"
              >
                Analytics
              </Link>
              <Link
                href="/reports"
                className="block text-sm font-medium text-foreground hover:text-vc-primary-600 dark:hover:text-vc-primary-400 transition-colors duration-300 py-2"
              >
                Reports
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}