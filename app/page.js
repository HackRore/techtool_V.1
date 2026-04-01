'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Clock, 
  FileCode, Hammer, Smartphone, MousePointer2, ChevronRight,
  ArrowRight, Search, Cpu, CheckCircle2
} from 'lucide-react'

import JobRegistry from '../components/dashboard/JobBoard'

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
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Step 0: Minimalist Branding Header */}
        <section style={{ marginTop: '24px' }}>
           <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', marginBottom: '8px' }}>
              Diagnostics Dashboard
           </h1>
           <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px' }}>
              Professional hardware assessment and repair workflow for technicians.
           </p>
        </section>

        {/* Step 1: Guided Workflow (thetest.com style) */}
        <section style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
          background: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)'
        }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'var(--accent)', width: 'fit-content' }}>STEP_01</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'none', letterSpacing: 'normal' }}>Run Hardware Tests</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                 Execute real-time diagnostics on input devices, display, and audio.
              </p>
              <Link href="/tools" className="btn-primary" style={{ marginTop: '8px' }}>Start Diagnostics</Link>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', width: 'fit-content' }}>STEP_02</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'none', letterSpacing: 'normal' }}>Analyze Reports</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                 Upload system telemetry files or view manual scan logs.
              </p>
              <Link href="/diagnostics" className="btn-outline" style={{ marginTop: '8px' }}>View Reports</Link>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', width: 'fit-content' }}>STEP_03</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'none', letterSpacing: 'normal' }}>Apply Repairs</h3>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'none', letterSpacing: 'normal' }}>Repair Guides</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                 Access validated fix protocols and technician repair documentation.
              </p>
              <Link href="/fixlab" className="btn-outline" style={{ marginTop: '8px' }}>Open Guides</Link>
           </div>
        </section>

        {/* Real-time Session Bar */}
        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
           <div style={{ display: 'flex', gap: 32 }}>
              <div>
                 <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>SESSION_TIME</div>
                 <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{sessionTime}</div>
              </div>
              <div>
                 <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>TESTS_AVAILABLE</div>
                 <div style={{ fontSize: 18, fontWeight: 900 }}>08</div>
              </div>
              <div>
                 <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>REF_ENTRIES</div>
                 <div style={{ fontSize: 18, fontWeight: 900 }}>50+</div>
              </div>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="var(--status-pass)" />
              HNT_PROD_DEPLOYED
           </div>
        </section>

        {/* Main Workspace Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
           
           {/* Primary Navigation Cards */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                 <Link href="/quickref/bsod" className="card" style={{ padding: '32px', textDecoration: 'none' }}>
                    <Search size={32} style={{ color: 'var(--accent)', marginBottom: 20 }} />
                    <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>StopCode Reference</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Searchable database of Windows BSOD error codes and field repairs.</p>
                 </Link>
                 <Link href="/resources" className="card" style={{ padding: '32px', textDecoration: 'none' }}>
                    <Zap size={32} style={{ color: 'var(--accent)', marginBottom: 20 }} />
                    <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Technical Toolbox</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Administrative commands and essential technician utilities.</p>
                 </Link>
              </div>

              {/* Hardware Shortcuts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                 {[
                   { name: 'Keyboard', icon: '⌨️' },
                   { name: 'Display', icon: '🖥️' },
                   { name: 'Audio', icon: '🔊' },
                   { name: 'Battery', icon: '🔋' },
                 ].map(t => (
                   <Link key={t.name} href="/tools" className="card hover:glow-border" style={{ textAlign: 'center', padding: '24px 12px', textDecoration: 'none' }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{t.name}</div>
                   </Link>
                 ))}
              </div>
           </div>

           {/* Sidebar: Real-time Job Registry */}
           <aside style={{ height: '100%' }}>
              <div style={{ height: '100%', minHeight: 600 }}>
                 <JobRegistry />
              </div>
           </aside>

        </div>

      </div>
    </AppLayout>
  )
}
