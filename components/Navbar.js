'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Zap, Activity, BookOpen, Menu, X, Terminal, ChevronRight } from 'lucide-react'
import { searchAll } from '../lib/engine/searchEngine'

const NAV_ITEMS = [
  { href: '/',            label: 'Dashboard',   icon: Zap },
  { href: '/tools',       label: 'TestLab',     icon: Terminal },
  { href: '/diagnostics', label: 'ScanLab',     icon: Activity },
  { href: '/fixlab',      label: 'FixLab',      icon: BookOpen },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const searchRef = useRef(null)

  const handleSearch = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length > 1) {
      setSearchResults(searchAll(q))
    } else {
      setSearchResults(null)
    }
  }

  // Handle clicks outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav style={{ 
      background: 'rgba(2, 6, 23, 0.85)', 
      borderBottom: '1px solid var(--border)', 
      backdropFilter: 'blur(16px)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000 
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        
        {/* Brand */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setOpen(false)}>
          <div className="nav-logo-sq" style={{ width: 32, height: 32, fontSize: 13 }}>HR</div>
          <div className="nav-desktop">
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>TECH<span style={{ color: 'var(--blue-600)' }}>TOOL</span></div>
          </div>
        </Link>

        {/* Global Search */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: 600, position: 'relative' }} className="nav-desktop">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
            <input 
              type="text" 
              placeholder="Search tools, guides, resources..." 
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.length > 1 && setSearchResults(searchAll(searchQuery))}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 16px 10px 40px',
                fontSize: 14,
                color: 'var(--text-1)',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults && (searchQuery.length > 1) && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              marginTop: 8,
              boxShadow: 'var(--shadow2)',
              maxHeight: 400,
              overflowY: 'auto',
              padding: 8,
              zIndex: 1001
            }}>
            {searchQuery.length >= 2 && (
              <div className="search-results-dropdown">
                {searchResults.tools.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">Tools</div>
                    {searchResults.tools.slice(0, 3).map(tool => (
                      <Link key={tool.id} href={`/tools/${tool.slug}`} className="search-result-item" onClick={() => setSearchQuery('')}>
                        <span className="search-result-icon">{tool.icon}</span>
                        <div className="search-result-info">
                          <div className="search-result-title">{tool.name}</div>
                          <div className="search-result-desc">{tool.category}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {searchResults.guides.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">Guides</div>
                    {searchResults.guides.slice(0, 3).map(guide => (
                      <Link key={guide.id} href={`/guides/${guide.slug}`} className="search-result-item" onClick={() => setSearchQuery('')}>
                        <BookOpen size={14} className="search-result-icon text-blue-500" />
                        <div className="search-result-info">
                          <div className="search-result-title">{guide.title}</div>
                          <div className="search-result-desc">{guide.category}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {(searchResults.tools.length > 3 || searchResults.guides.length > 3 || searchResults.resources.length > 0) && (
                  <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="search-see-all" onClick={() => setSearchQuery('')}>
                    View all results <ChevronRight size={14} />
                  </Link>
                )}

                {searchResults.tools.length === 0 && searchResults.guides.length === 0 && searchResults.resources.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>
                    No exact matches found.
                  </div>
                )}
              </div>
            )}
            </div>
          )}
        </div>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="nav-desktop">
           {NAV_ITEMS.map(item => (
             <Link key={item.href} href={item.href} style={{
               textDecoration: 'none',
               padding: '8px 16px',
               borderRadius: 8,
               fontSize: 13,
               fontWeight: 600,
               color: isActive(item.href) ? 'var(--blue-600)' : 'var(--text-3)',
               background: isActive(item.href) ? 'var(--blue-50)' : 'transparent',
               transition: 'all 0.2s'
             }}>
               {item.label}
             </Link>
           ))}
        </div>

        {/* Mobile Hamburger */}
        <button className="nav-mobile" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer' }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="nav-mobile" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                textDecoration: 'none',
                fontSize: 18,
                fontWeight: 600,
                color: isActive(item.href) ? 'var(--blue-600)' : 'var(--text-1)'
              }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        .hover-bg-surface-2:hover { background: var(--surface-2) !important; }
      `}</style>
    </nav>
  )
}
