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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          {TestComponent ? (
            <TestComponent onResult={handleResult} />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)' }}>
              <p>Diagnostic engine for "{tool.name}" is being initialized...</p>
            </div>
          )}
        </div>

        {lastResult && (
          <div className="card-flat" style={{ background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <History size={16} className="text-blue-600" />
              <div style={{ fontSize: 13 }}>
                Last validation: <span style={{ fontWeight: 700, color: lastResult === 'pass' ? 'var(--green)' : 'var(--yellow)' }}>{lastResult.toUpperCase()}</span>
              </div>
            </div>
            <button onClick={exportResult} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} />
              Export Result
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card-flat">
          <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16 }}>Tool Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Difficulty</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{tool.difficulty}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {tool.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {allGuides.length > 0 && (
          <div className="card-flat">
            <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={14} className="text-blue-600" />
              Related Guides
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allGuides.map(guide => (
                <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ fontSize: 13, color: 'var(--blue-600)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {guide.title}
                  <ArrowRight size={12} style={{ opacity: 0.5 }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
