'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { 
  Zap, Activity, Shield, Clock, 
  FileCode, Hammer, Smartphone, MousePointer2, ChevronRight,
  ArrowRight, Search, Cpu, CheckCircle2, BookOpen, Terminal, Code,
  Wrench, Layers, Monitor, HardDrive
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
        
        {/* Modern Industrial Hero Section (thetest.com style) */}
        <section style={{ 
          margin: '0 auto 64px auto', textAlign: 'center', maxWidth: 840, padding: '64px 0' 
        }}>
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 900, padding: '6px 16px', borderRadius: 50, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                 Hachtool Diagnostic Suite // Professional Stable
              </div>
           </div>
           <h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: -2, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.1 }}>
             Precision <span style={{ color: 'var(--accent)' }}>hardware diagnostics</span> for technical field teams.
           </h1>
           <p style={{ fontSize: 19, color: 'var(--text-secondary)', marginBottom: 44, fontWeight: 500, maxWidth: 640, margin: '0 auto 44px auto', lineHeight: 1.6 }}>
             Fast-track system validation with our library of industrial protocols, repair guides, and deep telemetry modules.
           </p>
           
           <div style={{ position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', borderRadius: 100, background: '#FFF' }}>
              <Search style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} size={20} />
              <input 
                type="text" 
                placeholder="Search diagnostic protocols (e.g. 'Battery Wear', 'GPU Stress', 'SMPTE Display')..." 
                style={{ width: '100%', padding: '24px 32px 24px 64px', borderRadius: 100, border: '1px solid #EEE', fontSize: 16, outline: 'none', background: 'transparent', fontWeight: 500 }}
              />
              <button className="btn-primary" style={{ position: 'absolute', right: 10, top: 10, bottom: 10, borderRadius: 100, padding: '0 40px', fontSize: 13, background: 'var(--text-primary)', color: '#FFF', fontWeight: 900 }}>FIND_PROTOCOL</button>
           </div>

           {/* Hardware Quick-Discovery Tags */}
           <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
              {['SSD_SMART', 'Screen_Uniformity', 'LPDDR_Latency', 'Battery_Cap', 'FIRMWARE_AUDIT'].map(tag => (
                <span key={tag} style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: 50, cursor: 'pointer', border: '1px solid var(--border)', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>{tag}</span>
              ))}
           </div>
        </section>

        {/* Global Navigation Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 64 }}>
           {[
             { name: 'Hardware Tests', icon: <Monitor size={22} />, href: '/tools', desc: 'Active Validation' },
             { name: 'System Reports', icon: <FileCode size={22} />, href: '/diagnostics', desc: 'Telemetry Hub' },
             { name: 'Repair Wiki',    icon: <BookOpen size={22} />, href: '/fixlab', desc: 'Technical Support' },
             { name: 'Field Toolbox',  icon: <Wrench size={22} />, href: '/resources', desc: 'Utility Suite' }
           ].map(nav => (
             <Link key={nav.name} href={nav.href} style={{ padding: 28, background: '#FFF', borderRadius: 16, border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.3s var(--ease)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} className="card-hover">
                <div style={{ color: 'var(--accent)', background: 'var(--accent-soft)', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{nav.icon}</div>
                <div>
                   <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>{nav.name}</div>
                   <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{nav.desc}</div>
                </div>
             </Link>
           ))}
        </div>

        {/* Primary Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64 }}>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              
              {/* Technical Modules Section */}
              <section>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                       <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1 }}>Critical Lab Modules</h2>
                       <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Validated hardware testing protocols for laboratory use.</p>
                    </div>
                    <Link href="/tools" style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>Full Suite →</Link>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                    {tools.slice(0, 4).map(t => (
                      <Link key={t.id} href={`/tools/${t.slug}`} className="card" style={{ padding: 32, textDecoration: 'none', background: '#FFF', border: '1px solid var(--border)' }}>
                         <div style={{ fontSize: 32, marginBottom: 20, filter: 'grayscale(0.5)' }}>{t.icon}</div>
                         <h4 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 10 }}>{t.name} Protocol</h4>
                         <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Verify the {t.name.toLowerCase()} subsystem for precision and operational latency.</p>
                         <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 12, fontWeight: 900 }}>
                            LAUNCH_MODULE <ArrowRight size={12} />
                         </div>
                      </Link>
                    ))}
                 </div>
              </section>

              {/* Repair Articles Section */}
              <section>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1 }}>Technical Library</h2>
                    <Link href="/fixlab" style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>Wiki Index →</Link>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {KB.slice(0, 3).map(guide => (
                      <Link key={guide.id} href="/fixlab" style={{ padding: '24px', background: '#FFF', border: '1px solid var(--border)', borderRadius: 16, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="card-hover">
                         <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ width: 48, height: 48, background: 'var(--bg-secondary)', color: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                               <Layers size={20} />
                            </div>
                            <div>
                               <h5 style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: 16 }}>{guide.title}</h5>
                               <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{guide.category.toUpperCase()} // UPDATED_MARCH_2026</div>
                            </div>
                         </div>
                         <ChevronRight size={18} style={{ color: '#DDD' }} />
                      </Link>
                    ))}
                 </div>
              </section>

           </div>

           {/* Sidebar: Operational Command Panel */}
           <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div className="card" style={{ padding: 28, background: 'var(--text-primary)', color: '#FFF', borderRadius: 20 }}>
                 <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 2, marginBottom: 12 }}>PRO_EDITION // FIELD_USE</div>
                 <h4 style={{ fontSize: 19, fontWeight: 900, marginBottom: 12 }}>Hachtool Master Script</h4>
                 <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, marginBottom: 24 }}>Execute deep hardware scans locally and import telemetry into Hachtool Web.</p>
                 <a href="/scripts/Hachtool_Master.ps1" download className="btn-primary" style={{ width: '100%', background: '#FFF', color: 'var(--text-primary)', height: 48 }}>
                    <FileCode size={16} /> Deploy Script v2.5
                 </a>
              </div>

              <div>
                 <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20, paddingLeft: 8 }}>Live Telemetry</h4>
                 <div style={{ padding: 24, background: '#FFF', borderRadius: 20, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                       <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                       <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)' }}>Cloud Engine: ONLINE</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                       <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', opacity: 0.5 }} />
                       <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)' }}>Session: {sessionTime} PASS</span>
                    </div>
                 </div>
              </div>

              <div>
                 <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20, paddingLeft: 8 }}>Standard Channels</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {['BIOS Reset Protocol', 'SSD SMART Analysis', 'DirectX Diagnostics', 'Battery Cell Balancing'].map(title => (
                      <div key={title} style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 8 }}>
                         <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
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
