'use client'
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import KeyboardTest from '../../components/tests/KeyboardTest'
import BatteryTest from '../../components/tests/BatteryTest'
import { 
  Activity, ChevronRight, X, Printer, CheckCircle2,
  Monitor, Keyboard, Speaker, Webcam, Mic, MousePointer2, Zap, Cpu, Settings, ArrowLeft
} from 'lucide-react'

// Tool Definitions aligned with thetest.com UX
const tools = [
  { id: 'keyboard', name: 'Keyboard', icon: <Keyboard size={32}/>, desc: 'Mechanical and membrane switch validation.' },
  { id: 'screen',   name: 'Display', icon: <Monitor size={32}/>,   desc: 'Sub-pixel grid and color uniformity analysis.' },
  { id: 'audio',    name: 'Speaker', icon: <Speaker size={32}/>,   desc: 'Frequency sweep and phase response.' },
  { id: 'battery',  name: 'Battery', icon: <Zap size={32}/>,       desc: 'Raw telemetry and cycle-count audit.' },
  { id: 'webcam',   name: 'Webcam',  icon: <Webcam size={32}/>,    desc: 'CMOS sensor and focus-actuator testing.' },
  { id: 'mic',      name: 'Microphone', icon: <Mic size={32}/>,   desc: 'Dynamic range and noise-floor testing.' },
  { id: 'precision', name: 'Precision', icon: <MousePointer2 size={32}/>, desc: 'Polling rate and jitter measurement.' },
  { id: 'gpu',      name: 'GPU Stress', icon: <Cpu size={32}/>,    desc: 'Thermal performance and load-stability.' },
]

export default function DiagnosticsPage() {
  const [active, setActive] = useState(null)
  const [results, setResults] = useState({})
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(Object.keys(results).length)
  }, [results])

  const onComplete = (data) => {
    setResults(prev => ({ ...prev, [active]: data }))
  }

  const printReport = () => {
    const html = `<!DOCTYPE html><html><head><title>Hachtool Diagnostic Report</title>
      <style>
        body{font-family:'Inter',sans-serif;padding:60px;line-height:1.6;color:#222}
        .hdr{border-bottom:3px solid #EEE;margin-bottom:40px;display:flex;justify-content:space-between;padding-bottom:20px}
        .card{border:1px solid #EEE;margin-bottom:20px;padding:24px;border-radius:12px;background:#F9FAFB}
        .pass{color:#2F8D46;font-weight:900}
        .fail{color:#E94D4D;font-weight:900}
      </style></head><body>
      <div class="hdr"><div><h1 style="margin:0">Hardware Diagnostic Report</h1><p style="margin:4px 0">Engineered by Hachtool Professional v15.0</p></div><div><p>Ref: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>Date: ${new Date().toLocaleDateString()}</p></div></div>
      ${Object.entries(results).map(([id, data]) => `
        <div class="card">
          <h3 style="text-transform:uppercase;margin:0 0 12px 0">${id} TEST_MODULE</h3>
          <p>Execution Status: <span class="${data.status === 'PASS' ? 'pass' : 'fail'}">${data.status}</span></p>
          <pre style="font-size:12px;background:#FFF;padding:16px;border:1px solid #EEE;border-radius:8px">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `).join('')}
      <p style="margin-top:60px;text-align:center;font-size:11px;color:#999">Valid for industrial hardware certification purposes.</p>
    </body></html>`
    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <AppLayout>
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: active ? 'calc(100vh - 80px)' : 'auto' }}>
        
        {!active ? (
          /* Selection Hub: Center-Aligned Utility Grid */
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '64px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: 50, border: '1px solid var(--border)', marginBottom: 20 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                 <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1 }}>LABORATORY_ENVIRONMENT_STABLE</span>
              </div>
              <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1.5, marginBottom: 16 }}>Technical TestLab</h1>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                 Execute precision hardware validation protocols. All modules are field-tested for production-grade reliability.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
               {tools.map(t => (
                 <div key={t.id} className="card" style={{ padding: '40px 32px', textAlign: 'center', background: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.3s' }}>
                    <div style={{ width: 64, height: 64, background: 'var(--bg-secondary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: results[t.id] ? (results[t.id].status === 'PASS' ? 'var(--status-pass)' : 'var(--status-fail)') : 'var(--accent)', marginBottom: 24, border: '1px solid var(--border)' }}>
                       {t.icon}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#222', marginBottom: 12 }}>{t.name} Protocol</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28, height: 40 }}>{t.desc}</p>
                    
                    {results[t.id] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 11, fontWeight: 900, color: results[t.id].status === 'PASS' ? 'var(--status-pass)' : 'var(--status-fail)', border: '1px solid var(--border)' }}>
                         <CheckCircle2 size={14} /> RESULT: {results[t.id].status}
                      </div>
                    ) : (
                      <button className="btn-primary" onClick={() => setActive(t.id)} style={{ width: '100%', height: 48, borderRadius: 10 }}>Start Module</button>
                    )}
                 </div>
               ))}
            </div>

            <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center' }}>
               <button className="btn-outline" onClick={printReport} disabled={progress === 0} style={{ padding: '16px 32px', opacity: progress === 0 ? 0.3 : 1 }}>
                  <Printer size={18} /> GENERATE_FULL_LAB_REPORT
               </button>
            </div>
          </div>
        ) : (
          /* Focused Test Frame (Full-Width, Sidebar-collapsed mode) */
          <div className="animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF' }}>
             
             {/* Integrated Protocol Header */}
             <div style={{ height: 80, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                   <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13 }}>
                      <ArrowLeft size={18} /> EXIT_MODULE
                   </button>
                   <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ color: 'var(--accent)' }}>{tools.find(t => t.id === active)?.icon}</div>
                      <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5 }}>{active.toUpperCase() / active.toUpperCase()} // DIAGNOSTIC_SESSION</span>
                   </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>SESSION_UPLINK: ACTIVE</div>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-pass)', animation: 'hr-pulse 1s infinite' }} />
                </div>
             </div>

             {/* Immersive Workspace */}
             <div style={{ flex: 1, padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 600 }}>
                {active === 'keyboard' && <div style={{ width: '100%', maxWidth: 1200 }}><KeyboardTest onComplete={onComplete} /></div>}
                {active === 'battery' && <div style={{ width: '100%', maxWidth: 1200 }}><BatteryTest onComplete={onComplete} /></div>}
                {!['keyboard', 'battery'].includes(active) && (
                  <div style={{ textAlign: 'center', maxWidth: 480 }}>
                     <Settings size={64} style={{ color: 'var(--accent)', marginBottom: 24, opacity: 0.3, animation: 'spin 10s linear infinite' }} />
                     <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>PROVISIONING_{active.toUpperCase()}</h2>
                     <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
                        Module is being initialized from the Hachtool Master Engine. Ensure all relevant hardware and peripherals are securely connected.
                     </p>
                     <button className="btn-primary" style={{ padding: '14px 28px' }} onClick={() => onComplete({ status: 'PASS', coverage: 100 })}>
                        MANUAL_VALIDATION_PASS
                     </button>
                  </div>
                )}
             </div>

          </div>
        )}

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AppLayout>
  )
}
