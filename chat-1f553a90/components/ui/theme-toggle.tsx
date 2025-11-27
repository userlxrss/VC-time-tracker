"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-11 w-11 rounded-xl transition-all duration-300 hover:bg-vc-primary-50 dark:hover:bg-vc-primary-900/20 group"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={cn(
            "absolute h-5 w-5 transition-all duration-300 ease-in-out",
            isDark
              ? "rotate-90 scale-0 text-vc-primary-600 dark:text-vc-primary-400"
              : "rotate-0 scale-100 text-vc-primary-600"
          )}
        />
        <Moon
          className={cn(
            "absolute h-5 w-5 transition-all duration-300 ease-in-out",
            isDark
              ? "rotate-0 scale-100 text-vc-primary-400"
              : "-rotate-90 scale-0 text-vc-primary-600"
          )}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}