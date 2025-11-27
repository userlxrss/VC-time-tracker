'use client'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Download, Calendar, PiggyBank, CreditCard } from 'lucide-react'

interface PayrollEntry {
  id: string
  payDate: string
  periodStart: string
  periodEnd: string
  grossSalary: number
  netSalary: number
  deductions: {
    tax: number
    insurance: number
    retirement: number
    other: number
  }
  bonuses: number
  overtime: number
  status: 'paid' | 'pending' | 'processing'
}

interface SalaryTabProps {
  userId: number
  canEdit: boolean
}

export function SalaryTab({ userId, canEdit }: SalaryTabProps) {
  const [payrollHistory, setPayrollHistory] = useState<PayrollEntry[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading payroll data
    const mockPayroll: PayrollEntry[] = [
      {
        id: '1',
        payDate: '2024-01-31',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        grossSalary: 8000,
        netSalary: 6200,
        deductions: {
          tax: 1200,
          insurance: 300,
          retirement: 200,
          other: 100
        },
        bonuses: 500,
        overtime: 200,
        status: 'paid'
      },
      {
        id: '2',
        payDate: '2023-12-31',
        periodStart: '2023-12-01',
        periodEnd: '2023-12-31',
        grossSalary: 8000,
        netSalary: 6200,
        deductions: {
          tax: 1200,
          insurance: 300,
          retirement: 200,
          other: 100
        },
        bonuses: 1000,
        overtime: 150,
        status: 'paid'
      },
      {
        id: '3',
        payDate: '2023-11-30',
        periodStart: '2023-11-01',
        periodEnd: '2023-11-30',
        grossSalary: 8000,
        netSalary: 6200,
        deductions: {
          tax: 1200,
          insurance: 300,
          retirement: 200,
          other: 100
        },
        bonuses: 0,
        overtime: 100,
        status: 'paid'
      }
    ]

    setTimeout(() => {
      setPayrollHistory(mockPayroll)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateYearStats = () => {
    const yearData = payrollHistory.filter(entry =>
      new Date(entry.payDate).getFullYear() === selectedYear
    )

    return {
      totalGross: yearData.reduce((sum, entry) => sum + entry.grossSalary, 0),
      totalNet: yearData.reduce((sum, entry) => sum + entry.netSalary, 0),
      totalBonuses: yearData.reduce((sum, entry) => sum + entry.bonuses, 0),
      totalOvertime: yearData.reduce((sum, entry) => sum + entry.overtime, 0),
      totalDeductions: yearData.reduce((sum, entry) =>
        sum + Object.values(entry.deductions).reduce((a, b) => a + b, 0), 0
      )
    }
  }

  const downloadPayslip = (entryId: string) => {
    // Simulate download functionality
    alert(`Downloading payslip for entry ${entryId}...`)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium"
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
      default:
        return baseClasses
    }
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
      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Salary Information
        </h3>
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

      {/* Salary Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Monthly Gross</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(8000)}
              </p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Monthly Net</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(6200)}
              </p>
            </div>
            <CreditCard className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">YTD Net</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(yearStats.totalNet)}
              </p>
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">YTD Bonuses</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {formatCurrency(yearStats.totalBonuses)}
              </p>
            </div>
            <PiggyBank className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      {/* Year Statistics */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Year {selectedYear} Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Gross Salary</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(yearStats.totalGross)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Net Salary</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(yearStats.totalNet)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Deductions</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(yearStats.totalDeductions)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Bonuses</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(yearStats.totalBonuses)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Overtime</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(yearStats.totalOvertime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Effective Tax Rate</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {yearStats.totalGross > 0
                ? `${((yearStats.totalDeductions / yearStats.totalGross) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Payroll History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payroll History
          </h4>
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Download size={14} />
            Export All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pay Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Net Salary
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
              {payrollHistory
                .filter(entry => new Date(entry.payDate).getFullYear() === selectedYear)
                .map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(entry.payDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(entry.periodStart).toLocaleDateString()} - {new Date(entry.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(entry.grossSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(Object.values(entry.deductions).reduce((a, b) => a + b, 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(entry.netSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(entry.status)}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => downloadPayslip(entry.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <Download size={14} />
                      Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payrollHistory.filter(entry => new Date(entry.payDate).getFullYear() === selectedYear).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <DollarSign size={48} className="mx-auto mb-3 opacity-50" />
            <p>No payroll data found for {selectedYear}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <Download className="text-blue-500" size={20} />
            <span className="font-medium text-gray-900 dark:text-white">Download Tax Documents</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get your W-2 and other tax forms
          </p>
        </button>

        <button className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <PiggyBank className="text-green-500" size={20} />
            <span className="font-medium text-gray-900 dark:text-white">Update Bank Info</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage direct deposit details
          </p>
        </button>

        <button className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-500" size={20} />
            <span className="font-medium text-gray-900 dark:text-white">Salary History</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View historical compensation data
          </p>
        </button>
      </div>
    </div>
  )
}