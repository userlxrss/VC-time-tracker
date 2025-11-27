'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: 'meeting' | 'task' | 'reminder' | 'leave' | 'holiday'
  location?: string
  attendees?: string[]
  description?: string
}

interface CalendarTabProps {
  userId: number
  canEdit: boolean
}

export function CalendarTab({ userId, canEdit }: CalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading calendar events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Standup',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        type: 'meeting',
        location: 'Conference Room A',
        attendees: ['Maria', 'Carlos', 'Larina'],
        description: 'Daily team synchronization'
      },
      {
        id: '2',
        title: 'Sprint Planning',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '12:00',
        type: 'meeting',
        location: 'Main Office',
        attendees: ['Maria', 'Carlos'],
        description: 'Next sprint planning session'
      },
      {
        id: '3',
        title: 'Code Review',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        type: 'task',
        description: 'Review pull requests'
      },
      {
        id: '4',
        title: 'Vacation Day',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        startTime: '00:00',
        endTime: '23:59',
        type: 'leave',
        description: 'Personal vacation day'
      },
      {
        id: '5',
        title: 'Project Deadline',
        date: new Date(Date.now() + 604800000).toISOString().split('T')[0],
        startTime: '17:00',
        endTime: '17:00',
        type: 'reminder',
        description: 'Q1 project deliverable due'
      }
    ]

    setTimeout(() => {
      setEvents(mockEvents)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      task: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700',
      reminder: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
      leave: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700',
      holiday: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700'
    }
    return colors[type as keyof typeof colors] || colors.task
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users size={14} />
      case 'task':
        return <Clock size={14} />
      case 'reminder':
        return <CalendarIcon size={14} />
      case 'leave':
        return <CalendarIcon size={14} />
      case 'holiday':
        return <CalendarIcon size={14} />
      default:
        return <Clock size={14} />
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const days = getDaysInMonth(currentDate)
  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Calendar
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              view === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              view === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              view === 'day'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900">
              {weekDays.map(day => (
                <div key={day} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="p-2 border-t border-gray-200 dark:border-gray-700"></div>
                }

                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dateEvents = getEventsForDate(date)
                const isToday = date.toDateString() === new Date().toDateString()
                const isSelected = date.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-2 border-t border-gray-200 dark:border-gray-700 min-h-[80px] cursor-pointer
                      hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                      ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                    `}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dateEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate border ${getEventTypeColor(event.type)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.type)}
                            <span>{event.startTime}</span>
                          </div>
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {dateEvents.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{dateEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {/* Selected Date Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <CalendarIcon size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No events scheduled</p>
                {canEdit && (
                  <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    Add Event
                  </button>
                )}
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded ${getEventTypeColor(event.type)}`}>
                        {getEventTypeIcon(event.type)}
                      </span>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h5>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.attendees && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Users size={14} />
                      <span>{event.attendees.join(', ')}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {event.description}
                    </p>
                  )}

                  {canEdit && (
                    <div className="flex gap-2 mt-3">
                      <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Add Event */}
          {canEdit && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Quick Add Event</h5>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Event title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Add Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}