/**
 * Reminder Integration Component
 * Integrates reminder system with existing time tracking components
 */

'use client'

import React from 'react'
import { ReminderProvider } from './reminder-provider'

interface ReminderIntegrationProps {
  children: React.ReactNode
}

export function ReminderIntegration({ children }: ReminderIntegrationProps) {
  return (
    <ReminderProvider>
      {children}
    </ReminderProvider>
  )
}

// HOC to wrap components with reminder functionality
export function withReminders<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WrappedComponent(props: P) {
    return (
      <ReminderIntegration>
        <Component {...props} />
      </ReminderIntegration>
    )
  }
}