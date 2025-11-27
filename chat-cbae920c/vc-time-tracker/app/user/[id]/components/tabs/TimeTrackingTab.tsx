'use client'
import { useState, useEffect } from 'react'
import { Clock, Play, Pause, RotateCcw, Coffee, Home } from 'lucide-react'

interface TimeEntry {
  id: string
  project: string
  description: string
  startTime: string
  endTime?: string
  duration: number
  status: 'active' | 'paused' | 'completed'
}

interface TimeTrackingTabProps {
  userId: number
  canEdit: boolean
}

export function TimeTrackingTab({ userId, canEdit }: TimeTrackingTabProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [selectedProject, setSelectedProject] = useState('Web Development')
  const [description, setDescription] = useState('')

  const projects = [
    'Web Development',
    'Mobile App',
    'Database Design',
    'API Development',
    'Testing',
    'Documentation',
    'Meeting'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Simulate loading today's time entries
    const mockEntries: TimeEntry[] = [
      {
        id: '1',
        project: 'Web Development',
        description: 'Implement user authentication',
        startTime: '09:00',
        endTime: '11:30',
        duration: 150,
        status: 'completed'
      },
      {
        id: '2',
        project: 'Meeting',
        description: 'Team standup and planning',
        startTime: '11:30',
        endTime: '12:00',
        duration: 30,
        status: 'completed'
      },
      {
        id: '3',
        project: 'Database Design',
        description: 'Design user schema',
        startTime: '13:00',
        endTime: '14:15',
        duration: 75,
        status: 'completed'
      }
    ]
    setTodayEntries(mockEntries)
  }, [userId])

  const startTracking = () => {
    if (!canEdit) return

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project: selectedProject,
      description: description || 'Working on ' + selectedProject,
      startTime: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: 0,
      status: 'active'
    }

    setCurrentEntry(newEntry)
    setIsTracking(true)
    setIsPaused(false)
  }

  const pauseTracking = () => {
    if (!canEdit) return
    setIsPaused(!isPaused)
  }

  const stopTracking = () => {
    if (!canEdit || !currentEntry) return

    const completedEntry = {
      ...currentEntry,
      endTime: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed' as const
    }

    setTodayEntries([...todayEntries, completedEntry])
    setCurrentEntry(null)
    setIsTracking(false)
    setIsPaused(false)
    setDescription('')
  }

  const calculateTotalTime = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => total + entry.duration, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const todayTotal = calculateTotalTime(todayEntries)
  const weekTotal = todayTotal * 5 // Simulate week total

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Today</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatDuration(todayTotal)}
              </p>
            </div>
            <Clock className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">This Week</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatDuration(weekTotal)}
              </p>
            </div>
            <Home className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Status</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {isTracking ? (isPaused ? 'Paused' : 'Tracking') : 'Not Tracking'}
              </p>
            </div>
            {isTracking ? (
              isPaused ? <Coffee className="text-purple-500" size={24} /> : <Play className="text-purple-500" size={24} />
            ) : (
              <RotateCcw className="text-purple-500" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Time Tracking Controls */}
      {canEdit && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Time Tracking
          </h3>

          {!isTracking ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={startTracking}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Start Tracking
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentEntry?.project}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Started at {currentEntry?.startTime}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentEntry?.description}
                </p>
                <div className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={pauseTracking}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stopTracking}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Stop & Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Time Entries */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Time Entries
        </h3>

        {todayEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock size={48} className="mx-auto mb-3 opacity-50" />
            <p>No time entries for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {entry.project}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      entry.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : entry.status === 'active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {entry.startTime} - {entry.endTime || 'Ongoing'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDuration(entry.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}