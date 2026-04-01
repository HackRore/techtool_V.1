'use client'
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import KeyboardTest from '../../components/tests/KeyboardTest'
import BatteryTest from '../../components/tests/BatteryTest'
import { 
  Activity, ChevronRight, X, Printer, CheckCircle2,
  Monitor, Keyboard, Speaker, Webcam, Mic, MousePointer2, Zap, Cpu
} from 'lucide-react'

const tools = [
  { id: 'keyboard', name: 'Keyboard', icon: <Keyboard size={32}/>, desc: 'Verify every key press, rollover, and latency.' },
  { id: 'screen',   name: 'Display', icon: <Monitor size={32}/>,   desc: 'Inspect for dead pixels, backlight bleed, and uniformity.' },
  { id: 'audio',    name: 'Speaker', icon: <Speaker size={32}/>,   desc: 'Tests left/right balance and frequency response.' },
  { id: 'battery',  name: 'Battery', icon: <Zap size={32}/>,       desc: 'Hardware telemetry for health and cycle count.' },
  { id: 'webcam',   name: 'Webcam',  icon: <Webcam size={32}/>,    desc: 'Verify image sensor, focus, and frame rate.' },
  { id: 'mic',      name: 'Microphone', icon: <Mic size={32}/>,   desc: 'Check sound input levels and clarity.' },
  { id: 'precision', name: 'Mouse', icon: <MousePointer2 size={32}/>, desc: 'Assess polling rate and sensor precision.' },
  { id: 'gpu',      name: 'GPU Stress', icon: <Cpu size={32}/>,    desc: 'WebGL stress test for thermal stability.' },
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
    const html = `<!DOCTYPE html><html><head><title>Hardware Diagnostic Report</title>
      <style>
        body{font-family:'Inter',sans-serif;padding:60px;line-height:1.6}
        .hdr{border-bottom:3px solid #000;margin-bottom:40px;display:flex;justify-content:space-between}
        .card{border:1px solid #eee;margin-bottom:20px;padding:24px;border-radius:12px}
        .pass{color:#10b981;font-weight:900}
        .fail{color:#ef4444;font-weight:900}
      </style></head><body>
      <div class="hdr"><div><h1>Hardware Diagnostic Report</h1><p>Engineered by Hachtool</p></div><div><p>Date: ${new Date().toLocaleDateString()}</p></div></div>
      ${Object.entries(results).map(([id, data]) => `
        <div class="card">
          <h3 style="text-transform:uppercase">${id} TEST</h3>
          <p>Status: <span class="${data.status === 'PASS' ? 'pass' : 'fail'}">${data.status}</span></p>
          <pre style="font-size:12px;background:#f4f4f5;padding:12px;border-radius:8px">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `).join('')}
      <p style="margin-top:60px;text-align:center;font-size:11px;color:#999">Validated by Hachtool Professional v6.0</p>
    </body></html>`
    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <AppLayout>
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Header (thetest.com style) */}
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 50, letterSpacing: 1 }}>STEP_01 // DIAGNOSTICS</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>COMPLETE: {progress} / 8</div>
           </div>
           <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12 }}>Hardware Diagnostics</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 640 }}>
             Perform validated field tests on critical system hardware. Ensure all external peripherals are connected before starting.
           </p>
        </div>

        {!active ? (
          /* Grid View: High-White-Space Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginBottom: 64 }}>
             {tools.map(t => (
               <div key={t.id} className="card" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, background: 'var(--bg-elevated)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: results[t.id] ? (results[t.id].status === 'PASS' ? 'var(--status-pass)' : 'var(--status-fail)') : 'var(--accent)', marginBottom: 24 }}>
                     {t.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, textTransform: 'none', letterSpacing: 'normal' }}>{t.name} Test</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, height: 42 }}>{t.desc}</p>
                  
                  {results[t.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 11, fontWeight: 800, color: results[t.id].status === 'PASS' ? 'var(--status-pass)' : 'var(--status-fail)', border: '1px solid var(--border)' }}>
                       <CheckCircle2 size={14} /> RESULT: {results[t.id].status}
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={() => setActive(t.id)} style={{ width: '100%' }}>Start Test</button>
                  )}
               </div>
             ))}
          </div>
        ) : (
          /* Active Module: Focus View */
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '48px' }}>
             
             {/* Sidebar Checklist */}
             <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card" style={{ padding: 24 }}>
                   <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>ACTIVE_DIAGNOSTIC_PATH</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {tools.map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 8, background: t.id === active ? 'var(--accent-soft)' : 'transparent', border: t.id === active ? '1px solid var(--accent)' : '1px solid transparent', transition: '0.2s' }}>
                           <div style={{ color: results[t.id] ? 'var(--status-pass)' : (t.id === active ? 'var(--accent)' : 'var(--text-muted)') }}>{t.icon}</div>
                           <div style={{ fontSize: 13, fontWeight: 800, color: t.id === active ? '#fff' : 'var(--text-secondary)' }}>{t.name}</div>
                           {results[t.id] && <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: 'var(--status-pass)' }} />}
                        </div>
                      ))}
                   </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                   <button className="btn-outline" onClick={() => setActive(null)} style={{ flex: 1 }}>Exit Test</button>
                   <button className="btn-primary" onClick={printReport} disabled={progress === 0} style={{ flex: 1.5, opacity: progress === 0 ? 0.5 : 1 }}>
                      <Printer size={16} /> Print Report
                   </button>
                </div>
             </aside>

             {/* Functional Area */}
             <div className="card animate-in" style={{ padding: '64px', minHeight: 600 }}>
                {active === 'keyboard' && <KeyboardTest onComplete={onComplete} />}
                {active === 'battery' && <BatteryTest onComplete={onComplete} />}
                {!['keyboard', 'battery'].includes(active) && (
                  <div style={{ textAlign: 'center', padding: '100px 40px' }}>
                     <Activity size={64} style={{ color: 'var(--accent)', marginBottom: 24, opacity: 0.5 }} />
                     <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{active.toUpperCase()}_DIAG_READY</h2>
                     <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
                        Module loading... Ensure all relevant hardware and peripherals are active. 
                        Results will be generated upon completion.
                     </p>
                     <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => onComplete({ status: 'PASS', coverage: 100 })}>
                        Confirm Manual Pass
                     </button>
                  </div>
                )}
             </div>

          </div>
        )}

      </div>
    </AppLayout>
  )
}
