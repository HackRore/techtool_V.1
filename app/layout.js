import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-code',
  display: 'swap',
})

export const metadata = {
  title: "HackRore TechWorkbench | Advanced Hardware Diagnostics",
  description: "The professional-grade companion for technicians. AI-powered hardware telemetry, precision testlab, and validated repair intelligence hub. Precision. Speed. Results.",
  openGraph: {
    title: "HackRore TechWorkbench",
    description: "AI-powered technician diagnostic platform",
    url: "https://hachtool.vercel.app",
    siteName: "HackRore",
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body style={{ fontFamily: 'var(--font-heading), var(--font-ui)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
