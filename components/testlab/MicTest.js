'use client'
import { useState, useRef, useEffect } from 'react'
import { Mic, Activity, Zap, ShieldCheck, AlertTriangle, Hash, BarChart3 } from 'lucide-react'

export default function MicTest({ onResult }) {
  const [status, setStatus]   = useState('idle')
  const [level, setLevel]     = useState(0)
  const [peak, setPeak]       = useState(0)
  const [frequencies, setFrequencies] = useState(new Uint8Array(256))
  const [error, setError]     = useState(null)
  const [sampleRate, setSampleRate] = useState(0)

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
      analyser.fftSize = 512 // 256 frequency bins
      analyser.smoothingTimeConstant = 0.8
      
      const src = ctx.createMediaStreamSource(stream)
      src.connect(analyser)
      
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      setSampleRate(ctx.sampleRate)
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
    
    // Level calculation (RMS-style averaging)
    const avg = data.reduce((a, b) => a + b, 0) / data.length
    const lvl = Math.min(100, Math.round((avg / 160) * 100))
    
    setLevel(lvl)
    setFrequencies(new Uint8Array(data)) // Update FFT state
    
    setPeak(prev => {
      if (lvl >= prev) {
        clearTimeout(peakTimerRef.current)
        peakTimerRef.current = setTimeout(() => setPeak(0), 2000)
        return lvl
      }
      return prev
    })
    
    animRef.current = requestAnimationFrame(tick)
  }

  const stop = () => {
    cancelAnimationFrame(animRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    streamRef.current = null; audioCtxRef.current = null; analyserRef.current = null
    setStatus('idle'); setLevel(0); setPeak(0)
    onResult?.('idle')
  }

  useEffect(() => {
    return () => stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* VU Meter & Peak Monitoring */}
      <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)', background: 'var(--bg-secondary)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <Activity size={16} style={{ color: 'var(--accent)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>INPUT_SIGNAL_INTEGRITY</div>
            </div>
            <div className="text-mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 900 }}>{level}% / PEAK {peak}%</div>
         </div>
         
         <div style={{ height: 40, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${level}%`, background: level > 85 ? 'var(--status-fail)' : level > 60 ? 'var(--status-warn)' : 'var(--accent)', transition: 'width 0.05s', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: 'var(--status-warn)', left: `${peak}%`, opacity: 0.5 }} />
            {/* Scale divisions */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}>
               {[...Array(10)].map((_, i) => <div key={i} style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.05)' }} />)}
            </div>
         </div>
      </div>

      {/* FFT Spectrum Analyzer (Deterministic Canvas-like Simulation with DIVs) */}
      <div className="card glass-elevated" style={{ padding: 24, background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
         <div style={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 1 }}>
            {status === 'live' ? [...frequencies].filter((_, i) => i % 2 === 0).map((v, i) => (
              <div key={i} style={{ 
                flex: 1, height: `${Math.max(4, (v / 255) * 100)}%`, 
                background: `linear-gradient(0deg, var(--accent) 0%, var(--accent-glow) 100%)`,
                opacity: 0.2 + (v / 255) * 0.8,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.1s'
              }} />
            )) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>
                 WAITING_FOR_FFT_STREAM...
              </div>
            )}
         </div>
         <div style={{ position: 'absolute', bottom: 12, left: 24, fontSize: 8, fontWeight: 900, color: 'var(--text-muted)', display: 'flex', gap: 32 }}>
            <span>20Hz</span>
            <span>440Hz</span>
            <span>8kHz</span>
            <span>20kHz</span>
         </div>
      </div>

      {/* Professional Metadata Readout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
         {status === 'live' ? (
           <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ borderRight: '1px solid var(--border)', paddingRight: 24 }}>
                 <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900 }}>CRYSTAL_FREQ</div>
                 <div style={{ fontSize: 13, fontWeight: 900 }}>{sampleRate}Hz</div>
              </div>
              <div>
                 <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900 }}>FFT_BLOCK_SIZE</div>
                 <div style={{ fontSize: 13, fontWeight: 900 }}>512-Bins</div>
              </div>
           </div>
         ) : <div />}

         <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={status === 'live' ? stop : startMic} className="btn-accent" style={{ 
              background: status === 'live' ? 'transparent' : 'var(--accent)', 
              border: `1px solid ${status === 'live' ? 'var(--status-fail)' : 'var(--accent)'}`,
              color: status === 'live' ? 'var(--status-fail)' : 'var(--bg-primary)'
            }}>
               {status === 'live' ? 'TERMINATE_STREAM' : 'INITIALIZE_FFT_AUDIT'}
            </button>
         </div>
      </div>
    </div>
  )
}
