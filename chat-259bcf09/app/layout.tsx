import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VC Time Tracker - Enterprise Dashboard',
    template: '%s | VC Time Tracker'
  },
  description: 'Professional time tracking and portfolio management for venture capital firms. Built with enterprise-grade design and premium user experience.',
  keywords: [
    'VC',
    'Time Tracker',
    'Portfolio Management',
    'Venture Capital',
    'Dashboard',
    'Enterprise',
    'Analytics',
    'Investment Tracking'
  ],
  authors: [{ name: 'VC Time Tracker Team' }],
  creator: 'VC Time Tracker',
  publisher: 'VC Time Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vc-time-tracker.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vc-time-tracker.com',
    title: 'VC Time Tracker - Enterprise Dashboard',
    description: 'Professional time tracking and portfolio management for venture capital firms.',
    siteName: 'VC Time Tracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VC Time Tracker Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VC Time Tracker - Enterprise Dashboard',
    description: 'Professional time tracking and portfolio management for venture capital firms.',
    images: ['/og-image.png'],
    creator: '@vctimetracker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'light dark',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} scroll-smooth`}
    >
      <head>
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Preload critical styles */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css"
          as="style"
        />

        {/* Theme color meta tags */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Prevent flash of incorrect theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var resolvedTheme = theme || systemTheme;

                  if (resolvedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  // Apply smooth transitions after initial load
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(function() {
                      document.documentElement.classList.add('theme-transition');
                    }, 100);
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`
          min-h-screen bg-background text-foreground
          font-sans antialiased
          ${inter.className}
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="vc-time-tracker-theme"
        >
          <div className="relative min-h-screen">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              {/* Light mode background */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-50 via-surface-0 to-surface-100 opacity-50 dark:hidden" />

              {/* Dark mode background */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 hidden dark:block opacity-50" />

              {/* Animated gradient orbs */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-enterprise-primary/20 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-enterprise-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-enterprise-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>

            {/* Main content */}
            <div className="relative flex flex-col min-h-screen">
              {children}
            </div>

            {/* Enterprise toast container */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: `
                  enterprise-card
                  border border-border/50
                  shadow-enterprise-lg
                  backdrop-blur-md
                  font-medium
                `,
                style: {
                  background: 'var(--glass-bg)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                },
                success: {
                  iconTheme: {
                    primary: 'rgb(var(--enterprise-success))',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderLeft: '4px solid rgb(var(--enterprise-success))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'rgb(var(--enterprise-error))',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderLeft: '4px solid rgb(var(--enterprise-error))',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: 'rgb(var(--enterprise-primary))',
                    secondary: '#ffffff',
                  },
                },
              }}
            />

            {/* Google Analytics */}
            <GoogleAnalytics gaId="G-XXXXXXXXXX" />
          </div>
        </ThemeProvider>

        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('performance' in window && 'PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                  }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}