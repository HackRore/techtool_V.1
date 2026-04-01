'use client'
import { useState, useMemo } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import bData from '../../../data/bsodCodes.json'
import { Search, Terminal, AlertCircle, CheckCircle2, ChevronLeft, Printer, Copy } from 'lucide-react'

export default function BSODDecoder() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return bData.filter(b => 
      b.code.toLowerCase().includes(q) || 
      b.meaning.toLowerCase().includes(q)
    )
  }, [query])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppLayout>
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        <div style={{ marginBottom: '48px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: '6px 10px', background: 'var(--accent-glow)', borderRadius: 6, fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>REF_LIB // BSOD</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>v5.0_DEFINITIVE</div>
           </div>
           <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '12px' }}>System StopCode Repository</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '700px', lineHeight: 1.6 }}>
             Professional technical reference for Windows NT Kernel StopCodes. 
             Search by error string to retrieve validated diagnostic protocols and repair guidance.
           </p>
        </div>

        {/* Search Input Container */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search code (e.g. CRITICAL_PROCESS_DIED)..."
            value={query}
            onChange={e => {setQuery(e.target.value); setSelected(null)}}
            style={{ 
              width: '100%', padding: '16px 16px 16px 52px', fontSize: '16px', 
              borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)'
            }}
          />
        </div>

        {/* Results List */}
        {query && !selected && (
          <div className="animate-in" style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'40px'}}>
            {filtered.map(b => (
              <div 
                key={b.code} 
                onClick={() => setSelected(b)}
                className="card hover:glow-border" 
                style={{padding:'20px 24px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}
              >
                <div>
                   <div style={{fontWeight:800, fontSize:'15px', marginBottom: 4}}>{b.code}</div>
                   <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{b.meaning}</div>
                </div>
                <ChevronLeft size={16} style={{transform:'rotate(180deg)', color:'var(--accent)'}} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{textAlign:'center', padding:'4rem', color:'var(--text-muted)', background:'var(--bg-secondary)', borderRadius:12}}>
                 No StopCodes matched your criteria. Ensure spelling matches Windows Event Viewer output.
              </div>
            )}
          </div>
        )}

        {/* Selected View (Professional Diagnostic Card) */}
        {selected && (
          <div className="animate-in">
            <button 
              onClick={() => setSelected(null)} 
              style={{ 
                display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', 
                color:'var(--text-muted)', cursor:'pointer', marginBottom:'32px', fontSize:'11px', fontWeight:800, letterSpacing:1
              }}
            >
              <ChevronLeft size={14} /> BACK TO REPOSITORY
            </button>

            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderBottom: '1px solid var(--border)' }}>
                 <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent)', letterSpacing: 2, marginBottom: 12 }}>STOP_CODE // ERROR_DETAIL</div>
                 <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 16 }}>{selected.code}</h2>
                 <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>{selected.meaning}</p>
              </div>

              <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '48px' }}>
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: 1 }}>
                    <AlertCircle size={16} /> PRIMARY_CAUSES
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selected.causes.map((c, i) => (
                       <div key={i} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 900 }}>•</span>
                          <span>{c}</span>
                       </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: 1 }}>
                    <Terminal size={16} /> REPAIR_PROTOCOL
                  </div>
                  <div style={{
                    padding: '24px', borderRadius: '12px', background: '#09090B', border: '1px solid var(--border)',
                    fontSize: '14px', lineHeight: 1.6, color: '#7ee787', fontFamily: 'var(--font-mono)'
                  }}>
                    {selected.fix}
                  </div>
                </section>
              </div>

              <div style={{ padding: '24px 40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => window.print()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Printer size={16} /> Print Protocol
                  </button>
                  <button onClick={() => handleCopy(selected.fix)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                    {copied ? <CheckCircle2 size={16} color="var(--accent)" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy Fix Protocol'}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>HYNET // TECH_WORKBENCH</div>
              </div>
            </div>
          </div>
        )}

        {/* Home View / Guidance */}
        {!query && !selected && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 16 }}>
             <Terminal size={40} style={{ color: 'var(--accent)', marginBottom: '24px', opacity: 0.5 }} />
             <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: '12px' }}>Awaiting Input...</h3>
             <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
               Search for critical stop codes to access validated field repair procedures. Common codes: <strong>WHEA_UNCORRECTABLE_ERROR</strong>, <strong>DPC_WATCHDOG_VIOLATION</strong>.
             </p>
          </div>
        )}

      </main>
    </AppLayout>
  )
}
