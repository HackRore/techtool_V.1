'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Monitor, Cpu, Activity, BookOpen, User, Sparkles, Search, Zap, CheckCircle2, ChevronDown, Wrench } from 'lucide-react'
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

  // focusMode: Hide sidebars during active tests (thetest.com style)
  const isFocusMode = pathname.startsWith('/tools/') && pathname.length > 7

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

  // Unified Nav Items (v15.0 Industrial Rebrand)
  const navItems = [
    { name: 'Dashboard',    mobile: 'Home',    href: '/', icon: Monitor },
    { name: 'Diagnostics',   mobile: 'Tests',   href: '/tools', icon: Activity },
    { name: 'Analytics',    mobile: 'Reports', href: '/diagnostics', icon: Cpu },
    { name: 'Technical Lib', mobile: 'Guides',  href: '/fixlab', icon: BookOpen },
    { name: 'Toolbox',      mobile: 'Toolbox', href: '/resources', icon: Wrench },
    { name: 'Job Index',    mobile: 'Jobs',    href: '/jobs', icon: User },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isMobileMenuOpen])

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <a href="#main" className="skip-nav" style={{ position: 'absolute', top: -100, left: 0, background: 'var(--accent)', color: '#000', padding: '10px 20px', zIndex: 10000 }}>Skip to main content</a>

      {/* Industrial Header (v15.0 Rebrand) */}
      <header className="desktop-only" style={{ 
        height: 80, background: '#FFF', borderBottom: '1px solid var(--border)', 
        position: 'sticky', top: 0, zIndex: 2000, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 48
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, background: 'var(--accent)', color: '#FFF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>HT</div>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#222', letterSpacing: -1 }}>Hachtool</span>
        </Link>
        
        {/* Global Hub Search (Always points to Technical Library) */}
        <form 
          style={{ flex: 1, position: 'relative', maxWidth: 600 }}
          onSubmit={(e) => {
            e.preventDefault()
            const query = e.target.search.value
            window.location.href = `/fixlab?query=${encodeURIComponent(query)}`
          }}
        >
          <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} size={18} />
          <input 
            name="search"
            type="text" 
            placeholder="Search diagnostic protocols, repair wikis, or hardware modules..." 
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 100, border: '1px solid #EEE', background: '#F9FAFB', fontSize: 13, outline: 'none', fontWeight: 500 }}
          />
        </form>

        <nav style={{ display: 'flex', gap: 28 }}>
          {['Diagnostics', 'Pro_Wiki', 'Reports'].map(item => (
            <div key={item} style={{ fontSize: 13, fontWeight: 800, color: '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {item} <ChevronDown size={12} opacity={0.5} />
            </div>
          ))}
          <button className="btn-primary" style={{ background: 'var(--text-primary)', color: '#FFF', padding: '10px 24px', borderRadius: 8, fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: 12 }}>REPORT_PORTAL</button>
        </nav>
      </header>

      {/* Focus-Aware Multi-Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isFocusMode ? '1fr' : 'minmax(0, 260px) 1fr minmax(0, 320px)', 
        maxWidth: 1600, margin: '0 auto', width: '100%',
        minHeight: 'calc(100vh - 80px)',
        transition: 'all 0.4s var(--ease)'
      }}>
        
        {/* Left Column: Fixed Protocol Navigation (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="desktop-only animate-in" style={{ 
            borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', 
            padding: '32px 24px', position: 'sticky', top: 80, height: 'calc(100vh - 80px)', overflowY: 'auto'
          }}>
            <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 20, textTransform: 'uppercase' }}>Operational Suite</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map(item => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    style={{ 
                      padding: '12px 16px', borderRadius: 10, textDecoration: 'none',
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      fontWeight: isActive ? 900 : 600, fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 12, transition: '0.2s'
                    }}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Middle Column: Main Content (Full width in Focus Mode) */}
        <main id="main" style={{ padding: isFocusMode ? '0' : '40px 48px', background: '#FFF' }}>
          {children}
          
          {!isFocusMode && (
            <footer style={{ marginTop: 80, borderTop: '1px solid #EEE', padding: '64px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
               <div>
                  <h5 style={{ fontWeight: 900, marginBottom: 16, fontSize: 14 }}>DIAGNOSTICS</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#666' }}>
                     <span>Active Web Tests</span>
                     <span>Hardware Buffers</span>
                     <span>Telemetry Sync</span>
                  </div>
               </div>
               <div>
                  <h5 style={{ fontWeight: 900, marginBottom: 16, fontSize: 14 }}>RESOURCES</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#666' }}>
                     <span>Field Repair Wiki</span>
                     <span>Master Scan Scripts</span>
                     <span>Technical Schematics</span>
                  </div>
               </div>
               <div>
                  <h5 style={{ fontWeight: 900, marginBottom: 16, fontSize: 14 }}>HYNET PRECISION</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#666' }}>
                     <span>v15.0 Stable Release</span>
                     <span>Laboratory Protocols</span>
                     <span>Contact Engineering</span>
                  </div>
               </div>
            </footer>
          )}
        </main>

        {/* Right Column: Contextual HUD (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="desktop-only animate-in" style={{ 
            borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)', 
            padding: '32px 24px', position: 'sticky', top: 80, height: 'calc(100vh - 80px)', overflowY: 'auto'
          }}>
             <div className="card" style={{ padding: 24, background: '#FFF', border: '1px solid var(--border)', borderRadius: 20, marginBottom: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', marginBottom: 8, letterSpacing: 1 }}>SYSTEM_SNAPSHOT</div>
                <h5 style={{ marginBottom: 12, fontWeight: 900 }}>Production Status</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--status-pass)', fontWeight: 900 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-pass)', animation: 'hr-pulse 1s infinite' }} />
                   READY_FOR_VALIDATION
                </div>
             </div>

             <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 20, textTransform: 'uppercase' }}>Quick Ingest</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Ingest Posh Report', 'Reset Cache', 'Flush Diagnostic Buffer', 'Export Log'].map(act => (
                  <button key={act} style={{ textAlign: 'left', padding: '14px 20px', borderRadius: 12, border: '1px solid #EEE', background: '#FFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
                     {act}
                  </button>
                ))}
             </div>
          </aside>
        )}

      </div>

      {/* Mobile Drawer (v15.0 Rebrand) */}
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
           <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: -1 }}>Hachtool</div>
           <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 10, borderRadius: 50 }}>
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
                  padding: '14px 20px', borderRadius: 12, 
                  textDecoration: 'none', color: isActive ? '#FFF' : 'var(--text-primary)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12,
                  fontSize: 15, transition: 'all 0.2s'
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

      {/* Mobile Bottom Bar: Unified (Hidden in Focus Mode) */}
      {!isFocusMode && (
        <div className="mobile-only" style={{ 
          position: 'fixed', bottom: 24, left: 16, right: 16, 
          height: 64, background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(20px)', border: '1px solid #EEE',
          borderRadius: 20, zIndex: 1500, display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '0 12px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
        }}>
           {navItems.slice(0, 5).map(item => {
             const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
             return (
               <Link key={item.href} href={item.href} style={{ 
                 display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                 color: isActive ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none',
                 transition: 'all 0.2s', minWidth: 48
               }}>
                  <item.icon size={20} />
                  <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.mobile}</span>
               </Link>
             )
           })}
        </div>
      )}

    </div>
  )
}
