import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusVariants = cva(
  "relative inline-flex h-3 w-3 rounded-full transition-all duration-300",
  {
    variants: {
      status: {
        online: "bg-vc-success-500 shadow-glow animate-pulse-dot",
        offline: "bg-slate-400",
        busy: "bg-vc-warning-500",
        away: "bg-vc-warning-400",
        clocked_in: "bg-vc-success-500 shadow-glow animate-pulse-dot",
        clocked_out: "bg-slate-400",
        on_break: "bg-vc-warning-400",
      },
      size: {
        sm: "h-2 w-2",
        default: "h-3 w-3",
        lg: "h-4 w-4",
      },
    },
    defaultVariants: {
      status: "offline",
      size: "default",
    },
  }
)

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  showLabel?: boolean
  label?: string
}

const StatusIndicator = React.forwardRef<
  HTMLDivElement,
  StatusIndicatorProps
>(({ className, status, size, showLabel = false, label, ...props }, ref) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
      case 'clocked_in':
        return showLabel ? (label || 'Online') : ''
      case 'offline':
      case 'clocked_out':
        return showLabel ? (label || 'Offline') : ''
      case 'busy':
        return showLabel ? (label || 'Busy') : ''
      case 'away':
      case 'on_break':
        return showLabel ? (label || 'Away') : ''
      default:
        return showLabel ? (label || status) : ''
    }
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <div className={cn(statusVariants({ status, size }))}>
        <span className="absolute -top-1 -left-1 flex h-5 w-5 animate-ping rounded-full bg-vc-success-400 opacity-75" />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {getStatusText(status || 'offline')}
        </span>
      )}
    </div>
  )
})
StatusIndicator.displayName = "StatusIndicator"

export { StatusIndicator, statusVariants }