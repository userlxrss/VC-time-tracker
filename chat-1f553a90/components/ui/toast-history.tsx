'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  History,
  Search,
  Trash2,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { ToastHistory } from '@/lib/toast-types'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface ToastHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

const HISTORY_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

export function ToastHistoryPanel({ isOpen, onClose }: ToastHistoryPanelProps) {
  const { history, settings, updateSettings, clearHistory, searchHistory } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const filteredHistory = searchQuery ? searchHistory(searchQuery) : history

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let key = 'Older'
    if (date.toDateString() === today.toDateString()) {
      key = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday'
    } else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      key = 'This Week'
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {} as Record<string, ToastHistory[]>)

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      className={cn(
        'fixed right-0 top-0 h-full w-96 bg-background border-l shadow-premium-xl z-50',
        'flex flex-col'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notification History</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b bg-muted/50"
        >
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium">Toast Settings</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">Sound Effects</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSettings({ enableSounds: !settings.enableSounds })}
                >
                  {settings.enableSounds ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">Browser Notifications</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSettings({ enableBrowserNotifications: !settings.enableBrowserNotifications })}
                >
                  {settings.enableBrowserNotifications ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm">Save History</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSettings({ enableHistory: !settings.enableHistory })}
                >
                  {settings.enableHistory ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <History className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No notifications found' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {Object.entries(groupedHistory).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {group}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = HISTORY_ICONS[item.type]
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border',
                          'hover:bg-muted/50 transition-colors',
                          item.dismissed && 'opacity-60'
                        )}
                      >
                        <Icon className={cn(
                          'h-4 w-4 mt-0.5 flex-shrink-0',
                          {
                            'text-vc-success-600': item.type === 'success',
                            'text-red-600': item.type === 'error',
                            'text-vc-warning-600': item.type === 'warning',
                            'text-vc-accent-600': item.type === 'info',
                          }
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default ToastHistoryPanel