'use client'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Download, Calendar, CreditCard, Users, Clock, CheckCircle, AlertCircle, Plus, Send } from 'lucide-react'
import { SalaryPayment, SalaryPaymentCRUD, formatCurrency } from '../../../../../src/lib/crud-operations'
import { USERS, CURRENT_USER_ID, UserRole } from '../../../../constants/users'

interface SalaryTabProps {
  userId: number
  canEdit: boolean
}

export function SalaryTab({ userId }: SalaryTabProps) {
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([])
  const [pendingPayments, setPendingPayments] = useState<SalaryPayment[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentType, setPaymentType] = useState<'salary' | 'reimbursement'>('salary')
  const [paymentPeriod, setPaymentPeriod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = USERS.find(u => u.id === CURRENT_USER_ID)
  const viewedUser = USERS.find(u => u.id === userId)
  const isBoss = (currentUser?.role as string) === 'boss'
  const canGeneratePayment = isBoss && viewedUser?.role === 'employee'

  useEffect(() => {
    loadSalaryData()
  }, []) // Empty dependency array - this loads shared data for all users

  const calculateYearStats = () => {
    const yearData = salaryPayments.filter(payment =>
      new Date(payment.createdAt).getFullYear() === selectedYear
    )

    const salaryTypePayments = yearData.filter(p => p.type === 'salary')
    const reimbursementTypePayments = yearData.filter(p => p.type === 'reimbursement')

    return {
      totalAmount: yearData.reduce((sum, payment) => sum + payment.amount, 0),
      salaryAmount: salaryTypePayments.reduce((sum, payment) => sum + payment.amount, 0),
      reimbursementAmount: reimbursementTypePayments.reduce((sum, payment) => sum + payment.amount, 0),
      totalPayments: yearData.length,
      salaryPayments: salaryTypePayments.length,
      reimbursementPayments: reimbursementTypePayments.length
    }
  }

  const downloadPayslip = (entryId: string) => {
    // Simulate download functionality
    alert(`Downloading payslip for entry ${entryId}...`)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser || !viewedUser) {
      alert('User information not available')
      return
    }

    const amount = parseFloat(paymentAmount)

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (amount > 1000000) {
      alert('Amount cannot exceed ₱1,000,000')
      return
    }

    if (!paymentPeriod.trim()) {
      alert('Please enter a payment period')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await SalaryPaymentCRUD.generateMonthlyPayment(
        currentUser.id,
        currentUser.firstName,
        viewedUser.id,
        viewedUser.firstName,
        amount,
        paymentType,
        paymentPeriod.trim()
      )

      if (result.success) {
        // Show success message
        alert(`Payment of ${formatCurrency(amount)} for ${viewedUser.firstName} has been generated and is pending confirmation.`)

        // Reset form
        setPaymentAmount('')
        setPaymentPeriod('')
        setShowPaymentForm(false)

        // Reload data
        await loadSalaryData()
      } else {
        alert(result.message || 'Failed to generate payment')
      }
    } catch (error) {
      console.error('Error generating payment:', error)
      alert('An error occurred while generating the payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadSalaryData = async () => {
    try {
      console.log('🔄 Loading salary data from Supabase...')

      // Load both confirmed and pending payments
      const [confirmedPayments, pendingData] = await Promise.all([
        SalaryPaymentCRUD.getConfirmedSalaryPaymentsForAll(),
        currentUser?.role === 'employee' && userId === CURRENT_USER_ID
          ? SalaryPaymentCRUD.getPendingPaymentsForEmployee(userId)
          : Promise.resolve([])
      ])

      console.log('📊 Loaded confirmed payments:', confirmedPayments.length)
      console.log('📊 Loaded pending payments:', pendingData.length)

      setSalaryPayments(confirmedPayments)
      setPendingPayments(pendingData)
    } catch (error) {
      console.error('❌ Error loading salary payments:', error)
      setSalaryPayments([])
      setPendingPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debug function to manually initialize data
  const debugInitializeData = async () => {
    console.log('🔧 Debug: Force reloading data from Supabase...')
    try {
      // Just reload data from Supabase (no localStorage to clear)
      await loadSalaryData()
      console.log('✅ Debug reload complete')
    } catch (error) {
      console.error('❌ Debug reload failed:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium"
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
      default:
        return baseClasses
    }
  }

  const getTypeIcon = (type: 'salary' | 'reimbursement') => {
    return type === 'salary' ?
      <DollarSign size={16} className="inline mr-1" /> :
      <CreditCard size={16} className="inline mr-1" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const yearStats = calculateYearStats()

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            💰 Salary History
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">(Shared across all users)</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(yearStats.totalAmount)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {yearStats.totalPayments} payments
              </p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Salary Payments</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(yearStats.salaryAmount)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {yearStats.salaryPayments} salary payments
              </p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Reimbursements</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(yearStats.reimbursementAmount)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {yearStats.reimbursementPayments} reimbursements
              </p>
            </div>
            <CreditCard className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Average Payment</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatCurrency(yearStats.totalPayments > 0 ? yearStats.totalAmount / yearStats.totalPayments : 0)}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Per payment
              </p>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Payment Generation Form - Only for bosses viewing employee profiles */}
      {canGeneratePayment && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Send size={20} />
              Generate Payment for {viewedUser?.firstName}
            </h4>
            {!showPaymentForm && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus size={14} />
                New Payment
              </button>
            )}
          </div>

          {showPaymentForm && (
            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'salary' | 'reimbursement')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="salary">Salary</option>
                    <option value="reimbursement">Reimbursement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₱)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    max="1000000"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period
                  </label>
                  <input
                    type="text"
                    value={paymentPeriod}
                    onChange={(e) => setPaymentPeriod(e.target.value)}
                    placeholder="e.g., December 2024"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  This will generate a payment that requires confirmation from {viewedUser?.firstName}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false)
                      setPaymentAmount('')
                      setPaymentPeriod('')
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send size={16} />
                    )}
                    Generate Payment
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Pending Payments - Only shown to employees for their own profiles */}
      {currentUser?.role === 'employee' && userId === CURRENT_USER_ID && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-yellow-200 dark:border-yellow-700 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
              <Clock size={20} />
              Pending Payments
            </h4>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              These payments require your confirmation
            </span>
          </div>

          <div className="p-6">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-8 text-yellow-700 dark:text-yellow-300">
                <CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p>No pending payments</p>
                <p className="text-sm mt-1">All your payments are up to date!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                    <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(payment.type)}
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {payment.type}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Pending
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                              <span className="ml-2 font-bold text-gray-900 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Period:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {payment.period}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Sent by:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {payment.sentByName}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Created: {new Date(payment.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`Confirm this payment of ${formatCurrency(payment.amount)}?`)) {
                              try {
                                const result = await SalaryPaymentCRUD.confirmByEmployee(userId, payment.id)
                                if (result.success) {
                                  alert('Payment confirmed successfully!')
                                  await loadSalaryData()
                                } else {
                                  alert(result.message || 'Failed to confirm payment')
                                }
                              } catch (error) {
                                console.error('Error confirming payment:', error)
                                alert('An error occurred while confirming the payment')
                              }
                            }
                          }}
                          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Confirm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Salary Payment History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={20} />
            Shared Salary History
          </h4>
          <div className="flex items-center gap-2">
            {/* Debug button - remove in production */}
            <button
              onClick={debugInitializeData}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
              title="Debug: Force initialize sample data"
            >
              🔧 Debug Init
            </button>
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download size={14} />
              Export All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sent By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {salaryPayments
                .filter(payment => new Date(payment.createdAt).getFullYear() === selectedYear)
                .map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {payment.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="flex items-center gap-1">
                      {getTypeIcon(payment.type)}
                      <span className="capitalize">{payment.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.sentByName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(payment.status)}>
                      {payment.status === 'confirmed' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          Confirmed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => downloadPayslip(payment.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <Download size={14} />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salaryPayments.filter(payment => new Date(payment.createdAt).getFullYear() === selectedYear).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p>No confirmed salary payments found for {selectedYear}</p>
            <p className="text-sm mt-2">Payments will appear here once they are generated and confirmed.</p>
          </div>
        )}
      </div>

      </div>
  )
}