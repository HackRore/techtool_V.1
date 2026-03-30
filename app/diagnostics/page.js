'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/AppLayout'
import { 
  Activity, AlertCircle, Terminal, 
  Cpu, Database, Network, 
  Thermometer, Shield, Sparkles, 
  Download, Copy 
} from 'lucide-react'

import { useSearchParams } from 'next/navigation'
import { useToast } from '../../components/ui/ToastProvider'

export default function ScanLab() {
  const searchParams = useSearchParams()
  const [isWindows, setIsWindows] = useState(true)
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { addToast } = useToast()
  const fileInputRef = useRef(null)

  // Handle Base64 Import (Two-Way Bridge)
  useEffect(() => {
    const importData = searchParams.get('import')
    if (importData) {
      setLoading(true)
      try {
        const decoded = atob(importData)
        const parsed = JSON.parse(decoded)
        
        // Simulation delay for premium feel
        setTimeout(() => {
          setScanResult(parsed)
          setLoading(false)
          addToast('Telemetry Synchronized Successfully', 'success')
        }, 1500)
      } catch (err) {
        console.error('Import failed:', err)
        setLoading(false)
        addToast('Failed to decode telemetry payload', 'error')
      }
    }
  }, [searchParams, addToast])

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase()
    if (!platform.includes('win')) setIsWindows(false)
  }, [])

  const startDemo = () => {
    setLoading(true)
    addToast('Initializing Virtual Simulation...', 'info')
    setTimeout(() => {
      setScanResult({
        score: 84,
        status: 'PASS',
        modules: [
          { id: 'cpu', name: 'Processor', val: 'Intel i7-12700K', state: 'optimal', icon: Cpu },
          { id: 'ram', name: 'Memory', val: '32GB DDR4 3200MHz', state: 'optimal', icon: Database },
          { id: 'storage', name: 'Disk Integrity', val: '98% Health (SMART)', state: 'optimal', icon: Shield },
          { id: 'thermal', name: 'Thermals', val: '42°C Baseline', state: 'optimal', icon: Thermometer },
          { id: 'network', name: 'Adapters', val: 'Intel Wi-Fi 6E', state: 'warning', icon: Network },
          { id: 'events', name: 'OS Events', val: '3 Kernel Errors', state: 'warning', icon: Activity },
        ]
      })
      setLoading(false)
      addToast('Simulation Audit Complete', 'success')
    }, 1500)
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.json')) {
      addToast('Invalid file format. Please upload a .json report.', 'error')
      return
    }

    setLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validation (Quick Check)
      if (!data.score && !data.modules) {
        throw new Error('Invalid telemetry schema')
      }

      setTimeout(() => {
        setScanResult(data)
        setLoading(false)
        addToast('Telemetry Synchronized Successfully', 'success')
      }, 1000)
    } catch (err) {
      setLoading(false)
      addToast('Failed to parse telemetry data', 'error')
    }
  }

  return (
    <AppLayout>
      <div className="animate-in">
        <div className="page-header">
           <div className="breadcrumb">System Intelligence / ScanLab Hub</div>
           <h1>Diagnostic <span style={{ color: 'var(--accent)' }}>Master Engine</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 8 }}>Run deep hardware scans using the HackRore precision diagnostic kernel.</p>
        </div>

        {!isWindows && !scanResult && (
          <div className="card-elevated" style={{ borderColor: 'var(--status-warn)', marginBottom: 48, display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(255,184,0,0.02)' }}>
             <AlertCircle size={32} style={{ color: 'var(--status-warn)', flexShrink: 0 }} />
             <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--status-warn)', textTransform: 'uppercase', letterSpacing: 1 }}>Environment Warning</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
                   ScanLab requires a Windows environment to execute PowerShell telemetry. 
                   Web-based diagnostics in <strong style={{ color: 'var(--text-primary)' }}>TestLab</strong> remain fully functional.
                </p>
                <Link href="/tools" style={{ display: 'inline-block', marginTop: 12, fontSize: 11, color: 'var(--accent)', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1.5 }}>Switch to TestLab →</Link>
             </div>
          </div>
        )}

        {!scanResult ? (
          <div className="dashboard-layout" style={{ marginBottom: 80 }}>
             {/* Path A: Upload */}
             <div 
               className="card" 
               onDragOver={e => { e.preventDefault(); setDragging(true) }}
               onDragLeave={() => setDragging(false)}
               onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
               style={{ 
                 display: 'flex', flexDirection: 'column', gap: 24, borderStyle: 'dashed', 
                 background: dragging ? 'var(--accent-glow)' : 'transparent',
                 borderColor: dragging ? 'var(--accent)' : 'var(--border)'
               }}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 32, height: 32, background: 'var(--bg-secondary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Terminal size={16} style={{ color: 'var(--text-secondary)' }} />
                   </div>
                   <h3 style={{ fontSize: 16, fontWeight: 800 }}>Upload Telemetry</h3>
                </div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    flex: 1, border: '1px dashed var(--border)', borderRadius: 12, 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'center', padding: 48, background: 'var(--bg-secondary)',
                    cursor: 'pointer'
                  }}
                >
                   <Activity size={32} style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)', opacity: dragging ? 0.8 : 0.3, marginBottom: 16, transition: 'all 0.2s' }} />
                   <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                     {dragging ? 'Release to Scan' : 'Drop system_report.json'}
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={e => handleFile(e.target.files[0])} 
                     style={{ display: 'none' }} 
                     accept=".json"
                   />
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-accent" 
                  style={{ width: '100%', padding: '14px' }}
                >
                   {loading ? 'Processing...' : 'Select Local Report'}
                </button>
             </div>

             {/* Path B: Try Demo */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24, borderColor: 'var(--accent)', background: 'var(--accent-glow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)' }}>
                      <Sparkles size={16} />
                   </div>
                   <h3 style={{ fontSize: 16, fontWeight: 800 }}>Virtual Simulation</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.6 }}>
                   Preview the diagnostic engine&apos;s analytical capabilities without executing external scripts. 
                   Identify hardware degradation in a sandboxed environment.
                </p>
                <button onClick={startDemo} className="btn-accent" style={{ width: '100%', padding: '14px' }}>
                   {loading ? 'Initializing Engine...' : 'Run Simulation Scan'}
                </button>
             </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
             {/* Score Row */}
             <div style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
                <div style={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
                   <svg width="150" height="150" viewBox="0 0 150 150">
                      <circle cx="75" cy="75" r="70" fill="none" stroke="var(--border)" strokeWidth="4" />
                      <circle cx="75" cy="75" r="70" fill="none" stroke="var(--accent)" strokeWidth="6" 
                        strokeDasharray="440" strokeDashoffset={440 - (440 * scanResult.score / 100)} 
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                   </svg>
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: -2 }}>{scanResult.score}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2 }}>{scanResult.status}</div>
                   </div>
                </div>
                <div>
                   <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Audit Finalized</h2>
                   <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, maxWidth: 500 }}>Comprehensive hardware integrity score based on 22 telemetry endpoints across kernel and bus layers.</p>
                   <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                      <button className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <Download size={14} /> Export Report PDF
                      </button>
                      <button className="btn-secondary">
                         Share Assessment
                      </button>
                   </div>
                </div>
             </div>

             {/* Modules Grid */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {scanResult.modules.map(m => (
                   <div key={m.id} className="card-elevated" style={{ padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                         <div style={{ width: 36, height: 36, background: 'var(--bg-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            <m.icon size={18} style={{ color: m.state === 'optimal' ? 'var(--accent)' : 'var(--status-warn)' }} />
                         </div>
                         <span className={`badge badge-${m.state === 'optimal' ? 'pass' : 'warn'}`}>{m.state}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{m.name}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{m.val}</div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: 80, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
           <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 24, fontWeight: 800 }}>PowerShell Instructions</h3>
           <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-fail)', opacity: 0.5 }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-warn)', opacity: 0.5 }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-pass)', opacity: 0.5 }} />
                 </div>
                 <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Copy size={14} /></button>
              </div>
              <pre style={{ padding: 24, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent)', overflowX: 'auto', lineHeight: 1.6 }}>
                 {`# Run as Administrator to collect deep telemetry\n./HackRore.ps1 -Export system_report.json`}
              </pre>
           </div>
        </div>
      </div>
    </AppLayout>
  )
}
