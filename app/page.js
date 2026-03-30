'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Sparkles, 
  ChevronRight, ArrowRight, Search, 
  Clock, CheckCircle2, AlertCircle,
  Terminal, BookOpen, Layers, Cpu,
  Database
} from 'lucide-react'

import QuickTestModal from '../components/testlab/QuickTestModal'
import AuraIntelligenceHub from '../components/AuraIntelligenceHub'
import LiveHUD from '../components/LiveHUD'

export default function Dashboard() {
  const [sessionTime, setSessionTime] = useState(null)
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
    return () => clearInterval(timer)
  }, [])

  const stats = [
    { label: 'Validated Modules', value: '254', icon: Layers, status: 'pass' },
    { label: 'Active Telemetry',  value: '99.8%', icon: Activity, status: 'pass' },
    { label: 'Threat Surface',    value: '0.00', icon: Shield, status: 'ready' },
    { label: 'Kernel Uptime',     value: sessionTime || '--:--:--', icon: Clock, status: 'info' },
  ]

  const tests = [
    { id: 'keyboard', name: 'Keyboard', icon: '⌨️', category: 'HID' },
    { id: 'display',  name: 'Display',  icon: '🖥️', category: 'VISUAL' },
    { id: 'audio',    name: 'Audio',    icon: '🔊', category: 'OUTPUT' },
    { id: 'gpu',      name: 'GPU',      icon: '💎', category: 'STRESS' },
    { id: 'cpu',      name: 'CPU',      icon: '⚙️', category: 'LOGIC' },
    { id: 'ram',      name: 'Memory',   icon: '🧠', category: 'MEM' },
  ]

  return (
    <AppLayout>
      <div className="dashboard-layout animate-in">
        
        {/* Main Workspace */}
        <div style={{ minWidth: 0 }}>
          
          {/* CommandCenter V.2: Elite Hero */}
          <section className="hero-zone glass-elevated" style={{ 
            marginBottom: 48, borderRadius: 24, padding: '64px 56px',
            position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 64
          }}>
             {/* Background Pulse Effect */}
             <div style={{ 
                position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500,
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                animation: 'aura-pulse 8s infinite alternate', zIndex: 0
             }}></div>

             <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, zIndex: 1 }}>
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="2.5" 
                    strokeDasharray="301" strokeDashoffset="40" 
                    style={{ animation: 'spin-slow 20s linear infinite', filter: 'drop-shadow(0 0 12px var(--accent))' }} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-bright)" strokeWidth="1" strokeDasharray="10 5" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Activity size={56} style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 20px var(--accent))' }} />
                </div>
             </div>

             <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 className="glow-text" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                  Tech<span style={{ color: 'var(--accent)' }}>Workbench</span>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16 }}>
                   <span className="badge badge-ready" style={{ padding: '8px 16px', fontSize: 11 }}>SYSTEM_STATUS::OPERATIONAL</span>
                   <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
                     KERNEL VERSION v.2.0.1-ELITE
                   </span>
                </div>
             </div>
          </section>

          {/* Telemetry HUD */}
          <div style={{ marginBottom: 48 }}>
             <LiveHUD />
          </div>

          {/* Core Diagnostic Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 56 }}>
             {tests.map(t => (
               <div key={t.id} onClick={() => setActiveQuickTest(t)} className="card" style={{ 
                 textAlign: 'center', padding: '32px 20px', cursor: 'pointer', borderBottom: '2px solid transparent'
               }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{t.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.5 }}>{t.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', marginTop: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t.category}</div>
               </div>
             ))}
          </div>

          {/* Analytics Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 64 }}>
             {stats.map(s => (
               <div key={s.label} className="card-elevated" style={{ padding: 24, borderLeft: '1px solid var(--border-bright)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                     <div style={{ width: 36, height: 36, background: 'var(--bg-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        <s.icon size={18} style={{ color: 'var(--accent)' }} />
                     </div>
                     <span className={`badge badge-${s.status}`} style={{ fontSize: 9 }}>{s.status}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{s.label}</div>
                  <div className="metric-value text-mono" style={{ fontSize: 28, color: 'var(--text-primary)' }}>{s.value}</div>
               </div>
             ))}
          </div>

          {/* Intelligent Insights */}
          <div style={{ marginBottom: 64 }}>
             <AuraIntelligenceHub />
          </div>

        </div>

        {/* Intelligence Side-Panel */}
        <aside className="sidebar-panel">
           <div className="card-elevated" style={{ padding: 32, borderTop: '4px solid var(--accent)' }}>
              <Terminal size={24} style={{ color: 'var(--accent)', marginBottom: 20 }} />
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Operator Hub</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Advanced diagnostic kernel initialized. Run collective system scans or specific hardware validations.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <Link href="/diagnostics" className="btn-accent" style={{ textDecoration: 'none' }}>
                    Execute Global Scan
                 </Link>
                 <Link href="/fixlab" style={{ 
                    padding: '14px', borderRadius: 10, background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border)', color: 'var(--text-primary)', 
                    textAlign: 'center', fontWeight: 800, fontSize: 12, textDecoration: 'none',
                    letterSpacing: 1
                 }}>
                    KNOWLEDGE HUB
                 </Link>
              </div>
           </div>

           <div className="card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                 <h3>Kernel Logs</h3>
                 <div className="badge badge-ready" style={{ gap: 6 }}>ONLINE</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                 {[
                   { t: '13:04', e: 'HID cluster handshake complete', s: 'pass' },
                   { t: '12:51', e: 'Bus encryption synchronized', s: 'pass' },
                   { t: '12:44', e: 'Diagnostic telemetry active', s: 'info' },
                 ].map((log, i) => (
                   <div key={i} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 40 }}>{log.t}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{log.e}</div>
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>

      <QuickTestModal 
        isOpen={!!activeQuickTest} 
        onClose={() => setActiveQuickTest(null)}
        testId={activeQuickTest?.id}
        testName={activeQuickTest?.name}
      />
    </AppLayout>
  )
}
