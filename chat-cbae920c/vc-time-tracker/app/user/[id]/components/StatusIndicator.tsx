'use client'

type StatusType = 'online' | 'offline' | 'away' | 'busy'

interface StatusIndicatorProps {
  status: StatusType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusIndicator({ status, className = '', size = 'md' }: StatusIndicatorProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-gray-400'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2'
      case 'md':
        return 'w-3 h-3'
      case 'lg':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${getSizeClasses(size)}
          ${getStatusColor(status)}
          rounded-full
          ${status === 'online' ? 'animate-pulse' : ''}
        `}
      />
      {status === 'online' && (
        <div className={`absolute inset-0 ${getStatusColor(status)} rounded-full animate-ping opacity-75`} />
      )}
    </div>
  )
}