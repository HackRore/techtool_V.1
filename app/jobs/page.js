'use client'
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { Plus, Search, Trash2, Printer, CheckCircle2, Clock, Package } from 'lucide-react'

export default function JobBoardPage() {
  const [jobs, setJobs] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [newJob, setNewJob] = useState({ client:'', device:'', issue:'', status:'Intake', cost:'' })

  useEffect(() => {
    const saved = localStorage.getItem('hr_jobs')
    if (saved) setJobs(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('hr_jobs', JSON.stringify(jobs))
  }, [jobs])

  const addJob = (e) => {
    e.preventDefault()
    if (!newJob.client || !newJob.device) return
    const job = { ...newJob, id: Date.now(), date: new Date().toLocaleDateString('en-IN') }
    setJobs([job, ...jobs])
    setNewJob({ client:'', device:'', issue:'', status:'Intake', cost:'' })
    setShowAdd(false)
  }

  const deleteJob = (id) => {
    if (confirm('Delete this repair ticket?')) {
      setJobs(jobs.filter(j => j.id !== id))
    }
  }

  const updateStatus = (id, status) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j))
  }

  const printInvoice = (job) => {
    const html = `<!DOCTYPE html><html><head><title>Invoice — ${job.client}</title><style>
      body{font-family:sans-serif;padding:40px}
      .hdr{border-bottom:2px solid #333;margin-bottom:30px;display:flex;justify-content:space-between}
      .dtl{margin-bottom:20px;line-height:1.6}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #eee;padding:12px;text-align:left}
      .total{text-align:right;font-size:20px;font-weight:700;margin-top:30px}
    </style></head><body>
      <div class="hdr"><div><h1>Repair Invoice</h1><p>HackRore Workbench</p></div><div><p>Date: ${job.date}</p><p>Job ID: ${job.id}</p></div></div>
      <div class="dtl"><strong>Client:</strong> ${job.client}<br><strong>Device:</strong> ${job.device}</div>
      <table><thead><tr><th>Description</th><th>Status</th><th>Estimate</th></tr></thead>
      <tbody><tr><td>${job.issue}</td><td>${job.status}</td><td>₹${job.cost || '—'}</td></tr></tbody></table>
      <div class="total">Total Due: ₹${job.cost || '0'}</div>
      <p style="margin-top:50px;font-size:12px;color:#666">Thank you for your business. Hynet Technologies.</p>
    </body></html>`
    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  const exportJobs = () => {
    const data = JSON.stringify(jobs, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `techworkbench_jobs_${new Date().toISOString().slice(0,10)}.json`
    a.click()
  }

  const importJobs = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result)
        if (Array.isArray(imported)) {
          setJobs([...imported, ...jobs])
          alert(`Success: Imported ${imported.length} tickets.`)
        }
      } catch (err) {
        alert('Error: Invalid backup file format.')
      }
    }
    reader.readAsText(file)
  }

  const filtered = jobs.filter(j => 
    j.client.toLowerCase().includes(search.toLowerCase()) || 
    j.device.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
           <div>
              <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', marginBottom: '8px' }}>JobBoard</h1>
              <div style={{display:'flex', gap:'12px'}}>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Local-first repair ticket management.</p>
                 <button onClick={exportJobs} style={{background:'none', border:'none', color:'var(--accent)', fontSize:'11px', cursor:'pointer', padding:0}}>Export JSON</button>
                 <label style={{color:'var(--text-muted)', fontSize:'11px', cursor:'pointer'}}>
                    Import JSON
                    <input type="file" accept=".json" onChange={importJobs} style={{display:'none'}} />
                 </label>
              </div>
           </div>
           <button className="btn-primary" onClick={() => setShowAdd(true)} style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <Plus size={18} strokeWidth={3} /> New Ticket
           </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search clients or devices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', fontSize: '14px' }}
          />
        </div>

        {showAdd && (
          <div className="card-elevated animate-in" style={{padding:'24px', marginBottom:'32px', border:'1px solid var(--accent)'}}>
             <h3 style={{marginBottom:'20px'}}>Create Repair Ticket</h3>
             <form onSubmit={addJob} style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px'}}>
                <input placeholder="Client Name" value={newJob.client} onChange={e=>setNewJob({...newJob, client:e.target.value})} style={{padding:'10px'}} />
                <input placeholder="Device (e.g. Dell XPS 13)" value={newJob.device} onChange={e=>setNewJob({...newJob, device:e.target.value})} style={{padding:'10px'}} />
                <input placeholder="Issue Description" value={newJob.issue} onChange={e=>setNewJob({...newJob, issue:e.target.value})} style={{padding:'10px'}} />
                <input placeholder="Estimated Cost (₹)" value={newJob.cost} onChange={e=>setNewJob({...newJob, cost:e.target.value})} style={{padding:'10px'}} />
                <div style={{gridColumn:'1 / span 2', display:'flex', gap:'12px', marginTop:'8px'}}>
                   <button type="submit" className="btn-primary" style={{flex:1}}>Create Ticket</button>
                   <button type="button" onClick={()=>setShowAdd(false)} className="btn-outline" style={{flex:1}}>Cancel</button>
                </div>
             </form>
          </div>
        )}

        {/* Jobs List */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {filtered.map(j => (
            <div key={j.id} className="card hover:glow-border" style={{padding:'20px 24px', display:'flex', alignItems:'center', gap:'24px'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px', fontWeight:900, color:'var(--text-muted)', marginBottom:'4px'}}>CLIENT: {j.client.toUpperCase()}</div>
                <div style={{fontSize:'18px', fontWeight:700}}>{j.device}</div>
                <div style={{fontSize:'13px', color:'var(--text-secondary)', marginTop:'4px'}}>{j.issue}</div>
              </div>

              <div style={{textAlign:'right', minWidth:'140px'}}>
                 <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px'}}>{j.date}</div>
                 <select 
                   value={j.status} 
                   onChange={(e) => updateStatus(j.id, e.target.value)}
                   style={{
                     background:'var(--bg-secondary)', border:'1px solid var(--border)',
                     padding:'6px 12px', borderRadius:'6px', fontSize:'12px', color:'var(--text-primary)',
                     fontWeight:600, cursor:'pointer'
                   }}
                 >
                    <option>Intake</option>
                    <option>Diagnosing</option>
                    <option>Waiting Parts</option>
                    <option>Repairing</option>
                    <option>Ready</option>
                    <option>Delivered</option>
                 </select>
              </div>

              <div style={{display:'flex', gap:'8px'}}>
                 <button onClick={() => printInvoice(j)} className="btn-outline" title="Print Invoice" style={{padding:'8px'}}><Printer size={16} /></button>
                 <button onClick={() => deleteJob(j.id)} className="btn-outline" title="Delete" style={{padding:'8px', borderColor:'var(--red)', color:'var(--red)'}}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}

          {jobs.length === 0 && !showAdd && (
            <div style={{textAlign:'center', padding:'4rem', border:'2px dashed var(--border)', borderRadius:'20px', color:'var(--text-muted)'}}>
               <Package size={48} style={{marginBottom:'16px', opacity:0.3}} />
               <h3>No active repair tickets</h3>
               <p style={{fontSize:'14px'}}>Click "New Ticket" to start tracking a job.</p>
            </div>
          )}
        </div>

      </main>
    </AppLayout>
  )
}
