"use client"

import * as React from "react"
import { PremiumNavbar } from "@/components/premium/navbar"
import { PremiumUserCard } from "@/components/premium/user-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusIndicator } from "@/components/ui/status-indicator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockUser = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@vcfirm.com',
  avatar: '/avatars/sarah.jpg',
  role: 'Partner',
  status: 'clocked_in' as const,
  todayHours: 6.5,
  weekHours: 32.5,
  monthlyHours: 140.5,
  department: 'Investment Team',
  joinedAt: 'Jan 2020',
  lastActive: '2 min ago'
}

export default function ComponentShowcase() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-black dark:to-slate-900">
      <PremiumNavbar
        userName="Sarah Johnson"
        userEmail="sarah.johnson@vcfirm.com"
        userAvatar="/avatars/sarah.jpg"
        notificationCount={3}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <main className="pt-20 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Premium UI Components
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade React components built with shadcn/ui, featuring perfect dark mode support, smooth animations, and premium design quality.
            </p>
          </div>

          {/* Buttons Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium Buttons</h2>
              <p className="text-muted-foreground">Elegant buttons with hover effects and loading states</p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Default</p>
                  <Button className="w-full">Button</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Destructive</p>
                  <Button variant="destructive" className="w-full">Delete</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Outline</p>
                  <Button variant="outline" className="w-full">Outline</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Secondary</p>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Ghost</p>
                  <Button variant="ghost" className="w-full">Ghost</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Glass</p>
                  <Button variant="glass" className="w-full">Glass</Button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Small</p>
                  <Button size="sm" className="w-full">Small</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Default</p>
                  <Button size="default" className="w-full">Default</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Large</p>
                  <Button size="lg" className="w-full">Large</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Loading</p>
                  <Button loading className="w-full">Loading</Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Badges Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium Badges</h2>
              <p className="text-muted-foreground">Stylish badges with gradient backgrounds and status indicators</p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Default Variants</p>
                  <div className="space-y-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Sizes</p>
                  <div className="space-y-2">
                    <Badge size="sm">Small</Badge>
                    <Badge size="default">Default</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Special Variants</p>
                  <div className="space-y-2">
                    <Badge variant="status">Status</Badge>
                    <Badge variant="glass">Glass</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">With Icons</p>
                  <div className="space-y-2">
                    <Badge>🟢 Active</Badge>
                    <Badge variant="warning">⚠️ Warning</Badge>
                    <Badge variant="success">✓ Success</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Status Indicators Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Status Indicators</h2>
              <p className="text-muted-foreground">Animated status indicators with pulse effects</p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium">Work Status</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="clocked_in" />
                      <span className="text-sm">Clocked In</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="clocked_out" />
                      <span className="text-sm">Clocked Out</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="on_break" />
                      <span className="text-sm">On Break</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">General Status</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="online" />
                      <span className="text-sm">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="offline" />
                      <span className="text-sm">Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="busy" />
                      <span className="text-sm">Busy</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">With Labels</p>
                  <div className="space-y-3">
                    <StatusIndicator status="clocked_in" showLabel />
                    <StatusIndicator status="clocked_out" showLabel />
                    <StatusIndicator status="on_break" showLabel label="Break Time" />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">Sizes</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="online" size="sm" />
                      <span className="text-sm">Small</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="online" size="default" />
                      <span className="text-sm">Default</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status="online" size="lg" />
                      <span className="text-sm">Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* User Cards Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium User Cards</h2>
              <p className="text-muted-foreground">Feature-rich user cards with stats and actions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Full Card View</h3>
                <PremiumUserCard
                  user={mockUser}
                  onClockIn={(id) => console.log('Clock in:', id)}
                  onClockOut={(id) => console.log('Clock out:', id)}
                  onViewProfile={(id) => console.log('View profile:', id)}
                  onSendMessage={(id) => console.log('Send message:', id)}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Compact Card View</h3>
                <PremiumUserCard
                  user={mockUser}
                  compact
                  onClockIn={(id) => console.log('Clock in:', id)}
                  onClockOut={(id) => console.log('Clock out:', id)}
                  onViewProfile={(id) => console.log('View profile:', id)}
                  onSendMessage={(id) => console.log('Send message:', id)}
                />
              </div>
            </div>
          </section>

          {/* Avatars Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium Avatars</h2>
              <p className="text-muted-foreground">Stylized avatars with gradient fallbacks</p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium">With Images</p>
                  <div className="space-y-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b342c3c6?w=64&h=64&fit=crop&crop=face" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">Fallback Only</p>
                  <div className="space-y-3">
                    <Avatar>
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>CD</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">Status Combined</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b342c3c6?w=64&h=64&fit=crop&crop=face" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <StatusIndicator status="online" size="sm" />
                      </div>
                    </div>
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>EK</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <StatusIndicator status="busy" size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">Sizes</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">SM</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">Small</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>MD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Medium</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">LG</AvatarFallback>
                      </Avatar>
                      <span className="text-base">Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Dropdown Menus Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium Dropdown Menus</h2>
              <p className="text-muted-foreground">Glassmorphism dropdowns with smooth animations</p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium">User Menu</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">Open Menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Help</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">Actions Menu</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>Copy</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">Status Menu</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">Change Status</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>🟢 Available</DropdownMenuItem>
                      <DropdownMenuItem>🟡 Away</DropdownMenuItem>
                      <DropdownMenuItem>🔴 Busy</DropdownMenuItem>
                      <DropdownMenuItem>⚫ Invisible</DropdownMenuItem>
                </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          </section>

          {/* Cards Section */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium Cards</h2>
              <p className="text-muted-foreground">Elevated cards with hover effects and shadows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>
                    A basic card with title and description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is a simple card component with hover effects and smooth transitions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>
                    Card with custom content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Active Feature</span>
                    </div>
                    <Button size="sm" className="w-full">Learn More</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stats Card</CardTitle>
                  <CardDescription>
                    Card with statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold">2,847</div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <div className="mt-2 text-green-600 text-sm">+12% from last month</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}