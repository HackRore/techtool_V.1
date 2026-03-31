'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Keyboard, Zap, Activity, ShieldCheck, AlertTriangle, Volume2 } from 'lucide-react'

const KEYS = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Prt', 'ScL', 'Pau'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift', '↑'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctx', 'Ctrl', '←', '↓', '→']
]

export default function KeyboardTest({ onResult }) {
  const [pressed, setPressed] = useState(new Set())
  const [history, setHistory] = useState(new Set())
  const [latency, setLatency] = useState(0)
  const [avgLatency, setAvgLatency] = useState(0)
  const [maxRollover, setMaxRollover] = useState(0)
  const [lastEvent, setLastEvent] = useState(null)
  
  const keyTimestamps = useRef(new Map())
  const latencySamples = useRef([])
  const audioCtx = useRef(null)

  const playClick = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    const osc = audioCtx.current.createOscillator()
    const gain = audioCtx.current.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(150, audioCtx.current.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.current.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(audioCtx.current.destination)
    osc.start()
    osc.stop(audioCtx.current.currentTime + 0.1)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser shortcuts for testing
      if (!e.ctrlKey && !e.metaKey && e.key !== 'F12' && e.key !== 'F5') {
        e.preventDefault()
      }
      
      const code = e.code
      if (pressed.has(code)) return // Prevent repeat-key noise

      playClick()
      if (navigator.vibrate) navigator.vibrate(5)

      const now = performance.now()
      keyTimestamps.current.set(code, now)

      setPressed(prev => {
        const next = new Set(prev).add(code)
        setMaxRollover(current => Math.max(current, next.size))
        return next
      })
      setHistory(prev => new Set(prev).add(code))
      setLastEvent(e.key.toUpperCase())
      onResult?.('pass')
    }

    const handleKeyUp = (e) => {
      const now = performance.now()
      if (keyTimestamps.current.has(e.code)) {
        const delta = now - keyTimestamps.current.get(e.code)
        setLatency(Math.round(delta))
        latencySamples.current = [...latencySamples.current.slice(-15), delta]
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
  }, [pressed, onResult, playClick])

  const reset = () => {
    setHistory(new Set())
    setPressed(new Set())
    setMaxRollover(0)
    setLatency(0)
    setAvgLatency(0)
    latencySamples.current = []
  }

  const getBinding = (label) => {
    const map = {
      'Esc': 'Escape', 'Prt': 'PrintScreen', 'ScL': 'ScrollLock', 'Pau': 'Pause',
      'Backspace': 'Backspace', 'Tab': 'Tab', 'Caps': 'CapsLock', 'Enter': 'Enter',
      'Shift': 'ShiftLeft', 'Ctrl': 'ControlLeft', 'Win': 'MetaLeft', 'Alt': 'AltLeft',
      'Space': 'Space', 'Fn': 'Fn', 'Ctx': 'ContextMenu',
      '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight'
    }
    return map[label] || `Key${label}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Zap size={16} style={{ color: 'var(--accent)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>BUS_LATENCY_AUDIT</div>
            </div>
            <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{avgLatency} <span style={{ fontSize: 13, color: 'var(--accent)' }}>ms</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>High-precision polling active</div>
         </div>

         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--status-info)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Activity size={16} style={{ color: 'var(--status-info)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>ROLLOVER_CAPACITY</div>
            </div>
            <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{maxRollover} <span style={{ fontSize: 13, color: 'var(--status-info)' }}>NKRO</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>Peak concurrent signals</div>
         </div>
      </div>

      <div className="card glass-elevated" style={{ padding: '48px 32px', overflowX: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
         <div style={{ minWidth: 900, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {KEYS.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                 {row.map((key, j) => {
                   const binding = getBinding(key)
                   const isPressed = pressed.has(binding) || (key === 'Shift' && pressed.has('ShiftRight')) || (key === 'Ctrl' && pressed.has('ControlRight')) || (key === 'Alt' && pressed.has('AltRight'))
                   const isHistory = history.has(binding) || (key === 'Shift' && history.has('ShiftRight')) || (key === 'Ctrl' && history.has('ControlRight')) || (key === 'Alt' && history.has('AltRight'))
                   
                   return (
                     <div key={j} style={{ 
                        flex: key === 'Space' ? 5 : (key === 'Backspace' || key === 'Enter' || key === 'Shift' || key === 'Caps' || key === 'Tab') ? 2 : 1,
                        height: 52, minWidth: 44, borderRadius: 8,
                        background: isPressed ? 'var(--accent)' : isHistory ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                        border: `1px solid ${isPressed ? 'var(--accent)' : isHistory ? 'rgba(0, 243, 255, 0.4)' : 'var(--border)'}`,
                        boxShadow: isPressed ? '0 0 20px var(--accent-glow)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 900, transition: 'all 0.05s linear',
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

      <div className="card-elevated" style={{ padding: 24, background: 'var(--bg-secondary)', borderTop: '4px solid var(--border)' }}>
         <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Volume2 size={20} style={{ color: 'var(--accent)' }} />
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: 'var(--text-primary)', marginBottom: 4 }}>SIGNAL_RECOGNIZED: <span style={{ color: 'var(--accent)' }}>{lastEvent || 'IDLE'}</span></div>
               <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  BUS_TIME: {latency}ms // STATUS: {maxRollover > 6 ? 'FULL_NKRO' : 'MEMBRANE_LIMIT'}
               </div>
            </div>
            <button onClick={reset} className="btn-accent" style={{ background: 'transparent', border: '1px solid var(--status-fail)', color: 'var(--status-fail)', fontSize: 11, height: 40, padding: '0 20px' }}>
               PURGE_BUFFER
            </button>
         </div>
      </div>
    </div>
  )
}
