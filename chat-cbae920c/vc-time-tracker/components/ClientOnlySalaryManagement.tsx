'use client';

import { useState, useEffect, useCallback } from 'react';
import { SalaryPaymentCRUD } from '../src/lib/crud-operations';

interface SalaryManagementState {
  currentMonthSalary: any;
  salaryHistory: any[];
  pendingSalaries: any[];
  isProcessing: boolean;
}

interface SalaryManagementActions {
  markAsPaid: (salaryId: string) => Promise<any>;
  confirmReceipt: (salaryId: string) => Promise<any>;
  refreshSalaryData: () => void;
}

export default function ClientOnlySalaryManagement({
  currentUserId,
  targetEmployeeId,
  useSharedHistory = false,
  children
}: {
  currentUserId?: number;
  targetEmployeeId?: number;
  useSharedHistory?: boolean;
  children: (props: SalaryManagementState & SalaryManagementActions) => React.ReactNode;
}) {
  console.log('🎯 CLIENT-ONLY COMPONENT MOUNTED with params:', {
    currentUserId,
    targetEmployeeId,
    useSharedHistory
  });

  const [state, setState] = useState<SalaryManagementState>({
    currentMonthSalary: null,
    salaryHistory: [],
    pendingSalaries: [],
    isProcessing: false
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from Supabase
  const loadSupabaseData = useCallback(async () => {
    console.log('🔄 CLIENT-SIDE: loadSupabaseData called');
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('📊 CLIENT-SIDE: About to call SalaryPaymentCRUD.getConfirmedSalaryPaymentsForAll()');

      // Load confirmed payments (shared history)
      const confirmedPayments = await SalaryPaymentCRUD.getConfirmedSalaryPaymentsForAll();
      console.log('✅ CLIENT-SIDE: Confirmed payments loaded:', confirmedPayments.length, 'items');

      // Load pending payments
      console.log('📋 CLIENT-SIDE: Fetching pending payments...');
      let pendingPayments: any[] = [];

      // Check if current user is a boss (Ella: 1, Paul: 2)
      const isBoss = currentUserId === 1 || currentUserId === 2;

      if (isBoss) {
        // Bosses see all pending payments they sent
        console.log('👑 CLIENT-SIDE: Boss user - fetching payments sent by:', currentUserId);
        pendingPayments = await SalaryPaymentCRUD.getPendingPaymentsSentBy(currentUserId);
      } else if (targetEmployeeId) {
        // Employees see only pending payments sent to them
        console.log('💼 CLIENT-SIDE: Employee user - fetching payments for employee:', targetEmployeeId);
        pendingPayments = await SalaryPaymentCRUD.getPendingPaymentsForUser(targetEmployeeId);
      }

      console.log('✅ CLIENT-SIDE: Pending payments loaded:', pendingPayments.length);

      const employeeId = targetEmployeeId || currentUserId;
      const finalSalaryHistory = useSharedHistory ? confirmedPayments : confirmedPayments.filter(p => parseInt(p.employee_id) === employeeId);

      console.log('📈 CLIENT-SIDE: Setting state with', finalSalaryHistory.length, 'salary items');
      console.log('💼 CLIENT-SIDE: Also setting', pendingPayments.length, 'pending items');

      setState(prev => {
        console.log('🔄 CLIENT-SIDE: State update - salaryHistory length =', finalSalaryHistory.length);
        return {
          ...prev,
          salaryHistory: finalSalaryHistory,
          pendingSalaries: pendingPayments,
          isProcessing: false
        };
      });

    } catch (error) {
      console.error('❌ CLIENT-SIDE: Error loading salary data from Supabase:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  }, [currentUserId, targetEmployeeId, useSharedHistory]);

  // Initialize on mount - this will ONLY run on client side
  useEffect(() => {
    console.log('🚀 CLIENT-SIDE: Component mounted - initializing...');
    setIsInitialized(true);

    if (currentUserId) {
      console.log('📊 CLIENT-SIDE: Starting initial data load...');
      loadSupabaseData();
    } else {
      console.log('❌ CLIENT-SIDE: No currentUserId provided');
    }
  }, []); // Empty dependency array - only run once on mount

  // Reload data when dependencies change
  useEffect(() => {
    if (isInitialized && currentUserId) {
      console.log('🔄 CLIENT-SIDE: Dependencies changed, reloading data...');
      loadSupabaseData();
    }
  }, [targetEmployeeId, useSharedHistory, isInitialized, loadSupabaseData]);

  const refreshSalaryData = useCallback(() => {
    console.log('🔄 CLIENT-SIDE: Manual refresh triggered');
    loadSupabaseData();
  }, [loadSupabaseData]);

  const markAsPaid = useCallback(async (salaryId: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // For now, return a success result
      const result = {
        success: true,
        message: 'Payment marked as paid'
      };

      await loadSupabaseData(); // Refresh data
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to mark payment as paid',
        error: error instanceof Error ? [{ field: 'general', message: error.message, code: 'ERROR' }] : [{ field: 'general', message: String(error), code: 'ERROR' }]
      };
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [loadSupabaseData]);

  const confirmReceipt = useCallback(async (salaryId: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const employeeId = targetEmployeeId || currentUserId;
      const result = await SalaryPaymentCRUD.confirmByEmployee(Number(employeeId), Number(salaryId));

      await loadSupabaseData(); // Refresh data

      return {
        success: result,
        message: result ? 'Payment receipt confirmed' : 'Failed to confirm receipt',
        error: result ? undefined : [{ field: 'general', message: 'Failed to confirm receipt', code: 'ERROR' }]
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to confirm receipt',
        error: error instanceof Error ? [{ field: 'general', message: error.message, code: 'ERROR' }] : [{ field: 'general', message: String(error), code: 'ERROR' }]
      };
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [currentUserId, targetEmployeeId, loadSupabaseData]);

  console.log('🎯 CLIENT-SIDE: Rendering component - salaryHistory length =', state.salaryHistory.length);

  // Use render prop pattern
  return children({
    ...state,
    markAsPaid,
    confirmReceipt,
    refreshSalaryData
  });
}