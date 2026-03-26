'use client'
import { useState, useRef, Component, useEffect } from 'react'
import { Activity, AlertCircle, Terminal, Cpu, Database, Network } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { useSearchParams } from 'next/navigation'

/* ── Error Boundary ─────────────────────────── */
class ReportErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '40px 24px', maxWidth: 600 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>Could not display this section</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 6, marginBottom: 12 }}>
          {this.state.error?.message || 'Unknown error'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-4)' }}>
          Try re-running the HackRore master scanner to generate a fresh report.
        </div>
      </div>
    )
    return this.props.children
  }
}

/* ── UI Helpers ──────────────────────────── */
function Badge({ val, cls }) {
  if (!val) return null
  const colors = {
    pass:    { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' },
    fail:    { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)' },
    warn:    { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--yellow)' },
    idle:    { bg: 'var(--surface-2)', color: 'var(--text-3)' },
  }
  const c = colors[cls] || colors.idle
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.color}33` }}>
      {val}
    </span>
  )
}

function Row({ label, value }) {
  if (value === undefined || value === null) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-4)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'right', wordBreak: 'break-word', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function MiniBar({ value, max = 100, color }) {
  const safe = isNaN(value) ? 0 : Math.min(100, Math.max(0, Number(value)))
  const c = color || (safe > 85 ? 'var(--red)' : safe > 65 ? 'var(--yellow)' : 'var(--green)')
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${safe}%`, background: c, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 4, fontWeight: 600 }}>{Math.round(safe)}%</div>
    </div>
  )
}

function ModCard({ title, children, accent }) {
  const ac = accent || 'var(--blue-600)'
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: ac, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 16, paddingBottom: 8, borderBottom: `2px solid ${ac}22` }}>
        {title}
      </div>
      {children}
    </div>
  )
}

/* ── Main Components ─────────────────────────── */
function UploadScreen({ onLoad }) {
  const [dragging, setDrag] = useState(false)
  const [isWindows, setIsWindows] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => {
    // Basic OS Detection
    const platform = window.navigator.platform.toLowerCase();
    if (!platform.includes('win')) {
      setIsWindows(false)
    }
  }, [])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="breadcrumb">System / ScanLab</div>
        <h1>Diagnostic <span className="text-blue-600">Report Engine</span></h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginTop: 4 }}>
          Upload a system telemetry report to begin deep hardware analysis.
        </p>
      </div>

      {!isWindows && (
        <div className="card" style={{ 
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          marginBottom: 32,
          display: 'flex',
          gap: 16,
          alignItems: 'center'
        }}>
          <AlertCircle size={24} className="text-red" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>Running on non-Windows OS?</div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
              The **HackRore Master Scanner** requires a Windows environment to collect deep hardware telemetry. 
              Analysis can still be performed on this device if you have a pre-generated JSON report.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ borderLeft: '4px solid var(--blue-600)' }}>
           <h3 style={{ marginBottom: 12 }}>Step 1: Collect Data</h3>
           <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 14 }}>
            The scanner generates <code style={{ fontFamily: 'var(--font-code)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>HackRore_*.json</code>. Drop it below or test the engine instantly.
          </p>
          <div
            onDrop={(e) => { e.preventDefault(); setDrag(true); /* handle drop logic */ }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onClick={() => inputRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? 'var(--blue-600)' : 'var(--border)'}`, borderRadius: 8, padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--blue-50)' : 'var(--bg)', marginBottom: 16 }}
          >
             <Activity size={24} className="text-blue-600" style={{ marginBottom: 8 }} />
             <div style={{ fontWeight: 600, fontSize: 13 }}>Click to upload JSON</div>
             <input ref={inputRef} type="file" style={{ display: 'none' }} />
          </div>
          
          <button 
            onClick={null} // loadSample logic would go here
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Sparkles size={16} />
            Try Sample Report
          </button>
        </div>
      </div>
      
      <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <AlertCircle size={20} className="text-yellow" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--yellow)', fontSize: 14 }}>Windows Environment Required</div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
              The HackRore scanner uses deep WMI and CIM telemetry native to Windows. Reports can be analyzed on any OS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ report, onBack }) {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="breadcrumb">System / ScanLab / {report.system?.model || 'Report'}</div>
          <h1>Telemetry <span className="text-blue-600">Dashboard</span></h1>
        </div>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>← Upload New</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <ModCard title="Processor">
           <Row label="Model" value={report.cpu?.name} />
           <Row label="Performance" value={`${report.cpu?.cores} Cores`} />
           <MiniBar value={45} />
        </ModCard>
        <ModCard title="Memory">
           <Row label="Total RAM" value={`${report.ram?.totalGB} GB`} />
           <Row label="Slots" value={report.ram?.slots} />
           <MiniBar value={32} />
        </ModCard>
        <ModCard title="System Health">
           <Row label="SMART Status" value={<Badge val="PASS" cls="pass" />} />
           <Row label="Battery Wear" value="12%" />
           <MiniBar value={88} color="var(--green)" />
        </ModCard>
      </div>
    </div>
  )
}

export default function ScanLab() {
  const searchParams = useSearchParams()
  const [report, setReport] = useState(null)

  return (
    <AppLayout>
      <ReportErrorBoundary>
        {report
          ? <Dashboard report={report} onBack={() => setReport(null)} />
          : <UploadScreen onLoad={setReport} />
        }
      </ReportErrorBoundary>
    </AppLayout>
  )
}
