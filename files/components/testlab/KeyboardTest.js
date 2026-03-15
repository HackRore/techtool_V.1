'use client'
import { useState, useEffect, useCallback } from 'react'

const KEY_LAYOUT = [
  ['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'],
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['CapsLock','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
  ['ShiftLeft','z','x','c','v','b','n','m',',','.','/','ShiftRight'],
  ['ControlLeft','AltLeft','Space','AltRight','ControlRight'],
]

const KEY_LABELS = {
  'Escape':'ESC','Backspace':'⌫','Tab':'TAB','CapsLock':'CAPS',
  'ShiftLeft':'SHIFT','ShiftRight':'SHIFT','Enter':'↵',
  'ControlLeft':'CTRL','ControlRight':'CTRL','AltLeft':'ALT','AltRight':'ALT',
  'Space':'SPACE','`':'`',
}

function getLabel(k) {
  return KEY_LABELS[k] || k.toUpperCase()
}

function getWidth(k) {
  const wide = { 'Backspace':80,'Tab':68,'CapsLock':80,'ShiftLeft':100,'ShiftRight':100,'Enter':80,'ControlLeft':68,'ControlRight':68,'AltLeft':60,'AltRight':60,'Space':280 }
  return wide[k] || 40
}

export default function KeyboardTest({ onResult }) {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [testedKeys, setTestedKeys]   = useState(new Set())
  const [status, setStatus]           = useState('idle') // idle | testing | pass

  const totalKeys = KEY_LAYOUT.flat().length

  const handleKeyDown = useCallback(e => {
    e.preventDefault()
    const k = e.code || e.key
    const kLow = (e.key || '').toLowerCase()
    const id = KEY_LAYOUT.flat().find(x => x === kLow || x === k) || kLow
    setPressedKeys(prev => new Set([...prev, id]))
    setTestedKeys(prev => {
      const next = new Set([...prev, id])
      if (next.size >= totalKeys * 0.6) { setStatus('pass'); onResult?.('pass') }
      return next
    })
    setStatus(s => s === 'idle' ? 'testing' : s)
  }, [totalKeys, onResult])

  const handleKeyUp = useCallback(e => {
    const k = e.code || e.key
    const kLow = (e.key || '').toLowerCase()
    const id = KEY_LAYOUT.flat().find(x => x === kLow || x === k) || kLow
    setPressedKeys(prev => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  const reset = () => {
    setPressedKeys(new Set())
    setTestedKeys(new Set())
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
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="label-tag">Keys Tested</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--amber)', fontWeight: 700 }}>
            {testedKeys.size}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{totalKeys}</span>
          </div>
        </div>
        <div>
          <div className="label-tag">Coverage</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: pct >= 60 ? 'var(--green)' : 'var(--amber)', fontWeight: 700 }}>{pct}%</div>
        </div>
        <div>
          <div className="label-tag">Status</div>
          <div style={{ marginTop: 4 }}>
            <span className={`badge badge-${status === 'pass' ? 'pass' : status === 'testing' ? 'warn' : 'idle'}`}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 20 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 60 ? 'var(--green)' : 'var(--amber)' }} />
      </div>

      {/* Instruction */}
      {status === 'idle' && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.5px' }}>
          ▶ Click anywhere on this panel, then press keys to test them
        </div>
      )}

      {/* Keyboard visual */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        {KEY_LAYOUT.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            {row.map(key => {
              const id = key
              const isPressed = pressedKeys.has(id)
              const isTested  = testedKeys.has(id)
              return (
                <div
                  key={key}
                  className={`key${isPressed ? ' pressed' : ''}`}
                  style={{
                    width: getWidth(key),
                    minWidth: getWidth(key),
                    background: isTested && !isPressed
                      ? 'rgba(16,185,129,0.08)'
                      : isPressed
                      ? 'rgba(245,158,11,0.15)'
                      : 'var(--surface-3)',
                    borderColor: isTested && !isPressed ? 'rgba(16,185,129,0.3)' : isPressed ? 'var(--amber)' : 'var(--surface-5)',
                    color: isTested && !isPressed ? 'var(--green)' : isPressed ? 'var(--amber)' : 'var(--text-muted)',
                    fontSize: key === 'Space' ? 9 : 9,
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
