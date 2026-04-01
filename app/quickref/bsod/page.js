'use client'
import { useState, useMemo } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import bData from '../../../data/bsodCodes.json'
import { Search, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function BSODDecoder() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return bData.filter(b => 
      b.code.toLowerCase().includes(q) || 
      b.meaning.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <AppLayout>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '32px' }}>
           <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', marginBottom: '8px', letterSpacing: '-1px' }}>System StopCode Repository</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', lineHeight: 1.6 }}>
             Official technical reference for Windows NT Kernel StopCodes (BSOD). 
             Enter the error string to retrieve validated diagnostic protocols.
           </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search code (e.g. CRITICAL_PROCESS_DIED)..."
            value={query}
            onChange={e => {setQuery(e.target.value); setSelected(null)}}
            style={{ width: '100%', padding: '12px 16px 12px 42px', fontSize: '14px' }}
          />
        </div>

        {/* Results List */}
        {query && !selected && (
          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px'}}>
            {filtered.map(b => (
              <div 
                key={b.code} 
                onClick={() => setSelected(b)}
                className="card hover:glow-border" 
                style={{padding:'14px 20px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}
              >
                <div style={{fontWeight:700, fontSize:'14px'}}>{b.code}</div>
                <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{b.meaning.slice(0, 40)}...</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>No codes matched your search.</div>
            )}
          </div>
        )}

        {/* Selected View */}
        {selected && (
          <div className="animate-in">
            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px'}}>
              <button onClick={() => setSelected(null)} className="btn-outline" style={{padding:'4px 12px', fontSize:'11px'}}>← Back</button>
              <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Stop Code Details</div>
            </div>

            <div className="card-elevated" style={{padding:'40px', borderLeft:'4px solid var(--accent)'}}>
              <h2 style={{fontFamily:'JetBrains Mono,monospace', color:'var(--accent)', marginBottom:'16px'}}>{selected.code}</h2>
              <div style={{marginBottom:'32px', fontSize:'16px', lineHeight:1.6}}>{selected.meaning}</div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px'}}>
                <section>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'12px'}}>
                    <AlertCircle size={14} /> Common Causes
                  </div>
                  <ul style={{fontSize:'14px', color:'var(--text-secondary)', paddingLeft:'18px'}}>
                    {selected.causes.map((c, i) => <li key={i} style={{marginBottom:'6px'}}>{c}</li>)}
                  </ul>
                </section>

                <section>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'12px'}}>
                    <Terminal size={14} /> Fix Protocol
                  </div>
                  <div style={{
                    padding:'16px', borderRadius:'8px', background:'var(--bg-secondary)', border:'1px solid var(--border)',
                    fontSize:'13px', lineHeight:1.6, color:'var(--text-primary)'
                  }}>
                    {selected.fix}
                  </div>
                </section>
              </div>

              <div style={{marginTop:'40px', paddingTop:'20px', borderTop:'1px solid var(--border)', display:'flex', gap:'12px'}}>
                <button className="btn-primary" onClick={() => window.print()}>Print Protocol</button>
                <button className="btn-outline" onClick={() => { navigator.clipboard.writeText(selected.fix); alert('Fix protocol copied to clipboard') }}>Copy Fix</button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Suggestions */}
        {!query && !selected && (
          <div className="card" style={{padding:'32px', textAlign:'center', background:'var(--bg-secondary)'}}>
             <AlertCircle size={32} style={{color:'var(--text-muted)', marginBottom:'16px'}} />
             <h3 style={{marginBottom:'8px'}}>No code entered</h3>
             <p style={{fontSize:'13px', color:'var(--text-secondary)', margin:0}}>
               Search for common stop codes like <strong>MEMORY_MANAGEMENT</strong> or <strong>DPC_WATCHDOG_VIOLATION</strong> to see how it works.
             </p>
          </div>
        )}

      </main>
    </AppLayout>
  )
}
