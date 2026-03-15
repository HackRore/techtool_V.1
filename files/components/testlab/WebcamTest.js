'use client'
import { useState, useRef, useEffect } from 'react'

export default function WebcamTest({ onResult }) {
  const videoRef   = useRef(null)
  const [status, setStatus]     = useState('idle')
  const [devices, setDevices]   = useState([])
  const [selected, setSelected] = useState('')
  const [error, setError]       = useState(null)
  const streamRef = useRef(null)

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
        audio: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
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

  const stop = () => {
    stopStream()
    setStatus('idle')
    onResult?.('idle')
    if (videoRef.current) videoRef.current.srcObject = null
  }

  return (
    <div>
      {/* Device selector */}
      {devices.length > 1 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="label-tag">DEVICE</span>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{
              background: 'var(--surface-3)', border: '1px solid var(--surface-5)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '4px 8px', borderRadius: 1, flex: 1,
            }}
          >
            {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,8)}`}</option>)}
          </select>
        </div>
      )}

      {/* Video preview */}
      <div style={{
        width: '100%', aspectRatio: '16/9', background: 'var(--surface-1)',
        border: `1px solid ${status === 'live' ? 'rgba(16,185,129,0.3)' : 'var(--surface-4)'}`,
        borderRadius: 2, overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: status === 'live' ? 'block' : 'none' }} />
        {status !== 'live' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--surface-5)', marginBottom: 8 }}>◎</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px' }}>
              {status === 'idle' ? 'CAMERA OFFLINE' : status === 'starting' ? 'INITIALISING…' : 'ERROR'}
            </div>
          </div>
        )}
        {status === 'live' && (
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot pass" style={{ animation: 'pulseAmber 1.5s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '1px' }}>LIVE</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: 1, marginBottom: 12 }}>
          ✗ {error}
        </div>
      )}

      {devices.length === 0 && status === 'idle' && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 12 }}>
          No camera devices enumerated (permission not yet granted).
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {status !== 'live'
          ? <button className="btn-amber" onClick={startCamera}>START CAMERA</button>
          : <button className="btn-amber" onClick={stop}>STOP</button>
        }
      </div>
    </div>
  )
}
