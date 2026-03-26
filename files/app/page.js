'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Sparkles, 
  ChevronRight, ArrowRight, Search, 
  Clock, CheckCircle2, AlertCircle 
} from 'lucide-react'

export default function Dashboard() {
  const [sessionTime, setSessionTime] = useState('00:00:00')

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const diff = Date.now() - start
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
      setSessionTime(`${h}:${m}:${s}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = [
    { label: 'Verified Tests', value: 7, icon: Zap },
    { label: 'Fix Library', value: 50, icon: Shield },
    { label: 'Scan Modules', value: 21, icon: Activity },
    { label: 'Session Active', value: sessionTime, icon: Clock, accent: true },
  ]

  const tests = [
    { id: 'keyboard', name: 'Keyboard', desc: '104-key cluster validation', status: 'ready', icon: '⌨️' },
    { id: 'display', name: 'Display', desc: 'Pixel & frequency analysis', status: 'ready', icon: '🖥️' },
    { id: 'audio', name: 'Audio', desc: 'Stereo frequency sweep', status: 'ready', icon: '🔊' },
    { id: 'media', name: 'Webcam', desc: 'Sensor & FPS detection', status: 'ready', icon: '📹' },
    { id: 'mic', name: 'Microphone', desc: 'Dynamic waveform check', status: 'ready', icon: '🎙️' },
    { id: 'mouse', name: 'Mouse', desc: 'Pointer precision test', status: 'ready', icon: '🖱️' },
    { id: 'touch', name: 'Touch', desc: 'Multi-point validation', status: 'ready', icon: '👆' },
  ]

  return (
    <AppLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 }}>
        
        {/* Left: Main Dashboard */}
        <div>
          {/* Hero Zone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 64 }}>
             <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="38" fill="none" stroke="var(--border)" strokeWidth="2" />
                  <circle cx="40" cy="40" r="38" fill="none" stroke="var(--accent)" strokeWidth="2" 
                    strokeDasharray="238" strokeDashoffset="60" 
                    style={{ animation: 'rotate 4s linear infinite' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Activity size={32} className="text-accent" style={{ animation: 'pulse 2s infinite' }} />
                </div>
             </div>
             <div>
                <h1 style={{ fontSize: 32, fontWeight: 700 }}>Diagnostics <span style={{ color: 'var(--accent)' }}>Ready</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 4 }}>System core initialized. TechWorkbench v1.0 active.</p>
             </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
            {stats.map(s => (
              <div key={s.label} className="card-elevated" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                   <s.icon size={12} strokeWidth={3} /> {s.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: s.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
                   {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic Grid */}
          <div style={{ marginBottom: 32 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Available <span style={{ color: 'var(--text-secondary)' }}>Automated Tests</span></h2>
                <Link href="/tools" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View All (7)</Link>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {tests.map(t => (
                  <Link key={t.id} href={`/tools/${t.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 24 }}>{t.icon}</span>
                        <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>READY</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t.desc}</div>
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Sidebar Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
           {/* ScanLab Shortcut */}
           <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 24 }}>
              <div className="breadcrumb" style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>System Telemetry</div>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>ScanLab Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Run deep hardware scans using our PowerShell diagnostic kernel.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/diagnostics" className="btn-accent" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                  Open Master Scan
                </Link>
                <Link href="/diagnostics?demo=true" style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
                   Try Live Web Demo 
                </Link>
              </div>
           </div>

           {/* FixLab Shortcut */}
           <div>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 20 }}>Recent Fix Entries</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {[
                   'Laptop Thermal Throttling',
                   'No Boot: NVMe Detection Failure',
                   'Flickering Display: Ribbon Cable'
                 ].map(f => (
                   <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-bright)' }}></div>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
                   </div>
                 ))}
                 <Link href="/fixlab" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                   Browse FixLab <ArrowRight size={14} />
                 </Link>
              </div>
           </div>

           {/* Timeline Preview */}
           <div className="card-elevated" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 24 }}>Audit Trail</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                 <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: 1, background: 'var(--border)' }}></div>
                 {[
                   { t: '11:42', e: 'System Environment Scan' },
                   { t: '10:15', e: 'Keyboard Cluster Validation' }
                 ].map(a => (
                   <div key={a.t} style={{ position: 'relative', paddingLeft: 24 }}>
                      <div style={{ position: 'absolute', left: 1, top: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{a.t}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.e}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rotate { from { stroke-dashoffset: 238; } to { stroke-dashoffset: 0; } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .text-accent { color: var(--accent); }
      `}</style>
    </AppLayout>
  )
}
