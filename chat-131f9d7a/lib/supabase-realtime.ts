/**
 * VC Time Tracker - Supabase Real-time Integration
 *
 * This file provides real-time subscription capabilities for instant data updates
 * across all connected clients using Supabase real-time functionality.
 *
 * Key Features:
 * - Real-time subscriptions to salary_records table
 * - Instant payment confirmation updates
 * - Cross-device synchronization
 * - Connection status monitoring
 * - Automatic reconnection handling
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { SalaryRecord } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Enhanced Supabase client with real-time enabled
export const supabaseRealtime = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Real-time event types
export type RealtimeEventType =
  | 'salary_created'
  | 'salary_updated'
  | 'salary_deleted'
  | 'payment_confirmed'
  | 'payment_marked_paid';

export interface RealtimeEvent {
  type: RealtimeEventType;
  data: any;
  timestamp: string;
  table: string;
  userId?: number;
  employeeId?: number;
}

// Event listener interface
export interface RealtimeListener {
  (event: RealtimeEvent): void;
}

// Real-time manager class
export class SupabaseRealtimeManager {
  private listeners: Map<RealtimeEventType, RealtimeListener[]> = new Map();
  private channels: Map<string, RealtimeChannel> = new Map();
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeConnectionStatus();
  }

  /**
   * Initialize connection status monitoring
   */
  private initializeConnectionStatus() {
    if (typeof window !== 'undefined') {
      // Listen for connection status changes using channel events
      const statusChannel = supabaseRealtime.channel('connection-status');

      statusChannel
        .on('broadcast', { event: 'connected' }, () => {
          console.log('🔗 Supabase real-time connected');
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.broadcastConnectionStatus();
        })
        .subscribe((status) => {
          console.log('📡 Connection status channel:', status);
          if (status === 'SUBSCRIBED') {
            this.connectionStatus = 'connected';
          } else if (status === 'CHANNEL_ERROR') {
            this.connectionStatus = 'disconnected';
          }
        });
    }
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`🔄 Attempting to reconnect to Supabase real-time in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        if (this.connectionStatus === 'disconnected') {
          this.connectionStatus = 'connecting';
          // Try to resubscribe to channels
          this.channels.forEach((channel, name) => {
            channel.subscribe();
          });
        }
      }, delay);
    }
  }

  /**
   * Broadcast connection status change
   */
  private broadcastConnectionStatus() {
    const event: RealtimeEvent = {
      type: 'salary_updated', // Use generic type for connection status
      data: { status: this.connectionStatus },
      timestamp: new Date().toISOString(),
      table: 'connection'
    };

    // Notify all listeners of connection status change
    this.listeners.forEach((listeners) => {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in realtime listener:', error);
        }
      });
    });
  }

  /**
   * Subscribe to salary_records table changes
   */
  public subscribeToSalaryRecords(userId?: number) {
    const channelName = userId ? `salary_${userId}` : 'salary_all';

    // Clean up existing channel if any
    if (this.channels.has(channelName)) {
      const oldChannel = this.channels.get(channelName);
      if (oldChannel) {
        supabaseRealtime.removeChannel(oldChannel);
      }
      this.channels.delete(channelName);
    }

    console.log(`📡 Subscribing to salary records: ${channelName} (userId: ${userId || 'ALL'})`);

    // For bosses (no userId specified), subscribe to ALL changes
    // For employees, subscribe only to their specific records
    const channel = supabaseRealtime
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'salary_records',
          ...(userId && {
            // Use the correct column name from your database
            filter: `employee_id=eq.${userId}`
          })
        },
        (payload) => {
          console.log('💰 Real-time salary change received:', payload);
          this.handleSalaryRecordChange(payload);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`📡 Salary subscription error (${channelName}):`, err);
          this.connectionStatus = 'disconnected';
        } else {
          console.log(`📡 Salary subscription status (${channelName}):`, status);
          if (status === 'SUBSCRIBED') {
            this.connectionStatus = 'connected';
          }
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Handle salary record changes from Supabase
   */
  private handleSalaryRecordChange(payload: any) {
    console.log('💰 Salary record change:', payload);

    let eventType: RealtimeEventType;
    const data = payload.new || payload.old;

    switch (payload.eventType) {
      case 'INSERT':
        eventType = 'salary_created';
        break;
      case 'UPDATE':
        // Check if it's a payment confirmation
        if (data.status === 'paid' || data.paid_date) {
          eventType = 'payment_marked_paid';
        } else if (data.confirmed_at) {
          eventType = 'payment_confirmed';
        } else {
          eventType = 'salary_updated';
        }
        break;
      case 'DELETE':
        eventType = 'salary_deleted';
        break;
      default:
        return;
    }

    const event: RealtimeEvent = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      table: 'salary_records',
      userId: data.user_id,
      employeeId: data.employee_id
    };

    // Notify all relevant listeners
    this.notifyListeners(event);
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(event: RealtimeEvent) {
    const relevantTypes = [event.type, 'salary_updated'] as RealtimeEventType[];

    relevantTypes.forEach(type => {
      const listeners = this.listeners.get(type) || [];
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in realtime listener:', error);
        }
      });
    });
  }

  /**
   * Add event listener
   */
  public addEventListener(eventType: RealtimeEventType, listener: RealtimeListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(listener);
    console.log(`👂 Added listener for event type: ${eventType}`);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: RealtimeEventType, listener: RealtimeListener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        console.log(`🔇 Removed listener for event type: ${eventType}`);
      }
    }
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus() {
    return this.connectionStatus;
  }

  /**
   * Subscribe to a specific user's salary updates
   */
  public subscribeToUserSalaries(userId: number) {
    return this.subscribeToSalaryRecords(userId);
  }

  /**
   * Subscribe to all salary updates (for admins)
   */
  public subscribeToAllSalaries() {
    return this.subscribeToSalaryRecords();
  }

  /**
   * Unsubscribe from all channels
   */
  public unsubscribeAll() {
    console.log('🔌 Unsubscribing from all real-time channels');

    this.channels.forEach((channel, name) => {
      supabaseRealtime.removeChannel(channel);
      console.log(`🔌 Unsubscribed from: ${name}`);
    });

    this.channels.clear();
  }

  /**
   * Get active subscription count
   */
  public getActiveSubscriptionCount() {
    return this.channels.size;
  }
}

// Export singleton instance
export const realtimeManager = new SupabaseRealtimeManager();

// Export convenience hooks
export function useRealtimeSalaryUpdates(userId?: number, onSalaryChange?: (event: RealtimeEvent) => void) {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    // Subscribe to salary updates
    const channel = userId
      ? realtimeManager.subscribeToUserSalaries(userId)
      : realtimeManager.subscribeToAllSalaries();

    // Add event listener
    if (onSalaryChange) {
      const eventTypes: RealtimeEventType[] = [
        'salary_created',
        'salary_updated',
        'salary_deleted',
        'payment_confirmed',
        'payment_marked_paid'
      ];

      eventTypes.forEach(type => {
        realtimeManager.addEventListener(type, onSalaryChange);
      });
    }

    // Monitor connection status
    const connectionListener = () => {
      setConnectionStatus(realtimeManager.getConnectionStatus());
    };
    realtimeManager.addEventListener('salary_updated', connectionListener);

    // Initial status
    setConnectionStatus(realtimeManager.getConnectionStatus());

    // Cleanup
    return () => {
      channel?.unsubscribe();

      if (onSalaryChange) {
        const eventTypes: RealtimeEventType[] = [
          'salary_created',
          'salary_updated',
          'salary_deleted',
          'payment_confirmed',
          'payment_marked_paid'
        ];

        eventTypes.forEach(type => {
          realtimeManager.removeEventListener(type, onSalaryChange);
        });
      }

      realtimeManager.removeEventListener('salary_updated', connectionListener);
    };
  }, [userId, onSalaryChange]);

  return {
    connectionStatus,
    lastUpdate,
    isConnected: connectionStatus === 'connected',
    activeSubscriptions: realtimeManager.getActiveSubscriptionCount()
  };
}