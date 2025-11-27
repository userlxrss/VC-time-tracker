'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Bell } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import ToastHistoryPanel from './toast-history'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ToastTriggerProps {
  className?: string
  variant?: 'default' | 'minimal'
}

export function ToastTrigger({ className, variant = 'default' }: ToastTriggerProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const { history } = useToast()

  const unreadCount = history.filter(item => !item.dismissed).length

  if (variant === 'minimal') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsHistoryOpen(true)}
          className={cn('relative', className)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"
            />
          )}
        </Button>

        <AnimatePresence>
          {isHistoryOpen && (
            <ToastHistoryPanel
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <>
      <motion.div
        className={cn('fixed bottom-4 right-4 z-40', className)}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      >
        <Button
          onClick={() => setIsHistoryOpen(true)}
          className="shadow-premium-lg hover:shadow-premium-xl transition-all duration-300"
          size="sm"
        >
          <History className="h-4 w-4 mr-2" />
          History
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full"
            >
              {unreadCount}
            </motion.span>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isHistoryOpen && (
          <ToastHistoryPanel
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default ToastTrigger