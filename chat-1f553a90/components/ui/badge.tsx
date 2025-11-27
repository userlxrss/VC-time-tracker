import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-vc-primary-500 to-vc-primary-600 text-white shadow-premium-sm hover:shadow-premium-md",
        secondary:
          "border-transparent bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-premium-sm hover:shadow-premium-md",
        outline:
          "border-2 border-vc-primary-200 text-vc-primary-700 bg-white hover:bg-vc-primary-50 dark:border-vc-primary-700 dark:text-vc-primary-300 dark:bg-transparent dark:hover:bg-vc-primary-900/20",
        success:
          "border-transparent bg-gradient-to-r from-vc-success-500 to-vc-success-600 text-white shadow-premium-sm hover:shadow-premium-md",
        warning:
          "border-transparent bg-gradient-to-r from-vc-warning-400 to-vc-warning-500 text-white shadow-premium-sm hover:shadow-premium-md",
        status:
          "border-transparent bg-white/80 backdrop-blur-sm text-slate-700 shadow-premium-sm dark:bg-black/40 dark:text-white dark:border-white/10",
        glass:
          "border-white/20 bg-white/10 backdrop-blur-premium text-white shadow-premium-glass hover:bg-white/20",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }