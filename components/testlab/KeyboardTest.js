import { useState, useEffect, useCallback, useRef } from 'react'
import { useHistory } from '../HistoryProvider'
import { Activity, Zap, AlertCircle, RefreshCcw, ShieldCheck } from 'lucide-react'

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
    'ControlLeft': 55, 'ControlRight': 55, 'AltLeft': 55, 'AltRight': 55, 'MetaLeft': 55, 'MetaRight': 55,
    'Space': 240, 'Numpad0': 80 
  }
  return wide[k] || 40
}

export default function KeyboardTest({ onResult, inline = false }) {
  const { addHistory } = useHistory()
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [testedKeys, setTestedKeys]   = useState(new Set())
  const [stuckKeys, setStuckKeys]     = useState(new Set())
  const [status, setStatus]           = useState('idle')
  
  const pressTimers = useRef({})
  const allKeys = KEY_LAYOUT.flat()
  const totalKeys = 104 

  useEffect(() => {
    const saved = localStorage.getItem('hackrore_kb_tested')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setTestedKeys(new Set(parsed))
      } catch (e) { console.error('Keyboard history load failed', e) }
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

  const resetBatch = () => {
    if (testedKeys.size > 0) {
      addHistory('hardware', 'Keyboard Protocol', testedKeys.size >= totalKeys * 0.7 ? 'pass' : 'warning', {
        coverage: Math.round((testedKeys.size / totalKeys) * 100),
        keysChecked: testedKeys.size
      })
    }
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
    <div style={{ padding: '32px' }}>
      
      {/* Perfection Telemetry HUD */}
      {!inline && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="card-elevated" style={{ padding: 20 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Coverage</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{pct}%</div>
          </div>
          <div className="card-elevated" style={{ padding: 20 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Validated</div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{testedKeys.size}<span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>/{totalKeys}</span></div>
          </div>
          <div className="card-elevated" style={{ padding: 20 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Bus State</div>
              <div className={`badge badge-${status === 'pass' ? 'pass' : 'ready'}`} style={{ marginTop: 4 }}>
                {status === 'pass' ? 'PROTOCOL_VALID' : 'SIGNAL_SYNC'}
              </div>
          </div>
          <div className="card-elevated" style={{ padding: 20 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Anomalies</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stuckKeys.size > 0 ? 'var(--status-fail)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{stuckKeys.size}</div>
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', marginBottom: 40, borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
         <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', boxShadow: '0 0 15px var(--accent-glow)', transition: 'width 0.8s var(--ease)' }}></div>
      </div>

      {/* Industrial Keyboard Grid (Overflow Protected) */}
      <div style={{ 
        padding: 32, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20,
        overflowX: 'auto', position: 'relative', width: '100%',
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 800 }}>
          {KEY_LAYOUT.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 10 }}>
              {row.map(key => {
                const isPressed = pressedKeys.has(key)
                const isTested  = testedKeys.has(key)
                const isStuck   = stuckKeys.has(key)
                
                return (
                  <div
                    key={key}
                    className={`key ${isPressed ? 'active' : ''} ${isTested ? 'tested' : ''}`}
                    style={{
                      width: getWidth(key), height: 44, fontSize: 11,
                      borderColor: isStuck ? 'var(--status-fail)' : undefined,
                      background: isStuck ? 'var(--status-fail)' : undefined,
                      color: isStuck ? 'var(--bg-primary)' : undefined,
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
      </div>

      {/* Logic Summary Footer */}
      <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Activity size={16} style={{ color: 'var(--accent)' }} />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>* Collective 70% coverage required for autonomous validation certificate.</p>
         </div>
         <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={resetBatch} className="btn-accent" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, height: 40, padding: '0 16px' }}>
               <RefreshCcw size={12} style={{ marginRight: 8 }} /> RESET_PROTOCOL
            </button>
            <button className="btn-accent" style={{ height: 40, padding: '0 20px', fontSize: 11 }}>
               <ShieldCheck size={14} style={{ marginRight: 8 }} /> VALIDATE_KERNEL
            </button>
         </div>
      </div>
    </div>
  )
}
