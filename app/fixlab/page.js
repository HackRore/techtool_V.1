'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../../components/layout/AppLayout'
import { KB, CATEGORIES } from '../../lib/knowledgeBase'
import { 
  Search, ChevronDown, ChevronRight, Star, 
  Terminal, AlertCircle, Printer, Clock, Wrench,
  Filter, Activity, Cpu, Zap, BookOpen, ExternalLink
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
      <div className="animate-in" style={{ minWidth: 0 }}>
        
        {/* GFG-Style Breadcrumbs */}
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, alignItems: 'center' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Hachtool</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Repair Protocols</span>
        </div>

        {/* GFG-Style Article Header */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1.5, marginBottom: 12 }}>FIXLAB // TECHNICIAN_LIBRARY</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.5, marginBottom: 16 }}>Technical Repair Protocols</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'center' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Updated: March 2026</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wrench size={16} /> 412+ Validated Procedures</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={16} /> Peer-Reviewed</span>
          </div>
        </div>

        {/* GFG-Style Horizontal Sub-Nav (Filter Bar) */}
        <div style={{ 
          display: 'flex', gap: 8, marginBottom: 48, overflowX: 'auto', paddingBottom: 16,
          borderBottom: '1px solid var(--border)', position: 'sticky', top: 80, background: '#FFF', zIndex: 10
        }}>
          {['All', ...CATEGORIES].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ 
                padding: '8px 20px', borderRadius: 100, border: '1px solid var(--border)',
                background: activeCategory === cat ? 'var(--accent)' : '#FFF',
                color: activeCategory === cat ? '#FFF' : 'var(--text-primary)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: '0.2s', boxShadow: activeCategory === cat ? '0 4px 12px var(--accent-soft)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button 
            onClick={() => setShowBookmarks(!showBookmarks)}
            style={{ 
              padding: '8px 20px', borderRadius: 100, border: '1px solid var(--border)',
              background: showBookmarks ? 'var(--status-warn)' : '#FFF',
              color: showBookmarks ? '#FFF' : 'var(--text-primary)',
              fontSize: 12, fontWeight: 800, cursor: 'pointer'
            }}
          >
            {showBookmarks ? 'Show All' : `Bookmarks (${bookmarks.length})`}
          </button>
        </div>

        {/* Article Content / Guide List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 80 }}>
          {filtered.length > 0 ? filtered.map((entry, idx) => {
            const isExpanded = expandedId === entry.id
            const isBookmarked = bookmarks.includes(entry.id)
            const isDone = doneList.includes(entry.id)
            
            return (
              <div key={entry.id} className="card" style={{ 
                padding: 0, overflow: 'hidden', transition: '0.3s',
                borderLeft: `6px solid ${isExpanded ? 'var(--accent)' : severityColors[entry.severity] || 'var(--border)'}`,
                boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  style={{ padding: '24px 32px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                     <div onClick={(e) => toggleBookmark(entry.id, e)} style={{ color: isBookmarked ? 'var(--status-warn)' : '#DDD', cursor: 'pointer' }}>
                        <Star size={18} fill={isBookmarked ? 'var(--status-warn)' : 'none'} />
                     </div>
                     <div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 8 }}>
                           <span>{entry.category.toUpperCase()}</span>
                           {isDone && <span style={{ color: 'var(--status-pass)' }}>● VERIFIED_FIX</span>}
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#222' }}>{entry.title}</h3>
                     </div>
                  </div>
                  <ChevronDown size={20} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.3s', color: '#CCC' }} />
                </div>

                {isExpanded && (
                  <div className="animate-in" style={{ padding: '0 32px 32px 74px', borderTop: '1px solid #F5F5F5' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 48, marginTop: 32 }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                           <section>
                              <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 16 }}>SYMPTOM_MANIFEST</h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                 {entry.causes.map(c => (
                                   <div key={c} style={{ fontSize: 13, background: '#F8F9FA', padding: '8px 16px', borderRadius: 8, border: '1px solid #EEE', color: '#555' }}>{c}</div>
                                 ))}
                              </div>
                           </section>

                           <section>
                              <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, marginBottom: 20 }}>EXECUTION_PROTOCOL</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                 {entry.steps.map((step, i) => (
                                   <div key={i} style={{ display: 'flex', gap: 16 }}>
                                      <div style={{ 
                                        width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', 
                                        color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: 11, fontWeight: 900, flexShrink: 0 
                                      }}>{i + 1}</div>
                                      <div style={{ fontSize: 15, lineHeight: 1.6, color: '#333' }}>{step}</div>
                                   </div>
                                 ))}
                              </div>
                           </section>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                           <div style={{ padding: 20, background: '#F8F9FA', borderRadius: 12, border: '1px solid #EEE' }}>
                              <h5 style={{ fontSize: 10, fontWeight: 900, marginBottom: 16, color: 'var(--text-muted)' }}>HARDWARE_SCHEMATIC</h5>
                              <div style={{ height: 160, background: '#000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                 <Activity size={32} style={{ color: 'var(--accent)', opacity: 0.2 }} />
                                 <span style={{ position: 'absolute', bottom: 12, fontSize: 8, color: '#444', fontWeight: 900 }}>REF_ASYNC_GRID</span>
                              </div>
                           </div>

                           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <button onClick={(e) => toggleDone(entry.id, e)} className="btn-primary" style={{ width: '100%', height: 44 }}>
                                 {isDone ? 'Re-open Ticket' : 'Mark as Resolved'}
                              </button>
                              <button className="btn-outline" style={{ width: '100%', height: 44 }} onClick={(e) => { e.stopPropagation(); window.print() }}>
                                 <Printer size={16} style={{ marginRight: 8 }} /> Print Protocol
                              </button>
                           </div>
                        </div>

                     </div>
                  </div>
                )}
              </div>
            )
          }) : (
            <div style={{ padding: 100, textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 12 }}>
               <Search size={48} style={{ color: '#DDD', marginBottom: 24 }} />
               <h3 style={{ color: '#999' }}>No repair protocols found.</h3>
               <button onClick={() => {setQuery(''); setActiveCategory('All'); setShowBookmarks(false)}} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 800, marginTop: 12, cursor: 'pointer' }}>Clear Filters</button>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
