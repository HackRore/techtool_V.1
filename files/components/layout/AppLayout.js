'use client'
import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function AppLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Cleanup body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <div className="app-shell">
      {/* Mobile Header (Hidden on Desktop) */}
      <nav className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, background: 'var(--blue-600)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: 'white' }}>H</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: -0.5, color: 'var(--text-1)' }}>HACKRORE<span style={{ color: 'var(--blue-600)' }}> OS</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', padding: 4 }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Shared Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="mobile-overlay"
        />
      )}
    </div>
  )
}
