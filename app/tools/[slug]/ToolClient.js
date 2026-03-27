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
import { ArrowRight, Sparkles, Download, History } from 'lucide-react'

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
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HackRore_${tool.id}_Result.json`
    a.click()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
      {/* Main Test Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
          {TestComponent ? (
            <TestComponent onResult={handleResult} />
          ) : (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <div className="badge badge-running" style={{ marginBottom: 16 }}>Initializing Engine</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Preparing precision diagnostic environment for &quot;{tool.name}&quot;...</p>
            </div>
          )}
        </div>

        {lastResult && (
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', borderColor: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <History size={16} style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)' }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                Validated Telemetry: <span style={{ color: lastResult === 'pass' ? 'var(--status-pass)' : 'var(--status-warn)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{lastResult}</span>
              </div>
            </div>
            <button onClick={exportResult} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={14} /> Export Protocol
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 24, fontWeight: 800 }}>Component Metadata</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Complexity</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.difficulty}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Capability Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tool.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {allGuides.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              FixLab Intelligence
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allGuides.map(guide => (
                <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  {guide.title}
                  <ArrowRight size={12} style={{ opacity: 0.6 }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
