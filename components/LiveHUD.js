'use client'
import { useTelemetry } from '../hooks/useTelemetry'
import { Zap, Wifi, Activity } from 'lucide-react'

export default function LiveHUD() {
  const { battery, connection, fps } = useTelemetry()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
       <div className="card-elevated" style={{ padding: '20px', transition: 'all var(--duration) var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
             <Zap size={14} style={{ color: battery?.charging ? 'var(--status-pass)' : 'var(--accent)', filter: battery?.charging ? 'drop-shadow(0 0 4px var(--status-pass))' : 'none' }} />
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Battery Status</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
             {battery ? `${battery.level}%` : '---'}
             <span style={{ fontSize: 10, color: battery?.charging ? 'var(--status-pass)' : 'var(--text-muted)', marginLeft: 12, fontWeight: 800 }}>
                {battery?.charging ? '⚡ CHARGING' : 'DISCHARGING'}
             </span>
          </div>
       </div>

       <div className="card-elevated" style={{ padding: '20px', transition: 'all var(--duration) var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
             <Wifi size={14} style={{ color: 'var(--accent)', animation: 'aura-pulse 2s infinite' }} />
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Connectivity</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
             {connection ? connection.effectiveType.toUpperCase() : '---'}
             <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 12, fontWeight: 800 }}>
                {connection ? `${connection.downlink} MBPS` : 'LINKING...'}
             </span>
          </div>
       </div>

       <div className="card-elevated" style={{ padding: '20px', transition: 'all var(--duration) var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
             <Activity size={14} style={{ color: fps < 30 ? 'var(--status-warn)' : 'var(--status-pass)', filter: fps >= 50 ? 'drop-shadow(0 0 4px var(--status-pass))' : 'none' }} />
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Visual Frequency</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
             {fps} <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>FPS</span>
             <span style={{ fontSize: 10, color: fps >= 50 ? 'var(--status-pass)' : 'var(--status-warn)', marginLeft: 12, fontWeight: 800 }}>
                {fps >= 50 ? 'OPTIMAL' : 'LAG DETECTED'}
             </span>
          </div>
       </div>
    </div>
  )
}
