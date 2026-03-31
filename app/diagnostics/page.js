'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanLabPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [isWindows, setIsWindows] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [scanData, setScanData] = useState(null)
  const [fileError, setFileError] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const platform = navigator.userAgentData?.platform || navigator.platform || ''
    setIsWindows(platform.toLowerCase().includes('win'))
    setReady(true)
  }, [])

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.json')) {
      setFileError('Invalid file. Must be a HackRore .json report.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        setScanData(parsed)
        setFileError(null)
      } catch {
        setFileError('Could not read file. Ensure it is a valid HackRore JSON report.')
      }
    }
    reader.readAsText(file)
  }

  const loadDemo = () => {
    // Load a hardcoded demo scan result object
    setScanData({
      overall: 82, grade: 'PASS',
      cpu: { status: 'healthy', detail: 'Intel Core i5-10210U @ 1.60GHz, 4 cores' },
      ram: { status: 'healthy', detail: '8 GB DDR4-2666' },
      storage: { status: 'warning', detail: 'WD Blue 500GB — 1 reallocated sector' },
      battery: { status: 'warning', detail: '61% wear level, 412 cycles' },
      thermals: { status: 'healthy', detail: 'CPU max 78°C under load' },
      events: { status: 'healthy', detail: '3 warnings in last 7 days' },
    })
  }

  if (!ready) return (
    <main style={{padding:'2rem', color:'var(--text-secondary)'}}>Loading ScanLab...</main>
  )

  return (
    <main style={{maxWidth:'960px', margin:'0 auto', padding:'2rem 1.5rem'}}>

      {/* OS Warning Banner */}
      {!isWindows && (
        <div style={{
          borderLeft:'3px solid var(--amber)',
          background:'rgba(186,117,23,0.08)',
          padding:'12px 16px',
          borderRadius:'0 8px 8px 0',
          marginBottom:'24px',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          gap:'16px',
          flexWrap:'wrap'
        }}>
          <span style={{fontSize:'13px', color:'var(--text-primary)'}}>
            ⚠ ScanLab's PowerShell scanner requires Windows.
            Browser hardware tests in TestLab work on all platforms.
          </span>
          <button className="btn-outline" onClick={() => router.push('/tools')}>
            Go to TestLab →
          </button>
        </div>
      )}

      {/* Page Header */}
      <h1 style={{fontFamily:'JetBrains Mono, monospace', marginBottom:'8px'}}>ScanLab</h1>
      <p style={{color:'var(--text-secondary)', marginBottom:'32px', maxWidth:'560px'}}>
        Run the PowerShell scanner on any Windows machine, then upload the JSON report
        for a complete health dashboard with AI diagnosis and customer report.
      </p>

      {/* Main Cards — Upload + Demo */}
      {!scanData && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'32px'}}>

          {/* Upload Zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFile(e.dataTransfer.files[0])
            }}
            style={{
              minHeight:'220px',
              border:`2px dashed ${dragging ? 'var(--accent)' : '#2a2d3e'}`,
              borderRadius:'12px',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:'12px',
              padding:'2rem',
              cursor:'pointer',
              background: dragging ? 'var(--accent-glow)' : 'transparent',
              transition:'all 0.18s ease',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <p style={{fontWeight:600, margin:0}}>Drop HackRore JSON here</p>
            <p style={{color:'var(--text-muted)', fontSize:'12px', margin:0}}>or click to browse</p>
            {fileError && <p style={{color:'var(--red)', fontSize:'12px', margin:0}}>{fileError}</p>}
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              style={{display:'none'}}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* Demo Card — EQUAL SIZE, teal border, filled button */}
          <div style={{
            minHeight:'220px',
            border:'1px solid var(--accent)',
            borderRadius:'12px',
            background:'var(--bg-secondary)',
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            justifyContent:'center',
            gap:'12px',
            padding:'2rem',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
            </svg>
            <h3 style={{fontFamily:'JetBrains Mono, monospace', margin:0}}>Try Live Demo</h3>
            <p style={{color:'var(--text-muted)', fontSize:'12px', textAlign:'center', margin:0}}>
              See a fully populated scan report instantly — no Windows required.
            </p>
            <button className="btn-primary" style={{width:'100%'}} onClick={loadDemo}>
              Load Demo Report →
            </button>
          </div>
        </div>
      )}

      {/* Results (shown after upload or demo) */}
      {scanData && (
        <div>
          {/* Score Ring */}
          <div style={{display:'flex', alignItems:'center', gap:'24px', marginBottom:'32px'}}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2030" strokeWidth="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="10"
                strokeDasharray={`${(scanData.overall/100)*314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{transition:'stroke-dasharray 1.2s ease'}}/>
              <text x="60" y="56" textAnchor="middle" fill="var(--text-primary)"
                style={{fontFamily:'JetBrains Mono',fontSize:'24px',fontWeight:700}}>
                {scanData.overall}
              </text>
              <text x="60" y="74" textAnchor="middle"
                fill={scanData.grade==='PASS'?'var(--accent)':'var(--red)'}
                style={{fontFamily:'JetBrains Mono',fontSize:'12px',fontWeight:600}}>
                {scanData.grade}
              </text>
            </svg>
            <div>
              <h2 style={{marginBottom:'4px'}}>System Health Report</h2>
              <p style={{color:'var(--text-secondary)', fontSize:'13px'}}>
                Overall score: {scanData.overall}/100 — {scanData.grade}
              </p>
              <button className="btn-primary" style={{marginTop:'12px'}} onClick={() => alert('Customer report generation coming soon')}>
                Generate Customer Report →
              </button>
              <button className="btn-outline" style={{marginLeft:'8px'}} onClick={() => setScanData(null)}>
                Upload New Report
              </button>
            </div>
          </div>

          {/* Module Grid */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px'}}>
            {Object.entries(scanData).filter(([k]) => !['overall','grade'].includes(k)).map(([key, val]) => (
              <div key={key} className="card" style={{
                borderLeft:`3px solid ${val.status==='healthy'?'var(--accent)':val.status==='warning'?'var(--amber)':'var(--red)'}`,
              }}>
                <div style={{fontSize:'12px',fontWeight:600,textTransform:'uppercase',
                  color:val.status==='healthy'?'var(--accent)':val.status==='warning'?'var(--amber)':'var(--red)',
                  marginBottom:'4px'}}>
                  {key.toUpperCase()} — {val.status.toUpperCase()}
                </div>
                <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{val.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PowerShell Instructions — collapsible */}
      <CollapsibleInstructions />

    </main>
  )
}

function CollapsibleInstructions() {
  const [open, setOpen] = useState(false)
  const cmd1 = '.\\HackRore_Master.ps1'
  const cmd2 = '.\\HackRore_Master.ps1 -Mode refurb'
  return (
    <div style={{marginTop:'32px', borderTop:'1px solid var(--border)', paddingTop:'16px'}}>
      <button onClick={() => setOpen(!open)} style={{
        background:'none', border:'none', color:'var(--text-secondary)',
        fontSize:'13px', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:'6px'
      }}>
        <span style={{transform:`rotate(${open?90:0}deg)`, display:'inline-block', transition:'transform .2s'}}>›</span>
        How to run the PowerShell scanner
      </button>
      {open && (
        <div style={{marginTop:'12px', display:'flex', flexDirection:'column', gap:'8px'}}>
          <p style={{fontSize:'12px', color:'var(--text-secondary)'}}>
            Open PowerShell as Administrator on the target Windows machine and run:
          </p>
          <CmdBlock cmd={cmd1} label="Normal mode" />
          <CmdBlock cmd={cmd2} label="Refurb grading mode" />
        </div>
      )}
    </div>
  )
}

function CmdBlock({ cmd, label }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{background:'#0d1117', borderRadius:'6px', padding:'10px 14px',
      fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#7ee787',
      display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px'}}>
      <div>
        <div style={{color:'#8b949e', fontSize:'10px', marginBottom:'4px'}}>{label}</div>
        {cmd}
      </div>
      <button onClick={() => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(()=>setCopied(false),1500) }}
        style={{fontSize:'10px', padding:'3px 10px', background:'rgba(255,255,255,0.06)',
          color:'#8b949e', border:'none', borderRadius:'4px', cursor:'pointer', whiteSpace:'nowrap'}}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}
