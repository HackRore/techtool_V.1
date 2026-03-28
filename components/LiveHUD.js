'use client'
import { useTelemetry } from '../hooks/useTelemetry'
import { Zap, Wifi, Activity } from 'lucide-react'

export default function LiveHUD() {
  const { battery, connection, fps } = useTelemetry()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
       <div className="card-elevated" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
             <Zap size={14} style={{ color: battery?.charging ? 'var(--status-pass)' : 'var(--accent)' }} />
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Battery Status</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
             {battery ? `${battery.level}%` : '---'}
             <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{battery?.charging ? '(CHARGING)' : '(DISCHARGING)'}</span>
          </div>
       </div>

       <div className="card-elevated" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
             <Wifi size={14} style={{ color: 'var(--accent)' }} />
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Connectivity</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
             {connection ? connection.effectiveType.toUpperCase() : '---'}
             <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{connection ? `${connection.downlink} Mbps` : 'LINKING...'}</span>
          </div>
       </div>

       <div className="card-elevated" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
             <Activity size={14} style={{ color: fps < 30 ? 'var(--status-warn)' : 'var(--accent)' }} />
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Visual Frequency</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
             {fps} <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>FPS</span>
             <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{fps >= 50 ? '(OPTIMAL)' : '(LAG DETECTED)'}</span>
          </div>
       </div>
    </div>
  )
}
