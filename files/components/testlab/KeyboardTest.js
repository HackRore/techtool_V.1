'use client'
import { useState, useEffect, useCallback } from 'react'

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

function getLabel(k) {
  return KEY_LABELS[k] || k.toUpperCase()
}

function getWidth(k) {
  const wide = { 
    'Backspace': 70, 
    'Tab': 55, 
    'CapsLock': 65, 
    'ShiftLeft': 90, 
    'ShiftRight': 90, 
    'Enter': 75, 
    'ControlLeft': 50, 
    'ControlRight': 50, 
    'AltLeft': 50, 
    'AltRight': 50, 
    'MetaLeft': 50, 
    'MetaRight': 50,
    'Space': 240, 
    'Numpad0': 80, // Double width
    'NumpadEnter': 38, // Height handled by layout usually, but width fixed here
    'NumpadAdd': 38 
  }
  return wide[k] || 38
}

export default function KeyboardTest({ onResult }) {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [testedKeys, setTestedKeys]   = useState(new Set())
  const [status, setStatus]           = useState('idle')

  const allKeys = KEY_LAYOUT.flat()
  const totalKeys = allKeys.length

  const handleKeyDown = useCallback(e => {
    e.preventDefault()
    const code = e.code
    // Find matching key in layout
    const id = allKeys.find(x => x === code) || code
    
    setPressedKeys(prev => new Set([...prev, id]))
    setTestedKeys(prev => {
      const next = new Set([...prev, id])
      if (next.size >= totalKeys * 0.7) { setStatus('pass'); onResult?.('pass') }
      return next
    })
    setStatus(s => s === 'idle' ? 'testing' : s)
  }, [allKeys, totalKeys, onResult])

  useEffect(() => {
    const saved = localStorage.getItem('hackrore_kb_tested')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setTestedKeys(new Set(parsed))
      } catch (e) { console.error('Failed to load KB history', e) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hackrore_kb_tested', JSON.stringify([...testedKeys]))
  }, [testedKeys])

  const handleKeyUp = useCallback(e => {
    const code = e.code
    const id = allKeys.find(x => x === code) || code
    setPressedKeys(prev => { const n = new Set(prev); n.delete(id); return n })
  }, [allKeys])

  const reset = () => {
    setPressedKeys(new Set())
    setTestedKeys(new Set())
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
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="label-tag">Inventory Checked</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--amber)', fontWeight: 700 }}>
            {testedKeys.size}<span style={{ fontSize: 12, color: 'var(--text-4)' }}>/{totalKeys}</span>
          </div>
        </div>
        <div>
          <div className="label-tag">Physical Integrity</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: pct >= 70 ? 'var(--green)' : 'var(--amber)', fontWeight: 700 }}>{pct}%</div>
        </div>
        <div>
          <div className="label-tag">Signal Status</div>
          <div style={{ marginTop: 4 }}>
            <span className={`badge badge-${status === 'pass' ? 'pass' : status === 'testing' ? 'warn' : 'idle'}`} style={{ fontSize: 10 }}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Instruction */}
      <div style={{ marginBottom: 20, background: 'var(--surface-2)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-600)', animation: 'pulse 2s infinite' }} />
        Press keys on your physical keyboard to verify signal path. 70% coverage required for validation.
      </div>

      {/* Keyboard Grid */}
      <div className="keyboard-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 6, 
        padding: 16, 
        background: 'var(--bg)', 
        border: '1px solid var(--border)', 
        borderRadius: 12,
        overflowX: 'auto',
        fontSize: 10
      }}>
        {KEY_LAYOUT.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, whiteSpace: 'nowrap' }}>
            {row.map(key => {
              const isPressed = pressedKeys.has(key)
              const isTested  = testedKeys.has(key)
              return (
                <div
                  key={key}
                  className={`key${isPressed ? ' active' : ''}`}
                  style={{
                    width: getWidth(key),
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: '1px solid',
                    transition: 'all 0.1s',
                    background: isPressed ? 'var(--amber)' : isTested ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
                    borderColor: isPressed ? 'var(--amber)' : isTested ? 'var(--green)' : 'var(--border)',
                    color: isPressed ? 'black' : isTested ? 'var(--green)' : 'var(--text-3)',
                    fontWeight: isPressed || isTested ? 700 : 400,
                    fontSize: 9
                  }}
                >
                  {getLabel(key)}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Reset */}
      <div style={{ marginTop: 16 }}>
        <button className="btn-amber" onClick={reset}>RESET TEST</button>
      </div>
    </div>
  )
}
