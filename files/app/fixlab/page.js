'use client'
import { useState, useMemo } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'
import { Search, BookOpen, ChevronRight, AlertCircle } from 'lucide-react'

export default function FixLab() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('hackrore_fix_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const addToHistory = (entry) => {
    const next = [entry.id, ...history.filter(id => id !== entry.id)].slice(0, 5)
    setHistory(next)
    localStorage.setItem('hackrore_fix_history', JSON.stringify(next))
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return KB.filter(e => {
      if (category !== 'All' && e.category !== category) return false
      if (!q) return true
      return e.title.toLowerCase().includes(q) || e.causes.some(c => c.toLowerCase().includes(q))
    })
  }, [query, category])

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="breadcrumb">System / FixLab</div>
        <h1>Technician <span className="text-blue-600">Knowledge Base</span></h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginTop: 4 }}>
          Search repairs, symptoms, and step-by-step hardware solutions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
        {/* Filters Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {history.length > 0 && (
            <div className="card-flat" style={{ padding: 20, background: 'var(--surface-2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Recently Viewed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {history.map(id => {
                   const item = KB.find(k => k.id === id)
                   return item ? (
                     <div key={id} style={{ fontSize: 12, color: 'var(--text-2)', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                        {item.title}
                     </div>
                   ) : null
                 })}
              </div>
            </div>
          )}

          <div className="card-flat" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Search Fixes</div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
              <input 
                type="text" 
                placeholder="Search symptoms..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)', fontSize: 13 }} 
              />
            </div>
          </div>

          <div className="card-flat" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['All', ...CATEGORIES].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategory(cat)}
                  style={{ 
                    textAlign: 'left', 
                    padding: '8px 12px', 
                    borderRadius: 6, 
                    fontSize: 13, 
                    border: 'none',
                    cursor: 'pointer',
                    background: category === cat ? 'var(--blue-50)' : 'transparent',
                    color: category === cat ? 'var(--blue-600)' : 'var(--text-3)',
                    fontWeight: category === cat ? 700 : 500
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(entry => (
            <div 
              key={entry.id} 
              className="card hover-grow" 
              style={{ padding: 20, cursor: 'pointer' }}
              onClick={() => addToHistory(entry)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                   <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{entry.category}</div>
                   <h3 style={{ fontSize: 16 }}>{entry.title}</h3>
                </div>
                <div className="badge badge-ready">{entry.severity}</div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                {entry.description || (entry.steps && entry.steps[0] ? `Step 1: ${entry.steps[0].substring(0, 80)}...` : 'Verified technician repair steps.')}
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <div style={{ display: 'flex', gap: 6 }}>
                    {entry.tools.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                 </div>
                 <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600 }}>⏱ {entry.time}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '64px 0', border: '1px dashed var(--border)' }}>
               <BookOpen size={48} style={{ opacity: 0.1, marginBottom: 16, margin: '0 auto' }} />
               <div style={{ color: 'var(--text-3)' }}>No repair entries found for your search.</div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
