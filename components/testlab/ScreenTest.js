import { useState } from 'react'
import { useHistory } from '../HistoryProvider'

const MODES = [
  { id: 'black',   label: 'Dead Pixel (Black)', bg: '#000000', text: '#333' },
  { id: 'white',   label: 'Dead Pixel (White)', bg: '#ffffff', text: '#ccc' },
  { id: 'red',     label: 'Red Channel',         bg: '#ff0000', text: '#ff6666' },
  { id: 'green',   label: 'Green Channel',        bg: '#00ff00', text: '#66ff66' },
  { id: 'blue',    label: 'Blue Channel',         bg: '#0000ff', text: '#6666ff' },
  { id: 'grid',    label: 'Grid Pattern',         bg: 'grid',   text: '#aaa' },
  { id: 'gradient',label: 'Gradient',             bg: 'gradient',text: '#aaa' },
]

export default function ScreenTest({ onResult, inline = false }) {
  const { addHistory } = useHistory()
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

  const markPass = () => { 
    addHistory('hardware', 'Display Pulse Audit', 'pass', { mode: activeMode?.label })
    onResult?.('pass'); 
    exit() 
  }

  const markFail = () => {
    addHistory('hardware', 'Display Pulse Audit', 'fail', { mode: activeMode?.label })
    onResult?.('fail')
    exit()
  }

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
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 16,
        }}>
          <button
            onClick={e => { e.stopPropagation(); markPass() }}
            className="btn-accent"
            style={{ padding: '12px 24px', fontSize: 11, letterSpacing: 1, borderColor: 'var(--status-pass)', color: 'var(--status-pass)', background: 'rgba(0,0,0,0.8)' }}
          >VALIDATE PASS ✓</button>
          <button
            onClick={e => { e.stopPropagation(); markFail() }}
            className="btn-accent"
            style={{ padding: '12px 24px', fontSize: 11, letterSpacing: 1, borderColor: 'var(--status-fail)', color: 'var(--status-fail)', background: 'rgba(0,0,0,0.8)' }}
          >SIGNAL FAIL ✗</button>
          <button
            onClick={e => { e.stopPropagation(); exit() }}
            className="btn-secondary"
            style={{ padding: '12px 24px', fontSize: 11, letterSpacing: 1, background: 'rgba(0,0,0,0.8)' }}
          >ABORT TEST</button>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: activeMode.text, letterSpacing: 2, opacity: 0.6, fontWeight: 800 }}>
          {activeMode.label.toUpperCase()} — INSPECTION IN PROGRESS — CLICK TO ABORT
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        {inline ? "Select a mode. Screen will go immersive for inspection." : "Select a test mode. The screen will go fullscreen — inspect for dead pixels, stuck pixels, or colour anomalies. Click PASS/FAIL when done."}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => enterMode(mode)}
            className="card"
            style={{
              background: mode.bg === 'grid' || mode.bg === 'gradient' ? 'var(--bg-secondary)' : mode.bg,
              padding: '24px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
              borderColor: 'var(--border)'
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: mode.bg === 'grid' || mode.bg === 'gradient' ? 'var(--text-primary)' : 'rgba(0,0,0,0.8)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {mode.label}
            </div>
            <div style={{ fontSize: 10, color: mode.bg === 'grid' || mode.bg === 'gradient' ? 'var(--accent)' : 'rgba(0,0,0,0.5)', marginTop: 8, letterSpacing: 1, fontWeight: 700 }}>
              AUTO LAUNCH →
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
        * Technical Reference: Black screen (bright spots = stuck ON), White screen (dark spots = dead), Color screens (sub-pixel verification).
      </div>
    </div>
  )
}
