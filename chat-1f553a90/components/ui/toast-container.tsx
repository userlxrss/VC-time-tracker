'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/contexts/ToastContext'
import ToastComponent from './toast'
import { cn } from '@/lib/utils'

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function ToastContainer({ position = 'top-right' }: ToastContainerProps) {
  const { toasts, dismiss, pause, resume, settings } = useToast()

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const actualPosition = settings.position || position

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 p-4 pointer-events-none',
        positionClasses[actualPosition]
      )}
      style={{
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{
              opacity: 0,
              x: actualPosition.includes('right') ? 100 : -100,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.8,
              },
            }}
            exit={{
              opacity: 0,
              x: actualPosition.includes('right') ? 100 : -100,
              scale: 0.9,
              transition: {
                duration: 0.2,
                ease: 'easeInOut',
              },
            }}
            style={{
              pointerEvents: 'auto',
              marginBottom: index > 0 ? '-8px' : '0',
              zIndex: toasts.length - index,
            }}
          >
            <ToastComponent
              toast={toast}
              onDismiss={dismiss}
              onPause={pause}
              onResume={resume}
              isHovered={false}
              onHoverChange={() => {}}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer