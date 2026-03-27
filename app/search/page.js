'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useMemo, Suspense } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { searchAll } from '../../lib/engine/searchEngine'
import { paginate } from '../../lib/utils/pagination'
import Link from 'next/link'
import { Search, Zap, BookOpen, Download, ChevronRight } from 'lucide-react'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [page, setPage] = useState(1)
  const pageSize = 12

  const results = useMemo(() => searchAll(query), [query])
  
  // Flatten results for pagination or handle by section
  const allResults = [
    ...results.tools.map(t => ({ ...t, type: 'tool' })),
    ...results.guides.map(g => ({ ...g, type: 'guide' })),
    ...results.resources.map(r => ({ ...r, type: 'resource' }))
  ]

  const paged = paginate(allResults, page, pageSize)

  const getIcon = (type) => {
    if (type === 'tool') return <Zap size={16} className="text-blue-500" />
    if (type === 'guide') return <BookOpen size={16} className="text-green-500" />
    return <Download size={16} className="text-purple-500" />
  }

  const getHref = (item) => {
    if (item.type === 'tool') return `/tools/${item.slug}`
    if (item.type === 'guide') return `/guides/${item.slug}`
    return `/resources/${item.slug}`
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: 40 }}>
           <div className="breadcrumb" style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>System / Search Intelligence</div>
           <h1 style={{ fontSize: 32, marginBottom: 8 }}>Search <span style={{ color: 'var(--accent)' }}>Results</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Found {allResults.length} matching entries for &quot;{query}&quot;.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {paged.items.map((item, idx) => (
            <Link key={`${item.type}-${item.id}`} href={getHref(item)} style={{ textDecoration: 'none' }}>
              <div className="card-elevated hover-glow" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1, fontWeight: 800 }}>
                    {getIcon(item.type)}
                    {item.type}
                  </div>
                  <span className="tag" style={{ fontSize: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>{item.category}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {item.name || item.title}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.5 }}>
                  {item.description}
                </p>
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="tag" style={{ fontSize: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--accent)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

          {allResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5, color: 'var(--text-muted)' }}>
              <Search size={48} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>No results found</h3>
              <p style={{ fontSize: 14 }}>Try searching for hardware components (CPU, RAM) or specific symptoms.</p>
            </div>
          )}

          {paged.totalPages > 1 && (
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 8, paddingBottom: 40 }}>
              {[...Array(paged.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{ 
                    padding: '8px 16px', cursor: 'pointer', borderRadius: 6, 
                    background: page === i + 1 ? 'var(--accent)' : 'var(--bg-secondary)', 
                    color: page === i + 1 ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border)', fontWeight: 700, fontSize: 12,
                    transition: 'var(--transition)'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    )
  }

  export default function SearchPage() {
    return (
      <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Searching Intelligence...</div>}>
        <SearchContent />
      </Suspense>
    )
  }
