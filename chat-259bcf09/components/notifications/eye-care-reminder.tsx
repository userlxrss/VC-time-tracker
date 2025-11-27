/**
 * Premium Eye Care Reminder System for VC Time Tracker
 * Provides automated reminders for eye care based on screen time and work patterns
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Clock, Coffee, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useRealTimeStats } from '@/hooks/useRealTimeStats'
import { TimeEntryStatus } from '@/src/types'
import { cn } from '@/lib/utils'

// Eye care reminder configuration
interface EyeCareConfig {
  enabled: boolean
  intervalMinutes: number // Default 20 minutes (20-20-20 rule)
  breakDurationSeconds: number // Default 20 seconds
  onlyWhenWorking: boolean
  soundEnabled: boolean
  autoStart: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
  }
}

// Default configuration
const DEFAULT_CONFIG: EyeCareConfig = {
  enabled: true,
  intervalMinutes: 20,
  breakDurationSeconds: 20,
  onlyWhenWorking: true,
  soundEnabled: false,
  autoStart: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
}

// Exercise suggestions for eye care
const EYE_EXERCISES = [
  { name: 'Look away', description: 'Focus on something 20 feet away', icon: '👀' },
  { name: 'Blink slowly', description: 'Close and open eyes slowly 10 times', icon: '😌' },
  { name: 'Eye rolls', description: 'Roll eyes in circles 10 times', icon: '🔄' },
  { name: 'Palming', description: 'Cover eyes with palms for 30 seconds', icon: '🙏' },
  { name: 'Near-far focus', description: 'Alternate near and far focus 10 times', icon: '🎯' },
]

// Main Eye Care Reminder Component
export function EyeCareReminder() {
  const { currentStatus, isTracking } = useRealTimeStats()
  const [config, setConfig] = useState<EyeCareConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [currentExercise, setCurrentExercise] = useState(EYE_EXERCISES[0])
  const [breakCountdown, setBreakCountdown] = useState(0)
  const [nextBreakIn, setNextBreakIn] = useState<number | null>(null)
  const [stats, setStats] = useState({
    breaksTaken: 0,
    lastBreakTime: null as Date | null,
    streakDays: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('eyeCareConfig')
      if (savedConfig) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) })
      }

      const savedStats = localStorage.getItem('eyeCareStats')
      if (savedStats) {
        const parsed = JSON.parse(savedStats)
        setStats({
          ...parsed,
          lastBreakTime: parsed.lastBreakTime ? new Date(parsed.lastBreakTime) : null
        })
      }
    } catch (error) {
      console.error('Failed to load eye care config:', error)
    }
  }, [])

  // Save configuration to localStorage
  const saveConfig = useCallback((newConfig: EyeCareConfig) => {
    try {
      localStorage.setItem('eyeCareConfig', JSON.stringify(newConfig))
      setConfig(newConfig)
    } catch (error) {
      console.error('Failed to save eye care config:', error)
    }
  }, [])

  // Save statistics to localStorage
  const saveStats = useCallback((newStats: typeof stats) => {
    try {
      localStorage.setItem('eyeCareStats', JSON.stringify(newStats))
      setStats(newStats)
    } catch (error) {
      console.error('Failed to save eye care stats:', error)
    }
  }, [])

  // Check if current time is in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!config.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMin] = config.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = config.quietHours.end.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime
    }
  }, [config.quietHours])

  // Check if eye care should be active
  const shouldActivate = useCallback(() => {
    if (!config.enabled) return false
    if (isInQuietHours()) return false
    if (config.onlyWhenWorking && !isTracking) return false

    return [
      TimeEntryStatus.CLOCKED_IN,
      TimeEntryStatus.ON_LUNCH,
      TimeEntryStatus.ON_BREAK
    ].includes(currentStatus)
  }, [config, isInQuietHours, isTracking, currentStatus])

  // Show eye care break reminder
  const showBreakReminder = useCallback(() => {
    if (!shouldActivate()) return

    const randomExercise = EYE_EXERCISES[Math.floor(Math.random() * EYE_EXERCISES.length)]
    setCurrentExercise(randomExercise)
    setBreakCountdown(config.breakDurationSeconds)
    setShowBreakReminder(true)

    // Show toast notification
    toast(
      `Eye Care Time! ${randomExercise.name} ${randomExercise.icon}`,
      {
        duration: config.breakDurationSeconds * 1000,
        icon: <Eye className="w-5 h-5 animate-pulse" />,
        style: {
          background: 'var(--glass-bg)',
          color: 'var(--foreground)',
          border: '2px solid rgb(var(--enterprise-primary))',
          backdropFilter: 'var(--glass-blur)',
        },
        className: 'enterprise-card shadow-enterprise-lg animate-bounce-in',
      }
    )

    // Start countdown
    countdownRef.current = setInterval(() => {
      setBreakCountdown(prev => {
        if (prev <= 1) {
          completeBreak()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Auto-complete after duration
    breakTimerRef.current = setTimeout(() => {
      completeBreak()
    }, config.breakDurationSeconds * 1000)
  }, [shouldActivate, config.breakDurationSeconds])

  // Complete eye care break
  const completeBreak = useCallback(() => {
    setShowBreakReminder(false)
    setBreakCountdown(0)

    // Clear timers
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (breakTimerRef.current) clearTimeout(breakTimerRef.current)

    // Update statistics
    const now = new Date()
    const today = now.toDateString()
    const lastBreak = stats.lastBreakTime?.toDateString()

    saveStats({
      breaksTaken: stats.breaksTaken + 1,
      lastBreakTime: now,
      streakDays: lastBreak === today ? stats.streakDays : stats.streakDays + 1
    })

    // Schedule next break
    if (shouldActivate()) {
      scheduleNextBreak()
    }
  }, [stats, shouldActivate, saveStats])

  // Skip eye care break
  const skipBreak = useCallback(() => {
    setShowBreakReminder(false)
    setBreakCountdown(0)

    if (countdownRef.current) clearInterval(countdownRef.current)
    if (breakTimerRef.current) clearTimeout(breakTimerRef.current)

    // Schedule next break
    if (shouldActivate()) {
      scheduleNextBreak()
    }

    toast.info('Eye care break skipped. Stay hydrated! 💧', {
      icon: <EyeOff className="w-5 h-5" />,
      duration: 3000,
    })
  }, [shouldActivate])

  // Schedule next break
  const scheduleNextBreak = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!shouldActivate()) return

    let timeUntilNext = config.intervalMinutes * 60 * 1000

    // Update countdown display
    let countdown = Math.floor(timeUntilNext / 1000)
    setNextBreakIn(countdown)

    const countdownInterval = setInterval(() => {
      countdown -= 1
      setNextBreakIn(countdown)
      if (countdown <= 0) {
        clearInterval(countdownInterval)
        setNextBreakIn(null)
      }
    }, 1000)

    intervalRef.current = setTimeout(() => {
      clearInterval(countdownInterval)
      setNextBreakIn(null)
      showBreakReminder()
    }, timeUntilNext)
  }, [config.intervalMinutes, shouldActivate, showBreakReminder])

  // Setup and cleanup intervals
  useEffect(() => {
    if (shouldActivate()) {
      scheduleNextBreak()
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (breakTimerRef.current) clearTimeout(breakTimerRef.current)
      setNextBreakIn(null)
      setShowBreakReminder(false)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (breakTimerRef.current) clearTimeout(breakTimerRef.current)
    }
  }, [shouldActivate, scheduleNextBreak])

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Eye Care Status Indicator */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Next break countdown */}
          {nextBreakIn !== null && shouldActivate() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "absolute -top-16 right-0 bg-background border rounded-lg px-3 py-2 text-xs",
                "shadow-lg border-border/50 backdrop-blur-sm"
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Next break in {formatCountdown(nextBreakIn)}</span>
              </div>
            </motion.div>
          )}

          {/* Settings button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "rounded-full w-12 h-12 shadow-lg backdrop-blur-sm",
              config.enabled && shouldActivate() ? "bg-primary/10 border-primary/20" : ""
            )}
          >
            <Eye className={cn("w-5 h-5", config.enabled && shouldActivate() ? "text-primary animate-pulse" : "")} />
          </Button>

          {/* Status badge */}
          {config.enabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Eye Care Settings
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Eye Care Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get reminders to rest your eyes
                    </div>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => saveConfig({ ...config, enabled })}
                  />
                </div>

                {/* Interval */}
                <div>
                  <div className="font-medium mb-2">
                    Reminder Interval: {config.intervalMinutes} minutes
                  </div>
                  <Slider
                    value={[config.intervalMinutes]}
                    onValueChange={([intervalMinutes]) => saveConfig({ ...config, intervalMinutes })}
                    min={5}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                {/* Break Duration */}
                <div>
                  <div className="font-medium mb-2">
                    Break Duration: {config.breakDurationSeconds} seconds
                  </div>
                  <Slider
                    value={[config.breakDurationSeconds]}
                    onValueChange={([breakDurationSeconds]) => saveConfig({ ...config, breakDurationSeconds })}
                    min={10}
                    max={60}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10 sec</span>
                    <span>60 sec</span>
                  </div>
                </div>

                {/* Only when working */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Only When Working</div>
                    <div className="text-sm text-muted-foreground">
                      Only show reminders when clocked in
                    </div>
                  </div>
                  <Switch
                    checked={config.onlyWhenWorking}
                    onCheckedChange={(onlyWhenWorking) => saveConfig({ ...config, onlyWhenWorking })}
                  />
                </div>

                {/* Statistics */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Today's Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.breaksTaken}</div>
                      <div className="text-xs text-muted-foreground">Breaks Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.streakDays}</div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eye Care Break Modal */}
      <AnimatePresence>
        {showBreakReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              {/* Exercise icon and name */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {currentExercise.icon}
              </motion.div>

              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Eye Care Time!
              </h3>

              <h4 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                {currentExercise.name}
              </h4>

              <p className="text-blue-700 dark:text-blue-300 mb-6">
                {currentExercise.description}
              </p>

              {/* Countdown */}
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-6">
                {formatCountdown(breakCountdown)}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={completeBreak}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
                <Button
                  variant="outline"
                  onClick={skipBreak}
                  className="border-blue-300 dark:border-blue-700"
                >
                  Skip
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default EyeCareReminder