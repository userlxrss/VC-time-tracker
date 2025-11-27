"use client"

import * as React from "react"
import { ThemeToggle, ThemeToggleMinimal, ThemeToggleFloating } from "./theme-toggle"
import {
  cn,
  enterpriseColors,
  animations,
  glass,
  typography,
  statusColors,
  gradients,
  borderRadius,
  shadows
} from "@/lib/utils"
import {
  Moon,
  Sun,
  Zap,
  Target,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  ChevronRight
} from "lucide-react"

export function DesignShowcase() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading Design System...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-sticky glass border-b border-border/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-enterprise-primary to-enterprise-primary-dark flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-heading font-bold text-foreground">
                  VC Time Tracker
                </h1>
                <p className="text-caption text-muted-foreground">
                  Enterprise Design System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className={cn(
              "text-hero font-bold bg-gradient-to-r from-enterprise-primary to-enterprise-accent bg-clip-text text-transparent",
              "animate-slide-up"
            )}>
              Enterprise-Grade Design System
            </h1>
            <p className={cn(
              "text-body text-muted-foreground max-w-2xl mx-auto",
              "animate-slide-up",
              "animation-delay-200"
            )}>
              A comprehensive design system built for Fortune 500 SaaS applications.
              Features premium components, smooth animations, and seamless dark mode support.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 animate-slide-up animation-delay-400">
            <ThemeToggle variant="outline" size="lg" />
            <ThemeToggleFloating />
            <ThemeToggleMinimal />
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Color Palette</h2>
            <p className="text-caption text-muted-foreground">
              Professional colors with accessibility in mind
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Primary Colors */}
            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Primary</h3>
              <div className="space-y-2">
                <div
                  className="h-20 rounded-lg shadow-enterprise"
                  style={{ backgroundColor: enterpriseColors.primary.light }}
                />
                <div className="space-y-1">
                  <p className="text-caption font-mono">Primary</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {enterpriseColors.primary.light}
                  </p>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Success</h3>
              <div className="space-y-2">
                <div
                  className="h-20 rounded-lg shadow-enterprise"
                  style={{ backgroundColor: enterpriseColors.success.light }}
                />
                <div className="space-y-1">
                  <p className="text-caption font-mono">Success</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {enterpriseColors.success.light}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Warning</h3>
              <div className="space-y-2">
                <div
                  className="h-20 rounded-lg shadow-enterprise"
                  style={{ backgroundColor: enterpriseColors.warning.light }}
                />
                <div className="space-y-1">
                  <p className="text-caption font-mono">Warning</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {enterpriseColors.warning.light}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Error</h3>
              <div className="space-y-2">
                <div
                  className="h-20 rounded-lg shadow-enterprise"
                  style={{ backgroundColor: enterpriseColors.error.light }}
                />
                <div className="space-y-1">
                  <p className="text-caption font-mono">Error</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {enterpriseColors.error.light}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Typography</h2>
            <p className="text-caption text-muted-foreground">
              Modern fonts with proper hierarchy
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h1 className={typography.display}>Display Text</h1>
              <p className="text-xs text-muted-foreground font-mono">text-display</p>
            </div>

            <div className="space-y-2">
              <h1 className={typography.hero}>Hero Heading</h1>
              <p className="text-xs text-muted-foreground font-mono">text-hero</p>
            </div>

            <div className="space-y-2">
              <h2 className={typography.heading}>Section Heading</h2>
              <p className="text-xs text-muted-foreground font-mono">text-heading</p>
            </div>

            <div className="space-y-2">
              <h3 className={typography.subheading}>Subheading</h3>
              <p className="text-xs text-muted-foreground font-mono">text-subheading</p>
            </div>

            <div className="space-y-2">
              <p className={typography.body}>
                Body text is the most common text size used throughout the application.
                It provides excellent readability with optimal line height and spacing.
              </p>
              <p className="text-xs text-muted-foreground font-mono">text-body</p>
            </div>

            <div className="space-y-2">
              <p className={typography.caption}>
                Caption text is used for secondary information and metadata.
              </p>
              <p className="text-xs text-muted-foreground font-mono">text-caption</p>
            </div>

            <div className="space-y-2">
              <p className={typography.label}>
                Label Text
              </p>
              <p className="text-xs text-muted-foreground font-mono">text-label</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Components</h2>
            <p className="text-caption text-muted-foreground">
              Premium interactive components
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Buttons</h3>
              <div className="space-y-3">
                <button className="btn btn-primary w-full">
                  Primary Action
                </button>
                <button className="btn btn-secondary w-full">
                  Secondary Action
                </button>
                <button className="btn btn-outline w-full">
                  Outline Action
                </button>
                <button className="btn btn-ghost w-full">
                  Ghost Action
                </button>
                <button className="btn btn-glass w-full">
                  Glass Action
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Cards</h3>
              <div className="space-y-3">
                <div className="enterprise-card p-4">
                  <h4 className="font-semibold mb-2">Enterprise Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional card with shadow effects
                  </p>
                </div>

                <div className="glass-card">
                  <h4 className="font-semibold mb-2">Glass Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Glassmorphism effect with backdrop blur
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-sm">Inactive</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Animations</h2>
            <p className="text-caption text-muted-foreground">
              Smooth, performance-optimized animations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-lg bg-enterprise-primary animate-fade-in" />
              <p className="text-xs font-mono">Fade In</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-lg bg-enterprise-accent animate-slide-up" />
              <p className="text-xs font-mono">Slide Up</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-lg bg-enterprise-success animate-scale-in" />
              <p className="text-xs font-mono">Scale In</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-lg bg-enterprise-warning animate-bounce-subtle" />
              <p className="text-xs font-mono">Bounce</p>
            </div>
          </div>
        </section>

        {/* Glassmorphism Examples */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Glassmorphism</h2>
            <p className="text-caption text-muted-foreground">
              Modern glass effects with backdrop blur
            </p>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-enterprise-primary via-enterprise-accent to-enterprise-success">
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative p-8 h-full flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <div className="glass p-6 rounded-xl">
                  <Target className="w-8 h-8 mb-3 text-enterprise-primary" />
                  <h3 className="font-semibold mb-2">Precision Targeting</h3>
                  <p className="text-sm opacity-90">
                    Advanced portfolio management tools
                  </p>
                </div>

                <div className="glass p-6 rounded-xl">
                  <TrendingUp className="w-8 h-8 mb-3 text-enterprise-success" />
                  <h3 className="font-semibold mb-2">Growth Analytics</h3>
                  <p className="text-sm opacity-90">
                    Real-time performance tracking
                  </p>
                </div>

                <div className="glass p-6 rounded-xl">
                  <Shield className="w-8 h-8 mb-3 text-enterprise-accent" />
                  <h3 className="font-semibold mb-2">Enterprise Security</h3>
                  <p className="text-sm opacity-90">
                    Bank-level data protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Dashboard Preview</h2>
            <p className="text-caption text-muted-foreground">
              Sample dashboard components
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="enterprise-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-enterprise-primary/10">
                  <BarChart3 className="w-6 h-6 text-enterprise-primary" />
                </div>
                <span className="badge badge-success">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">$2.4M</h3>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            </div>

            <div className="enterprise-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-enterprise-accent/10">
                  <Clock className="w-6 h-6 text-enterprise-accent" />
                </div>
                <span className="badge badge-warning">+8.2%</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">1,247</h3>
              <p className="text-sm text-muted-foreground">Hours Tracked</p>
            </div>

            <div className="enterprise-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-enterprise-success/10">
                  <Users className="w-6 h-6 text-enterprise-success" />
                </div>
                <span className="badge badge-primary">Active</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">48</h3>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="enterprise-card p-6">
            <h3 className="text-subheading font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-enterprise-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Portfolio analysis completed</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-enterprise-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New investment opportunity identified</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-enterprise-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Weekly report generated</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-heading">Interactive Elements</h2>
            <p className="text-caption text-muted-foreground">
              Hover, click, and interact with components
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Interactive Cards</h3>
              <div className="space-y-3">
                <div className="enterprise-card-interactive p-4 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Hover me!</h4>
                      <p className="text-sm text-muted-foreground">
                        This card lifts and scales on hover
                      </p>
                    </div>
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-subheading font-semibold">Status States</h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${statusColors.active.bg} ${statusColors.active.text} ${statusColors.active.border} border`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Active Project</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${statusColors.pending.bg} ${statusColors.pending.text} ${statusColors.pending.border} border`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Pending Review</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${statusColors.error.bg} ${statusColors.error.text} ${statusColors.error.border} border`}>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Action Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-border/50 mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-heading font-bold">
              Built with Enterprise Standards
            </h3>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              This design system follows Fortune 500 SaaS standards with accessibility,
              performance, and user experience at its core.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>WCAG 2.1 AA Compliant</span>
              <span>•</span>
              <span>Performance Optimized</span>
              <span>•</span>
              <span>Dark Mode Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}