'use client'
import { useState, Suspense, lazy } from 'react'
import Navbar from '../../components/Navbar'

const KeyboardTest = lazy(() => import('../../components/testlab/KeyboardTest'))
const ScreenTest   = lazy(() => import('../../components/testlab/ScreenTest'))
const WebcamTest   = lazy(() => import('../../components/testlab/WebcamTest'))
const MicTest      = lazy(() => import('../../components/testlab/MicTest'))
const SpeakerTest  = lazy(() => import('../../components/testlab/SpeakerTest'))
const MouseTest    = lazy(() => import('../../components/testlab/MouseTest'))
const TouchTest    = lazy(() => import('../../components/testlab/TouchTest'))

const TESTS = [
  { id: 'keyboard', label: 'Keyboard',    icon: '⌨',  desc: 'Key detection & coverage', component: KeyboardTest },
  { id: 'screen',   label: 'Screen',      icon: '▣',  desc: 'Dead pixel & colour test',  component: ScreenTest },
  { id: 'webcam',   label: 'Webcam',      icon: '◎',  desc: 'Camera live preview',       component: WebcamTest },
  { id: 'mic',      label: 'Microphone',  icon: '◉',  desc: 'Input level & waveform',    component: MicTest },
  { id: 'speaker',  label: 'Speaker',     icon: '◈',  desc: 'Channel & frequency test',  component: SpeakerTest },
  { id: 'mouse',    label: 'Mouse',       icon: '◇',  desc: 'Click & movement tracking', component: MouseTest },
  { id: 'touch',    label: 'Touchscreen', icon: '◯',  desc: 'Multi-touch point test',    component: TouchTest },
]

function TestCard({ test, isActive, onSelect, result }) {
  const statusColor = result === 'pass' ? 'var(--green)' : result === 'fail' ? 'var(--red)' : result === 'testing' ? 'var(--amber)' : 'var(--surface-5)'
  return (
    <button
      onClick={() => onSelect(test.id)}
      style={{
        background: isActive ? 'rgba(245,158,11,0.08)' : 'var(--surface-2)',
        border: `1px solid ${isActive ? 'rgba(245,158,11,0.35)' : result === 'pass' ? 'rgba(16,185,129,0.25)' : result === 'fail' ? 'rgba(239,68,68,0.25)' : 'var(--surface-4)'}`,
        borderRadius: 2, padding: '14px 12px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s', width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? 'rgba(245,158,11,0.15)' : 'var(--surface-3)',
        border: `1px solid ${isActive ? 'rgba(245,158,11,0.3)' : 'var(--surface-5)'}`,
        borderRadius: 1, fontSize: 16, flexShrink: 0,
      }}>
        {test.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: isActive ? 'var(--amber)' : 'var(--text-primary)' }}>
          {test.label}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.5px' }}>
          {test.desc}
        </div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0,
        boxShadow: result === 'pass' ? '0 0 8px rgba(16,185,129,0.5)' : result === 'fail' ? '0 0 8px rgba(239,68,68,0.5)' : 'none' }} />
    </button>
  )
}

export default function TestLab() {
  const [active, setActive]   = useState('keyboard')
  const [results, setResults] = useState({})

  const setResult = (id, val) => setResults(prev => ({ ...prev, [id]: val }))
  const activeTest = TESTS.find(t => t.id === active)
  const Component  = activeTest?.component

  const passed = Object.values(results).filter(v => v === 'pass').length
  const failed = Object.values(results).filter(v => v === 'fail').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(245,158,11,0.1)', padding: '24px 24px 20px', background: 'var(--surface-1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: '2px' }}>[01]</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>TestLab</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '1px' }}>BROWSER HARDWARE TESTING SUITE</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>✓ {passed} passed</span>
            {failed > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>✗ {failed} failed</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{TESTS.length - passed - failed} untested</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

        {/* Left: test selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TESTS.map(t => (
            <TestCard key={t.id} test={t} isActive={active === t.id} onSelect={setActive} result={results[t.id]} />
          ))}
        </div>

        {/* Right: active test */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 2, padding: 24 }}>
          {/* Test header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{activeTest?.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{activeTest?.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '1px' }}>{activeTest?.desc}</div>
              </div>
            </div>
            {results[active] && (
              <span className={`badge badge-${results[active]}`}>{results[active].toUpperCase()}</span>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--surface-4)', marginBottom: 24 }} />

          {/* Test component */}
          <Suspense fallback={
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>
              LOADING TEST MODULE…
            </div>
          }>
            {Component && <Component onResult={(r) => setResult(active, r)} />}
          </Suspense>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 220px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
