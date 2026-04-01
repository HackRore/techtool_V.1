'use client'
import { useState, useReducer, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronLeft, LayoutGrid, CheckCircle2, XCircle, Printer, Zap, Activity, Cpu, Monitor, MousePointer2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

// Lazy load test components with zero-friction architecture
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
  { id:'keyboard', label:'Keyboard', icon:<Monitor size={18}/>, emoji:'⌨️', desc:'Full 104-key latency and ghosting audit' },
  { id:'screen',   label:'Display',  icon:<Activity size={18}/>, emoji:'🖥',  desc:'Pixel integrity and color uniformity' },
  { id:'speaker',  label:'Audio',    icon:<Zap size={18}/>,      emoji:'🔊', desc:'Frequency sweep and stereo parity' },
  { id:'battery',  label:'Battery',  icon:<Cpu size={18}/>,      emoji:'🔋', desc:'Cycle health and charge analytics' },
  { id:'webcam',   label:'Webcam',   icon:<Monitor size={18}/>, emoji:'📷', desc:'Resolution, FPS, and sensor sanity' },
  { id:'mic',      label:'Microphone', icon:<Activity size={18}/>, emoji:'🎤', desc:'Input gain and noise floor check' },
  { id:'mouse',    label:'Precision', icon:<MousePointer2 size={18}/>, emoji:'🖱', desc:'DPI tracking and click longevity' },
  { id:'gpu',      label:'GPU Stress', icon:<Zap size={18}/>,      emoji:'🔥', desc:'Hardware rendering stability test' },
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
  const [ready, setReady]             = useState(false)

  useEffect(() => {
    setReady(true)
    const saved = localStorage.getItem('active_test')
    if (saved) {
      setActiveTest(saved)
      localStorage.removeItem('active_test')
    }
  }, [])

  const doneCount = Object.values(testResults).filter(t => t.status === 'done').length
  const hasAnyDone = doneCount > 0

  const handleComplete = (result) => {
    dispatch({ type: 'SET_DONE', id: activeTest, result })
  }

  const generateReport = () => {
    const now = new Date().toLocaleString('en-IN')
    const rows = TESTS.map(t => {
      const st = testResults[t.id]
      const color = st.status==='done'?'#11A37F':st.status==='failed'?'#E24B4A':'#71717A'
      const label = st.status==='done'?'✓ PASS':st.status==='failed'?'✗ FAIL':'— NOT_TESTED'
      const detail = st.result ? (typeof st.result==='object'?JSON.stringify(st.result).slice(0,120):String(st.result)) : 'N/A'
      return `<tr>
        <td style="padding:12px;border-bottom:1px solid #E4E4E7;font-size:12px;font-weight:600">${t.label.toUpperCase()}</td>
        <td style="padding:12px;border-bottom:1px solid #E4E4E7;color:${color};font-weight:700;font-size:11px">${label}</td>
        <td style="padding:12px;border-bottom:1px solid #E4E4E7;color:#52525B;font-size:11px;font-family:monospace">${detail}</td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html><html><head>
      <title>HARDWARE_DIAGNOSTIC_REPORT // HYNET</title>
      <style>
        body{font-family:'Inter',sans-serif;margin:0;padding:40px;color:#09090B;line-height:1.5}
        .hdr{border-bottom:2px solid #000;padding-bottom:20px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-end}
        h1{margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px}
        .meta{color:#71717A;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#F4F4F5;padding:12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #E4E4E7}
        .ftr{margin-top:64px;padding-top:20px;border-top:1px solid #E4E4E7;font-size:10px;color:#A1A1AA;text-align:center;font-weight:600;letter-spacing:1px}
        .stamp{border:2px solid #11A37F;color:#11A37F;display:inline-block;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:900;text-transform:uppercase;margin-top:20px}
        @media print{body{padding:20px}.no-print{display:none}}
      </style>
    </head><body>
      <div class="hdr">
        <div>
          <h1>HACKRORE_TECHWORKBENCH</h1>
          <div class="meta">SYSTEM_DIAGNOSTIC_REPORT // v5.0_DEFINITIVE</div>
        </div>
        <div style="text-align:right">
          <div class="meta">DATE: ${now}</div>
          <div class="meta">ENGINEER: RAVINDRA // HYNET</div>
        </div>
      </div>
      
      <p style="font-size:12px;font-weight:700;margin-bottom:8px">DIAGNOSTIC SUMMARY:</p>
      <table><thead><tr><th>HARDWARE_MODULE</th><th>STATUS</th><th>TELEMETRY_DATA</th></tr></thead>
        <tbody>${rows}</tbody></table>
      
      <div class="stamp">CERTIFIED_STABLE</div>
      
      <div class="ftr">Generated via Hachtool Diagnostic Portal · Hynet Technologies Pune · Secure Deployment 7X-001</div>
    </body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 600)
  }

  if (!ready) return null

  // --- GRID VIEW ---
  if (!activeTest) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '8px' }}>TestLab</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Unified hardware diagnostic suite. Zero-friction sequential testing.</p>
            </div>
            {hasAnyDone && (
              <button className="btn-primary" onClick={generateReport} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Printer size={16} /> Generate Master Report
              </button>
            )}
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '16px' 
          }}>
            {TESTS.map(t => {
              const res = testResults[t.id]
              return (
                <div 
                  key={t.id} 
                  onClick={() => setActiveTest(t.id)}
                  className="card hover:glow-border"
                  style={{ 
                    padding: '24px', cursor: 'pointer', position: 'relative',
                    transition: 'all 0.2s', border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{t.emoji}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>{t.label}</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{t.desc}</p>
                  
                  {res.status !== 'pending' && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      {res.status === 'done' ? <CheckCircle2 size={18} color="#11A37F" /> : <XCircle size={18} color="var(--red)" />}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '20px', fontSize: '10px', fontWeight: 900, color: 'var(--accent)', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    START DIAGNOSTIC <ChevronLeft size={10} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AppLayout>
    )
  }

  // --- ACTIVE TEST VIEW ---
  const ActiveComponent = COMPONENTS[activeTest]

  return (
    <AppLayout>
      <main style={{display:'flex', height:'calc(100vh - 64px)', overflow:'hidden'}}>

        {/* Diagnostic Navigator Sidebar */}
        <aside style={{
          width:'280px', flexShrink:0, background:'var(--bg-secondary)',
          borderRight:'1px solid var(--border)', padding:'1.5rem',
          display:'flex', flexDirection:'column', gap:'4px',
          overflowY:'auto',
        }}>
          <button 
            onClick={() => setActiveTest(null)}
            style={{ 
              display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', 
              color:'var(--text-muted)', cursor:'pointer', marginBottom:'32px', fontSize:'11px', fontWeight:800, letterSpacing:1
            }}
          >
            <ChevronLeft size={14} /> BACK TO GRID
          </button>

          <div style={{marginBottom:'24px', padding:'12px', background:'var(--bg-elevated)', borderRadius:'12px', border:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px', fontWeight:900, color:'var(--text-muted)', marginBottom:'8px', letterSpacing:1}}>
              PROGRESS: {doneCount} / {TESTS.length}
            </div>
            <div style={{height:'6px', background:'var(--bg-primary)', borderRadius:'3px', overflow:'hidden'}}>
              <div style={{
                height:'100%', background:'var(--accent)',
                width:`${(doneCount/TESTS.length)*100}%`, transition:'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}/>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {TESTS.map(t => (
              <div key={t.id} onClick={() => setActiveTest(t.id)} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'12px 14px', borderRadius:'10px', cursor:'pointer',
                background: activeTest===t.id ? 'var(--accent-glow)' : 'transparent',
                border: activeTest===t.id ? '1px solid var(--accent)' : '1px solid transparent',
                opacity: activeTest===t.id ? 1 : 0.6,
                transition:'all 0.15s',
              }}>
                <span style={{ fontSize: '18px' }}>{t.emoji}</span>
                <span style={{fontSize:'13px', fontWeight:700, flex:1,
                  color: activeTest===t.id ? 'var(--accent)' : 'var(--text-primary)'}}>
                  {t.label}
                </span>
                {testResults[t.id].status === 'done' && <CheckCircle2 size={14} color="#11A37F" />}
              </div>
            ))}
          </div>

          <div style={{marginTop:'auto', paddingTop:'20px'}}>
             <button
               className={hasAnyDone ? 'btn-primary' : 'btn-outline'}
               disabled={!hasAnyDone}
               onClick={generateReport}
               style={{width:'100%', fontSize: '11px', padding: '12px'}}
             >
               Print Full Report
             </button>
          </div>
        </aside>

        {/* Stage Area */}
        <div style={{flex:1, overflowY:'auto', padding:'3rem', background:'var(--bg-primary)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px', borderBottom:'1px solid var(--border)', paddingBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:8, height:8, borderRadius:'50%', background:'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)'}}></div>
                <div style={{fontSize:'11px', color:'var(--text-primary)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:800}}>
                   Active Module: {activeTest.toUpperCase()}
                </div>
            </div>
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
