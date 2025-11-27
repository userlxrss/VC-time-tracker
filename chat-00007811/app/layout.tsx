import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Premium Dark Mode Dashboard',
  description: 'Luxury dark mode interface with glass morphism effects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className + " bg-[#0a0e1a] text-white"}>
        {children}
      </body>
    </html>
  )
}