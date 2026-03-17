import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

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
  title: 'HackRore TechWorkbench — Hardware Diagnostic Platform',
  description: 'Browser hardware testing, system diagnostics, and technician fix guide.',
  authors: [{ name: 'Ravindra Pandit Ahire', url: 'https://github.com/HackRore' }],
  icons: { icon: '/favicon.svg' },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
