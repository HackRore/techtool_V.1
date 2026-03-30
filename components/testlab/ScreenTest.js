'use client'
import { useState, useEffect, useRef } from 'react'
import { useHistory } from '../HistoryProvider'
import { Monitor, Cpu, Zap, Maximize2, ShieldCheck, AlertTriangle } from 'lucide-react'

const MODES = [
  { id: 'black',      label: 'Backlight Bleed',  bg: '#000000', text: '#333' },
  { id: 'white',      label: 'Dead Pixel (W)',  bg: '#ffffff', text: '#ccc' },
  { id: 'red',        label: 'Red Channel',      bg: '#ff0000', text: '#666' },
  { id: 'green',      label: 'Green Channel',    bg: '#00ff00', text: '#666' },
  { id: 'blue',       label: 'Blue Channel',     bg: '#0000ff', text: '#666' },
  { id: 'smpte',      label: 'SMPTE Color Bars', bg: 'smpte',   text: '#aaa' },
  { id: 'gamma',      label: 'Gamma 2.2 Chart',  bg: 'gamma',   text: '#aaa' },
  { id: 'sharpness',  label: 'Sharpness Grid',   bg: 'sharpness', text: '#aaa' },
]

export default function ScreenTest({ onResult }) {
  const { addHistory } = useHistory()
  const [activeMode, setActiveMode] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [fps, setFps] = useState(0)
  const requestRef = useRef()
  const lastTimeRef = useRef()

  // High-precision FPS counter for technicians
  const animate = time => {
    if (lastTimeRef.current !== undefined) {
      const delta = time - lastTimeRef.current
      setFps(Math.round(1000 / delta))
    }
    lastTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [])

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
    addHistory('hardware', 'Display Calibration Audit', 'pass', { mode: activeMode?.label, fps: `${fps}Hz` })
    onResult?.('pass'); 
    exit() 
  }

  const markFail = () => {
    addHistory('hardware', 'Display Calibration Audit', 'fail', { mode: activeMode?.label, detected_fps: `${fps}Hz` })
    onResult?.('fail')
    exit()
  }

  const renderPattern = (id) => {
    if (id === 'smpte') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '3fr 1fr 1fr' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['#808080', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].map((c, i) => <div key={i} style={{ background: c }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['#0000c0', '#131313', '#c000c0', '#131313', '#00c0c0', '#131313', '#c0c0c0'].map((c, i) => <div key={i} style={{ background: c }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 3fr' }}>
            {['#00213c', '#ffffff', '#00003b', '#131313'].map((c, i) => <div key={i} style={{ background: c }} />)}
          </div>
        </div>
      )
    }
    if (id === 'gamma') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ flex: 1, background: `linear-gradient(90deg, #000, #fff)`, position: 'relative' }}>
               <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px)' }} />
            </div>
          ))}
        </div>
      )
    }
    if (id === 'sharpness') {
      return (
        <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(0deg, #333 0px, #333 1px, #111 1px, #111 2px), repeating-linear-gradient(90deg, #333 0px, #333 1px, #111 1px, #111 2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ width: 400, height: 400, border: '4px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 10, color: '#fff', textAlign: 'center', letterSpacing: 4 }}>
                 PIXEL_ALIGNMENT_TARGET<br/>CENTER_BIAS_VALIDATION
              </div>
           </div>
        </div>
      )
    }
    return null
  }

  if (fullscreen && activeMode) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: activeMode.bg.length === 7 ? activeMode.bg : '#000',
          cursor: 'none',
        }}
        onClick={exit}
      >
        {renderPattern(activeMode.id)}
        
        {/* Persistent Technician Overlay */}
        <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(0,0,0,0.8)', padding: '12px 24px', borderRadius: 8, border: '1px solid #333' }}>
           <div style={{ borderRight: '1px solid #333', paddingRight: 24 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, marginBottom: 4 }}>ACTIVE_MODE</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent)' }}>{activeMode.label.toUpperCase()}</div>
           </div>
           <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, marginBottom: 4 }}>DETECTED_REFRESH</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{fps}Hz</div>
           </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 16,
        }}>
          <button onClick={e => { e.stopPropagation(); markPass() }} className="btn-accent" style={{ background: '#000', border: '2px solid var(--status-pass)', color: 'var(--status-pass)' }}>VALIDATE_CALIBRATION</button>
          <button onClick={e => { e.stopPropagation(); markFail() }} className="btn-accent" style={{ background: '#000', border: '2px solid var(--status-fail)', color: 'var(--status-fail)' }}>SIGNAL_DEGRADATION</button>
          <button onClick={e => { e.stopPropagation(); exit() }} className="btn-accent" style={{ background: '#000', border: '2px solid #333', color: '#666' }}>ABORT</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Technician Insights Header */}
      <div className="card-elevated" style={{ borderLeft: '4px solid var(--accent)', padding: 24, background: 'var(--bg-secondary)' }}>
         <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <Monitor size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Display Audit Insights</h3>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div>
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 4 }}>KINETIC_REFRESH</div>
               <div className="text-mono" style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)' }}>{fps}Hz</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 400 }}>
             Inspect for backlight bleed in the corners during high-contrast tests. SMPTE bars ensure NTSC color parity. 
             Stuck pixels (on) appear as bright dots; dead pixels (off) as dark dots.
            </p>
         </div>
      </div>

      {/* Mode Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => enterMode(mode)}
            className="card glow-border"
            style={{
              background: mode.bg.length === 7 ? mode.bg : 'var(--bg-elevated)',
              padding: 24,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: mode.bg.length === 7 ? (mode.bg === '#ffffff' ? '#000' : '#fff') : 'var(--text-primary)', letterSpacing: 1, textTransform: 'uppercase' }}>
              {mode.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 9, fontWeight: 900, color: mode.bg.length === 7 ? (mode.bg === '#ffffff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)') : 'var(--accent)' }}>
               INITIALIZE_CALIBRATION <Maximize2 size={10} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
