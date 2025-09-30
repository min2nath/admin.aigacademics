// src/app/(admin)/layout.tsx
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import DashboardNavbar from '@/components/DashboardNavbar'
import { Poppins, Francois_One } from 'next/font/google'
import '@/styles/globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const francoisOne = Francois_One({
  variable: '--font-francois',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AIG Event Software',
  description: 'Admin panel for managing AIG Events',
  icons: {
    icon: '/favicon.ico',       // main favicon
    shortcut: '/favicon.ico',   // shortcut for browser
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Optional extra favicons for multiple devices */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
      </head>
      <body
        className={`${poppins.variable} ${francoisOne.variable} font-sans antialiased flex h-screen flex-col bg-background text-foreground`}
      >
        {/* Navbar at the top */}
        <DashboardNavbar />

        {/* Main content area: sidebar + page */}
        <div className="flex flex-1">
          <Sidebar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
