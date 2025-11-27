import { Permission, User } from './types'

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false

  const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
    boss: [
      'view_all_users',
      'edit_own_profile',
      'edit_all_profiles',
      'approve_leave',
      'manage_salary',
      'view_dashboard',
      'access_boss_pages',
      'edit_timesheet'
    ],
    employee: [
      'edit_own_profile',
      'view_dashboard',
      'edit_timesheet'
    ]
  }

  return ROLE_PERMISSIONS[user.role].includes(permission)
}

export function canAccessUser(currentUser: User | null, targetUserId: number): boolean {
  if (!currentUser) return false

  // Users can always access their own profile
  if (currentUser.id === targetUserId) return true

  // Bosses can access all users
  if (currentUser.role === 'boss') return true

  // Employees can only access their own profile
  return false
}

export function canEditUser(currentUser: User | null, targetUserId: number): boolean {
  if (!currentUser) return false

  // Users can always edit their own profile
  if (currentUser.id === targetUserId) return true

  // Bosses can edit all profiles
  if (hasPermission(currentUser, 'edit_all_profiles')) return true

  return false
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarUrl(name: string): string {
  // For now, return a placeholder. In production, this could be a real avatar URL
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`
}

export function formatRole(role: User['role']): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function formatStatus(status: User['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}