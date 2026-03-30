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
import { ArrowRight, Sparkles, Download, History, Shield, Info, Activity } from 'lucide-react'

const COMPONENT_MAP = {
  keyboard: KeyboardTest,
  screen: ScreenTest,
  webcam: WebcamTest,
  mic: MicTest,
  speaker: SpeakerTest,
  mouse: MouseTest,
  touch: TouchTest
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
      kernel: 'v.2.0.1-elite'
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
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
           {/* Module Internal Header */}
           <div style={{ padding: '16px 24px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
                 <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                   MODULE_ACTIVE // {tool.id.toUpperCase()}
                 </span>
              </div>
              <div className="badge badge-ready" style={{ fontSize: 9 }}>REALTIME_SYNC</div>
           </div>

           <div style={{ flex: 1, position: 'relative' }}>
              {TestComponent ? (
                <TestComponent onResult={handleResult} />
              ) : (
                <div style={{ padding: 80, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                   <Activity size={48} style={{ color: 'var(--accent)', opacity: 0.3, animation: 'aura-pulse 2s infinite' }} />
                   <div>
                      <div className="badge badge-ready" style={{ marginBottom: 12 }}>Kernel_Init...</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Initializing diagnostic environment for individual module...</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {lastResult && (
          <div className="card glow-border" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            background: 'var(--bg-secondary)', padding: '24px 32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, background: 'var(--bg-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                 <History size={18} style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1 }}>MODULE_TELEMETRY</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                  State: <span style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)', textTransform: 'uppercase' }}>{lastResult}</span>
                </div>
              </div>
            </div>
            <button onClick={exportResult} className="btn-accent" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', height: 44, padding: '0 20px', fontSize: 11 }}>
              <Download size={14} /> EXPORT_PROTOCOL
            </button>
          </div>
        )}
      </div>

      {/* Persistence Panel: Metadata & Intelligence */}
      <aside className="sidebar-panel">
        
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ marginBottom: 24 }}>Subsystem Metadata</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 16, background: 'var(--bg-primary)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Logic Complexity</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent)' }}>{tool.difficulty?.toUpperCase() || 'STANDARD'}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Capabilities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tool.tags.map(tag => (
                  <span key={tag} className="badge" style={{ fontSize: 9, padding: '4px 10px', background: 'var(--bg-elevated)' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {allGuides.length > 0 && (
          <div className="card-elevated" style={{ padding: 32, borderTop: '4px solid var(--status-info)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
               <Sparkles size={18} style={{ color: 'var(--status-info)' }} />
               <h3 style={{ color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 'normal', fontSize: 16, fontWeight: 900 }}>FixLab Sync</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allGuides.slice(0, 3).map(guide => (
                <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ 
                  fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', 
                  justifyContent: 'space-between', padding: '16px', color: 'var(--text-secondary)',
                  background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)',
                  transition: 'all 0.2s'
                }} className="hover:border-accent">
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 10, color: 'var(--status-info)', fontWeight: 900, letterSpacing: 1 }}>GUIDE //</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{guide.title}</span>
                   </div>
                   <ArrowRight size={14} style={{ opacity: 0.4 }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--border-bright)' }}>
           <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Info size={18} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>SESSION_ID // 8X-92K-LL</div>
           </div>
        </div>
      </aside>

    </div>
  )
}
