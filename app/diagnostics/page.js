'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../../components/layout/AppLayout'
import { 
  Cpu, FileJson, PlayCircle, Clipboard, AlertCircle, 
  CheckCircle2, Download, Upload, ArrowRight, Activity, Zap, ShieldCheck
} from 'lucide-react'

export default function SystemReportsPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [isWindows, setIsWindows] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [scanData, setScanData] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    const platform = navigator.userAgentData?.platform || navigator.platform || ''
    setIsWindows(platform.toLowerCase().includes('win'))
    setReady(true)
  }, [])

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.json')) {
       setFileError('INVALID_FORMAT: Must be a Hachtool JSON report.')
       return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        setScanData(parsed)
        setFileError(null)
      } catch {
        setFileError('PARSE_ERROR: Invalid JSON data.')
      }
    }
    reader.readAsText(file)
  }

  const loadDemo = () => {
    setScanData({
      overall: 82, grade: 'SYSTEM_OPTIMAL',
      cpu: { status: 'healthy', detail: 'Intel Core i5-10210U @ 1.60GHz, 4 cores' },
      ram: { status: 'healthy', detail: '8 GB DDR4-2666' },
      storage: { status: 'action_required', detail: 'WD Blue 500GB — 1 reallocated sector' },
      battery: { status: 'action_required', detail: '61% wear level, 412 cycles' },
      thermals: { status: 'healthy', detail: 'CPU max 78°C under load' },
      network: { status: 'healthy', detail: 'Gigabit Ethernet + Wi-Fi 6' },
      bios: { status: 'healthy', detail: 'Version 1.14.0 (A05)' },
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText('.\\Hachtool_Master.ps1')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!ready) return null

  return (
    <AppLayout>
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        
        {/* Phase Header: v7.0 Guided Workflow */}
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 50, letterSpacing: 1 }}>STEP_02 // SYSTEM_SCANS</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>MODULE: SYSTEM_REPORTS</div>
           </div>
           <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12 }}>System Reports & Analytics</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 640 }}>
             Analyze deep hardware telemetry from external PowerShell scans. Generate professional health dashboards and refurbishment reports.
           </p>
        </div>

        {!scanData ? (
          /* Guided Action Grid: thetest.com style */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 64 }}>
             
             {/* Step 1: PowerShell Command */}
             <div className="card" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 24 }}>
                   <Activity size={24} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8 }}>METHOD_01</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Run Live Scanner</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                   Execute the Hachtool utility on any Windows machine to generate a technical report.
                </p>
                <div style={{ background: '#09090B', padding: '12px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', marginBottom: 16 }}>
                   <code style={{ fontSize: 11, color: '#7ee787', fontFamily: 'var(--font-mono)' }}>.\Hachtool_Master.ps1</code>
                   <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {copied ? <CheckCircle2 size={14} color="var(--accent)" /> : <Clipboard size={14} />}
                   </button>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                   <AlertCircle size={10} /> Requires PowerShell Admin
                </div>
             </div>

             {/* Step 2: Upload Zone */}
             <div 
                className="card"
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', border: dragging ? '2px dashed var(--accent)' : '1px solid var(--border)', background: dragging ? 'var(--accent-soft)' : 'var(--bg-secondary)', cursor: 'pointer', transition: '0.2s' }}
                onClick={() => fileRef.current?.click()}
             >
                <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 24 }}>
                   <Upload size={24} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8 }}>METHOD_02</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Upload System Report</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                   Drop the generated JSON file here to visualize system health and driver status.
                </p>
                <button className="btn-outline">Browse Report</button>
                {fileError && <div style={{ color: 'var(--status-fail)', fontSize: 10, fontWeight: 800, marginTop: 12 }}>{fileError}</div>}
                <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
             </div>

             {/* Step 3: Technical Demo */}
             <div className="card" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent)' }}>
                <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 24 }}>
                   <PlayCircle size={24} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', marginBottom: 8 }}>METHOD_03</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Technical Demo</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                   Preview the full analytics dashboard with a pre-validated system report sample.
                </p>
                <button className="btn-primary" onClick={loadDemo}>Load Demo Analytics</button>
             </div>

          </div>
        ) : (
          /* Results Dashboard: Modern high-white-space view */
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
             
             {/* Score Ring Section */}
             <div className="card" style={{ padding: '48px', display: 'flex', alignItems: 'center', gap: 48 }}>
                <div style={{ position: 'relative', width: 160, height: 160 }}>
                   <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="12" />
                      <circle cx="80" cy="80" r="70" fill="none" stroke="var(--accent)" strokeWidth="12" 
                        strokeDasharray={`${(scanData.overall / 100) * 440} 440`}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                        style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      />
                   </svg>
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{scanData.overall}</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>SCORE_UNIT</span>
                   </div>
                </div>
                
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>DIAGNOSTIC_SUMMARY</div>
                   <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>{scanData.grade}</h2>
                   <p style={{ color: 'var(--text-secondary)', maxWidth: 400, fontSize: 14 }}>
                      System analysis complete. {scanData.overall > 80 ? 'All critical hardware layers are operating within optimal parameters.' : 'Action required on secondary hardware layers.'}
                   </p>
                   <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      <button className="btn-primary">Generate Final Report</button>
                      <button className="btn-outline" onClick={() => setScanData(null)}>Analyze New Report</button>
                   </div>
                </div>
             </div>

             {/* Module Summary Cards */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {Object.entries(scanData).filter(([k]) => !['overall', 'grade'].includes(k)).map(([key, val]) => (
                   <div key={key} className="card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                      <div style={{ width: 44, height: 44, background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: val.status === 'healthy' ? 'var(--status-pass)' : (val.status === 'action_required' ? 'var(--status-warn)' : 'var(--status-fail)') }}>
                         {key === 'cpu' ? <Cpu size={20} /> : (key === 'battery' ? <Zap size={20} /> : (key === 'network' ? <Activity size={20} /> : <ShieldCheck size={20} />))}
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>{key}</h4>
                            <div style={{ fontSize: 10, fontWeight: 900, color: val.status === 'healthy' ? 'var(--status-pass)' : 'var(--status-warn)', letterSpacing: 1 }}>
                               {val.status.toUpperCase()}
                            </div>
                         </div>
                         <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{val.detail}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
