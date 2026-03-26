'use client'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'
import CommandCenter from '../components/ui/CommandCenter'

import tools from '../data/tools.json'
import guides from '../data/guides.json'
import { getFeaturedContent, getPopularContent } from '../lib/engine/searchEngine'
import { Star, TrendingUp, Zap, Activity, Sparkles } from 'lucide-react'

export default function Home() {
  const featured = getFeaturedContent()
  const popular = getPopularContent()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">System / Overview</div>
          <h1>System Dashboard</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Professional hardware diagnostics and troubleshooting hub.</p>
        </div>

        {/* AI Assistant Promo Banner */}
        <Link href="/assistant" style={{ textDecoration: 'none' }}>
           <div className="card hover-scale" style={{ 
             background: 'linear-gradient(135deg, var(--blue-600), #7c3aed)', 
             border: 'none', 
             marginBottom: 32, 
             padding: '24px 32px',
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             overflow: 'hidden',
             position: 'relative'
           }}>
             <div style={{ position: 'relative', zIndex: 2 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', opacity: 0.9, marginBottom: 8 }}>
                 <Sparkles size={16} />
                 <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>V.1.0 Feature Update</span>
               </div>
               <h2 style={{ color: 'white', fontSize: 24, marginBottom: 8 }}>AI Technician Copilot is now Live</h2>
               <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Try natural language diagnostics and guided hardware troubleshooting.</p>
             </div>
             <div className="btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(10px)', fontWeight: 700 }}>
                Launch Assistant →
             </div>
             {/* Decorative background element */}
             <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
               <Sparkles size={160} color="white" />
             </div>
           </div>
        </Link>

        {/* Featured Tools (Vibrant Hero Section) */}
        {featured.tools.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-4)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={16} fill="var(--yellow)" stroke="var(--yellow)" />
              Featured Master Tools
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {featured.tools.map(t => (
                <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ borderLeft: '4px solid var(--blue-600)', background: 'linear-gradient(to right, var(--blue-50), var(--surface))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 32 }}>{t.icon}</span>
                      <div className="badge badge-ready">Featured</div>
                    </div>
                    <h3 style={{ marginBottom: 8 }}>{t.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>{t.description}</p>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>Launch Engine →</button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Guides & Quick Tests Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, marginBottom: 48 }}>
          
          {/* Quick Hardware Tests */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-4)' }}>Hardware Testbench</h2>
              <Link href="/tools" style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-600)', textDecoration: 'none' }}>View All →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {tools.slice(0, 8).map(t => (
                <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="test-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>{t.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>{t.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Fixes */}
          <div className="card-flat" style={{ background: 'var(--surface)' }}>
            <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-4)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} />
              Trending Fixes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {popular.guides.map(guide => (
                <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="hover-bg-surface-2" style={{ padding: '12px 14px', borderRadius: 10, transition: 'all 0.2s', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{guide.title}</div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: guide.color, background: guide.bg, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{guide.category}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{guide.tags[0]}</span>
                     </div>
                  </div>
                </Link>
              ))}
              <Link href="/fixlab" className="btn-secondary" style={{ textAlign: 'center', padding: '10px', fontSize: 12, textDecoration: 'none', display: 'block', marginTop: 8 }}>Browse FixLab Library</Link>
            </div>
          </div>
        </div>

        {/* ScanLab / Command Center Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', border: '1px solid #334155' }}>
             <Activity className="text-blue-600" size={32} style={{ marginBottom: 16 }} />
             <h3 style={{ color: 'white' }}>System Diagnostics</h3>
             <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '12px 0 24px' }}>
               Run Elite Diagnostics using the HR Master script. Collects deep hardware telemetry and OS health data.
             </p>
             <Link href="/diagnostics" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Open Diagnostics Hub →</Link>
          </div>
          <div className="card">
             <CommandCenter />
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginBottom: 20, marginTop: 48 }}>
          <h2 style={{ marginBottom: 20 }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { n: '1', title: 'Open TestLab',   desc: 'Run 7 browser hardware tests — keyboard, screen, camera, mic, speaker, mouse, touch.' },
              { n: '2', title: 'Run Scanner',    desc: 'Execute HackRore.ps1 on Windows as Administrator to collect the system JSON report.' },
              { n: '3', title: 'Upload Report',  desc: 'Drag the JSON into ScanLab for a full interactive health dashboard.' },
              { n: '4', title: 'Fix Issues',     desc: 'Search FixLab for the problem and follow step-by-step repair instructions.' },
            ].map(s => (
              <div key={s.n} className="card-flat" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-4)' }}>
          HackRore TechWorkbench · Ravindra Pandit Ahire · Hynet Technologies, Pune · v1.0
        </div>
      </main>
    </div>
  )
}
