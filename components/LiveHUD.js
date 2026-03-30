'use client'
import { useTelemetry } from '../hooks/useTelemetry'
import { Zap, Wifi, Activity } from 'lucide-react'

export default function LiveHUD() {
  const { battery, connection, fps } = useTelemetry()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
       
       {/* Battery Telemetry */}
       <div className="card-elevated" style={{ padding: '24px', transition: 'all var(--duration) var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <Zap size={16} style={{ color: battery?.charging ? 'var(--status-pass)' : 'var(--accent)', filter: battery?.charging ? 'drop-shadow(0 0 8px var(--status-pass))' : 'none' }} />
             </div>
             <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2 }}>Battery Logic</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
             <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
                {battery ? `${battery.level}%` : '---'}
             </div>
             <span className={`badge badge-${battery?.charging ? 'pass' : 'ready'}`} style={{ fontSize: 9 }}>
                {battery?.charging ? 'CHARGING' : 'ACTIVE'}
             </span>
          </div>
       </div>

       {/* Network Telemetry */}
       <div className="card-elevated" style={{ padding: '24px', transition: 'all var(--duration) var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <Wifi size={16} style={{ color: 'var(--accent)', animation: 'aura-pulse 2s infinite' }} />
             </div>
             <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2 }}>Sync Frequency</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
             <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
                {connection ? connection.effectiveType.toUpperCase() : '---'}
             </div>
             <span className="badge badge-ready" style={{ fontSize: 9 }}>
                {connection ? `${connection.downlink} MBPS` : 'LINKING...'}
             </span>
          </div>
       </div>

       {/* Performance Telemetry */}
       <div className="card-elevated" style={{ padding: '24px', transition: 'all var(--duration) var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <Activity size={16} style={{ color: fps < 30 ? 'var(--status-warn)' : 'var(--status-pass)', filter: fps >= 50 ? 'drop-shadow(0 0 8px var(--status-pass))' : 'none' }} />
             </div>
             <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2 }}>Core Latency</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
             <div className="text-mono" style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
                {fps} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>FPS</span>
             </div>
             <span className={`badge badge-${fps >= 50 ? 'pass' : 'warn'}`} style={{ fontSize: 9 }}>
                {fps >= 50 ? 'OPTIMAL' : 'THROTTLED'}
             </span>
          </div>
       </div>

    </div>
  )
}
