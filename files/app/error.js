'use client'
import { useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Terminal Error:', error)
  }, [error])

  return (
    <AppLayout>
      <div style={{ 
        height: '60vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', textAlign: 'center' 
      }}>
        <div style={{ 
          width: 64, height: 64, background: 'var(--accent-glow)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', marginBottom: 24, border: '1px solid var(--accent)'
        }}>
          <AlertTriangle size={32} style={{ color: 'var(--accent)' }} />
        </div>
        
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Kernel Panic</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 32 }}>
          The diagnostic engine encountered an unexpected runtime exception. 
          Session state has been preserved in LocalStorage.
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            onClick={() => reset()}
            className="btn-accent"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCcw size={16} />
            Hot Reload Engine
          </button>
          
          <Link href="/" style={{ 
            textDecoration: 'none', padding: '10px 24px', borderRadius: 4, 
            border: '1px solid var(--border)', color: 'var(--text-primary)',
            fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Home size={16} />
            Return to Base
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
