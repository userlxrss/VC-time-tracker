/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Premium Dark Mode Color Palette
      colors: {
        // Background Layers
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#0f141f',
        'bg-tertiary': '#151923',
        'bg-quaternary': '#1a1f2e',
        'bg-overlay': 'rgba(10, 14, 26, 0.85)',

        // Surface Colors
        'surface-elevated': '#1f2937',
        'surface-glass': 'rgba(31, 41, 55, 0.6)',
        'surface-glass-border': 'rgba(255, 255, 255, 0.1)',

        // Text Colors
        'text-primary': '#ffffff',
        'text-secondary': '#cbd5e1',
        'text-tertiary': '#94a3b8',
        'text-inverse': '#0a0e1a',

        // Accent Colors
        'accent-blue': '#3b82f6',
        'accent-blue-light': '#60a5fa',
        'accent-blue-dark': '#2563eb',
        'accent-purple': '#8b5cf6',
        'accent-green': '#10b981',
        'accent-orange': '#f59e0b',
        'accent-red': '#ef4444',

        // Border Colors
        'border-subtle': 'rgba(255, 255, 255, 0.05)',
        'border-medium': 'rgba(255, 255, 255, 0.1)',
        'border-strong': 'rgba(255, 255, 255, 0.15)',
        'border-accent': 'rgba(59, 130, 246, 0.2)',
        'border-focus': 'rgba(59, 130, 246, 0.5)',
      },

      // Box Shadows
      boxShadow: {
        'premium-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'premium-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
        'premium-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-strong': '0 0 40px rgba(59, 130, 246, 0.25)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.15)',
      },

      // Animation Durations
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },

      // Animation Timing Functions
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Backdrop Filters
      backdropBlur: {
        '4xl': '72px',
      },

      // Custom Border Radius
      borderRadius: {
        'premium': '8px',
        'premium-lg': '12px',
      },

      // Custom Gradients
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
        'ai-gradient': 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.05), transparent, rgba(139, 92, 246, 0.05), transparent)',
        'card-gradient': 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-quaternary))',
        'progress-gradient': 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
      },

      // Keyframe Animations
      keyframes: {
        'rotate': {
          'to': {
            transform: 'rotate(360deg)',
          },
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
          },
        },
      },

      // Animation Utilities
      animation: {
        'rotate': 'rotate 20s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },

      // Custom Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Custom Typography
      fontFamily: {
        'premium': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      // Custom Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Plugin for glass morphism effects
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          background: 'rgba(31, 41, 55, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
        },
        '.glass-hover': {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.glass-hover:hover': {
          background: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transform: 'translateY(-2px)',
        },
        '.premium-shadow': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
        },
        '.glow-border': {
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
        },
        '.glow-border-hover:hover': {
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.25)',
        },
      });
    },

    // Plugin for dark mode utilities
    function({ addVariant }) {
      addVariant('dark', '&.dark');
      addVariant('dark-hover', '&.dark:hover');
      addVariant('dark-focus', '&.dark:focus');
    },
  ],
}