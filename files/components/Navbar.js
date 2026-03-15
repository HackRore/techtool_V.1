'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',        label: 'HOME',    code: '00' },
  { href: '/testlab', label: 'TESTLAB', code: '01' },
  { href: '/scanlab', label: 'SCANLAB', code: '02' },
  { href: '/fixlab',  label: 'FIXLAB',  code: '03' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* isolation:isolate makes the sticky nav a stacking context for absolute drawer */}
      <nav style={{ background: 'rgba(5,5,5,0.97)', borderBottom: '1px solid rgba(245,158,11,0.15)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, isolation: 'isolate' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => setOpen(false)}>
            <div style={{ width: 28, height: 28, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>HR</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#e5e5e5', letterSpacing: '2px' }}>HACK<span style={{ color: '#f59e0b' }}>RORE</span></div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '2px', color: '#2a2a2a', marginTop: -1 }}>TECHWORKBENCH</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="nav-desktop">
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 1, background: active ? 'rgba(245,158,11,0.1)' : 'transparent', border: `1px solid ${active ? 'rgba(245,158,11,0.3)' : 'transparent'}`, transition: 'all 0.2s', cursor: 'pointer' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: active ? '#f59e0b' : '#2a2a2a' }}>{item.code}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.5px', color: active ? '#f59e0b' : '#6b6b6b', fontWeight: active ? 600 : 400 }}>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Online dot — desktop only */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="nav-desktop">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2a2a2a', letterSpacing: '1px' }}>ONLINE</span>
            </div>
            {/* Hamburger — mobile only */}
            <button onClick={() => setOpen(o => !o)} className="nav-mobile" aria-label="Toggle menu"
              style={{ background: 'none', border: '1px solid var(--surface-5)', padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, borderRadius: 1 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 18, height: 1.5, borderRadius: 1, transition: 'all 0.2s',
                  background: open ? (i === 1 ? 'transparent' : '#f59e0b') : '#6b6b6b',
                  transform: open ? (i === 0 ? 'rotate(45deg) translate(4px,4px)' : i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none') : 'none'
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile drawer — position:absolute inside sticky nav, iOS Safari safe */}
        {open && (
          <div className="nav-mobile" style={{ position: 'absolute', top: 56, left: 0, right: 0, background: 'rgba(5,5,5,0.99)', zIndex: 99, padding: '16px 20px 24px', borderBottom: '1px solid rgba(245,158,11,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 12px', borderBottom: '1px solid var(--surface-3)', background: active ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: active ? '#f59e0b' : '#3a3a3a', minWidth: 24 }}>{item.code}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: active ? '#f59e0b' : '#e5e5e5' }}>{item.label}</span>
                    {active && <span style={{ marginLeft: 'auto', color: '#f59e0b' }}>▶</span>}
                  </div>
                </Link>
              )
            })}
            <div style={{ marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2a2a2a', letterSpacing: '2px', textAlign: 'center' }}>
              HACKRORE TECHWORKBENCH · RAVINDRA PANDIT AHIRE
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile  { display: none !important; }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  )
}
