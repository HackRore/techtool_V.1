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
    <div style={{ padding: 8 }}>
      {/* HUD Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
         <div className="card-elevated" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4 }}>COVERAGE</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{pct}%</div>
         </div>
         <div className="card-elevated" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4 }}>KEYS CHECKED</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{testedKeys.size}<span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/{totalKeys}</span></div>
         </div>
         <div className="card-elevated" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4 }}>SIGNAL STATE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: status === 'pass' ? 'var(--accent)' : 'var(--amber)', marginTop: 4 }}>
               {status.toUpperCase()}
            </div>
         </div>
         <div className="card-elevated" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4 }}>ANOMALIES</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: stuckKeys.size > 0 ? 'var(--red)' : 'var(--text-primary)' }}>{stuckKeys.size}</div>
         </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 2, background: 'var(--border)', marginBottom: 32, borderRadius: 1, overflow: 'hidden' }}>
         <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.2s' }}></div>
      </div>

      {/* Keyboard Grid */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: 6, 
        padding: 24, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12,
        overflowX: 'auto', position: 'relative'
      }}>
        {KEY_LAYOUT.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 6 }}>
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
                  style={{
                    width: getWidth(key),
                    height: 38,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 4,
                    fontSize: 9, fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    border: '1px solid',
                    transition: 'all 0.1s',
                    background: isStuck ? 'var(--red)' : isPressed ? 'var(--accent)' : isTested ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    borderColor: isStuck ? 'var(--red)' : isPressed ? 'var(--accent)' : isTested ? 'var(--accent)' : 'var(--border)',
                    color: isPressed ? 'var(--bg-primary)' : isTested ? 'var(--accent)' : 'var(--text-muted)',
                    boxShadow: isPressed ? '0 0 15px var(--accent-glow)' : 'none'
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
