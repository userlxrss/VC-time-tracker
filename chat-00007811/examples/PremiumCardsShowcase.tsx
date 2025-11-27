import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { StatCard, InsightCard, InteractiveCard, GradientCard } from '@/components/premium';

const PremiumCardsShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Premium Card System</h1>

        {/* Basic Cards Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Basic Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Standard elevated card with subtle shadow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Perfect for general content display with clean, minimalist design.
                </p>
              </CardContent>
            </Card>

            {/* Glass Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>
                  Enhanced backdrop blur effect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Semi-transparent with stronger blur for a premium glass effect.
                </p>
              </CardContent>
            </Card>

            {/* Glow Card */}
            <Card variant="glow">
              <CardHeader>
                <CardTitle>Glow Card</CardTitle>
                <CardDescription>
                  Subtle blue glow effect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Enhanced with subtle glow for important content.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stat Cards Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Stat Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value="$48,654"
              change={{ value: '12.5%', isPositive: true }}
              gradient="blue"
              icon={<span className="text-2xl">💰</span>}
            />
            <StatCard
              title="Active Users"
              value="2,847"
              change={{ value: '8.2%', isPositive: true }}
              gradient="green"
              icon={<span className="text-2xl">👥</span>}
            />
            <StatCard
              title="Conversion Rate"
              value="3.24%"
              change={{ value: '2.1%', isPositive: false }}
              gradient="orange"
              icon={<span className="text-2xl">📊</span>}
            />
            <StatCard
              title="Server Load"
              value="67%"
              gradient="purple"
              icon={<span className="text-2xl">⚡</span>}
            />
          </div>
        </section>

        {/* AI Insights Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">AI Insights Cards</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightCard
              title="Performance Anomaly Detected"
              insight="Your application response time has increased by 45% in the last hour. Consider investigating recent database query changes."
              confidence={85}
              category="performance"
              trend="up"
              icon={<span className="text-2xl">🚨</span>}
            />
            <InsightCard
              title="Security Enhancement Opportunity"
              insight="3 unused API endpoints were detected. Removing them could reduce your attack surface by 12%."
              confidence={92}
              category="security"
              icon={<span className="text-2xl">🔒</span>}
            />
            <InsightCard
              title="Cost Optimization Found"
              insight="Switching to reserved instances could save you $234/month based on current usage patterns."
              confidence={78}
              category="optimization"
              trend="down"
              icon={<span className="text-2xl">💡</span>}
            />
            <InsightCard
              title="User Behavior Pattern"
              insight="Users are spending 35% more time on the dashboard since the latest UI improvements."
              confidence={65}
              category="info"
              icon={<span className="text-2xl">📈</span>}
            />
          </div>
        </section>

        {/* Interactive Cards Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InteractiveCard
              title="Quick Actions"
              description="Access frequently used features"
              badge="New"
              action={{
                label: "Configure",
                onClick: () => console.log('Configure clicked')
              }}
            >
              <div className="space-y-2">
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-sm text-slate-300">Deploy to Production</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-sm text-slate-300">View Analytics</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-sm text-slate-300">System Settings</p>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Project Overview"
              description="Current project status and metrics"
              action={{
                label: "View Details",
                onClick: () => console.log('View details clicked')
              }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm font-medium text-slate-200">68%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Due: Dec 15</span>
                  <span className="text-green-400">On Track</span>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Team Activity"
              description="Recent team collaboration updates"
              badge="Updated"
              action={{
                label: "See All Activity",
                onClick: () => console.log('See all activity clicked')
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Sarah pushed changes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Mike completed review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Lisa started sprint</span>
                </div>
              </div>
            </InteractiveCard>
          </div>
        </section>

        {/* Gradient Cards Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Gradient Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GradientCard
              title="Aurora Theme"
              gradient="aurora"
              intensity="medium"
            >
              <p className="text-slate-200 mb-4">
                Beautiful blue-purple gradient perfect for modern interfaces.
              </p>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  Premium
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Trending
                </span>
              </div>
            </GradientCard>

            <GradientCard
              title="Sunset Theme"
              gradient="sunset"
              intensity="strong"
            >
              <p className="text-slate-200 mb-4">
                Warm orange-red gradient ideal for creative applications.
              </p>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                  Creative
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                  Bold
                </span>
              </div>
            </GradientCard>

            <GradientCard
              title="Cosmic Theme"
              gradient="cosmic"
              intensity="subtle"
            >
              <p className="text-slate-200 mb-4">
                Deep space gradient with purple and pink tones.
              </p>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Mystical
                </span>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                  Dreamy
                </span>
              </div>
            </GradientCard>
          </div>
        </section>

        {/* Mixed Layout Example */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Mixed Layout Dashboard</h2>
          <div className="space-y-6">
            {/* Top row with stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="CPU Usage"
                value="42%"
                change={{ value: '5%', isPositive: true }}
                gradient="green"
                icon={<span className="text-xl">🖥️</span>}
              />
              <StatCard
                title="Memory"
                value="8.2GB"
                change={{ value: '2.1GB', isPositive: false }}
                gradient="orange"
                icon={<span className="text-xl">💾</span>}
              />
              <StatCard
                title="Storage"
                value="156GB"
                gradient="blue"
                icon={<span className="text-xl">📁</span>}
              />
              <StatCard
                title="Network"
                value="124Mbps"
                gradient="purple"
                icon={<span className="text-xl">🌐</span>}
              />
            </div>

            {/* Middle row with insights and interactive cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InsightCard
                  title="System Health Overview"
                  insight="Your system is performing optimally with 99.8% uptime. All critical services are running within normal parameters."
                  confidence={95}
                  category="performance"
                  icon={<span className="text-2xl">✅</span>}
                />
              </div>
              <InteractiveCard
                title="Quick Settings"
                action={{
                  label: "Open Settings",
                  onClick: () => console.log('Settings clicked')
                }}
              >
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Auto-refresh</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Dark Mode</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </label>
                </div>
              </InteractiveCard>
            </div>

            {/* Bottom row with content cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">📊</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-200">Report generated</p>
                        <p className="text-xs text-slate-400">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-200">Backup completed</p>
                        <p className="text-xs text-slate-400">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-2 bg-slate-700/30 rounded">
                      <p className="text-sm text-slate-200">Review security logs</p>
                      <p className="text-xs text-slate-400">Due today</p>
                    </div>
                    <div className="p-2 bg-slate-700/30 rounded">
                      <p className="text-sm text-slate-200">Update documentation</p>
                      <p className="text-xs text-slate-400">Due tomorrow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <GradientCard
                title="Performance Score"
                gradient="ocean"
                intensity="medium"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-100 mb-2">94/100</div>
                  <p className="text-slate-200">Excellent performance</p>
                  <div className="mt-4 w-full bg-slate-700/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </GradientCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PremiumCardsShowcase;