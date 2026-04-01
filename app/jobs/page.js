'use client'
import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { Plus, Search, Trash2, Printer, CheckCircle2, Clock, Package, Download, Upload, X, ChevronRight } from 'lucide-react'

export default function JobRegistryPage() {
  const [jobs, setJobs] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [newJob, setNewJob] = useState({ client:'', device:'', issue:'', status:'Intake', cost:'', notes:'' })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('hynet_job_registry')
    if (saved) setJobs(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('hynet_job_registry', JSON.stringify(jobs))
  }, [jobs])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const addJob = (e) => {
    e.preventDefault()
    if (!newJob.client || !newJob.device) return
    const job = { 
      ...newJob, 
      id: `HNT-${Date.now().toString().slice(-6)}`, 
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) 
    }
    setJobs([job, ...jobs])
    setNewJob({ client:'', device:'', issue:'', status:'Intake', cost:'', notes:'' })
    setShowAdd(false)
    showToast('New repair ticket generated successfully.')
  }

  const deleteJob = (id) => {
    if (confirm('Permanently decommission this repair ticket?')) {
      setJobs(jobs.filter(j => j.id !== id))
      showToast('Ticket purged from local registry.')
    }
  }

  const updateStatus = (id, status) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j))
  }

  const printInvoice = (job) => {
    const html = `<!DOCTYPE html><html><head>
      <title>INVOICE_${job.id} // ${job.client}</title>
      <style>
        body{font-family:'Inter',sans-serif;margin:0;padding:60px;color:#09090B;line-height:1.5}
        .hdr{border-bottom:3px solid #000;padding-bottom:24px;margin-bottom:40px;display:flex;justify-content:space-between;align-items:flex-end}
        h1{margin:0;font-size:28px;font-weight:900;letter-spacing:-1px}
        .meta{color:#71717A;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
        .section{margin-bottom:32px}
        .label{font-size:10px;font-weight:900;color:#71717A;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
        .val{font-size:16px;font-weight:700}
        table{width:100%;border-collapse:collapse;margin:32px 0}
        th{background:#F4F4F5;padding:12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #E4E4E7}
        td{padding:16px 12px;border-bottom:1px solid #F4F4F5;font-size:14px}
        .total{text-align:right;margin-top:40px;padding-top:20px;border-top:2px solid #000}
        .ftr{margin-top:80px;padding-top:20px;border-top:1px solid #E4E4E7;font-size:10px;color:#A1A1AA;text-align:center;font-weight:600;letter-spacing:1px}
        @media print{body{padding:20px}.no-print{display:none}}
      </style>
    </head><body>
      <div class="hdr">
        <div>
          <h1>HYNET_REPAIR_INVOICE</h1>
          <div class="meta">OFFICIAL_TICKET_ID: ${job.id}</div>
        </div>
        <div style="text-align:right">
          <div class="meta">DATE: ${job.date}</div>
          <div class="meta">ENGINEER: RAVINDRA // HYNET</div>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
        <div class="section"><div class="label">CLIENT_IDENTIFIER</div><div class="val">${job.client}</div></div>
        <div class="section"><div class="label">HARDWARE_PROFILE</div><div class="val">${job.device}</div></div>
      </div>

      <table><thead><tr><th>DESCRIPTION_OF_FAULT</th><th>SERVICE_STATUS</th><th>ESTIMATED_COST</th></tr></thead>
      <tbody><tr><td style="font-weight:600">${job.issue}</td><td>${job.status.toUpperCase()}</td><td style="font-weight:900">₹${job.cost || '0.00'}</td></tr></tbody></table>
      
      <div class="total">
        <div class="label">TOTAL_DUE_INR</div>
        <div style="font-size:32px;font-weight:900">₹${job.cost || '0.00'}</div>
      </div>

      <div class="ftr">Authorized Repair Document · Hynet Technologies Pune · Diagnostic Portal v5.0</div>
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
    a.download = `hynet_job_export_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    showToast('Job database exported successfully.')
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
          showToast(`Successfully imported ${imported.length} tickets.`)
        }
      } catch (err) {
        showToast('Error: Invalid backup format.')
      }
    }
    reader.readAsText(file)
  }

  const filtered = jobs.filter(j => 
    j.client.toLowerCase().includes(search.toLowerCase()) || 
    j.device.toLowerCase().includes(search.toLowerCase()) ||
    j.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Header Section: v8.0 Responsive Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: '6px 12px', background: 'var(--accent-soft)', borderRadius: 50, fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>MODULE: JOB_REGISTRY</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>PERSISTENCE: LOCAL_STORAGE</div>
                 </div>
                 <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '8px' }}>Job Registry</h1>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', lineHeight: 1.6 }}>
                    Persistent local database for tracking hardware repair cycles. Private data management.
                 </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: '200px' }}>
                 <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ width: '100%', height: '48px' }}>
                    <Plus size={18} strokeWidth={3} /> Create Repair Ticket
                 </button>
                 <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={exportJobs} className="btn-outline" style={{ flex: 1, fontSize: 10 }}>Download Backup</button>
                    <label className="btn-outline" style={{ flex: 1, fontSize: 10, cursor: 'pointer' }}>
                       Restore Data
                       <input type="file" accept=".json" onChange={importJobs} style={{ display: 'none' }} />
                    </label>
                 </div>
              </div>
           </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by client, device, or ticket ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '15px 16px 15px 52px', fontSize: '16px', 
              borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)'
            }}
          />
        </div>

        {/* Add Job Modal/Form */}
        {showAdd && (
          <div className="animate-in" style={{ 
            position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(4px)', 
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding: 20
          }}>
             <div className="card-elevated" style={{ width:'100%', maxWidth:'600px', padding:'40px', border:'1px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                   <h3 style={{ fontSize: 24, fontWeight: 900 }}>Generate Repair Ticket</h3>
                   <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24}/></button>
                </div>
                
                <form onSubmit={addJob} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="input-group">
                         <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>CLIENT_NAME</div>
                         <input required placeholder="e.g. John Doe" value={newJob.client} onChange={e=>setNewJob({...newJob, client:e.target.value})} style={{ width: '100%', padding: '12px' }} />
                      </div>
                      <div className="input-group">
                         <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>DEVICE_MODEL</div>
                         <input required placeholder="e.g. Dell Latitude 5420" value={newJob.device} onChange={e=>setNewJob({...newJob, device:e.target.value})} style={{ width: '100%', padding: '12px' }} />
                      </div>
                   </div>
                   
                   <div className="input-group">
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>ISSUE_DESCRIPTION</div>
                      <input required placeholder="e.g. No power, orange light flashing" value={newJob.issue} onChange={e=>setNewJob({...newJob, issue:e.target.value})} style={{ width: '100%', padding: '12px' }} />
                   </div>

                   <div className="input-group">
                      <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>PRICE_ESTIMATE (₹)</div>
                      <input placeholder="e.g. 4500" value={newJob.cost} onChange={e=>setNewJob({...newJob, cost:e.target.value})} style={{ width: '100%', padding: '12px' }} />
                   </div>

                   <button type="submit" className="btn-primary" style={{ marginTop: 12, paddingVertical: 16 }}>Generate HNT_TICKET</button>
                </form>
             </div>
          </div>
        )}

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(j => (
            <div key={j.id} className="card hover:glow-border" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                   <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', letterSpacing: 1 }}>TICKET_{j.id}</div>
                   <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>{j.date.toUpperCase()}</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: 4 }}>{j.device}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{j.client}</span>
                   <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }}></span>
                   <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{j.issue}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '160px' }}>
                 <select 
                   value={j.status} 
                   onChange={(e) => updateStatus(j.id, e.target.value)}
                   style={{
                     background:'var(--bg-secondary)', border:'1px solid var(--border)',
                     padding:'8px 16px', borderRadius:'8px', fontSize:'12px', color:'var(--text-primary)',
                     fontWeight:800, cursor:'pointer', width: '100%', appearance: 'none', textAlign: 'center'
                   }}
                 >
                    {['Intake', 'Diagnosing', 'Waiting Parts', 'Repairing', 'Ready', 'Delivered'].map(s => <option key={s}>{s}</option>)}
                 </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                 <button onClick={() => printInvoice(j)} className="btn-outline" title="Print Invoice" style={{ padding: '12px' }}><Printer size={18} /></button>
                 <button onClick={() => deleteJob(j.id)} className="btn-outline" title="Delete" style={{ padding: '12px', borderColor: 'rgba(226,75,74,0.3)', color: 'var(--red)' }}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}

          {jobs.length === 0 && !showAdd && (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '2px dashed var(--border)', borderRadius: '24px', background: 'var(--bg-secondary)', opacity: 0.8 }}>
               <Package size={64} style={{ marginBottom: '24px', color: 'var(--accent)', opacity: 0.4 }} />
               <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Registry Empty</h3>
               <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
                  No active repair tickets found in local storage. Click "Create Ticket" to initialize a new hardware diagnostic cycle.
               </p>
            </div>
          )}
        </div>

        {/* Global Toast: v8.0 Professional */}
        {toast && (
           <div className="animate-in" style={{ 
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', 
              background: 'var(--accent)', color: '#000', padding: '12px 24px', borderRadius: 12, 
              fontSize: 11, fontWeight: 900, zIndex: 10000 
           }}>
              {toast.toUpperCase()}
           </div>
        )}

      </main>
    </AppLayout>
  )
}
