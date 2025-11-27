'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { Toast, ToastAction } from '@/lib/toast-types'
import { cn } from '@/lib/utils'

interface ToastComponentProps {
  toast: Toast
  onDismiss: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  isHovered: boolean
  onHoverChange: (hovered: boolean) => void
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    className: 'border-vc-success-200 bg-gradient-to-r from-vc-success-50 to-white dark:from-vc-success-950/20 dark:to-background',
    iconClassName: 'text-vc-success-600 dark:text-vc-success-400',
    progressClassName: 'bg-vc-success-500',
    buttonClassName: 'hover:bg-vc-success-100 dark:hover:bg-vc-success-900/20 text-vc-success-700 dark:text-vc-success-300',
  },
  error: {
    icon: AlertCircle,
    className: 'border-vc-destructive/50 bg-gradient-to-r from-red-50/50 to-white dark:from-red-950/20 dark:to-background',
    iconClassName: 'text-red-600 dark:text-red-400',
    progressClassName: 'bg-red-500',
    buttonClassName: 'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-vc-warning-200 bg-gradient-to-r from-vc-warning-50/50 to-white dark:from-vc-warning-950/20 dark:to-background',
    iconClassName: 'text-vc-warning-600 dark:text-vc-warning-400',
    progressClassName: 'bg-vc-warning-500',
    buttonClassName: 'hover:bg-vc-warning-100 dark:hover:bg-vc-warning-900/20 text-vc-warning-700 dark:text-vc-warning-300',
  },
  info: {
    icon: Info,
    className: 'border-vc-accent-200 bg-gradient-to-r from-vc-accent-50/50 to-white dark:from-vc-accent-950/20 dark:to-background',
    iconClassName: 'text-vc-accent-600 dark:text-vc-accent-400',
    progressClassName: 'bg-vc-accent-500',
    buttonClassName: 'hover:bg-vc-accent-100 dark:hover:bg-vc-accent-900/20 text-vc-accent-700 dark:text-vc-accent-300',
  },
} as const

export function ToastComponent({
  toast,
  onDismiss,
  onPause,
  onResume,
  isHovered,
  onHoverChange,
}: ToastComponentProps) {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(false)
  const progressRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>(Date.now())
  const remainingTimeRef = useRef<number>(toast.duration || 4000)

  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true))

    return () => setIsVisible(false)
  }, [])

  useEffect(() => {
    if (toast.persistent) return

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, remainingTimeRef.current - elapsed)
      const progressPercent = (remaining / (toast.duration || 4000)) * 100

      setProgress(progressPercent)

      if (remaining > 0 && !isHovered) {
        progressRef.current = requestAnimationFrame(updateProgress)
      }
    }

    if (!isHovered) {
      progressRef.current = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current)
      }
    }
  }, [toast.duration, toast.persistent, isHovered])

  const handleMouseEnter = () => {
    onHoverChange(true)
    onPause(toast.id)

    // Track remaining time
    const elapsed = Date.now() - startTimeRef.current
    remainingTimeRef.current = Math.max(0, (toast.duration || 4000) - elapsed)
  }

  const handleMouseLeave = () => {
    onHoverChange(false)
    onResume(toast.id)
    startTimeRef.current = Date.now()
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(toast.id), 200)
  }

  const handleAction = () => {
    toast.action?.onClick()
    handleDismiss()
  }

  return (
    <div
      className={cn(
        'group relative flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-premium-lg backdrop-blur-premium transition-all duration-300',
        'transform-gpu',
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95',
        config.className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className={cn('h-5 w-5 mt-0.5', config.iconClassName)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium leading-none mb-1">
              {toast.title}
            </p>
            {toast.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 rounded-md p-1 transition-colors',
              'opacity-0 group-hover:opacity-100',
              'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              config.buttonClassName
            )}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action button */}
        {toast.action && (
          <div className="mt-3">
            <button
              onClick={handleAction}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                toast.action.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : toast.action.variant === 'outline'
                  ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
                config.buttonClassName
              )}
            >
              {toast.action.label}
              <Loader2 className="h-3 w-3 animate-spin" />
            </button>
          </div>
        )}

        {/* Progress bar */}
        {!toast.persistent && (
          <div className="mt-3">
            <div className="relative h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute top-0 left-0 h-full transition-all ease-linear',
                  config.progressClassName,
                  isHovered && 'transition-none'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Gradient border effect */}
      <div className={cn(
        'absolute inset-0 rounded-lg bg-gradient-to-r opacity-10 pointer-events-none',
        'from-transparent via-white to-transparent'
      )} />
    </div>
  )
}

export default ToastComponent