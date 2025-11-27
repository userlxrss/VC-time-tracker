import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ReminderProvider } from '@/contexts/ReminderContext'
import { BreakProvider } from '@/contexts/BreakContext'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { EyeCareModal } from '@/components/reminder/eye-care-modal'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VC Time Tracker',
  description: 'Time tracking system for VC firm with integrated break management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ReminderProvider>
              <BreakProvider>
                {children}
                <EyeCareModal />
                <Toaster />
              </BreakProvider>
            </ReminderProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}