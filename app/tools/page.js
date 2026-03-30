'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/AppLayout'
import tools from '../../data/tools.json'
import { 
  Zap, CheckCircle2, AlertCircle, 
  Circle, Download, ChevronRight, 
  ArrowRight, Shield, Activity,
  Layers, Filter
} from 'lucide-react'

export default function TestLabHub() {
  const [results, setResults] = useState({})
  
  useEffect(() => {
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
      <div className="animate-in">
        
        {/* Hub Header */}
        <header style={{ marginBottom: 64, borderBottom: '1px solid var(--border)', paddingBottom: 40 }}>
           <div className="badge badge-ready" style={{ marginBottom: 24, fontSize: 10 }}>PERIPHERAL_AUDIT // TESTLAB_HUB</div>
           <h1 style={{ marginBottom: 16 }}>Hardware <span className="glow-text" style={{ color: 'var(--accent)' }}>Validation Lab</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 650, lineHeight: 1.6 }}>
             Execute automated browser-based diagnostics to validate peripheral integrity. Every test generates a cryptographic proof of performance.
           </p>
        </header>

        <div className="dashboard-layout">
          
          {/* Main Grid: Tools */}
          <div style={{ minWidth: 0 }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 80 }}>
                {tools.map(t => (
                  <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="card-elevated" style={{ 
                      height: '100%', display: 'flex', flexDirection: 'column', 
                      borderColor: results[t.id] === 'pass' ? 'var(--status-pass)' : 'var(--border)',
                      transition: 'all var(--duration) var(--ease)',
                      padding: 32
                    }}>
                      <div style={{ fontSize: 44, marginBottom: 24 }}>{t.icon}</div>
                      <h3 style={{ fontSize: 18, marginBottom: 12, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'none', letterSpacing: -0.5 }}>{t.name}</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>{t.description}</p>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span className={`badge badge-${results[t.id] === 'pass' ? 'pass' : 'ready'}`}>{t.difficulty || 'standard'}</span>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            LAUNCH <ChevronRight size={14} />
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>

          {/* Sidebar: Progress & Audit Trail */}
          <aside className="sidebar-panel">
             
             {/* Progress Engine */}
             <div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                   <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>HUB_VALIDATION</div>
                   <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{progressPct}%</div>
                </div>
                
                <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24 }}>
                   <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', transition: 'width 1s var(--ease)' }}></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 800 }}>
                   <Shield size={14} style={{ color: 'var(--accent)' }} />
                   {completedCount}/{tools.length} MODULES_VERIFIED
                </div>
             </div>

             {/* Audit Trail List */}
             <div className="card-elevated" style={{ padding: 32, background: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: 11, marginBottom: 24, letterSpacing: 1.5 }}>Kernel Audit Trail</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   {tools.map(t => {
                     const res = results[t.id]
                     return (
                       <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                         <div style={{ 
                           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                           padding: '12px 16px', borderRadius: 10, background: 'var(--bg-primary)',
                           border: `1px solid ${res ? 'var(--accent-glow)' : 'var(--border)'}`,
                           opacity: res ? 1 : 0.6
                         }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                               {res === 'pass' ? <CheckCircle2 size={14} style={{ color: 'var(--status-pass)' }} /> : 
                                res === 'warn' ? <AlertCircle size={14} style={{ color: 'var(--status-warn)' }} /> : 
                                <Activity size={14} style={{ color: 'var(--text-muted)' }} />}
                               <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</span>
                            </div>
                            {res && <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--accent)' }}>VALIDATED</span>}
                         </div>
                       </Link>
                     )
                   })}
                </div>

                <button className="btn-accent" style={{ width: '100%', marginTop: 32, height: 50, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text-primary)' }}>
                   <Download size={16} /> GENERATE_REPORT
                </button>
             </div>

             <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--status-info)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                   <Filter size={18} style={{ color: 'var(--status-info)' }} />
                   <div style={{ fontSize: 11, fontWeight: 800 }}>QUICK_FILTER // ALL_MODULES</div>
                </div>
             </div>

          </aside>

        </div>
      </div>
    </AppLayout>
  )
}
