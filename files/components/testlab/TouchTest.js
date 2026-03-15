'use client'
import { useState, useRef } from 'react'

export default function TouchTest({ onResult }) {
  const [touches, setTouches]   = useState([])
  const [maxPoints, setMax]     = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  const COLORS = ['#f59e0b','#10b981','#06b6d4','#ef4444','#a78bfa','#f472b6','#34d399','#fb923c','#60a5fa','#fbbf24']

  const handleTouchStart = (e) => {
    e.preventDefault()
    setTapCount(prev => prev + 1)
    onResult?.('pass')
    updateTouches(e.touches)
  }
  const handleTouchMove  = (e) => { e.preventDefault(); updateTouches(e.touches) }
  const handleTouchEnd   = (e) => { e.preventDefault(); updateTouches(e.touches) }

  const updateTouches = (touchList) => {
    const rect = document.getElementById('touch-area')?.getBoundingClientRect()
    if (!rect) return
    const arr = []
    for (let i = 0; i < touchList.length; i++) {
      const t = touchList[i]
      arr.push({ id: t.identifier, x: t.clientX - rect.left, y: t.clientY - rect.top, force: t.force || 0 })
    }
    setTouches(arr)
    setMax(prev => Math.max(prev, arr.length))
  }

  const reset = () => { setTouches([]); setMax(0); setTapCount(0); onResult?.('idle') }

  return (
    <div>
      {!hasTouch && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 14px', borderRadius: 1, marginBottom: 16 }}>
          ⚠ No touch input detected on this device. If this is a touchscreen, try running on the device under test.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <div>
          <div className="label-tag">Active Points</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{touches.length}</div>
        </div>
        <div>
          <div className="label-tag">Max Simultaneous</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--cyan)' }}>{maxPoints}</div>
        </div>
        <div>
          <div className="label-tag">Total Taps</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{tapCount}</div>
        </div>
        <div>
          <div className="label-tag">Browser Max</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text-muted)' }}>
            {typeof navigator !== 'undefined' ? navigator.maxTouchPoints : '?'}
          </div>
        </div>
      </div>

      {/* Touch area */}
      <div
        id="touch-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%', height: 240,
          background: 'var(--surface-1)',
          border: `1px solid ${touches.length > 0 ? 'rgba(245,158,11,0.3)' : 'var(--surface-4)'}`,
          borderRadius: 2, position: 'relative',
          marginBottom: 12, touchAction: 'none', userSelect: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {touches.map((t, i) => (
          <div key={t.id} style={{
            position: 'absolute',
            left: t.x - 24, top: t.y - 24,
            width: 48, height: 48,
            border: `2px solid ${COLORS[i % COLORS.length]}`,
            borderRadius: '50%',
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${COLORS[i % COLORS.length]}44`,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: COLORS[i % COLORS.length], fontWeight: 700 }}>{i + 1}</span>
          </div>
        ))}
        {touches.length === 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px', textAlign: 'center', lineHeight: 1.8 }}>
            TOUCH HERE TO TEST<br />
            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>USE MULTIPLE FINGERS TO TEST MULTI-TOUCH</span>
          </div>
        )}
      </div>

      <button className="btn-amber" onClick={reset}>RESET</button>
    </div>
  )
}
