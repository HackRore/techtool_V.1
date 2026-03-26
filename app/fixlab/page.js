'use client'
import { useState, useMemo, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'
import { 
  Search, BookOpen, ChevronDown, 
  ChevronRight, Star, CheckCircle, 
  Clock, Tool, AlertCircle, Share, Printer 
} from 'lucide-react'

export default function FixLab() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [doneList, setDoneList] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)

  // Persistence
  useEffect(() => {
    setBookmarks(JSON.parse(localStorage.getItem('hr_bookmarks') || '[]'))
    setDoneList(JSON.parse(localStorage.getItem('hr_done') || '[]'))
  }, [])

  const toggleBookmark = (id, e) => {
    e.stopPropagation()
    const next = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id]
    setBookmarks(next)
    localStorage.setItem('hr_bookmarks', JSON.stringify(next))
  }

  const toggleDone = (id, e) => {
    e.stopPropagation()
    const next = doneList.includes(id) ? doneList.filter(d => d !== id) : [...doneList, id]
    setDoneList(next)
    localStorage.setItem('hr_done', JSON.stringify(next))
  }

  const filtered = useMemo(() => {
    let list = KB
    if (activeCategory !== 'All') list = list.filter(e => e.category === activeCategory)
    if (showBookmarks) list = list.filter(e => bookmarks.includes(e.id))
    
    const q = query.toLowerCase().trim()
    if (!q) return list
    return list.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.causes.some(c => c.toLowerCase().includes(q))
    )
  }, [query, activeCategory, showBookmarks, bookmarks])

  const severityColors = {
    critical: 'var(--red)',
    high: 'var(--amber)',
    medium: 'var(--blue)',
    low: 'var(--accent)'
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: 32 }}>
           <div className="breadcrumb" style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>System / FixLab</div>
           <h1 style={{ fontSize: 32, marginBottom: 8 }}>Repair <span style={{ color: 'var(--accent)' }}>Intelligence Hub</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Diagnostic-driven hardware repair instructions and validated fix paths.</p>
        </div>

        {/* Sticky Toolbar */}
        <div style={{ 
          position: 'sticky', top: 64, zIndex: 100,
          background: 'var(--bg-primary)', padding: '24px 0',
          borderBottom: '1px solid var(--border)', marginBottom: 32
        }}>
           <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                 <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input 
                   type="text" 
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   placeholder="Search symptoms, fixes, or error codes..." 
                   style={{ width: '100%', padding: '12px 12px 12px 48px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'white', fontSize: 13 }} 
                 />
              </div>
              <select 
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
                style={{ height: 44, padding: '0 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'white', fontSize: 13, cursor: 'pointer' }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button 
                onClick={() => setShowBookmarks(!showBookmarks)}
                style={{ 
                  height: 44, padding: '0 16px', borderRadius: 8, 
                  background: showBookmarks ? 'var(--accent-glow)' : 'var(--bg-secondary)', 
                  border: `1px solid ${showBookmarks ? 'var(--accent)' : 'var(--border)'}`,
                  color: showBookmarks ? 'var(--accent)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                <Star size={16} />
                {showBookmarks ? 'Bookmarks Active' : 'Bookmarks'}
              </button>
           </div>
           {filtered.length > 0 && (
             <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Showing {filtered.length} of {KB.length} ENTRIES
             </div>
           )}
        </div>

        {/* Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 64 }}>
          {filtered.map(entry => {
            const isExpanded = expandedId === entry.id
            const isBookmarked = bookmarks.includes(entry.id)
            const isDone = doneList.includes(entry.id)

            return (
              <div 
                key={entry.id} 
                className="card" 
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                style={{ 
                  padding: 0, overflow: 'hidden', cursor: 'pointer',
                  borderLeft: `4px solid ${severityColors[entry.severity] || 'var(--border)'}`,
                  background: isExpanded ? 'var(--bg-elevated)' : 'var(--bg-secondary)'
                }}
              >
                {/* Header Section */}
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div onClick={(e) => toggleBookmark(entry.id, e)}>
                         <Star size={18} style={{ color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)', fill: isBookmarked ? 'var(--accent)' : 'none', transition: 'var(--transition)' }} />
                      </div>
                      <div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{entry.category}</span>
                            {isDone && <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: 4 }}>RESOLVED</span>}
                         </div>
                         <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {entry.title}
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                         </h3>
                         {!isExpanded && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{entry.description || entry.steps[0]}</div>}
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingLeft: 24 }}>
                      <div className="desktop-only" style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>SEVERITY</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: severityColors[entry.severity] }}>{entry.severity.toUpperCase()}</div>
                      </div>
                      <div className="desktop-only" style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>EST. TIME</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{entry.time}</div>
                      </div>
                   </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="animate-in" style={{ padding: '0 24px 32px 58px', borderTop: '1px solid var(--border)' }}>
                     <div style={{ gridTemplateColumns: '1fr 280px', display: 'grid', gap: 48, marginTop: 32 }}>
                        <div>
                           <section style={{ marginBottom: 32 }}>
                              <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Primary Causes</h4>
                              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                 {entry.causes.map(c => (
                                   <li key={c} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
                                      {c}
                                   </li>
                                 ))}
                              </ul>
                           </section>

                           <section>
                              <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Step-by-Step Fix</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                 {entry.steps.map((step, i) => (
                                   <div key={i} style={{ display: 'flex', gap: 16 }}>
                                      <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                         {i + 1}
                                      </div>
                                      <div style={{ fontSize: 13, color: 'var(--text-primary)', paddingTop: 4 }}>{step}</div>
                                   </div>
                                 ))}
                              </div>
                           </section>
                        </div>

                        {/* Side Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                           <div className="card-elevated" style={{ padding: 20 }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16 }}>REQUIRED TOOLS</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                 {entry.tools.map(t => <span key={t} className="tag" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>{t}</span>)}
                              </div>
                           </div>

                           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <button onClick={(e) => toggleDone(entry.id, e)} className="btn-accent" style={{ width: '100%', justifyContent: 'center', background: isDone ? 'var(--bg-elevated)' : 'var(--accent)', color: isDone ? 'var(--accent)' : 'var(--bg-primary)', border: isDone ? '1px solid var(--accent)' : 'none' }}>
                                 <CheckCircle size={16} />
                                 {isDone ? 'Mark as Pending' : 'Mark as Resolved'}
                              </button>
                              <div style={{ display: 'flex', gap: 12 }}>
                                 <button style={{ flex: 1, padding: 10, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <Share size={14} />
                                 </button>
                                 <button style={{ flex: 1, padding: 10, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <Printer size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
