'use client'
import { useState, useRef, Component } from 'react'
import Sidebar from '../../components/Sidebar'

/* ── Error Boundary ─────────────────────────── */
class ReportErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '40px 24px', maxWidth: 600 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>Could not display this section</div>
        <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--g600)', background: 'var(--g50)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 6, marginBottom: 12 }}>
          {this.state.error?.message || 'Unknown error'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--g500)' }}>
          Try re-running HackRore_Master.ps1 to generate a fresh report.
        </div>
      </div>
    )
    return this.props.children
  }
}

/* ── Small helpers ──────────────────────────── */
function Badge({ val, cls }) {
  if (!val) return null
  const colors = {
    pass:    { bg: '#e6f9ee', color: '#16a34a' },
    fail:    { bg: '#fef2f2', color: '#dc2626' },
    warn:    { bg: '#fffbeb', color: '#d97706' },
    idle:    { bg: 'var(--g100)', color: 'var(--g500)' },
    live:    { bg: '#e6f9ee', color: '#16a34a' },
    error:   { bg: '#fef2f2', color: '#dc2626' },
  }
  const c = colors[cls] || colors.idle
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-heading)', background: c.bg, color: c.color }}>
      {val}
    </span>
  )
}

function Row({ label, value }) {
  if (value === undefined || value === null) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--g500)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--g800)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

function MiniBar({ value, max = 100, color }) {
  const safe = isNaN(value) ? 0 : Math.min(100, Math.max(0, Number(value)))
  const c = color || (safe > 85 ? 'var(--red)' : safe > 65 ? 'var(--yellow)' : 'var(--green)')
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ height: 5, background: 'var(--g200)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${safe}%`, background: c, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--g500)', marginTop: 3 }}>{Math.round(safe)}%</div>
    </div>
  )
}

function ModCard({ title, children, accent }) {
  const ac = accent || 'var(--accent)'
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 18px', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, color: ac, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${ac}22` }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function ScoreArc({ score, grade, verdict }) {
  const s = isNaN(score) ? 0 : Math.min(100, Math.max(0, Number(score)))
  const col = s >= 85 ? 'var(--green)' : s >= 65 ? 'var(--yellow)' : 'var(--red)'
  const r = 54, cx = 70, cy = 70, sw = 8
  const circ = 2 * Math.PI * r
  const arc  = circ * 0.75
  const dash = (s / 100) * arc
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--g200)" strokeWidth={sw} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 30, fontWeight: 700, color: col, lineHeight: 1 }}>{s}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 9, color: 'var(--g400)', marginTop: 2 }}>/ 100</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, color: col, marginTop: 4 }}>{grade}</div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Overall Verdict</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: col }}>{verdict}</div>
      </div>
    </div>
  )
}

/* ── Upload Screen ──────────────────────────── */
function UploadScreen({ onLoad }) {
  const [dragging, setDrag] = useState(false)
  const [error, setError]   = useState(null)
  const [loading, setLoad]  = useState(false)
  const [loadingSample, setLoadingSample] = useState(false)
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
      } catch (err) { setError(err.message); setLoad(false) }
    }
    reader.onerror = () => { setError('Failed to read file'); setLoad(false) }
    reader.readAsText(file)
  }

  const loadSample = async () => {
    setLoadingSample(true); setError(null)
    try {
      const res = await fetch('/sample-report.json')
      if (!res.ok) throw new Error('Could not load sample report')
      const data = await res.json()
      onLoad(data)
    } catch (err) {
      setError(err.message)
      setLoadingSample(false)
    }
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px' }}>
      <div className="breadcrumb">Home / ScanLab</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 5 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--g900)' }}>System Diagnostics</h1>
        <button
          onClick={loadSample}
          disabled={loadingSample}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--g50)', border: '1.5px dashed var(--border2)', borderRadius: 7, padding: '8px 16px', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 600, color: 'var(--g600)', cursor: loadingSample ? 'wait' : 'pointer', flexShrink: 0 }}
        >
          <span style={{ fontSize: 16 }}>🔬</span>
          {loadingSample ? 'Loading…' : 'Try Sample Report'}
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--g500)', marginBottom: 28 }}>
        Run the PowerShell scanner on any Windows machine, then upload the JSON report here. Or click <strong>Try Sample Report</strong> to see a demo instantly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Step 1 */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '22px' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Step 1 — Run Scanner</div>
          <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.65, marginBottom: 14 }}>
            Open PowerShell as Administrator on the target Windows machine and run:
          </p>
          <div style={{ background: 'var(--g900)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-code)', fontSize: 12, color: '#c0cfe4', lineHeight: 1.8 }}>
            <span style={{ color: '#adb5bd' }}># Run as Administrator</span><br />
            <span style={{ color: '#f9ca24' }}>.\HackRore_Master.ps1</span><br /><br />
            <span style={{ color: '#adb5bd' }}># Refurb mode:</span><br />
            <span style={{ color: '#f9ca24' }}>.\HackRore_Master.ps1</span> <span style={{ color: '#c0cfe4' }}>-Mode refurb</span>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '22px' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Step 2 — Upload Report</div>
          <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.65, marginBottom: 14 }}>
            The scanner generates <code style={{ fontFamily: 'var(--font-code)', background: 'var(--g100)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>HackRore_*.json</code> in the Reports folder. Drop it below.
          </p>
          <div
            onDrop={(e) => { e.preventDefault(); setDrag(false); loadJSON(e.dataTransfer.files[0]) }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onClick={() => !loading && inputRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 8, padding: '28px 24px', textAlign: 'center', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s', background: dragging ? 'var(--accent-light)' : 'var(--g50)' }}
          >
            {loading ? (
              <><div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--g500)' }}>Parsing report…</div></>
            ) : (
              <><div style={{ fontSize: 28, marginBottom: 8 }}>📂</div><div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--g800)', marginBottom: 4 }}>Drop JSON report here</div><div style={{ fontSize: 12, color: 'var(--g400)' }}>or click to browse</div></>
            )}
            <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => loadJSON(e.target.files[0])} />
          </div>
          {error && (
            <div style={{ marginTop: 10, fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--red)', background: '#fef2f2', border: '1px solid rgba(220,38,38,.2)', padding: '9px 12px', borderRadius: 6 }}>
              ✗ {error}
            </div>
          )}
        </div>
      </div>

      {/* What gets scanned */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '22px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: 'var(--g700)', marginBottom: 14 }}>What gets scanned (21 modules)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
          {['CPU — Clock, cores, throttle','RAM — Slots, speed, capacity','Storage — SMART attributes','Battery — Wear & cycle count','GPU — Driver & VRAM','Thermals — Temperature zones','Event Log — Critical errors','Device Errors — Failed drivers','Network — Adapters & DNS','BIOS — Version & SecureBoot','Windows — Version & activation','USB Ports — Connected devices','Camera — Status & drivers','Display — Resolution & panel','Bluetooth — Adapter & paired','Startup Items — Programs','WiFi Signal — Strength & SSID','Benchmarks — Disk & CPU I/O','Updates — Pending patches','Refurb Certificate — Grade','Overall Score — PASS/FAIL'].map(m => {
            const [name, desc] = m.split(' — ')
            return (
              <div key={name} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: 'var(--g50)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <span style={{ color: 'var(--green)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: 'var(--g800)' }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--g500)' }}>{desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard ──────────────────────────────── */
function AIDiagnosisPanel({ report }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [diagnosis, setDiagnosis] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    setStatus('loading')
    setDiagnosis(null)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)
      setDiagnosis(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  const copyReport = () => {
    if (!diagnosis) return
    const R = report?.system || {}
    const lines = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  HackRore Diagnostic Report',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `Device:       ${R.manufacturer} ${R.model}`,
      `Serial:       ${R.serial}`,
      `Health Score: ${report?.score?.value}/100 (${report?.score?.grade})`,
      `Overall:      ${diagnosis.verdict?.decision}`,
      `Repair Time:  ${diagnosis.repairTime || 'Varies'}`,
      '',
      '── Summary ─────────────────',
      diagnosis.summary,
      '',
      '── Issues Found ─────────────',
      ...(diagnosis.issues || []).map((i, n) =>
        `${n + 1}. [${i.severity?.toUpperCase()}] ${i.title}\n   Fix: ${i.action}  (${i.estimatedTime})`
      ),
      '',
      '── Customer Message ─────────',
      diagnosis.customerMessage,
      '',
      `Generated by HackRore TechWorkbench — ${new Date().toLocaleString()}`,
    ].join('\n')
    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const SEV = {
    critical: { dot: '#dc2626', bg: '#fef2f2', text: '#dc2626', label: 'Critical' },
    warning:  { dot: '#d97706', bg: '#fffbeb', text: '#d97706', label: 'Warning' },
    ok:       { dot: '#27ae60', bg: '#f0fdf4', text: '#27ae60', label: 'OK' },
  }
  const RATING = {
    pass: { bg: '#f0fdf4', border: 'rgba(39,174,96,.2)', text: '#27ae60' },
    warn: { bg: '#fffbeb', border: 'rgba(217,119,6,.2)',  text: '#d97706' },
    fail: { bg: '#fef2f2', border: 'rgba(220,38,38,.2)',  text: '#dc2626' },
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
      {/* Header */}
      <div style={{ background: 'var(--g50)', borderBottom: '1px solid var(--border)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--g900)' }}>AI Diagnosis</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--g500)' }}>Powered by Claude · results via /api/diagnose (server-side)</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {status === 'done' && (
            <button className="btn-ghost" onClick={copyReport} style={{ fontSize: 12, padding: '6px 14px' }}>
              {copied ? '✓ Copied' : '📋 Copy Customer Report'}
            </button>
          )}
          <button className="btn-amber" onClick={run} disabled={status === 'loading'} style={{ fontSize: 13, padding: '8px 18px' }}>
            {status === 'loading' ? 'Analysing…' : status === 'done' ? 'Run Again' : 'Generate AI Diagnosis'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px', background: 'white' }}>
        {status === 'idle' && (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--g500)', fontFamily: 'var(--font-heading)', fontSize: 13, lineHeight: 1.7 }}>
            Click <strong style={{ color: 'var(--g700)' }}>Generate AI Diagnosis</strong> to get a plain-English summary,<br />
            prioritised fix list, and a customer-ready message in seconds.
          </div>
        )}

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--g500)', marginBottom: 12 }}>Analysing scan data…</div>
            <div style={{ height: 4, background: 'var(--g200)', borderRadius: 2, overflow: 'hidden', maxWidth: 280, margin: '0 auto' }}>
              <div style={{ height: '100%', width: '60%', background: 'var(--accent)', borderRadius: 2, animation: 'loading-bar 1.2s ease-in-out infinite' }} />
            </div>
            <style>{`@keyframes loading-bar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,.15)', borderRadius: 7, padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: 13 }}>
            <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>✗ Could not generate diagnosis</div>
            <div style={{ color: 'var(--g600)', fontSize: 12 }}>{errorMsg}</div>
            {errorMsg?.includes('ANTHROPIC_API_KEY') && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--g600)', background: 'var(--g50)', borderRadius: 5, padding: '8px 12px', border: '1px solid var(--border)' }}>
                <strong>Setup:</strong> Create <code style={{ fontFamily: 'var(--font-code)', background: 'var(--g200)', padding: '1px 5px', borderRadius: 3 }}>.env.local</code> and add <code style={{ fontFamily: 'var(--font-code)', background: 'var(--g200)', padding: '1px 5px', borderRadius: 3 }}>ANTHROPIC_API_KEY=sk-ant-...</code>. See <code style={{ fontFamily: 'var(--font-code)', background: 'var(--g200)', padding: '1px 5px', borderRadius: 3 }}>.env.local.example</code> in the project root.
              </div>
            )}
          </div>
        )}

        {status === 'done' && diagnosis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary */}
            <div style={{ background: 'var(--g50)', border: '1px solid var(--border)', borderRadius: 7, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 7 }}>Summary</div>
              <p style={{ fontSize: 14, color: 'var(--g700)', lineHeight: 1.7 }}>{diagnosis.summary}</p>
            </div>

            {/* Verdict */}
            {diagnosis.verdict && (() => {
              const rv = RATING[diagnosis.verdict.rating] || RATING.warn
              return (
                <div style={{ background: rv.bg, border: `1px solid ${rv.border}`, borderRadius: 7, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: rv.text }}>{diagnosis.verdict.decision}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, color: rv.text, opacity: .85, marginTop: 2 }}>{diagnosis.verdict.reason}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, color: rv.text, background: 'white', padding: '4px 12px', borderRadius: 20, border: `1px solid ${rv.border}`, fontWeight: 600 }}>
                    ⏱ {diagnosis.repairTime || 'See issues'}
                  </div>
                </div>
              )
            })()}

            {/* Priority issues */}
            {(diagnosis.issues || []).length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 9 }}>Priority Fix List</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {diagnosis.issues.map((issue, i) => {
                    const sev = SEV[issue.severity] || SEV.warning
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: sev.bg, border: `1px solid ${sev.dot}22`, borderRadius: 7, padding: '11px 13px' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: sev.dot, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 600, color: sev.text, marginBottom: 3 }}>{issue.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.5 }}>{issue.action}</div>
                          <div style={{ fontSize: 11, color: 'var(--g500)', marginTop: 4, fontFamily: 'var(--font-heading)' }}>Estimated: {issue.estimatedTime}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Customer message */}
            {diagnosis.customerMessage && (
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 7 }}>Customer Message</div>
                <div style={{ background: 'var(--g50)', border: '1px solid var(--border)', borderRadius: 7, padding: '13px 15px', fontSize: 13, color: 'var(--g600)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &quot;{diagnosis.customerMessage}&quot;
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--g400)', marginTop: 6 }}>
                  Use 📋 Copy Customer Report to get the full formatted report for WhatsApp/email.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div style={{ background: 'var(--g50)', minHeight: '100vh' }}>
      {/* Report header bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="breadcrumb">HackRore Report · v{R?.meta?.version || '?'}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 700, color: 'var(--g900)' }}>{sy.manufacturer} {sy.model}</div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--g500)', marginTop: 2 }}>
              {sy.serial} · {R?.meta?.scanTime} · Mode: {R?.meta?.scanMode?.toUpperCase()}
            </div>
          </div>
          <button className="btn-ghost" onClick={onBack}>← Upload New Report</button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '22px 24px' }}>
        {/* Score + issues row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 18 }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 22px', boxShadow: 'var(--shadow)' }}>
            <ScoreArc score={s.value} grade={s.grade} verdict={s.verdict} />
          </div>
          <div style={{ background: 'white', border: `1px solid ${critIssues.length > 0 ? 'rgba(220,38,38,.2)' : 'var(--border)'}`, borderRadius: 8, padding: '16px 18px', boxShadow: 'var(--shadow)', maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, color: critIssues.length > 0 ? 'var(--red)' : 'var(--g400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Critical Issues ({critIssues.length})</div>
            {critIssues.length === 0
              ? <div style={{ fontSize: 13, color: 'var(--green)', fontFamily: 'var(--font-heading)' }}>✓ No critical issues found</div>
              : critIssues.map((issue, i) => <div key={i} style={{ fontSize: 12, color: 'var(--red)', padding: '4px 0', borderBottom: '1px solid rgba(220,38,38,.1)', lineHeight: 1.5 }}>✗ {issue}</div>)
            }
          </div>
          <div style={{ background: 'white', border: `1px solid ${warnings.length > 0 ? 'rgba(217,119,6,.15)' : 'var(--border)'}`, borderRadius: 8, padding: '16px 18px', boxShadow: 'var(--shadow)', maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, color: warnings.length > 0 ? 'var(--yellow)' : 'var(--g400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Warnings ({warnings.length})</div>
            {warnings.length === 0
              ? <div style={{ fontSize: 13, color: 'var(--green)', fontFamily: 'var(--font-heading)' }}>✓ No warnings</div>
              : warnings.map((w, i) => <div key={i} style={{ fontSize: 12, color: 'var(--yellow)', padding: '3px 0', borderBottom: '1px solid rgba(217,119,6,.08)', lineHeight: 1.5 }}>⚠ {w}</div>)
            }
          </div>
        </div>

        {/* AI Diagnosis Panel */}
        <AIDiagnosisPanel report={R} />

        {/* Module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>

          <ModCard title="System Identity" accent="var(--blue)">
            <Row label="Model"        value={sy.model} />
            <Row label="Manufacturer" value={sy.manufacturer} />
            <Row label="Serial"       value={sy.serial} />
            <Row label="OS"           value={sy.osName} />
            <Row label="Build"        value={sy.osBuild} />
            <Row label="BIOS"         value={sy.biosVersion ? `${sy.biosVersion} (${sy.biosDate})` : null} />
            <Row label="Last Boot"    value={sy.lastBoot} />
            <Row label="Activation"   value={<Badge val={sy.activation} cls={sy.activation === 'Activated' ? 'pass' : 'fail'} />} />
          </ModCard>

          <ModCard title="Processor" accent="var(--yellow)">
            <Row label="Model"         value={cpu.name} />
            <Row label="Cores/Threads" value={cpu.cores != null ? `${cpu.cores}C / ${cpu.threads}T` : null} />
            <Row label="Max Speed"     value={cpu.maxSpeedMHz ? `${cpu.maxSpeedMHz} MHz` : null} />
            {cpu.loadPercent != null && <div style={{ marginTop: 8 }}><div className="label-tag">CPU Load</div><MiniBar value={cpu.loadPercent} /></div>}
            {cpu.tempCelsius != null && (
              <Row label="Temperature" value={
                <span style={{ color: cpu.tempCelsius > 90 ? 'var(--red)' : cpu.tempCelsius > 80 ? 'var(--yellow)' : 'var(--green)' }}>
                  {cpu.tempCelsius}°C
                </span>
              } />
            )}
          </ModCard>

          <ModCard title="Memory (RAM)" accent="var(--purple)">
            <Row label="Total"     value={ram.totalGB != null ? `${ram.totalGB} GB` : null} />
            <Row label="Available" value={ram.availableGB != null ? `${ram.availableGB} GB` : null} />
            <Row label="Slots"     value={ram.slots} />
            {ram.usedPercent != null && <div style={{ marginTop: 8 }}><div className="label-tag">Usage</div><MiniBar value={ram.usedPercent} /></div>}
            {(ram.modules || []).map((m, i) => (
              <div key={i} style={{ marginTop: 8, padding: '8px 10px', background: 'var(--g50)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--g500)', marginBottom: 3 }}>{m.slot}</div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--g800)' }}>{m.capacityGB}GB {m.type} @ {m.speedMHz} MHz</div>
              </div>
            ))}
          </ModCard>

          {(R?.storage?.disks || []).map((disk, i) => {
            const sa = disk?.smartAttributes || {}
            return (
              <ModCard key={i} title={`Storage ${i + 1}`} accent={disk.smartOK === false ? 'var(--red)' : 'var(--green)'}>
                <Row label="Model"  value={disk.model} />
                <Row label="Type"   value={disk.storageType || disk.interface} />
                <Row label="Size"   value={disk.sizeGB != null ? `${disk.sizeGB} GB` : null} />
                <Row label="SMART"  value={<Badge val={disk.smartStatus} cls={disk.smartOK === false ? 'fail' : disk.smartOK === true ? 'pass' : 'warn'} />} />
                {sa.powerOnHours && <Row label="Power-On" value={`${sa.powerOnHours}h`} />}
                {sa.reallocatedSectors > 0 && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>✗ Reallocated sectors: {sa.reallocatedSectors}</div>}
                {sa.pendingSectors > 0 && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>✗ Pending sectors: {sa.pendingSectors}</div>}
              </ModCard>
            )
          })}

          {bat && (
            <ModCard title="Battery" accent={bat.wearPercent > 40 ? 'var(--red)' : bat.wearPercent > 25 ? 'var(--yellow)' : 'var(--green)'}>
              <Row label="Status"  value={bat.statusText} />
              <Row label="Charge"  value={bat.chargePercent != null ? `${bat.chargePercent}%` : null} />
              <Row label="Voltage" value={bat.voltage != null ? `${bat.voltage} V` : null} />
              <Row label="Cycles"  value={bat.cycleCount || bat.cycleSource} />
              {bat.wearPercent != null && (
                <div style={{ marginTop: 8 }}>
                  <div className="label-tag">Wear % (0 = new)</div>
                  <MiniBar value={bat.wearPercent} color={bat.wearPercent > 40 ? 'var(--red)' : bat.wearPercent > 25 ? 'var(--yellow)' : 'var(--green)'} />
                </div>
              )}
            </ModCard>
          )}

          {(R?.gpu || []).map((g, i) => (
            <ModCard key={i} title={`GPU ${i + 1}`} accent="var(--blue)">
              <Row label="Name"        value={g.name} />
              <Row label="VRAM"        value={g.vramMB != null ? `${g.vramMB} MB` : null} />
              <Row label="Driver"      value={g.driverVersion} />
              <Row label="Status"      value={<Badge val={g.errorCode === 0 ? 'OK' : `Error ${g.errorCode}`} cls={g.errorCode === 0 ? 'pass' : 'fail'} />} />
            </ModCard>
          ))}

          {R?.thermal && (
            <ModCard title="Thermal" accent={R.thermal.throttlingDetected ? 'var(--red)' : 'var(--green)'}>
              <Row label="Throttling" value={<Badge val={R.thermal.throttlingDetected ? 'DETECTED' : 'NONE'} cls={R.thermal.throttlingDetected ? 'fail' : 'pass'} />} />
              {(R.thermal.thermalZones || []).map((z, i) => (
                <Row key={i} label={`Zone ${i + 1}`} value={<span style={{ color: z.tempC > 90 ? 'var(--red)' : z.tempC > 80 ? 'var(--yellow)' : 'var(--green)' }}>{z.tempC}°C</span>} />
              ))}
            </ModCard>
          )}

          {R?.network && (
            <ModCard title="Network" accent="var(--cyan)">
              <Row label="IPv4" value={R.network.ipv4} />
              <Row label="DNS"  value={R.network.dns} />
              {(R.network.adapters || []).filter(a => a.enabled).map((a, i) => (
                <Row key={i} label={a.name} value={a.speed || 'N/A'} />
              ))}
            </ModCard>
          )}

          {R?.bluetooth && (
            <ModCard title="Bluetooth" accent="var(--blue)">
              <Row label="Adapter" value={<Badge val={R.bluetooth.adapterName || 'Not Found'} cls={R.bluetooth.adapterFound ? 'pass' : 'fail'} />} />
              <Row label="Status"  value={R.bluetooth.adapterStatus} />
              <Row label="Paired"  value={R.bluetooth.pairedDevices?.length ?? null} />
            </ModCard>
          )}

          {devErrors.length > 0 && (
            <ModCard title={`Device Errors (${devErrors.length})`} accent="var(--red)">
              {devErrors.map((d, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(220,38,38,.1)' }}>
                  <div style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-heading)' }}>✗ {d.name} [Code {d.code}]</div>
                  {d.suggestedFix && <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 3, lineHeight: 1.5 }}>↳ {d.suggestedFix}</div>}
                </div>
              ))}
            </ModCard>
          )}

          {(R?.eventLog?.critical || []).length > 0 && (
            <ModCard title={`Critical Events (${R.eventLog.critical.length})`} accent="var(--red)">
              {R.eventLog.critical.map((e, i) => (
                <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid rgba(220,38,38,.08)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--g400)' }}>{e.time}</span>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--red)' }}>ID {e.eventId}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--g600)', lineHeight: 1.5 }}>{e.message}</div>
                  {e.resolution && <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 3 }}>↳ {e.resolution}</div>}
                </div>
              ))}
            </ModCard>
          )}

          {R?.startup && (
            <ModCard title="Startup Items" accent={R.startup.count > 20 ? 'var(--yellow)' : 'var(--green)'}>
              <Row label="Total" value={R.startup.count} />
              {(R.startup.items || []).slice(0, 8).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--g600)' }}>{item.name}</span>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--g400)' }}>{item.location}</span>
                </div>
              ))}
              {R.startup.count > 8 && <div style={{ fontSize: 11, color: 'var(--g500)', marginTop: 6 }}>+{R.startup.count - 8} more</div>}
            </ModCard>
          )}

          {R?.refurbCertificate && (
            <ModCard title="Refurb Certificate" accent="var(--green)">
              <Row label="Date"       value={R.refurbCertificate.certDate} />
              <Row label="Technician" value={R.refurbCertificate.technician} />
              <Row label="Machine"    value={R.refurbCertificate.machine} />
              <Row label="Verdict"    value={<Badge val={R.refurbCertificate.verdict} cls={R.refurbCertificate.verdict === 'PASS' ? 'pass' : R.refurbCertificate.verdict === 'FAIL' ? 'fail' : 'warn'} />} />
              {R.refurbCertificate.recommendation && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#e6f9ee', border: '1px solid rgba(39,174,96,.2)', borderRadius: 6, fontSize: 12, color: 'var(--green)', lineHeight: 1.6 }}>
                  {R.refurbCertificate.recommendation}
                </div>
              )}
            </ModCard>
          )}

        </div>
      </div>
    </div>
  )
}

/* ── Page root ───────────────────────────────── */
export default function ScanLab() {
  const [report, setReport] = useState(null)
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <ReportErrorBoundary>
          {report
            ? <Dashboard report={report} onBack={() => setReport(null)} />
            : <UploadScreen onLoad={setReport} />
          }
        </ReportErrorBoundary>
      </main>
    </div>
  )
}
