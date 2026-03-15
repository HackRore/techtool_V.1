'use client'
import { useState, useRef } from 'react'

const BUTTONS = [
  { id: 0, label: 'Left Click',   key: 'left' },
  { id: 1, label: 'Middle Click', key: 'middle' },
  { id: 2, label: 'Right Click',  key: 'right' },
]

export default function MouseTest({ onResult }) {
  const [clicks, setClicks]     = useState({ left: 0, middle: 0, right: 0 })
  const [pos, setPos]           = useState({ x: 0, y: 0 })
  const [trail, setTrail]       = useState([])
  const [scroll, setScroll]     = useState(0)
  const [pressed, setPressed]   = useState(new Set())
  const canvasRef = useRef(null)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPos({ x: Math.round(x), y: Math.round(y) })
    setTrail(prev => [...prev.slice(-50), { x, y }])
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    const key = BUTTONS.find(b => b.id === e.button)?.key
    if (key) {
      setClicks(prev => ({ ...prev, [key]: prev[key] + 1 }))
      setPressed(prev => new Set([...prev, key]))
      onResult?.('pass')
    }
  }

  const handleMouseUp = (e) => {
    const key = BUTTONS.find(b => b.id === e.button)?.key
    if (key) setPressed(prev => { const n = new Set(prev); n.delete(key); return n })
  }

  const handleScroll = (e) => {
    setScroll(prev => prev + (e.deltaY > 0 ? 1 : -1))
  }

  const reset = () => {
    setClicks({ left: 0, middle: 0, right: 0 })
    setTrail([])
    setScroll(0)
    setPressed(new Set())
  }

  return (
    <div>
      {/* Click counters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {BUTTONS.map(btn => (
          <div key={btn.id} style={{
            flex: 1, minWidth: 80,
            background: pressed.has(btn.key) ? 'rgba(245,158,11,0.1)' : 'var(--surface-2)',
            border: `1px solid ${pressed.has(btn.key) ? 'rgba(245,158,11,0.4)' : 'var(--surface-4)'}`,
            borderRadius: 2, padding: '12px 16px', textAlign: 'center',
            transition: 'all 0.1s',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: pressed.has(btn.key) ? 'var(--amber)' : 'var(--text-primary)' }}>
              {clicks[btn.key]}
            </div>
            <div className="label-tag" style={{ marginTop: 4 }}>{btn.label}</div>
          </div>
        ))}
        <div style={{
          flex: 1, minWidth: 80,
          background: 'var(--surface-2)', border: '1px solid var(--surface-4)',
          borderRadius: 2, padding: '12px 16px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--cyan)' }}>{scroll}</div>
          <div className="label-tag" style={{ marginTop: 4 }}>Scroll Steps</div>
        </div>
      </div>

      {/* Mouse pad */}
      <div
        style={{
          width: '100%', height: 220,
          background: 'var(--surface-1)',
          border: '1px solid var(--surface-4)',
          borderRadius: 2, position: 'relative',
          cursor: 'crosshair', userSelect: 'none', marginBottom: 12,
          overflow: 'hidden',
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleScroll}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Grid lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          {[25, 50, 75].map(p => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#444" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#444" strokeWidth="1" strokeDasharray="4 4" />
            </g>
          ))}
        </svg>

        {/* Trail */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {trail.length > 1 && (
            <polyline
              points={trail.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(245,158,11,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
          {trail.length > 0 && (
            <circle cx={trail[trail.length-1].x} cy={trail[trail.length-1].y} r="4" fill="var(--amber)" />
          )}
        </svg>

        {/* Position readout */}
        <div style={{ position: 'absolute', top: 8, right: 10, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--surface-5)' }}>
          {pos.x}, {pos.y}
        </div>

        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--surface-5)', letterSpacing: '1px' }}>
          MOVE + CLICK + SCROLL IN THIS AREA
        </div>
      </div>

      <button className="btn-amber" onClick={reset}>RESET</button>
    </div>
  )
}
