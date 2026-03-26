'use client'
import Link from 'next/link'
import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import CommandCenter from '../components/ui/CommandCenter'

import tools from '../data/tools.json'
import guides from '../data/guides.json'
import { getFeaturedContent, getPopularContent } from '../lib/engine/searchEngine'
import { Star, TrendingUp, Zap, Activity, Sparkles, ChevronRight } from 'lucide-react'

export default function Home() {
  const featured = getFeaturedContent()
  const popular = getPopularContent()

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="breadcrumb">System / Dashboard</div>
        <h1 style={{ letterSpacing: '-0.03em' }}>
          Technician <span className="text-blue-600">Command Center</span>
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginTop: 4 }}>
          Elite hardware intelligence and automated troubleshooting for HackRore TechWorkbench.
        </p>
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
               <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>AI COPILOT</span>
             </div>
             <h2 style={{ color: 'white', fontSize: 24, marginBottom: 8 }}>AI Technician Assistant is Live</h2>
             <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Natural language diagnostics and guided hardware repairs.</p>
           </div>
           <div className="btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(10px)', fontWeight: 700 }}>
              Launch Assistant →
           </div>
           <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
             <Sparkles size={160} color="white" />
           </div>
         </div>
      </Link>

      {/* Featured Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
        {featured.tools.slice(0, 2).map(t => (
          <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
            <div className="card hover-grow" style={{ height: '100%', borderLeft: '4px solid var(--blue-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{t.icon}</span>
                <div className="badge badge-ready">Featured</div>
              </div>
              <h3>{t.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '12px 0 20px' }}>{t.description}</p>
              <div className="text-blue-600 font-mono" style={{ fontSize: 12, fontWeight: 700 }}>RUN ENGINE →</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)' }}>Hardware Testbench</h2>
            <Link href="/tools" className="text-blue-600" style={{ fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {tools.slice(0, 6).map(t => (
              <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card-flat hover-grow" style={{ padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{t.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 20 }}>Trending Fixes</h2>
          <div className="card" style={{ background: 'var(--surface-2)', padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {popular.guides.slice(0, 5).map(g => (
                <Link key={g.id} href={`/fixlab`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-600)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{g.title}</span>
                </Link>
              ))}
            </div>
            <Link href="/fixlab" className="btn-secondary" style={{ width: '100%', marginTop: 24, textAlign: 'center', textDecoration: 'none', display: 'block', padding: 10 }}>Open FixLab Library</Link>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
          HackRore TechWorkbench © 2026 · Hynet Technologies
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-4)' }}>
          <span>System v1.0.5</span>
          <span style={{ color: 'var(--green)' }}>● ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </AppLayout>
  )
}
