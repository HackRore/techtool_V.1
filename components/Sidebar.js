'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Sparkles, 
  Zap, 
  Activity, 
  BookOpen, 
  Scale, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard',   href: '/',           icon: LayoutDashboard },
    { name: 'AI Assistant', href: '/assistant', icon: Sparkles },
    { name: 'TestLab',      href: '/tools',      icon: Zap },
    { name: 'ScanLab',      href: '/diagnostics', icon: Activity },
    { name: 'FixLab',       href: '/fixlab',     icon: BookOpen },
    { name: 'Comparisons',  href: '/compare',    icon: Scale },
  ]

  // Toggle sidebar on link click (mobile)
  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
      width: 'var(--sidebar-width)',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 1200,
      flexShrink: 0,
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Brand Section */}
        <div style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ 
              width: 32, height: 32, 
              background: 'var(--blue-600)', 
              borderRadius: 8, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>H</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: 'var(--text-primary)' }}>HACKRORE</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>TechWorkbench</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={handleLinkClick}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    transition: 'all var(--duration) var(--ease)',
                  }} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Context */}
        <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
             <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>OPERATOR MODE</div>
             <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>v1.0.5 Release</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
