import Sidebar from '../../components/Sidebar'
import tools from '../../data/tools.json'
import Link from 'next/link'
import { Zap, Activity, Shield, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { paginate } from '../../lib/utils/pagination'

export default function ToolsHub() {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  const categories = [...new Set(tools.map(t => t.category))];
  
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">System / Diagnostics</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap size={32} className="text-blue-600" />
            Hardware Testbench
          </h1>
          <p style={{ color: 'var(--text-3)', marginTop: 8 }}>
            Select a specialized diagnostic engine to verify hardware integrity.
          </p>
        </div>

        {categories.map(cat => {
          const catTools = tools.filter(t => t.category === cat);
          const paged = paginate(catTools, 1, pageSize * page); // Simplified "Load More" logic

          return (
            <div key={cat} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <Activity size={16} />
                  {cat}
                </h2>
                <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{catTools.length} tools available</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {paged.items.map(tool => (
                  <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="test-card hover-grow" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ fontSize: 28 }}>{tool.icon}</span>
                        <span className="badge badge-ready">{tool.difficulty}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 6 }}>{tool.name}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', flex: 1, lineHeight: 1.5 }}>{tool.description}</p>
                      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {tool.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag" style={{ fontSize: 10, padding: '2px 8px' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {paged.hasMore && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    Load More Tools
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div className="card-flat" style={{ marginTop: 40, background: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Shield className="text-blue-600" size={24} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--blue-800)', fontSize: 14 }}>Full System Scan Required?</div>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                For deeper motherboard and software-level diagnostics, use the <Link href="/diagnostics" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>ScanLab Report Engine</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
