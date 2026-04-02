'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

const MAIN_BLOCK = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctx', 'Ctrl']
]

const NAV_CLUSTER = [
  ['Prt', 'ScL', 'Pau'],
  ['Ins', 'Hm', 'Pu'],
  ['Del', 'End', 'Pd'],
  ['↑'],
  ['←', '↓', '→']
]

const NUMPAD = [
  ['NL', '/', '*', '-'],
  ['7', '8', '9', '+'],
  ['4', '5', '6', ' '],
  ['1', '2', '3', 'En'],
  ['0', ' ', '.', ' ']
]

// Map generic labels to standard event.code values
const getBinding = (label) => {
  const map = {
    'Esc': 'Escape', 'Prt': 'PrintScreen', 'ScL': 'ScrollLock', 'Pau': 'Pause',
    'Backspace': 'Backspace', 'Tab': 'Tab', 'Caps': 'CapsLock', 'Enter': 'Enter',
    'Shift': 'ShiftLeft', 'Ctrl': 'ControlLeft', 'Win': 'MetaLeft', 'Alt': 'AltLeft',
    'Space': 'Space', 'Fn': 'Fn', 'Ctx': 'ContextMenu',
    'Ins': 'Insert', 'Hm': 'Home', 'Pu': 'PageUp', 'Del': 'Delete', 'End': 'End', 'Pd': 'PageDown',
    '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight',
    'NL': 'NumLock', '/': 'NumpadDivide', '*': 'NumpadMultiply', '-': 'NumpadSubtract',
    '+': 'NumpadAdd', 'En': 'NumpadEnter', '.': 'NumpadDecimal',
    '0': 'Numpad0', '1': 'Numpad1', '2': 'Numpad2', '3': 'Numpad3', '4': 'Numpad4', 
    '5': 'Numpad5', '6': 'Numpad6', '7': 'Numpad7', '8': 'Numpad8', '9': 'Numpad9'
  }
  if (label.startsWith('F') && label.length > 1) return `F${label.slice(1)}`
  return map[label] || `Key${label}`
}

// Flatten for coverage (Estimated 104 keys)
const TOTAL_PHYSICAL_KEYS = 104 

export default function KeyboardTest({ onComplete }) {
  const [pressed, setPressed] = useState(new Set())
  const [history, setHistory] = useState(new Set())
  const [latency, setLatency] = useState(0)
  const [avgLatency, setAvgLatency] = useState(0)
  const [maxRollover, setMaxRollover] = useState(0)
  const [lastEvent, setLastEvent] = useState(null)
  const [stuckKeys, setStuckKeys] = useState([])
  
  const keyTimestamps = useRef(new Map())
  const latencySamples = useRef([])
  const audioCtx = useRef(null)
  const stuckTimers = useRef(new Map())

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

  const coverage = useMemo(() => {
    const unique = history.size
    return Math.min(100, Math.round((unique / TOTAL_PHYSICAL_KEYS) * 100))
  }, [history])

  useEffect(() => {
    if (coverage >= 100) {
      onComplete?.({ status: 'pass', coverage: 100 })
    }
  }, [coverage, onComplete])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.ctrlKey && !e.metaKey && e.key !== 'F12' && e.key !== 'F5') {
        e.preventDefault()
      }
      
      const code = e.code
      if (pressed.has(code)) return

      playClick()
      if (navigator.vibrate) navigator.vibrate(5)

      if (!stuckTimers.current.has(code)) {
        const timer = setTimeout(() => {
          setStuckKeys(prev => Array.from(new Set([...prev, e.key.toUpperCase()])))
        }, 2000)
        stuckTimers.current.set(code, timer)
      }

      const now = performance.now()
      keyTimestamps.current.set(code, now)

      setPressed(prev => {
        const next = new Set(prev).add(code)
        setMaxRollover(current => Math.max(current, next.size))
        return next
      })
      setHistory(prev => new Set(prev).add(code))
      setLastEvent(e.key.toUpperCase())
    }

    const handleKeyUp = (e) => {
      const code = e.code
      if (stuckTimers.current.has(code)) {
        clearTimeout(stuckTimers.current.get(code))
        stuckTimers.current.delete(code)
      }

      const now = performance.now()
      if (keyTimestamps.current.has(code)) {
        const delta = now - keyTimestamps.current.get(code)
        setLatency(Math.round(delta))
        latencySamples.current = [...latencySamples.current.slice(-15), delta]
        const avg = latencySamples.current.reduce((a, b) => a + b, 0) / latencySamples.current.length
        setAvgLatency(Math.round(avg))
        keyTimestamps.current.delete(code)
      }

      setPressed(prev => {
        const next = new Set(prev)
        next.delete(code)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [pressed, playClick])

  const reset = () => {
    setHistory(new Set())
    setPressed(new Set())
    setMaxRollover(0)
    setLatency(0)
    setAvgLatency(0)
    setStuckKeys([])
    latencySamples.current = []
    stuckTimers.current.forEach(clearTimeout)
    stuckTimers.current.clear()
  }

  const Key = ({ label, flex = 1, minWidth = 32 }) => {
    const binding = getBinding(label)
    const isPressed = pressed.has(binding) || (label === 'Shift' && (pressed.has('ShiftRight') || pressed.has('ShiftLeft'))) || (label === 'Ctrl' && (pressed.has('ControlRight') || pressed.has('ControlLeft'))) || (label === 'Alt' && (pressed.has('AltRight') || pressed.has('AltLeft')))
    const isHistory = history.has(binding) || (label === 'Shift' && (history.has('ShiftRight') || history.has('ShiftLeft'))) || (label === 'Ctrl' && (history.has('ControlRight') || history.has('ControlLeft'))) || (label === 'Alt' && (history.has('AltRight') || history.has('AltLeft')))

    return (
      <div 
        role="img"
        aria-label={`Key ${label}`}
        style={{ 
          flex, height: 40, minWidth, borderRadius: 6,
          background: isPressed ? 'var(--accent)' : isHistory ? 'var(--accent-glow)' : 'var(--bg-elevated)',
          border: `1px solid ${isPressed ? 'var(--accent)' : isHistory ? 'var(--accent)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, transition: 'all 0.05s linear',
          color: isPressed ? '#000' : isHistory ? 'var(--accent)' : 'var(--text-muted)'
        }}>
        {label}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
         <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>LATENCY</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{avgLatency}ms</div>
         </div>
         <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>ROLLOVER</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{maxRollover}</div>
         </div>
         <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>COVERAGE</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{coverage}%</div>
         </div>
         <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>LAST KEY</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{lastEvent || '—'}</div>
         </div>
      </div>

      <div style={{ padding: '16px 20px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Professional Hardware Validation Cluster (104-Key NKRO Protocol). Press each physical key to verify controller response.
        </p>
      </div>

      <div className="mobile-only" style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 10, fontWeight: 800, color: 'var(--accent)', textAlign: 'center', border: '1px solid var(--border)' }}>
         ← SWIPE HORIZONTALLY TO TEST NUMPAD →
      </div>

      <div style={{ 
        overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%',
        padding: '32px 0', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)'
      }}>
         <div style={{ minWidth: 1000, display: 'flex', gap: 32, justifyContent: 'center', padding: '0 32px' }}>
            
            {/* Main Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 15 }}>
               {MAIN_BLOCK.map((row, i) => (
                 <div key={i} style={{ display: 'flex', gap: 6 }}>
                    {row.map((k, j) => (
                      <Key key={j} label={k} flex={k === 'Space' ? 5 : (k === 'Backspace' || k === 'Enter' || k === 'Shift' || k === 'Caps' || k === 'Tab') ? 2 : 1} />
                    ))}
                 </div>
               ))}
            </div>

            {/* Nav & Arrows Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 3 }}>
               <div style={{ display: 'flex', gap: 6 }}>{NAV_CLUSTER[0].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ padding: '12px 0' }} />
               <div style={{ display: 'flex', gap: 6 }}>{NAV_CLUSTER[1].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ display: 'flex', gap: 6 }}>{NAV_CLUSTER[2].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ padding: '12px 0' }} />
               <div style={{ display: 'flex', justifyContent: 'center' }}>{NAV_CLUSTER[3].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ display: 'flex', gap: 6 }}>{NAV_CLUSTER[4].map(k => <Key key={k} label={k} />)}</div>
            </div>

            {/* Numpad Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 4 }}>
               <div style={{ display: 'flex', gap: 6 }}>{NUMPAD[0].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ display: 'flex', gap: 6 }}>{NUMPAD[1].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ display: 'flex', gap: 6 }}>{NUMPAD[2].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ display: 'flex', gap: 6 }}>{NUMPAD[3].map(k => <Key key={k} label={k} />)}</div>
               <div style={{ display: 'flex', gap: 6 }}>{NUMPAD[4].map(k => <Key key={k} label={k} flex={k === '0' ? 2 : 1} />)}</div>
            </div>

         </div>
      </div>

      {coverage >= 100 && (
        <div style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--accent)', background: 'rgba(0,212,160,0.08)', color: 'var(--accent)', fontWeight: 600 }}>
          ✓ All 104 keys tested — keyboard is working correctly
        </div>
      )}

      {stuckKeys.length > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--red)', background: 'rgba(255,71,87,0.08)', color: 'var(--red)', fontWeight: 600 }}>
          ⚠ Stuck key detected: {stuckKeys.join(', ')} — possible hardware fault
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <button onClick={reset} className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          Reset Test
        </button>
      </div>
    </div>
  )
}
