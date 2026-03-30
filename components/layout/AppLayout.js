'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Monitor, Cpu, Activity, BookOpen, User, Settings, Sparkles, Search, History, Zap, Download } from 'lucide-react'
import { ToastProvider, useToast } from '../ui/ToastProvider'
import { HistoryProvider, useHistory } from '../HistoryProvider'

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
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    const savedTheme = localStorage.getItem('hr_theme') === 'light'
    setIsLightMode(savedTheme)
    if (savedTheme) document.body.setAttribute('data-theme', 'light')

    const handleShortcuts = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return
      
      if (e.key === '/') {
        e.preventDefault()
        document.querySelector('input')?.focus()
      }
      if (e.key === '1') router.push('/')
      if (e.key === '2') router.push('/#quick-tests')
      if (e.key === '3') router.push('/tools')
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
    { name: 'Dashboard', href: '/', icon: Monitor },
    { name: 'TestLab',    href: '/tools', icon: Activity },
    { name: 'ScanLab',    href: '/diagnostics', icon: Cpu },
    { name: 'FixLab',     href: '/fixlab', icon: BookOpen },
    { name: 'Resources',  href: '/resources', icon: Zap },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isMobileMenuOpen])

  return (
    <div className="app-shell">
      <a href="#main" className="skip-nav">Skip to main content</a>

      {/* Hardened Top Navigation V.2 */}
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
               <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>HACKRORE</span>
               <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, marginTop: -2 }}>WORKBENCH</span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="desktop-only glass" style={{ padding: '4px', borderRadius: 12, gap: 4, alignItems: 'center' }}>
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

        {/* Right: Status & Operator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="desktop-only" style={{ position: 'relative' }}>
             <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             <input 
               type="text" 
               placeholder="Search kernel..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && searchQuery && (router.push(`/search?q=${searchQuery}`), setSearchQuery(''))}
               style={{ 
                 background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
                 borderBottom: '1px solid var(--border-bright)',
                 borderRadius: 8, padding: '8px 12px 8px 34px', fontSize: 12, 
                 width: 140, transition: 'all 0.3s var(--ease)', outline: 'none',
                 color: 'var(--text-primary)'
               }}
               className="focus:w-200"
             />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}
              className="hover:border-accent hover:text-accent"
            >
               {isLightMode ? <Monitor size={16} /> : <Sparkles size={16} />}
            </button>

            <div className="desktop-only badge badge-ready" style={{ gap: 8, fontSize: 10 }}>
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-pass)', boxShadow: '0 0 10px var(--status-pass)', animation: 'aura-pulse 2s infinite' }}></div>
               SYNC_READY
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

      {/* Mobile Drawer Reconstruction */}
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
             <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800 }}>NAV_CLUSTER</span>
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
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-bright)' }}>
                 <User size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                 <div style={{ fontSize: 14, fontWeight: 800 }}>Operator_01</div>
                 <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Level 3 Clearance</div>
              </div>
           </div>
           
           <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={toggleTheme} style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontWeight: 700, fontSize: 12 }}>
                 THEME
              </button>
              <button style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontWeight: 700, fontSize: 12 }}>
                 LOGOUT
              </button>
           </div>
        </div>
      </div>
      
      {isMobileMenuOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1900 }} onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Mobile Bottom Bar (Technician Standard) */}
      <div className="mobile-only" style={{ 
        position: 'fixed', bottom: 20, left: 20, right: 20, 
        height: 64, background: 'rgba(10, 11, 18, 0.95)', 
        backdropFilter: 'blur(20px)', border: '1px solid var(--border-bright)',
        borderRadius: 20, zIndex: 1500, display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 12px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
      }}>
         {navItems.map(item => {
           const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
           return (
             <Link key={item.href} href={item.href} style={{ 
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
               color: isActive ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none',
               transition: 'all 0.2s', width: 50
             }}>
                <item.icon size={20} />
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.name.slice(0, 5)}</span>
             </Link>
           )
         })}
      </div>

    </div>
  )
}
