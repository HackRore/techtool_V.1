'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/AppLayout'
import { 
  Activity, AlertCircle, Terminal, 
  Cpu, Database, Network, 
  Thermometer, Shield, Sparkles, 
  Download, Copy, ChevronRight,
  Info, Zap, Monitor
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

  useEffect(() => {
    const importData = searchParams.get('import')
    if (importData) {
      setLoading(true)
      try {
        const decoded = atob(importData)
        const parsed = JSON.parse(decoded)
        setTimeout(() => {
          setScanResult(parsed)
          setLoading(false)
          addToast('Telemetry Synchronized Successfully', 'success')
        }, 1200)
      } catch (err) {
        setLoading(false)
        addToast('Invalid Telemetry Payload', 'error')
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
        timestamp: new Date().toISOString(),
        kernel: 'v.2.0.1-stable',
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
    setLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      setTimeout(() => {
        setScanResult(data)
        setLoading(false)
        addToast('Telemetry Synchronized Successfully', 'success')
      }, 800)
    } catch (err) {
      setLoading(false)
      addToast('Failed to parse telemetry data', 'error')
    }
  }

  return (
    <AppLayout>
      <div className="animate-in">
        
        {/* Perfection Header */}
        <section style={{ marginBottom: 64, borderBottom: '1px solid var(--border)', paddingBottom: 40 }}>
           <div className="badge badge-ready" style={{ marginBottom: 24, fontSize: 10 }}>SYSTEM_INTELLIGENCE // SCANLAB_HUB</div>
           <h1 style={{ marginBottom: 16 }}>Diagnostic <span className="glow-text" style={{ color: 'var(--accent)' }}>Master Engine</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 650, lineHeight: 1.6 }}>Execute deep hardware scans, validate bus integrity, and synchronize kernel telemetry using the HackRore Precision Diagnostic System.</p>
        </section>

        {!isWindows && !scanResult && (
          <div className="card-elevated" style={{ borderColor: 'var(--status-warn)', marginBottom: 56, display: 'flex', gap: 24, alignItems: 'center', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--status-warn)' }}>
             <AlertCircle size={32} style={{ color: 'var(--status-warn)', flexShrink: 0 }} />
             <div>
                <div style={{ fontWeight: 900, fontSize: 12, color: 'var(--status-warn)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Environment Compatibility Alert</div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                   ScanLab requires a Windows kernel to execute PowerShell telemetry. Web-based diagnostics (TestLab) remain fully operational.
                </p>
                <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                   <Link href="/tools" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1.5 }}>Launch TestLab →</Link>
                   <button onClick={startDemo} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1.5, cursor: 'pointer' }}>Run Simulation Anyway</button>
                </div>
             </div>
          </div>
        )}

        {!scanResult ? (
          /* Transitioning to responsive fluid grid */
          <div className="dashboard-layout" style={{ marginBottom: 80 }}>
             
             {/* Interaction A: Precision Upload */}
             <div 
               className="card glow-border" 
               onDragOver={e => { e.preventDefault(); setDragging(true) }}
               onDragLeave={() => setDragging(false)}
               onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
               style={{ 
                 display: 'flex', flexDirection: 'column', gap: 32, borderStyle: 'dashed', 
                 background: dragging ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                 padding: 40
               }}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ width: 44, height: 44, background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Terminal size={20} style={{ color: 'var(--accent)' }} />
                   </div>
                   <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 'normal' }}>Import Telemetry</h3>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>Standard system_report.json</div>
                   </div>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    flex: 1, border: '2px dashed var(--border)', borderRadius: 16, 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'center', padding: '64px 24px', background: 'var(--bg-primary)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  className="hover:border-accent"
                >
                   <Activity size={48} style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)', opacity: dragging ? 1 : 0.2, marginBottom: 20 }} />
                   <div className="text-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
                     {dragging ? 'VALIDATE_PAYLOAD' : 'DRAG_TELEMETRY_DROP'}
                   </div>
                   <input type="file" ref={fileInputRef} onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} accept=".json" />
                </div>

                <button onClick={() => fileInputRef.current?.click()} className="btn-accent" style={{ width: '100%', height: 56 }}>
                   {loading ? 'SYNCHRONIZING...' : 'SELECT MASTER REPORT'}
                </button>
             </div>

             {/* Interaction B: Virtual Sandbox */}
             <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                   <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)' }}>
                      <Sparkles size={20} />
                   </div>
                   <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 'normal' }}>Simulation Engine</h3>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>VIRTUAL_HARDWARE_AUDIT</div>
                   </div>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.8 }}>
                   Test the analytical stack without executing local scripts. Our neural engine maps 120+ hardware signals to identify hidden bottleneck/degradation patterns in a safe, sandboxed environment.
                </p>
                <button onClick={startDemo} className="btn-accent" style={{ width: '100%', height: 56, background: 'transparent', border: '2px solid var(--accent)', color: 'var(--accent)' }}>
                   {loading ? 'MAPPING_SIGNALS...' : 'INITIALIZE SIMULATION'}
                </button>
             </div>
          </div>
        ) : (
          /* Results Perfection View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
             
             {/* Elite Result Summary */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 220, height: 220, justifySelf: 'center' }}>
                   <svg width="220" height="220" viewBox="0 0 150 150">
                      <circle cx="75" cy="75" r="72" fill="none" stroke="var(--border)" strokeWidth="2" />
                      <circle cx="75" cy="75" r="72" fill="none" stroke="var(--accent)" strokeWidth="6" 
                        strokeDasharray="452" strokeDashoffset={452 - (452 * scanResult.score / 100)} 
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s var(--ease)', filter: 'drop-shadow(0 0 10px var(--accent))' }} />
                   </svg>
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="text-mono" style={{ fontSize: 64, fontWeight: 900, letterSpacing: -3 }}>{scanResult.score}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 3 }}>{scanResult.status}</div>
                   </div>
                </div>
                <div>
                   <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, marginBottom: 12 }}>Audit <span style={{ color: 'var(--accent)' }}>Complete</span></h2>
                   <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, maxWidth: 550, marginBottom: 32 }}>Your hardware integrity profile has been established across 6 core subsystems. Telemetry indicates a healthy operational baseline.</p>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      <button className="btn-accent" style={{ height: 48, padding: '0 24px' }}>
                         <Download size={16} /> DOWNLOAD_PDF
                      </button>
                      <button className="nav-link" style={{ height: 48, border: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8 }}>
                         RE-SCAN_SYSTEM
                      </button>
                   </div>
                </div>
             </div>

             {/* Perfection Module Grid (Auto-responsive) */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {scanResult.modules.map(m => (
                   <div key={m.id} className="card-elevated" style={{ padding: 32, borderBottom: `2px solid ${m.state === 'optimal' ? 'var(--status-pass)' : 'var(--status-warn)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                         <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            <m.icon size={20} style={{ color: m.state === 'optimal' ? 'var(--status-pass)' : 'var(--status-warn)' }} />
                         </div>
                         <span className={`badge badge-${m.state === 'optimal' ? 'pass' : 'warn'}`}>{m.state}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{m.name}</div>
                      <div className="text-mono" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{m.val}</div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Professional Instructions V.2 */}
        <section style={{ marginTop: 96, paddingTop: 48, borderTop: '1px solid var(--border)' }}>
           <h3 style={{ marginBottom: 32 }}>Telemetry Extraction Instructions</h3>
           <div className="grid-cols-2" style={{ display: 'grid', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
                    To synchronize your actual hardware data, execute our collector script in an elevated PowerShell session. This collects bus-latency, thermal deltas, and kernel events into a secure JSON manifest.
                 </p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                       <div style={{ width: 24, height: 24, borderRadius: 50, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>1</div>
                       <div style={{ fontSize: 14 }}>Download the <span style={{ color: 'var(--accent)', fontWeight: 800 }}>HackRore_Master.ps1</span> toolkit.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                       <div style={{ width: 24, height: 24, borderRadius: 50, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>2</div>
                       <div style={{ fontSize: 14 }}>Execute script as Administrator with <code className="text-mono" style={{ color: 'var(--accent)' }}>-Export report.json</code></div>
                    </div>
                 </div>
              </div>

              <div className="card glass-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                 <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-fail)' }} />
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-warn)' }} />
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-pass)' }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>powershell_session</div>
                 </div>
                 <pre style={{ padding: 32, fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--accent)', overflowX: 'auto', lineHeight: 1.8 }}>
                    {`# Run deep telemetry audit\n./HackRore.ps1 -Export system_report.json\n\n# Synchronization status:\n# -> MAPPING HARDWARE BUS [100%]\n# -> KERNEL AUDIT SUCCESS`}
                 </pre>
              </div>
           </div>
        </section>

      </div>
    </AppLayout>
  )
}
