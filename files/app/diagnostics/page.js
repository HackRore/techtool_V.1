'use client'
import { useState, useEffect, useRef } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { 
  Activity, AlertCircle, Terminal, 
  Cpu, Database, Network, 
  Thermometer, Shield, Sparkles, 
  Download, ChevronRight, Copy 
} from 'lucide-react'

export default function ScanLab() {
  const [isWindows, setIsWindows] = useState(true)
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase()
    if (!platform.includes('win')) setIsWindows(false)
  }, [])

  const startDemo = () => {
    setLoading(true)
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
    }, 1500)
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: 48 }}>
           <div className="breadcrumb" style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>System / ScanLab</div>
           <h1 style={{ fontSize: 32, marginBottom: 8 }}>Diagnostic <span style={{ color: 'var(--accent)' }}>Master Engine</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Run deep hardware scans using the HackRore PowerShell diagnostic kernel.</p>
        </div>

        {!isWindows && !scanResult && (
          <div className="card-elevated" style={{ border: '1px solid var(--amber)', padding: 24, marginBottom: 48, display: 'flex', gap: 20, alignItems: 'center' }}>
             <AlertCircle size={28} style={{ color: 'var(--amber)' }} />
             <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--amber)' }}>Environment Mismatch Detected</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                   ScanLab requires a Windows environment to execute PowerShell telemetry. 
                   Browser tests in <strong>TestLab</strong> remain fully functional on this platform.
                </p>
                <Link href="/tools" style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Go to TestLab →</Link>
             </div>
          </div>
        )}

        {!scanResult ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 64 }}>
             {/* Path A: Upload */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24, borderStyle: 'dashed' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 32, height: 32, background: 'var(--bg-elevated)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Terminal size={16} className="text-secondary" />
                   </div>
                   <h3 style={{ fontSize: 16 }}>Upload Scan Result</h3>
                </div>
                <div style={{ flex: 1, border: '1px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--bg-primary)' }}>
                   <Activity size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                   <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Drop HackRore_*.json</div>
                </div>
                <button className="btn-accent" style={{ opacity: 0.5, cursor: 'not-allowed', justifyContent: 'center' }}>
                   Process Local File
                </button>
             </div>

             {/* Path B: Try Demo */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 32, height: 32, background: 'var(--accent-glow)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                   </div>
                   <h3 style={{ fontSize: 16 }}>Instant Web Demo</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
                   Preview the diagnostic engine's reporting capabilities without running any local scripts. 
                   See how AURA identifies hardware degradation.
                </p>
                <button onClick={startDemo} className="btn-accent" style={{ justifyContent: 'center' }}>
                   {loading ? 'Initializing Engine...' : 'Launch Demo Workspace'}
                </button>
             </div>
          </div>
        ) : (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
             {/* Score Row */}
             <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginBottom: 16 }}>
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                   <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" strokeWidth="6" 
                        strokeDasharray="339" strokeDashoffset={339 - (339 * scanResult.score / 100)} 
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                   </svg>
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{scanResult.score}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)' }}>{scanResult.status}</div>
                   </div>
                </div>
                <div>
                   <h2 style={{ fontSize: 24, marginBottom: 4 }}>Audit Complete</h2>
                   <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Hardware integrity score is based on 21 monitored modules.</p>
                   <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                      <button className="btn-accent" style={{ padding: '8px 16px', fontSize: 12 }}>
                         <Download size={14} /> Generate Customer PDF
                      </button>
                      <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
                         Share Assessment
                      </button>
                   </div>
                </div>
             </div>

             {/* Modules Grid */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {scanResult.modules.map(m => (
                  <div key={m.id} className="card-elevated" style={{ padding: 20 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, background: 'var(--bg-primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <m.icon size={16} style={{ color: m.state === 'optimal' ? 'var(--accent)' : 'var(--amber)' }} />
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: m.state === 'optimal' ? 'var(--accent)' : 'var(--amber)', textTransform: 'uppercase' }}>{m.state}</div>
                     </div>
                     <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{m.name}</div>
                     <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{m.val}</div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
           <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 24 }}>PowerShell Instructions</h3>
           <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
                 </div>
                 <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Copy size={14} /></button>
              </div>
              <pre style={{ padding: 20, fontSize: 12, fontFamily: 'var(--font-code)', color: 'var(--accent)', overflowX: 'auto' }}>
                 {`# Run as Administrator to collect deep telemetry\n./HackRore.ps1 -Export system_report.json`}
              </pre>
           </div>
        </div>
      </div>
    </AppLayout>
  )
}
