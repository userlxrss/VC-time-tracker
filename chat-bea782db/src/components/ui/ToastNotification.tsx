/**
 * Toast Notification Component
 *
 * Displays centered toast notifications with auto-hide functionality.
 * Used for success messages, warnings, and important updates.
 */

import React, { useEffect, useState } from 'react';

interface ToastNotificationProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-hide with progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getToastStyles = () => {
    const styles = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: '✅',
        iconBg: 'bg-green-100',
        titleColor: 'text-green-900',
        messageColor: 'text-green-700',
        progressColor: 'bg-green-500'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'ℹ️',
        iconBg: 'bg-blue-100',
        titleColor: 'text-blue-900',
        messageColor: 'text-blue-700',
        progressColor: 'bg-blue-500'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: '⚠️',
        iconBg: 'bg-yellow-100',
        titleColor: 'text-yellow-900',
        messageColor: 'text-yellow-700',
        progressColor: 'bg-yellow-500'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: '❌',
        iconBg: 'bg-red-100',
        titleColor: 'text-red-900',
        messageColor: 'text-red-700',
        progressColor: 'bg-red-500'
      }
    };

    return styles[type];
  };

  const styles = getToastStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8">
      <div
        className={`
          max-w-md w-full transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
        `}
      >
        <div className={`
          ${styles.bg} ${styles.border}
          rounded-lg shadow-lg border p-4 relative overflow-hidden
        `}>
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
            <div
              className={`h-full ${styles.progressColor} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex items-start space-x-3 pr-8">
            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center`}>
              <span className="text-sm">{styles.icon}</span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
                {title}
              </h4>
              <p className={`text-sm ${styles.messageColor} mt-1`}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;