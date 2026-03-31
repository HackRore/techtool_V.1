'use client'
import { useState, useEffect } from 'react'

export default function BatteryTest({ onComplete }) {
  const [battery, setBattery] = useState(null)
  const [unsupported, setUnsupported] = useState(false)

  useEffect(() => {
    if (!('getBattery' in navigator)) {
      setUnsupported(true)
      return
    }
    navigator.getBattery().then(b => {
      const update = () => setBattery({
        level: Math.round(b.level * 100),
        charging: b.charging,
        chargingTime: b.chargingTime === Infinity ? null : b.chargingTime,
        dischargingTime: b.dischargingTime === Infinity ? null : b.dischargingTime,
      })
      update()
      b.addEventListener('levelchange', update)
      b.addEventListener('chargingchange', update)
      return () => {
        b.removeEventListener('levelchange', update)
        b.removeEventListener('chargingchange', update)
      }
    })
  }, [])

  useEffect(() => {
    if (battery) onComplete?.({ level: battery.level, charging: battery.charging })
  }, [battery, onComplete])

  const getAssessment = (level) => {
    if (level > 80) return { text: 'Battery appears healthy', color: 'var(--accent)' }
    if (level > 50) return { text: 'Moderate wear — monitor battery closely', color: 'var(--amber)' }
    if (level > 20) return { text: 'Significant wear — replacement recommended', color: 'var(--red)' }
    return { text: 'Critical — replace battery immediately', color: 'var(--red)' }
  }

  const formatTime = (seconds) => {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m} minutes`
  }

  if (unsupported) return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Battery Test</h2>
      <div className="card" style={{ borderLeft:'3px solid var(--amber)' }}>
        <p style={{marginBottom:'12px'}}>
          Battery status API is only available in Chrome and Edge.
          For a detailed Windows battery report, run this command:
        </p>
        <CopyCmd cmd="powercfg /batteryreport /output &quot;%USERPROFILE%\Desktop\battery-report.html&quot;" />
        <p style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'8px'}}>
          Then open battery-report.html from your Desktop in a browser.
        </p>
      </div>
    </div>
  )

  if (!battery) return <div style={{padding:'2rem', color:'var(--text-muted)'}}>Reading battery status...</div>

  const assessment = getAssessment(battery.level)
  const circumference = 2 * Math.PI * 54 // r=54
  const dashOffset = circumference - (battery.level / 100) * circumference

  return (
    <div>
      <h2 style={{marginBottom:'4px'}}>Battery Test</h2>
      <p style={{color:'var(--text-secondary)', marginBottom:'24px', fontSize:'13px'}}>
        Live battery charge level and health assessment.
      </p>

      <div style={{display:'flex', alignItems:'center', gap:'32px', flexWrap:'wrap'}}>

        {/* Circle progress */}
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="10"/>
          <circle cx="70" cy="70" r="54" fill="none"
            stroke={battery.level > 20 ? 'var(--accent)' : 'var(--red)'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{transition:'stroke-dashoffset 0.8s ease'}}/>
          <text x="70" y="65" textAnchor="middle" fill="var(--text-primary)"
            style={{fontFamily:'JetBrains Mono,monospace',fontSize:'26px',fontWeight:700}}>
            {battery.level}%
          </text>
          <text x="70" y="84" textAnchor="middle" fill="var(--text-secondary)"
            style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px'}}>
            {battery.charging ? 'CHARGING' : 'DISCHARGING'}
          </text>
        </svg>

        {/* Stats */}
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          <div className="card" style={{minWidth:'200px'}}>
            <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px', textTransform:'uppercase'}}>Status</div>
            <div style={{fontSize:'16px', fontWeight:600, color: battery.charging ? 'var(--accent)' : 'var(--text-primary)'}}>
              {battery.charging ? '⚡ Charging' : '🔋 On Battery'}
            </div>
          </div>
          {battery.charging && formatTime(battery.chargingTime) && (
            <div className="card">
              <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px', textTransform:'uppercase'}}>Full in</div>
              <div style={{fontSize:'16px', fontWeight:600}}>{formatTime(battery.chargingTime)}</div>
            </div>
          )}
          {!battery.charging && formatTime(battery.dischargingTime) && (
            <div className="card">
              <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px', textTransform:'uppercase'}}>Remaining</div>
              <div style={{fontSize:'16px', fontWeight:600}}>{formatTime(battery.dischargingTime)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment */}
      <div style={{marginTop:'24px', padding:'14px 16px', borderRadius:'8px',
        border:`1px solid ${assessment.color}`,
        background:`${assessment.color}18`}}>
        <div style={{fontSize:'13px', fontWeight:600, color:assessment.color}}>
          Assessment: {assessment.text}
        </div>
      </div>
    </div>
  )
}

function CopyCmd({ cmd }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{background:'#0d1117', borderRadius:'6px', padding:'10px 14px',
      fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#7ee787',
      display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px'}}>
      <span>{cmd}</span>
      <button onClick={() => { navigator.clipboard.writeText(cmd.replace(/&quot;/g,'"')); setCopied(true); setTimeout(()=>setCopied(false),1500) }}
        style={{fontSize:'10px', padding:'3px 10px', background:'rgba(255,255,255,0.06)',
          color: copied ? 'var(--accent)' : '#8b949e', border:'none', borderRadius:'4px', cursor:'pointer', whiteSpace:'nowrap'}}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}
