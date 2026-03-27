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
      <div className="hub-layout animate-in">
        
        {/* Left Panel: Controls & Filters */}
        <div className="hub-sidebar">
           <div className="breadcrumb">Intelligence / FixLab / Hub</div>
           <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>Repair Hub</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Diagnostic-driven hardware repair instructions and validated fix paths.</p>

           <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ position: 'relative' }}>
                 <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input 
                   type="text" 
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   placeholder="Search symptoms..." 
                   className="search-input"
                   style={{ paddingLeft: 42, height: 44, fontSize: 13 }}
                 />
              </div>

              <div>
                 <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'block' }}>Category Filter</label>
                 <select 
                   value={activeCategory}
                   onChange={e => setActiveCategory(e.target.value)}
                   style={{ width: '100%', height: 44, padding: '0 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                 >
                   <option value="All">All Hardware</option>
                   {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>

              <button 
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={showBookmarks ? "btn-accent" : "btn-secondary"}
                style={{ height: 44, width: '100%', justifyContent: 'center', gap: 10 }}
              >
                <Star size={16} style={{ fill: showBookmarks ? 'var(--bg-primary)' : 'none' }} />
                {showBookmarks ? 'Showing Bookmarks' : 'View Bookmarks'}
              </button>
           </div>
        </div>

        {/* Right Content: Entries */}
        <div className="hub-main">
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(entry => {
                const isExpanded = expandedId === entry.id
                const isBookmarked = bookmarks.includes(entry.id)
                const isDone = doneList.includes(entry.id)

                return (
                  <div 
                    key={entry.id} 
                    className="card-elevated" 
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    style={{ 
                      padding: 0, overflow: 'hidden', cursor: 'pointer',
                      borderLeft: `4px solid ${severityColors[entry.severity] || 'var(--border)'}`,
                      background: isExpanded ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {/* Header Section */}
                    <div style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                          <div onClick={(e) => toggleBookmark(entry.id, e)} style={{ padding: 4 }}>
                             <Star size={18} style={{ color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)', fill: isBookmarked ? 'var(--accent)' : 'none', transition: 'all 0.2s' }} />
                          </div>
                          <div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{entry.category}</span>
                                {isDone && <span className="badge badge-pass">RESOLVED</span>}
                             </div>
                             <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
                                {entry.title}
                                {isExpanded ? <ChevronDown size={18} style={{ opacity: 0.5 }} /> : <ChevronRight size={18} style={{ opacity: 0.5 }} />}
                             </h3>
                             {!isExpanded && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, maxWidth: 600 }}>{entry.description || entry.steps[0]}</div>}
                          </div>
                       </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="animate-in" style={{ padding: '0 32px 40px 68px', borderTop: '1px solid var(--border)' }}>
                         <div style={{ gridTemplateColumns: '1fr 300px', display: 'grid', gap: 64, marginTop: 40 }}>
                            <div>
                               <section style={{ marginBottom: 40 }}>
                                  <h4 style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Primary Causes</h4>
                                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                     {entry.causes.map(c => (
                                       <li key={c} style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
                                          {c}
                                       </li>
                                     ))}
                                  </ul>
                               </section>

                               <section>
                                  <h4 style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 }}>Validated Fix Protocol</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                     {entry.steps.map((step, i) => (
                                       <div key={i} style={{ display: 'flex', gap: 24 }}>
                                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                                             {i + 1}
                                          </div>
                                          <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, paddingTop: 4 }}>{step}</div>
                                       </div>
                                     ))}
                                  </div>
                               </section>
                            </div>

                            {/* Side Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                               <div className="card" style={{ padding: 24, background: 'var(--bg-primary)' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>REQUIRED TOOLS</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                     {entry.tools.map(t => <span key={t} className="tag">{t}</span>)}
                                  </div>
                               </div>

                               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  <button onClick={(e) => toggleDone(entry.id, e)} className="btn-accent" style={{ width: '100%', justifyContent: 'center', background: isDone ? 'var(--bg-elevated)' : 'var(--accent)', color: isDone ? 'var(--accent)' : 'var(--bg-primary)', border: isDone ? '1px solid var(--accent)' : 'none', height: 48, fontSize: 13, fontWeight: 800 }}>
                                     <CheckCircle size={16} />
                                     {isDone ? 'Mark as Pending' : 'Mark as Resolved'}
                                  </button>
                                  <div style={{ display: 'flex', gap: 12 }}>
                                     <button className="btn-secondary" style={{ flex: 1, height: 44, justifyContent: 'center' }}>
                                        <Share size={14} />
                                     </button>
                                     <button className="btn-secondary" style={{ flex: 1, height: 44, justifyContent: 'center' }}>
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
      </div>
    </AppLayout>
  )
}
