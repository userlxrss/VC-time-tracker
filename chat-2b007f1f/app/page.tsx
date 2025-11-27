'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle, ThemeToggleSlider } from '@/components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/Card';
import { Button, ButtonGroup, IconButton } from '@/components/Button';
import { StatusIndicator, PulseDot, LiveIndicator, ProgressIndicator } from '@/components/StatusIndicator';
import { Avatar, AvatarGroup, AvatarWithStatus } from '@/components/Avatar';
import { Badge, RoleBadge, StatusBadge, CountBadge, BadgeGroup } from '@/components/Badge';
import { StatsCard, StatsGrid, CompactStatsCard, AnimatedStatsCard } from '@/components/StatsCard';
import { Modal, ModalBody, ModalFooter, useModal, ConfirmationModal } from '@/components/Modal';
import {
  Plus,
  Settings,
  Download,
  Heart,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Info,
  Star,
  MoreVertical
} from 'lucide-react';

function HomePage() {
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isConfirmOpen, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      closeConfirmModal();
      alert('Action confirmed!');
    }, 2000);
  };

  const teamMembers = [
    { name: 'Sarah Chen', email: 'sarah@vc.com', src: undefined },
    { name: 'Mike Johnson', email: 'mike@vc.com', src: undefined },
    { name: 'Emily Davis', email: 'emily@vc.com', src: undefined },
    { name: 'Alex Rivera', email: 'alex@vc.com', src: undefined },
    { name: 'Jessica Wong', email: 'jessica@vc.com', src: undefined },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold gradient-text">VC Time Tracker</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">UI Component Showcase</span>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <ThemeToggleSlider />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Stats Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h2>
            <StatsGrid>
              <AnimatedStatsCard
                title="Total Portfolio Value"
                value={2847000}
                change={{ value: 12.5, type: 'increase', period: 'last month' }}
                icon={DollarSign}
                color="success"
              />
              <StatsCard
                title="Active Investments"
                value={47}
                change={{ value: 3, type: 'increase', period: 'this quarter' }}
                icon={TrendingUp}
                color="primary"
              />
              <StatsCard
                title="Portfolio Companies"
                value={23}
                change={{ value: -1, type: 'decrease', period: 'last month' }}
                icon={Users}
                color="warning"
              />
              <StatsCard
                title="Weekly Activities"
                value={142}
                change={{ value: 18, type: 'increase', period: 'last week' }}
                icon={Activity}
                color="error"
              />
            </StatsGrid>
          </section>

          {/* Buttons Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Button Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle size="md">Button Variants</CardTitle>
                  <CardDescription>Different button styles and states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="success" leftIcon={Check}>Success</Button>
                    <Button variant="warning" leftIcon={AlertTriangle}>Warning</Button>
                    <Button variant="danger" leftIcon={X}>Danger</Button>
                  </div>
                  <Button variant="gradient" size="lg" fullWidth>Gradient Button</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Button Groups</CardTitle>
                  <CardDescription>Grouped button controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ButtonGroup>
                    <Button variant="outline">Day</Button>
                    <Button variant="primary">Week</Button>
                    <Button variant="outline">Month</Button>
                    <Button variant="outline">Year</Button>
                  </ButtonGroup>
                  <div className="flex gap-2">
                    <IconButton icon={Settings} tooltip="Settings" variant="ghost" />
                    <IconButton icon={Bell} tooltip="Notifications" variant="ghost" />
                    <IconButton icon={Download} tooltip="Download" variant="ghost" />
                    <IconButton icon={MoreVertical} tooltip="More" variant="ghost" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Loading States</CardTitle>
                  <CardDescription>Buttons with loading indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button isLoading>Submitting...</Button>
                  <Button variant="outline" isLoading leftIcon={Download}>
                    Downloading...
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={() => setIsLoading(!isLoading)}
                    isLoading={isLoading}
                  >
                    Toggle Loading
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Status Indicators Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Status Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle size="md">User Status</CardTitle>
                  <CardDescription>Online/Offline status indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusIndicator status="online" label="Online" />
                    <StatusIndicator status="busy" label="Busy" />
                    <StatusIndicator status="away" label="Away" />
                    <StatusIndicator status="offline" label="Offline" />
                  </div>
                  <div className="flex items-center gap-4">
                    <PulseDot color="success" />
                    <PulseDot color="warning" />
                    <PulseDot color="error" />
                    <PulseDot color="primary" />
                  </div>
                  <LiveIndicator />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Project Status</CardTitle>
                  <CardDescription>Project and task statuses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusIndicator status="active" label="Active" />
                    <StatusIndicator status="pending" label="Pending" />
                    <StatusIndicator status="completed" label="Completed" />
                    <StatusIndicator status="failed" label="Failed" />
                  </div>
                  <ProgressIndicator value={75} showPercentage />
                  <ProgressIndicator value={40} color="warning" showPercentage />
                  <ProgressIndicator value={90} color="success" showPercentage />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Dynamic Status</CardTitle>
                  <CardDescription>Animated status indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusIndicator status="loading" label="Loading..." showPulse />
                  <div className="space-y-2">
                    <StatusIndicator status="online" label="Sarah Chen" showDot />
                    <StatusIndicator status="busy" label="Mike Johnson" showDot />
                    <StatusIndicator status="away" label="Emily Davis" showDot />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Avatar Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Avatar Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle size="md">Individual Avatars</CardTitle>
                  <CardDescription>User avatars with initials fallback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar name="Sarah Chen" size="lg" />
                    <Avatar name="Mike Johnson" size="md" />
                    <Avatar name="Emily Davis" size="sm" />
                    <Avatar name="Alex Rivera" size="xs" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Avatar name="Jessica Wong" shape="square" />
                    <Avatar name="Tom Wilson" shape="rounded" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Avatar with Status</CardTitle>
                  <CardDescription>Avatars with online status indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <AvatarWithStatus name="Sarah Chen" status="online" size="lg" />
                    <AvatarWithStatus name="Mike Johnson" status="busy" size="lg" />
                    <AvatarWithStatus name="Emily Davis" status="away" size="lg" />
                    <AvatarWithStatus name="Alex Rivera" status="dnd" size="lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Avatar Groups</CardTitle>
                  <CardDescription>Team member avatars in groups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AvatarGroup avatars={teamMembers} max={4} size="md" />
                  <AvatarGroup avatars={teamMembers} max={3} size="lg" shape="square" />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Badge Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle size="md">Role Badges</CardTitle>
                  <CardDescription>User role and permission badges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <RoleBadge role="admin" />
                    <RoleBadge role="manager" />
                    <RoleBadge role="investor" />
                    <RoleBadge role="founder" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <RoleBadge role="associate" />
                    <RoleBadge role="analyst" />
                    <RoleBadge role="partner" />
                    <RoleBadge role="vip" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Status Badges</CardTitle>
                  <CardDescription>Project and status indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="active" />
                    <StatusBadge status="pending" />
                    <StatusBadge status="approved" />
                    <StatusBadge status="rejected" />
                  </div>
                  <div className="flex items-center gap-4">
                    <CountBadge count={5} />
                    <CountBadge count={12} />
                    <CountBadge count={99} />
                    <CountBadge count={150} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Badge Collections</CardTitle>
                  <CardDescription>Groups of related badges</CardDescription>
                </CardHeader>
                <CardContent>
                  <BadgeGroup
                    badges={[
                      { label: 'React', variant: 'primary' as const },
                      { label: 'TypeScript', variant: 'secondary' as const },
                      { label: 'Next.js', variant: 'success' as const },
                      { label: 'Tailwind', variant: 'warning' as const },
                      { label: 'Framer', variant: 'error' as const },
                    ]}
                    max={4}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Card Variants Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Card Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="elevated" hover="lift">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>With shadow and hover effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    This card features elevation and smooth hover animations that lift it up.
                  </p>
                </CardContent>
              </Card>

              <Card variant="glass" hover="glow">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                  <CardDescription>With backdrop blur effect</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    A beautiful glassmorphism effect with backdrop blur and transparency.
                  </p>
                </CardContent>
              </Card>

              <Card variant="gradient" hover="scale">
                <CardHeader>
                  <CardTitle>Gradient Card</CardTitle>
                  <CardDescription>With gradient background</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Subtle gradient background with scale animation on hover.
                  </p>
                </CardContent>
              </Card>

              <Card variant="success" hover="border">
                <CardHeader>
                  <CardTitle>Success Card</CardTitle>
                  <CardDescription>Success state styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Green themed card for success states and positive feedback.
                  </p>
                </CardContent>
              </Card>

              <Card variant="warning" hover="glow">
                <CardHeader>
                  <CardTitle>Warning Card</CardTitle>
                  <CardDescription>Warning state styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Yellow themed card for warnings and caution messages.
                  </p>
                </CardContent>
              </Card>

              <Card variant="outlined" hover="lift">
                <CardHeader>
                  <CardTitle>Outlined Card</CardTitle>
                  <CardDescription>With prominent border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Clean card design with a prominent border outline.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Modal Demo Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Modal Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle size="md">Modal Demo</CardTitle>
                  <CardDescription>Interactive modal examples</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={openModal} fullWidth>
                    Open Modal
                  </Button>
                  <Button variant="outline" onClick={openConfirmModal} fullWidth>
                    Open Confirmation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="md">Compact Stats</CardTitle>
                  <CardDescription>Dense statistics display</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CompactStatsCard
                    label="Revenue"
                    value="$2.4M"
                    trend={{ value: 12, direction: 'up' }}
                    color="success"
                  />
                  <CompactStatsCard
                    label="Users"
                    value="48.2K"
                    trend={{ value: 8, direction: 'up' }}
                    color="primary"
                  />
                  <CompactStatsCard
                    label="Churn"
                    value="2.1%"
                    trend={{ value: 5, direction: 'down' }}
                    color="error"
                  />
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        {/* Modals */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title="Example Modal"
          description="This is an example of the modal component with backdrop blur"
          size="lg"
          variant="glass"
        >
          <ModalBody>
            <div className="space-y-4">
              <p>
                This is a beautiful modal component with backdrop blur effect and smooth animations.
                It includes support for different sizes, variants, and custom content.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card variant="outlined" size="sm">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Feature 1</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Smooth animations with Framer Motion
                    </p>
                  </CardContent>
                </Card>
                <Card variant="outlined" size="sm">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Feature 2</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Full dark mode support
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={closeModal}>
              Save Changes
            </Button>
          </ModalFooter>
        </Modal>

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirm}
          title="Confirm Action"
          message="Are you sure you want to perform this action? This cannot be undone."
          confirmText="Yes, I'm sure"
          variant="danger"
          loading={isLoading}
        />
      </div>
    </ThemeProvider>
  );
}

export default HomePage;