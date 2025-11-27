import { Company, TimeEntry, Project, User } from '@/types'

export const sampleCompanies: Company[] = [
  {
    id: '1',
    name: 'TechStart Inc',
    industry: 'FinTech',
    stage: 'series-a',
    foundedYear: 2021,
    website: 'https://techstart.com',
    description: 'AI-powered financial planning platform'
  },
  {
    id: '2',
    name: 'DataFlow',
    industry: 'Data Analytics',
    stage: 'seed',
    foundedYear: 2022,
    website: 'https://dataflow.io',
    description: 'Real-time data processing and visualization'
  },
  {
    id: '3',
    name: 'CloudBase',
    industry: 'Cloud Infrastructure',
    stage: 'series-b',
    foundedYear: 2020,
    website: 'https://cloudbase.com',
    description: 'Enterprise cloud management solutions'
  },
  {
    id: '4',
    name: 'AI Ventures',
    industry: 'Artificial Intelligence',
    stage: 'series-a',
    foundedYear: 2023,
    website: 'https://aiventures.ai',
    description: 'Machine learning for enterprise automation'
  },
  {
    id: '5',
    name: 'BioMed',
    industry: 'Healthcare',
    stage: 'pre-seed',
    foundedYear: 2023,
    description: 'Digital health diagnostics platform'
  }
]

export const sampleProjects: Project[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Q4 Planning Session',
    description: 'Quarterly business review and planning',
    status: 'active',
    startDate: '2024-01-15',
    budget: 50000
  },
  {
    id: '2',
    companyId: '2',
    name: 'Due Diligence',
    description: 'Technical and financial due diligence',
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2024-02-15',
    budget: 75000
  },
  {
    id: '3',
    companyId: '3',
    name: 'Platform Migration',
    description: 'AWS to Azure migration support',
    status: 'completed',
    startDate: '2023-12-01',
    endDate: '2024-01-10',
    budget: 100000
  }
]

export const sampleTimeEntries: TimeEntry[] = [
  {
    id: '1',
    userId: '1',
    companyId: '1',
    projectId: '1',
    date: '2024-01-15',
    duration: 120,
    description: 'Board meeting preparation and follow-up',
    category: 'meeting',
    billable: true,
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    companyId: '2',
    projectId: '2',
    date: '2024-01-15',
    duration: 90,
    description: 'Technical due diligence review',
    category: 'due-diligence',
    billable: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    userId: '1',
    companyId: '3',
    date: '2024-01-14',
    duration: 60,
    description: 'Portfolio support call - infrastructure issues',
    category: 'portfolio-support',
    billable: true,
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  },
  {
    id: '4',
    userId: '1',
    companyId: '4',
    date: '2024-01-14',
    duration: 180,
    description: 'Strategic planning session for Q1',
    category: 'meeting',
    billable: true,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  },
  {
    id: '5',
    userId: '1',
    companyId: '5',
    date: '2024-01-13',
    duration: 45,
    description: 'Initial screening call',
    category: 'sourcing',
    billable: false,
    createdAt: '2024-01-13T14:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z'
  }
]

export const sampleUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@vcfirm.com',
  avatar: 'https://avatars.githubusercontent.com/u/1',
  role: 'partner'
}

export const sampleTeamMembers: User[] = [
  sampleUser,
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@vcfirm.com',
    avatar: 'https://avatars.githubusercontent.com/u/2',
    role: 'associate'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@vcfirm.com',
    avatar: 'https://avatars.githubusercontent.com/u/3',
    role: 'analyst'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@vcfirm.com',
    avatar: 'https://avatars.githubusercontent.com/u/4',
    role: 'partner'
  }
]