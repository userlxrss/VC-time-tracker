import { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

export interface ToastOptions {
  duration?: number
  action?: ToastAction
  persistent?: boolean
  sound?: boolean
  browserNotification?: boolean
  icon?: ReactNode
  description?: string
}

export interface Toast extends ToastOptions {
  id: string
  type: ToastType
  title: string
  description?: string
  timestamp: number
  createdAt: Date
}

export interface ToastHistory {
  id: string
  type: ToastType
  title: string
  description?: string
  timestamp: number
  dismissed: boolean
}

export interface ToastState {
  toasts: Toast[]
  history: ToastHistory[]
  settings: {
    enableSounds: boolean
    enableBrowserNotifications: boolean
    enableHistory: boolean
    maxHistoryItems: number
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  }
}