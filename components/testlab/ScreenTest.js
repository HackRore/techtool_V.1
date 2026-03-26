'use client'
import { useState } from 'react'

const MODES = [
  { id: 'black',   label: 'Dead Pixel (Black)', bg: '#000000', text: '#333' },
  { id: 'white',   label: 'Dead Pixel (White)', bg: '#ffffff', text: '#ccc' },
  { id: 'red',     label: 'Red Channel',         bg: '#ff0000', text: '#ff6666' },
  { id: 'green',   label: 'Green Channel',        bg: '#00ff00', text: '#66ff66' },
  { id: 'blue',    label: 'Blue Channel',         bg: '#0000ff', text: '#6666ff' },
  { id: 'grid',    label: 'Grid Pattern',         bg: 'grid',   text: '#aaa' },
  { id: 'gradient',label: 'Gradient',             bg: 'gradient',text: '#aaa' },
]

export default function ScreenTest({ onResult }) {
  const [activeMode, setActiveMode] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)

  const enterMode = (mode) => {
    setActiveMode(mode)
    setFullscreen(true)
    onResult?.('testing')
  }

  const exit = () => {
    setFullscreen(false)
    setActiveMode(null)
  }

  const markPass = () => { onResult?.('pass'); exit() }

  const getBg = (mode) => {
    if (!mode) return '#000'
    if (mode.bg === 'grid') return 'repeating-linear-gradient(0deg, #111 0px, #111 1px, #000 1px, #000 20px), repeating-linear-gradient(90deg, #111 0px, #111 1px, #000 1px, #000 20px)'
    if (mode.bg === 'gradient') return 'linear-gradient(135deg, #000 0%, #444 25%, #fff 50%, #444 75%, #000 100%)'
    return mode.bg
  }

  if (fullscreen && activeMode) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: getBg(activeMode),
          cursor: 'crosshair',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={exit}
      >
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8,
        }}>
          <button
            onClick={e => { e.stopPropagation(); markPass() }}
            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)', color: '#10b981', padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1px', cursor: 'pointer', borderRadius: 1 }}
          >PASS ✓</button>
          <button
            onClick={e => { e.stopPropagation(); onResult?.('fail'); exit() }}
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1px', cursor: 'pointer', borderRadius: 1 }}
          >FAIL ✗</button>
          <button
            onClick={e => { e.stopPropagation(); exit() }}
            style={{ background: 'rgba(107,107,107,0.2)', border: '1px solid rgba(107,107,107,0.4)', color: '#6b6b6b', padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1px', cursor: 'pointer', borderRadius: 1 }}
          >EXIT</button>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: activeMode.text, letterSpacing: '2px', opacity: 0.4 }}>
          {activeMode.label.toUpperCase()} — INSPECT FOR ANOMALIES — CLICK TO EXIT
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.7 }}>
        Select a test mode. The screen will go fullscreen — inspect for dead pixels, stuck pixels, or colour anomalies. Click PASS/FAIL when done.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => enterMode(mode)}
            style={{
              background: mode.bg === 'grid' || mode.bg === 'gradient'
                ? 'var(--surface-3)'
                : mode.bg,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              padding: '16px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: mode.bg === 'grid' || mode.bg === 'gradient' ? '#aaa' : 'rgba(0,0,0,0.7)', letterSpacing: '0.5px' }}>
              {mode.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: mode.bg === 'grid' || mode.bg === 'gradient' ? '#555' : 'rgba(0,0,0,0.4)', marginTop: 4, letterSpacing: '1px' }}>
              CLICK TO TEST →
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.7 }}>
        TIP: On black screen, look for bright spots. On white, look for dark spots. On colour screens, look for wrong-colour pixels.
      </div>
    </div>
  )
}
