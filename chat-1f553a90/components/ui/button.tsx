import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-vc-primary-600 to-vc-primary-700 text-white shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        outline:
          "border-2 border-vc-primary-200 bg-white text-vc-primary-700 shadow-premium-sm hover:bg-vc-primary-50 hover:border-vc-primary-300 hover:shadow-premium-md hover:scale-[1.02] active:scale-[0.98] dark:border-vc-primary-700 dark:bg-transparent dark:text-vc-primary-300 dark:hover:bg-vc-primary-900/20 dark:hover:border-vc-primary-600",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-premium-sm hover:shadow-premium-md hover:scale-[1.02] active:scale-[0.98] dark:from-slate-800 dark:to-slate-700 dark:text-slate-300",
        ghost:
          "text-slate-700 hover:bg-vc-primary-50 hover:text-vc-primary-700 hover:scale-[1.02] active:scale-[0.98] dark:text-slate-300 dark:hover:bg-vc-primary-900/20 dark:hover:text-vc-primary-300",
        link:
          "text-vc-primary-600 underline-offset-4 hover:underline hover:text-vc-primary-700 dark:text-vc-primary-400 dark:hover:text-vc-primary-300",
        glass:
          "backdrop-blur-premium bg-white/20 border border-white/20 text-slate-700 shadow-premium-glass hover:bg-white/30 hover:shadow-premium-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-black/20 dark:border-white/10 dark:text-white dark:hover:bg-black/30",
        success:
          "bg-gradient-to-r from-vc-success-500 to-vc-success-600 text-white shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-13 px-8 py-3 text-base",
        xl: "h-15 px-10 py-4 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-13 w-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }