'use client'
import { useState, useRef, useEffect } from 'react'
import { Volume2, Zap, Activity, ShieldCheck, AlertTriangle, Play, Square, Headphones, Info } from 'lucide-react'

export default function SpeakerTest({ onResult }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [frequency, setFrequency] = useState(440) // Standard A4
  const [volume, setVolume] = useState(0.5)
  const [stereo, setStereo] = useState('both') // 'left', 'right', 'both'
  const [sweepActive, setSweepActive] = useState(false)
  
  const audioCtxRef = useRef(null)
  const oscRef = useRef(null)
  const gainRef = useRef(null)
  const pannerRef = useRef(null)
  const sweepIntervalRef = useRef(null)

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const panner = ctx.createStereoPanner()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime) // Start muted

      osc.connect(gain)
      gain.connect(panner)
      panner.connect(ctx.destination)
      
      osc.start()
      
      audioCtxRef.current = ctx
      oscRef.current = osc
      gainRef.current = gain
      pannerRef.current = panner
    }
  }

  const togglePlay = () => {
    initAudio()
    if (isPlaying) {
      gainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.1)
      setIsPlaying(false)
      setSweepActive(false)
      clearInterval(sweepIntervalRef.current)
    } else {
      gainRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1)
      setIsPlaying(true)
      onResult?.('pass')
    }
  }

  const updateFrequency = (val) => {
    setFrequency(val)
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.exponentialRampToValueAtTime(val, audioCtxRef.current.currentTime + 0.1)
    }
  }

  const updateStereo = (val) => {
    setStereo(val)
    if (pannerRef.current && audioCtxRef.current) {
      const panVal = val === 'left' ? -1 : val === 'right' ? 1 : 0
      pannerRef.current.pan.linearRampToValueAtTime(panVal, audioCtxRef.current.currentTime + 0.1)
    }
  }

  const startSweep = () => {
    if (!isPlaying) togglePlay()
    setSweepActive(true)
    let currentFreq = 20
    sweepIntervalRef.current = setInterval(() => {
      currentFreq = currentFreq * 1.05
      if (currentFreq > 20000) {
        setSweepActive(false)
        clearInterval(sweepIntervalRef.current)
        updateFrequency(440)
      } else {
        updateFrequency(Math.round(currentFreq))
      }
    }, 100)
  }

  useEffect(() => {
    return () => {
      clearInterval(sweepIntervalRef.current)
      audioCtxRef.current?.close()
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Master Audio Controller */}
      <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)', background: 'var(--bg-secondary)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <Volume2 size={20} style={{ color: 'var(--accent)' }} />
               <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Hardware Oscillation Audit</div>
            </div>
            <div className="text-mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 900 }}>{frequency}Hz // {Math.round(volume * 100)}% VOL</div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
            <button 
              onClick={() => updateStereo('left')} 
              className="card-elevated" 
              style={{ padding: 16, background: stereo === 'left' ? 'var(--accent-glow)' : 'var(--bg-primary)', border: `1px solid ${stereo === 'left' ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
            >
               <div style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>CHANNEL_L</div>
               <div style={{ fontSize: 11, fontWeight: 900, color: stereo === 'left' ? 'var(--accent)' : 'var(--text-secondary)' }}>PRIMARY_LEFT</div>
            </button>
            <button 
              onClick={() => updateStereo('both')} 
              className="card-elevated" 
              style={{ padding: 16, background: stereo === 'both' ? 'var(--accent-glow)' : 'var(--bg-primary)', border: `1px solid ${stereo === 'both' ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
            >
               <div style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>CHANNEL_ST</div>
               <div style={{ fontSize: 11, fontWeight: 900, color: stereo === 'both' ? 'var(--accent)' : 'var(--text-secondary)' }}>STEREO_BALANCE</div>
            </button>
            <button 
              onClick={() => updateStereo('right')} 
              className="card-elevated" 
              style={{ padding: 16, background: stereo === 'right' ? 'var(--accent-glow)' : 'var(--bg-primary)', border: `1px solid ${stereo === 'right' ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
            >
               <div style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>CHANNEL_R</div>
               <div style={{ fontSize: 11, fontWeight: 900, color: stereo === 'right' ? 'var(--accent)' : 'var(--text-secondary)' }}>PRIMARY_RIGHT</div>
            </button>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
               <input 
                 type="range" min="20" max="15000" step="1" 
                 value={frequency} 
                 onChange={e => updateFrequency(parseInt(e.target.value))}
                 style={{ flex: 1, accentColor: 'var(--accent)' }}
               />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
               <button onClick={togglePlay} className="btn-accent" style={{ flex: 1, height: 48, background: isPlaying ? 'transparent' : 'var(--accent)', border: '1px solid var(--accent)', color: isPlaying ? 'var(--accent)' : 'var(--bg-primary)' }}>
                  {isPlaying ? <Square size={14} /> : <Play size={14} />} {isPlaying ? 'TERMINATE_TONE' : 'INITIALIZE_SIGNAL'}
               </button>
               <button onClick={startSweep} disabled={sweepActive} className="btn-accent" style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', opacity: sweepActive ? 0.5 : 1 }}>
                  {sweepActive ? 'SWEEP_IN_PROGRESS...' : 'RUN_FREQUENCY_SWEEP'}
               </button>
            </div>
         </div>
      </div>

      {/* Technician's Insight Graph (Simulated Spectrum) */}
      <div className="card glass-elevated" style={{ padding: 32, background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: 24 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Activity size={16} style={{ color: 'var(--status-info)' }} />
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>PHASE_ALIGNMENT_OSCILLATION</div>
         </div>
         <div style={{ height: 100, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <svg width="100%" height="100%" style={{ opacity: 0.3 }}>
               <path d={`M 0 50 Q 50 ${Math.sin(frequency/1000) * 100} 100 50 T 200 50 T 300 50 T 400 50`} fill="none" stroke="var(--accent)" strokeWidth="2" />
               {isPlaying && <path d={`M 0 50 Q 25 ${Math.cos(frequency/500) * 80} 50 50 T 100 50 T 150 50 T 200 50`} fill="none" stroke="var(--status-info)" strokeWidth="1" strokeDasharray="4 4" />}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', opacity: 0.1, fontFamily: 'var(--font-mono)' }}>{isPlaying ? 'ACTIVE_SIGNAL' : 'BUS_IDLE'}</div>
            </div>
         </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0 8px' }}>
         <Info size={14} style={{ color: 'var(--status-info)' }} />
         <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Technical Warning: High-frequency sweeps (>12kHz) monitor tweeter response. Low-frequency (<60Hz) sweeps monitor subwoofer/driver displacement. Listen for rattling or phase inversion.
         </div>
      </div>
    </div>
  )
}
