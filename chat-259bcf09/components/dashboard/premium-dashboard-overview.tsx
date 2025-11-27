'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ElementType
  description?: string
  delay?: number
}

function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  delay = 0
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          <motion.div
            className={`
              p-2.5 rounded-xl
              ${changeType === 'increase' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : ''}
              ${changeType === 'decrease' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''}
              ${changeType === 'neutral' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
            `}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <motion.div
              className="text-2xl font-bold text-gray-900 dark:text-white"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.div>
            {change && (
              <motion.div
                className={`
                  flex items-center text-xs font-medium
                  ${changeType === 'increase' ? 'text-green-600 dark:text-green-400' : ''}
                  ${changeType === 'decrease' ? 'text-red-600 dark:text-red-400' : ''}
                  ${changeType === 'neutral' ? 'text-blue-600 dark:text-blue-400' : ''}
                `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.3 }}
              >
                {changeType === 'increase' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                {changeType === 'decrease' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                {change}
              </motion.div>
            )}
          </div>
        </CardContent>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-enterprise-primary/5 to-enterprise-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  )
}

interface RecentActivityProps {
  delay?: number
}

function RecentActivity({ delay = 0 }: RecentActivityProps) {
  const activities = [
    {
      id: 1,
      title: "Portfolio Review Meeting",
      company: "TechStart Inc.",
      time: "2 hours ago",
      type: "meeting",
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 2,
      title: "Due Diligence Complete",
      company: "HealthTech Solutions",
      time: "4 hours ago",
      type: "milestone",
      icon: Target,
      color: "text-green-600 dark:text-green-400"
    },
    {
      id: 3,
      title: "Investment Committee Review",
      company: "FinTech Ventures",
      time: "1 day ago",
      type: "review",
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      id: 4,
      title: "Founder Call",
      company: "AI Startup",
      time: "2 days ago",
      type: "call",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
            <Activity className="w-5 h-5 text-enterprise-primary dark:text-enterprise-primary-light" />
          </div>
          <CardDescription>
            Your latest portfolio activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 * index, duration: 0.4 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
              >
                <motion.div
                  className={`
                    p-2 rounded-lg bg-gray-100 dark:bg-gray-700
                    ${activity.color}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-enterprise-primary dark:group-hover:text-enterprise-primary-light transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {activity.company}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PremiumDashboardOverview() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Time Tracked"
          value="247.5 hrs"
          change="+12.5% from last month"
          changeType="increase"
          icon={Clock}
          description="This month"
          delay={0.1}
        />
        <MetricCard
          title="Active Companies"
          value="18"
          change="+2 new companies"
          changeType="increase"
          icon={Building2}
          description="In portfolio"
          delay={0.2}
        />
        <MetricCard
          title="Productivity Score"
          value="94%"
          change="+3% improvement"
          changeType="increase"
          icon={TrendingUp}
          description="This week"
          delay={0.3}
        />
        <MetricCard
          title="Team Members"
          value="12"
          change="No change"
          changeType="neutral"
          icon={Users}
          description="Active users"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Time Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2"
        >
          <Card className="h-[400px] border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Time Tracking Overview
              </CardTitle>
              <CardDescription>
                Weekly time distribution across portfolio companies
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <motion.div
                className="text-center space-y-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-enterprise-primary/20 to-enterprise-accent/20 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-enterprise-primary dark:text-enterprise-primary-light" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Analytics Dashboard
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Interactive charts and visualizations will be available in Phase 2.
                    Track your time allocation, productivity patterns, and portfolio insights.
                  </p>
                </div>
                <motion.div
                  className="flex justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <div className="w-2 h-2 rounded-full bg-enterprise-primary animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-enterprise-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-enterprise-success animate-pulse" style={{ animationDelay: '0.4s' }} />
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <RecentActivity delay={0.6} />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "New Time Entry", icon: Clock, color: "bg-blue-500" },
                { title: "View Reports", icon: BarChart3, color: "bg-green-500" },
                { title: "Manage Team", icon: Users, color: "bg-purple-500" },
                { title: "Calendar View", icon: Calendar, color: "bg-orange-500" }
              ].map((action, index) => (
                <motion.button
                  key={action.title}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-enterprise-primary dark:hover:border-enterprise-primary-light hover:shadow-lg transition-all duration-300 group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`
                    w-10 h-10 rounded-lg ${action.color} bg-opacity-10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300
                    ${action.color === 'bg-blue-500' ? 'text-blue-600 dark:text-blue-400' : ''}
                    ${action.color === 'bg-green-500' ? 'text-green-600 dark:text-green-400' : ''}
                    ${action.color === 'bg-purple-500' ? 'text-purple-600 dark:text-purple-400' : ''}
                    ${action.color === 'bg-orange-500' ? 'text-orange-600 dark:text-orange-400' : ''}
                  `}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Import Building2 icon that was used but not imported
import { Building2 } from 'lucide-react'