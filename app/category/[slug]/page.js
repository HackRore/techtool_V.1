'use client'
import { useParams } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { getByCategory } from '../../../lib/engine/searchEngine'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'

export default function CategoryPage() {
  const { slug } = useParams()
  // Simple slug to category mapping (could be more robust)
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  const results = getByCategory(categoryName)
  const hasResults = results.tools.length > 0 || results.guides.length > 0 || results.resources.length > 0

  return (
    <AppLayout>
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">System / Categories</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FolderOpen size={32} className="text-blue-600" />
            Category: {categoryName}
          </h1>
        </div>

        {!hasResults ? (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <p style={{ color: 'var(--text-4)' }}>No tools or guides found in this category.</p>
            <Link href="/" style={{ marginTop: 24, display: 'inline-block' }} className="btn-secondary">Back to Dashboard</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {results.tools.length > 0 && (
              <section>
                <h2 className="section-title">Hardware Tools</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                  {results.tools.map(tool => (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="test-card">
                        <span style={{ fontSize: 24 }}>{tool.icon}</span>
                        <div style={{ fontWeight: 700, marginTop: 8 }}>{tool.name}</div>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.guides.length > 0 && (
              <section>
                <h2 className="section-title">Troubleshooting Guides</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                  {results.guides.map(guide => (
                    <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="card-flat" style={{ borderLeft: `4px solid ${guide.color}` }}>
                        <div style={{ fontWeight: 600 }}>{guide.title}</div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                          {guide.tags.map(tag => <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.resources.length > 0 && (
              <section>
                <h2 className="section-title">Technician Resources</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.resources.map(res => (
                    <Link key={res.id} href={`/resources/${res.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="card-flat" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{res.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-4)' }}>{res.type}</div>
                        </div>
                        <FolderOpen size={16} style={{ color: 'var(--text-4)' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </AppLayout>
  )
}
