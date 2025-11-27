'use client'

import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react'
import { Toast, ToastType, ToastHistory, ToastState, ToastAction } from '@/lib/toast-types'
import { registerToastFunctions, unregisterToastFunctions } from '@/lib/toast'

interface ToastContextType {
  toasts: Toast[]
  history: ToastHistory[]
  settings: ToastState['settings']

  // Basic toast methods
  success: (title: string, options?: ToastOptions) => string
  error: (title: string, options?: ToastOptions) => string
  warning: (title: string, options?: ToastOptions) => string
  info: (title: string, options?: ToastOptions) => string

  // Advanced methods
  custom: (type: ToastType, title: string, options?: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
  pause: (id: string) => void
  resume: (id: string) => void

  // Settings methods
  updateSettings: (settings: Partial<ToastState['settings']>) => void
  clearHistory: () => void

  // History methods
  getHistory: () => ToastHistory[]
  searchHistory: (query: string) => ToastHistory[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 4000,
  error: 5000,
  warning: 6000,
  info: 3000,
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    toasts: [],
    history: [],
    settings: {
      enableSounds: false,
      enableBrowserNotifications: false,
      enableHistory: true,
      maxHistoryItems: 50,
      position: 'top-right',
    },
  })

  const toastTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const pausedToasts = useRef<Set<string>>(new Set())

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Play sound effect
  const playSound = useCallback((type: ToastType) => {
    if (!state.settings.enableSounds) return

    // Create oscillator for simple sound effects
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different types
      const frequencies = {
        success: 523.25, // C5
        error: 261.63,  // C4
        warning: 392.00, // G4
        info: 440.00,   // A4
      }

      oscillator.frequency.value = frequencies[type]
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Unable to play sound:', error)
    }
  }, [state.settings.enableSounds])

  // Show browser notification
  const showBrowserNotification = useCallback((toast: Toast) => {
    if (!state.settings.enableBrowserNotifications || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    try {
      new Notification(toast.title, {
        body: toast.description,
        icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><text y="20" font-size="20">${TOAST_ICONS[toast.type]}</text></svg>`,
        tag: toast.id,
        requireInteraction: toast.persistent,
      })
    } catch (error) {
      console.warn('Unable to show browser notification:', error)
    }
  }, [state.settings.enableBrowserNotifications])

  // Add to history
  const addToHistory = useCallback((toast: Toast) => {
    if (!state.settings.enableHistory) return

    setState(prev => {
      const newHistoryItem: ToastHistory = {
        id: toast.id,
        type: toast.type,
        title: toast.title,
        description: toast.description,
        timestamp: toast.timestamp,
        dismissed: false,
      }

      const updatedHistory = [newHistoryItem, ...prev.history].slice(0, prev.settings.maxHistoryItems)

      return {
        ...prev,
        history: updatedHistory,
      }
    })
  }, [state.settings.enableHistory, state.settings.maxHistoryItems])

  // Schedule toast dismissal
  const scheduleDismissal = useCallback((toast: Toast) => {
    if (toast.persistent) return

    const duration = toast.duration || DEFAULT_DURATION[toast.type]

    const timer = setTimeout(() => {
      if (!pausedToasts.current.has(toast.id)) {
        dismiss(toast.id)
      }
    }, duration)

    toastTimers.current.set(toast.id, timer)
  }, [])

  // Create new toast
  const createToast = useCallback((
    type: ToastType,
    title: string,
    options: ToastOptions = {}
  ): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const timestamp = Date.now()

    const toast: Toast = {
      id,
      type,
      title,
      timestamp,
      createdAt: new Date(),
      ...options,
    }

    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, toast],
    }))

    // Side effects
    scheduleDismissal(toast)
    playSound(type)
    showBrowserNotification(toast)
    addToHistory(toast)

    return id
  }, [scheduleDismissal, playSound, showBrowserNotification, addToHistory])

  // Toast methods
  const success = useCallback((title: string, options?: ToastOptions) =>
    createToast('success', title, options), [createToast])

  const error = useCallback((title: string, options?: ToastOptions) =>
    createToast('error', title, options), [createToast])

  const warning = useCallback((title: string, options?: ToastOptions) =>
    createToast('warning', title, options), [createToast])

  const info = useCallback((title: string, options?: ToastOptions) =>
    createToast('info', title, options), [createToast])

  const custom = useCallback((type: ToastType, title: string, options?: ToastOptions) =>
    createToast(type, title, options), [createToast])

  // Dismiss toast
  const dismiss = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      toasts: prev.toasts.filter(toast => toast.id !== id),
    }))

    // Clear timer
    const timer = toastTimers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      toastTimers.current.delete(id)
    }

    // Remove from paused
    pausedToasts.current.delete(id)

    // Mark as dismissed in history
    setState(prev => ({
      ...prev,
      history: prev.history.map(item =>
        item.id === id ? { ...item, dismissed: true } : item
      ),
    }))
  }, [])

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    state.toasts.forEach(toast => {
      const timer = toastTimers.current.get(toast.id)
      if (timer) {
        clearTimeout(timer)
        toastTimers.current.delete(timer)
      }
    })

    setState(prev => ({
      ...prev,
      toasts: [],
      history: prev.history.map(item => ({ ...item, dismissed: true })),
    }))

    pausedToasts.current.clear()
  }, [state.toasts])

  // Pause toast timer
  const pause = useCallback((id: string) => {
    const timer = toastTimers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      toastTimers.current.delete(id)
      pausedToasts.current.add(id)
    }
  }, [])

  // Resume toast timer
  const resume = useCallback((id: string) => {
    const toast = state.toasts.find(t => t.id === id)
    if (toast && pausedToasts.current.has(id)) {
      pausedToasts.current.delete(id)
      scheduleDismissal(toast)
    }
  }, [state.toasts, scheduleDismissal])

  // Update settings
  const updateSettings = useCallback((settings: Partial<ToastState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }))
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
    }))
  }, [])

  // Get history
  const getHistory = useCallback(() => state.history, [state.history])

  // Search history
  const searchHistory = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return state.history.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery)
    )
  }, [state.history])

  // Register global toast functions after all methods are defined
  useEffect(() => {
    const globalFunctions = {
      success,
      error,
      warning,
      info,
      custom,
      dismiss,
      dismissAll,
    }
    registerToastFunctions(globalFunctions)

    return () => {
      unregisterToastFunctions()
    }
  }, [success, error, warning, info, custom, dismiss, dismissAll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toastTimers.current.forEach(timer => clearTimeout(timer))
    }
  }, [])

  const value: ToastContextType = {
    toasts: state.toasts,
    history: state.history,
    settings: state.settings,
    success,
    error,
    warning,
    info,
    custom,
    dismiss,
    dismissAll,
    pause,
    resume,
    updateSettings,
    clearHistory,
    getHistory,
    searchHistory,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Re-export static toast for convenience
export { toast } from '@/lib/toast'