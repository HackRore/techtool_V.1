'use client'
import AppLayout from '../../components/layout/AppLayout'
import { ExternalLink, Shield, Download, Zap, Cpu, Activity, Globe, Monitor, Terminal, Copy } from 'lucide-react'
import { useState } from 'react'

const RESOURCES = [
  {
    category: 'Activation & OS Calibration',
    icon: <Shield className="text-accent" size={20} />,
    tools: [
      { name: 'Massgrave (MAS)', desc: 'The gold standard for Windows/Office activation. Clean, open-source, and HWID-based.', url: 'https://massgrave.dev', tag: 'Elite' },
      { name: 'Chris Titus WinUtil', desc: 'Powerful debloater and utility suite for Windows optimization.', url: 'https://christitus.com/windows-tool/', tag: 'Pro' },
      { name: 'Rufus', desc: 'The definitive tool for creating bootable USB media (BIOS/UEFI support).', url: 'https://rufus.ie', tag: 'Essential' }
    ]
  },
  {
    category: 'Driver & Kernel Auditing',
    icon: <Cpu className="text-amber" size={20} />,
    tools: [
      { name: 'Display Driver Uninstaller (DDU)', desc: 'Deep-cleans GPU drivers to resolve BSODs and artifacting.', url: 'https://www.guru3d.com/files-details/display-driver-uninstaller-download.html', tag: 'Critical' },
      { name: 'NVCleanstall', desc: 'Install NVIDIA drivers without the telemetry and bloat.', url: 'https://www.techpowerup.com/download/techpowerup-nvcleanstall/', tag: 'Pro' },
      { name: 'Snappy Driver Installer Origin', desc: 'Offline driver repository for technician field-work.', url: 'https://www.snappy-driver-installer.org', tag: 'Essential' }
    ]
  },
  {
    category: 'System Performance & Info',
    icon: <Activity className="text-cyan" size={20} />,
    tools: [
      { name: 'HWiNFO64', desc: 'The most comprehensive hardware monitoring tool available.', url: 'https://www.hwinfo.com/download/', tag: 'Elite' },
      { name: 'CPU-Z & GPU-Z', desc: 'Standard validation tools for clock speeds and silicon specs.', url: 'https://www.cpuid.com/softwares/cpu-z.html', tag: 'Standard' },
      { name: 'CrystalDiskInfo', desc: 'S.M.A.R.T. monitoring for SSD/HDD health and failure prediction.', url: 'https://crystalmark.info/en/software/crystaldiskinfo/', tag: 'Essential' }
    ]
  },
  {
    category: 'Network & Malware Analysis',
    icon: <Globe className="text-emerald" size={20} />,
    tools: [
      { name: 'AdwCleaner', desc: 'Malwarebytes tool for deep-cleaning adware and browser hijackers.', url: 'https://www.malwarebytes.com/adwcleaner', tag: 'Essential' },
      { name: 'Process Explorer', desc: 'Advanced Task Manager from Microsoft Sysinternals.', url: 'https://docs.microsoft.com/en-us/sysinternals/downloads/process-explorer', tag: 'Pro' },
      { name: 'Advanced IP Scanner', desc: 'Fast, reliable network scanner for mapping local topography.', url: 'https://www.advanced-ip-scanner.com', tag: 'Essential' }
    ]
  }
]

const COMMANDS = [
  { cmd: 'sfc /scannow', desc: 'System File Checker - Repair corrupt Windows files' },
  { cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Deployment Image Servicing - Deep kernel repair' },
  { cmd: 'netsh int ip reset && netsh winsock reset', desc: 'Flush TCP/IP stack and Winsock catalog' },
  { cmd: 'powercfg /batteryreport', desc: 'Generate high-fidelity battery health protocol' }
]

export default function ResourcesPage() {
  const [copied, setCopied] = useState(null)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <AppLayout title="Elite Technician Resources" description="Curated repository of professional hardware/software diagnostic tools.">
      <div className="dashboard-layout animate-in">
        
        {/* Main Resource Repository */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
             <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 12 }}>Technician Resource Hub</h2>
             <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
               A curated selection of the most reliable, free-to-use software tools for hardware diagnostics, 
               driver remediation, and OS activation. All links are direct and verified.
             </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
             {RESOURCES.map((cat, idx) => (
               <div key={idx} className="card-elevated" style={{ padding: 24, background: 'var(--bg-secondary)', borderTop: cat.category.includes('Elite') ? '2px solid var(--accent)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                     {cat.icon}
                     <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>{cat.category}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {cat.tools.map((tool, tIdx) => (
                       <a 
                         key={tIdx} href={tool.url} target="_blank" rel="noopener noreferrer" 
                         className="hover:border-accent"
                         style={{ 
                           padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', 
                           textDecoration: 'none', transition: 'all 0.2s', display: 'block' 
                         }}
                       >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                             <span style={{ fontWeight: 900, color: '#fff', fontSize: 14 }}>{tool.name}</span>
                             <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: 4 }}>{tool.tag}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{tool.desc}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>
                             VERIFIED_LINK <ExternalLink size={10} />
                          </div>
                       </a>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Command Toolbox Sidebar */}
        <aside className="sidebar-panel">
           <div className="card-elevated shadow-glow" style={{ padding: 32, background: 'var(--bg-elevated)', border: '1px solid var(--accent-glow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                 <Terminal size={18} style={{ color: 'var(--accent)' }} />
                 <h3 style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 13 }}>Command Toolbox</h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                 Common terminal strings for deep Windows repair and diagnostics.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {COMMANDS.map((cmd, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => copyToClipboard(cmd.cmd)}
                     style={{ 
                       padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', 
                       cursor: 'pointer', position: 'relative', overflow: 'hidden' 
                     }}
                   >
                      <div style={{ fontSize: 12, fontWeight: 900, color: copied === cmd.cmd ? 'var(--status-pass)' : 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                         {copied === cmd.cmd ? 'COPIED_TO_CLIPBOARD' : cmd.cmd}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cmd.desc}</div>
                      <Copy size={12} style={{ position: 'absolute', top: 12, right: 12, opacity: 0.2 }} />
                   </div>
                 ))}
              </div>
           </div>

           <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--status-info)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                 <Monitor size={18} style={{ color: 'var(--status-info)' }} />
                 <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-primary)' }}>PORTABLE_TECH_KIT: v.3.5.0</div>
              </div>
           </div>
        </aside>

      </div>
    </AppLayout>
  )
}
