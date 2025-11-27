'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Target,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuickStats } from './quick-stats'
import { formatCurrency, formatDuration, formatPercentage } from '@/lib/utils'
import { sampleTimeEntries, sampleCompanies } from '@/lib/data'

const stats = [
  {
    title: 'Time This Month',
    value: formatDuration(168 * 60), // 168 hours
    change: '+12%',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  {
    title: 'Portfolio Companies',
    value: sampleCompanies.length.toString(),
    change: '+2',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950'
  },
  {
    title: 'Utilization Rate',
    value: formatPercentage(78),
    change: '+5%',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  {
    title: 'Billable Hours',
    value: formatDuration(132 * 60),
    change: '+8%',
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  }
]

const recentActivity = sampleTimeEntries.map(entry => ({
  ...entry,
  timeAgo: getTimeAgo(new Date(entry.createdAt))
}))

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

const getCompanyName = (companyId: string) => {
  const company = sampleCompanies.find(c => c.id === companyId)
  return company?.name || 'Unknown Company'
}

const topCompanies = sampleCompanies.slice(0, 5).map((company, index) => {
  const companyTime = sampleTimeEntries
    .filter(entry => entry.companyId === company.id)
    .reduce((total, entry) => total + entry.duration, 0)

  const totalTime = sampleTimeEntries.reduce((total, entry) => total + entry.duration, 0)
  const percentage = totalTime > 0 ? (companyTime / totalTime) * 100 : 0

  return {
    name: company.name,
    time: companyTime,
    percentage: Math.round(percentage)
  }
}).sort((a, b) => b.time - a.time)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function DashboardOverview() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
          <Button>
            <Clock className="mr-2 h-4 w-4" />
            Log Time
          </Button>
        </div>
      </motion.div>

      {/* Premium Quick Stats Section */}
      <motion.div variants={itemVariants}>
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time tracking insights</p>
        </div>
        <QuickStats />
      </motion.div>

      {/* Original Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest time entries across all portfolio companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{getCompanyName(activity.companyId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDuration(activity.duration)}</p>
                      <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View all activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Companies */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Companies
              </CardTitle>
              <CardDescription>
                Most time allocated this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{company.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(company.time)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${company.percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-primary h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View all companies
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}