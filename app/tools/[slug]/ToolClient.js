'use client'
import Link from 'next/link'
import { getSimilarTools, getRelatedGuides } from '../../../lib/engine/searchEngine'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Dynamic component mapping
import KeyboardTest from '../../../components/tests/KeyboardTest'
import ScreenTest from '../../../components/tests/ScreenTest'
import WebcamTest from '../../../components/tests/WebcamTest'
import MicTest from '../../../components/tests/MicTest'
import SpeakerTest from '../../../components/tests/SpeakerTest'
import MouseTest from '../../../components/tests/MouseTest'
import TouchTest from '../../../components/tests/TouchTest'
import BatteryTest from '../../../components/tests/BatteryTest'
import GpuStressTest from '../../../components/tests/GpuStressTest'
import { 
  ArrowRight, Sparkles, Download, History, Shield, Info, 
  Activity, Cpu, Layout, Terminal, Zap, Copy, 
  ChevronLeft, ChevronRight, Clock, Star, BookOpen
} from 'lucide-react'
import tools from '../../../data/tools.json'

const COMPONENT_MAP = {
  keyboard: KeyboardTest,
  screen: ScreenTest,
  webcam: WebcamTest,
  mic: MicTest,
  speaker: SpeakerTest,
  mouse: MouseTest,
  touch: TouchTest,
  battery: BatteryTest,
  gpu: GpuStressTest
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
  const router = useRouter()
  const TestComponent = COMPONENT_MAP[tool.id]
  const similarTools = getSimilarTools(tool.id)
  const autoRelatedGuides = getRelatedGuides(tool.tags)
  const allGuides = [...new Set([...relatedGuides, ...autoRelatedGuides])]
  
  const [lastResult, setLastResult] = useState(null)
  const [results, setResults] = useState({})
  
  // Session Cycling Logic
  const currentIndex = tools.findIndex(t => t.id === tool.id)
  const prevTool = tools[currentIndex - 1] || tools[tools.length - 1]
  const nextTool = tools[currentIndex + 1] || tools[0]

  // fix(11B): Diagnostic Keyboard Shortcuts
  useEffect(() => {
    const handleShortcuts = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return

      // 'R' for Reset
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        setLastResult(null)
        localStorage.removeItem(`hackrore_result_${tool.id}`)
      }

      // '1'-'8' for Quick Navigate
      const num = parseInt(e.key)
      if (num >= 1 && num <= tools.length) {
        e.preventDefault()
        router.push(`/tools/${tools[num-1].slug}`)
      }
    }

    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [tool.id, router])

  useEffect(() => {
    const sessionRes = {}
    tools.forEach(t => {
      const res = localStorage.getItem(`hackrore_result_${t.id}`)
      if (res) sessionRes[t.id] = res
    })
    setResults(sessionRes)
    if (sessionRes[tool.id]) setLastResult(sessionRes[tool.id])
    else setLastResult(null)
  }, [tool.id])

  const handleResult = (res) => {
    setLastResult(res)
    setResults(prev => ({ ...prev, [tool.id]: res }))
    localStorage.setItem(`hackrore_result_${tool.id}`, res)
  }

  const exportResult = () => {
    const data = {
      engineer: 'HYNET_TECH_GEN_01',
      session_id: `HNT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      results: results,
      active_tool: tool.name
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Hachtool_Report_${tool.id}.json`
    a.click()
  }

  return (
    <div className="dashboard-layout animate-in" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px' }}>
      
      {/* Left Column: Handled by AppLayout wrap */}
      
      {/* Middle Column: thetest.com Style Test Interface */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Module Header Audit (GFG Style) */}
        <div style={{ borderBottom: '1px solid #EEE', paddingBottom: 24 }}>
           <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1.5, marginBottom: 8 }}>TESTLAB // SYSTEM_VALIDATION</div>
           <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 12 }}>{tool.name}</h2>
           <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#F0F7F1', borderRadius: 50, border: '1px solid #D5E8D9' }}>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></div>
                 <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>MODULE_ONLINE_READY</span>
              </div>
           </div>
        </div>

        {/* Diagnostic Frame: thetest.com UX */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: 520, display: 'flex', flexDirection: 'column', background: '#FFF' }}>
           <div style={{ flex: 1, padding: '64px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {TestComponent ? (
                <div style={{ width: '100%', maxWidth: 800 }}>
                   <TestComponent onResult={handleResult} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                   <Activity size={48} style={{ color: 'var(--accent)', opacity: 0.2, animation: 'hr-pulse 2s infinite' }} />
                   <p style={{ color: '#999', fontSize: 15, fontWeight: 700 }}>Initializing Sandbox...</p>
                </div>
              )}
           </div>

           {/* In-Frame Status Bar (fix 13C) */}
           <div style={{ padding: '24px 48px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 32 }}>
                 <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>ELAPSED</div>
                    <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>00:42.12</div>
                 </div>
                 <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>PLATFORM</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>WIN_64_PRO</div>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                 <button className="btn-outline" onClick={() => handleResult(null)} style={{ padding: '8px 16px', fontSize: 11 }}>Restart</button>
                 <button className="btn-primary" style={{ padding: '8px 24px', fontSize: 11 }}>Next Test</button>
              </div>
           </div>
        </div>

        {lastResult && (
          <div className="card animate-in" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            background: lastResult === 'pass' ? '#F0F7F1' : '#FFF5F5', padding: 40, 
            border: `1px solid ${lastResult === 'pass' ? '#D5E8D9' : '#FED7D7'}`,
            borderLeft: `8px solid ${lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-fail)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div style={{ width: 56, height: 56, background: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                 <History size={24} style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-fail)' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>VALIDATION_SUITE_RESULT</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#222' }}>
                   TECHNICAL STATUS: <span style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-fail)', textTransform: 'uppercase' }}>{lastResult}</span>
                </div>
              </div>
            </div>
            <button onClick={exportResult} className="btn-primary" style={{ padding: '16px 32px' }}>
               Download Technical Certificate
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Dynamic Telemetry (fix 13C) handled by AppLayout wrap */}

      {/* Mobile Footer Toggle (Manual Logic) */}
      <div className="mobile-only" style={{ position: 'fixed', bottom: 100, right: 24, zIndex: 1000 }}>
         <Link href={`/tools/${nextTool.slug}`} className="btn-primary" style={{ height: 50, borderRadius: 50, width: 50, padding: 0 }}>
            <ChevronRight />
         </Link>
      </div>

    </div>
  )
}
