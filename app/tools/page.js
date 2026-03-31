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

        {/* thetest.com Style Hub: Full-Width Diagnostic Grid */}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
           <div style={{ 
             display: 'grid', 
             gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
             gap: 32, marginBottom: 80 
           }}>
              {tools.map(t => (
                <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card-elevated" style={{ 
                    height: '100%', display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', textAlign: 'center',
                    borderColor: results[t.id] === 'pass' ? 'var(--status-pass)' : 'var(--border)',
                    padding: '64px 32px 48px 32px'
                  }}>
                    <div style={{ fontSize: 72, marginBottom: 32, filter: 'drop-shadow(0 0 20px var(--accent-glow))' }}>{t.icon}</div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <h2 style={{ fontSize: 24, marginBottom: 12, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{t.name}</h2>
                       <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 40, maxWidth: 240 }}>
                          {t.description.split('.')[0]}.
                       </p>
                    </div>
                    
                    <button className="btn-accent" style={{ 
                       width: '100%', height: 54, background: 'var(--bg-primary)', 
                       border: '1px solid var(--accent)', color: 'var(--accent)',
                       fontSize: 12, fontWeight: 900, letterSpacing: 2, borderRadius: 14,
                       boxShadow: '0 4px 0 var(--accent-dim)'
                    }}>
                       START_DIAGNOSTIC
                    </button>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </AppLayout>
  )
}
