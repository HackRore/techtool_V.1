'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Monitor, Cpu, Activity, BookOpen, User, Sparkles, Search, Zap, CheckCircle2 } from 'lucide-react'
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

  // Unified Nav Items (v8.0 Sync)
  const navItems = [
    { name: 'Dashboard',   mobile: 'Home',    href: '/', icon: Monitor },
    { name: 'Diagnostics', mobile: 'Tests',   href: '/tools', icon: Activity },
    { name: 'System Reports', mobile: 'Reports', href: '/diagnostics', icon: Cpu },
    { name: 'Repair Guides', mobile: 'Guides',  href: '/fixlab', icon: BookOpen },
    { name: 'Toolbox',     mobile: 'Toolbox', href: '/resources', icon: Zap },
    { name: 'Registry',    mobile: 'Jobs',    href: '/jobs', icon: User },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isMobileMenuOpen])

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main" className="skip-nav" style={{ position: 'absolute', top: -100, left: 0, background: 'var(--accent)', color: '#000', padding: '10px 20px', zIndex: 10000 }}>Skip to main content</a>

      {/* Top Navigation: Standardized Labels */}
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 32, height: 32, background: 'var(--accent)', color: '#000',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13
            }}>HT</div>
            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.7px', color: 'var(--text-primary)' }}>Hachtool</span>
               <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.2, marginTop: -2, textTransform: 'uppercase' }}>Professional TechWorkbench</span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav (Aligned with v8.0 Labels) */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navItems.slice(0, 5).map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Right: Status Indicator (Clean) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
               <CheckCircle2 size={12} style={{ color: 'var(--status-pass)' }} />
               SYSTEM_ONLINE
            </div>

            <button 
              className="mobile-only"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: 'var(--bg-secondary)', border: `1px solid var(--border)`, color: 'var(--text-primary)', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontWeight: 800, fontSize: 11 }}
            >
              MENU
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area: Added global padding-bottom for mobile nav clearance */}
      <main id="main" style={{ 
        flex: 1, width: '100%', maxWidth: 'var(--max-width)', 
        margin: '0 auto', padding: '2rem 1.5rem 120px 1.5rem' 
      }}>
        {children}
      </main>

      {/* Mobile Drawer (v8.0 Sync) */}
      <div style={{ 
        position: 'fixed', right: 0, top: 0, bottom: 0, 
        width: 320, background: 'var(--bg-primary)', 
        borderLeft: '1px solid var(--border)', zIndex: 2000,
        padding: '32px', display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s var(--ease)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
           <div style={{ fontWeight: 800, fontSize: 20 }}>Hachtool</div>
           <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 8, borderRadius: 50 }}>
            <X size={20} />
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
                  textDecoration: 'none', color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12,
                  fontSize: 14, transition: 'all 0.2s'
                }}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      {isMobileMenuOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1900 }} onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Mobile Bottom Bar: Unified Terminology */}
      <div className="mobile-only" style={{ 
        position: 'fixed', bottom: 24, left: 16, right: 16, 
        height: 64, background: 'rgba(24, 24, 27, 0.9)', 
        backdropFilter: 'blur(20px)', border: '1px solid var(--border-bright)',
        borderRadius: 16, zIndex: 1500, display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
         {navItems.slice(0, 5).map(item => {
           const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
           return (
             <Link key={item.href} href={item.href} style={{ 
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
               color: isActive ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none',
               transition: 'all 0.2s', minWidth: 40
             }}>
                <item.icon size={18} />
                <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.mobile}</span>
             </Link>
           )
         })}
      </div>

    </div>
  )
}
