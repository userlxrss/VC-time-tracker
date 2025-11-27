'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'

interface PremiumNavProps {
  userName?: string
  userAvatar?: string
  userRole?: string
}

export function PremiumNav({
  userName = "Larina",
  userAvatar = "/api/placeholder/40/40",
  userRole = "Partner"
}: PremiumNavProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notificationCount, setNotificationCount] = useState(3)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="h-full animate-pulse bg-gray-100 dark:bg-gray-800" />
      </nav>
    )
  }

  const handleNotificationClick = () => {
    toast('Notifications coming in Phase 2', {
      icon: '🔔',
      className: 'premium-toast',
      style: {
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}`,
        borderRadius: '12px',
        boxShadow: theme === 'dark'
          ? '0 10px 40px rgba(0, 0, 0, 0.3)'
          : '0 10px 40px rgba(0, 0, 0, 0.1)',
      }
    })
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    // Add smooth transition
    document.documentElement.classList.add('theme-transition')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
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
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`
          fixed top-0 left-0 right-0 h-16 z-50
          ${theme === 'dark'
            ? 'bg-gray-900/90 border-gray-800/50'
            : 'bg-white/90 border-gray-200/50'
          }
          backdrop-blur-xl backdrop-saturate-150
          border-b
          transition-all duration-300
        `}
        style={{
          boxShadow: theme === 'dark'
            ? '0 4px 24px -10px rgba(0, 0, 0, 0.3), 0 1px 0 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 24px -10px rgba(0, 0, 0, 0.1), 0 1px 0 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="h-full max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          {/* Left: VC Logo/Brand */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-enterprise-primary to-enterprise-accent
              shadow-lg shadow-enterprise-primary/25
              ${theme === 'dark' ? 'shadow-primary/30' : ''}
            `}>
              <span className="text-white font-bold text-lg">VC</span>
            </div>
            <div>
              <h1 className={`
                font-bold text-lg tracking-tight
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Villanueva Creative
              </h1>
              <p className={`
                text-xs font-medium opacity-70
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Time Tracking Suite
              </p>
            </div>
          </motion.div>

          {/* Center: Dashboard Title */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className={`
              text-xl font-bold tracking-tight text-center
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Dashboard
            </h2>
          </motion.div>

          {/* Right: Navigation Items */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <motion.button
              onClick={handleNotificationClick}
              className={`
                relative p-2.5 rounded-xl transition-all duration-200
                ${theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
                group
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />

              {/* Notification Badge */}
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="destructive"
                      className="w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse"
                    >
                      {notificationCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover Glow Effect */}
              <div className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-enterprise-primary/10 to-enterprise-accent/10'
                  : 'bg-gradient-to-r from-enterprise-primary/5 to-enterprise-accent/5'
                }
              `} />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={handleThemeToggle}
              className={`
                p-2.5 rounded-xl transition-all duration-200
                ${theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-yellow-400'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-yellow-500'
                }
                group
              `}
              whileHover={{ scale: 1.05, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: theme === 'dark' ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </motion.div>

              {/* Hover Glow Effect */}
              <div className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10'
                  : 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5'
                }
              `} />
            </motion.button>

            {/* User Profile Avatar */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="w-10 h-10 border-2 shadow-lg group-hover:shadow-xl transition-all duration-300"
                style={{
                  borderColor: theme === 'dark'
                    ? 'rgb(var(--enterprise-primary))'
                    : 'rgb(var(--enterprise-primary-light))'
                }}
              >
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className={`
                  font-bold text-sm
                  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}
                `}>
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* User Info Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                whileHover={{ opacity: 1, y: 0, scale: 1 }}
                className={`
                  absolute top-full right-0 mt-2 p-3 rounded-xl shadow-xl
                  min-w-[160px] pointer-events-none opacity-0
                  ${theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                  }
                `}
                style={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <p className={`
                  font-semibold text-sm
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {userName}
                </p>
                <p className={`
                  text-xs opacity-70
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {userRole}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Global Styles for Premium Navigation */}
      <style jsx global>{`
        @keyframes premium-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        .premium-toast {
          animation: premium-float 3s ease-in-out infinite;
        }

        .theme-transition * {
          transition: background-color 300ms ease,
                      color 300ms ease,
                      border-color 300ms ease !important;
        }
      `}</style>
    </>
  )
}