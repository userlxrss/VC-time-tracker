"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
}

export function ThemeToggle({
  className,
  variant = "default",
  size = "md"
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "btn btn-primary animate-pulse",
        size === "sm" && "btn-sm",
        size === "lg" && "btn-lg",
        className
      )}>
        <div className="w-4 h-4 rounded-full bg-current opacity-20" />
      </div>
    )
  }

  const handleThemeChange = () => {
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transition')

    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 400)
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return "Switch to Dark Mode"
      case "dark":
        return "Use System Theme"
      default:
        return "Switch to Light Mode"
    }
  }

  const buttonClasses = cn(
    "btn relative overflow-hidden group",
    variant === "default" && "btn-primary",
    variant === "outline" && "btn-outline",
    variant === "ghost" && "btn-ghost",
    variant === "glass" && "btn-glass",
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    className
  )

  return (
    <button
      className={buttonClasses}
      onClick={handleThemeChange}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-enterprise-primary/20 to-enterprise-accent/20 rounded-lg" />
      </div>

      {/* Icon container with rotation animation */}
      <div className="relative flex items-center justify-center">
        <div className="transition-all duration-500 ease-spring group-hover:rotate-12">
          {getIcon()}
        </div>
      </div>

      {/* Theme indicator dots */}
      <div className="flex gap-1 ml-2">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            theme === "light"
              ? "bg-enterprise-primary scale-125"
              : "bg-current opacity-30"
          )}
        />
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            theme === "dark"
              ? "bg-enterprise-primary scale-125"
              : "bg-current opacity-30"
          )}
        />
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            theme === "system"
              ? "bg-enterprise-primary scale-125"
              : "bg-current opacity-30"
          )}
        />
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150">
          <div className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-150 rounded-full" />
        </div>
      </div>
    </button>
  )
}

// Minimal theme toggle for compact spaces
export function ThemeToggleMinimal({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "w-8 h-8 rounded-lg bg-muted animate-pulse",
        className
      )} />
    )
  }

  const handleThemeChange = () => {
    document.documentElement.classList.add('theme-transition')
    setTheme(theme === "light" ? "dark" : "light")
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 400)
  }

  return (
    <button
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-accent hover:scale-105",
        className
      )}
      onClick={handleThemeChange}
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={cn(
            "absolute inset-0 w-4 h-4 transition-all duration-300",
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 w-4 h-4 transition-all duration-300",
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          )}
        />
      </div>
    </button>
  )
}

// Floating theme toggle with glassmorphism
export function ThemeToggleFloating({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "glass-card w-12 h-12 rounded-full animate-pulse",
        className
      )} />
    )
  }

  const handleThemeChange = () => {
    document.documentElement.classList.add('theme-transition')
    setTheme(theme === "light" ? "dark" : "light")
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 400)
  }

  return (
    <button
      className={cn(
        "glass w-12 h-12 rounded-full flex items-center justify-center group transition-all duration-300 hover:scale-110 hover:shadow-glow animate-float",
        className
      )}
      onClick={handleThemeChange}
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={cn(
            "absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500",
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-180 scale-0"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500",
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-180 scale-0"
          )}
        />
      </div>

      {/* Orbiting dots */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-enterprise-primary rounded-full" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-enterprise-accent rounded-full" />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-enterprise-success rounded-full" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-enterprise-warning rounded-full" />
      </div>
    </button>
  )
}