export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'partner' | 'associate' | 'analyst' | 'admin'
}

export interface Company {
  id: string
  name: string
  logo?: string
  industry: string
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'growth' | 'mature'
  foundedYear: number
  website?: string
  description?: string
}

export interface TimeEntry {
  id: string
  userId: string
  companyId: string
  projectId?: string
  date: string
  duration: number // in minutes
  description: string
  category: 'meeting' | 'due-diligence' | 'portfolio-support' | 'sourcing' | 'admin' | 'other'
  billable: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  companyId: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on-hold'
  startDate: string
  endDate?: string
  budget?: number
}

export interface TimeAnalytics {
  totalTime: number
  totalTimeByCategory: Record<string, number>
  totalTimeByCompany: Record<string, number>
  billableHours: number
  nonBillableHours: number
  utilizationRate: number
}

export interface DashboardStats {
  totalCompanies: number
  totalProjects: number
  totalTimeThisMonth: number
  totalTimeThisWeek: number
  utilizationRate: number
  billableHours: number
  averageMeetingDuration: number
  topCompanies: Array<{
    id: string
    name: string
    time: number
    percentage: number
  }>
  recentActivity: TimeEntry[]
}

export interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}