'use client'
import Link from 'next/link'
import { getSimilarTools, getRelatedGuides } from '../../../lib/engine/searchEngine'
import { useState, useEffect } from 'react'

// Dynamic component mapping
import KeyboardTest from '../../../components/testlab/KeyboardTest'
import ScreenTest from '../../../components/testlab/ScreenTest'
import WebcamTest from '../../../components/testlab/WebcamTest'
import MicTest from '../../../components/testlab/MicTest'
import SpeakerTest from '../../../components/testlab/SpeakerTest'
import MouseTest from '../../../components/testlab/MouseTest'
import TouchTest from '../../../components/testlab/TouchTest'
import { ArrowRight, Sparkles, Download, History, Shield, Info, Activity, Cpu, Layout, Terminal, Zap } from 'lucide-react'

const COMPONENT_MAP = {
  keyboard: KeyboardTest,
  screen: ScreenTest,
  webcam: WebcamTest,
  mic: MicTest,
  speaker: SpeakerTest,
  mouse: MouseTest,
  touch: TouchTest
}

const TECH_NOTES = {
  keyboard: "Audit measures millisecond bus latency. High latency (>20ms) indicates thermal-throttling on the I/O chip or driver-level buffer bloating. NKRO tracking verifies controller anti-ghosting limits.",
  screen: "Calibration suite uses deterministic RGB patterns to identify sub-pixel artifacts. Use the Gamma 2.2 chart for professional color correction. Refresh rate (Hz) detection validates GPU-to-Panel synchronization.",
  mouse: "Polling rate analysis measures hardware report frequency. Inconsistent Hz readings (e.g., 1000Hz dipping to 300Hz) indicate USB-bus congestion or faulty sensor polling. Double-click fault detector identifies contact wear.",
  mic: "FFT (Fast Fourier Transform) analysis breaks signal into 512 frequency points. Peak-shaving VU meter identifies digital clipping. Consistent noise floors below -60dB indicate high-quality shielding.",
  speaker: "Sine-wave oscillator sweep (20Hz-20kHz) identifies physical driver distortion. Phase-alignment simulation verifies stereo parity. Rattling during low-frequency sweeps indicates loose hardware mountings.",
  webcam: "Verify optics for chromatic aberration using high-contrast targets. Low FPS in high-light environments indicates driver-level encoding bottlenecks or USB 2.0 bandwidth limitations.",
  touch: "Coordinate delta analysis measures digitizer accuracy. Multi-touch ghosting test identifies controller-level signal interference or surface contamination logic."
}

export default function ToolClient({ tool, relatedGuides }) {
  const TestComponent = COMPONENT_MAP[tool.id]
  const similarTools = getSimilarTools(tool.id)
  const autoRelatedGuides = getRelatedGuides(tool.tags)
  const allGuides = [...new Set([...relatedGuides, ...autoRelatedGuides])]
  
  const [lastResult, setLastResult] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(`hackrore_result_${tool.id}`)
    if (saved) setLastResult(saved)
  }, [tool.id])

  const handleResult = (res) => {
    setLastResult(res)
    localStorage.setItem(`hackrore_result_${tool.id}`, res)
  }

  const exportResult = () => {
    const data = {
      tool: tool.name,
      id: tool.id,
      result: lastResult,
      timestamp: new Date().toISOString(),
      kernel: 'v.2.0.1-elite-diag'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HackRore_${tool.id}_Protocol.json`
    a.click()
  }

  return (
    <div className="dashboard-layout animate-in">
      
      {/* Target Module: Test Interface */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Module Header Audit */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
           <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>{tool.name}</h2>
           <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></div>
                 <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5 }}>MODULE_ACTIVE</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5 }}>SYNC_STATUS: <span style={{ color: 'var(--status-pass)' }}>READY</span></div>
           </div>
        </div>

        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden', minHeight: 480, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
           {/* Internal Header */}
           <div style={{ padding: '20px 32px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <Terminal size={16} style={{ color: 'var(--accent)' }} />
                 <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: 2 }}>DIAGNOSTIC_SHELL_V2</span>
              </div>
              <div className="badge badge-ready" style={{ fontSize: 9 }}>PRO_AUDIT_MODE</div>
           </div>

           <div style={{ flex: 1, padding: '48px 32px' }}>
              {TestComponent ? (
                <TestComponent onResult={handleResult} />
              ) : (
                <div style={{ padding: 80, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                   <Activity size={48} style={{ color: 'var(--accent)', opacity: 0.3, animation: 'aura-pulse 2s infinite' }} />
                   <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 800 }}>Initializing diagnostic environment...</p>
                </div>
              )}
           </div>
        </div>

        {lastResult && (
          <div className="card-elevated" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            background: 'var(--bg-secondary)', padding: 32, borderLeft: `8px solid ${lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 44, height: 44, background: 'var(--bg-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                 <History size={20} style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>VALIDATION_PROTOCOL_RESULT</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>
                   STATUS: <span style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)', textTransform: 'uppercase' }}>{lastResult}</span>
                </div>
              </div>
            </div>
            <button onClick={exportResult} className="btn-accent" style={{ background: 'var(--accent)', color: 'var(--bg-primary)', fontWeight: 900, height: 50, padding: '0 32px', fontSize: 12 }}>
               DOWNLOAD_HARDWARE_PROTOCOL
            </button>
          </div>
        )}
      </div>

      {/* Persistence Panel: Technician's Metadata & Insights */}
      <aside className="sidebar-panel">
        
        {/* Hardware Insights Card */}
        <div className="card-elevated shadow-glow" style={{ padding: 32, background: 'var(--bg-elevated)', border: '1px solid var(--accent-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
             <Cpu size={18} style={{ color: 'var(--accent)' }} />
             <h3 style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 13 }}>Technician Insights</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
             {TECH_NOTES[tool.id] || "Standard hardware validation protocol active. Monitor for inconsistent bus timing and signal noise."}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Subsystem Path</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent)' }}>/hardware/peripheral/{tool.id}</div>
             </div>
             <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Audit Complexity</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>{tool.difficulty?.toUpperCase() || 'INDUSTRIAL'}</div>
             </div>
          </div>
        </div>

        {allGuides.length > 0 && (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
               <Zap size={16} style={{ color: 'var(--text-muted)' }} />
               <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Relevant Field Guides</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allGuides.slice(0, 3).map(guide => (
                <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ 
                  fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', 
                  justifyContent: 'space-between', padding: '16px', color: 'var(--text-secondary)',
                  background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)',
                  transition: 'all 0.2s'
                }} className="hover:border-accent">
                   <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{guide.title}</span>
                   <ArrowRight size={14} style={{ opacity: 0.4 }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="card-elevated" style={{ padding: 24, borderLeft: '4px solid var(--status-pass)', background: 'var(--bg-secondary)' }}>
           <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Shield size={18} style={{ color: 'var(--status-pass)' }} />
              <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-primary)' }}>PROTOCOL_ACTIVE: 100% SECURE</div>
           </div>
        </div>

      </aside>

    </div>
  )
}
