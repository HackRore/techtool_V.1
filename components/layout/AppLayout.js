'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Monitor, Cpu, Activity, BookOpen, User, Sparkles, Search, Zap } from 'lucide-react'
import { ToastProvider, useToast } from '../ui/ToastProvider'
import { HistoryProvider } from '../HistoryProvider'

export default function AppLayout({ children }) {
  return (
    <ToastProvider>
      <HistoryProvider>
        <LayoutContent>{children}</LayoutContent>
      </HistoryProvider>
    </ToastProvider>
  )
}

function LayoutContent({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('hr_theme') === 'light'
    setIsLightMode(savedTheme)
    if (savedTheme) document.body.setAttribute('data-theme', 'light')

    const handleShortcuts = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return
      
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
    document.body.setAttribute('data-theme', next ? 'light' : 'dark')
  }

  const navItems = [
    { name: 'Dashboard', mobile: 'Home',  href: '/', icon: Monitor },
    { name: 'TestLab',    mobile: 'Tests',  href: '/tools', icon: Activity },
    { name: 'ScanLab',    mobile: 'Scan',   href: '/diagnostics', icon: Cpu },
    { name: 'FixLab',     mobile: 'Fixes',  href: '/fixlab', icon: BookOpen },
    { name: 'Resources',  mobile: 'Tools',  href: '/resources', icon: Zap },
    { name: 'QuickRef',   mobile: 'Ref',    href: '/quickref/bsod', icon: Search },
    { name: 'Jobs',       mobile: 'Jobs',   href: '/jobs', icon: User },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isMobileMenuOpen])

  return (
    <div className="app-shell">
      <a href="#main" className="skip-nav">Skip to main content</a>

      {/* Top Navigation */}
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }} 
            className="hover:scale-105 transition-transform">
            <div style={{ 
              width: 32, height: 32, background: 'var(--accent)', color: 'var(--bg-primary)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13, boxShadow: '0 0 20px var(--accent-glow)'
            }}>HR</div>
            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>HackRore</span>
               <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, marginTop: -2 }}>TechWorkbench // v5.0_DEFINITIVE</span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="desktop-only glass" style={{ padding: '4px', borderRadius: 12, gap: 4, display: 'flex', alignItems: 'center' }}>
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.2s'
                }}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Right: Status & Tech Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}
              className="hover:border-accent hover:text-accent"
            >
               {isLightMode ? <Monitor size={16} /> : <Sparkles size={16} />}
            </button>

            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-pass)', boxShadow: '0 0 10px var(--status-pass)' }}></div>
               SYSTEM_STATUS :: ACTIVE
            </div>

            <button 
              className="mobile-only"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: 'var(--accent-glow)', border: `1px solid var(--accent)`, color: 'var(--accent)', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, fontWeight: 800, fontSize: 11 }}
            >
              MENU
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main" className="main-content animate-in">
        {children}
      </main>

      {/* Mobile Drawer */}
      <div className={`glass ${isMobileMenuOpen ? 'open' : ''}`} style={{ 
        position: 'fixed', right: 0, top: 0, bottom: 0, 
        width: 320, background: 'var(--bg-primary)', 
        borderLeft: '1px solid var(--accent)', zIndex: 2000,
        padding: '40px 32px', display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontWeight: 900, fontSize: 20 }}>HackRore</span>
             <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800 }}>DIAGNOSTIC_PORTAL</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 8, borderRadius: 50 }}>
            <X size={20} />
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
                  padding: '16px 24px', borderRadius: 12, 
                  textDecoration: 'none', color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                  background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                  fontWeight: 800, display: 'flex', alignItems: 'center', gap: 16,
                  fontSize: 16, transition: 'all 0.2s',
                  border: isActive ? 'none' : '1px solid var(--border)'
                }}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 40, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
               <User size={18} style={{ color: 'var(--text-muted)' }} />
               <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Ravindra · Hynet</span>
            </div>
        </div>
      </div>
      
      {isMobileMenuOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1900 }} onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Mobile Bottom Bar (Refined Labels) */}
      <div className="mobile-only" style={{ 
        position: 'fixed', bottom: 20, left: 20, right: 20, 
        height: 64, background: 'rgba(10, 11, 18, 0.95)', 
        backdropFilter: 'blur(20px)', border: '1px solid var(--border-bright)',
        borderRadius: 20, zIndex: 1500, display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 8px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
      }}>
         {navItems.map(item => {
           const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
           return (
             <Link key={item.href} href={item.href} style={{ 
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
               color: isActive ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none',
               transition: 'all 0.2s', minWidth: 40
             }}>
                <item.icon size={18} />
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.mobile}</span>
             </Link>
           )
         })}
      </div>

    </div>
  )
}
