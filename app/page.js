'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Clock, 
  FileCode, Hammer
} from 'lucide-react'

import JobBoard from '../components/dashboard/JobBoard'

function StatCard({ label, value, live }) {
  return (
    <div className="card" style={{textAlign:'center'}}>
      <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px',
        fontFamily:'JetBrains Mono, monospace', letterSpacing:'.06em', textTransform:'uppercase'}}>
        {label}
      </div>
      <div style={{fontSize:'28px', fontWeight:700, fontFamily:'JetBrains Mono, monospace',
        color: live ? 'var(--accent)' : 'var(--text-primary)'}}
        suppressHydrationWarning={true}>
        {value}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [sessionTime, setSessionTime] = useState('00:00')

  useEffect(() => {
    const start = Date.now()
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000)
      setSessionTime(
        String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
      )
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <AppLayout>
      <div className="dashboard-layout animate-in">
        
        {/* Main Workspace */}
        <div style={{ minWidth: 0 }}>
          
          {/* CommandCenter: Professional Hero */}
          <section className="hero-zone glass-elevated" style={{ 
            marginBottom: 48, borderRadius: 24, padding: '64px 56px',
            position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 64
          }}>
             <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, zIndex: 1, filter: 'drop-shadow(0 0 20px var(--accent-glow))' }}>
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 8"
                    style={{ animation: 'spin-slow 40s linear infinite' }} />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="4" 
                    strokeDasharray="1 300" strokeLinecap="round"
                    style={{ animation: 'spin-slow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Activity size={48} style={{ color: 'var(--accent)' }} />
                </div>
             </div>

             <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 className="glow-text" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                   Tech<span style={{ color: 'var(--accent)' }}>Workbench</span>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16 }}>
                   <span className="badge badge-ready" style={{ padding: '8px 16px', fontSize: 11 }}>SYSTEM ONLINE</span>
                   <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
                     v7.0_STABLE // PROD
                   </span>
                </div>
             </div>
          </section>

          {/* Real stat cards */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'32px'}}>
            <StatCard label="Browser Tests" value="7" />
            <StatCard label="Fix Entries" value="50" />
            <StatCard label="Scan Modules" value="21" />
            <StatCard label="Session" value={sessionTime} live />
          </div>

          {/* Quick Access Tools */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 56 }}>
             <Link href="/fixlab/bsod" className="card-elevated hover:glow-border" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'center', textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, background: 'var(--status-fail)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Zap size={24} color="#000" />
                </div>
                <div>
                   <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>REFERENCE</div>
                   <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>BSOD Decoder</div>
                </div>
             </Link>
             <Link href="/fixlab/commands" className="card-elevated hover:glow-border" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'center', textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <FileCode size={24} color="#000" />
                </div>
                <div>
                   <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>TOOLBOX</div>
                   <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>Command Forge</div>
                </div>
             </Link>
          </div>

          {/* Core Hardware Tests */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 56 }}>
             {[
               { id: 'keyboard', name: 'Keyboard', icon: '⌨️', category: 'HID' },
               { id: 'screen',   name: 'Display',  icon: '🖥️', category: 'VISUAL' },
               { id: 'speaker',  name: 'Audio',    icon: '🔊', category: 'OUTPUT' },
               { id: 'gpu',      name: 'GPU',      icon: '💎', category: 'STRESS' },
               { id: 'battery',  name: 'Battery',  icon: '🔋', category: 'POWER' },
               { id: 'webcam',   name: 'Webcam',   icon: '📷', category: 'MEDIA' },
             ].map(t => (
               <Link key={t.id} href={`/tools/${t.id}`} className="card" style={{ 
                 textAlign: 'center', padding: '32px 20px', cursor: 'pointer', textDecoration: 'none'
               }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{t.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.5, color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', marginTop: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t.category}</div>
               </Link>
             ))}
          </div>

        </div>

        {/* Action Panel */}
        <aside className="sidebar-panel">
           <div className="card-elevated" style={{ padding: 32, borderTop: '4px solid var(--accent)', marginBottom: 24 }}>
              <Hammer size={24} style={{ color: 'var(--accent)', marginBottom: 20 }} />
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Technician Hub</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Run system scans, manage repair tickets, and access technical reference documentation.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <Link href="/diagnostics" className="btn-accent" style={{ textDecoration: 'none', textAlign: 'center' }}>
                    Upload Scan Report →
                 </Link>
                 <Link href="/fixlab" style={{ 
                    padding: '14px', borderRadius: 10, background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border)', color: 'var(--text-primary)', 
                    textAlign: 'center', fontWeight: 800, fontSize: 12, textDecoration: 'none',
                    letterSpacing: 1
                 }}>
                    Browse FixLab →
                 </Link>
              </div>
           </div>

           {/* Repair Ticket Manager */}
           <div style={{ height: 600 }}>
              <JobBoard />
           </div>
        </aside>
      </div>
    </AppLayout>
  )
}
