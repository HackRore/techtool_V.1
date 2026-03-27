import guides from '../../../data/guides.json'
import * as LinkEngine from '../../../lib/engine/linkEngine'
import { getRelatedGuides, getSimilarTools } from '../../../lib/engine/searchEngine'
import AppLayout from '../../../components/layout/AppLayout'
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
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Breadcrumbs paths={[
          { label: 'FixLab', href: '/fixlab' },
          { label: guide.category, href: `/category/${guide.category.toLowerCase().replace(/ /g, '-')}` },
          { label: guide.title, href: `/guides/${guide.slug}` }
        ]} />

        <div className="page-header" style={{ marginBottom: 40, marginTop: 24 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, border: '1px solid var(--accent)' }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-elevated" style={{ marginTop: 40, borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: 'var(--accent)' }}>Pro Technician Tip</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Always perform a &quot;Hard Reset&quot; (disconnect battery/AC and hold power for 30s) before opening the chassis for deeper inspection.
              </p>
            </div>
          </div>

          {/* Sidebar: Recommended Tools & Related content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card-flat" style={{ borderTop: '4px solid var(--accent)' }}>
              <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                <CheckCircle size={14} style={{ color: 'var(--accent)' }} />
                Required Tools
              </h3>
              {allTools.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allTools.map(tool => (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="card-elevated" style={{ padding: '12px 16px', cursor: 'pointer', background: 'var(--bg-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{tool.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{tool.category}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>General visual inspection recommended.</p>
              )}
            </div>

            {relatedGuides.length > 0 && (
              <div className="card-elevated">
                <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                  <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                  Similar Guides
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {relatedGuides.map(rg => (
                    <Link key={rg.id} href={`/guides/${rg.slug}`} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {rg.title}
                      <ArrowRight size={12} style={{ opacity: 0.5 }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
