import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: "Hachtool // Professional Hardware Diagnostics v6.0",
  description: "Minimalist, high-performance diagnostic portal for hardware technicians. Precision telemetry, real-time testing, and validated repair protocols. Professional. Reliable. Fast.",
  openGraph: {
    title: "Hachtool // Professional Hardware Diagnostics",
    description: "Industrial hardware diagnostic and repair portal.",
    url: "https://hachtool.vercel.app",
    siteName: "Hachtool",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: '/favicon.ico',
  }
}

import { Providers } from '../components/Providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body style={{ 
        fontFamily: 'var(--font-sans), var(--font-ui)', 
        background: 'var(--bg-primary)', 
        color: 'var(--text-primary)',
        margin: 0,
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased'
      }}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
