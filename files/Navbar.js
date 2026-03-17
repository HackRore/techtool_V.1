'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/testlab', label: 'TestLab' },
  { href: '/scanlab', label: 'ScanLab' },
  { href: '/fixlab',  label: 'FixLab' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const active = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const linkStyle = (href) => ({
    display: 'block',
    padding: '6px 13px',
    borderRadius: 6,
    fontFamily: 'var(--font-heading)',
    fontSize: 14,
    fontWeight: active(href) ? 700 : 500,
    color: active(href) ? 'var(--accent-dark)' : 'var(--g600)',
    background: active(href) ? 'var(--accent-light)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s',
  })

  return (
    <>
      <nav style={{
        background: 'white', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100, isolation: 'isolate',
      }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: '0 24px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => setOpen(false)}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 800 }}>HR</span>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--g900)' }}>HackRore</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="nav-desktop">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={linkStyle(l.href)}
                onMouseEnter={e => { if (!active(l.href)) { e.currentTarget.style.background = 'var(--g100)'; e.currentTarget.style.color = 'var(--g900)'; }}}
                onMouseLeave={e => { if (!active(l.href)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--g600)'; }}}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/testlab" className="nav-desktop" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Run a Test
              </button>
            </Link>
            <button className="nav-mobile"
              onClick={() => setOpen(o => !o)}
              style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 6, padding: '7px 9px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 18, height: 2, borderRadius: 1, background: 'var(--g700)', transition: 'all 0.2s',
                  transform: open ? (i === 0 ? 'rotate(45deg) translate(4px,4px)' : i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none') : 'none',
                  opacity: open && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="nav-mobile" style={{ position: 'absolute', top: 60, left: 0, right: 0, background: 'white', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow3)', padding: '10px 16px 18px', zIndex: 99 }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', textDecoration: 'none' }} onClick={() => setOpen(false)}>
                <div style={{ padding: '11px 14px', borderRadius: 6, marginBottom: 2, fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: active(l.href) ? 700 : 500, color: active(l.href) ? 'var(--accent-dark)' : 'var(--g700)', background: active(l.href) ? 'var(--accent-light)' : 'transparent' }}>
                  {l.label}
                </div>
              </Link>
            ))}
            <Link href="/testlab" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
              <button style={{ width: '100%', marginTop: 10, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, padding: '11px', fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Run a Test →</button>
            </Link>
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
