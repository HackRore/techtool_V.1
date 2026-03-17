import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'HackRore TechWorkbench — Professional Technician Platform',
  description: 'Browser hardware testing, system diagnostics dashboard, and technician knowledge base. TestLab, ScanLab, FixLab — built for real repair engineers.',
  keywords: 'laptop diagnostics, hardware testing, refurbishment, technician tools, SMART test, dead pixel, keyboard test',
  authors: [{ name: 'Ravindra Pandit Ahire', url: 'https://github.com/HackRore' }],
  creator: 'Ravindra Pandit Ahire',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://hachtool.vercel.app',
    siteName: 'HackRore TechWorkbench',
    title: 'HackRore TechWorkbench — Professional Technician Platform',
    description: 'TestLab · ScanLab · FixLab. Browser hardware tests, diagnostics dashboard, and fix knowledge base.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HackRore TechWorkbench' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HackRore TechWorkbench',
    description: 'Professional technician platform — TestLab, ScanLab, FixLab',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}

