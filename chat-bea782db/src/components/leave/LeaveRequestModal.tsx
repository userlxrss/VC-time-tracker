/**
 * Leave Request Modal Component
 *
 * A comprehensive modal form for submitting new leave requests with real-time validation,
 * balance checking, and user-friendly error handling.
 */

import React, { useState, useEffect } from 'react';
import { XIcon, CalendarIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { LeaveRequestFormData, LeaveRequestValidation, LeaveType, LeaveBalance, User } from '../../../../database-schema';
import { LeaveManager } from '../../lib/leave/leaveManager';
import { manilaTime } from '../../lib/utils/manilaTime';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: LeaveRequestFormData) => Promise<void>;
  user: User;
  leaveBalance?: LeaveBalance;
}

const LEAVE_TYPE_CONFIG = {
  [LeaveType.VACATION]: {
    label: 'Vacation Leave',
    description: 'Personal time off for vacation, rest, and relaxation',
    color: 'blue',
    icon: '🏖️',
  },
  [LeaveType.SICK]: {
    label: 'Sick Leave',
    description: 'Medical leave for illness or medical appointments',
    color: 'green',
    icon: '🤒',
  },
  [LeaveType.EMERGENCY]: {
    label: 'Emergency Leave',
    description: 'Urgent leave for unexpected emergencies',
    color: 'red',
    icon: '🚨',
  },
  [LeaveType.PERSONAL]: {
    label: 'Personal Leave',
    description: 'Personal matters and special occasions',
    color: 'purple',
    icon: '👤',
  },
  [LeaveType.UNPAID]: {
    label: 'Unpaid Leave',
    description: 'Leave without pay when other options are exhausted',
    color: 'gray',
    icon: '💸',
  },
  [LeaveType.WORK_FROM_HOME]: {
    label: 'Work From Home',
    description: 'Remote work arrangement instead of office presence',
    color: 'indigo',
    icon: '🏠',
  },
  [LeaveType.MATERNITY]: {
    label: 'Maternity Leave',
    description: 'Leave for pregnancy and childbirth care',
    color: 'pink',
    icon: '👶',
  },
  [LeaveType.PATERNITY]: {
    label: 'Paternity Leave',
    description: 'Leave for new fathers to support their family',
    color: 'pink',
    icon: '👨‍👧‍👦',
  },
};

export function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  leaveBalance
}: LeaveRequestModalProps) {
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    type: LeaveType.VACATION,
    startDate: manilaTime.now(),
    endDate: manilaTime.now(),
    reason: '',
    isEmergency: false,
    emergencyContact: '',
    attachments: [],
  });

  const [validation, setValidation] = useState<LeaveRequestValidation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [showEmergencyField, setShowEmergencyField] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: LeaveType.VACATION,
        startDate: manilaTime.now(),
        endDate: manilaTime.now(),
        reason: '',
        isEmergency: false,
        emergencyContact: '',
        attachments: [],
      });
      setValidation(null);
      setCalculatedDays(0);
      setShowEmergencyField(false);
    }
  }, [isOpen]);

  // Calculate leave days when dates change
  useEffect(() => {
    const days = LeaveManager['calculateLeaveDays'](formData.startDate, formData.endDate);
    setCalculatedDays(days);
  }, [formData.startDate, formData.endDate]);

  // Validate form in real-time
  useEffect(() => {
    if (formData.reason.length >= 10 || formData.type === LeaveType.EMERGENCY) {
      const validateForm = async () => {
        try {
          // Get user's existing requests for validation
          const existingRequests = await LeaveManager.getLeaveRequests(user.id);
          const validationResult = LeaveManager.validateLeaveRequest(formData, user, existingRequests);
          setValidation(validationResult);
        } catch (error) {
          console.error('Validation error:', error);
        }
      };

      validateForm();
    }
  }, [formData, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeaveRequestFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Show/hide emergency contact field
    if (field === 'type') {
      setShowEmergencyField(value === LeaveType.EMERGENCY);
      setFormData(prev => ({
        ...prev,
        type: value,
        isEmergency: value === LeaveType.EMERGENCY,
      }));
    }
  };

  const isFormValid = validation?.isValid && formData.reason.trim().length >= 10;
  const selectedLeaveConfig = LEAVE_TYPE_CONFIG[formData.type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Request Leave
            </h3>
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Leave Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Leave Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(LEAVE_TYPE_CONFIG).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('type', type as LeaveType)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{config.label}</div>
                        <div className="text-xs text-gray-500">{config.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Leave Dates
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate.toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min={manilaTime.now().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate.toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min={formData.startDate.toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {/* Calculated Days Display */}
              <div className="mt-3 flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Total leave days: <span className="font-semibold">{calculatedDays}</span> working days
                </span>
              </div>
            </div>

            {/* Emergency Contact (shown for emergency leave) */}
            {showEmergencyField && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Name and phone number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leave
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={4}
                placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={10}
              />
              <div className="mt-1 text-xs text-gray-500">
                {formData.reason.length}/10 minimum characters
              </div>
            </div>

            {/* Balance Information */}
            {leaveBalance && validation && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Leave Balance Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Available {selectedLeaveConfig.label}:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {validation.availableBalance} days
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Requested:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {validation.requestedDays} days
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Remaining After:</span>
                    <span className={`ml-2 font-semibold ${
                      validation.remainingBalanceAfter < 0 ? 'text-red-600' : 'text-blue-900'
                    }`}>
                      {validation.remainingBalanceAfter >= 0 ? validation.remainingBalanceAfter : 'Insufficient'} days
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Reset Date:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {leaveBalance.resetDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Messages */}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="mb-6">
                {validation.errors.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                      <div className="text-sm text-red-700">
                        <p className="font-semibold mb-1">Please fix the following errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-semibold mb-1">Please note:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}