'use client'
import { useState, Suspense, lazy } from 'react'
import Sidebar from '../../components/Sidebar'

const KeyboardTest = lazy(() => import('../../components/testlab/KeyboardTest'))
const ScreenTest   = lazy(() => import('../../components/testlab/ScreenTest'))
const WebcamTest   = lazy(() => import('../../components/testlab/WebcamTest'))
const MicTest      = lazy(() => import('../../components/testlab/MicTest'))
const SpeakerTest  = lazy(() => import('../../components/testlab/SpeakerTest'))
const MouseTest    = lazy(() => import('../../components/testlab/MouseTest'))
const TouchTest    = lazy(() => import('../../components/testlab/TouchTest'))

const TESTS = [
  { id: 'keyboard', label: 'Keyboard',    icon: '⌨️', desc: 'Key detection & coverage %',    component: KeyboardTest },
  { id: 'screen',   label: 'Screen',      icon: '🖥',  desc: 'Dead pixel & colour test',      component: ScreenTest },
  { id: 'webcam',   label: 'Webcam',      icon: '📷', desc: 'Camera live preview',            component: WebcamTest },
  { id: 'mic',      label: 'Microphone',  icon: '🎤', desc: 'Input level & waveform',         component: MicTest },
  { id: 'speaker',  label: 'Speaker',     icon: '🔊', desc: 'Channel & frequency test',       component: SpeakerTest },
  { id: 'mouse',    label: 'Mouse',       icon: '🖱',  desc: 'Click & movement tracking',     component: MouseTest },
  { id: 'touch',    label: 'Touchscreen', icon: '👆', desc: 'Multi-touch point test',         component: TouchTest },
]

const STATUS_BADGE = {
  pass:     <span className="badge badge-pass">Passed</span>,
  fail:     <span className="badge badge-fail">Failed</span>,
  testing:  <span className="badge badge-running">Running</span>,
  starting: <span className="badge badge-running">Starting</span>,
  live:     <span className="badge badge-pass">Live</span>,
  error:    <span className="badge badge-fail">Error</span>,
  idle:     null,
}

export default function TestLab() {
  const [active, setActive]   = useState('keyboard')
  const [results, setResults] = useState({})
  const [view, setView]       = useState('panel') // 'grid' | 'panel'

  const current   = TESTS.find(t => t.id === active)
  const Component = current?.component
  const passCount = Object.values(results).filter(v => v === 'pass').length
  const doneCount = Object.keys(results).filter(k => results[k] !== 'idle').length

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">

        <div className="page-header">
          <div className="breadcrumb">Home / TestLab</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1>Hardware Test Suite</h1>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 5 }}>
                {TESTS.length} tests · runs in your browser · no install or admin rights needed
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => setView(v => v === 'grid' ? 'panel' : 'grid')} style={{ fontSize: 12 }}>
                {view === 'panel' ? '⊞ Card View' : '◫ Panel View'}
              </button>
            </div>
          </div>
        </div>

        {/* Card grid view */}
        {view === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {TESTS.map(t => {
              const res = results[t.id]
              return (
                <div key={t.id} className={`test-card${active === t.id ? ' active-card' : ''}`} onClick={() => { setActive(t.id); setView('panel'); }}>
                  <div className="test-card-icon">{t.icon}</div>
                  <div>
                    <div className="test-card-name">{t.label}</div>
                    <div style={{ marginTop: 4 }}>
                      {STATUS_BADGE[res] || <span className="badge badge-ready">Ready</span>}
                    </div>
                  </div>
                  <div className="test-card-desc">{t.desc}</div>
                  <button className="test-start-btn" onClick={e => { e.stopPropagation(); setActive(t.id); setView('panel'); }}>
                    Start Test →
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Panel view */}
        {view === 'panel' && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>

            {/* Sidebar test list */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 20 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tests — {doneCount}/{TESTS.length} done
              </div>

              {doneCount > 0 && (
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(passCount / TESTS.length) * 100}%`, background: 'var(--green)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>{passCount} pass</span>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>{Object.values(results).filter(v => v === 'fail').length} fail</span>
                  </div>
                </div>
              )}

              {TESTS.map(t => {
                const res = results[t.id]
                const isActive = active === t.id
                return (
                  <button key={t.id} onClick={() => setActive(t.id)} style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '11px 14px',
                    background: isActive ? 'var(--blue-50)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--blue-600)' : '3px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all .15s',
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--blue-700)' : 'var(--text-2)' }}>{t.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 1 }}>{t.desc}</div>
                      </div>
                    </div>
                    {res && res !== 'idle' && STATUS_BADGE[res]}
                  </button>
                )
              })}
            </div>

            {/* Active test panel */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28 }}>{current?.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 2 }}>{current?.label} Test</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{current?.desc}</p>
                </div>
                {results[active] && results[active] !== 'idle' && (
                  <div style={{ flexShrink: 0 }}>{STATUS_BADGE[results[active]]}</div>
                )}
              </div>
              <div style={{ padding: '24px 22px' }}>
                <Suspense fallback={
                  <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-4)' }}>Loading test…</div>
                }>
                  {Component && (
                    <Component onResult={r => setResults(prev => ({ ...prev, [active]: r }))} />
                  )}
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
