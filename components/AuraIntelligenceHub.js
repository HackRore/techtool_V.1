'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Brain, Zap, ShieldCheck } from 'lucide-react'

export default function AuraIntelligenceHub() {
  const [syncStatus, setSyncStatus] = useState('Initializing')
  const [loadFactor, setLoadFactor] = useState(0)

  useEffect(() => {
    const statuses = ['Analyzing Cluster', 'Syncing Knowledge Base', 'Ready', 'Idle']
    let i = 0
    const interval = setInterval(() => {
      setSyncStatus(statuses[i % statuses.length])
      setLoadFactor(Math.floor(Math.random() * 15) + 5)
      i++
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card-elevated" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Ambient Glow */}
      <div style={{ 
        position: 'absolute', top: '-50%', right: '-20%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        opacity: 0.5, pointerEvents: 'none'
      }}></div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <div className="aura-container">
          <div className="aura-node"></div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Sparkles size={16} className="text-accent" style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 13, letterSpacing: '2px', margin: 0 }}>AURA INTELLIGENCE</h3>
          </div>
          
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
            AURA <span style={{ color: 'var(--accent)', opacity: 0.8 }}>v.1.0-alpha</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
             <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4 }}>KNOWLEDGE NODES</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>12,842</div>
             </div>
             <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4 }}>BRAIN LOAD</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{loadFactor}%</div>
             </div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: 24, padding: '16px', background: 'rgba(0, 212, 160, 0.05)', 
        borderRadius: 8, border: '1px solid rgba(0, 212, 160, 0.1)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
         <Brain size={16} style={{ color: 'var(--accent)' }} />
         <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
           Status: <span style={{ color: 'var(--accent)' }}>{syncStatus}...</span>
         </div>
      </div>
    </div>
  )
}
