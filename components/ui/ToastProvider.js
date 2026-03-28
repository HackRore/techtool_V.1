'use client'
import { useState, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {toasts.map(t => (
          <div key={t.id} className="animate-in" style={{ 
            minWidth: 300, padding: '16px 20px', borderRadius: 12, 
            background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
            borderLeft: `4px solid ${t.type === 'success' ? 'var(--status-pass)' : t.type === 'error' ? 'var(--status-fail)' : 'var(--accent)'}`
          }}>
            <div style={{ color: t.type === 'success' ? 'var(--status-pass)' : t.type === 'error' ? 'var(--status-fail)' : 'var(--accent)' }}>
              {t.type === 'success' && <CheckCircle size={18} />}
              {t.type === 'error' && <AlertCircle size={18} />}
              {t.type === 'info' && <Info size={18} />}
              {t.type === 'action' && <Zap size={18} />}
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.message}</div>
            <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
               <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
