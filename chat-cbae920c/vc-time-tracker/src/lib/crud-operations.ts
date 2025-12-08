// Salary Payment CRUD Operations
// Manages salary payments with proper security and validation using Supabase

import { supabase } from './supabase'

export interface SalaryPayment {
  id: string
  employeeId: string  // Changed from number to string to match Supabase
  employeeName: string
  amount: number
  type: 'salary' | 'reimbursement'
  period: string
  status: 'pending' | 'confirmed'
  sentBy: string  // Changed from number to string to match Supabase
  sentByName: string
  createdAt: string
  confirmedAt?: string
}

class SalaryPaymentOperations {
  // Convert Supabase data to our interface format
  private convertSupabasePayment(data: any): SalaryPayment {
    return {
      id: data.id,
      employeeId: String(data.employee_id),  // Convert to string
      employeeName: data.employee_name,
      amount: parseFloat(data.amount),
      type: data.type,
      period: data.period,
      status: data.status,
      sentBy: String(data.sent_by),  // Convert to string
      sentByName: data.sent_by_name,
      createdAt: data.created_at,
      confirmedAt: data.confirmed_at
    }
  }

  // Generate monthly payment (Boss only)
  async generateMonthlyPayment(
    bossId: number,
    bossName: string,
    employeeId: number,
    employeeName: string,
    amount: number,
    type: 'salary' | 'reimbursement',
    period: string
  ): Promise<{ success: boolean; message?: string; payment?: SalaryPayment }> {
    // Validation
    if (!bossId || !bossName || !employeeId || !employeeName) {
      return { success: false, message: 'Missing required user information' }
    }

    if (amount <= 0 || amount > 1000000) {
      return { success: false, message: 'Amount must be between ₱1 and ₱1,000,000' }
    }

    if (!period.trim()) {
      return { success: false, message: 'Period is required' }
    }

    try {
      // Check if payment already exists for this employee and period
      const { data: existingPayments } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('employee_id', String(employeeId))  // Convert to string
        .eq('period', period)
        .eq('type', type)

      if (existingPayments && existingPayments.length > 0) {
        return { success: false, message: `Payment for ${employeeName} - ${period} already exists` }
      }

      // Create new payment
      const { data: newPayment, error } = await supabase
        .from('salary_payments')
        .insert({
          employee_id: String(employeeId),  // Convert to string
          employee_name: employeeName,
          amount: amount,
          type: type,
          period: period,
          status: 'pending',
          sent_by: String(bossId),  // Convert to string
          sent_by_name: bossName
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error creating payment:', error)
        return { success: false, message: 'Failed to create payment in database' }
      }

      return {
        success: true,
        payment: this.convertSupabasePayment(newPayment)
      }

    } catch (error) {
      console.error('❌ Error creating payment:', error)
      return { success: false, message: 'An error occurred while creating the payment' }
    }
  }

  // Confirm payment by employee
  async confirmByEmployee(employeeId: number, paymentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // First check if payment exists and belongs to this employee
      const { data: payment, error: fetchError } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching payment:', fetchError)
        return { success: false, message: 'Payment not found' }
      }

      // Security: Only employee can confirm their own payments
      if (payment.employee_id !== String(employeeId)) {
        return { success: false, message: 'You can only confirm your own payments' }
      }

      // Only pending payments can be confirmed
      if (payment.status !== 'pending') {
        return { success: false, message: 'Payment has already been confirmed' }
      }

      // Confirm payment
      const { error: updateError } = await supabase
        .from('salary_payments')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (updateError) {
        console.error('❌ Error confirming payment:', updateError)
        return { success: false, message: 'Failed to confirm payment' }
      }

      return { success: true }

    } catch (error) {
      console.error('❌ Error confirming payment:', error)
      return { success: false, message: 'An error occurred while confirming the payment' }
    }
  }

  // Get pending payments for an employee
  async getPendingPaymentsForEmployee(employeeId: number): Promise<SalaryPayment[]> {
    try {
      const { data, error } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('employee_id', String(employeeId))  // Convert to string
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching pending payments:', error)
        return []
      }

      return data ? data.map(payment => this.convertSupabasePayment(payment)) : []
    } catch (error) {
      console.error('❌ Error fetching pending payments:', error)
      return []
    }
  }

  // Get confirmed salary payments for ALL users (shared salary history)
  async getConfirmedSalaryPaymentsForAll(): Promise<SalaryPayment[]> {
    try {
      console.log('🔄 Fetching confirmed salary payments from Supabase...')

      const { data, error } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase error fetching confirmed payments:', error)
        return []
      }

      const payments = data ? data.map(payment => this.convertSupabasePayment(payment)) : []
      console.log('📊 Loaded confirmed payments from Supabase:', payments.length)
      return payments

    } catch (error) {
      console.error('❌ Error fetching confirmed payments:', error)
      return []
    }
  }

  // Get payments sent by a specific boss
  async getPaymentsSentBy(bossId: number): Promise<SalaryPayment[]> {
    try {
      const { data, error } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('sent_by', String(bossId))  // Convert to string
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching payments by boss:', error)
        return []
      }

      return data ? data.map(payment => this.convertSupabasePayment(payment)) : []
    } catch (error) {
      console.error('❌ Error fetching payments by boss:', error)
      return []
    }
  }

  // Get payment statistics
  async getPaymentStats(): Promise<{
    total: number
    pending: number
    confirmed: number
    totalAmount: number
    confirmedAmount: number
  }> {
    try {
      const { data, error } = await supabase
        .from('salary_payments')
        .select('*')

      if (error) {
        console.error('❌ Error fetching payment stats:', error)
        return {
          total: 0,
          pending: 0,
          confirmed: 0,
          totalAmount: 0,
          confirmedAmount: 0
        }
      }

      if (!data || data.length === 0) {
        return {
          total: 0,
          pending: 0,
          confirmed: 0,
          totalAmount: 0,
          confirmedAmount: 0
        }
      }

      const allPayments = data.map(payment => this.convertSupabasePayment(payment))
      const pending = allPayments.filter(p => p.status === 'pending')
      const confirmed = allPayments.filter(p => p.status === 'confirmed')

      return {
        total: allPayments.length,
        pending: pending.length,
        confirmed: confirmed.length,
        totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
        confirmedAmount: confirmed.reduce((sum, p) => sum + p.amount, 0)
      }
    } catch (error) {
      console.error('❌ Error calculating payment stats:', error)
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        totalAmount: 0,
        confirmedAmount: 0
      }
    }
  }

  // Delete a payment (Admin only - not exposed in UI)
  async deletePayment(paymentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('salary_payments')
        .delete()
        .eq('id', paymentId)

      if (error) {
        console.error('❌ Error deleting payment:', error)
        return { success: false, message: 'Failed to delete payment' }
      }

      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting payment:', error)
      return { success: false, message: 'An error occurred while deleting the payment' }
    }
  }
}

// Export singleton instance
export const SalaryPaymentCRUD = new SalaryPaymentOperations()

// Make available globally for debugging (only in browser)
if (typeof window !== 'undefined') {
  (window as any).SalaryPaymentCRUD = SalaryPaymentCRUD
}

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}