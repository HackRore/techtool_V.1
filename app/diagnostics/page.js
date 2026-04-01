'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Cpu, Database, Globe, AlertTriangle, CheckCircle2, ChevronRight, HardDrive, Zap } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

export default function ScanLabPage() {
  const router = useRouter()
  const [telemetry, setTelemetry] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    disk: 0,
    status: 'OPTIMIZING'
  })
  const [scanData, setScanData] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  // Live Telemetry Simulation (Industrial Web Audit)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        cpu: Math.floor(Math.random() * 15) + 5,
        memory: Math.floor(Math.random() * 20) + 40,
        network: Math.floor(Math.random() * 50) + 10,
        disk: Math.floor(Math.random() * 5) + 2,
        status: 'MONITORING_ACTIVE'
      }))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.json')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        setScanData(JSON.parse(e.target.result))
      } catch (err) {
        console.error("Parse Error", err)
      }
    }
    reader.readAsText(file)
  }

  const loadDemo = () => {
    setScanData({
      overall: 88,
      grade: 'PASS',
      cpu: { status: 'healthy', detail: 'Intel i7-12700K (12 Cores) — Optimal stable clocking' },
      ram: { status: 'healthy', detail: '32GB DDR5-5200 — 0 detected parity errors' },
      storage: { status: 'healthy', detail: 'NVMe Gen4 SSD — 98% life remaining' },
      battery: { status: 'warning', detail: '84% capacity — Minor cycle degradation' },
      thermals: { status: 'healthy', detail: 'CPU Idle 32°C / Load 68°C' }
    })
  }

  return (
    <AppLayout>
      <div className="page-header animate-in">
        <div className="breadcrumb">Environment / ScanLab</div>
        <h1 style={{ letterSpacing: -1.5, marginTop: 12 }}>ScanLab Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Real-time hardware telemetry and deep-layer report auditing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className="animate-in">
        
        {/* Telemetry Hub (Real-time Value) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="grid-cols-2" style={{ display: 'grid', gap: 20 }}>
            <TelemetryCard icon={<Cpu size={18}/>} label="CPU LOAD" value={`${telemetry.cpu}%`} status="STABLE" />
            <TelemetryCard icon={<Database size={18}/>} label="MEM PRESSURE" value={`${telemetry.memory}%`} status="NOMINAL" />
            <TelemetryCard icon={<Globe size={18}/>} label="NET JITTER" value={`${telemetry.network}ms`} status="LOW" />
            <TelemetryCard icon={<Zap size={18}/>} label="POWER DRAW" value="34.2W" status="INTERNAL" />
          </div>

          {!scanData ? (
            <div 
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
              className="card-elevated"
              style={{ 
                height: 320, border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 20, cursor: 'pointer', background: dragging ? 'var(--accent-glow)' : 'var(--bg-secondary)'
              }}
            >
              <HardDrive size={48} style={{ color: 'var(--accent)', opacity: 0.4 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>Deep Analysis Protocol</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drop HackRore Scan JSON or click to upload</p>
              </div>
              <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".json" onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
             <div className="card-elevated animate-in" style={{ padding: 32, borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                   <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 2, marginBottom: 8 }}>AUDIT_COMPLETE</div>
                      <h2 style={{ fontSize: 24, fontWeight: 900 }}>System Grade: {scanData.grade}</h2>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>{scanData.overall}</div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)' }}>HEALTH_SCORE</div>
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                   {Object.entries(scanData).filter(([k]) => k !== 'overall' && k !== 'grade').map(([key, val]) => (
                     <div key={key} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: val.status === 'healthy' ? 'var(--accent)' : 'var(--amber)', textTransform: 'uppercase', marginBottom: 4 }}>{key}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{val.detail}</div>
                     </div>
                   ))}
                </div>
                <button className="btn-primary" style={{ marginTop: 24, width: '100%' }} onClick={() => setScanData(null)}>CLEAR AUDIT</button>
             </div>
          )}
        </div>

        {/* Action Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card-elevated shadow-glow" style={{ padding: 24, background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>QUICK ACTIONS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <button onClick={loadDemo} className="btn-outline" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span>Load Demo Data</span>
                  <ChevronRight size={14}/>
               </button>
               <button onClick={() => router.push('/tools')} className="btn-accent" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <span>Launch TestLab</span>
                  <ChevronRight size={14}/>
               </button>
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255, 172, 51, 0.05)', border: '1px solid rgba(255, 172, 51, 0.1)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <AlertTriangle size={18} style={{ color: 'var(--amber)' }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Windows Script Mode</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Run our PowerShell scanner to generate full hardware telemetry files for deep machine audits.</p>
          </div>
        </aside>

      </div>
    </AppLayout>
  )
}

function TelemetryCard({ icon, label, value, status }) {
  return (
    <div className="card-elevated" style={{ padding: '20px 24px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: 'var(--accent)' }}>{icon}</div>
        <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--status-pass)', padding: '2px 8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 20 }}>{status}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      <div className="text-mono" style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
    </div>
  )
}
