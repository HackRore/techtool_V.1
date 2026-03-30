'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Brain, Zap, ShieldCheck, Activity, Cpu, Network } from 'lucide-react'
import { useHistory } from './HistoryProvider'

export default function AuraIntelligenceHub() {
  const { history } = useHistory()
  const [syncStatus, setSyncStatus] = useState('Initializing')
  const [loadFactor, setLoadFactor] = useState(0)

  useEffect(() => {
    const statuses = ['Analyzing_History', 'Syncing_Knowledge_Base', 'Kernel_Optimization', 'Aura_Ready', 'Monitoring_Signals']
    let i = 0
    const interval = setInterval(() => {
      setSyncStatus(statuses[i % statuses.length])
      setLoadFactor(Math.floor(Math.random() * 15) + 5 + (history.length * 2))
      i++
    }, 4000)
    return () => clearInterval(interval)
  }, [history])

  return (
    <div className="card-elevated" style={{ 
      position: 'relative', overflow: 'hidden', padding: '40px',
      borderLeft: '4px solid var(--accent)', transition: 'all var(--duration) var(--ease)'
    }}>
      {/* Background Deep Pulse */}
      <div style={{ 
        position: 'absolute', top: '-50%', right: '-30%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        animation: 'aura-pulse 10s infinite alternate', pointerEvents: 'none', zIndex: 0
      }}></div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div className="aura-container" style={{ flexShrink: 0 }}>
          <div className="aura-node" style={{ width: 80, height: 80 }}></div>
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 4px var(--accent))' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2.5, textTransform: 'uppercase' }}>Cognitive Diagnostic Core</span>
          </div>
          
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>
            AURA <span style={{ color: 'var(--accent)' }}>INTELLIGENCE</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 24 }}>
             <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                   <Cpu size={12} style={{ color: 'var(--text-muted)' }} />
                   <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>KNOWLEDGE_NODES</div>
                </div>
                <div className="text-mono" style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)' }}>{12842 + history.length}</div>
             </div>
             <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                   <Activity size={12} style={{ color: 'var(--text-muted)' }} />
                   <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>DYNAMIC_LOAD</div>
                </div>
                <div className="text-mono" style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)' }}>{loadFactor}%</div>
             </div>
          </div>
          
          <div style={{ padding: '16px 20px', background: 'var(--accent-glow)', borderRadius: 12, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: 12 }}>
             <Brain size={18} style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 5px var(--accent))' }} />
             <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
               STATUS: <span style={{ color: 'var(--accent)' }}>{syncStatus?.toUpperCase()}...</span>
             </div>
          </div>
        </div>

        {history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 180 }} className="desktop-only">
             <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Recent Signal Sync</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 3).map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: h.result === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)' }} />
                     <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{h.event || 'Subsystem Validation'}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
