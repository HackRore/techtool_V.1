'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import Sidebar from '../../components/Sidebar'
import { searchAll } from '../../lib/engine/searchEngine'
import { paginate } from '../../lib/utils/pagination'
import Link from 'next/link'
import { Search, Zap, BookOpen, Download, ChevronRight } from 'lucide-react'

export default function SearchPage() {
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
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">Search / Results</div>
          <h1><Search size={32} style={{ verticalAlign: 'middle', marginRight: 12, opacity: 0.5 }} /> Results for "{query}"</h1>
          <p style={{ color: 'var(--text-4)', marginTop: 8 }}>Found {allResults.length} matching entries across the ecosystem.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {paged.items.map((item, idx) => (
            <Link key={`${item.type}-${item.id}`} href={getHref(item)} style={{ textDecoration: 'none' }}>
              <div className="card-flat hover-scale" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-4)', letterSpacing: 1 }}>
                    {getIcon(item.type)}
                    {item.type}
                  </div>
                  <span className="badge badge-ready" style={{ fontSize: 9 }}>{item.category}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 6 }}>
                  {item.name || item.title}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-3)', flex: 1, lineHeight: 1.5 }}>
                  {item.description}
                </p>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {allResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <Search size={48} style={{ marginBottom: 16 }} />
            <h3>No results found</h3>
            <p>Try searching for hardware components (CPU, RAM) or specific problems.</p>
          </div>
        )}

        {paged.totalPages > 1 && (
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[...Array(paged.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`tag ${page === i + 1 ? 'active' : ''}`}
                style={{ padding: '8px 16px', cursor: 'pointer', background: page === i + 1 ? 'var(--blue-600)' : 'var(--bg-2)', color: page === i + 1 ? 'white' : 'inherit' }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
