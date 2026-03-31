'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import AppLayout from '../../../components/layout/AppLayout'
import { Search, AlertCircle, Cpu, Shield, Zap, ArrowLeft, RefreshCcw } from 'lucide-react'

const BSOD_DATA = [
  { code: '0x000000D1', name: 'DRIVER_IRQL_NOT_LESS_OR_EQUAL', culprit: 'Network/Graphics Drivers', fix: 'Roll back or update the flagged driver in Safe Mode. Check for system file corruption (SFC).' },
  { code: '0x0000000A', name: 'IRQL_NOT_LESS_OR_EQUAL', culprit: 'Memory/Kernel conflict', fix: 'Check RAM for errors. Remove recently installed drivers or hardware. Verify BIOS/UEFI version.' },
  { code: '0x0000001E', name: 'KMODE_EXCEPTION_NOT_HANDLED', culprit: 'Third-party driver/AV', fix: 'Uninstall third-party antivirus. Check for overclocking instability. Update device firmware.' },
  { code: '0x00000024', name: 'NTFS_FILE_SYSTEM', culprit: 'Disk corruption/Cable fault', fix: 'Run chkdsk /f /r on all partitions. Check SATA/M.2 connections. Verify disk S.M.A.R.T. health.' },
  { code: '0x0000003B', name: 'SYSTEM_SERVICE_EXCEPTION', culprit: 'GUI/DirectX driver conflict', fix: 'Update graphics drivers. Check for Windows Update compatibility issues. Run DISM tool.' },
  { code: '0x00000050', name: 'PAGE_FAULT_IN_NONPAGED_AREA', culprit: 'RAM failure/AV conflict', fix: 'Replace suspected RAM module. Check virtual memory settings. Disable recently added hardware.' },
  { code: '0x0000007B', name: 'INACCESSIBLE_BOOT_DEVICE', culprit: 'SATA/AHCI Mode/Boot sectors', fix: 'Switch between AHCI/RAID in BIOS. Fix MBR/BCD via Recovery Environment. Check drive cables.' },
  { code: '0x0000009F', name: 'DRIVER_POWER_STATE_FAILURE', culprit: 'Power management driver', fix: 'Disable Fast Startup. Update chipset and battery management drivers. Check sleep settings.' },
  { code: '0x000000BE', name: 'ATTEMPTED_WRITE_TO_READONLY_MEMORY', culprit: 'Corrupt driver/service', fix: 'Identify driver in dump file. Use Driver Verifier to catch the offender. SFC /scannow.' },
  { code: '0x000000ED', name: 'UNMOUNTABLE_BOOT_VOLUME', culprit: 'Disk/FS failure', fix: 'Run chkdsk /r. If persistent, replace storage drive. Rebuild BCD and MBR.' },
  { code: '0x000000FE', name: 'USB_BUGCODE_INTERNAL_ERROR', culprit: 'USB peripheral/controller', fix: 'Disconnect all USB devices. Update USB root hub drivers. Check for shorted USB ports.' },
  { code: '0x00000116', name: 'VIDEO_TDR_FAILURE', culprit: 'GPU TIMEOUT', fix: 'Update GPU drivers. Reset GPU overclock. Check GPU thermals and power connection (PCI-E 8-pin).' },
  { code: 'CRITICAL_PROCESS_DIED', name: 'SYSTEM_PROCESS_FAILURE', culprit: 'Core OS File Corruption', fix: 'Run SFC and DISM offline. Check for rootkits. Reinstall Windows if persistent.' },
  { code: 'BAD_POOL_HEADER', name: 'BAD_POOL_HEADER', culprit: 'Memory allocation conflict', fix: 'Check RAM with MemTest86. Uninstall recently added software/hardware drivers.' },
]

export default function BSODDecoder() {
  const [query, setQuery] = useState('')

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return BSOD_DATA.filter(b => 
      b.code.toLowerCase().includes(q) || 
      b.name.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <AppLayout>
      <div className="animate-in">
        
        {/* Hub Header */}
        <header style={{ marginBottom: 48, borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Link href="/fixlab" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
              <div className="badge badge-ready" style={{ fontSize: 10 }}>INTELLIGENCE_LAYER // BSOD_DECODER</div>
           </div>
           <h1>Blue Screen <span className="glow-text" style={{ color: 'var(--accent)' }}>Signal Decoder</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 600, lineHeight: 1.6, marginTop: 12 }}>
             Decode elusive Windows Stop Codes and instant repair protocols. We provide the "Standard Path" that replaces 3 minutes of Google searching per job.
           </p>
        </header>

        <div style={{ maxWidth: 800 }}>
           
           {/* Decoder Input */}
           <div className="card-elevated" style={{ padding: 32, marginBottom: 40, border: '1px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                 <Search size={18} style={{ color: 'var(--accent)' }} />
                 <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>IDENTIFY_STOP_CODE</h3>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. 0x000000D1 or CRITICAL_PROCESS..." 
                  style={{ 
                    width: '100%', height: 60, padding: '0 24px', background: 'var(--bg-primary)', 
                    border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)',
                    fontSize: 16, fontWeight: 700, outline: 'none'
                  }}
                  className="focus:border-accent"
                />
                {!query && (
                  <div style={{ position: 'absolute', right: 24, top: 22, fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>READY_FOR_QUERY</div>
                )}
              </div>
           </div>

           {/* Results Matrix */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {query && filteredResults.length === 0 && (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                   <AlertCircle size={32} style={{ color: 'var(--status-warn)', marginBottom: 16, marginInline: 'auto' }} />
                   <div style={{ fontSize: 14, fontWeight: 800 }}>SIGNAL_NOT_MAPPED</div>
                   <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Generic memory or unknown vendor code. check Microsoft Hardware Dev Center for raw telemetry.</p>
                </div>
              )}

              {filteredResults.map(res => (
                <div key={res.code} className="card-elevated" style={{ padding: 0, overflow: 'hidden', borderLeft: '4px solid var(--accent)' }}>
                   <div style={{ padding: 32, background: 'rgba(0, 243, 255, 0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                         <div>
                            <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>STOP_CODE_IDENTIFIED</div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>{res.code}</h2>
                         </div>
                         <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 6 }}>
                            {res.name}
                         </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                               <Cpu size={14} style={{ color: 'var(--status-fail)' }} />
                               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROBABLE_CULPRIT</div>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{res.culprit}</div>
                         </div>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                               <Shield size={14} style={{ color: 'var(--status-pass)' }} />
                               <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>REPAIR_PROTOCOL</div>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{res.fix}</div>
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '12px 32px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
                      <button className="badge badge-ready" style={{ fontSize: 8 }}>PRINT_FIX_TICKET</button>
                   </div>
                </div>
              ))}
           </div>

           {!query && (
             <div className="card" style={{ padding: 32, border: '1px dashed var(--border)' }}>
                <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 16 }}>QUICK_REFERENCE_TOP_SIGNALS</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                   {BSOD_DATA.slice(0, 5).map(b => (
                     <button key={b.code} onClick={() => setQuery(b.code)} style={{ 
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
                        padding: '8px 16px', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.2s'
                     }} className="hover:border-accent">{b.code}</button>
                   ))}
                </div>
             </div>
           )}

        </div>
      </div>
    </AppLayout>
  )
}
