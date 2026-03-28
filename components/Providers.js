'use client'
import { ToastProvider } from './ui/ToastProvider'
import { HistoryProvider } from './HistoryProvider'

export function Providers({ children }) {
  return (
    <HistoryProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </HistoryProvider>
  )
}
