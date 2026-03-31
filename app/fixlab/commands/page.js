'use client'
import { useState } from 'react'
import Link from 'next/link'
import AppLayout from '../../../components/layout/AppLayout'
import { Terminal, Copy, Check, Info, Shield, ArrowLeft, Zap, Layers, Activity } from 'lucide-react'
import { useToast } from '../../../components/ui/ToastProvider'

const CMD_DATA = [
  { 
    group: 'KERNEL_INTEGRITY', 
    commands: [
      { id: 'sfc', name: 'SFC /SCANNOW', cmd: 'sfc /scannow', desc: 'Scan and repair system file corruption.', admin: true },
      { id: 'dism_check', name: 'DISM CHECK_HEALTH', cmd: 'DISM /Online /Cleanup-Image /CheckHealth', desc: 'Verify component store integrity.', admin: true },
      { id: 'dism_repair', name: 'DISM RESTORE_HEALTH', cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Repair component store from Windows Update.', admin: true },
      { id: 'chkdsk', name: 'CHKDSK_SYSTEM', cmd: 'chkdsk /f /r', desc: 'Validate file system and mark bad clusters.', admin: true },
    ]
  },
  {
    group: 'NETWORK_SIGNAL',
    commands: [
      { id: 'ip_release', name: 'IP_RELEASE', cmd: 'ipconfig /release', desc: 'Clear current DHCP leases.', admin: false },
      { id: 'ip_renew', name: 'IP_RENEW', cmd: 'ipconfig /renew', desc: 'Request new DHCP leases.', admin: false },
      { id: 'dns_flush', name: 'DNS_FLUSH', cmd: 'ipconfig /flushdns', desc: 'Purge DNS resolver cache.', admin: true },
      { id: 'netsh_reset', name: 'NETSH_WINSOCK_RESET', cmd: 'netsh winsock reset', desc: 'Reset network stack to factory defaults.', admin: true },
    ]
  },
  {
    group: 'SYSTEM_HARDENING',
    commands: [
      { id: 'gpupdate', name: 'FORCE_GPO_UPDATE', cmd: 'gpupdate /force', desc: 'Re-apply all local and domain policies.', admin: true },
      { id: 'power_cfg', name: 'HIBERNATE_OFF', cmd: 'powercfg -h off', desc: 'Disable hibernation to clear hiberfil.sys.', admin: true },
      { id: 'tasklist', name: 'LIST_ALL_TASKS', cmd: 'tasklist /v', desc: 'Detailed view of all active processes.', admin: false },
      { id: 'shutdown', name: 'RESTART_TO_UEFI', cmd: 'shutdown /r /fw /t 0', desc: 'Instant reboot directly into UEFI/BIOS.', admin: true },
    ]
  }
]

export default function CommandForge() {
  const [copiedId, setCopiedId] = useState(null)
  const { addToast } = useToast()

  const copyToClipboard = (cmd, id) => {
    navigator.clipboard.writeText(cmd)
    setCopiedId(id)
    addToast({ title: 'COPIED', message: `CRITICAL_CMD_FORGED: ${cmd}`, status: 'success' })
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <AppLayout>
      <div className="animate-in">
        
        {/* Hub Header */}
        <header style={{ marginBottom: 48, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Link href="/fixlab" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
              <div className="badge badge-ready" style={{ fontSize: 10 }}>INTELLIGENCE_LAYER // COMMAND_FORGE</div>
           </div>
           <h1>Command <span className="glow-text" style={{ color: 'var(--accent)' }}>Forge Hub</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 650, lineHeight: 1.6, marginTop: 12 }}>
             Precision technician command strings for rapid integrity restoration. One-click Forge & Export to target terminals.
           </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
           {CMD_DATA.map(group => (
             <div key={group.group} className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Zap size={14} style={{ color: 'var(--accent)' }} />
                   <h3 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>{group.group}</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {group.commands.map((c, i) => (
                     <div key={c.id} style={{ 
                        padding: '24px', borderBottom: i === group.commands.length - 1 ? 'none' : '1px solid var(--border)',
                        display: 'flex', flexDirection: 'column', gap: 16
                     }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                           <div>
                              <h4 style={{ fontSize: 15, fontWeight: 900, letterSpacing: -0.5, color: '#fff', marginBottom: 4 }}>{c.name}</h4>
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</p>
                           </div>
                           {c.admin && (
                             <div className="badge badge-ready" style={{ fontSize: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
                                ADMIN_REQUIRED
                             </div>
                           )}
                        </div>

                        <div 
                          onClick={() => copyToClipboard(c.cmd, c.id)}
                          style={{ 
                            background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: 10, border: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                            transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                          }}
                          className="hover:border-accent"
                        >
                           <code style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.cmd}</code>
                           {copiedId === c.id ? <Check size={14} style={{ color: 'var(--status-pass)' }} /> : <Copy size={14} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

        {/* Global Terminal Cheat Sheet */}
        <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
           <div className="card-elevated" style={{ padding: 40, borderLeft: '4px solid var(--accent)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                 <Terminal size={24} style={{ color: 'var(--accent)' }} />
                 <h2 style={{ fontSize: 20, fontWeight: 900 }}>Technician <span className="glow-text">Standard Path</span> Summary</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
                 <div>
                    <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>SYSTEM_FILE_INTEGRITY</h4>
                    <pre style={{ fontSize: 11, background: 'var(--bg-primary)', padding: 16, borderRadius: 8, color: 'var(--text-secondary)' }}>
                       sfc /scannow<br/>
                       dism /online /cleanup-image /restorehealth<br/>
                       chkdsk /f /r
                    </pre>
                 </div>
                 <div>
                    <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>NETWORK_RESET_CHAIN</h4>
                    <pre style={{ fontSize: 11, background: 'var(--bg-primary)', padding: 16, borderRadius: 8, color: 'var(--text-secondary)' }}>
                       ipconfig /flushdns<br/>
                       netsh winsock reset<br/>
                       netsh int ip reset
                    </pre>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                       "The Standard Path saves an average of 14 minutes per software repair by standardizing integrity audits."
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </AppLayout>
  )
}
