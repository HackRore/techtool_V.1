'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export default function MicTest({ onResult }) {
  const [status, setStatus]   = useState('idle')
  const [level, setLevel]     = useState(0)
  const [peak, setPeak]       = useState(0)
  const [history, setHistory] = useState(Array(60).fill(0))
  const [error, setError]     = useState(null)

  const audioCtxRef    = useRef(null)
  const analyserRef    = useRef(null)
  const streamRef      = useRef(null)
  const animRef        = useRef(null)
  const peakTimerRef   = useRef(null)

  const startMic = async () => {
    setError(null)
    setStatus('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      const ctx      = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      const src = ctx.createMediaStreamSource(stream)
      src.connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      setStatus('live')
      onResult?.('pass')
      tick()
    } catch (err) {
      setStatus('error')
      setError(err.message)
      onResult?.('fail')
    }
  }

  const tick = () => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    const avg = data.reduce((a, b) => a + b, 0) / data.length
    const lvl = Math.min(100, Math.round((avg / 128) * 100))
    setLevel(lvl)
    setPeak(prev => {
      const next = Math.max(prev, lvl)
      clearTimeout(peakTimerRef.current)
      peakTimerRef.current = setTimeout(() => setPeak(0), 2000)
      return next
    })
    setHistory(prev => [...prev.slice(1), lvl])
    animRef.current = requestAnimationFrame(tick)
  }

  const stop = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    streamRef.current = null
    audioCtxRef.current = null
    analyserRef.current = null
    setStatus('idle')
    setLevel(0)
    setPeak(0)
    setHistory(Array(60).fill(0))
    onResult?.('idle')
  }, [])

  useEffect(() => () => {
    stop()
  }, [stop])

  const bars = Array(30).fill(0).map((_, i) => history[history.length - 30 + i] || 0)

  return (
    <div>
      {/* Level meter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="label-tag">INPUT LEVEL</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)' }}>{level}% PEAK {peak}%</span>
        </div>
        <div style={{ height: 28, background: 'var(--surface-1)', border: '1px solid var(--surface-4)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: `${level}%`,
            background: level > 80 ? 'var(--red)' : level > 50 ? 'var(--amber)' : 'var(--green)',
            transition: 'width 0.05s, background 0.1s',
            boxShadow: level > 10 ? `0 0 12px ${level > 80 ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'}` : 'none',
          }} />
          {/* Peak indicator */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: 'var(--amber)', left: `${peak}%`, transition: 'left 0.1s' }} />
        </div>
      </div>

      {/* Waveform history */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 48, marginBottom: 20, background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 1, padding: '4px 8px' }}>
        {bars.map((v, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 0,
            height: `${Math.max(4, v)}%`,
            background: v > 80 ? 'var(--red)' : v > 50 ? 'var(--amber)' : 'var(--green)',
            opacity: 0.7 + (i / bars.length) * 0.3,
            borderRadius: '1px 1px 0 0',
            transition: 'height 0.1s',
          }} />
        ))}
      </div>

      {/* Frequencies */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {['LOW','MID','HIGH'].map((band, i) => {
          const bandLevel = i === 0 ? history.slice(-3).reduce((a,b) => a + b, 0)/3 : i === 1 ? level : Math.max(0, level - 20)
          return (
            <div key={band} style={{ flex: 1 }}>
              <div className="label-tag" style={{ marginBottom: 4 }}>{band}</div>
              <div style={{ height: 4, background: 'var(--surface-4)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100,bandLevel)}%`, background: 'var(--cyan)', transition: 'width 0.1s' }} />
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: 1, marginBottom: 12 }}>
          ✗ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {status !== 'live'
          ? <button className="btn-amber" onClick={startMic}>START MIC TEST</button>
          : <button className="btn-amber" onClick={stop}>STOP</button>
        }
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
          {status === 'live' ? '● RECORDING — speak or make noise' : 'Click to request microphone access'}
        </span>
      </div>
    </div>
  )
}
