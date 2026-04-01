'use client'
import { useState, useEffect } from 'react'
import { Zap, Battery, Activity, ShieldCheck } from 'lucide-react'

export default function BatteryTest({ onComplete }) {
  const [battery, setBattery] = useState(null)
  const [unsupported, setUnsupported] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
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
    if (battery) {
      onComplete?.({ 
        status: battery.level > 80 ? 'PASS' : battery.level > 50 ? 'WARNING' : 'FAIL',
        level: `${battery.level}%`,
        state: battery.charging ? 'Charging' : 'Discharging'
      })
    }
  }, [battery, onComplete])

  const getAssessment = (level) => {
    if (level > 80) return { text: 'BATTERY HEALTHY // OPTIMAL PERFORMANCE', color: '#11A37F', icon: <ShieldCheck size={16}/> }
    if (level > 50) return { text: 'MODERATE WEAR // MONITOR CYCLES', color: '#B47917', icon: <Activity size={16}/> }
    if (level > 20) return { text: 'SIGNIFICANT DEGRADATION // REPLACE RECOMMENDED', color: '#E24B4A', icon: <Zap size={16}/> }
    return { text: 'CRITICAL FAILURE // REPLACE IMMEDIATELY', color: '#E24B4A', icon: <Zap size={16}/> }
  }

  const formatTime = (seconds) => {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m} minutes`
  }

  if (!isReady) return null

  if (unsupported) return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ marginBottom: 12, fontSize: 18, fontWeight: 900 }}>Battery Diagnostic // API_RESTRICTED</h3>
      <div className="card" style={{ borderLeft:'4px solid var(--amber)', padding: 24 }}>
        <p style={{ marginBottom: 16, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          The Browser Battery Status API is only available in Chromium-based environments (Chrome, Edge).
          For full technician analysis, we recommend generating a native Windows report.
        </p>
        <div style={{ background: '#09090B', padding: '12px 16px', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, color: '#7ee787', border: '1px solid var(--border)' }}>
          powercfg /batteryreport
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Run the above command in PowerShell as Admin and upload the generated HTML to ScanLab.
        </p>
      </div>
    </div>
  )

  if (!battery) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving system battery telemetry...</div>

  const assessment = getAssessment(battery.level)
  const circumference = 2 * Math.PI * 54 // r=54
  const dashOffset = circumference - (battery.level / 100) * circumference

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        
        {/* Hynet Circular Telemetry Ring */}
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="8"/>
            <circle cx="70" cy="70" r="54" fill="none"
              stroke={assessment.color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{battery.level}%</span>
             <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1 }}>{battery.charging ? 'CHARGING' : 'ACTIVE'}</span>
          </div>
        </div>

        {/* Diagnostic Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flex: 1 }}>
           <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4, letterSpacing: 1 }}>POWER_STATE</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: battery.charging ? 'var(--accent)' : 'var(--text-primary)' }}>
                 {battery.charging ? '⚡ EXTERNAL_AC' : '🔋 DC_DISCHARGE'}
              </div>
           </div>
           
           <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 4, letterSpacing: 1 }}>TIME_REMAINING</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                 {battery.charging ? (formatTime(battery.chargingTime) || 'CALCULATING') : (formatTime(battery.dischargingTime) || 'CALCULATING')}
              </div>
           </div>

           <div className="card" style={{ padding: '16px 20px', gridColumn: 'span 2', borderLeft: `4px solid ${assessment.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                 {assessment.icon}
                 <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1 }}>HELLTH_ASSESSMENT</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: assessment.color }}>
                 {assessment.text}
              </div>
           </div>
        </div>
      </div>

      {/* Technician Guidance */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
         <h4 style={{ fontSize: 12, fontWeight: 900, marginBottom: 16, color: 'var(--text-primary)', letterSpacing: 1 }}>REPAIR PROTOCOLS // GUIDANCE</h4>
         <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600 }}>
           If battery level remains static while charging, verify adapter wattage and BIOS battery status. 
           Capacity below 70% suggests cell degradation and imminent failure during high-current tasks.
         </p>
      </div>

    </div>
  )
}
