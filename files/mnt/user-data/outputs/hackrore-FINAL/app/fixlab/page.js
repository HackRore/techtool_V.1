'use client'
import { useState, useMemo } from 'react'
import Sidebar from '../../components/Sidebar'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'

const SEV = {
  critical: { dot: '#DC2626', badge: '#FEF2F2', text: '#DC2626', label: 'Critical' },
  high:     { dot: '#EA580C', badge: '#FFF7ED', text: '#EA580C', label: 'High' },
  medium:   { dot: '#D97706', badge: '#FFFBEB', text: '#D97706', label: 'Medium' },
  low:      { dot: '#16A34A', badge: '#F0FDF4', text: '#16A34A', label: 'Low' },
}

function FixCard({ entry, isOpen, onToggle }) {
  const s = SEV[entry.severity] || SEV.low
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${isOpen ? '#BFDBFE' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 8, boxShadow: isOpen ? '0 4px 14px rgba(37,99,235,.08)' : 'none', transition: 'all .2s' }}>
      <button onClick={onToggle} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--bg)'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0, marginTop: 6 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>{entry.title}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-3)', padding: '2px 8px', borderRadius: 20, fontWeight: 500, border: '1px solid var(--border)' }}>{entry.category}</span>
            <span style={{ fontSize: 11, background: s.badge, color: s.text, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{s.label}</span>
            {(entry.tags || []).slice(0, 2).map(tag => (
              <span key={tag} style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-4)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>{tag}</span>
            ))}
          </div>
        </div>
        <span style={{ color: isOpen ? 'var(--blue-600)' : 'var(--text-4)', fontSize: 18, flexShrink: 0, marginTop: 1 }}>{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '18px 18px 20px 38px', background: 'var(--bg)' }}>
          {entry.causes?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-title">Common Causes</div>
              <ul style={{ paddingLeft: 18 }}>
                {entry.causes.map((c, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4, lineHeight: 1.55 }}>{c}</li>)}
              </ul>
            </div>
          )}
          {entry.steps?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-title">Steps to Fix</div>
              <ol style={{ paddingLeft: 18 }}>
                {entry.steps.map((step, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6, lineHeight: 1.55 }}>{step}</li>)}
              </ol>
            </div>
          )}
          {(entry.tools?.length > 0 || entry.time) && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-3)' }}>
              {entry.tools?.length > 0 && <span><strong style={{ color: 'var(--text-1)' }}>Tools:</strong> {entry.tools.join(', ')}</span>}
              {entry.time && <span><strong style={{ color: 'var(--text-1)' }}>Time:</strong> {entry.time}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FixLab() {
  const [query, setQuery]   = useState('')
  const [cat, setCat]       = useState('All')
  const [openId, setOpenId] = useState(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return KB.filter(e => {
      if (cat !== 'All' && e.category !== cat) return false
      if (!q) return true
      return e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.causes?.some(c => c.toLowerCase().includes(q)) ||
        e.steps?.some(s => s.toLowerCase().includes(q)) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
    })
  }, [query, cat])

  const catCounts = useMemo(() => {
    const c = {}
    KB.forEach(e => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">

        <div className="page-header">
          <div className="breadcrumb">Home / FixLab</div>
          <h1>Fix Guide</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 5 }}>
            {KB.length} repair entries across {CATEGORIES.length} categories
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 520, marginTop: 18 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-4)', pointerEvents: 'none' }}>🔍</span>
            <input className="search-input" placeholder="Search: WiFi, battery, USB, overheating…" value={query}
              onChange={e => { setQuery(e.target.value); setOpenId(null) }} />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            {['All', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => { setCat(c); setOpenId(null) }}
                className={`tag${cat === c ? ' active' : ''}`}>
                {c} ({c === 'All' ? KB.length : catCounts[c] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 14 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
          {cat !== 'All' && ` in ${cat}`}
        </div>

        {filtered.length === 0 ? (
          <div className="card-flat" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>No results found</h3>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>Try different keywords or clear the filters.</p>
            <button className="btn-secondary" onClick={() => { setQuery(''); setCat('All') }}>Clear filters</button>
          </div>
        ) : (
          filtered.map(entry => (
            <FixCard key={entry.id} entry={entry} isOpen={openId === entry.id}
              onToggle={() => setOpenId(openId === entry.id ? null : entry.id)} />
          ))
        )}
      </main>
    </div>
  )
}
