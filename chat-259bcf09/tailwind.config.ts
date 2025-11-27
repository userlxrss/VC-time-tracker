import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Enterprise Color Palette
        enterprise: {
          primary: {
            DEFAULT: "rgb(var(--enterprise-primary))",
            light: "rgb(var(--enterprise-primary-light))",
            dark: "rgb(var(--enterprise-primary-dark))",
          },
          secondary: "rgb(var(--enterprise-secondary))",
          accent: "rgb(var(--enterprise-accent))",
          success: "rgb(var(--enterprise-success))",
          warning: "rgb(var(--enterprise-warning))",
          error: "rgb(var(--enterprise-error))",
          info: "rgb(var(--enterprise-info))",
        },
        // Surface Colors
        surface: {
          0: "rgb(var(--surface-0))",
          50: "rgb(var(--surface-50))",
          100: "rgb(var(--surface-100))",
          200: "rgb(var(--surface-200))",
          300: "rgb(var(--surface-300))",
          400: "rgb(var(--surface-400))",
          500: "rgb(var(--surface-500))",
          600: "rgb(var(--surface-600))",
          700: "rgb(var(--surface-700))",
          800: "rgb(var(--surface-800))",
          900: "rgb(var(--surface-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Enterprise radius system
        xs: "var(--radius-xs)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        "4xl": "var(--radius-4xl)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        sans: ["var(--font-primary)", "system-ui", "sans-serif"],
        display: ["var(--font-secondary)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      spacing: {
        // Enterprise spacing system (8px grid)
        "0": "var(--space-0)",
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "16": "var(--space-16)",
        "20": "var(--space-20)",
        "24": "var(--space-24)",
        "32": "var(--space-32)",
      },
      boxShadow: {
        // Enterprise shadow system
        "enterprise": "var(--shadow-enterprise)",
        "enterprise-lg": "var(--shadow-enterprise-lg)",
        "glass": "var(--shadow-glass)",
        "glow": "var(--shadow-glow)",
        // Glow effects
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-success": "var(--shadow-glow-success)",
        "glow-warning": "var(--shadow-glow-warning)",
        "glow-error": "var(--shadow-glow-error)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      transitionDuration: {
        // Enterprise animation timing
        "fast": "var(--transition-fast)",
        "base": "var(--transition-base)",
        "slow": "var(--transition-slow)",
      },
      transitionTimingFunction: {
        // Enterprise easing functions
        "spring": "var(--transition-spring)",
        "bounce": "var(--transition-bounce)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Enterprise animations
        "fade-in": "fadeIn var(--transition-base) ease-out",
        "slide-up": "slideUp var(--transition-slow) ease-out",
        "slide-down": "slideDown var(--transition-slow) ease-out",
        "slide-left": "slideLeft var(--transition-slow) ease-out",
        "slide-right": "slideRight var(--transition-slow) ease-out",
        "scale-in": "scaleIn var(--transition-base) ease-out",
        "bounce-subtle": "bounceSubtle 2s infinite",
        "pulse-slow": "pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Enterprise keyframes
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          from: {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideLeft: {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideRight: {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        bounceSubtle: {
          "0%, 20%, 50%, 80%, 100%": {
            transform: "translateY(0)",
          },
          "40%": {
            transform: "translateY(-4px)",
          },
          "60%": {
            transform: "translateY(-2px)",
          },
        },
        pulseSlow: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      zIndex: {
        // Enterprise z-index scale
        "dropdown": "var(--z-dropdown)",
        "sticky": "var(--z-sticky)",
        "fixed": "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        "modal": "var(--z-modal)",
        "popover": "var(--z-popover)",
        "tooltip": "var(--z-tooltip)",
        "toast": "var(--z-toast)",
        "maximum": "var(--z-maximum)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Enterprise plugin for additional utilities
    function({ addUtilities, addComponents, theme }) {
      addComponents({
        '.glass-card': {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-glass)',
          borderRadius: '1rem',
          padding: '1.5rem',
        },
        '.enterprise-card': {
          borderRadius: '0.75rem',
          border: '1px solid rgb(var(--border))',
          backgroundColor: 'rgb(var(--card))',
          color: 'rgb(var(--card-foreground))',
          boxShadow: 'var(--shadow-enterprise)',
          transition: 'all var(--transition-base)',
        },
        '.enterprise-card:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-enterprise-lg)',
        },
      });

      addUtilities({
        '.text-gradient': {
          background: 'linear-gradient(135deg, rgb(var(--enterprise-primary)), rgb(var(--enterprise-accent)))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.backdrop-blur-xs': {
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        },
        '.backdrop-blur-sm': {
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        },
        '.backdrop-blur-lg': {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      });
    },
  ],
} satisfies Config

export default config