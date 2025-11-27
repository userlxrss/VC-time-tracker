'use client'
import { useState, useEffect } from 'react'
import { CalendarPlus, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react'

interface LeaveRequest {
  id: string
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid'
  startDate: string
  endDate: string
  reason: string
  status: 'approved' | 'pending' | 'rejected'
  requestedDate: string
  approver?: string
  days: number
}

interface LeaveBalance {
  vacation: number
  sick: number
  personal: number
  total: number
}

interface LeaveTabProps {
  userId: number
  canEdit: boolean
}

export function LeaveTab({ userId, canEdit }: LeaveTabProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    vacation: 15,
    sick: 10,
    personal: 5,
    total: 30
  })
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    type: 'vacation' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    // Simulate loading leave data
    const mockRequests: LeaveRequest[] = [
      {
        id: '1',
        type: 'vacation',
        startDate: '2024-02-15',
        endDate: '2024-02-19',
        reason: 'Family vacation to Hawaii',
        status: 'approved',
        requestedDate: '2024-01-15',
        approver: 'Maria',
        days: 5
      },
      {
        id: '2',
        type: 'sick',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        reason: 'Flu symptoms',
        status: 'approved',
        requestedDate: '2024-01-19',
        approver: 'Maria',
        days: 1
      },
      {
        id: '3',
        type: 'personal',
        startDate: '2024-03-10',
        endDate: '2024-03-11',
        reason: 'Personal appointment',
        status: 'pending',
        requestedDate: '2024-02-28',
        days: 2
      }
    ]

    setTimeout(() => {
      setLeaveRequests(mockRequests)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const submitLeaveRequest = () => {
    if (!canEdit || !formData.startDate || !formData.endDate) return

    const days = calculateDays(formData.startDate, formData.endDate)
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      requestedDate: new Date().toISOString().split('T')[0],
      days
    }

    setLeaveRequests([newRequest, ...leaveRequests])
    setShowRequestForm(false)
    setFormData({ type: 'vacation', startDate: '', endDate: '', reason: '' })
  }

  const filteredRequests = leaveRequests.filter(request =>
    filter === 'all' || request.status === filter
  )

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sick: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      personal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      maternity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      paternity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      unpaid: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[type as keyof typeof colors] || colors.personal
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium"
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
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

  return (
    <div className="space-y-6">
      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Vacation</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {leaveBalance.vacation} days
              </p>
            </div>
            <CalendarPlus className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Sick</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {leaveBalance.sick} days
              </p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Personal</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {leaveBalance.personal} days
              </p>
            </div>
            <Clock className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {leaveBalance.total} days
              </p>
            </div>
            <CheckCircle className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Requests</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <CalendarPlus size={16} />
            Request Leave
          </button>
        )}
      </div>

      {/* Leave Request Form */}
      {showRequestForm && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Request Leave
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Leave Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                min={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
                {formData.startDate && formData.endDate
                  ? `${calculateDays(formData.startDate, formData.endDate)} days`
                  : 'Select dates'
                }
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Please provide a reason for your leave request..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={submitLeaveRequest}
              disabled={!formData.startDate || !formData.endDate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
            <button
              onClick={() => setShowRequestForm(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getLeaveTypeColor(request.type)}`}>
                      {request.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.days} {request.days === 1 ? 'day' : 'days'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="max-w-xs truncate">{request.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(request.requestedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarPlus size={48} className="mx-auto mb-3 opacity-50" />
            <p>No leave requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}