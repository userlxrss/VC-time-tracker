/**
 * Premium User Cards Demo
 * Showcase page for the premium user card components
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumUserGrid } from './premium-user-grid';
import { PremiumUserCard } from './premium-user-card';
import { UserProfile, HARDCODED_USERS, DEFAULT_CURRENT_USER_ID } from '@/src/types/user';
import { TimeEntry, TimeEntryStatus, createEmptyTimeEntry } from '@/src/types/timeEntry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Settings, Eye, PlayCircle, Coffee, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DemoSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const DemoSection: React.FC<DemoSectionProps> = ({ title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
    {children}
  </motion.div>
);

export const PremiumUserCardsDemo: React.FC = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile>(HARDCODED_USERS[2]); // Larina

  // Mock time entry for individual card demo
  const mockTimeEntry: TimeEntry = {
    id: 'time-demo-2025-01-11',
    userId: selectedUser.id,
    date: '2025-01-11',
    clockIn: '09:15',
    lunchBreak: {},
    shortBreaks: [],
    status: TimeEntryStatus.CLOCKED_IN,
    lastModified: new Date().toISOString(),
    modifiedBy: selectedUser.id
  };

  // Event handlers
  const handleClockIn = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.success(`${user?.fullName} clocked in!`);
  };

  const handleClockOut = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.success(`${user?.fullName} clocked out!`);
  };

  const handleStartLunch = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.success(`${user?.fullName} started lunch!`);
  };

  const handleEndLunch = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.success(`${user?.fullName} ended lunch!`);
  };

  const handleStartBreak = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.success(`${user?.fullName} started a break!`);
  };

  const handleEndBreak = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.success(`${user?.fullName} ended their break!`);
  };

  const handleViewDetails = (userId: string) => {
    const user = HARDCODED_USERS.find(u => u.id === userId);
    toast.info(`Viewing details for ${user?.fullName}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">
          Premium User Cards Demo
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Enterprise-grade user card components with advanced functionality, real-time updates, and premium design
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Real-time Updates</Badge>
          <Badge variant="secondary">Responsive Grid</Badge>
          <Badge variant="secondary">Glassmorphism</Badge>
          <Badge variant="secondary">Premium Animations</Badge>
          <Badge variant="secondary">Dark Mode</Badge>
          <Badge variant="secondary">Status Tracking</Badge>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="grid" className="w-full max-w-7xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Grid Layout</TabsTrigger>
          <TabsTrigger value="individual">Individual Cards</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <DemoSection
            title="Responsive Grid Layout"
            description="Auto-adaptive grid with 3 columns on desktop, 2 on tablet, 1 on mobile"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="grid-toggle">Show Grid</Label>
                <p className="text-sm text-muted-foreground">Toggle to show/hide the premium grid</p>
              </div>
              <Switch id="grid-toggle" checked={showGrid} onCheckedChange={setShowGrid} />
            </div>

            {showGrid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <PremiumUserGrid />
              </motion.div>
            )}
          </DemoSection>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <DemoSection
            title="Individual Card Showcase"
            description="Each user card with different status states and interactions"
          >
            {/* User selector */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="user-select">Select User:</Label>
              <select
                id="user-select"
                value={selectedUser.id}
                onChange={(e) => {
                  const user = HARDCODED_USERS.find(u => u.id === e.target.value);
                  if (user) setSelectedUser(user);
                }}
                className="px-3 py-2 rounded-md border border-input bg-background"
              >
                {HARDCODED_USERS.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.role})
                  </option>
                ))}
              </select>
              <Badge variant={selectedUser.id === DEFAULT_CURRENT_USER_ID ? "default" : "secondary"}>
                {selectedUser.id === DEFAULT_CURRENT_USER_ID ? "Current User" : "Other User"}
              </Badge>
            </div>

            {/* Single card display */}
            <div className="max-w-md mx-auto">
              <PremiumUserCard
                user={selectedUser}
                timeEntry={mockTimeEntry}
                isCurrentUser={selectedUser.id === DEFAULT_CURRENT_USER_ID}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                onStartLunch={handleStartLunch}
                onEndLunch={handleEndLunch}
                onStartBreak={handleStartBreak}
                onEndBreak={handleEndBreak}
                onViewDetails={handleViewDetails}
              />
            </div>
          </DemoSection>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <DemoSection
            title="Premium Features"
            description="Enterprise-grade features and capabilities"
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Visual Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Visual Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">Glassmorphism Effects</p>
                    <p className="text-sm text-muted-foreground">Subtle blur and transparency effects</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Premium Shadows</p>
                    <p className="text-sm text-muted-foreground">Multi-layer shadow system</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Smooth Animations</p>
                    <p className="text-sm text-muted-foreground">Framer Motion powered transitions</p>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    Interactive Elements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">Dynamic Buttons</p>
                    <p className="text-sm text-muted-foreground">Context-aware action buttons</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Hover Effects</p>
                    <p className="text-sm text-muted-foreground">Scale and translate animations</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Status Indicators</p>
                    <p className="text-sm text-muted-foreground">Live status with pulse animations</p>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Technical Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">TypeScript</p>
                    <p className="text-sm text-muted-foreground">Full type safety</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Responsive Design</p>
                    <p className="text-sm text-muted-foreground">Mobile-first approach</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Theme-aware components</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Status Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-sm text-muted-foreground">Live status synchronization</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Multiple States</p>
                    <p className="text-sm text-muted-foreground">Clock In/Out, Lunch, Break</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Time Calculations</p>
                    <p className="text-sm text-muted-foreground">Automatic duration tracking</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">Current User Highlight</p>
                    <p className="text-sm text-muted-foreground">Special visual emphasis</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Role-based Styling</p>
                    <p className="text-sm text-muted-foreground">Different colors for roles</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Intuitive Actions</p>
                    <p className="text-sm text-muted-foreground">Clear call-to-action buttons</p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium">Optimized Renders</p>
                    <p className="text-sm text-muted-foreground">Efficient state management</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Lazy Loading</p>
                    <p className="text-sm text-muted-foreground">Component code splitting</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Memory Efficient</p>
                    <p className="text-sm text-muted-foreground">Minimal re-renders</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DemoSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumUserCardsDemo;