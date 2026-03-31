'use client'
import { useState, useReducer } from 'react'
import dynamic from 'next/dynamic'
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

const TESTS = [
  { id:'keyboard', label:'Keyboard', icon:'⌨️', desc:'104-key coverage test' },
  { id:'screen',   label:'Screen',   icon:'🖥',  desc:'Dead pixel and color test' },
  { id:'webcam',   label:'Webcam',   icon:'📷', desc:'Camera preview and FPS' },
  { id:'mic',      label:'Mic',      icon:'🎤', desc:'Waveform and level meter' },
  { id:'speaker',  label:'Speaker',  icon:'🔊', desc:'L/R channel and frequency' },
  { id:'mouse',    label:'Mouse',    icon:'🖱',  desc:'Click and movement tracking' },
  { id:'touch',    label:'Touch',    icon:'👆', desc:'Multi-touch detection' },
  { id:'battery',  label:'Battery',  icon:'🔋', desc:'Charge level and health' },
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
}

const initialState = Object.fromEntries(
  TESTS.map(t => [t.id, { status: 'pending', result: null }])
)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RUNNING': return {...state, [action.id]: {...state[action.id], status:'running'}}
    case 'SET_DONE':    return {...state, [action.id]: {status:'done', result:action.result}}
    case 'SET_FAILED':  return {...state, [action.id]: {status:'failed', result:action.result}}
    default: return state
  }
}

function StatusDot({ status }) {
  const styles = {
    pending: {background:'var(--border)', width:8, height:8, borderRadius:'50%'},
    running: {background:'var(--accent)', width:8, height:8, borderRadius:'50%',
              animation:'pulse 1.2s infinite'},
    done:    {color:'#22c55e', fontWeight:700, fontSize:'13px'},
    failed:  {color:'var(--red)', fontWeight:700, fontSize:'13px'},
  }
  if (status === 'done')   return <span style={styles.done}>✓</span>
  if (status === 'failed') return <span style={styles.failed}>✗</span>
  return <div style={styles[status] || styles.pending} />
}

export default function TestLabPage() {
  const [activeTest, setActiveTest]   = useState('keyboard')
  const [testResults, dispatch]       = useReducer(reducer, initialState)

  const doneCount = Object.values(testResults).filter(t => t.status === 'done').length
  const hasAnyDone = doneCount > 0

  const ActiveComponent = COMPONENTS[activeTest]

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

  return (
    <AppLayout>
      <main style={{display:'flex', height:'calc(100vh - 64px)', overflow:'hidden'}}>

        {/* Left Panel — Test Navigator */}
        <aside style={{
          width:'240px', flexShrink:0, background:'var(--bg-secondary)',
          borderRight:'1px solid var(--border)', padding:'1.5rem',
          display:'flex', flexDirection:'column', gap:'6px',
          overflowY:'auto',
        }}>
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>
              {doneCount} / {TESTS.length} complete
            </div>
            <div style={{height:'6px', background:'var(--border)', borderRadius:'3px'}}>
              <div style={{
                height:'100%', background:'var(--accent)', borderRadius:'3px',
                width:`${(doneCount/TESTS.length)*100}%`, transition:'width 0.3s ease'
              }}/>
            </div>
          </div>

          {TESTS.map(t => (
            <div key={t.id} onClick={() => setActiveTest(t.id)} style={{
              display:'flex', alignItems:'center', gap:'12px',
              padding:'10px 12px', borderRadius:'8px', cursor:'pointer',
              background: activeTest===t.id ? 'var(--accent-glow)' : 'transparent',
              borderLeft: activeTest===t.id ? '2px solid var(--accent)' : '2px solid transparent',
              paddingLeft: activeTest===t.id ? '10px' : '12px',
              transition:'all 0.15s',
            }}>
              <span style={{fontSize:'18px'}}>{t.icon}</span>
              <span style={{fontSize:'13px', fontWeight:600, flex:1,
                color: activeTest===t.id ? 'var(--accent)' : 'var(--text-primary)'}}>
                {t.label}
              </span>
              <StatusDot status={testResults[t.id].status} />
            </div>
          ))}

          <div style={{marginTop:'auto', paddingTop:'16px', borderTop:'1px solid var(--border)'}}>
            <button
              className={hasAnyDone ? 'btn-primary' : 'btn-outline'}
              disabled={!hasAnyDone}
              onClick={generateReport}
              style={{width:'100%', opacity: hasAnyDone ? 1 : 0.4, cursor: hasAnyDone ? 'pointer' : 'not-allowed'}}
            >
              Generate Report
            </button>
          </div>
        </aside>

        {/* Right — Active Test */}
        <div style={{flex:1, overflowY:'auto', padding:'2rem'}}>
          <div style={{fontSize:'12px', color:'var(--text-muted)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:1}}>
            TestLab Hub / {TESTS.find(t=>t.id===activeTest)?.label}
          </div>
          {ActiveComponent && (
            <ActiveComponent
              onComplete={handleComplete}
              onFail={(err) => dispatch({type:'SET_FAILED', id:activeTest, result:err})}
            />
          )}
        </div>

      </main>
    </AppLayout>
  )
}
