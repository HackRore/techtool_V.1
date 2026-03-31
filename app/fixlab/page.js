'use client'
import { useState, useMemo, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'
import { 
  Search, ChevronDown, 
  ChevronRight, Star, 
  Terminal, AlertCircle, Printer,
  Filter
} from 'lucide-react'

export default function FixLab() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [doneList, setDoneList] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)

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
    critical: 'var(--status-fail)',
    high: 'var(--status-warn)',
    medium: 'var(--status-info)',
    low: 'var(--accent)'
  }

  return (
    <AppLayout>
      <div className="animate-in">
        
        {/* Hub Header */}
        <header style={{ marginBottom: 48, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
           <h1 style={{ marginBottom: 12 }}>Repair <span style={{ color: 'var(--accent)' }}>Solutions</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: 650, lineHeight: 1.6 }}>
             Hardware troubleshooting guides, validated fix protocols, and component-level repair documentation.
           </p>
        </header>

        <div className="dashboard-layout">
          
          {/* Main Content: Fix Entries */}
          <div style={{ minWidth: 0 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 60 }}>
                {filtered.map(entry => {
                  const isExpanded = expandedId === entry.id
                  const isBookmarked = bookmarks.includes(entry.id)
                  const isDone = doneList.includes(entry.id)

                  return (
                    <div 
                      key={entry.id} 
                      className={`card ${isExpanded ? 'glow-border' : ''}`} 
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      style={{ 
                        padding: 0, cursor: 'pointer',
                        borderLeft: `4px solid ${severityColors[entry.severity] || 'var(--border)'}`,
                        background: isExpanded ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                      }}
                    >
                      {/* Entry Header */}
                      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div onClick={(e) => toggleBookmark(entry.id, e)} style={{ padding: 4 }}>
                               <Star size={16} style={{ 
                                 color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)', 
                                 fill: isBookmarked ? 'var(--accent)' : 'none',
                               }} />
                            </div>
                            <div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{entry.category}</span>
                                  {isDone && <span className="badge badge-pass" style={{ fontSize: 8 }}>FIXED</span>}
                               </div>
                               <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'none', color: 'var(--text-primary)', margin:0 }}>{entry.title}</h3>
                            </div>
                         </div>
                         <div style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                         </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="animate-in" style={{ padding: '0 24px 32px 64px', borderTop: '1px solid var(--border)' }}>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginTop: 24 }}>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                 <section>
                                    <h4 style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Common Causes</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                       {entry.causes.map(c => (
                                         <div key={c} style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                            {c}
                                         </div>
                                       ))}
                                    </div>
                                 </section>

                                 <section>
                                    <h4 style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Repair Protocol</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                       {entry.steps.map((step, i) => (
                                         <div key={i} style={{ display: 'flex', gap: 16 }}>
                                            <div className="text-mono" style={{ 
                                              width: 24, height: 24, borderRadius: 6, background: 'var(--bg-primary)', 
                                              border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', 
                                              justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--accent)' 
                                            }}>
                                               {i + 1}
                                            </div>
                                            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, paddingTop: 2 }}>{step}</div>
                                         </div>
                                       ))}
                                    </div>
                                 </section>
                              </div>

                              {/* Sidebar Details */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                 <div className="card" style={{ padding: 20, background: 'var(--bg-primary)' }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Required Tools</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                       {entry.tools.map(t => <span key={t} className="badge" style={{ fontSize: 9 }}>{t}</span>)}
                                    </div>
                                 </div>

                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <button onClick={(e) => toggleDone(entry.id, e)} className="btn-primary" style={{ width: '100%', height: 44 }}>
                                       {isDone ? 'Re-open Case' : 'Mark as Fixed'}
                                    </button>
                                    <button className="btn-outline" style={{ width: '100%', height: 40 }} onClick={(e) => {e.stopPropagation(); window.print()}}>
                                       <Printer size={14} /> Print Guide
                                    </button>
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

          {/* Sidebar: Filters */}
          <aside className="sidebar-panel">
             
             {/* Search */}
             <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                   <Search size={14} style={{ color: 'var(--accent)' }} />
                   <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Search Hub</h3>
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search symptoms..." 
                  style={{ width: '100%', fontSize: 13 }}
                />
             </div>

             {/* Categories */}
             <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                   <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                   <h3 style={{ fontSize: 11 }}>Categories</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   {['All', ...CATEGORIES].map(cat => (
                     <button 
                       key={cat}
                       onClick={() => setActiveCategory(cat)}
                       style={{ 
                         textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                         background: activeCategory === cat ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                         color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                         border: `1px solid ${activeCategory === cat ? 'var(--accent)' : 'transparent'}`,
                         fontSize: 12, fontWeight: 700, cursor: 'pointer'
                       }}
                     >
                        {cat}
                     </button>
                   ))}
                </div>
             </div>

             {/* Bookmarks */}
             <div className="card" style={{ padding: 24, borderTop: '4px solid var(--accent)' }}>
                <button 
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className="btn-outline"
                  style={{ width: '100%', color: showBookmarks ? 'var(--accent)' : 'var(--text-primary)', borderColor: showBookmarks ? 'var(--accent)' : 'var(--border)' }}
                >
                  {showBookmarks ? 'Show All' : `Bookmarks (${bookmarks.length})`}
                </button>
             </div>

          </aside>

        </div>
      </div>
    </AppLayout>
  )
}
