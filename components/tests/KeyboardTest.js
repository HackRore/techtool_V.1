'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Zap, Activity, Volume2 } from 'lucide-react'

const KEYS = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Prt', 'ScL', 'Pau'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift', '↑'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctx', 'Ctrl', '←', '↓', '→']
]

// Flatten keys for coverage calculation (approx 104 keys)
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

      // Stuck key detection (2000ms)
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
      
      // Clear stuck timer
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
          Click anywhere in the keyboard area below, then press each physical key.
        </p>
      </div>

      <div style={{ 
        overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%',
        padding: '24px 0', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)'
      }}>
         <div style={{ minWidth: 720, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {KEYS.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '0 20px' }}>
                 {row.map((key, j) => {
                   const binding = getBinding(key)
                   const isPressed = pressed.has(binding) || (key === 'Shift' && pressed.has('ShiftRight')) || (key === 'Ctrl' && pressed.has('ControlRight')) || (key === 'Alt' && pressed.has('AltRight'))
                   const isHistory = history.has(binding) || (key === 'Shift' && history.has('ShiftRight')) || (key === 'Ctrl' && history.has('ControlRight')) || (key === 'Alt' && history.has('AltRight'))
                   
                   return (
                     <div key={j} style={{ 
                        flex: key === 'Space' ? 5 : (key === 'Backspace' || key === 'Enter' || key === 'Shift' || key === 'Caps' || key === 'Tab') ? 2 : 1,
                        height: 44, minWidth: 32, borderRadius: 6,
                        background: isPressed ? 'var(--accent)' : isHistory ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                        border: `1px solid ${isPressed ? 'var(--accent)' : isHistory ? 'var(--accent)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, transition: 'all 0.05s linear',
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
