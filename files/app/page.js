'use client'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'
import CommandCenter from '../components/ui/CommandCenter'

const TESTS = [
  { icon: '⌨️', label: 'Keyboard',    href: '/testlab', desc: 'Press every key and track coverage percentage in real time.', badge: 'Ready' },
  { icon: '🖥',  label: 'Screen',      href: '/testlab', desc: 'Full-screen dead pixel and colour uniformity test.',           badge: 'Ready' },
  { icon: '📷', label: 'Webcam',      href: '/testlab', desc: 'Live camera preview with resolution and FPS detection.',       badge: 'Ready' },
  { icon: '🎤', label: 'Microphone',  href: '/testlab', desc: 'Waveform visualiser, RMS level meter and playback test.',      badge: 'Ready' },
  { icon: '🔊', label: 'Speaker',     href: '/testlab', desc: 'Left/right channel test, tones and frequency sweep.',          badge: 'Ready' },
  { icon: '🖱',  label: 'Mouse',       href: '/testlab', desc: 'Track pointer movement, clicks and scroll delta.',            badge: 'Ready' },
  { icon: '👆', label: 'Touchscreen', href: '/testlab', desc: 'Multi-touch point detection with visual feedback.',            badge: 'Ready' },
]

const TOP_FIXES = [
  { title: 'WiFi keeps disconnecting',  cat: 'WiFi',        color: '#EA580C', bg: '#FFF7ED' },
  { title: 'Battery drains too fast',   cat: 'Battery',     color: '#EA580C', bg: '#FFF7ED' },
  { title: 'USB port not detecting',    cat: 'USB',         color: '#D97706', bg: '#FFFBEB' },
  { title: 'Laptop overheating',        cat: 'Overheating', color: '#DC2626', bg: '#FEF2F2' },
  { title: "Windows will not boot",        cat: 'Boot',        color: '#DC2626', bg: '#FEF2F2' },
  { title: 'No sound from speakers',    cat: 'Audio',       color: '#D97706', bg: '#FFFBEB' },
]

export default function Home() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">

        {/* Page header */}
        <div className="page-header">
          <h1>Dashboard</h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)', marginTop: 6 }}>
            Welcome to HackRore TechWorkbench — your complete hardware diagnostic platform.
          </p>
        </div>

        {/* Metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[['7', 'Browser Tests'], ['50+', 'Fix Entries'], ['21+', 'Scan Modules'], ['0', 'Installs Needed']].map(([val, label]) => (
            <div key={label} className="metric-card">
              <div className="metric-label">{label}</div>
              <div className="metric-value">{val}</div>
            </div>
          ))}
        </div>

        {/* Command Center */}
        <CommandCenter />
        <div style={{ height: 16 }} />

        {/* Quick hardware tests */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>Quick Hardware Tests</h2>
            <Link href="/testlab" style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-600)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14 }}>
            {TESTS.map(t => (
              <Link key={t.label} href={t.href} style={{ textDecoration: 'none' }}>
                <div className="test-card">
                  <div className="test-card-icon">{t.icon}</div>
                  <div>
                    <div className="test-card-name">{t.label}</div>
                    <span className="badge badge-ready" style={{ marginTop: 4 }}>Ready</span>
                  </div>
                  <div className="test-card-desc">{t.desc}</div>
                  <button className="test-start-btn">Start Test →</button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two column: ScanLab + FixLab */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 36 }}>

          {/* ScanLab */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#0F172A', padding: '24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>ScanLab</div>
              <h3 style={{ color: 'white', marginBottom: 8 }}>Full System Diagnostics</h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 18 }}>
                Run the PowerShell scanner, upload the JSON for a complete health dashboard with CPU, battery, SMART data and event log analysis.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/scanlab" style={{ background: 'var(--blue-600)', color: 'white', border: 'none', borderRadius: 7, padding: '9px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Upload Report →</Link>
                <Link href="/scanlab" style={{ background: 'rgba(255,255,255,.07)', color: '#94A3B8', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '9px 14px', fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>Try Demo</Link>
              </div>
            </div>
            <div style={{ padding: '14px 20px', background: 'var(--bg)' }}>
              {['CPU · RAM · Storage health', 'Battery wear & cycle count', 'Event log & driver errors', 'AI Diagnosis + Customer Report'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-3)' }}>
                  <span style={{ color: 'var(--green)', fontSize: 12, flexShrink: 0 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* FixLab */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
            <div style={{ padding: '24px 24px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>FixLab</div>
              <h3 style={{ marginBottom: 8 }}>Common Problems & Fixes</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 4 }}>
                50+ searchable repair entries with causes, step-by-step solutions, and required tools.
              </p>
            </div>
            <div style={{ padding: '0 16px 18px' }}>
              {TOP_FIXES.map(fix => (
                <Link key={fix.title} href="/fixlab" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: 7, marginBottom: 2, transition: 'background .15s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: fix.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{fix.title}</span>
                  </div>
                  <span style={{ fontSize: 11, color: fix.color, background: fix.bg, padding: '2px 8px', borderRadius: 10, fontWeight: 600, flexShrink: 0 }}>{fix.cat}</span>
                </Link>
              ))}
              <Link href="/fixlab" style={{ display: 'block', width: '100%', marginTop: 10, background: 'transparent', color: 'var(--blue-600)', border: '1px solid var(--blue-600)', borderRadius: 7, padding: '9px', fontSize: 13, fontWeight: 600, textAlign: 'center', textDecoration: 'none', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Browse All Fixes</Link>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 20 }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { n: '1', title: 'Open TestLab',   desc: 'Run 7 browser hardware tests — keyboard, screen, camera, mic, speaker, mouse, touch.' },
              { n: '2', title: 'Run Scanner',    desc: 'Execute HackRore.ps1 on Windows as Administrator to collect the system JSON report.' },
              { n: '3', title: 'Upload Report',  desc: 'Drag the JSON into ScanLab for a full interactive health dashboard.' },
              { n: '4', title: 'Fix Issues',     desc: 'Search FixLab for the problem and follow step-by-step repair instructions.' },
            ].map(s => (
              <div key={s.n} className="card-flat" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-4)' }}>
          HackRore TechWorkbench · Ravindra Pandit Ahire · Hynet Technologies, Pune · v1.0
        </div>
      </main>
    </div>
  )
}
