'use client'
import { useState, useReducer } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronLeft, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

// Lazy load test components
const KeyboardTest  = dynamic(() => import('../../components/tests/KeyboardTest'), { ssr: false })
const ScreenTest    = dynamic(() => import('../../components/tests/ScreenTest'),   { ssr: false })
const WebcamTest    = dynamic(() => import('../../components/tests/WebcamTest'),   { ssr: false })
const MicTest       = dynamic(() => import('../../components/tests/MicTest'),      { ssr: false })
const SpeakerTest   = dynamic(() => import('../../components/tests/SpeakerTest'),  { ssr: false })
const MouseTest     = dynamic(() => import('../../components/tests/MouseTest'),    { ssr: false })
const TouchTest     = dynamic(() => import('../../components/tests/TouchTest'),    { ssr: false })
const BatteryTest   = dynamic(() => import('../../components/tests/BatteryTest'),  { ssr: false })
const GpuStressTest = dynamic(() => import('../../components/tests/GpuStressTest'),{ ssr: false })

const TESTS = [
  { id:'keyboard', label:'Keyboard', icon:'⌨️', desc:'104-key latency and ghosting audit' },
  { id:'screen',   label:'Screen',   icon:'🖥',  desc:'Dead pixel and RGB colour uniformity' },
  { id:'webcam',   label:'Webcam',   icon:'📷', desc:'Live preview with resolution/FPS' },
  { id:'mic',      label:'Mic',      icon:'🎤', desc:'Waveform and RMS level monitoring' },
  { id:'speaker',  label:'Speaker',  icon:'🔊', desc:'Frequency sweep and L/R parity' },
  { id:'mouse',    label:'Mouse',    icon:'🖱',  desc:'Precision tracking and click audit' },
  { id:'touch',    label:'Touch',    icon:'👆', desc:'Multi-touch and digitizer accuracy' },
  { id:'battery',  label:'Battery',  icon:'🔋', desc:'Cycle health and charge analytics' },
  { id:'gpu',      label:'GPU Stress',icon:'🔥', desc:'WebGL thermal stability benchmark' },
]

const COMPONENTS = {
  keyboard: KeyboardTest,
  screen:   ScreenTest,
  webcam:   WebcamTest,
  mic:      MicTest,
  speaker:  SpeakerTest,
  mouse:    MouseTest,
  touch:    TouchTest,
  battery:  BatteryTest,
  gpu:      GpuStressTest,
}

const FIX_MAPPING = {
  keyboard: 'kb-001',
  battery: 'bat-001',
  screen: 'disp-002',
  webcam: 'cam-001',
  speaker: 'aud-001',
  mic: 'aud-001',
  gpu: 'heat-001'
}

const initialState = Object.fromEntries(
  TESTS.map(t => [t.id, { status: 'pending', result: null }])
)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DONE':    return {...state, [action.id]: {status:'done', result:action.result}}
    case 'SET_FAILED':  return {...state, [action.id]: {status:'failed', result:action.result}}
    case 'RESET':       return {...state, [action.id]: {status:'pending', result:null}}
    default: return state
  }
}

export default function TestLabPage() {
  const [activeTest, setActiveTest]   = useState(null)
  const [testResults, dispatch]       = useReducer(reducer, initialState)

  const doneCount = Object.values(testResults).filter(t => t.status === 'done').length
  const hasAnyDone = doneCount > 0

  const handleComplete = (result) => {
    dispatch({ type: 'SET_DONE', id: activeTest, result })
  }

  const generateReport = () => {
    const now = new Date().toLocaleString('en-IN')
    const rows = TESTS.map(t => {
      const st = testResults[t.id]
      const color = st.status==='done'?'#1D9E75':st.status==='failed'?'#E24B4A':'#888'
      const label = st.status==='done'?'✓ Passed':st.status==='failed'?'✗ Failed':'— Not Tested'
      const detail = st.result ? (typeof st.result==='object'?JSON.stringify(st.result).slice(0,100):String(st.result)) : '—'
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee">${t.label} Test</td>
        <td style="padding:10px;border-bottom:1px solid #eee;color:${color};font-weight:600">${label}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;color:#666;font-size:12px">${detail}</td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html><html><head>
      <title>Hardware Diagnostic Report — HackRore</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#111}
        .hdr{border-bottom:3px solid #1D9E75;padding-bottom:16px;margin-bottom:24px}
        h1{color:#1D9E75;margin:0 0 4px;font-size:24px}
        .meta{color:#666;font-size:13px}
        table{width:100%;border-collapse:collapse}
        th{background:#f5f5f5;padding:10px;text-align:left;font-size:13px;border-bottom:2px solid #ddd}
        .ftr{margin-top:32px;padding-top:12px;border-top:1px solid #eee;
             font-size:11px;color:#999;text-align:center}
        @media print{body{padding:20px}}
      </style>
    </head><body>
      <div class="hdr"><h1>HackRore TechWorkbench</h1>
        <div class="meta">Hardware Diagnostic Report · ${now} · hachtool.vercel.app</div>
      </div>
      <table><thead><tr><th>Test</th><th>Status</th><th>Details</th></tr></thead>
        <tbody>${rows}</tbody></table>
      <div class="ftr">Generated by HackRore TechWorkbench · Hynet Technologies, Pune</div>
    </body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 600)
  }

  // --- GRID VIEW (Simplicity first) ---
  if (!activeTest) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>TestLab</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Pick a diagnostic routine to begin.</p>
            </div>
            {hasAnyDone && (
              <button className="btn-primary" onClick={generateReport}>Download Full Report</button>
            )}
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '20px' 
          }}>
            {TESTS.map(t => {
              const res = testResults[t.id]
              return (
                <div 
                  key={t.id} 
                  onClick={() => setActiveTest(t.id)}
                  className="card-elevated"
                  style={{ 
                    padding: '24px', cursor: 'pointer', position: 'relative',
                    transition: 'all 0.2s', border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{t.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t.label}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{t.desc}</p>
                  
                  {res.status !== 'pending' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {res.status === 'done' ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="var(--red)" />}
                    </div>
                  )}
                  
                  <div className="hover-visible" style={{ marginTop: '20px', fontSize: '12px', fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>
                    START TEST →
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AppLayout>
    )
  }

  // --- ACTIVE TEST VIEW (Focused diagnostic) ---
  const ActiveComponent = COMPONENTS[activeTest]
  const fixId = FIX_MAPPING[activeTest]

  return (
    <AppLayout>
      <main style={{display:'flex', height:'calc(100vh - 64px)', overflow:'hidden'}}>

        {/* Left Panel — Test Navigator */}
        <aside style={{
          width:'260px', flexShrink:0, background:'var(--bg-secondary)',
          borderRight:'1px solid var(--border)', padding:'1.5rem',
          display:'flex', flexDirection:'column', gap:'6px',
          overflowY:'auto',
        }}>
          <button 
            onClick={() => setActiveTest(null)}
            style={{ 
              display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', 
              color:'var(--text-muted)', cursor:'pointer', marginBottom:'24px', fontSize:'12px', fontWeight:800
            }}
          >
            <ChevronLeft size={14} /> BACK TO MENU
          </button>

          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'11px', fontWeight:900, color:'var(--text-muted)', marginBottom:'8px', letterSpacing:1}}>
              PROGRESS: {doneCount} / {TESTS.length}
            </div>
            <div style={{height:'4px', background:'var(--border)', borderRadius:'2px'}}>
              <div style={{
                height:'100%', background:'var(--accent)', borderRadius:'2px',
                width:`${(doneCount/TESTS.length)*100}%`, transition:'width 0.3s ease'
              }}/>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {TESTS.map(t => (
              <div key={t.id} onClick={() => setActiveTest(t.id)} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'10px 12px', borderRadius:'8px', cursor:'pointer',
                background: activeTest===t.id ? 'var(--accent-glow)' : 'transparent',
                borderLeft: activeTest===t.id ? '2px solid var(--accent)' : '2px solid transparent',
                paddingLeft: activeTest===t.id ? '10px' : '12px',
                opacity: activeTest===t.id ? 1 : 0.6,
                transition:'all 0.15s',
              }}>
                <span style={{fontSize:'16px'}}>{t.icon}</span>
                <span style={{fontSize:'13px', fontWeight:700, flex:1,
                  color: activeTest===t.id ? 'var(--accent)' : 'var(--text-primary)'}}>
                  {t.label}
                </span>
                {testResults[t.id].status === 'done' && <CheckCircle2 size={12} color="#22c55e" />}
                {testResults[t.id].status === 'failed' && <XCircle size={12} color="var(--red)" />}
              </div>
            ))}
          </div>

          <div style={{marginTop:'auto', paddingTop:'16px', borderTop:'1px solid var(--border)'}}>
            <button
              className={hasAnyDone ? 'btn-primary' : 'btn-outline'}
              disabled={!hasAnyDone}
              onClick={generateReport}
              style={{width:'100%', fontSize: '12px'}}
            >
              Print Results
            </button>
          </div>
        </aside>

        {/* Right — Active Test */}
        <div style={{flex:1, overflowY:'auto', padding:'2.5rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
            <div style={{fontSize:'11px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:800}}>
              {activeTest} // diagnostic_hub
            </div>
            
            {/* View Fix Shortcut */}
            {testResults[activeTest].status === 'failed' && fixId && (
               <Link href="/fixlab" className="btn-accent" style={{padding:'6px 12px', fontSize:'11px', textDecoration:'none', background:'var(--status-fail)'}}>
                 VIEW REPAIR GUIDE
               </Link>
            )}
          </div>

          <div className="animate-in" key={activeTest}>
            {ActiveComponent && (
              <ActiveComponent
                onComplete={handleComplete}
                onFail={(err) => dispatch({type:'SET_FAILED', id:activeTest, result:err})}
              />
            )}
          </div>
        </div>

      </main>
    </AppLayout>
  )
}
