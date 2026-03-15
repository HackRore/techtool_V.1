'use client'
import { useState, useRef, Component } from 'react'
import Navbar from '../../components/Navbar'

// ── Error Boundary ────────────────────────────────────
class ReportErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '32px 24px', maxWidth: 600 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '2px', marginBottom: 12 }}>RENDER ERROR</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Could not display this report section</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--surface-4)', padding: '12px 14px', borderRadius: 2, marginBottom: 16 }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            The JSON report may have an unexpected structure. Try re-running HackRore_Master.ps1 to generate a fresh report.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Helpers ──────────────────────────────────
function Badge({ val, cls }) {
  if (!val) return null
  return <span className={`badge badge-${cls}`}>{val}</span>
}
function Row({ label, value }) {
  if (value === undefined || value === null) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px solid var(--surface-3)', gap: 12 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}
function MiniBar({ value, max = 100, color }) {
  const safe = isNaN(value) ? 0 : Math.min(100, Math.max(0, Number(value)))
  const c = color || (safe > 85 ? '#ef4444' : safe > 65 ? '#f59e0b' : '#10b981')
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{Math.round(safe)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${safe}%`, background: c }} />
      </div>
    </div>
  )
}
function ModCard({ title, children, accent }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: `1px solid ${accent ? `${accent}22` : 'var(--surface-3)'}`, borderRadius: 2, padding: '16px 18px', breakInside: 'avoid' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: accent || 'var(--text-muted)', marginBottom: 14, borderBottom: `1px solid ${accent ? `${accent}22` : 'var(--surface-3)'}`, paddingBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Score Arc ─────────────────────────────────
function ScoreArc({ score, grade, verdict }) {
  const s = isNaN(score) ? 0 : Math.min(100, Math.max(0, Number(score)))
  const col = s >= 85 ? '#10b981' : s >= 65 ? '#f59e0b' : '#ef4444'
  const r = 54, cx = 70, cy = 70, stroke = 8
  const circ = 2 * Math.PI * r
  const arc  = circ * 0.75
  const dash = (s / 100) * arc
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-4)" strokeWidth={stroke} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} style={{ filter: `drop-shadow(0 0 6px ${col}66)`, transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: col, lineHeight: 1 }}>{s}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: col, marginTop: 4 }}>{grade}</div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: 8 }}>VERDICT</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: col }}>{verdict}</div>
      </div>
    </div>
  )
}

// ── Upload Screen ─────────────────────────────
function UploadScreen({ onLoad }) {
  const [dragging, setDrag] = useState(false)
  const [error, setError]   = useState(null)
  const [loading, setLoad]  = useState(false)
  const inputRef = useRef(null)

  const loadJSON = (file) => {
    if (!file) return
    if (!file.name.endsWith('.json')) { setError('Please select a .json file'); return }
    setLoad(true); setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data?.meta || !data?.score) throw new Error('Not a valid HackRore report — missing meta or score fields')
        onLoad(data)
      } catch (err) {
        setError(err.message)
        setLoad(false)
      }
    }
    reader.onerror = () => { setError('Failed to read file'); setLoad(false) }
    reader.readAsText(file)
  }

  return (
    <div style={{ maxWidth: 680, margin: '80px auto', padding: '0 24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: '2px', marginBottom: 16 }}>[02] SCANLAB</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>System Diagnostics</h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.7 }}>
        Run <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontSize: 12 }}>HackRore_Master.ps1</code> on the target Windows machine, then upload the generated JSON report here.
      </p>

      <div
        onDrop={(e) => { e.preventDefault(); setDrag(false); loadJSON(e.dataTransfer.files[0]) }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onClick={() => !loading && inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? 'var(--cyan)' : 'var(--surface-5)'}`, borderRadius: 2, padding: '48px 24px', textAlign: 'center', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s', background: dragging ? 'rgba(6,182,212,0.05)' : 'var(--surface-1)' }}
      >
        {loading ? (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--cyan)', marginBottom: 12, animation: 'pulseAmber 1s infinite' }}>⟳</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px' }}>PARSING REPORT…</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--surface-5)', marginBottom: 12 }}>▲</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Drop HackRore JSON here</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>or click to browse · HackRore_YYYYMMDD_HHmmss.json</div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => loadJSON(e.target.files[0])} />
      </div>

      {error && (
        <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px', borderRadius: 1 }}>
          ✗ {error}
        </div>
      )}

      <div style={{ marginTop: 32, background: 'var(--surface-2)', border: '1px solid var(--surface-4)', borderRadius: 2, padding: '18px 20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: 12 }}>HOW TO GENERATE A REPORT</div>
        {['# Run as Administrator in PowerShell:', 'cd C:\\HackRore', '.\\HackRore_Master.ps1', '', '# Refurbishment mode:', '.\\HackRore_Master.ps1 -Mode refurb', '', '# Report saved to: Reports\\HackRore_*.json'].map((line, i) => (
          <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: line.startsWith('#') ? '#3a3a3a' : '#aaa', lineHeight: 1.8 }}>{line || '\u00a0'}</div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────
function Dashboard({ report, onBack }) {
  const R  = report
  const s  = R?.score || {}
  const sy = R?.system || {}
  const cpu = R?.cpu || {}
  const ram = R?.ram || {}
  const bat = R?.battery
  const devErrors  = R?.devices?.errors || []
  const critIssues = R?.diagnosis?.criticalIssues || []
  const warnings   = R?.diagnosis?.warnings || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      {/* Report header */}
      <div style={{ background: 'var(--surface-1)', borderBottom: '1px solid rgba(6,182,212,0.15)', padding: '18px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: '2px', marginBottom: 4 }}>HACKRORE REPORT · v{R?.meta?.version || '?'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{sy.manufacturer} {sy.model}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {sy.serial} · {R?.meta?.scanTime} · Mode: {R?.meta?.scanMode?.toUpperCase()}
            </div>
          </div>
          <button className="btn-amber" onClick={onBack} style={{ padding: '6px 16px', fontSize: 9 }}>← NEW REPORT</button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
        {/* Score + verdict + issues */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-3)', borderRadius: 2, padding: '20px 24px' }}>
            <ScoreArc score={s.value} grade={s.grade} verdict={s.verdict} />
          </div>
          <div style={{ background: 'var(--surface-2)', border: `1px solid ${critIssues.length > 0 ? 'rgba(239,68,68,0.2)' : 'var(--surface-3)'}`, borderRadius: 2, padding: '16px 18px', overflowY: 'auto', maxHeight: 220 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: critIssues.length > 0 ? 'var(--red)' : 'var(--text-muted)', marginBottom: 10 }}>CRITICAL ({critIssues.length})</div>
            {critIssues.length === 0
              ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)' }}>✓ No critical issues</div>
              : critIssues.map((issue, i) => <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', padding: '4px 0', borderBottom: '1px solid rgba(239,68,68,0.1)', lineHeight: 1.5 }}>✗ {issue}</div>)
            }
          </div>
          <div style={{ background: 'var(--surface-2)', border: `1px solid ${warnings.length > 0 ? 'rgba(245,158,11,0.15)' : 'var(--surface-3)'}`, borderRadius: 2, padding: '16px 18px', overflowY: 'auto', maxHeight: 220 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--amber)', marginBottom: 10 }}>WARNINGS ({warnings.length})</div>
            {warnings.length === 0
              ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)' }}>✓ No warnings</div>
              : warnings.map((w, i) => <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b99', padding: '3px 0', borderBottom: '1px solid rgba(245,158,11,0.08)', lineHeight: 1.5 }}>⚠ {w}</div>)
            }
          </div>
        </div>

        {/* Module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>

          <ModCard title="SYSTEM IDENTITY" accent="#06b6d4">
            <Row label="Model"         value={sy.model} />
            <Row label="Manufacturer"  value={sy.manufacturer} />
            <Row label="Serial"        value={sy.serial} />
            <Row label="Motherboard"   value={sy.motherboard} />
            <Row label="OS"            value={sy.osName} />
            <Row label="Build"         value={sy.osBuild} />
            <Row label="BIOS"          value={sy.biosVersion ? `${sy.biosVersion} (${sy.biosDate})` : null} />
            <Row label="Last Boot"     value={sy.lastBoot} />
            <Row label="Uptime"        value={sy.uptime != null ? `${sy.uptime} hrs` : null} />
            <Row label="Type"          value={sy.pcType} />
            <Row label="Activation"    value={<Badge val={sy.activation} cls={sy.activation === 'Activated' ? 'pass' : 'fail'} />} />
          </ModCard>

          <ModCard title="PROCESSOR" accent="#f59e0b">
            <Row label="Model"          value={cpu.name} />
            <Row label="Cores/Threads"  value={cpu.cores != null ? `${cpu.cores}C / ${cpu.threads}T` : null} />
            <Row label="Max Speed"      value={cpu.maxSpeedMHz ? `${cpu.maxSpeedMHz} MHz` : null} />
            <Row label="L2 Cache"       value={cpu.l2CacheKB ? `${cpu.l2CacheKB} KB` : null} />
            <Row label="L3 Cache"       value={cpu.l3CacheKB ? `${cpu.l3CacheKB} KB` : null} />
            {cpu.loadPercent != null && <div style={{ marginTop: 8 }}><div className="label-tag">LOAD %</div><MiniBar value={cpu.loadPercent} /></div>}
            {cpu.tempCelsius != null && (
              <Row label="Temperature" value={
                <span style={{ color: cpu.tempCelsius > 90 ? 'var(--red)' : cpu.tempCelsius > 80 ? 'var(--amber)' : 'var(--green)' }}>
                  {cpu.tempCelsius}°C [{cpu.tempMethod}]
                </span>
              } />
            )}
            {cpu.tempNote && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>⚠ {cpu.tempNote}</div>}
          </ModCard>

          <ModCard title="MEMORY" accent="#a78bfa">
            <Row label="Total"      value={ram.totalGB != null ? `${ram.totalGB} GB` : null} />
            <Row label="Available"  value={ram.availableGB != null ? `${ram.availableGB} GB` : null} />
            <Row label="Slots"      value={ram.slots} />
            {ram.usedPercent != null && <div style={{ marginTop: 8 }}><div className="label-tag">USAGE %</div><MiniBar value={ram.usedPercent} /></div>}
            {(ram.modules || []).map((m, i) => (
              <div key={i} style={{ marginTop: 8, padding: 8, background: 'var(--surface-3)', borderRadius: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>{m.slot}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)' }}>{m.capacityGB}GB {m.type} @ {m.speedMHz} MHz</div>
                {m.partNumber && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#3a3a3a' }}>{m.partNumber}</div>}
              </div>
            ))}
          </ModCard>

          {(R?.storage?.disks || []).map((disk, i) => {
            const sa = disk?.smartAttributes || {}
            return (
              <ModCard key={i} title={`STORAGE ${i + 1}`} accent={disk.smartOK === false ? '#ef4444' : '#10b981'}>
                <Row label="Model"   value={disk.model} />
                <Row label="Type"    value={disk.storageType || disk.interface} />
                <Row label="Size"    value={disk.sizeGB != null ? `${disk.sizeGB} GB` : null} />
                <Row label="Serial"  value={disk.serialNumber} />
                <Row label="SMART"   value={<Badge val={disk.smartStatus} cls={disk.smartOK === false ? 'fail' : disk.smartOK === true ? 'pass' : 'warn'} />} />
                {disk.busType       && <Row label="Bus"    value={disk.busType} />}
                {disk.healthStatus  && <Row label="Health" value={disk.healthStatus} />}
                {sa.powerOnHours    && <Row label="Power-On" value={`${sa.powerOnHours}h (~${Math.round(sa.powerOnHours/8760*10)/10} yrs)`} />}
                {sa.powerCycles     && <Row label="Cycles"   value={sa.powerCycles} />}
                {sa.tempCelsius     && <Row label="Drive Temp" value={`${sa.tempCelsius}°C`} />}
                {sa.reallocatedSectors > 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 6 }}>✗ Reallocated: {sa.reallocatedSectors}</div>}
                {sa.pendingSectors > 0     && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 4 }}>✗ Pending: {sa.pendingSectors}</div>}
                {sa.uncorrectableErrors > 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 4 }}>✗ Uncorrectable: {sa.uncorrectableErrors}</div>}
              </ModCard>
            )
          })}

          {(R?.storage?.volumes || []).map((v, i) => (
            <ModCard key={i} title={`VOLUME ${v.drive}`} accent="#10b981">
              <MiniBar value={v.usedPercent || 0} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{v.usedGB} GB used / {v.totalGB} GB total</div>
            </ModCard>
          ))}

          {bat && (
            <ModCard title="BATTERY" accent={bat.wearPercent > 40 ? '#ef4444' : bat.wearPercent > 25 ? '#f59e0b' : '#10b981'}>
              <Row label="Name"     value={bat.name} />
              <Row label="Status"   value={bat.statusText} />
              <Row label="Charge"   value={bat.chargePercent != null ? `${bat.chargePercent}%` : null} />
              <Row label="Voltage"  value={bat.voltage != null ? `${bat.voltage} V` : null} />
              <Row label="Cycles"   value={bat.cycleCount || bat.cycleSource} />
              {bat.wearPercent != null && (
                <div style={{ marginTop: 8 }}>
                  <div className="label-tag">WEAR % (0 = new)</div>
                  <MiniBar value={bat.wearPercent} color={bat.wearPercent > 40 ? '#ef4444' : bat.wearPercent > 25 ? '#f59e0b' : '#10b981'} />
                </div>
              )}
            </ModCard>
          )}

          {(R?.gpu || []).map((g, i) => (
            <ModCard key={i} title={`GPU ${i + 1}`} accent="#818cf8">
              <Row label="Name"        value={g.name} />
              <Row label="VRAM"        value={g.vramMB != null ? `${g.vramMB} MB${g.vramMB >= 4095 ? ' ⚠' : ''}` : null} />
              <Row label="Resolution"  value={g.resolution} />
              <Row label="Refresh"     value={g.refreshRate != null ? `${g.refreshRate} Hz` : null} />
              <Row label="Driver"      value={g.driverVersion} />
              <Row label="Driver Date" value={g.driverDate} />
              <Row label="Status"      value={<Badge val={g.errorCode === 0 ? 'OK' : `Error ${g.errorCode}`} cls={g.errorCode === 0 ? 'pass' : 'fail'} />} />
              {g.vramMB >= 4095 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', marginTop: 6 }}>⚠ WMI cap — use GPU-Z for real VRAM value.</div>}
            </ModCard>
          ))}

          {R?.network && (
            <ModCard title="NETWORK" accent="#22d3ee">
              <Row label="IPv4" value={R.network.ipv4} />
              <Row label="DNS"  value={R.network.dns} />
              {(R.network.adapters || []).filter(a => a.enabled).map((a, i) => (
                <Row key={i} label={a.name} value={a.speed || 'N/A'} />
              ))}
            </ModCard>
          )}

          {R?.bluetooth && (
            <ModCard title="BLUETOOTH" accent="#818cf8">
              <Row label="Adapter" value={<Badge val={R.bluetooth.adapterName || 'Not Found'} cls={R.bluetooth.adapterFound ? 'pass' : 'fail'} />} />
              <Row label="Status"  value={R.bluetooth.adapterStatus} />
              {R.bluetooth.driverVersion && <Row label="Driver" value={`${R.bluetooth.driverVersion} (${R.bluetooth.driverDate})`} />}
              <Row label="Paired"    value={R.bluetooth.pairedDevices?.length ?? null} />
              <Row label="Connected" value={R.bluetooth.connectedDevices?.length ?? null} />
            </ModCard>
          )}

          {R?.thermal && (
            <ModCard title="THERMAL" accent={R.thermal.throttlingDetected ? '#ef4444' : '#10b981'}>
              <Row label="Throttling" value={<Badge val={R.thermal.throttlingDetected ? 'DETECTED' : 'NONE'} cls={R.thermal.throttlingDetected ? 'fail' : 'pass'} />} />
              {R.thermal.perfCounterFreqPct != null && <Row label="Freq % of Max" value={`${R.thermal.perfCounterFreqPct}%`} />}
              {(R.thermal.thermalZones || []).map((z, i) => (
                <Row key={i} label={z.zone?.split('\\').pop() || `Zone ${i+1}`} value={<span style={{ color: z.tempC > 90 ? 'var(--red)' : z.tempC > 80 ? 'var(--amber)' : 'var(--green)' }}>{z.tempC}°C</span>} />
              ))}
            </ModCard>
          )}

          {R?.wifi?.currentConnection?.signalPercent && (
            <ModCard title="WIFI SIGNAL" accent="#06b6d4">
              <Row label="SSID"    value={R.wifi.currentConnection.ssid} />
              <Row label="Signal"  value={`${R.wifi.currentConnection.signalPercent}%`} />
              <Row label="Channel" value={R.wifi.currentConnection.channel} />
              <Row label="Radio"   value={R.wifi.currentConnection.radioType} />
              <Row label="Rx Rate" value={R.wifi.currentConnection.rxRateMbps ? `${R.wifi.currentConnection.rxRateMbps} Mbps` : null} />
              <div style={{ marginTop: 8 }}><div className="label-tag">SIGNAL</div><MiniBar value={R.wifi.currentConnection.signalPercent} color={R.wifi.currentConnection.signalPercent < 40 ? '#ef4444' : R.wifi.currentConnection.signalPercent < 65 ? '#f59e0b' : '#10b981'} /></div>
            </ModCard>
          )}

          {devErrors.length > 0 && (
            <ModCard title={`DEVICE ERRORS (${devErrors.length})`} accent="#ef4444">
              {devErrors.map((d, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>✗ {d.name} [Code {d.code}]</div>
                  {d.suggestedFix && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', marginTop: 3, lineHeight: 1.5 }}>↳ {d.suggestedFix}</div>}
                </div>
              ))}
            </ModCard>
          )}

          {(R?.eventLog?.critical || []).length > 0 && (
            <ModCard title={`CRITICAL EVENTS (${R.eventLog.critical.length})`} accent="#ef4444">
              {R.eventLog.critical.map((e, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{e.time}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)' }}>ID {e.eventId}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{e.message}</div>
                  {e.resolution && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', marginTop: 3 }}>↳ {e.resolution}</div>}
                </div>
              ))}
            </ModCard>
          )}

          {R?.benchmarks?.diskSeqReadMBps && (
            <ModCard title="BENCHMARKS" accent="#f59e0b">
              <Row label="Disk Read"     value={`${R.benchmarks.diskSeqReadMBps} MB/s`} />
              <Row label="Disk Write"    value={R.benchmarks.diskSeqWriteMBps ? `${R.benchmarks.diskSeqWriteMBps} MB/s` : null} />
              {R.benchmarks.cpuBenchMs   && <Row label="CPU Bench"     value={`${R.benchmarks.cpuBenchMs} ms`} />}
              {R.benchmarks.ramBenchGBps && <Row label="RAM Bandwidth" value={`${R.benchmarks.ramBenchGBps} GB/s`} />}
            </ModCard>
          )}

          {R?.usbPorts && (
            <ModCard title="USB PORTS" accent="#06b6d4">
              <Row label="USB 2.0 Hubs"  value={R.usbPorts.summary?.usb2Hubs} />
              <Row label="USB 3.x Hubs"  value={R.usbPorts.summary?.usb3Hubs} />
              <Row label="Controllers"   value={R.usbPorts.summary?.controllerCount} />
              <Row label="Devices"       value={R.usbPorts.summary?.connectedDevices} />
              <Row label="Thunderbolt"   value={<Badge val={R.usbPorts.summary?.thunderbolt ? 'Detected' : 'Not Found'} cls={R.usbPorts.summary?.thunderbolt ? 'pass' : 'idle'} />} />
            </ModCard>
          )}

          {R?.startup && (
            <ModCard title="STARTUP ITEMS" accent={R.startup.count > 20 ? '#f59e0b' : '#10b981'}>
              <Row label="Total" value={R.startup.count} />
              {(R.startup.items || []).slice(0, 8).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--surface-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{item.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#3a3a3a' }}>{item.location}</span>
                </div>
              ))}
              {R.startup.count > 8 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>+{R.startup.count - 8} more</div>}
            </ModCard>
          )}

          {R?.updates?.pendingCount != null && (
            <ModCard title="WINDOWS UPDATES" accent={R.updates.pendingCount > 10 ? '#f59e0b' : '#10b981'}>
              <Row label="Pending" value={<Badge val={`${R.updates.pendingCount} pending`} cls={R.updates.pendingCount > 10 ? 'warn' : R.updates.pendingCount > 0 ? 'warn' : 'pass'} />} />
              {(R.updates.updates || []).slice(0, 5).map((u, i) => (
                <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid var(--surface-3)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-primary)', lineHeight: 1.5 }}>{u.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>{u.kb} · {u.severity} · {u.sizeMB}MB</div>
                </div>
              ))}
            </ModCard>
          )}

          {R?.camera && R.camera.count > 0 && (
            <ModCard title="CAMERA" accent="#10b981">
              <Row label="Devices" value={R.camera.count} />
              {(R.camera.devices || []).map((c, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--surface-3)' }}>
                  <Row label={c.type} value={<Badge val={c.status === 'OK' ? 'OK' : 'ERROR'} cls={c.status === 'OK' ? 'pass' : 'fail'} />} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{c.name}</div>
                </div>
              ))}
            </ModCard>
          )}

          {R?.display?.monitors?.length > 0 && (
            <ModCard title="DISPLAY PANEL" accent="#818cf8">
              {R.display.monitors.map((m, i) => (
                <div key={i}>
                  <Row label="Panel"     value={m.name} />
                  <Row label="Mfr"       value={m.manufacturer} />
                  <Row label="Type"      value={m.connectionType} />
                  <Row label="Resolution" value={m.resolution} />
                  <Row label="Refresh"   value={m.refreshHz != null ? `${m.refreshHz} Hz` : null} />
                  <Row label="Mfr Date"  value={m.weekMfr ? `Wk ${m.weekMfr}/${m.yearMfr}` : null} />
                </div>
              ))}
            </ModCard>
          )}

          {R?.refurbCertificate && (
            <ModCard title="REFURB CERTIFICATE" accent="#10b981">
              <Row label="Date"        value={R.refurbCertificate.certDate} />
              <Row label="Technician"  value={R.refurbCertificate.technician} />
              <Row label="Machine"     value={R.refurbCertificate.machine} />
              <Row label="Serial"      value={R.refurbCertificate.serial} />
              <Row label="Verdict"     value={<Badge val={R.refurbCertificate.verdict} cls={R.refurbCertificate.verdict === 'PASS' ? 'pass' : R.refurbCertificate.verdict === 'FAIL' ? 'fail' : 'warn'} />} />
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 1, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', lineHeight: 1.6 }}>
                {R.refurbCertificate.recommendation}
              </div>
            </ModCard>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Page root ────────────────────────────────
export default function ScanLab() {
  const [report, setReport] = useState(null)
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <Navbar />
      <ReportErrorBoundary>
        {report
          ? <Dashboard report={report} onBack={() => setReport(null)} />
          : <UploadScreen onLoad={setReport} />
        }
      </ReportErrorBoundary>
    </div>
  )
}
