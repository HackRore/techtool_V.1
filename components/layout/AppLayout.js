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
      if (e.key === '2') router.push('/#quick-tests')
      if (e.key === '3') router.push('/tools')
      if (e.key === '4') router.push('/fixlab')
      if (e.key === '5') router.push('/resources')
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
    { name: 'Quick Tests', href: '/#quick-tests', icon: Cpu },
    { name: 'Labs Hub', href: '/tools', icon: Activity },
    { name: 'FixLab', href: '/fixlab', icon: BookOpen },
    { name: 'Resources', href: '/resources', icon: Sparkles },
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
      <a href="#main" className="skip-nav">Skip to main content</a>

      {/* Hardened Top Navigation */}
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="nav-logo-sq">H</div>
          
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>HackRore</span>
            <span style={{ width: 1, height: 16, background: 'var(--border)' }}></span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Workbench</span>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <div className="desktop-only" style={{ display: 'flex', gap: 8 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 4, transition: 'color 0.2s' }}
            className="hover:text-accent"
          >
             {isLightMode ? <Monitor size={18} /> : <Sparkles size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-pass)', boxShadow: '0 0 10px var(--status-pass)' }}></div>
             <span className="desktop-only">SYNC_LIVE</span>
          </div>
          
          <div className="desktop-only" style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', fontSize: 11, fontWeight: 700 }}>
             <User size={14} style={{ color: 'var(--accent)' }} />
             <span>Operator_01</span>
          </div>

          <button 
            className="mobile-only"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 6, borderRadius: 6, border: '1px solid var(--border)' }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main" className="main-content">
        {children}
      </main>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div style={{ 
            position: 'fixed', right: 0, top: 0, bottom: 0, 
            width: 300, background: 'var(--bg-primary)', 
            borderLeft: '1px solid var(--border)', zIndex: 1600,
            padding: 40, display: 'flex', flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)'
          }} className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>Navigation</span>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {navItems.map(item => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ 
                      padding: '14px 20px', borderRadius: 8, 
                      textDecoration: 'none', color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      background: isActive ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      fontWeight: 700, display: 'flex', alignItems: 'center', gap: 14,
                      fontSize: 15, transition: 'all 0.2s'
                    }}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 32 }}>
               <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 20 }}>RESOURCES</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}><Settings size={16} /> System Settings</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}><BookOpen size={16} /> Documentation</div>
               </div>
               <div style={{ marginTop: 40, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>HackRore Workbench v1.2</div>
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
