'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const HistoryContext = createContext()

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('hr_diag_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const addHistory = (type, name, result, metadata = {}) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type, // 'hardware', 'software', 'telemetry'
      name,
      result, // 'pass', 'fail', 'warning'
      metadata
    }
    const next = [entry, ...history].slice(0, 50)
    setHistory(next)
    localStorage.setItem('hr_diag_history', JSON.stringify(next))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('hr_diag_history')
  }

  return (
    <HistoryContext.Provider value={{ history, addHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export const useHistory = () => useContext(HistoryContext)
