'use client'
import { useState, useRef, useEffect } from 'react'
import { Camera, Zap, Activity, ShieldCheck, AlertTriangle, Video, Maximize2, Info } from 'lucide-react'

export default function WebcamTest({ onResult }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [devices, setDevices] = useState([])
  const [selected, setSelected] = useState('')
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState({ width: 0, height: 0, fps: 0 })
  const streamRef = useRef(null)
  const fpsRef = useRef({ frames: 0, lastTime: 0, current: 0 })

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(d => {
      const cams = d.filter(x => x.kind === 'videoinput')
      setDevices(cams)
      if (cams.length > 0) setSelected(cams[0].deviceId)
    }).catch(() => {})
    return () => stopStream()
  }, [])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    stopStream()
    setError(null)
    setStatus('starting')
    try {
      const constraints = {
        video: selected ? { deviceId: { exact: selected } } : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setMetadata(prev => ({ 
            ...prev, 
            width: videoRef.current.videoWidth, 
            height: videoRef.current.videoHeight 
          }))
          requestAnimationFrame(trackFps)
        }
        await videoRef.current.play()
      }
      setStatus('live')
      onResult?.('pass')
    } catch (err) {
      setStatus('error')
      setError(err.message)
      onResult?.('fail')
    }
  }

  const trackFps = (time) => {
    if (status !== 'live' && !streamRef.current) return
    fpsRef.current.frames++
    if (time - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.current = fpsRef.current.frames
      setMetadata(prev => ({ ...prev, fps: fpsRef.current.current }))
      fpsRef.current.frames = 0
      fpsRef.current.lastTime = time
    }
    requestAnimationFrame(trackFps)
  }

  const stop = () => {
    stopStream()
    setStatus('idle')
    onResult?.('idle')
    if (videoRef.current) videoRef.current.srcObject = null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Device Selection & Performance Header */}
      <div className="grid-cols-2" style={{ display: 'grid', gap: 16 }}>
         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Video size={16} style={{ color: 'var(--accent)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>STREAM_RESOLUTION</div>
            </div>
            <div className="text-mono" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>
               {metadata.width ? `${metadata.width}×${metadata.height}` : '0000×0000'}
            </div>
         </div>

         <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--status-info)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <Activity size={16} style={{ color: 'var(--status-info)' }} />
               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>ENCODING_PERF</div>
            </div>
            <div className="text-mono" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>
               {metadata.fps} <span style={{ fontSize: 13, color: 'var(--status-info)' }}>FPS</span>
            </div>
         </div>
      </div>

      {/* Video Feed Component */}
      <div className="card glass-elevated" style={{ 
        aspectRatio: '16/9', background: 'var(--bg-primary)', position: 'relative', 
        overflow: 'hidden', border: '1px solid var(--border)' 
      }}>
         <video 
           ref={videoRef} muted playsInline 
           style={{ width: '100%', height: '100%', objectFit: 'cover', display: status === 'live' ? 'block' : 'none', filter: 'contrast(1.1) brightness(1.1)' }} 
         />
         
         {status !== 'live' && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <Camera size={48} style={{ color: 'var(--text-muted)', opacity: 0.2 }} />
              <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>MODULE_OFFLINE // WAITING_FOR_SYNC</div>
           </div>
         )}

          {status === 'live' && (
           <>
              <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-fail)', animation: 'hr-pulse 1s infinite' }} />
                 <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: 1.5 }}>CAMERA LIVE</span>
              </div>
              {/* Focus Targets (Simulated grid for technician) */}
              <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
                 {[...Array(9)].map((_, i) => <div key={i} style={{ border: '0.5px solid rgba(255,255,255,0.03)' }} />)}
              </div>
           </>
         )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 11, fontWeight: 800,
                padding: '10px 16px', borderRadius: 8, outline: 'none'
              }}
            >
              {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera Unit ${d.deviceId.slice(0,4)}`}</option>)}
            </select>
            <button onClick={status === 'live' ? stop : startCamera} className="btn-accent" style={{ background: status === 'live' ? 'transparent' : 'var(--accent)', border: `1px solid ${status === 'live' ? 'var(--status-fail)' : 'var(--accent)'}`, color: status === 'live' ? 'var(--status-fail)' : 'var(--bg-primary)' }}>
               {status === 'live' ? 'STOP CAMERA' : 'START CAMERA'}
            </button>
         </div>
         <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>STATUS // {status.toUpperCase()}</div>
      </div>
    </div>
  )
}
