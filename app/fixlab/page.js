'use client'
import { useState, useMemo, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'
import { 
  Search, BookOpen, ChevronDown, 
  ChevronRight, Star, CheckCircle, 
  Clock, Tool, AlertCircle, Share, Printer,
  Filter, Sparkles
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
        
        {/* Hub Header Perfection */}
        <header style={{ marginBottom: 64, borderBottom: '1px solid var(--border)', paddingBottom: 40 }}>
           <div className="badge badge-ready" style={{ marginBottom: 24, fontSize: 10 }}>INTELLIGENCE_LAYER // FIXLAB_HUB</div>
           <h1 style={{ marginBottom: 16 }}>Troubleshooting <span className="glow-text" style={{ color: 'var(--accent)' }}>Repair Hub</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 650, lineHeight: 1.6 }}>
             Access a high-fidelity knowledge graph of hardware symptoms, validated fix protocols, and component-level repair documentation.
           </p>
        </header>

        <div className="dashboard-layout">
          
          {/* Main Content: Intelligence Entries */}
          <div style={{ minWidth: 0 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 80 }}>
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
                      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div onClick={(e) => toggleBookmark(entry.id, e)} style={{ padding: 4 }}>
                               <Star size={18} style={{ 
                                 color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)', 
                                 fill: isBookmarked ? 'var(--accent)' : 'none',
                                 filter: isBookmarked ? 'drop-shadow(0 0 4px var(--accent))' : 'none'
                               }} />
                            </div>
                            <div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                  <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{entry.category}</span>
                                  {isDone && <span className="badge badge-pass" style={{ fontSize: 8 }}>VALIDATED_FIX</span>}
                               </div>
                               <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, textTransform: 'none', color: 'var(--text-primary)' }}>{entry.title}</h3>
                            </div>
                         </div>
                         <div style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                         </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="animate-in" style={{ padding: '0 32px 40px 80px', borderTop: '1px solid var(--border)' }}>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, marginTop: 40 }}>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                                 <section>
                                    <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Standard Pathing (Causes)</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                       {entry.causes.map(c => (
                                         <div key={c} style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                            {c}
                                         </div>
                                       ))}
                                    </div>
                                 </section>

                                 <section>
                                    <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>Verified Repair Protocol</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                       {entry.steps.map((step, i) => (
                                         <div key={i} style={{ display: 'flex', gap: 24 }}>
                                            <div className="text-mono" style={{ 
                                              width: 32, height: 32, borderRadius: 8, background: 'var(--bg-primary)', 
                                              border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', 
                                              justifyContent: 'center', fontSize: 13, fontWeight: 900, color: 'var(--accent)' 
                                            }}>
                                               {i + 1}
                                            </div>
                                            <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, paddingTop: 4 }}>{step}</div>
                                         </div>
                                       ))}
                                    </div>
                                 </section>
                              </div>

                              {/* Sidebar Stats */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                 <div className="card-elevated" style={{ padding: 24, background: 'var(--bg-primary)' }}>
                                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Required Toolkit</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                       {entry.tools.map(t => <span key={t} className="badge" style={{ background: 'var(--bg-elevated)', fontSize: 9 }}>{t}</span>)}
                                    </div>
                                 </div>

                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button onClick={(e) => toggleDone(entry.id, e)} className="btn-accent" style={{ 
                                      width: '100%', height: 48, background: isDone ? 'transparent' : 'var(--accent)', 
                                      border: `1px solid var(--accent)`, color: isDone ? 'var(--accent)' : 'var(--bg-primary)'
                                    }}>
                                       {isDone ? 'RE-OPEN_SYMPTOM' : 'MARK_AS_RESOLVED'}
                                    </button>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                       <button className="btn-accent" style={{ flex: 1, height: 44, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                          SHARE
                                       </button>
                                       <button className="btn-accent" style={{ flex: 1, height: 44, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                          PRINT
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

          {/* Sidebar: Filters & Intelligence Hub */}
          <aside className="sidebar-panel">
             
             {/* Search Cluster */}
             <div className="card-elevated" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                   <Search size={16} style={{ color: 'var(--accent)' }} />
                   <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, textDecoration: 'none' }}>Search Cluster</h3>
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Query kernel..." 
                  style={{ 
                    width: '100%', height: 48, padding: '0 16px', background: 'var(--bg-primary)', 
                    border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)',
                    fontSize: 13, outline: 'none'
                  }}
                  className="focus:border-accent"
                />
             </div>

             {/* Functional Filters */}
             <div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                   <h3>Kernel Filters</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {['All', ...CATEGORIES].map(cat => (
                     <button 
                       key={cat}
                       onClick={() => setActiveCategory(cat)}
                       style={{ 
                         textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                         background: activeCategory === cat ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                         color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                         border: `1px solid ${activeCategory === cat ? 'var(--accent)' : 'transparent'}`,
                         fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                       }}
                     >
                        {cat.toUpperCase()} {cat === 'All' ? 'HARDWARE' : ''}
                     </button>
                   ))}
                </div>
             </div>

             {/* Personal Hub Sync */}
             <div className="card-elevated" style={{ padding: 32, borderTop: '4px solid var(--status-info)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                   <Sparkles size={18} style={{ color: 'var(--status-info)' }} />
                   <div style={{ fontSize: 13, fontWeight: 900 }}>Personal Hub Sync</div>
                </div>
                <button 
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className="btn-accent"
                  style={{ 
                    width: '100%', height: 44, background: showBookmarks ? 'var(--status-info)' : 'transparent', 
                    border: `1px solid var(--status-info)`, color: showBookmarks ? 'var(--bg-primary)' : 'var(--status-info)',
                    fontSize: 11
                  }}
                >
                  {showBookmarks ? 'SHOW_ALL_REPORTS' : `VIEW_BOOKMARKS (${bookmarks.length})`}
                </button>
             </div>

          </aside>

        </div>
      </div>
    </AppLayout>
  )
}
