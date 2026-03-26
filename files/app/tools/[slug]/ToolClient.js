'use client'
import Sidebar from '../../../components/Sidebar'
import Link from 'next/link'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import { getSimilarTools, getRelatedGuides } from '../../../lib/engine/searchEngine'

// Dynamic component mapping
import KeyboardTest from '../../../components/testlab/KeyboardTest'
import ScreenTest from '../../../components/testlab/ScreenTest'
import WebcamTest from '../../../components/testlab/WebcamTest'
import MicTest from '../../../components/testlab/MicTest'
import SpeakerTest from '../../../components/testlab/SpeakerTest'
import MouseTest from '../../../components/testlab/MouseTest'
import TouchTest from '../../../components/testlab/TouchTest'
import { ArrowRight, Sparkles } from 'lucide-react'

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

  // Merge manual and auto-suggested guides
  const allGuides = [...new Set([...relatedGuides, ...autoRelatedGuides])]

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Breadcrumbs paths={[
          { label: 'Tools', href: '/tools' },
          { label: tool.category, href: `/category/${tool.category.toLowerCase().replace(/ /g, '-')}` },
          { label: tool.name, href: `/tools/${tool.slug}` }
        ]} />

        <div className="page-header">
          <div className="breadcrumb" style={{ display: 'none' }}>Tools / {tool.category}</div>
          <h1>{tool.icon} {tool.name}</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 8 }}>{tool.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
          {/* Main Test Area */}
          <div className="card">
            {TestComponent ? (
              <TestComponent onResult={(res) => console.log(`${tool.name} result:`, res)} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)' }}>
                <p>Diagnostic engine for "{tool.name}" is being initialized...</p>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card-flat">
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16 }}>Tool Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Difficulty</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{tool.difficulty}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {tool.tags.map(tag => (
                      <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className="tag" style={{ textDecoration: 'none' }}>{tag}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {allGuides.length > 0 && (
              <div className="card-flat">
                <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
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

            {similarTools.length > 0 && (
              <div className="card-flat" style={{ background: 'var(--bg-2)' }}>
                <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 12 }}>Similar Tools</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {similarTools.map(t => (
                    <Link key={t.id} href={`/tools/${t.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '8px 12px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
