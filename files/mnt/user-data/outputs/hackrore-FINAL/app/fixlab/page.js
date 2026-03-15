'use client'
import { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const SEVERITY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' }

function EntryCard({ entry, isOpen, onToggle }) {
  const sc = SEVERITY_COLOR[entry.severity] || '#6b6b6b'
  return (
    <div
      style={{
        background: isOpen ? 'var(--surface-2)' : 'var(--surface-1)',
        border: `1px solid ${isOpen ? `${sc}33` : 'var(--surface-3)'}`,
        borderRadius: 2,
        transition: 'all 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Header row — always visible */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', cursor: 'pointer',
        }}
      >
        {/* Severity dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: sc, boxShadow: `0 0 6px ${sc}88`,
        }} />

        {/* Title + tags */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {entry.title}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '1.5px',
              color: sc, background: `${sc}11`, border: `1px solid ${sc}33`,
              padding: '1px 6px', borderRadius: 1,
            }}>{entry.severity.toUpperCase()}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '1.5px',
              color: 'var(--text-muted)', background: 'var(--surface-3)',
              padding: '1px 6px', borderRadius: 1,
            }}>{entry.category.toUpperCase()}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>
              {entry.steps.length} steps · {entry.time}
            </span>
          </div>
        </div>

        {/* Toggle arrow */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s',
          flexShrink: 0,
        }}>▶</div>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${sc}22`, padding: '18px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Causes */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 10 }}>POSSIBLE CAUSES</div>
              {entry.causes.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: sc, flexShrink: 0, marginTop: 1 }}>◦</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#8a8a8a', lineHeight: 1.5 }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Tools + time */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 10 }}>TOOLS NEEDED</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                {entry.tools.map((t, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px',
                    background: 'var(--surface-3)', border: '1px solid var(--surface-5)',
                    color: 'var(--text-muted)', borderRadius: 1,
                  }}>{t}</span>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 6 }}>TIME ESTIMATE</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>{entry.time}</span>
            </div>
          </div>

          {/* Steps */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 12 }}>SOLUTION STEPS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entry.steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 14px',
                  background: step.startsWith('⚠') ? 'rgba(239,68,68,0.06)' : 'var(--surface-3)',
                  border: `1px solid ${step.startsWith('⚠') ? 'rgba(239,68,68,0.2)' : 'var(--surface-4)'}`,
                  borderRadius: 2,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: sc, flexShrink: 0, minWidth: 20, marginTop: 1,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: step.startsWith('⚠') ? '#ef4444' : '#b0b0b0', lineHeight: 1.6, flex: 1 }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--surface-3)' }}>
            {entry.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '1px',
                color: 'var(--text-dim)', padding: '2px 6px',
                background: 'var(--surface-4)', borderRadius: 1,
              }}>#{tag}</span>
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', marginLeft: 'auto' }}>{entry.id}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FixLab() {
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [openId, setOpenId]     = useState(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return KB
      .filter(e => {
        if (category !== 'All' && e.category !== category) return false
        if (severity !== 'All' && e.severity !== severity) return false
        if (!q) return true
        return (
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags.some(t => t.includes(q)) ||
          e.causes.some(c => c.toLowerCase().includes(q)) ||
          e.steps.some(s => s.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9))
  }, [query, category, severity])

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

  const counts = useMemo(() => {
    const c = {}
    KB.forEach(e => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(16,185,129,0.12)', padding: '24px 24px 20px', background: 'var(--surface-1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#10b981', letterSpacing: '2px' }}>[03]</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>FixLab</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '1px' }}>TECHNICIAN KNOWLEDGE BASE</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            {KB.length} entries · {CATEGORIES.length} categories · Search problems, causes, and solutions
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* ── Left sidebar ── */}
        <div>
          {/* Search */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 8 }}>SEARCH</div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="USB not working…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--surface-4)',
                  borderRadius: 2, padding: '9px 36px 9px 12px',
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--surface-4)'}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                >×</button>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 8 }}>CATEGORY</div>
            {['All', ...CATEGORIES].map(cat => {
              const active = category === cat
              const count = cat === 'All' ? KB.length : counts[cat] || 0
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 10px', marginBottom: 2, borderRadius: 1, cursor: 'pointer',
                    background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: active ? '#10b981' : 'var(--text-muted)' }}>{cat}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: active ? '#10b981' : 'var(--text-dim)', background: active ? 'rgba(16,185,129,0.15)' : 'var(--surface-3)', padding: '1px 6px', borderRadius: 8 }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Severity filter */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 8 }}>SEVERITY</div>
            {['All', 'critical', 'high', 'medium', 'low'].map(sev => {
              const active = severity === sev
              const col = SEVERITY_COLOR[sev] || 'var(--text-muted)'
              return (
                <button
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', marginBottom: 2, borderRadius: 1, cursor: 'pointer',
                    background: active && sev !== 'All' ? `${col}11` : active ? 'rgba(16,185,129,0.1)' : 'transparent',
                    border: `1px solid ${active ? (sev !== 'All' ? `${col}33` : 'rgba(16,185,129,0.3)') : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {sev !== 'All' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0 }} />}
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: active ? (sev !== 'All' ? col : '#10b981') : 'var(--text-muted)', textTransform: sev !== 'All' ? 'capitalize' : 'none' }}>{sev === 'All' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results ── */}
        <div>
          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              {query && <span style={{ color: '#10b981' }}> for "{query}"</span>}
            </span>
            {openId && (
              <button
                onClick={() => setOpenId(null)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}>
                COLLAPSE ALL ↑
              </button>
            )}
          </div>

          {/* Entry list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--surface-4)', marginBottom: 12 }}>◎</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-muted)', marginBottom: 6 }}>No results found</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>Try different keywords or clear filters</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  isOpen={openId === entry.id}
                  onToggle={() => toggle(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 220px"] {
            grid-template-columns: 1fr !important;
          }
        }
        input::placeholder { color: var(--text-dim); }
      `}</style>
    </div>
  )
}
