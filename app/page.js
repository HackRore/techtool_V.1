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

import QuickTestModal from '../components/testlab/QuickTestModal'
import AuraIntelligenceHub from '../components/AuraIntelligenceHub'

export default function Dashboard() {
  const [sessionTime, setSessionTime] = useState(null) // Prevent hydration mismatch
  const [activeQuickTest, setActiveQuickTest] = useState(null)

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

    const handleMouseMove = (e) => {
      for(const card of document.getElementsByClassName("card")) {
        const rect = card.getBoundingClientRect(),
              x = e.clientX - rect.left,
              y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      clearInterval(timer)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const stats = [
    { label: 'Verified Tests', value: 7, icon: Zap },
    { label: 'Fix Library', value: 50, icon: Shield },
    { label: 'Scan Modules', value: 21, icon: Activity },
    { label: 'Session Active', value: sessionTime || '--:--:--', icon: Clock, accent: true },
  ]

  const tests = [
    { id: 'keyboard', name: 'Keyboard', desc: '104-key cluster', status: 'ready', icon: '⌨️' },
    { id: 'display', name: 'Display', desc: 'Pixel/Frequency', status: 'ready', icon: '🖥️' },
    { id: 'audio', name: 'Audio', desc: 'Stereo Sweep', status: 'ready', icon: '🔊' },
    { id: 'media', name: 'Camera', desc: 'Sensor/FPS', status: 'ready', icon: '📹' },
    { id: 'mic', name: 'Mic', desc: 'Waveform', status: 'ready', icon: '🎙️' },
    { id: 'mouse', name: 'Mouse', desc: 'Precision', status: 'ready', icon: '🖱️' },
    { id: 'touch', name: 'Touch', desc: 'Multi-point', status: 'ready', icon: '👆' },
    { id: 'gpu', name: 'GPU', desc: 'Stress/VRAM', status: 'ready', icon: '💎' },
  ]

  const resourceMatrix = [
    { label: 'Software Diagnostics', desc: 'OS & Driver Telemetry', icon: Terminal, href: '/diagnostics', color: 'var(--accent)' },
    { label: 'Troubleshooting Hub', desc: 'Symptom-based pathing', icon: BookOpen, href: '/fixlab', color: '#3b82f6' },
    { label: 'Solution Engine', desc: 'AI-validated fix paths', icon: Sparkles, href: '/search', color: '#8b5cf6' },
    { label: 'Lab Resources', desc: 'Hardware benchmarks', icon: Activity, href: '/tools', color: '#f59e0b' },
  ]

  return (
    <AppLayout>
      <div className="dashboard-layout animate-in">
        
        {/* Left: Main Dashboard */}
        <div style={{ minWidth: 0 }}>
          
          {/* Quick Tests Row (Technician Priority) */}
          <div id="quick-tests" style={{ marginBottom: 48 }}>
             <h3 style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: 1.5, fontWeight: 800 }}>QUICK HARDWARE TESTS</h3>
             <div className="quick-tests-scroll" style={{ 
               display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16,
               scrollbarWidth: 'none', msOverflowStyle: 'none'
             }}>
                {tests.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setActiveQuickTest(t)}
                    className="card"
                    style={{ 
                      flexShrink: 0, width: 140, padding: '20px 16px', textAlign: 'center', 
                      cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                     <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                     <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{t.name}</div>
                  </div>
                ))}
             </div>
          </div>

          {/* Command Center (Main Hero) */}
          <div className="hero-zone" style={{ marginBottom: 56, background: 'var(--bg-secondary)', padding: '40px 48px', borderRadius: 16, border: '1px solid var(--border)' }}>
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

          {/* Stats Grid */}
          <div className="stats-grid" style={{ marginBottom: 64 }}>
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

          {/* AURA AI Intelligence Hub (Model Fulfillment) */}
          <div style={{ marginBottom: 64 }}>
             <AuraIntelligenceHub />
          </div>

          {/* Resource Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 64 }}>
             {resourceMatrix.map(r => (
               <Link key={r.label} href={r.href} style={{ textDecoration: 'none' }}>
                 <div className="card" style={{ 
                   display: 'flex', gap: 20, padding: 32, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                   borderLeft: `4px solid ${r.color}`
                 }}>
                    <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                       <r.icon size={20} style={{ color: r.color }} />
                    </div>
                    <div>
                       <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{r.label}</div>
                       <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{r.desc}</div>
                    </div>
                 </div>
               </Link>
             ))}
          </div>
        </div>

        {/* Right: Sidebar Panel */}
        <div className="sidebar-panel">
           {/* Labs Shortcut */}
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

      {/* Hardware Test Engine (Audit Fix: Launching Tests) */}
      <QuickTestModal 
        isOpen={!!activeQuickTest} 
        onClose={() => setActiveQuickTest(null)}
        testId={activeQuickTest?.id}
        testName={activeQuickTest?.name}
      />
    </AppLayout>
  )
}
