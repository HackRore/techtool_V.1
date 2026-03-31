'use client'
import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Trash2, CheckCircle2, Clock, AlertCircle, ChevronRight, User } from 'lucide-react'

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newJob, setNewJob] = useState({ client: '', device: '', issue: '', status: 'In-Take' })

  useEffect(() => {
    const saved = localStorage.getItem('hr_jobs')
    if (saved) setJobs(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('hr_jobs', JSON.stringify(jobs))
  }, [jobs])

  const addJob = () => {
    if (!newJob.client || !newJob.device) return
    const job = { ...newJob, id: Date.now(), timestamp: new Date().toISOString() }
    setJobs([job, ...jobs])
    setNewJob({ client: '', device: '', issue: '', status: 'In-Take' })
    setShowAdd(false)
  }

  const deleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id))
  }

  const updateStatus = (id, status) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j))
  }

  const statusColors = {
    'In-Take': 'var(--text-muted)',
    'Testing': 'var(--status-info)',
    'Fixed': 'var(--status-pass)',
    'Delivered': 'var(--accent)'
  }

  return (
    <div className="card-elevated" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
       
       <div style={{ padding: '24px 32px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <ClipboardList size={18} style={{ color: 'var(--accent)' }} />
             <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Repairs Control Board</h3>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            style={{ 
              background: 'var(--accent)', border: 'none', width: 28, height: 28, 
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
             <Plus size={16} color="var(--bg-primary)" />
          </button>
       </div>

       <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          
          {showAdd && (
            <div className="animate-in" style={{ marginBottom: 32, padding: 24, background: 'var(--bg-primary)', border: '1px solid var(--accent)', borderRadius: 12 }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input 
                    type="text" placeholder="CLIENT_NAME" 
                    value={newJob.client} onChange={e => setNewJob({...newJob, client: e.target.value})}
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 0', fontSize: 13, color: '#fff', outline: 'none' }}
                  />
                  <input 
                    type="text" placeholder="DEVICE_MODEL" 
                    value={newJob.device} onChange={e => setNewJob({...newJob, device: e.target.value})}
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 0', fontSize: 13, color: '#fff', outline: 'none' }}
                  />
                  <input 
                    type="text" placeholder="ISSUE_SUMMARY" 
                    value={newJob.issue} onChange={e => setNewJob({...newJob, issue: e.target.value})}
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 0', fontSize: 13, color: '#fff', outline: 'none' }}
                  />
                  <button onClick={addJob} className="btn-accent" style={{ height: 40, fontSize: 11 }}>INITIALIZE_REPAIR_TICKET</button>
               </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             {jobs.length === 0 && !showAdd && (
               <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Clock size={32} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.3 }} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>NO_ACTIVE_TICKETS</div>
               </div>
             )}
             {jobs.map(job => (
               <div key={job.id} className="card-elevated" style={{ padding: 16, background: 'var(--bg-primary)', borderLeft: `3px solid ${statusColors[job.status]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                     <div>
                        <div style={{ fontSize: 11, fontWeight: 900, marginBottom: 2 }}>{job.client.toUpperCase()}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>{job.device}</div>
                     </div>
                     <div style={{ fontSize: 8, color: statusColors[job.status], fontWeight: 900, textTransform: 'uppercase', background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 4 }}>
                        {job.status}
                     </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{job.issue}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', gap: 6 }}>
                        {['Testing', 'Fixed', 'Delivered'].map(s => (
                          <button 
                            key={s} 
                            onClick={() => updateStatus(job.id, s)}
                            style={{ 
                              background: job.status === s ? statusColors[s] : 'var(--bg-elevated)', 
                              border: 'none', width: 24, height: 24, borderRadius: 6, display: 'flex', 
                              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                             {s === 'Testing' && <Activity size={12} color={job.status === s ? '#000' : 'var(--status-info)'} />}
                             {s === 'Fixed' && <CheckCircle2 size={12} color={job.status === s ? '#000' : 'var(--status-pass)'} />}
                             {s === 'Delivered' && <User size={12} color={job.status === s ? '#000' : 'var(--accent)'} />}
                          </button>
                        ))}
                     </div>
                     <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <a href="/report" style={{ textDecoration: 'none' }}>
                           <div className="badge badge-ready" style={{ fontSize: 7, height: 20 }}>GEN_REPORT</div>
                        </a>
                        <button 
                          onClick={() => deleteJob(job.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--status-fail)', cursor: 'pointer', padding: 4 }}
                        >
                           <Trash2 size={14} />
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

    </div>
  )
}
