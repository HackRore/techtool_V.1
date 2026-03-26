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
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48, alignItems: 'start' }}>
        
        {/* Left Panel: Progress Summary */}
        <div style={{ position: 'sticky', top: 104 }}>
           <div className="breadcrumb" style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>TestLab / Inventory</div>
           <h2 style={{ fontSize: 24, marginBottom: 8 }}>Hardware Hub</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>Automated browser-based diagnostics for peripheral validation.</p>

           {/* Progress Ring / Bar */}
           <div className="card-elevated" style={{ padding: 24, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>COMPLETION</span>
                 <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{completedCount}/7</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, background: 'var(--accent)', transition: 'width 0.5s ease-out' }}></div>
              </div>
              <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Shield size={12} className="text-accent" />
                 Validated for Repair Handover
              </div>
           </div>

           {/* Test List Status */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tools.map(t => {
                const res = results[t.id]
                return (
                  <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      padding: '10px 12px', borderRadius: 8,
                      background: 'transparent', transition: 'var(--transition)'
                    }} className="hover:bg-elevated">
                       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {res === 'pass' ? <CheckCircle2 size={14} className="text-accent" /> : 
                           res === 'warn' ? <AlertCircle size={14} style={{ color: 'var(--amber)' }} /> : 
                           <Circle size={14} style={{ color: 'var(--text-muted)' }} />}
                          <span style={{ fontSize: 13, color: res ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: res ? 600 : 400 }}>{t.name}</span>
                       </div>
                       <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                )
              })}
           </div>

           <button className="btn-secondary" style={{ width: '100%', marginTop: 32, padding: '10px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={14} />
              Export Batch Results
           </button>
        </div>

        {/* Right Content: Grid */}
        <div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {tools.map(t => (
                <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%', borderLeft: `2px solid ${results[t.id] === 'pass' ? 'var(--accent)' : 'var(--border)'}` }}>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>{t.icon}</div>
                    <h3 style={{ fontSize: 16, marginBottom: 8 }}>{t.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{t.description}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.difficulty}</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 700, fontSize: 11 }}>
                          START TEST <ArrowRight size={12} />
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>

      <style jsx>{`
        .hover\:bg-elevated:hover { background: var(--bg-elevated) !important; }
        .text-accent { color: var(--accent); }
      `}</style>
    </AppLayout>
  )
}
