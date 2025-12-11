/**
 * VC Time Tracker - Enhanced React Integration with Real-time Subscriptions
 *
 * This file provides React hooks that integrate with Supabase real-time subscriptions
 * for instant updates without requiring page refreshes or tab switches.
 *
 * Key Features:
 * - Real-time salary/payment updates
 * - Instant notification system
 * - Connection status monitoring
 * - Automatic data refresh on changes
 * - Optimistic UI updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  realtimeManager,
  useRealtimeSalaryUpdates,
  RealtimeEvent,
  RealtimeEventType
} from './supabase-realtime';
import {
  getSalaryRecordsForEmployee,
  getCurrentMonthSalary,
  getSalaryRecords,
  markSalaryAsPaid
} from './storage';
import { handleSalaryPaymentConfirmation } from './data-integration';
import { SalaryRecord } from './types';

// ==================== ENHANCED SALARY MANAGEMENT HOOK ====================

export interface RealtimeSalaryState {
  salaryRecords: SalaryRecord[];
  currentMonthSalary: SalaryRecord[];
  pendingSalaries: SalaryRecord[];
  isLoading: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  lastUpdate: RealtimeEvent | null;
  error: string | null;
}

export interface RealtimeSalaryActions {
  refreshData: () => Promise<void>;
  markAsPaid: (salaryId: string) => Promise<{ success: boolean; error?: string }>;
  confirmPayment: (salaryId: string) => Promise<{ success: boolean; error?: string }>;
  subscribeToUser: (userId: number) => void;
  unsubscribeAll: () => void;
}

export function useRealtimeSalaryManagement(employeeId?: number, refreshKey?: number): RealtimeSalaryState & RealtimeSalaryActions {
  const [state, setState] = useState<RealtimeSalaryState>(() => ({
    salaryRecords: [],
    currentMonthSalary: [],
    pendingSalaries: [],
    isLoading: false,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    error: null
  }));

  const mountedRef = useRef(true);
  const currentSubscriptionRef = useRef<number | null>(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // For bosses (employeeId is undefined), load ALL salary records
      // For employees, load only their specific records
      const [allSalaries, currentMonth] = await Promise.all([
        employeeId ? getSalaryRecordsForEmployee(employeeId) : getSalaryRecords(),
        employeeId ? getCurrentMonthSalary(employeeId) : []
      ]);

      const pending = allSalaries.filter(salary => {
        const isPending = salary.status === 'pending' ||
          (!salary.status && !salary.paid_date && !salary.confirmed_by_employee) ||
          (salary.status !== 'paid' && !salary.paid_date && !salary.confirmed_by_employee);

        console.log(`🔍 Checking salary ${salary.id}:`, {
          status: salary.status,
          paid_date: salary.paid_date,
          confirmed_by_employee: salary.confirmed_by_employee,
          isPending
        });

        return isPending;
      });

      console.log(`📊 Loaded salary data:`, {
        employeeId,
        totalRecords: allSalaries.length,
        pendingRecords: pending.length,
        isBoss: !employeeId,
        allSalaries: allSalaries.map(s => ({
          id: s.id,
          type: s.type,
          status: s.status,
          paid_date: s.paid_date,
          confirmed_by_employee: s.confirmed_by_employee
        }))
      });

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          salaryRecords: allSalaries,
          currentMonthSalary: currentMonth,
          pendingSalaries: pending,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Failed to load salary data:', error);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load salary data'
        }));
      }
    }
  }, [employeeId]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((event: RealtimeEvent) => {
    console.log('🔄 Real-time salary update received:', event);

    if (!mountedRef.current) return;

    setState(prev => {
      let newState = { ...prev };

      // Update connection status if needed
      if (event.data?.status) {
        newState.connectionStatus = event.data.status;
      }

      switch (event.type) {
        case 'salary_created':
        case 'salary_updated':
          // Refresh all data when salary records change
          loadInitialData();
          break;

        case 'payment_marked_paid':
          // Optimistically update the specific record
          newState.salaryRecords = prev.salaryRecords.map(record =>
            record.id === event.data.id ? { ...record, ...event.data } : record
          );
          newState.currentMonthSalary = prev.currentMonthSalary.map(record =>
            record.id === event.data.id ? { ...record, ...event.data } : record
          );
          newState.pendingSalaries = prev.pendingSalaries.filter(record => record.id !== event.data.id);
          break;

        case 'payment_confirmed':
          // Optimistically update the specific record
          newState.salaryRecords = prev.salaryRecords.map(record =>
            record.id === event.data.id ? { ...record, ...event.data } : record
          );
          newState.currentMonthSalary = prev.currentMonthSalary.map(record =>
            record.id === event.data.id ? { ...record, ...event.data } : record
          );
          break;

        case 'salary_deleted':
          // Remove the deleted record
          newState.salaryRecords = prev.salaryRecords.filter(record => record.id !== event.data.id);
          newState.currentMonthSalary = prev.currentMonthSalary.filter(record => record.id !== event.data.id);
          newState.pendingSalaries = prev.pendingSalaries.filter(record => record.id !== event.data.id);
          break;
      }

      newState.lastUpdate = event;
      newState.error = null;

      return newState;
    });
  }, [loadInitialData]);

  // Set up real-time subscriptions
  const subscribeToUser = useCallback((userId: number) => {
    console.log(`👤 Setting up real-time subscriptions for user: ${userId}`);

    // Unsubscribe from previous user if any
    if (currentSubscriptionRef.current) {
      realtimeManager.unsubscribeAll();
    }

    // Subscribe to this user's salary updates
    realtimeManager.subscribeToUserSalaries(userId);
    currentSubscriptionRef.current = userId;

    // Set up event listeners
    const eventTypes: RealtimeEventType[] = [
      'salary_created',
      'salary_updated',
      'salary_deleted',
      'payment_confirmed',
      'payment_marked_paid'
    ];

    eventTypes.forEach(type => {
      realtimeManager.addEventListener(type, handleRealtimeUpdate);
    });
  }, [handleRealtimeUpdate]);

  // Set up real-time subscription for current user
  useEffect(() => {
    if (employeeId) {
      subscribeToUser(employeeId);
    } else {
      // Subscribe to all salaries for admins
      realtimeManager.subscribeToAllSalaries();

      const eventTypes: RealtimeEventType[] = [
        'salary_created',
        'salary_updated',
        'salary_deleted',
        'payment_confirmed',
        'payment_marked_paid'
      ];

      eventTypes.forEach(type => {
        realtimeManager.addEventListener(type, handleRealtimeUpdate);
      });
    }

    // Load initial data
    loadInitialData();

    return () => {
      // Cleanup
      if (mountedRef.current) {
        realtimeManager.unsubscribeAll();

        const eventTypes: RealtimeEventType[] = [
          'salary_created',
          'salary_updated',
          'salary_deleted',
          'payment_confirmed',
          'payment_marked_paid'
        ];

        eventTypes.forEach(type => {
          realtimeManager.removeEventListener(type, handleRealtimeUpdate);
        });
      }
    };
  }, [employeeId, refreshKey, subscribeToUser, handleRealtimeUpdate, loadInitialData]); // CRITICAL: Add refreshKey to force re-initialization

  // Mark salary as paid with optimistic update
  const markAsPaid = useCallback(async (salaryId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Optimistically update UI
      setState(prev => ({
        ...prev,
        salaryRecords: prev.salaryRecords.map(record =>
          record.id === salaryId
            ? { ...record, status: 'paid', paid_date: new Date().toISOString() }
            : record
        ),
        pendingSalaries: prev.pendingSalaries.filter(record => record.id !== salaryId)
      }));

      // Actually mark as paid in database
      const result = await markSalaryAsPaid(salaryId);

      if (!result) {
        // Revert optimistic update if failed
        setState(prev => ({
          ...prev,
          error: 'Failed to mark salary as paid'
        }));
        return { success: false, error: 'Failed to mark salary as paid' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking salary as paid:', error);

      // Revert optimistic update
      await loadInitialData();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to mark salary as paid'
      }));

      return { success: false, error: 'Failed to mark salary as paid' };
    }
  }, [loadInitialData]);

  // Confirm payment with optimistic update
  const confirmPayment = useCallback(async (salaryId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Optimistically update UI
      setState(prev => ({
        ...prev,
        salaryRecords: prev.salaryRecords.map(record =>
          record.id === salaryId
            ? { ...record, confirmed_at: new Date().toISOString() }
            : record
        )
      }));

      // Actually confirm in database
      const result = handleSalaryPaymentConfirmation(salaryId, employeeId || 1, 'employee_confirm');

      if (!result.success) {
        // Revert optimistic update if failed
        await loadInitialData();
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to confirm payment'
        }));
        return { success: false, error: result.message || 'Failed to confirm payment' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error confirming payment:', error);

      // Revert optimistic update
      await loadInitialData();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to confirm payment'
      }));

      return { success: false, error: 'Failed to confirm payment' };
    }
  }, [employeeId, loadInitialData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Unsubscribe all
  const unsubscribeAll = useCallback(() => {
    realtimeManager.unsubscribeAll();
    currentSubscriptionRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      realtimeManager.unsubscribeAll();
    };
  }, []);

  return {
    ...state,
    refreshData,
    markAsPaid,
    confirmPayment,
    subscribeToUser,
    unsubscribeAll
  };
}

// ==================== CONNECTION STATUS HOOK ====================

export function useSupabaseConnection() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastPing, setLastPing] = useState<Date | null>(null);

  useEffect(() => {
    const connectionListener = () => {
      setStatus(realtimeManager.getConnectionStatus());
      setLastPing(new Date());
    };

    realtimeManager.addEventListener('salary_updated', connectionListener);

    return () => {
      realtimeManager.removeEventListener('salary_updated', connectionListener);
    };
  }, []);

  return {
    status,
    lastPing,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting'
  };
}

// ==================== PENDING PAYMENTS HOOK ====================

export function useRealtimePendingPayments() {
  const [pendingPayments, setPendingPayments] = useState<SalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePendingPaymentUpdate = useCallback((event: RealtimeEvent) => {
    switch (event.type) {
      case 'payment_marked_paid':
        // Remove from pending when marked as paid
        setPendingPayments(prev => prev.filter(payment => payment.id !== event.data.id));
        break;

      case 'salary_created':
        // Add to pending if it's a new pending payment
        if (event.data.status === 'pending' || (!event.data.paid_date && !event.data.confirmed_at)) {
          setPendingPayments(prev => [event.data, ...prev]);
        }
        break;

      case 'payment_confirmed':
        // Update the confirmed payment
        setPendingPayments(prev => prev.map(payment =>
          payment.id === event.data.id ? { ...payment, ...event.data } : payment
        ));
        break;
    }
  }, []);

  useEffect(() => {
    // Subscribe to all salary updates for pending payments monitoring
    realtimeManager.subscribeToAllSalaries();

    // Set up event listeners
    const eventTypes: RealtimeEventType[] = [
      'salary_created',
      'payment_marked_paid',
      'payment_confirmed'
    ];

    eventTypes.forEach(type => {
      realtimeManager.addEventListener(type, handlePendingPaymentUpdate);
    });

    // Load initial pending payments
    const loadPendingPayments = async () => {
      setIsLoading(true);
      try {
        const allSalaries = await getSalaryRecords();
        const pending = allSalaries.filter(salary =>
          salary.status === 'pending' ||
          (!salary.status && !salary.paid_date && !salary.confirmed_by_employee) ||
          (salary.status !== 'paid' && !salary.paid_date && !salary.confirmed_by_employee)
        );
        setPendingPayments(pending);
      } catch (error) {
        console.error('Failed to load pending payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPendingPayments();

    return () => {
      eventTypes.forEach(type => {
        realtimeManager.removeEventListener(type, handlePendingPaymentUpdate);
      });
    };
  }, [handlePendingPaymentUpdate]);

  return {
    pendingPayments,
    isLoading,
    count: pendingPayments.length
  };
}