/**
 * UI Alert Component
 * Basic alert implementation for notifications and errors
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface AlertProps {
  className?: string
  children: React.ReactNode
}

interface AlertDescriptionProps {
  className?: string
  children: React.ReactNode
}

export const Alert: React.FC<AlertProps> = ({ className, children }) => {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        "[&:has(svg)]:pl-11",
        "bg-background text-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className, children }) => {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
      {children}
    </div>
  )
}