'use client'
import { useState, useRef } from 'react'

const TESTS = [
  { id: 'left',    label: 'Left Channel',   freq: 440,  channel: 'L', pan: -1 },
  { id: 'right',   label: 'Right Channel',  freq: 440,  channel: 'R', pan:  1 },
  { id: 'center',  label: 'Center (Both)',  freq: 1000, channel: 'C', pan:  0 },
  { id: 'low',     label: 'Bass (80 Hz)',   freq:  80,  channel: 'B', pan:  0 },
  { id: 'high',    label: 'High (8000 Hz)', freq: 8000, channel: 'H', pan:  0 },
  { id: 'sweep',   label: 'Frequency Sweep',freq: null, channel: '~', pan:  0 },
]

export default function SpeakerTest({ onResult }) {
  const [playing, setPlaying]   = useState(null)
  const [results, setResults]   = useState({})
  const audioCtxRef = useRef(null)
  const activeRef   = useRef(null)

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return audioCtxRef.current
  }

  const stopActive = () => {
    if (activeRef.current) {
      try { activeRef.current.stop() } catch {}
      activeRef.current = null
    }
  }

  const playSweep = (ctx) => {
    const osc    = ctx.createOscillator()
    const gain   = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    osc.frequency.setValueAtTime(100, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 3)
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 2.8)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3)
    osc.start()
    osc.stop(ctx.currentTime + 3)
    osc.onended = () => setPlaying(null)
    return osc
  }

  const playTone = (test) => {
    stopActive()
    if (playing === test.id) { setPlaying(null); return }

    const ctx  = getCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    const pan  = ctx.createStereoPanner ? ctx.createStereoPanner() : null

    osc.type = 'sine'
    if (test.id === 'sweep') {
      activeRef.current = playSweep(ctx)
      setPlaying(test.id)
      return
    }

    osc.frequency.value = test.freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 1.9)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)

    if (pan) {
      osc.connect(gain); gain.connect(pan); pan.connect(ctx.destination)
      pan.pan.value = test.pan
    } else {
      osc.connect(gain); gain.connect(ctx.destination)
    }

    osc.start()
    osc.stop(ctx.currentTime + 2)
    osc.onended = () => setPlaying(null)
    activeRef.current = osc
    setPlaying(test.id)
    onResult?.('pass')
  }

  const markResult = (id, val) => {
    setResults(prev => ({ ...prev, [id]: val }))
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.7 }}>
        Play each tone and verify it sounds correct. Use headphones for left/right channel tests.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TESTS.map(test => {
          const isPlaying = playing === test.id
          const result    = results[test.id]
          return (
            <div key={test.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--surface-2)', border: `1px solid ${isPlaying ? 'rgba(245,158,11,0.3)' : 'var(--surface-4)'}`,
              borderRadius: 2, padding: '12px 16px',
              transition: 'border-color 0.2s',
            }}>
              {/* Channel badge */}
              <div style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isPlaying ? 'rgba(245,158,11,0.15)' : 'var(--surface-3)',
                border: `1px solid ${isPlaying ? 'var(--amber)' : 'var(--surface-5)'}`,
                borderRadius: 1, flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isPlaying ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 700 }}>{test.channel}</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>{test.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  {test.freq ? `${test.freq} Hz` : '100 Hz → 8000 Hz'}
                  {isPlaying && <span style={{ color: 'var(--amber)', marginLeft: 8 }}>● PLAYING</span>}
                </div>
              </div>

              {/* Play button */}
              <button
                className="btn-amber"
                onClick={() => playTone(test)}
                style={{ padding: '6px 16px', fontSize: 10 }}
              >
                {isPlaying ? '■ STOP' : '▶ PLAY'}
              </button>

              {/* Pass/Fail */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => markResult(test.id, 'pass')}
                  style={{ padding: '5px 10px', background: result === 'pass' ? 'rgba(16,185,129,0.2)' : 'transparent', border: `1px solid ${result === 'pass' ? '#10b981' : 'var(--surface-5)'}`, color: result === 'pass' ? '#10b981' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer', borderRadius: 1 }}>✓</button>
                <button
                  onClick={() => markResult(test.id, 'fail')}
                  style={{ padding: '5px 10px', background: result === 'fail' ? 'rgba(239,68,68,0.2)' : 'transparent', border: `1px solid ${result === 'fail' ? '#ef4444' : 'var(--surface-5)'}`, color: result === 'fail' ? '#ef4444' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer', borderRadius: 1 }}>✗</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {Object.keys(results).length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <span className="label-tag">RESULTS:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>
            {Object.values(results).filter(v => v === 'pass').length} PASS
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>
            {Object.values(results).filter(v => v === 'fail').length} FAIL
          </span>
        </div>
      )}
    </div>
  )
}
