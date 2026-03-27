'use client'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import KeyboardTest from './KeyboardTest'
import ScreenTest from './ScreenTest'

export default function QuickTestModal({ tool, onClose }) {
  if (!tool) return null

  // Map tool IDs to their components
  const renderTest = () => {
    switch (tool.id) {
      case 'keyboard': return <KeyboardTest inline />
      case 'display':  return <ScreenTest inline />
      default: return (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{tool.icon}</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>{tool.name} Diagnostics</h3>
          <p>This test module is being optimized for inline execution. Please use the full Lab view for advanced diagnostics.</p>
        </div>
      )
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(2, 6, 23, 0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <div className="card-elevated" style={{
        width: '100%',
        maxWidth: tool.id === 'keyboard' ? 1200 : 1000,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px var(--border-bright)',
        background: 'var(--bg-primary)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>{tool.icon}</span>
            <span style={{ fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>{tool.name} Test</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={onClose}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: 8,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
           {renderTest()}
        </div>
      </div>
    </div>
  )
}
