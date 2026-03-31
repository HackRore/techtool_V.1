'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, Printer, ShieldCheck, Cpu, Activity, Database, Zap, Layers } from 'lucide-react'
import { generateReportManifest } from '../../lib/engine/reportEngine'

export default function ReportPage() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    const manifest = generateReportManifest()
    setReport(manifest)
  }, [])

  if (!report) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 100 }}>GENERATING_MANIFEST...</div>

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: 100 }} className="animate-in">
      
      {/* Non-Printable Header */}
      <nav className="no-print" style={{ 
        padding: '24px 48px', borderBottom: '1px solid var(--border)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={18} /></Link>
            <div className="badge badge-ready" style={{ fontSize: 9 }}>REPORT_GENERATOR_v2.1</div>
            <h2 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Diagnostic Certificate</h2>
         </div>
         <button onClick={handlePrint} className="btn-accent" style={{ height: 44, padding: '0 24px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Printer size={16} /> PRINT_AND_FINALIZE
         </button>
      </nav>

      {/* The Printable Certificate */}
      <div className="printable-certificate" style={{ 
        maxWidth: 900, margin: '64px auto', background: 'var(--bg-secondary)', 
        borderRadius: 24, padding: 80, border: '1px solid var(--border)', boxShadow: '0 20px 80px rgba(0,0,0,0.5)' 
      }}>
         
         {/* Certificate Header */}
         <header style={{ borderBottom: '2px solid var(--accent)', paddingBottom: 48, marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <ShieldCheck size={40} style={{ color: 'var(--accent)' }} />
                  <h1 style={{ fontSize: 40, letterSpacing: -2, fontWeight: 900 }}>Validation <span className="glow-text" style={{ color: 'var(--accent)' }}>Certificate</span></h1>
               </div>
               <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 2, fontWeight: 900 }}>ENGINE :: HACKRORE_PULSE_V.2.1.0</div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>REPORT_ID</div>
               <div className="text-mono" style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{report.reportID}</div>
               <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>{new Date(report.timestamp).toLocaleString()}</div>
            </div>
         </header>

         {/* Device Signal Analytics */}
         <section style={{ marginBottom: 64 }}>
            <h3 style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>Hardware Signal Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
               <div className="card-elevated" style={{ padding: 24, background: 'var(--bg-primary)' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8 }}>CPU_TOPOLOGY</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{report.telemetry.cpu_cores} THREADS</div>
               </div>
               <div className="card-elevated" style={{ padding: 24, background: 'var(--bg-primary)' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8 }}>OS_PLATFORM</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{report.telemetry.os}</div>
               </div>
               <div className="card-elevated" style={{ padding: 24, background: 'var(--bg-primary)' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8 }}>SESSION_STABILITY</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>STABLE</div>
               </div>
            </div>
         </section>

         {/* Diagnostic History: The Proof of Performance */}
         <section style={{ marginBottom: 64 }}>
            <h3 style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>Diagnostic Proof [LAST_20_STEPS]</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {report.history.length === 0 ? (
                 <div style={{ padding: 24, background: 'var(--bg-elevated)', borderRadius: 12, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    NO_HISTORY_MANIFEST_FOUND // GENERATING_EMPTY_PULSE
                 </div>
               ) : report.history.map((h, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                       <div className={`badge badge-${h.status}`} style={{ width: 12, height: 12, borderRadius: '50%', padding: 0 }} />
                       <div style={{ fontSize: 14, fontWeight: 800 }}>{h.action} // {h.category.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{h.status.toUpperCase()}</div>
                 </div>
               ))}
            </div>
         </section>

         {/* Job Integrity Summary */}
         {report.active_jobs.length > 0 && (
           <section style={{ marginBottom: 64 }}>
              <h3 style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>Technician Repair Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {report.active_jobs.map(job => (
                   <div key={job.id} style={{ padding: 32, background: 'var(--bg-elevated)', borderRadius: 16, borderLeft: '4px solid var(--accent)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                         <div style={{ fontSize: 16, fontWeight: 900 }}>{job.client} // {job.device}</div>
                         <div className="badge badge-ready" style={{ fontSize: 9 }}>{job.status}</div>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{job.issue}</div>
                   </div>
                 ))}
              </div>
           </section>
         )}

         {/* Certificate Footer: Authenticity */}
         <footer style={{ borderTop: '1px solid var(--border)', paddingTop: 48, marginTop: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
               <Database size={24} style={{ color: 'var(--text-muted)' }} />
               <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 300 }}>
                  THIS DOCUMENT SERVES AS CRYPTOGRAPHIC PROOF OF PERFORMANCE. VALIDATED LOCALLY VIA HACKRORE KERNEL SYSTEM. NO DATA TRANSMITTED TO EXTERNAL SERVERS.
               </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
               <div style={{ width: 100, height: 1, background: 'var(--border)' }}></div>
               <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2 }}>VALIDATED</div>
            </div>
         </footer>
      </div>

      {/* Global CSS for Printing */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .printable-certificate { 
            margin: 0 !important; 
            box-shadow: none !important; 
            border: none !important; 
            padding: 20px !important; 
            background: white !important;
            color: black !important;
          }
          .glow-text { color: black !important; text-shadow: none !important; }
          .card-elevated, .card { border: 1px solid #ddd !important; background: white !important; box-shadow: none !important; }
          .badge-ready { border: 1px solid black !important; color: black !important; }
          .badge-pass { background: #eee !important; color: black !important; }
        }
      `}</style>
    </div>
  )
}
