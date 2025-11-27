'use client';

import React, { useEffect } from 'react';
import { useBreak } from '@/contexts/BreakContext';
import { showBreakNotification } from '@/lib/break-utils';

interface BreakStatusIntegrationProps {
  children: React.ReactNode;
}

export function BreakStatusIntegration({ children }: BreakStatusIntegrationProps) {
  // Mock user for demo purposes
  const mockUser = { id: 'demo-user-id', name: 'Demo User' };
  const { isOnBreak, currentActiveBreak, stats, breakTimer } = useBreak();

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show notifications for break state changes
  useEffect(() => {
    if (!mockUser || !currentActiveBreak) return;

    // Break started notification
    if (currentActiveBreak.isActive) {
      showBreakNotification(
        `${currentActiveBreak.type === 'lunch' ? '🍽️ Lunch Break' : '☕ Short Break'} Started`,
        {
          body: currentActiveBreak.description || `Take time to recharge and refresh`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        }
      );
    }
  }, [currentActiveBreak?.id, user]);

  // Show break reminders and warnings
  useEffect(() => {
    if (!isOnBreak || !currentActiveBreak || currentActiveBreak.type === 'lunch') return;

    // Warn when break is almost over (1 minute left)
    if (breakTimer === 60 && currentActiveBreak.type === 'short') {
      showBreakNotification('⏰ Break ending in 1 minute!', {
        body: 'Start wrapping up your break activities',
        icon: '/favicon.ico',
      });
    }

    // Notify when break ends automatically
    if (breakTimer === 0 && currentActiveBreak.type === 'short') {
      showBreakNotification('✅ Break completed!', {
        body: `Your ${currentActiveBreak.duration}-minute break is over`,
        icon: '/favicon.ico',
      });
    }
  }, [breakTimer, isOnBreak, currentActiveBreak]);

  // Lunch break reminder (if not taken by 2 PM)
  useEffect(() => {
    if (!user || !stats.lunchBreakTaken) {
      const now = new Date();
      const hour = now.getHours();

      // Check if it's past 2 PM and no lunch break taken
      if (hour >= 14 && hour < 15) {
        const lastReminder = localStorage.getItem('vc-lunch-reminder');
        const today = now.toDateString();

        if (!lastReminder || lastReminder !== today) {
          showBreakNotification('🍽️ Don\'t forget your lunch break!', {
            body: 'Remember to take a proper lunch break to stay productive',
            icon: '/favicon.ico',
          });
          localStorage.setItem('vc-lunch-reminder', today);
        }
      }
    }
  }, [stats.lunchBreakTaken, user]);

  // Cleanup old reminders
  useEffect(() => {
    const today = new Date().toDateString();
    const lastReminder = localStorage.getItem('vc-lunch-reminder');

    if (lastReminder && lastReminder !== today) {
      localStorage.removeItem('vc-lunch-reminder');
    }
  }, []);

  // Update document title based on break status
  useEffect(() => {
    if (isOnBreak && currentActiveBreak) {
      const minutes = Math.ceil(breakTimer / 60);
      document.title = `${currentActiveBreak.type === 'lunch' ? '🍽️ Lunch' : '☕ Break'} (${minutes}m) - VC Time Tracker`;
    } else {
      document.title = 'VC Time Tracker';
    }

    return () => {
      document.title = 'VC Time Tracker';
    };
  }, [isOnBreak, currentActiveBreak, breakTimer]);

  // Add keyboard shortcuts for break management
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + B: Quick 5-minute break
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'B') {
        event.preventDefault();
        // This would be handled by the break controls component
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return <>{children}</>;
}