'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, User, Permission, USERS, ROLE_PERMISSIONS, DEFAULT_USER_ID } from '@/lib/types'

interface AuthContextType extends AuthUser {
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      const userId = parseInt(savedUserId)
      const foundUser = USERS.find(u => u.id === userId)
      if (foundUser) {
        setUser(foundUser)
      } else {
        // Default to Larina if saved user not found
        const defaultUser = USERS.find(u => u.id === DEFAULT_USER_ID)
        setUser(defaultUser || null)
      }
    } else {
      // Default to Larina for development
      const defaultUser = USERS.find(u => u.id === DEFAULT_USER_ID)
      setUser(defaultUser || null)
      localStorage.setItem('currentUserId', DEFAULT_USER_ID.toString())
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simple authentication - find user by email
      const foundUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase())

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem('currentUserId', foundUser.id.toString())
        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUserId')
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role].includes(permission)
  }

  const canAccessUser = (targetUserId: number): boolean => {
    if (!user) return false

    // Users can always access their own profile
    if (user.id === targetUserId) return true

    // Bosses can access all users
    if (user.role === 'boss') return true

    // Employees can only access their own profile
    return false
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    canAccessUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}