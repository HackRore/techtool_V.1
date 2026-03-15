'use client'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const MODULES = [
  {
    code: '01', name: 'TestLab', href: '/testlab', color: '#f59e0b', icon: '⬡',
    tagline: 'Browser Hardware Testing Suite',
    desc: 'Test every hardware component directly in the browser — no installs, no admin rights. Keyboard, screen, webcam, mic, speaker, mouse, touchscreen.',
    tests: ['Keyboard', 'Screen', 'Webcam', 'Microphone', 'Speaker', 'Mouse', 'Touchscreen'],
  },
  {
    code: '02', name: 'ScanLab', href: '/scanlab', color: '#06b6d4', icon: '◈',
    tagline: 'System Diagnostics Dashboard',
    desc: 'Upload your HackRore JSON report and get a full interactive dashboard — health score, SMART data, battery wear, thermals, event log, all 17 modules.',
    tests: ['Health Score', 'SMART', 'Battery', 'CPU/RAM', 'GPU', 'Events'],
  },
  {
    code: '03', name: 'FixLab', href: '/fixlab', color: '#10b981', icon: '◎',
    tagline: 'Technician Knowledge Base',
    desc: 'Search 50+ common hardware and software problems. Every entry has causes, step-by-step solutions, and tags. Built for real repair engineers.',
    tests: ['WiFi', 'USB', 'Battery', 'Overheating', 'Drivers', 'BIOS'],
  },
]

const STATS = [
  { value: '17',  label: 'Scan Modules' },
  { value: '7',   label: 'Browser Tests' },
  { value: '50+', label: 'Fix Entries' },
  { value: '0',   label: 'Installs Needed' },
]

const STEPS = [
  { step: '01', label: 'Open TestLab',       detail: '/testlab' },
  { step: '02', label: 'Run browser tests',  detail: 'Keyboard, screen, webcam…' },
  { step: '03', label: 'Run HackRore.ps1',   detail: 'On Windows as Admin' },
  { step: '04', label: 'Upload JSON',        detail: 'Drag into ScanLab' },
  { step: '05', label: 'Generate report',    detail: 'Full verdict + certificate' },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <Navbar />

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '2px', paddingTop: 4 }}>SYS_INIT</div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(245,158,11,0.4), transparent)', marginTop: 11 }} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,6vw,72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1px', color: '#e5e5e5', marginBottom: 20 }}>
          The Technician's<br /><span style={{ color: 'var(--amber)' }}>Workbench.</span>
        </h1>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: '#6b6b6b', maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
          One platform. Three modules. Everything a refurbishment technician or repair engineer needs —
          from browser hardware tests to deep system diagnostics to a daily fix knowledge base.
        </p>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 64 }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--amber)' }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '1.5px', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {MODULES.map((mod, i) => (
            <Link key={mod.code} href={mod.href} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ padding: '28px 24px', borderColor: `${mod.color}22`, transition: 'all 0.25s', cursor: 'pointer', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${mod.color}44`; e.currentTarget.style.background = `${mod.color}08`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${mod.color}22`; e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: mod.color, letterSpacing: '2px', marginBottom: 6 }}>[{mod.code}]</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#e5e5e5' }}>{mod.name}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#6b6b6b', marginTop: 3 }}>{mod.tagline}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: mod.color, opacity: 0.5 }}>{mod.icon}</div>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#5a5a5a', lineHeight: 1.65, marginBottom: 20 }}>{mod.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {mod.tests.map(t => (
                    <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '1px', color: `${mod.color}99`, background: `${mod.color}0d`, border: `1px solid ${mod.color}22`, padding: '2px 7px', borderRadius: 1 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.5px', color: mod.color }}>OPEN {mod.name.toUpperCase()}</span>
                  <span style={{ color: mod.color, fontSize: 14 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)', marginBottom: 48 }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--amber)', marginBottom: 24 }}>TECHNICIAN WORKFLOW</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap' }}>
          {STEPS.map((item, i, arr) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>{item.step}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#e5e5e5', marginTop: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#3a3a3a', marginTop: 2 }}>{item.detail}</div>
              </div>
              {i < arr.length - 1 && <div style={{ color: 'var(--text-dim)', fontSize: 16, paddingBottom: 20 }}>─</div>}
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-dim)' }}>
          HACKRORE TECHWORKBENCH · RAVINDRA PANDIT AHIRE · HYNET TECHNOLOGIES, PUNE · v1.0
        </span>
      </footer>
    </div>
  )
}
