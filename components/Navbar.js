'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Zap, Activity, BookOpen, Menu, X, Terminal, ChevronRight, Sun, Moon } from 'lucide-react'
import { searchAll } from '../lib/engine/searchEngine'

const NAV_ITEMS = [
  { href: '/',            label: 'Dashboard',   icon: Zap },
  { href: '/#quick-tests', label: 'Quick Tests', icon: Terminal },
  { href: '/tools',       label: 'Labs Hub',    icon: Activity },
  { href: '/fixlab',      label: 'FixLab',      icon: BookOpen },
  { href: '/resources',   label: 'Resources',   icon: Search },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const searchRef = useRef(null)

  // Theme Persistence
  useEffect(() => {
    const saved = localStorage.getItem('hackrore_theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('hackrore_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

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
      background: 'var(--glass-bg)', 
      borderBottom: '1px solid var(--border)', 
      backdropFilter: 'var(--glass-blur)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000 
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        
        {/* Brand */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, transition: 'transform var(--duration) var(--ease)' }} 
          className="hover-scale" onClick={() => setOpen(false)}>
          <div className="nav-logo-sq" style={{ width: 32, height: 32, fontSize: 13 }}>HR</div>
          <div className="nav-desktop">
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>TECH<span style={{ color: 'var(--accent)' }}>TOOL</span></div>
          </div>
        </Link>

        {/* Global Search */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: 600, position: 'relative' }} className="nav-desktop">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search tools, guides, resources..." 
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.length > 1 && setSearchResults(searchAll(searchQuery))}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 16px 10px 40px',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all var(--duration) var(--ease)'
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
              background: 'var(--bg-secondary)',
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
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
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
               color: isActive(item.href) ? 'var(--accent)' : 'var(--text-secondary)',
               background: isActive(item.href) ? 'var(--accent-glow)' : 'transparent',
               transition: 'all var(--duration) var(--ease)'
             }} className="hover-lift">
               {item.label}
             </Link>
           ))}
        </div>

        {/* Mobile Hamburger */}
        <button className="nav-mobile" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

       {/* Mobile Menu */}
       {open && (
         <div className="nav-mobile-overlay" style={{ 
           position: 'fixed', inset: 0, top: 64, 
           background: 'var(--glass-bg)', 
           backdropFilter: 'var(--glass-blur)',
           zIndex: 999 
         }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 32 }}>
             {NAV_ITEMS.map(item => (
               <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                 textDecoration: 'none',
                 fontSize: 20,
                 fontWeight: 800,
                 padding: '16px 0',
                 borderBottom: '1px solid var(--border)',
                 color: isActive(item.href) ? 'var(--accent)' : 'var(--text-primary)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 transition: 'all var(--duration) var(--ease)'
               }}>
                 {item.label}
                 <ChevronRight size={16} style={{ opacity: 0.3 }} />
               </Link>
             ))}
             <button 
               onClick={toggleTheme}
               style={{
                 marginTop: 24,
                 background: 'var(--bg-secondary)',
                 border: '1px solid var(--border)',
                 borderRadius: 12,
                 padding: '16px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: 12,
                 color: 'var(--text-primary)',
                 fontWeight: 700
               }}
             >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
               {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
             </button>
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
