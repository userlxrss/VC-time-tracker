// ===================================
// PREMIUM DARK MODE COMPONENT GUIDELINES
// ===================================

// This file contains implementation examples and best practices
// for creating premium dark mode components with luxury aesthetics

import React, { useState } from 'react';

// ===================================
// SIDEBAR NAVIGATION COMPONENTS
// ===================================

export const SidebarItem = ({
  icon,
  label,
  isActive,
  onClick,
  badge = null,
  variant = 'default'
}) => {
  const baseClasses = "relative flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-all duration-200 group";

  const variants = {
    default: isActive
      ? "bg-gradient-to-r from-blue-600/10 to-cyan-600/5 text-blue-400 border border-blue-500/20"
      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
    compact: isActive
      ? "text-blue-400 border-l-2 border-blue-500 bg-slate-800/30"
      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/20"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {/* Icon with subtle glow when active */}
      <span className={`mr-3 text-lg transition-all duration-200 ${
        isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:text-slate-300'
      }`}>
        {icon}
      </span>

      {/* Label */}
      <span className={`font-medium transition-all duration-200 ${
        isActive ? 'text-slate-100' : 'group-hover:text-slate-200'
      }`}>
        {label}
      </span>

      {/* Active indicator - subtle dot instead of heavy box */}
      {isActive && variant === 'default' && (
        <div className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
      )}

      {/* Badge */}
      {badge && (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full border border-slate-600/30">
          {badge}
        </span>
      )}

      {/* Subtle hover underline effect */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </button>
  );
};

// ===================================
// PREMIUM CARD COMPONENTS
// ===================================

export const PremiumCard = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false
}) => {
  const variants = {
    default: "bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm",
    glass: "bg-slate-900/30 border border-slate-700/30 backdrop-blur-md",
    elevated: "bg-slate-900/80 border border-slate-600/50 shadow-xl",
    gradient: "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50"
  };

  const hoverEffects = hover ? "hover:border-slate-600 hover:shadow-2xl hover:-translate-y-1 hover:bg-slate-900/70" : "";
  const glowEffect = glow ? "shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "shadow-lg";

  return (
    <div className={`
      relative overflow-hidden rounded-2xl transition-all duration-300
      ${variants[variant]}
      ${glowEffect}
      ${hoverEffects}
      ${className}
    `}>
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 animate-pulse" />
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-50" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// ===================================
// LUXURY BUTTON COMPONENTS
// ===================================

export const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  loading = false
}) => {
  const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg"
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-cyan-600 text-white
      shadow-[0_4px_20px_rgba(59,130,246,0.3)]
      hover:shadow-[0_6px_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5
      active:translate-y-0
    `,
    secondary: `
      bg-slate-800/50 text-slate-200 border border-slate-600/50
      hover:bg-slate-700/50 hover:border-slate-500/50 hover:-translate-y-0.5
    `,
    luxury: `
      bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
      text-slate-100 border border-slate-600/30
      shadow-[0_4px_20px_rgba(0,0,0,0.3)]
      hover:shadow-[0_6px_30px_rgba(0,0,0,0.5)]
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-600/20 before:to-purple-600/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity
    `,
    ghost: `
      text-slate-400 hover:text-slate-200 hover:bg-slate-800/30
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {/* Shimmer effect for luxury feel */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

// ===================================
// ELEGANT INPUT COMPONENTS
// ===================================

export const ElegantInput = ({
  label,
  placeholder,
  type = 'text',
  error = '',
  icon = null,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative group">
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            focused ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'
          }`}>
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 rounded-xl border bg-slate-900/50 text-slate-100
            placeholder-slate-500 transition-all duration-200
            ${icon ? 'pl-12' : ''}
            ${focused
              ? 'border-blue-500/50 bg-slate-900/70 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
              : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-900/60'
            }
            ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Subtle focus ring */}
        {focused && (
          <div className="absolute inset-0 rounded-xl border-2 border-blue-400/20 pointer-events-none" />
        )}

        {/* Decorative corner accent */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-blue-600/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1 animate-slide-in-up">
          <span className="text-xs">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

// ===================================
// DATA VISUALIZATION COMPONENTS
// ===================================

export const DarkChart = ({ data, type = 'line', height = 300 }) => {
  return (
    <div className="relative bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
      {/* Chart background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(148 163 184 / 0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Chart content area */}
      <div className="relative z-10" style={{ height }}>
        <div className="flex items-center justify-center h-full text-slate-500">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm">Chart Component</p>
            <p className="text-xs text-slate-600 mt-1">Dark theme optimized</p>
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export const StatMetric = ({ label, value, change, icon, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-600/20 to-cyan-600/20',
    green: 'from-green-600/20 to-emerald-600/20',
    purple: 'from-purple-600/20 to-pink-600/20',
    orange: 'from-orange-600/20 to-amber-600/20'
  };

  return (
    <div className="relative group">
      <div className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-300
        bg-gradient-to-br ${colors[color]}
        border border-slate-700/30 backdrop-blur-sm
        hover:border-slate-600/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        hover:-translate-y-1
      `}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-600/30">
              <div className="text-slate-300">{icon}</div>
            </div>
            {change && (
              <div className={`px-2 py-1 text-xs font-medium rounded-lg ${
                change > 0
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-100">{value}</p>
          </div>
        </div>

        {/* Subtle corner decoration */}
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/5 to-transparent rounded-tl-full opacity-50" />
      </div>
    </div>
  );
};

// ===================================
// PREMIUM FORM COMPONENTS
// ===================================

export const ElegantSelect = ({ label, options, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3.5 rounded-xl border bg-slate-900/50 text-slate-100 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-900/60 transition-all duration-200 flex items-center justify-between"
        >
          <span>{value || 'Select option'}</span>
          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-2 bg-slate-900/95 border border-slate-700/50 rounded-xl backdrop-blur-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 first:rounded-t-xl last:rounded-b-xl transition-colors duration-150"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===================================
// PREMIUM TOOLTIP COMPONENT
// ===================================

export const PremiumTooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 bg-slate-900/95 border border-slate-700/50 rounded-lg backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.4)] animate-slide-in-up ${positions[position]}`}>
          <div className="text-xs font-medium text-slate-200">{content}</div>
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-slate-900/95 border border-slate-700/50 transform rotate-45 ${
            position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0' :
            position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0' :
            position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-r-0 border-t-0' :
            'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-l-0 border-b-0'
          }`} />
        </div>
      )}
    </div>
  );
};

// ===================================
// USAGE EXAMPLES
// ===================================

export const PremiumShowcase = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'analytics', icon: '📈', label: 'Analytics', badge: '3' },
    { id: 'insights', icon: '🤖', label: 'AI Insights' },
    { id: 'projects', icon: '📁', label: 'Projects' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Premium Dark Mode
          </h1>
          <p className="text-slate-400 text-lg">
            Luxury UI components with depth and elegance
          </p>
        </header>

        {/* Sidebar Navigation Example */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <PremiumCard variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Navigation</h3>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeNav === item.id}
                    badge={item.badge}
                    onClick={() => setActiveNav(item.id)}
                  />
                ))}
              </nav>
            </PremiumCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatMetric
                label="Total Revenue"
                value="$48,574"
                change={12.5}
                icon="💰"
                color="green"
              />
              <StatMetric
                label="Active Users"
                value="2,847"
                change={8.2}
                icon="👥"
                color="blue"
              />
              <StatMetric
                label="Performance"
                value="94.2%"
                change={-2.1}
                icon="⚡"
                color="orange"
              />
            </div>

            {/* Interactive Elements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumCard className="p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-6">Form Elements</h3>
                <div className="space-y-4">
                  <ElegantInput
                    label="Email Address"
                    placeholder="Enter your email"
                    type="email"
                    icon="✉️"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <ElegantSelect
                    label="Category"
                    options={['Option 1', 'Option 2', 'Option 3']}
                    value={selectValue}
                    onChange={setSelectValue}
                  />
                  <div className="flex gap-3 pt-4">
                    <GlowButton variant="primary">Save Changes</GlowButton>
                    <GlowButton variant="secondary">Cancel</GlowButton>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard variant="elevated" className="p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-6">Button Variants</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <GlowButton variant="primary" size="sm">Primary</GlowButton>
                    <GlowButton variant="luxury" size="sm">Luxury</GlowButton>
                    <GlowButton variant="secondary" size="sm">Secondary</GlowButton>
                    <GlowButton variant="ghost" size="sm">Ghost</GlowButton>
                  </div>
                  <div className="flex gap-3">
                    <GlowButton variant="primary" loading>Loading</GlowButton>
                    <GlowButton variant="luxury" disabled>Disabled</GlowButton>
                  </div>
                </div>
              </PremiumCard>
            </div>

            {/* Data Visualization */}
            <PremiumCard glow className="p-6">
              <h3 className="text-xl font-semibold text-slate-200 mb-6">Analytics Dashboard</h3>
              <DarkChart height={250} />
            </PremiumCard>
          </div>
        </section>
      </div>
    </div>
  );
};