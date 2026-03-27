'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Sparkles, 
  ChevronRight, ArrowRight, Search, 
  Clock, CheckCircle2, AlertCircle,
  Terminal, BookOpen
} from 'lucide-react'

export default function Dashboard() {
  const [sessionTime, setSessionTime] = useState(null) // Prevent hydration mismatch

  useEffect(() => {
    setSessionTime('00:00:00')
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
    { label: 'Session Active', value: sessionTime || '--:--:--', icon: Clock, accent: true },
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

  const resourceMatrix = [
    { label: 'Software Diagnostics', desc: 'OS & Driver Telemetry', icon: Terminal, href: '/diagnostics', color: 'var(--accent)' },
    { label: 'Troubleshooting', desc: 'Symptom-based pathing', icon: BookOpen, href: '/fixlab', color: '#3b82f6' },
    { label: 'Solution Engine', desc: 'AI-validated fix paths', icon: Sparkles, href: '/search', color: '#8b5cf6' },
    { label: 'Benchmarking', desc: 'Performance analytics', icon: Activity, href: '/tools', color: '#f59e0b' },
  ]

  return (
    <AppLayout>
      <div className="dashboard-layout">
        
        {/* Left: Main Dashboard */}
        <div>
          {/* Hero Zone */}
          <div className="hero-zone" style={{ marginBottom: 56 }}>
             <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--border)" strokeWidth="1" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="2" 
                    strokeDasharray="301" strokeDashoffset="100" 
                    style={{ animation: 'spin-slow 12s linear infinite', opacity: 0.6 }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Activity size={40} style={{ color: 'var(--accent)', opacity: 0.8 }} />
                </div>
             </div>
             <div>
                <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-2px', marginBottom: 8 }}>
                  Tech<span style={{ color: 'var(--accent)' }}>Workbench</span>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <span className="badge badge-ready" style={{ padding: '4px 10px' }}>SYSTEM ONLINE</span>
                   <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Command kernel v.1.0-stable</span>
                </div>
             </div>
          </div>

          {/* New Resource Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 64 }}>
             {resourceMatrix.map(r => (
               <Link key={r.label} href={r.href} style={{ textDecoration: 'none' }}>
                 <div className="card-elevated" style={{ 
                   display: 'flex', gap: 20, padding: 24, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                   borderLeft: `4px solid ${r.color}`
                 }}>
                    <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                       <r.icon size={20} style={{ color: r.color }} />
                    </div>
                    <div>
                       <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{r.label}</div>
                       <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{r.desc}</div>
                    </div>
                 </div>
               </Link>
             ))}
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map(s => (
              <div key={s.label} className="card-elevated" style={{ padding: '24px' }}>
                <div className="metric-label" style={{ color: s.accent ? 'var(--accent)' : 'var(--text-muted)' }}>
                   <s.icon size={12} strokeWidth={3} style={{ marginRight: 8 }} /> {s.label}
                </div>
                <div className="metric-value">
                   {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic Grid */}
          <div style={{ marginBottom: 48 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Primary <span style={{ color: 'var(--accent)' }}>Diagnostics</span></h2>
                <Link href="/tools" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Full Suite (7)</Link>
             </div>
             <div className="diagnostic-layout">
                {tests.map(t => (
                  <Link key={t.id} href={`/tools/${t.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 28 }}>{t.icon}</span>
                        <span className="badge badge-ready">READY</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{t.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Sidebar Panel */}
        <div className="sidebar-panel">
           {/* ScanLab Shortcut */}
           <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 32 }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>System Telemetry</div>
              <h3 style={{ fontSize: 20, marginBottom: 12 }}>ScanLab Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Run deep hardware scans using our precision diagnostic kernel.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/diagnostics" className="btn-accent" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Execute Master Scan
                </Link>
                <Link href="/diagnostics?demo=true" style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                   Simulation Mode
                </Link>
              </div>
           </div>

           {/* Timeline Preview */}
           <div className="card-elevated" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 32, fontWeight: 800 }}>System Logbook</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
                 <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: 1, background: 'var(--border)' }}></div>
                 {[
                   { t: '11:42', e: 'Environment Scan complete' },
                   { t: '10:15', e: 'HID Cluster validated' }
                 ].map(a => (
                   <div key={a.t} style={{ position: 'relative', paddingLeft: 28 }}>
                      <div style={{ position: 'absolute', left: 1, top: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}></div>
                      <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{a.t}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{a.e}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  )
}
