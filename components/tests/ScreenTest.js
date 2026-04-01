'use client'
import { useState, useEffect, useRef } from 'react'
import { useHistory } from '../HistoryProvider'
import { Monitor, Maximize2, ShieldCheck, Activity, AlertTriangle, Zap } from 'lucide-react'

const MODES = [
  { id: 'bleed',      label: 'Backlight Bleed',  bg: '#000000', text: '#333' },
  { id: 'white',      label: 'Dead Pixel (W)',  bg: '#ffffff', text: '#ccc' },
  { id: 'red',        label: 'Red Channel',      bg: '#ff0000', text: '#666' },
  { id: 'green',      label: 'Green Channel',    bg: '#00ff00', text: '#666' },
  { id: 'blue',       label: 'Blue Channel',     bg: '#0000ff', text: '#666' },
  { id: 'sync',       label: 'Jitter & Sync',    bg: 'sync',    text: '#aaa' },
  { id: 'subpixel',   label: 'Sub-Pixel Grid',   bg: 'subpixel', text: '#aaa' },
  { id: 'persistence',label: 'Image Retention',  bg: 'persistence', text: '#aaa' },
  { id: 'smpte',      label: 'SMPTE Color Bars', bg: 'smpte',   text: '#aaa' },
]

export default function ScreenTest({ onResult }) {
  const { addHistory } = useHistory()
  const [activeMode, setActiveMode] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [fps, setFps] = useState(0)
  const [frameHistory, setFrameHistory] = useState([])
  const requestRef = useRef()
  const lastTimeRef = useRef()

  const animate = time => {
    if (lastTimeRef.current !== undefined) {
      const delta = time - lastTimeRef.current
      const currentFps = Math.round(1000 / delta)
      setFps(currentFps)
      if (time % 500 < 20) { // Throttle history updates
        setFrameHistory(prev => [...prev.slice(-30), currentFps])
      }
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
    addHistory('hardware', 'Display Pulse Audit', 'pass', { mode: activeMode?.label, fps: `${fps}Hz` })
    onResult?.('pass'); 
    exit() 
  }

  const markFail = () => {
    addHistory('hardware', 'Display Pulse Audit', 'fail', { mode: activeMode?.label, detected_fps: `${fps}Hz` })
    onResult?.('fail')
    exit()
  }

  const renderPattern = (id) => {
    if (id === 'sync') {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>
           <div className="moving-bar" style={{ 
             position: 'absolute', top: 0, bottom: 0, width: 4, background: 'var(--accent)',
             animation: 'moveLR 2s linear infinite', borderRight: '20px solid rgba(0, 243, 255, 0.1)'
           }} />
           <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#333' }} />
           <style jsx>{`
             @keyframes moveLR {
               0% { transform: translateX(-10vw); }
               100% { transform: translateX(110vw); }
             }
           `}</style>
           <div style={{ position: 'absolute', bottom: 100, right: 100, fontSize: 10, color: '#333', fontFamily: 'var(--font-mono)' }}>
              SYNC_PULSE_VALIDATION // NO_TEARING_ZONE
           </div>
        </div>
      )
    }
    if (id === 'subpixel') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(100, 1fr)', gap: 1 }}>
           {[...Array(2000)].map((_, i) => (
             <div key={i} style={{ aspectRatio: '1', background: i % 3 === 0 ? '#f00' : i % 3 === 1 ? '#0f0' : '#00f', opacity: 0.8 }} />
           ))}
        </div>
      )
    }
    if (id === 'persistence') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
           <div style={{ width: '50%', height: '50%', background: '#fff', boxShadow: '0 0 100px #fff' }} />
           <div style={{ position: 'absolute', top: 20, right: 20, width: 200, fontSize: 9, color: '#444' }}>
              STARE FOR 30S THEN EXIT. IF GHOST REMAINS {'->'} PERSISTENCE DETECTED.
           </div>
        </div>
      )
    }
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
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
       {fullscreen && activeMode ? (
         <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: activeMode.bg.length === 7 ? activeMode.bg : '#000', cursor: 'none' }} onClick={exit}>
           {renderPattern(activeMode.id)}
           <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(0,0,0,0.9)', padding: '12px 24px', borderRadius: 8, border: '1px solid #333', backdropFilter: 'blur(10px)' }}>
              <div>
                 <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, marginBottom: 4 }}>MODE</div>
                 <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent)' }}>{activeMode.label.toUpperCase()}</div>
              </div>
              <div>
                 <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, marginBottom: 4 }}>REFRESH</div>
                 <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{fps}Hz</div>
              </div>
           </div>

           <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 16 }}>
              <button onClick={e => { e.stopPropagation(); markPass() }} className="btn-accent" style={{ background: '#000', border: '2px solid var(--status-pass)', color: 'var(--status-pass)' }}>VALIDATE_PASS</button>
              <button onClick={e => { e.stopPropagation(); markFail() }} className="btn-accent" style={{ background: '#000', border: '2px solid var(--status-fail)', color: 'var(--status-fail)' }}>SIGNAL_FAIL</button>
              <button onClick={e => { e.stopPropagation(); exit() }} className="btn-accent" style={{ background: '#000', border: '2px solid #333', color: '#666' }}>ABORT</button>
           </div>
         </div>
       ) : (
         <>
           <div className="card-elevated" style={{ borderLeft: '4px solid var(--accent)', padding: 24, background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                 <Activity size={20} style={{ color: 'var(--accent)' }} />
                 <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Visual Frequency Audit</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                 <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 4 }}>STABILITY_LOG</div>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24 }}>
                       {frameHistory.map((v, i) => (
                         <div key={i} style={{ width: 4, height: `${(v/144)*100}%`, background: v < 55 ? 'var(--status-fail)' : 'var(--accent)', opacity: 0.6 }} />
                       ))}
                    </div>
                 </div>
                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Inspect for backlight bleed in the corners. Use SMPTE for NTSC color validation. 
                  Sub-pixel grid helps identify specific failing pixel sub-nodes (R, G, or B).
                 </p>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
             {MODES.map(mode => (
               <button key={mode.id} onClick={() => enterMode(mode)} className="card glow-border" style={{ 
                 background: mode.bg.length === 7 ? mode.bg : 'var(--bg-elevated)', 
                 padding: 24, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)' 
               }}>
                 <div style={{ fontSize: 11, fontWeight: 900, color: mode.bg.length === 7 ? (mode.bg === '#ffffff' ? '#000' : '#fff') : 'var(--text-primary)', letterSpacing: 1, textTransform: 'uppercase' }}>
                   {mode.label}
                 </div>
               </button>
             ))}
           </div>
         </>
       )}
    </div>
  )
}
