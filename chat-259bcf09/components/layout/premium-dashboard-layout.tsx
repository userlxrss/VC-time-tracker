'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumNav } from '@/components/navigation/premium-nav'

interface PremiumDashboardLayoutProps {
  children: React.ReactNode
  userName?: string
  userAvatar?: string
  userRole?: string
  showWelcome?: boolean
}

export function PremiumDashboardLayout({
  children,
  userName = "Larina",
  userAvatar = "/api/placeholder/40/40",
  userRole = "Partner",
  showWelcome = true
}: PremiumDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-16 animate-pulse bg-gray-200 dark:bg-gray-800" />
        <div className="pt-16 min-h-[calc(100vh-4rem)] p-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="h-32 w-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl mb-8" />
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Premium Navigation */}
      <PremiumNav
        userName={userName}
        userAvatar={userAvatar}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="pt-16 min-h-[calc(100vh-4rem)]"
      >
        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          {/* Dashboard Header */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mb-10"
              >
                <div className="mb-4">
                  <motion.h1
                    className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    Welcome back, <span className="text-enterprise-primary dark:text-enterprise-primary-light">{userName}</span>!
                  </motion.h1>

                  <motion.div
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <span className="text-sm font-medium">
                      {formatDateTime(currentTime)}
                    </span>
                  </motion.div>
                </div>

                {/* Subtle divider */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-enterprise-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-enterprise-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-enterprise-success/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Responsive adjustments for mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .premium-nav-center {
            position: static;
            transform: none;
          }

          .premium-nav-container {
            padding: 0 1rem;
          }

          .premium-content-container {
            padding: 1.5rem 1rem;
          }

          .premium-welcome h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}