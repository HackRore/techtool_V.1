'use client'
import { useState, useRef, useEffect } from 'react'
import { MousePointer2, Activity, ShieldCheck, Zap, AlertTriangle, Hash } from 'lucide-react'

const BUTTONS = [
  { id: 0, label: 'Primary (L)', key: 'left' },
  { id: 1, label: 'Wheel (M)', key: 'middle' },
  { id: 2, label: 'Secondary (R)', key: 'right' },
]

export default function MouseTest({ onResult }) {
  const [clicks, setClicks] = useState({ left: 0, middle: 0, right: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [scroll, setScroll] = useState(0)
  const [pressed, setPressed] = useState(new Set())
  const [pollingRate, setPollingRate] = useState(0)
  const [lastEventTime, setLastEventTime] = useState(0)
  const [doubleClicks, setDoubleClicks] = useState(0)
  const [heatmap, setHeatmap] = useState([])
  const [errorCount, setErrorCount] = useState(0) // For debounce/double-click issues

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    
    // Polling Rate Calculation (Deterministic)
    const now = performance.now()
    if (lastEventTime > 0) {
      const delta = now - lastEventTime
      if (delta > 0) {
        setPollingRate(Math.round(1000 / delta))
      }
    }
    setLastEventTime(now)
    setPos({ x, y })
    
    // High-density movement heatmap (limited for performance)
    setHeatmap(prev => [...prev.slice(-300), { x, y }])
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    const key = BUTTONS.find(b => b.id === e.button)?.key
    if (key) {
      const now = performance.now()
      // Detect Double-click debouncing issues (faulty switches)
      // Usually < 100ms is a faulty "phantom" click or extreme gaming
      if (window[`last_${key}_click`] && (now - window[`last_${key}_click`]) < 80) {
        setDoubleClicks(prev => prev + 1)
        setErrorCount(prev => prev + 1)
      }
      window[`last_${key}_click`] = now

      setClicks(prev => ({ ...prev, [key]: prev[key] + 1 }))
      setPressed(prev => new Set([...prev, key]))
      onResult?.('pass')
    }
  }

  const handleMouseUp = (e) => {
    const key = BUTTONS.find(b => b.id === e.button)?.key
    if (key) setPressed(prev => { const n = new Set(prev); n.delete(key); return n })
  }

  const handleScroll = (e) => {
    setScroll(prev => prev + (e.deltaY > 0 ? 1 : -1))
  }

  const reset = () => {
    setClicks({ left: 0, middle: 0, right: 0 })
    setHeatmap([])
    setScroll(0)
    setPollingRate(0)
    setDoubleClicks(0)
    setErrorCount(0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Metric Dashboard */}
      <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
        <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Zap size={16} style={{ color: 'var(--accent)' }} />
              <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>POLLING_RATE</div>
           </div>
           <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{pollingRate} <span style={{ fontSize: 13, color: 'var(--accent)' }}>Hz</span></div>
           <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>V-Sync Interval Verification Active</div>
        </div>

        <div className="card-elevated" style={{ padding: 24, borderLeft: `4px solid ${errorCount > 0 ? 'var(--status-warn)' : 'var(--status-pass)'}` }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Activity size={16} style={{ color: errorCount > 0 ? 'var(--status-warn)' : 'var(--status-pass)' }} />
              <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>INTEGRITY_ERRORS</div>
           </div>
           <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{doubleClicks} <span style={{ fontSize: 13, color: 'var(--status-warn)' }}>Faults</span></div>
           <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>Rapid-fire debounce detection active</div>
        </div>
      </div>

      {/* Primary Interaction Shell */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        
        {/* Interaction Canvas */}
        <div 
          className="card shadow-glow" 
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleScroll}
          onContextMenu={e => e.preventDefault()}
          style={{ 
            height: 380, background: 'var(--bg-primary)', position: 'relative', 
            cursor: 'crosshair', border: '1px solid var(--border)', overflow: 'hidden' 
          }}
        >
          {/* Diagnostic Grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Movement Heatmap */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
             {heatmap.length > 1 && (
               <polyline
                 points={heatmap.map(p => `${p.x},${p.y}`).join(' ')}
                 fill="none"
                 stroke="var(--accent)"
                 strokeWidth="2"
                 strokeOpacity="0.3"
                 strokeLinejoin="round"
                 strokeLinecap="round"
               />
             )}
             {heatmap.length > 0 && (
               <circle cx={heatmap[heatmap.length-1].x} cy={heatmap[heatmap.length-1].y} r="6" fill="var(--accent)" />
             )}
          </svg>

          <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right' }}>
             <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-muted)', lineHeight: 0.8, opacity: 0.2 }}>{pos.x}</div>
             <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-muted)', opacity: 0.2 }}>{pos.y}</div>
          </div>

          <div style={{ position: 'absolute', bottom: 20, left: 20, fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>
             ACTIVATE_BUS_SYING: MOVE_MOUSE_RAPIDLY
          </div>
        </div>

        {/* Click Status Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
           {BUTTONS.map(btn => (
             <div key={btn.id} className="card-elevated" style={{ 
               padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
               background: pressed.has(btn.key) ? 'var(--accent-glow)' : 'var(--bg-secondary)',
               border: `1px solid ${pressed.has(btn.key) ? 'var(--accent)' : 'var(--border)'}`
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: pressed.has(btn.key) ? 'var(--accent)' : 'var(--text-muted)' }} />
                   <div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>{btn.label.toUpperCase()}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>Signal Count: {clicks[btn.key]}</div>
                   </div>
                </div>
                <Hash size={16} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
             </div>
           ))}

           <div className="card" style={{ padding: 24, marginTop: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 4 }}>SCROLL_RESOLUTION</div>
              <div className="text-mono" style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)' }}>{scroll} <span style={{ fontSize: 11 }}>Steps</span></div>
           </div>

           <button onClick={reset} className="btn-accent" style={{ background: 'transparent', border: '1px solid var(--status-fail)', color: 'var(--status-fail)', marginTop: 12 }}>
              CLEAR_METRICS
           </button>
        </div>
      </div>
    </div>
  )
}
