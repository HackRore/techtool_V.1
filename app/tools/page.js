'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/AppLayout'
import tools from '../../data/tools.json'
import { 
  Zap, CheckCircle2, AlertCircle, 
  Circle, Download, ChevronRight, 
  ArrowRight, Shield 
} from 'lucide-react'

export default function TestLabHub() {
  const [results, setResults] = useState({})
  
  useEffect(() => {
    // Load all results from localStorage
    const saved = {}
    tools.forEach(t => {
      const res = localStorage.getItem(`hackrore_result_${t.id}`)
      if (res) saved[t.id] = res
    })
    setResults(saved)
  }, [])

  const completedCount = Object.keys(results).length
  const progressPct = Math.round((completedCount / tools.length) * 100)

  return (
    <AppLayout>
      <div className="hub-layout animate-in">
        
        {/* Left Panel: Progress Summary */}
        <div className="hub-sidebar">
           <div className="breadcrumb">Peripherals / TestLab / Hub</div>
           <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>Hardware Hub</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Automated browser-based diagnostics for peripheral validation.</p>

           {/* Progress Ring / Bar */}
           <div className="card-elevated" style={{ padding: 24, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>COMPLETION</span>
                 <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{completedCount}/{tools.length}</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', borderRadius: 3, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, background: 'var(--accent)', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
              </div>
              <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
                 <Shield size={14} style={{ color: 'var(--accent)' }} />
                 Validated for Dispatch
              </div>
           </div>

           {/* Test List Status */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tools.map(t => {
                const res = results[t.id]
                return (
                  <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ 
                      padding: '12px 16px', borderRadius: 8,
                      background: res ? 'var(--bg-secondary)' : 'transparent', 
                      borderColor: res ? 'var(--border)' : 'transparent',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }} >
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {res === 'pass' ? <CheckCircle2 size={14} style={{ color: 'var(--status-pass)' }} /> : 
                           res === 'warn' ? <AlertCircle size={14} style={{ color: 'var(--status-warn)' }} /> : 
                           <Circle size={14} style={{ color: 'var(--border)', opacity: 0.5 }} />}
                          <span style={{ fontSize: 13, color: res ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: res ? 700 : 500 }}>{t.name}</span>
                       </div>
                       <ChevronRight size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    </div>
                  </Link>
                )
              })}
           </div>

           <button className="btn-secondary" style={{ width: '100%', marginTop: 32, padding: '14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Download size={14} /> Export Assessment PDF
           </button>
        </div>

        {/* Right Content: Grid */}
        <div className="hub-main">
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {tools.map(t => (
                <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card-elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: results[t.id] === 'pass' ? 'var(--accent)' : 'var(--border)' }}>
                    <div style={{ fontSize: 40, marginBottom: 24 }}>{t.icon}</div>
                    <h3 style={{ fontSize: 18, marginBottom: 12, fontWeight: 900, letterSpacing: -0.5 }}>{t.name}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>{t.description}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span className="badge badge-ready">{t.difficulty}</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                          LAUNCH <ArrowRight size={12} />
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </AppLayout>
  )
}
