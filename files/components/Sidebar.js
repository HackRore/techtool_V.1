'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { 
  LayoutDashboard, 
  Terminal, 
  Search, 
  BookOpen, 
  Download, 
  Settings,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react'

const NAV = [
  { href: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assistant',   icon: Sparkles,        label: 'AI Assistant' },
  { href: '/tools',       icon: Zap,             label: 'TestLab' },
  { href: '/diagnostics', icon: Terminal,        label: 'ScanLab' },
  { href: '/fixlab',      icon: BookOpen,        label: 'FixLab' },
  { href: '/resources',   icon: Download,        label: 'Resources' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const active = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  // close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const SidebarContent = () => (
    <nav className="sidebar" style={open ? {} : undefined}>
      <div className="nav-brand">
        <div className="nav-logo-sq">HR</div>
        <span className="nav-brand-name">HackRore</span>
      </div>

      <div className="nav-section-label">Main Navigation</div>
      {NAV.map(Item => (
        <Link key={Item.href} href={Item.href}
          className={`nav-item${active(Item.href) ? ' active' : ''}`}
          onClick={() => setOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px' }}
        >
          <Item.icon size={18} strokeWidth={active(Item.href) ? 2.5 : 2} />
          <span>{Item.label}</span>
        </Link>
      ))}

      <div className="nav-section-label">System Tools</div>
      <Link href="/tools" className={`nav-item${pathname.startsWith('/tools') ? ' active' : ''}`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Zap size={18} />
        Hardware Testbench
      </Link>
      <Link href="/diagnostics" className={`nav-item${pathname.startsWith('/diagnostics') ? ' active' : ''}`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={18} />
        System ScanLab
      </Link>

      <div className="nav-cta-wrap">
        <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 8 }}>
          Ravindra Pandit Ahire<br />
          Hynet Technologies, Pune
        </div>
        <Link href="/tools" className="nav-cta-btn" onClick={() => setOpen(false)}>
          ▶ Launch Engine
        </Link>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ display: 'contents' }}>
        <SidebarContent />
      </div>

      {/* Mobile topbar */}
      <div className="topbar">
        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open
            ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 1l16 16M17 1L1 17"/></svg>
            : [0,1,2].map(i => <div key={i} className="ham-line" />)
          }
        </button>
        <div className="nav-logo-sq">HR</div>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>HackRore</span>
        <Link href="/tools" style={{ marginLeft: 'auto', background: 'var(--blue-600)', color: 'white', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          Run Test
        </Link>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 199 }} />
          <nav className="sidebar open" style={{ display: 'flex' }}>
            <div className="nav-brand">
              <div className="nav-logo-sq">HR</div>
              <span className="nav-brand-name">HackRore</span>
            </div>
            <div className="nav-section-label">Navigation</div>
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                className={`nav-item${active(item.href) ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <item.icon size={18} />
                <span style={{ marginLeft: 12 }}>{item.label}</span>
              </Link>
            ))}
            <div className="nav-section-label">Quick Actions</div>
            <Link href="/tools" className="nav-item" onClick={() => setOpen(false)}>
              <Zap size={18} />
              <span style={{ marginLeft: 12 }}>Launch Testbench</span>
            </Link>
            <div className="nav-cta-wrap">
              <Link href="/tools" className="nav-cta-btn" onClick={() => setOpen(false)}>▶ Run Full Test</Link>
            </div>
          </nav>
        </>
      )}

      <style>{`
        @media (min-width: 769px) {
          .topbar { display: none !important; }
        }
      `}</style>
    </>
  )
}
