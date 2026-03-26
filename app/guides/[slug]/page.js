import guides from '../../../data/guides.json'
import LinkEngine from '../../../lib/engine/linkEngine'
import { getRelatedGuides, getSimilarTools } from '../../../lib/engine/searchEngine'
import Sidebar from '../../../components/Sidebar'
import Link from 'next/link'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import { BookOpen, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }))
}

export default function GuidePage({ params }) {
  const { slug } = params
  const guide = LinkEngine.getGuideBySlug(slug)
  
  if (!guide) {
    notFound()
  }

  const manualRelatedTools = LinkEngine.getRelatedToolsForGuide(guide.id)
  const autoRelatedTools = getSimilarTools(manualRelatedTools[0]?.id || 'keyboard') // Fallback or logic
  const relatedGuides = getRelatedGuides(guide.tags).filter(g => g.id !== guide.id)

  const allTools = [...new Set([...manualRelatedTools, ...autoRelatedTools])].slice(0, 5)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Breadcrumbs paths={[
          { label: 'FixLab', href: '/fixlab' },
          { label: guide.category, href: `/category/${guide.category.toLowerCase().replace(/ /g, '-')}` },
          { label: guide.title, href: `/guides/${guide.slug}` }
        ]} />

        <div className="page-header">
          <div className="breadcrumb" style={{ display: 'none' }}>Guides / {guide.category}</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen size={32} className="text-blue-600" />
            {guide.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {guide.tags.map(tag => (
              <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className="tag" style={{ textDecoration: 'none' }}>{tag}</Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
          {/* Guide Content */}
          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Troubleshooting Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { step: '1', title: 'Initial Inspection', desc: 'Check all physical connections and identify visible symptoms.' },
                { step: '2', title: 'Diagnostic Verification', desc: 'Use the recommended tools to isolate the hardware fault.' },
                { step: '3', title: 'Software Reset', desc: 'Attempt a BIOS reset or driver reinstallation if hardware passes.' },
                { step: '4', title: 'Component Replacement', desc: 'If the failure persists, consider replacing the affected module.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                    <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40, padding: 20, background: 'var(--bg)', borderRadius: 8, borderLeft: '4px solid var(--blue-600)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: 'var(--blue-800)' }}>Pro Technician Tip</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                Always perform a "Hard Reset" (disconnect battery/AC and hold power for 30s) before opening the chassis for deeper inspection.
              </p>
            </div>
          </div>

          {/* Sidebar: Recommended Tools & Related content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card-flat" style={{ borderTop: '4px solid var(--green)' }}>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} className="text-green-600" />
                Required Tools
              </h3>
              {allTools.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allTools.map(tool => (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="test-card" style={{ padding: '12px 16px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{tool.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{tool.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{tool.category}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-4)' }}>General visual inspection recommended.</p>
              )}
            </div>

            {relatedGuides.length > 0 && (
              <div className="card-flat">
                <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={14} className="text-blue-600" />
                  Similar Guides
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {relatedGuides.map(rg => (
                    <Link key={rg.id} href={`/guides/${rg.slug}`} style={{ fontSize: 13, color: 'var(--blue-600)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {rg.title}
                      <ArrowRight size={12} style={{ opacity: 0.5 }} />
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
