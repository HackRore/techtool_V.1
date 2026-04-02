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

  // Unified Nav Items (v8.1 Industrial Sync)
  const navItems = [
    { name: 'Home',         mobile: 'Home',    href: '/', icon: Monitor },
    { name: 'Diagnostics',  mobile: 'Tests',   href: '/tools', icon: Activity },
    { name: 'Reports',      mobile: 'Reports', href: '/diagnostics', icon: Cpu },
    { name: 'Guides',       mobile: 'Guides',  href: '/fixlab', icon: BookOpen },
    { name: 'Toolbox',      mobile: 'Toolbox', href: '/resources', icon: Zap },
    { name: 'Jobs',         mobile: 'Jobs',    href: '/jobs', icon: User },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isMobileMenuOpen])

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main" className="skip-nav" style={{ position: 'absolute', top: -100, left: 0, background: 'var(--accent)', color: '#000', padding: '10px 20px', zIndex: 10000 }}>Skip to main content</a>

      {/* GFG-Style Sticky Header (fix 13B) */}
      <header className="desktop-only" style={{ 
        height: 80, background: '#FFF', borderBottom: '1px solid var(--border)', 
        position: 'sticky', top: 0, zIndex: 2000, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 48
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, background: 'var(--accent)', color: '#FFF', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>HT</div>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#222', letterSpacing: -0.5 }}>Hachtool</span>
        </Link>
        
        {/* GFG-Style Search Bar (fix 13F) */}
        <form 
          style={{ flex: 1, position: 'relative', maxWidth: 600 }}
          onSubmit={(e) => {
            e.preventDefault()
            const query = e.target.search.value
            window.location.href = `/fixlab?query=${encodeURIComponent(query)}`
          }}
        >
          <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={18} />
          <input 
            name="search"
            type="text" 
            placeholder="Search diagnostic protocols, repair guides, or hardware modules..." 
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 100, border: '1px solid #E0E0E0', background: '#F8F9FA', fontSize: 14, outline: 'none' }}
          />
        </form>

        <nav style={{ display: 'flex', gap: 24 }}>
          {['Tutorials', 'Practice', 'Reports', 'Jobs'].map(item => (
            <div key={item} style={{ fontSize: 14, fontWeight: 700, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              {item} <ChevronDown size={14} />
            </div>
          ))}
          <button className="btn-primary" style={{ background: '#2E3D49', color: '#FFF', padding: '10px 24px', borderRadius: 6, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Sign In</button>
        </nav>
      </header>

      {/* GFG 3-Column Layout Cluster */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 260px) 1fr minmax(0, 320px)', 
        maxWidth: 1600, margin: '0 auto', width: '100%',
        minHeight: 'calc(100vh - 80px)'
      }}>
        
        {/* Left Column: Fixed Tutorial Navigation */}
        <aside className="desktop-only" style={{ 
          borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', 
          padding: '32px 24px', position: 'sticky', top: 80, height: 'calc(100vh - 80px)', overflowY: 'auto'
        }}>
          <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' }}>Diagnostic Suite</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  style={{ 
                    padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
                    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    fontWeight: isActive ? 800 : 500, fontSize: 14,
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

        {/* Middle Column: Main Content */}
        <main id="main" style={{ padding: '40px 48px', background: '#FFF' }}>
          {children}
          
          <footer style={{ marginTop: 80, borderTop: '1px solid #EEE', padding: '64px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
             <div>
                <h5 style={{ fontWeight: 900, marginBottom: 16 }}>Diagnostics</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#666' }}>
                   <span>Hardware Tests</span>
                   <span>Status Checks</span>
                   <span>System Analytics</span>
                </div>
             </div>
             <div>
                <h5 style={{ fontWeight: 900, marginBottom: 16 }}>Learn</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#666' }}>
                   <span>Repair Guides</span>
                   <span>Knowledge Base</span>
                   <span>Technician Wiki</span>
                </div>
             </div>
             <div>
                <h5 style={{ fontWeight: 900, marginBottom: 16 }}>Company</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#666' }}>
                   <span>About Hachtool</span>
                   <span>Privacy Policy</span>
                   <span>Contact Support</span>
                </div>
             </div>
          </footer>
        </main>

        {/* Right Column: Contextual Context Sidebar (thetest.com / GFG style) */}
        <aside className="desktop-only" style={{ 
          borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)', 
          padding: '32px 24px', position: 'sticky', top: 80, height: 'calc(100vh - 80px)', overflowY: 'auto'
        }}>
           <div className="card" style={{ padding: 20, background: '#FFF', border: '1px solid var(--accent)', marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', marginBottom: 8 }}>LIVE_TELEMETRY</div>
              <h5 style={{ marginBottom: 12 }}>System Status</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--status-pass)', fontWeight: 800 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-pass)', animation: 'hr-pulse 1s infinite' }} />
                 ALL_SYSTEMS_OPTIMAL
              </div>
           </div>

           <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>Quick Actions</h4>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Run Battery Sweep', 'Refresh GPU', 'Download Report', 'Contact Engineer'].map(act => (
                <button key={act} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 8, border: '1px solid #E0E0E0', background: '#FFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                   {act}
                </button>
              ))}
           </div>
        </aside>

      </div>

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
