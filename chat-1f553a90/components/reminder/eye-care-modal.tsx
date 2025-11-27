'use client';

import React, { useEffect } from 'react';
import { X, Eye, SkipForward, CheckCircle } from 'lucide-react';
import { useReminder } from '@/contexts/ReminderContext';

export function EyeCareModal() {
  const { reminderState, skipEyeCareReminder, completeEyeCareReminder } = useReminder();

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && reminderState.showEyeCareModal) {
        skipEyeCareReminder();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [reminderState.showEyeCareModal, skipEyeCareReminder]);

  if (!reminderState.showEyeCareModal) return null;

  const progressPercentage = ((20 - reminderState.countdownSeconds) / 20) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={skipEyeCareReminder}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800 p-8 shadow-premium-xl animate-in fade-in zoom-in duration-300">

        {/* Close button */}
        <button
          onClick={skipEyeCareReminder}
          className="absolute top-4 right-4 rounded-full p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-teal-400 shadow-premium-lg">
          <Eye className="h-10 w-10 text-white" />
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Time to Rest Your Eyes
          </h2>

          <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
            Look at something 20 feet away for 20 seconds
          </p>

          {/* Countdown Timer */}
          <div className="space-y-2">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {reminderState.countdownSeconds}s
            </div>
          </div>

          {/* Message based on countdown */}
          {reminderState.countdownSeconds === 0 && (
            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
              Time's up! Your eyes feel refreshed.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={skipEyeCareReminder}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>

            <button
              onClick={completeEyeCareReminder}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 transition-all shadow-premium-md font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              {reminderState.countdownSeconds === 0 ? 'Done!' : 'Done'}
            </button>
          </div>

          {/* Tip */}
          <div className="mt-6 p-4 rounded-xl bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
              <span className="font-semibold">💡 Pro tip:</span> Follow the 20-20-20 rule - every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}