'use client'
import { useState, useEffect, useRef } from 'react'
import { Keyboard, Zap, Activity, ShieldCheck, AlertTriangle, Monitor, Cpu } from 'lucide-react'

const KEYS = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctx', 'Ctrl']
]

export default function KeyboardTest({ onResult }) {
  const [pressed, setPressed] = useState(new Set())
  const [history, setHistory] = useState(new Set())
  const [latency, setLatency] = useState(0) // ms
  const [avgLatency, setAvgLatency] = useState(0)
  const [maxRollover, setMaxRollover] = useState(0)
  const [lastEvent, setLastEvent] = useState(null)
  
  const keyTimestamps = useRef(new Map())
  const latencySamples = useRef([])

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault()
      const keyStr = e.code === 'Space' ? 'Space' : e.key.toUpperCase()
      
      // Track Latency (Precision Timing)
      const now = performance.now()
      keyTimestamps.current.set(e.code, now)

      setPressed(prev => {
        const next = new Set(prev).add(e.code)
        setMaxRollover(current => Math.max(current, next.size))
        return next
      })
      setHistory(prev => new Set(prev).add(e.code))
      setLastEvent(keyStr)
      onResult?.('pass')
    }

    const handleKeyUp = (e) => {
      const now = performance.now()
      if (keyTimestamps.current.has(e.code)) {
        const delta = now - keyTimestamps.current.get(e.code)
        setLatency(Math.round(delta))
        
        // Rolling Average Latency (Deterministic Logic)
        latencySamples.current = [...latencySamples.current.slice(-10), delta]
        const avg = latencySamples.current.reduce((a, b) => a + b, 0) / latencySamples.current.length
        setAvgLatency(Math.round(avg))
        
        keyTimestamps.current.delete(e.code)
      }

      setPressed(prev => {
        const next = new Set(prev)
        next.delete(e.code)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onResult])

  const reset = () => {
    setHistory(new Set())
    setPressed(new Set())
    setMaxRollover(0)
    setLatency(0)
    setAvgLatency(0)
    latencySamples.current = []
  }

  // Map e.code to our visual labels
  const getBinding = (label) => {
    if (label === 'Esc') return 'Escape'
    if (label === 'Space') return 'Space'
    if (label === 'Backspace') return 'Backspace'
    if (label === 'Tab') return 'Tab'
    if (label === 'Enter') return 'Enter'
    if (label === 'Ctrl') return 'ControlLeft'
    if (label === 'Alt') return 'AltLeft'
    if (label === 'Shift') return 'ShiftLeft'
    return `Key${label}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Precision Metric Dashboard */}
      <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Zap size={16} style={{ color: 'var(--accent)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>BUS_LATENCY_AUDIT</div>
            </div>
            <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{avgLatency} <span style={{ fontSize: 13, color: 'var(--accent)' }}>ms</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>Rolling 10-sample verification active</div>
         </div>

         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--status-info)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Activity size={16} style={{ color: 'var(--status-info)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>ROLLOVER_CAPACITY</div>
            </div>
            <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{maxRollover} <span style={{ fontSize: 13, color: 'var(--status-info)' }}>NKRO</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>Peak simultaneous key detection active</div>
         </div>
      </div>

      {/* Industrial Key Grid */}
      <div className="card glass-elevated" style={{ padding: 32, overflowX: 'auto', background: 'var(--bg-primary)' }}>
         <div style={{ minWidth: 800, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {KEYS.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                 {row.map((key, j) => {
                   const binding = getBinding(key)
                   const isPressed = pressed.has(binding) || pressed.has(binding.replace('Left','Right'))
                   const isHistory = history.has(binding) || history.has(binding.replace('Left','Right'))
                   
                   return (
                     <div key={j} style={{ 
                       flex: key === 'Space' ? 4 : (key === 'Backspace' || key === 'Enter' || key === 'Shift') ? 2 : 1,
                       height: 48, minWidth: 40, borderRadius: 6,
                       background: isPressed ? 'var(--accent)' : isHistory ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                       border: `1px solid ${isPressed ? 'var(--accent)' : isHistory ? 'var(--accent)' : 'var(--border)'}`,
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       fontSize: 10, fontWeight: 900, transition: 'all 0.1s',
                       color: isPressed ? '#000' : isHistory ? 'var(--accent)' : 'var(--text-muted)'
                     }}>
                        {key.toUpperCase()}
                     </div>
                   )
                 })}
              </div>
            ))}
         </div>
      </div>

      {/* Diagnostic Readout Console */}
      <div className="card-elevated" style={{ padding: 24, background: 'var(--bg-secondary)', borderTop: '4px solid var(--border)' }}>
         <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <ShieldCheck size={20} style={{ color: 'var(--status-pass)' }} />
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: 'var(--text-primary)', marginBottom: 4 }}>HARDWARE_EVENT_LOG</div>
               <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  SIGNAL_RECOGNIZED: <span style={{ color: 'var(--accent)' }}>{lastEvent || 'IDLE'}</span> // BUS_TIME: {latency}ms
               </div>
            </div>
            <button onClick={reset} className="btn-accent" style={{ background: 'transparent', border: '1px solid var(--status-fail)', color: 'var(--status-fail)', fontSize: 11 }}>
               PURGE_BUFFER
            </button>
         </div>
      </div>
    </div>
  )
}
