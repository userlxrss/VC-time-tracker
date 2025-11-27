'use client'

import { useState, useEffect } from 'react'
import { SalaryService } from '@/services/salaryService'
import { SalaryPayment, SalaryFormData, User } from '@/types/salary'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function BossSalaryManager() {
  const [payments, setPayments] = useState<SalaryPayment[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [showMarkAsPaidForm, setShowMarkAsPaidForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [formData, setFormData] = useState<SalaryFormData>({
    employeeId: 0,
    employeeName: '',
    month: '',
    workPeriod: '',
    paymentDate: '',
    amount: 32444,
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setPayments(SalaryService.getAllPayments())
    setEmployees(SalaryService.getUsers())
  }

  const getMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthString = date.toISOString().slice(0, 7)
      const displayString = SalaryService.getMonthDisplay(monthString)
      months.push({ value: monthString, display: displayString })
    }
    return months
  }

  const getPaymentDateOptions = () => {
    const dates = []
    for (let i = 1; i <= 31; i++) {
      dates.push(`${i}th`)
    }
    return dates
  }

  const handleEmployeeChange = (employeeId: string) => {
    const id = parseInt(employeeId)
    const employee = employees.find(emp => emp.id === id)
    if (employee) {
      setSelectedEmployee(id)
      setFormData(prev => ({
        ...prev,
        employeeId: id,
        employeeName: employee.name
      }))
    }
  }

  const handleMonthChange = (month: string) => {
    const workPeriod = SalaryService.getMonthDisplay(month)
    setFormData(prev => ({
      ...prev,
      month,
      workPeriod
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create payment date
    const [year, month] = formData.paymentDate.split('-')
    const finalPaymentDate = `${year}-${month}-25`

    const finalFormData = {
      ...formData,
      paymentDate: finalPaymentDate
    }

    SalaryService.markSalaryAsPaid(finalFormData)
    setShowMarkAsPaidForm(false)
    setFormData({
      employeeId: 0,
      employeeName: '',
      month: '',
      workPeriod: '',
      paymentDate: '',
      amount: 32444,
      notes: ''
    })
    setSelectedEmployee(null)
    loadData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'marked_as_paid':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'marked_as_paid':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage employee salary payments</p>
        </div>
        <Button
          onClick={() => setShowMarkAsPaidForm(true)}
          className="flex items-center gap-2"
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          Mark Salary as Paid
        </Button>
      </div>

      {/* Mark as Paid Form Modal */}
      {showMarkAsPaidForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowMarkAsPaidForm(false)} />
            <Card className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mark Salary as Paid</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employee
                  </label>
                  <select
                    value={selectedEmployee || ''}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select an employee</option>
                    {employees.filter(emp => emp.id !== 1).map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Period
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select work period</option>
                    {getMonthOptions().map(month => (
                      <option key={month.value} value={month.value}>
                        {month.display}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="month"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Payment will be made on the 25th of the selected month
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add any notes about this payment..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Mark as Paid
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMarkAsPaidForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Work Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={employees.find(e => e.id === payment.employeeId)?.avatar}
                          alt={payment.employeeName}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.employeeName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {employees.find(e => e.id === payment.employeeId)?.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.workPeriod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {SalaryService.formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                    {payment.markedAsPaidDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Marked on {new Date(payment.markedAsPaidDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(payment.status)}`}>
                        {payment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {payment.confirmedByEmployeeDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Confirmed on {new Date(payment.confirmedByEmployeeDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {payment.notes || '-'}
                      {payment.markedByBossName && (
                        <div className="text-xs mt-1">
                          By {payment.markedByBossName}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No salary payments found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}