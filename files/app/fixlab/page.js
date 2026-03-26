'use client'
import { useState, useMemo } from "react"
import Navbar from "../../components/Navbar"
import { KB, CATEGORIES } from "../../lib/knowledgeBase"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import Sidebar from "../../components/ui/Sidebar"

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const SEVERITY_COLOR = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" }

// EntryCard logic moved to Card component usage
const SEVERITY_MAP = { critical: 'red', high: 'amber', medium: 'amber', low: 'green' }

function EntryCard({ entry, isOpen, onToggle }) {
  const severityCls = SEVERITY_MAP[entry.severity] || 'muted'
  const sc = `var(--signal-${severityCls})` // CSS var for dynamic color
  
  return (
    <Card accent={sc} isOpen={isOpen} onToggle={onToggle} clickable>
      <div className="flex items-center gap-3.5 p-3.5 sm:p-[14px_18px] cursor-pointer group">
        <div 
          className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px_var(--accent-color)_0.533]"
          style={{ '--accent-color': sc }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-sans text-sm font-medium text-primary leading-tight">
            {entry.title}
          </div>
          <div className="flex gap-1 flex-wrap mt-1.25">
            <Badge cls={severityCls}>{entry.severity.toUpperCase()}</Badge>
            <span className="font-mono text-[8px] tracking-[1.5px] bg-surface-3 px-[6px] rounded text-muted">
              {entry.category.toUpperCase()}
            </span>
            <span className="font-mono text-[8px] text-dim">
              {entry.steps.length} steps · {entry.time}
            </span>
          </div>
        </div>
        <div className="font-mono text-sm text-muted shrink-0 transition-transform duration-200 group-data-[open=true]:rotate-90">
          ▶
        </div>
      </div>
      
      {isOpen && (
        <div className="border-t border-[color:var(--accent-color)_0.133] p-[18px_20px]">
          {/* Causes/Tools Grid */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="font-mono text-[9px] tracking-[2px] text-muted mb-[10px]">POSSIBLE CAUSES</div>
              {entry.causes.map((cause, i) => (
                <div key={i} className="flex gap-2 mb-1.75 items-start">
                  <span className="font-mono text-sm text-[color:var(--accent-color)] shrink-0 mt-0.25" style={{ '--accent-color': sc }}>◦</span>
                  <span className="font-sans text-sm text-[#8a8a8a] leading-relaxed">{cause}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[2px] text-muted mb-[10px]">TOOLS NEEDED</div>
              <div className="flex flex-wrap gap-1.25 mb-4">
                {entry.tools.map((tool, i) => (
                  <span key={i} className="font-mono text-[9px] px-2 py-[3px] bg-surface-3 border border-surface-5 text-muted rounded">
                    {tool}
                  </span>
                ))}
              </div>
              <div className="font-mono text-[9px] tracking-[2px] text-muted mb-1.5">TIME ESTIMATE</div>
              <span className="font-mono text-sm text-amber">{entry.time}</span>
            </div>
          </div>
          
          {/* Steps */}
          <div className="mt-5">
            <div className="font-mono text-[9px] tracking-[2px] text-muted mb-3">SOLUTION STEPS</div>
            <div className="flex flex-col gap-2">
              {entry.steps.map((step, i) => {
                const isWarning = step.startsWith('⚠')
                const stepColor = isWarning ? '#ef4444' : '#b0b0b0'
                const stepBg = isWarning ? 'bg-red/6 border-red/20' : 'bg-surface-3 border-surface-4'
                
                return (
                  <div key={i} className={`flex gap-3 items-start p-[10px_14px] ${stepBg} border rounded-[2px]`}>
                    <div className="font-mono text-sm font-bold text-[color:var(--accent-color)] shrink-0 w-5 mt-0.25 flex items-start justify-center" style={{ '--accent-color': sc }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="font-sans text-sm leading-relaxed flex-1" style={{ color: stepColor }}>
                      {step}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mt-4 pt-3.5 border-t border-surface-3">
            {entry.tags.map(tag => (
              <span key={tag} className="font-mono text-[8px] tracking-[1px] text-dim px-[6px] py-px bg-surface-4 rounded">
                #{tag}
              </span>
            ))}
            <span className="font-mono text-[8px] text-dim ml-auto">{entry.id}</span>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function FixLab() {
  const [query, setQuery]       = useState("")
  const [category, setCategory] = useState("All")
  const [severity, setSeverity] = useState("All")
  const [openId, setOpenId]     = useState(null)

  const [page, setPage] = useState(1)
  const pageSize = 15

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return KB
      .filter(e => {
        if (category !== "All" && e.category !== category) return false
        if (severity !== "All" && e.severity !== severity) return false
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

  const paged = useMemo(() => {
    const offset = 0; // "Load More" appends, so we slice from 0 to current page * pageSize
    return filtered.slice(0, page * pageSize);
  }, [filtered, page])

  const hasMore = paged.length < filtered.length

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

  const counts = useMemo(() => {
    const c = {}
    KB.forEach(e => { c[e.category] = (c[e.category] || 0) + 1 })
    return c
  }, [])

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />
      
      {/* Header */}
      <div className="border-b border-signal-green/12 bg-surface-1 px-6 pb-5 pt-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="font-mono text-[9px] text-signal-green tracking-[2px]">[03]</div>
            <h1 className="font-display text-2xl font-black text-primary">FixLab</h1>
            <span className="font-mono text-[9px] text-muted tracking-[1px]">TECHNICIAN KNOWLEDGE BASE</span>
          </div>
          <div className="font-mono text-sm text-muted">
            {KB.length} entries · {CATEGORIES.length} categories · Search problems, causes, and solutions
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <Sidebar>
          {/* Search */}
          <div className="mb-5">
            <div className="font-mono text-[9px] tracking-[2px] text-muted mb-2">SEARCH</div>
            <div className="relative">
              <input
                type="text"
                placeholder="USB not working…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-surface-2 border border-surface-4 rounded-[2px] px-[12px_36px_12px_12px] py-[9px] font-mono text-sm text-primary outline-none transition-all focus:border-signal-green/40 hover:border-surface-4/80"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-[10px] top-1/2 -translate-y-1/2 bg-transparent border-none text-muted hover:text-primary text-lg leading-none cursor-pointer transition-colors"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mb-5">
            <div className="font-mono text-[9px] tracking-[2px] text-muted mb-2">CATEGORY</div>
            {["All", ...CATEGORIES].map(cat => {
              const active = category === cat
              const count = cat === "All" ? KB.length : counts[cat] || 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`
                    w-full text-left flex justify-between items-center p-[7px_10px] mb-0.5 rounded cursor-pointer transition-all hover:bg-surface-2
                    ${active ? 'bg-signal-green/10 border border-signal-green/30 text-signal-green' : 'hover:border-surface-4 border-transparent'}
                  `}
                  aria-pressed={active}
                >
                  <span className="font-sans text-sm">{cat}</span>
                  <span className={`
font-mono text-[9px] px-[6px] py-px rounded-[8px] text-muted
                  `}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Severity Filter */}
          <div className="mb-5">
            <div className="font-mono text-[9px] tracking-[2px] text-muted mb-2">SEVERITY</div>
            {["All", "critical", "high", "medium", "low"].map(s => {
              const active = severity === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`
                    w-full text-left p-[7px_10px] mb-0.5 rounded cursor-pointer transition-all hover:bg-surface-2
                    ${active ? 'bg-red/10 border border-red/30 text-red font-medium' : 'hover:border-surface-4 border-transparent'}
                  `}
                  aria-pressed={active}
                >
                  {s.toUpperCase()}
                </button>
              )
            })}
          </div>
        </Sidebar>

        {/* Entries List */}
        <div className="space-y-3">
          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <div className="font-mono text-[36px] mb-4 opacity-20">📋</div>
              <div className="font-display text-lg mb-2">No entries found</div>
              <div className="font-mono text-sm">Try adjusting filters or search terms</div>
            </div>
          ) : (
            <>
              {paged.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  isOpen={openId === entry.id}
                  onToggle={() => toggle(entry.id)}
                />
              ))}
              
              {hasMore && (
                <div className="pt-8 pb-12 flex justify-center">
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    className="font-mono text-[10px] tracking-[2px] bg-surface-2 border border-surface-4 px-8 py-3 rounded-[2px] text-muted hover:text-signal-green hover:border-signal-green/40 transition-all uppercase"
                  >
                    Load More Entries
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
