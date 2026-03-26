'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',        icon: '⊞', label: 'Dashboard' },
  { href: '/testlab', icon: '⌨', label: 'TestLab' },
  { href: '/scanlab', icon: '◈', label: 'ScanLab' },
  { href: '/fixlab',  icon: '◎', label: 'FixLab' },
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

      <div className="nav-section-label">Navigation</div>
      {NAV.map(item => (
        <Link key={item.href} href={item.href}
          className={`nav-item${active(item.href) ? ' active' : ''}`}
          onClick={() => setOpen(false)}
        >
          <span className="nav-item-icon">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="nav-section-label">Quick Actions</div>
      <Link href="/testlab" className={`nav-item${pathname.startsWith('/testlab') ? ' active' : ''}`} onClick={() => setOpen(false)}>
        <span className="nav-item-icon">▶</span>
        Run Full Test
      </Link>
      <Link href="/scanlab" className={`nav-item${pathname.startsWith('/scanlab') ? ' active' : ''}`} onClick={() => setOpen(false)}>
        <span className="nav-item-icon">⬆</span>
        Upload Scan Report
      </Link>

      <div className="nav-cta-wrap">
        <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 8 }}>
          Ravindra Pandit Ahire<br />
          Hynet Technologies, Pune
        </div>
        <Link href="/testlab" className="nav-cta-btn" onClick={() => setOpen(false)}>
          ▶ Start Testing
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
        <Link href="/testlab" style={{ marginLeft: 'auto', background: 'var(--blue-600)', color: 'white', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
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
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="nav-section-label">Quick Actions</div>
            <Link href="/testlab" className="nav-item" onClick={() => setOpen(false)}>
              <span className="nav-item-icon">▶</span>Run Full Test
            </Link>
            <div className="nav-cta-wrap">
              <Link href="/testlab" className="nav-cta-btn" onClick={() => setOpen(false)}>▶ Start Testing</Link>
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
