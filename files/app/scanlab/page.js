'use client'
import { useState, useRef, Component } from "react"
import Navbar from "../../components/Navbar"

// ReportErrorBoundary class
class ReportErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "32px 24px", maxWidth: 600 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--red)", letterSpacing: "2px", marginBottom: 12 }}>RENDER ERROR</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Could not display this report section</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--surface-4)", padding: "12px 14px", borderRadius: 2, marginBottom: 16 }}>
            {this.state.error?.message || "Unknown error"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
            The JSON report may have an unexpected structure. Try re-running HackRore_Master.ps1 to generate a fresh report.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Helpers
function Badge({ val, cls }) {
  if (!val) return null
  return <span className={`badge badge-${cls}`}>{val}</span>
}
function Row({ label, value }) {
  if (value === undefined || value === null) return null
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid var(--surface-3)", gap: 12 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-primary)", textAlign: "right", wordBreak: "break-word" }}>{value}</span>
    </div>
  )
}
function MiniBar({ value, max = 100, color }) {
  const safe = isNaN(value) ? 0 : Math.min(100, Math.max(0, Number(value)))
  const c = color || (safe > 85 ? '#ef4444' : safe > 65 ? '#f59e0b' : '#10b981')
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>{Math.round(safe)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${safe}%`, background: c }} />
      </div>
    </div>
  )
}
function ModCard({ title, children, accent }) {
  return (
    <div style={{ background: "var(--surface-2)", border: `1px solid ${accent ? `${accent}22` : "var(--surface-3)"}`, borderRadius: 2, padding: "16px 18px", breakInside: "avoid" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", color: accent || "var(--text-muted)", marginBottom: 14, borderBottom: `1px solid ${accent ? `${accent}22` : "var(--surface-3)"}`, paddingBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ScoreArc
function ScoreArc({ score, grade, verdict }) {
  const s = isNaN(score) ? 0 : Math.min(100, Math.max(0, Number(score)))
  const col = s >= 85 ? '#10b981' : s >= 65 ? '#f59e0b' : '#ef4444'
  const r = 54, cx = 70, cy = 70, stroke = 8
  const circ = 2 * Math.PI * r
  const arc  = circ * 0.75
  const dash = (s / 100) * arc
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-4)" strokeWidth={stroke} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} style={{ filter: `drop-shadow(0 0 6px ${col}66)`, transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 6 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 700, color: col, lineHeight: 1 }}>{s}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>/ 100</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: col, marginTop: 4 }}>{grade}</div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "2px", marginBottom: 8 }}>VERDICT</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: col }}>{verdict}</div>
      </div>
    </div>
  )
}

// UploadScreen
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
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--cyan)", letterSpacing: "2px", marginBottom: 16 }}>[02] SCANLAB</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>System Diagnostics</h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-muted)", marginBottom: 40, lineHeight: 1.7 }}>
        Run <code style={{ fontFamily: "var(--font-mono)", color: "var(--amber)", fontSize: 12 }}>HackRore_Master.ps1</code> on the target Windows machine, then upload the generated JSON report here.
      </p>

      <div
        onDrop={(e) => { e.preventDefault(); setDrag(false); loadJSON(e.dataTransfer.files[0]) }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onClick={() => !loading && inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? "var(--cyan)" : "var(--surface-5)"}`, borderRadius: 2, padding: '48px 24px', textAlign: 'center', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s', background: dragging ? 'rgba(6,182,212,0.05)' : 'var(--surface-1)' }}
      >
        {loading ? (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, color: "var(--cyan)", marginBottom: 12, animation: 'pulseAmber 1s infinite' }}>⟳</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "1px" }}>PARSING REPORT…</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, color: "var(--surface-5)", marginBottom: 12 }}>▲</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Drop HackRore JSON here</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>or click to browse · HackRore_YYYYMMDD_HHmmss.json</div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => loadJSON(e.target.files[0])} />
      </div>

      {error && (
        <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--red)", background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: "10px 14px", borderRadius: 1 }}>
          ✗ {error}
        </div>
      )}

      <div style={{ marginTop: 32, background: 'var(--surface-2)', border: '1px solid var(--surface-4)', borderRadius: 2, padding: "18px 20px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "2px", marginBottom: 12 }}>HOW TO GENERATE A REPORT</div>
        {['# Run as Administrator in PowerShell:', 'cd C:\\HackRore', '.\\HackRore_Master.ps1', '', '# Refurbishment mode:', '.\\HackRore_Master.ps1 -Mode refurb', '', '# Report saved to: Reports\\HackRore_*.json'].map((line, i) => (
          <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: line.startsWith('#') ? '#3a3a3a' : '#aaa', lineHeight: 1.8 }}>{line || '\u00a0'}</div>
        ))}
      </div>
    </div>
  )
}

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
