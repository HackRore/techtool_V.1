'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Monitor, Cpu, Activity, BookOpen, User, Settings, Sparkles } from 'lucide-react'

export default function AppLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Theme & Shortcuts
  useEffect(() => {
    const savedTheme = localStorage.getItem('hr_theme') === 'light'
    setIsLightMode(savedTheme)
    if (savedTheme) document.body.classList.add('light-mode')

    const handleShortcuts = (e) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return
      
      if (e.key === '/') {
        e.preventDefault()
        document.querySelector('input')?.focus()
      }
      if (e.key === '1') router.push('/')
      if (e.key === '2') router.push('/tools')
      if (e.key === '3') router.push('/diagnostics')
      if (e.key === '4') router.push('/fixlab')
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    
    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [router])

  const toggleTheme = () => {
    const next = !isLightMode
    setIsLightMode(next)
    localStorage.setItem('hr_theme', next ? 'light' : 'dark')
    document.body.classList.toggle('light-mode')
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Monitor },
    { name: 'TestLab', href: '/tools', icon: Cpu },
    { name: 'ScanLab', href: '/diagnostics', icon: Activity },
    { name: 'FixLab', href: '/fixlab', icon: BookOpen },
  ]

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
      <a href="#main" className="skip-nav">Skip to content</a>

      {/* Fixed Top Navigation */}
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* HR Logo Mark */}
          <div style={{ 
            width: 28, height: 28, 
            background: 'var(--accent)', 
            borderRadius: 4, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--bg-primary)',
            fontWeight: 900,
            fontSize: 16
          }}>H</div>
          
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>HackRore</span>
            <span style={{ width: 1, height: 16, background: 'var(--border)' }}></span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>TechWorkbench</span>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <div className="desktop-only" style={{ display: 'flex', gap: 4 }}>
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Right: Status & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 4 }}
          >
             {isLightMode ? <Monitor size={18} /> : <Sparkles size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
             <span className="desktop-only">ONLINE</span>
          </div>
          
          <div className="desktop-only" style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
             <User size={14} style={{ color: 'var(--text-muted)' }} />
             <span style={{ fontSize: 12, fontWeight: 600 }}>Operator_01</span>
          </div>

          <button 
            className="mobile-only"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 4 }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main" className="main-content animate-in">
        {children}
      </main>

      {/* Mobile Drawer (Right-side) */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1500, backdropFilter: 'blur(4px)' }} />
          <div style={{ 
            position: 'fixed', right: 0, top: 0, bottom: 0, 
            width: 280, background: 'var(--bg-primary)', 
            borderLeft: '1px solid var(--border)', zIndex: 1600,
            padding: 32, display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navItems.map(item => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ 
                      padding: '12px 16px', borderRadius: 8, 
                      textDecoration: 'none', color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      background: isActive ? 'var(--accent-glow)' : 'transparent',
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12
                    }}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
               <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>RESOURCES</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={14} /> Settings</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={14} /> Documentation</div>
               </div>
               <div style={{ marginTop: 24, fontSize: 10, color: 'var(--text-muted)' }}>TechWorkbench v1.0</div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @media (min-width: 1025px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  )
}
