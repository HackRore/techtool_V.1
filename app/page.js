'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Clock, 
  FileCode, Hammer, Smartphone, MousePointer2, ChevronRight,
  ArrowRight, Search, Cpu, CheckCircle2, BookOpen, Terminal, Code
} from 'lucide-react'

import tools from '../data/tools.json'
import { KB } from '../lib/knowledgeBase'

export default function Dashboard() {
  const [sessionTime, setSessionTime] = useState('00:00')
  
  useEffect(() => {
    const start = Date.now()
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000)
      setSessionTime(
        String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
      )
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <AppLayout>
      <div className="animate-in" style={{ minWidth: 0 }}>
        
        {/* GFG-Style Search Hero Cluster */}
        <section style={{ 
          margin: '0 auto 64px auto', textAlign: 'center', maxWidth: 800, padding: '40px 0' 
        }}>
           <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: -1.5, color: '#222', marginBottom: 16 }}>
             What would you like to <span style={{ color: 'var(--accent)' }}>test</span> today?
           </h1>
           <p style={{ fontSize: 18, color: '#666', marginBottom: 40, fontWeight: 500 }}>
             Search our technical database of hardware protocols, repair guides, and diagnostic modules.
           </p>
           
           <div style={{ position: 'relative', boxShadow: '0 12px 48px rgba(0,0,0,0.08)', borderRadius: 100 }}>
              <Search style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
              <input 
                type="text" 
                placeholder="Search tutorials (e.g. 'Battery Wear', 'Screen Flickering', 'Numpad Code')..." 
                style={{ width: '100%', padding: '20px 32px 20px 64px', borderRadius: 100, border: '1px solid #E0E0E0', fontSize: 16, outline: 'none' }}
              />
              <button className="btn-primary" style={{ position: 'absolute', right: 8, top: 8, bottom: 8, borderRadius: 100, padding: '0 32px' }}>Search</button>
           </div>

           {/* Hero Tags */}
           <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              {['Data Structures', 'Algorithms', 'Hardware', 'Drives', 'Battery'].map(tag => (
                <span key={tag} style={{ fontSize: 12, color: '#777', background: '#F5F5F5', padding: '6px 14px', borderRadius: 50, cursor: 'pointer', border: '1px solid #EEE' }}>{tag}</span>
              ))}
           </div>
        </section>

        {/* GFG-Style Quick Navigation Sub-Bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 48, borderBottom: '1px solid #EEE', paddingBottom: 24 }}>
           {[
             { name: 'Hardware Diagnostics', icon: <Cpu size={18} />, href: '/tools' },
             { name: 'System Reports', icon: <Activity size={18} />, href: '/diagnostics' },
             { name: 'Repair Protocol Wiki', icon: <BookOpen size={18} />, href: '/fixlab' },
             { name: 'Technician toolbox', icon: <Terminal size={18} />, href: '#' }
           ].map(nav => (
             <Link key={nav.name} href={nav.href} style={{ flex: 1, padding: 20, background: '#FFF', borderRadius: 12, border: '1px solid #EEE', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, transition: '0.2s' }} className="card-hover">
                <div style={{ color: 'var(--accent)' }}>{nav.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#333' }}>{nav.name}</div>
             </Link>
           ))}
        </div>

        {/* Feature Grid: Multi-Column GFG Structure */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 64 }}>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              
              {/* Category Section: Diagnostics */}
              <section>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
                       <Code size={24} style={{ color: 'var(--accent)' }} /> 
                       Diagnostic Protocols
                    </h2>
                    <Link href="/tools" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>View All →</Link>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    {tools.slice(0, 4).map(t => (
                      <Link key={t.id} href={`/tools/${t.slug}`} className="card" style={{ padding: 24, textDecoration: 'none', background: '#F8F9FA' }}>
                         <div style={{ fontSize: 32, marginBottom: 16 }}>{t.icon}</div>
                         <h4 style={{ fontSize: 16, fontWeight: 800, color: '#222', marginBottom: 8 }}>{t.name} Validation</h4>
                         <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>Deep hardware test for peripheral {t.id} subsystem health.</p>
                      </Link>
                    ))}
                 </div>
              </section>

              {/* Category Section: Guides */}
              <section>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
                       <BookOpen size={24} style={{ color: 'var(--accent)' }} /> 
                       Recently Updated Guides
                    </h2>
                    <Link href="/fixlab" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>View Library →</Link>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {KB.slice(0, 3).map(guide => (
                      <Link key={guide.id} href="/fixlab" style={{ padding: '20px 24px', background: '#FFF', border: '1px solid #EEE', borderRadius: 12, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="card-hover">
                         <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, background: '#F0F7F1', color: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <Hammer size={18} />
                            </div>
                            <div>
                               <h5 style={{ fontWeight: 800, color: '#222', fontSize: 15 }}>{guide.title}</h5>
                               <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{guide.category} • 15 min read</div>
                            </div>
                         </div>
                         <ArrowRight size={16} style={{ color: '#CCC' }} />
                      </Link>
                    ))}
                 </div>
              </section>

           </div>

           {/* Sidebar: GFG Content-Priority Sidebar */}
           <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div className="card" style={{ padding: 24, background: '#2E3D49', color: '#FFF' }}>
                 <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Technician Certification</h4>
                 <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6, marginBottom: 20 }}>Get certified as a Hachtool Hardware Engineer and unlock pro protocols.</p>
                 <button className="btn-primary" style={{ width: '100%', background: '#FFF', color: '#2E3D49' }}>Enroll Now</button>
              </div>

              <div>
                 <h4 style={{ fontSize: 11, fontWeight: 900, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Live Status</h4>
                 <div style={{ padding: 20, background: '#F8F9FA', borderRadius: 12, border: '1px solid #EEE' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                       <span style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Cloud Engine Optimal</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                       <span style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Session Active: {sessionTime}</span>
                    </div>
                 </div>
              </div>

              <div>
                 <h4 style={{ fontSize: 11, fontWeight: 900, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Trending Articles</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {['BIOS Reset Protocol', 'SSD SMART Analysis', 'Volatile Memory Leaks', 'Battery Cell Balancing'].map(title => (
                      <div key={title} style={{ fontSize: 13, fontWeight: 700, color: '#444', cursor: 'pointer', display: 'flex', gap: 12 }}>
                         <span style={{ color: '#DDD' }}>#</span>
                         {title}
                      </div>
                    ))}
                 </div>
              </div>

           </aside>

        </div>

      </div>
    </AppLayout>
  )
}
