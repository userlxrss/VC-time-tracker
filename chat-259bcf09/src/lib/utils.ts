import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enterprise color utilities
export const enterpriseColors = {
  primary: {
    light: "rgb(99, 102, 241)",
    dark: "rgb(129, 140, 248)",
    gradient: "linear-gradient(135deg, rgb(99, 102, 241), rgb(129, 140, 248))",
  },
  accent: {
    light: "rgb(245, 158, 11)",
    dark: "rgb(251, 191, 36)",
  },
  success: {
    light: "rgb(16, 185, 129)",
    dark: "rgb(52, 211, 153)",
  },
  warning: {
    light: "rgb(251, 146, 60)",
    dark: "rgb(251, 146, 60)",
  },
  error: {
    light: "rgb(239, 68, 68)",
    dark: "rgb(248, 113, 113)",
  },
  info: {
    light: "rgb(59, 130, 246)",
    dark: "rgb(96, 165, 250)",
  },
} as const

// Enterprise spacing utilities (8px grid system)
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
} as const

// Enterprise animation utilities
export const animations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  slideDown: "animate-slide-down",
  slideLeft: "animate-slide-left",
  slideRight: "animate-slide-right",
  scaleIn: "animate-scale-in",
  bounce: "animate-bounce-subtle",
  pulse: "animate-pulse-slow",
  float: "animate-float",
} as const

// Enterprise shadow utilities
export const shadows = {
  enterprise: "shadow-enterprise",
  enterpriseLg: "shadow-enterprise-lg",
  glass: "shadow-glass",
  glow: "shadow-glow",
  glowPrimary: "glow-primary",
  glowSuccess: "glow-success",
  glowWarning: "glow-warning",
  glowError: "glow-error",
} as const

// Enterprise glassmorphism utilities
export const glass = {
  default: "glass",
  subtle: "glass-subtle",
  card: "glass-card",
} as const

// Enterprise typography utilities
export const typography = {
  display: "text-display",
  hero: "text-hero",
  heading: "text-heading",
  subheading: "text-subheading",
  body: "text-body",
  caption: "text-caption",
  label: "text-label",
  gradient: "text-gradient",
} as const

// Enterprise border radius utilities
export const borderRadius = {
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  "4xl": "rounded-4xl",
  full: "rounded-full",
} as const

// Enterprise z-index utilities
export const zIndex = {
  dropdown: "z-dropdown",
  sticky: "z-sticky",
  fixed: "z-fixed",
  modalBackdrop: "z-modal-backdrop",
  modal: "z-modal",
  popover: "z-popover",
  tooltip: "z-tooltip",
  toast: "z-toast",
  maximum: "z-maximum",
} as const

// Enterprise transition utilities
export const transitions = {
  fast: "duration-fast",
  base: "duration-base",
  slow: "duration-slow",
  spring: "ease-spring",
  bounce: "ease-bounce",
} as const

// Enterprise surface utilities
export const surfaces = {
  0: "surface-0",
  50: "surface-50",
  100: "surface-100",
  200: "surface-200",
  300: "surface-300",
  400: "surface-400",
  500: "surface-500",
  600: "surface-600",
  700: "surface-700",
  800: "surface-800",
  900: "surface-900",
} as const

// Format currency with enterprise style
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format percentage with enterprise style
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Format time duration with enterprise style
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

// Generate enterprise avatar URL with consistent styling
export function generateAvatarUrl(name: string, size = 40): string {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const colors = [
    "4F46E5", // Enterprise primary
    "F59E0B", // Enterprise accent
    "10B981", // Enterprise success
    "EF4444", // Enterprise error
    "3B82F6", // Enterprise info
  ]

  const colorIndex = name.charCodeAt(0) % colors.length
  const color = colors[colorIndex]

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&size=${size}&background=${color}&color=ffffff&font-size=${size / 3}&rounded=true&bold=true`
}

// Enterprise status colors with semantic meaning
export const statusColors = {
  active: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  inactive: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-800 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
    dot: "bg-gray-500",
  },
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  warning: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500",
  },
} as const

// Enterprise gradient combinations
export const gradients = {
  primary: "bg-gradient-to-br from-enterprise-primary to-enterprise-primary-dark",
  accent: "bg-gradient-to-br from-enterprise-accent to-orange-600",
  success: "bg-gradient-to-br from-enterprise-success to-green-600",
  error: "bg-gradient-to-br from-enterprise-error to-red-600",
  info: "bg-gradient-to-br from-enterprise-info to-blue-600",
  glass: "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg",
  darkGlass: "bg-gradient-to-br from-black/20 to-black/5 backdrop-blur-lg",
  sunset: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",
  ocean: "bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600",
  forest: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
} as const

// Interactive state utilities
export const interactive = {
  hover: "hover:scale-105 hover:shadow-enterprise-lg transition-all duration-300",
  press: "active:scale-95 transition-transform duration-150",
  focus: "focus:outline-none focus:ring-2 focus:ring-enterprise-primary focus:ring-offset-2",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
} as const

// Responsive breakpoints for enterprise layouts
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

// Enterprise container utilities
export const containers = {
  xs: "max-w-xs mx-auto px-4",
  sm: "max-w-sm mx-auto px-4",
  md: "max-w-md mx-auto px-4",
  lg: "max-w-lg mx-auto px-4",
  xl: "max-w-xl mx-auto px-4",
  "2xl": "max-w-2xl mx-auto px-4",
  "3xl": "max-w-3xl mx-auto px-4",
  "4xl": "max-w-4xl mx-auto px-4",
  "5xl": "max-w-5xl mx-auto px-4",
  "6xl": "max-w-6xl mx-auto px-4",
  "7xl": "max-w-7xl mx-auto px-4",
  full: "max-w-full mx-auto px-4",
} as const