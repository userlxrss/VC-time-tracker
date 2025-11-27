import { useState, useEffect, useCallback } from 'react'

export interface TimerState {
  isRunning: boolean
  startTime: Date | null
  elapsed: number
  currentEntry: {
    id?: string
    description: string
    projectId: string
  } | null
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsed: 0,
    currentEntry: null,
  })

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsed: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000),
        }))
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timerState.isRunning, timerState.startTime])

  const startTimer = useCallback((description: string, projectId: string) => {
    setTimerState({
      isRunning: true,
      startTime: new Date(),
      elapsed: 0,
      currentEntry: {
        description,
        projectId,
      },
    })
  }, [])

  const stopTimer = useCallback(() => {
    const currentState = timerState
    setTimerState({
      isRunning: false,
      startTime: null,
      elapsed: 0,
      currentEntry: null,
    })
    return currentState
  }, [timerState])

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }))
  }, [])

  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
    }))
  }, [])

  const resetTimer = useCallback(() => {
    setTimerState({
      isRunning: false,
      startTime: null,
      elapsed: 0,
      currentEntry: null,
    })
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':')
  }, [])

  return {
    timerState,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  }
}