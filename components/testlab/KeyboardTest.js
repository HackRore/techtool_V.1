'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const KEY_LAYOUT = [
  ['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','PrintScreen','ScrollLock','Pause'],
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace','Insert','Home','PageUp','NumLock','NumpadDivide','NumpadMultiply','NumpadSubtract'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\','Delete','End','PageDown','Numpad7','Numpad8','Numpad9','NumpadAdd'],
  ['CapsLock','a','s','d','f','g','h','j','k','l',';',"'",'Enter','Numpad4','Numpad5','Numpad6'],
  ['ShiftLeft','z','x','c','v','b','n','m',',','.','/','ShiftRight','ArrowUp','Numpad1','Numpad2','Numpad3','NumpadEnter'],
  ['ControlLeft','MetaLeft','AltLeft','Space','AltRight','MetaRight','ContextMenu','ControlRight','ArrowLeft','ArrowDown','ArrowRight','Numpad0','NumpadDecimal'],
]

const KEY_LABELS = {
  'Escape':'ESC','Backspace':'⌫','Tab':'TAB','CapsLock':'CAPS',
  'ShiftLeft':'SHIFT','ShiftRight':'SHIFT','Enter':'↵',
  'ControlLeft':'CTRL','ControlRight':'CTRL','AltLeft':'ALT','AltRight':'ALT',
  'MetaLeft':'WIN','MetaRight':'WIN','ContextMenu':'MENU','Space':'SPACE',
  'PrintScreen':'PRT','ScrollLock':'SCR','Pause':'PAU','Insert':'INS','Home':'HOM','PageUp':'PUP',
  'Delete':'DEL','End':'END','PageDown':'PDN','NumLock':'NUM',
  'ArrowUp':'↑','ArrowDown':'↓','ArrowLeft':'←','ArrowRight':'→',
  'NumpadDivide':'/','NumpadMultiply':'*','NumpadSubtract':'-','NumpadAdd':'+',
  'NumpadEnter':'ENT','NumpadDecimal':'.','Numpad0':'0','Numpad1':'1','Numpad2':'2','Numpad3':'3','Numpad4':'4','Numpad5':'5','Numpad6':'6','Numpad7':'7','Numpad8':'8','Numpad9':'9'
}

function getWidth(k) {
  const wide = { 
    'Backspace': 70, 'Tab': 55, 'CapsLock': 65, 'ShiftLeft': 90, 'ShiftRight': 90, 'Enter': 75, 
    'ControlLeft': 50, 'ControlRight': 50, 'AltLeft': 50, 'AltRight': 50, 'MetaLeft': 50, 'MetaRight': 50,
    'Space': 240, 'Numpad0': 80 
  }
  return wide[k] || 38
}

export default function KeyboardTest({ onResult }) {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [testedKeys, setTestedKeys]   = useState(new Set())
  const [stuckKeys, setStuckKeys]     = useState(new Set())
  const [status, setStatus]           = useState('idle')
  
  const pressTimers = useRef({})
  const allKeys = KEY_LAYOUT.flat()
  const totalKeys = 104 // Standard full layout count

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('hackrore_kb_tested')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setTestedKeys(new Set(parsed))
      } catch (e) { console.error('History load failed', e) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hackrore_kb_tested', JSON.stringify([...testedKeys]))
  }, [testedKeys])

  const handleKeyDown = useCallback(e => {
    e.preventDefault()
    const code = e.code
    const id = allKeys.find(x => x === code) || code
    
    setPressedKeys(prev => new Set([...prev, id]))
    setTestedKeys(prev => {
      const next = new Set([...prev, id])
      if (next.size >= totalKeys * 0.7 && status !== 'pass') {
        setStatus('pass')
        onResult?.('pass')
      }
      return next
    })

    // Stuck Key Detection: 2s
    if (!pressTimers.current[id]) {
      pressTimers.current[id] = setTimeout(() => {
        setStuckKeys(prev => new Set([...prev, id]))
      }, 2000)
    }

    setStatus(s => s === 'idle' ? 'testing' : s)
  }, [allKeys, status, onResult])

  const handleKeyUp = useCallback(e => {
    const code = e.code
    const id = allKeys.find(x => x === code) || code
    
    setPressedKeys(prev => { const n = new Set(prev); n.delete(id); return n })
    if (pressTimers.current[id]) {
      clearTimeout(pressTimers.current[id])
      delete pressTimers.current[id]
    }
  }, [allKeys])

  const restore = () => {
    setPressedKeys(new Set())
    setTestedKeys(new Set())
    setStuckKeys(new Set())
    localStorage.removeItem('hackrore_kb_tested')
    setStatus('idle')
    onResult?.('idle')
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const pct = Math.round((testedKeys.size / totalKeys) * 100)

  return (
    <div style={{ padding: 0 }}>
      {/* HUD Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
         <div className="card-elevated" style={{ padding: 20 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>COVERAGE</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{pct}%</div>
         </div>
         <div className="card-elevated" style={{ padding: 20 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>KEYS CHECKED</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{testedKeys.size}<span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/{totalKeys}</span></div>
         </div>
         <div className="card-elevated" style={{ padding: 20 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>SIGNAL STATE</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: status === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
               {status === 'pass' ? 'System Valid' : status.toUpperCase()}
            </div>
         </div>
         <div className="card-elevated" style={{ padding: 20 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>ANOMALIES</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stuckKeys.size > 0 ? 'var(--status-fail)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{stuckKeys.size}</div>
         </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 4, background: 'var(--border)', marginBottom: 40, borderRadius: 2, overflow: 'hidden' }}>
         <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
      </div>

      {/* Keyboard Grid */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: 8, 
        padding: 32, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12,
        overflowX: 'auto', position: 'relative'
      }}>
        {KEY_LAYOUT.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8 }}>
            {row.map(key => {
              const isPressed = pressedKeys.has(key)
              const isTested  = testedKeys.has(key)
              const isStuck   = stuckKeys.has(key)
              
              return (
                <div
                  key={key}
                  role="button"
                  aria-pressed={isPressed}
                  aria-label={key}
                  className={`key ${isPressed ? 'active' : ''} ${isTested ? 'tested' : ''}`}
                  style={{
                    width: getWidth(key),
                    borderColor: isStuck ? 'var(--status-fail)' : undefined,
                    background: isStuck ? 'var(--status-fail)' : undefined,
                    color: isStuck ? 'var(--bg-primary)' : undefined,
                  }}
                >
                  {KEY_LABELS[key] || key.toUpperCase()}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>* 70% coverage required for automatic certificate generation.</p>
         <button onClick={restore} className="btn-accent" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, padding: '8px 16px' }}>
            RESET TEST
         </button>
      </div>
    </div>
  )
}
