'use client'

import React from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import { ToastContainer } from './toast-container'
import { ToastTrigger } from './toast-trigger'

interface ToasterProps {
  showHistoryButton?: boolean
  historyButtonVariant?: 'default' | 'minimal'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function Toaster({
  showHistoryButton = true,
  historyButtonVariant = 'default',
  position = 'top-right',
}: ToasterProps = {}) {
  return (
    <ToastProvider>
      <ToastContainer position={position} />
      {showHistoryButton && (
        <ToastTrigger variant={historyButtonVariant} />
      )}
    </ToastProvider>
  )
}

// Legacy export for backward compatibility
export { Toaster as default }

// Re-export toast context for convenience
export { useToast } from '@/contexts/ToastContext'
export { useToastIntegration } from '@/hooks/use-toast-integration'

// Export static toast for convenience
export { toast } from '@/contexts/ToastContext'