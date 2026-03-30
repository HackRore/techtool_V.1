'use client'
import { useState, useRef, useEffect } from 'react'
import { Monitor, Zap, Activity, ShieldCheck, AlertTriangle, Fingerprint, Crosshair, Hash } from 'lucide-react'

export default function TouchTest({ onResult }) {
  const [points, setPoints] = useState([])
  const [history, setHistory] = useState([])
  const [rect, setRect] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect())
    }
    const handleResize = () => setRect(containerRef.current?.getBoundingClientRect())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePointer = (e) => {
    if (!rect) return
    const newPoints = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
    const currentPoints = []
    
    // In actual multi-touch, we'd use e.targetTouches, but pointer events
    // are more robust for professional digitizer audits.
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    const pressure = e.pressure || 0
    const tilt = e.tiltX || 0
    
    setPoints(prev => {
      const updated = [...prev.slice(-10), { x, y, pressure, tilt, id: e.pointerId }]
      onResult?.('pass')
      return updated
    })
    
    setHistory(prev => [...prev.slice(-100), { x, y }])
  }

  const clear = () => {
    setPoints([])
    setHistory([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Precision Metric Dashboard */}
      <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Fingerprint size={16} style={{ color: 'var(--accent)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>TOUCH_INTENSITY</div>
            </div>
            <div className="text-mono" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>
               {points.length > 0 ? (points[points.length-1].pressure * 100).toFixed(1) : '00.0'}% <span style={{ fontSize: 13, color: 'var(--accent)' }}>PSI</span>
            </div>
         </div>

         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--status-info)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Crosshair size={16} style={{ color: 'var(--status-info)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>COORDINATE_RES</div>
            </div>
            <div className="text-mono" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>
               {points.length > 0 ? `${points[points.length-1].x}×${points[points.length-1].y}` : '0000×0000'}
            </div>
         </div>
      </div>

      {/* Touch Interaction Sandbox */}
      <div 
        ref={containerRef}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        className="card shadow-glow"
        style={{ 
          height: 400, background: 'var(--bg-primary)', position: 'relative', 
          cursor: 'none', touchAction: 'none', border: '1px solid var(--border)', overflow: 'hidden' 
        }}
      >
         {/* Diagnostic Grid */}
         <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
            <pattern id="touchGrid" width="50" height="50" patternUnits="userSpaceOnUse">
               <circle cx="25" cy="25" r="1" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#touchGrid)" />
         </svg>

         {/* Continuous History Trail */}
         <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {history.length > 1 && (
               <polyline
                 points={history.map(p => `${p.x},${p.y}`).join(' ')}
                 fill="none"
                 stroke="var(--accent)"
                 strokeWidth="2"
                 strokeOpacity="0.2"
               />
            )}
            {points.map(p => (
               <g key={p.id}>
                  <circle cx={p.x} cy={p.y} r={10 + p.pressure * 20} fill="var(--accent-glow)" stroke="var(--accent)" strokeWidth="2" />
                  <line x1={p.x - 20} y1={p.y} x2={p.x + 20} y2={p.y} stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1={p.x} y1={p.y - 20} x2={p.x} y2={p.y + 20} stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />
               </g>
            ))}
         </svg>

         {points.length === 0 && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <Activity size={48} style={{ color: 'var(--text-muted)', opacity: 0.1, animation: 'aura-pulse 2s infinite' }} />
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 3 }}>DIAGNOSTIC_RESONANCE // WAITING_FOR_INPUT</div>
           </div>
         )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={clear} className="btn-accent" style={{ background: 'transparent', border: '1px solid var(--status-fail)', color: 'var(--status-fail)', fontSize: 11 }}>
               PURGE_DIGITIZER_BUFFER
            </button>
         </div>
         <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 800 }}>
            <span style={{ color: 'var(--status-info)' }}>PRO_TIP:</span> Multi-touch pressure verifies capacitive sensor health.
         </div>
      </div>
    </div>
  )
}
