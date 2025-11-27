/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Responsive breakpoints (mobile-first)
      screens: {
        'xs': '320px',      // Small phones
        'sm': '640px',      // Large phones
        'md': '768px',      // Tablets
        'lg': '1024px',     // Desktop (preserved)
        'xl': '1280px',     // Large desktop
        '2xl': '1536px',    // Extra large desktop
      },

      // Fluid typography using clamp()
      fontSize: {
        'fluid-xs': ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.4' }],
        'fluid-sm': ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.6' }],
        'fluid-xl': ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.5' }],
        'fluid-2xl': ['clamp(1.5rem, 5vw, 2rem)', { lineHeight: '1.4' }],
        'fluid-3xl': ['clamp(1.875rem, 6vw, 2.5rem)', { lineHeight: '1.3' }],
        'fluid-4xl': ['clamp(2.25rem, 7vw, 3rem)', { lineHeight: '1.2' }],
      },

      // Fluid spacing
      spacing: {
        'fluid-xs': 'clamp(0.25rem, 0.5vw, 0.5rem)',
        'fluid-sm': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-md': 'clamp(0.75rem, 1.5vw, 1.5rem)',
        'fluid-lg': 'clamp(1rem, 2vw, 2rem)',
        'fluid-xl': 'clamp(1.5rem, 3vw, 3rem)',
        'fluid-2xl': 'clamp(2rem, 4vw, 4rem)',
        'fluid-3xl': 'clamp(3rem, 6vw, 6rem)',
      },

      // Touch-friendly sizing
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '56px',
      },

      minWidth: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '56px',
      },

      // Component heights
      height: {
        'header-mobile': '60px',
        'header-tablet': '70px',
        'header-desktop': '80px',
        'button-sm': 'clamp(32px, 8vw, 40px)',
        'button-md': 'clamp(40px, 10vw, 48px)',
        'button-lg': 'clamp(48px, 12vw, 56px)',
        'input-sm': 'clamp(32px, 8vw, 40px)',
        'input-md': 'clamp(40px, 10vw, 48px)',
        'input-lg': 'clamp(48px, 12vw, 56px)',
        'modal-mobile': '85vh',
        'modal-desktop': '90vh',
        'card-min': 'clamp(120px, 30vh, 200px)',
      },

      // Container max widths
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'modal': 'min(90vw, 672px)',
        'modal-mobile': '100vw',
      },

      // Border radius
      borderRadius: {
        'fluid-sm': 'clamp(0.125rem, 1vw, 0.25rem)',
        'fluid-md': 'clamp(0.25rem, 1.5vw, 0.375rem)',
        'fluid-lg': 'clamp(0.375rem, 2vw, 0.5rem)',
        'fluid-xl': 'clamp(0.5rem, 2.5vw, 0.75rem)',
        'fluid-2xl': 'clamp(0.75rem, 3vw, 1rem)',
        'fluid-3xl': 'clamp(1rem, 4vw, 1.5rem)',
      },

      // Icon sizing
      size: {
        'icon-xs': 'clamp(12px, 3vw, 16px)',
        'icon-sm': 'clamp(16px, 4vw, 20px)',
        'icon-md': 'clamp(20px, 5vw, 24px)',
        'icon-lg': 'clamp(24px, 6vw, 32px)',
        'icon-xl': 'clamp(32px, 8vw, 40px)',
        'record-btn': 'clamp(72px, 18vw, 96px)',
        'record-btn-mobile': 'clamp(64px, 16vw, 88px)',
      },

      // Custom animations
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'swipe-hint': 'swipeHint 2s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -10px, 0)' },
          '70%': { transform: 'translate3d(0, -5px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        swipeHint: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },

      // Custom shadows
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'fab': '0 4px 12px rgba(59, 130, 246, 0.4)',
        'fab-active': '0 2px 8px rgba(59, 130, 246, 0.4)',
        'touch': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },

      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },

      // Custom colors for theme consistency
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },

      // Custom backdrop filters
      backdropBlur: {
        xs: '2px',
      },

      // Custom transforms
      transformOrigin: {
        'bottom': 'bottom center',
        'top': 'top center',
      },

      // Custom transition timing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'swift': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      // Custom transition durations
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },

      // Custom letter spacing
      letterSpacing: {
        'tight': '-0.025em',
        'wide': '0.025em',
        'wider': '0.05em',
      },

      // Custom line heights
      lineHeight: {
        'tight': '1.25',
        'snug': '1.375',
        'relaxed': '1.625',
        'loose': '2',
      },
    },
  },
  plugins: [
    // Plugin for responsive typography
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-fluid-responsive': {
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          lineHeight: theme('lineHeight.relaxed'),
        },
        '.text-fluid-title': {
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          lineHeight: theme('lineHeight.tight'),
        },
        '.text-fluid-heading': {
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          lineHeight: theme('lineHeight.tight'),
        },
        '.text-fluid-body': {
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          lineHeight: theme('lineHeight.relaxed'),
        },
        '.text-fluid-caption': {
          fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
          lineHeight: theme('lineHeight.normal'),
        },
      }
      addUtilities(newUtilities)
    },

    // Plugin for touch-friendly utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-comfortable': {
          minHeight: '48px',
          minWidth: '48px',
        },
        '.touch-large': {
          minHeight: '56px',
          minWidth: '56px',
        },
        '.no-tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
          '-webkit-touch-callout': 'none',
        },
        '.smooth-scroll': {
          '-webkit-overflow-scrolling': 'touch',
          'scroll-behavior': 'smooth',
        },
        '.hide-scrollbar': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.hardware-accelerated': {
          transform: 'translateZ(0)',
          'will-change': 'transform',
        },
      }
      addUtilities(newUtilities)
    },

    // Plugin for safe area utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.safe-area': {
          paddingLeft: 'env(safe-area-inset-left, 0)',
          paddingRight: 'env(safe-area-inset-right, 0)',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        },
        '.safe-area-horizontal': {
          paddingLeft: 'env(safe-area-inset-left, 1rem)',
          paddingRight: 'env(safe-area-inset-right, 1rem)',
        },
        '.safe-area-vertical': {
          paddingTop: 'env(safe-area-inset-top, 1rem)',
          paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
        },
        '.safe-area-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
        },
        '.safe-area-top': {
          paddingTop: 'env(safe-area-inset-top, 1rem)',
        },
      }
      addUtilities(newUtilities)
    },

    // Plugin for mobile-specific utilities
    function({ addUtilities, addComponents }) {
      const newUtilities = {
        '.prevent-zoom': {
          'font-size': '16px !important',
        },
        '.no-bounce': {
          'overscroll-behavior': 'none',
        },
        '.mobile-viewport': {
          width: '100vw',
          'overflow-x': 'hidden',
        },
      }

      const newComponents = {
        '.mobile-container': {
          '@apply max-w-full mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.mobile-card': {
          '@apply bg-white rounded-lg shadow-sm p-4 mb-4': {},
        },
        '.mobile-button': {
          '@apply touch-target px-4 py-3 rounded-lg font-medium transition-colors': {},
        },
        '.mobile-input': {
          '@apply w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none prevent-zoom': {},
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}