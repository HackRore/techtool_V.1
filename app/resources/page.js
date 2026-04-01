'use client'
import AppLayout from '../../components/layout/AppLayout'
import { ExternalLink, Shield, Download, Zap, Cpu, Activity, Globe, Monitor, Terminal, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

const RESOURCES = [
  {
    category: 'Windows Setup & Optimization',
    icon: <Shield className="text-accent" size={20} />,
    tools: [
      { name: 'Massgrave (MAS)', desc: 'The industry standard for Windows/Office setup. HWID-based and open-source.', url: 'https://massgrave.dev' },
      { name: 'Chris Titus WinUtil', desc: 'Powerful toolbox for Windows debloating and essential app installs.', url: 'https://christitus.com/windows-tool/' },
      { name: 'Rufus', desc: 'The definitive tool for creating bootable USB media (BIOS/UEFI).', url: 'https://rufus.ie' },
      { name: 'Windows Media Creation', desc: 'Official Microsoft tool for clean OS installations.', url: 'https://www.microsoft.com/software-download/windows10' }
    ]
  },
  {
    category: 'Hardware Diagnostics',
    icon: <Cpu className="text-amber" size={20} />,
    tools: [
      { name: 'HWiNFO64', desc: 'Comprehensive hardware monitoring and telemetry reporting.', url: 'https://www.hwinfo.com/download/' },
      { name: 'CPU-Z & GPU-Z', desc: 'Standard validation tools for clock speeds and silicon specs.', url: 'https://www.cpuid.com/softwares/cpu-z.html' },
      { name: 'CrystalDiskInfo', desc: 'S.M.A.R.T. monitoring for SSD/HDD health and failure prediction.', url: 'https://crystalmark.info/en/software/crystaldiskinfo/' },
      { name: 'MemTest86', desc: 'Gold-standard RAM testing environment (bootable USB).', url: 'https://www.memtest86.com' }
    ]
  },
  {
    category: 'Repair & Cleanup',
    icon: <Activity className="text-cyan" size={20} />,
    tools: [
      { name: 'DDU (Display Driver Uninstaller)', desc: 'Safely removes GPU drivers to resolve BSODs and artifacting.', url: 'https://www.guru3d.com/files-details/display-driver-uninstaller-download.html' },
      { name: 'Bulk Crap Uninstaller', desc: 'Advanced software uninstaller that finds and removes leftover files.', url: 'https://www.bcuninstaller.com' },
      { name: 'CrystalDiskMark', desc: 'Disk read/write performance benchmarking.', url: 'https://crystalmark.info/en/software/crystaldiskmark/' },
      { name: 'Ventoy', desc: 'Create a multiboot USB drive by simply copying ISO files.', url: 'https://www.ventoy.net' }
    ]
  },
  {
    category: 'Network & Security',
    icon: <Globe className="text-emerald" size={20} />,
    tools: [
      { name: 'AdwCleaner', desc: 'Deep-cleans browser hijackers and unwanted adware.', url: 'https://www.malwarebytes.com/adwcleaner' },
      { name: 'Advanced IP Scanner', desc: 'Fast local network topography mapping tool.', url: 'https://www.advanced-ip-scanner.com' },
      { name: 'Autoruns', desc: 'See every program configured to run during system boot.', url: 'https://docs.microsoft.com/en-us/sysinternals/downloads/autoruns' }
    ]
  }
]

const COMMANDS = [
  { cmd: 'sfc /scannow', desc: 'Repair corrupt system files' },
  { cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Restore Windows component store health' },
  { cmd: 'chkdsk C: /f /r /x', desc: 'Repair disk structural errors (scheduled restart)' },
  { cmd: 'powercfg /batteryreport', desc: 'Generate system battery health report (HTML)' },
  { cmd: 'wmic diskdrive get status,caption', desc: 'Quick command-line S.M.A.R.T. status check' },
  { cmd: 'ipconfig /flushdns', desc: 'Clear DNS resolver cache' },
  { cmd: 'netsh winsock reset', desc: 'Reset network adapter protocol stack' },
  { cmd: 'gpupdate /force', desc: 'Force update of local system policies' },
  { cmd: 'systeminfo', desc: 'Detailed OS/Hardware profile output (CMD)' },
  { cmd: 'netstat -ano', desc: 'List active network connections and PIDs' }
]

function CmdRow({ command, description }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{
      background:'#0d1117', borderRadius:'6px', padding:'10px 14px',
      marginBottom:'8px', display:'flex', justifyContent:'space-between',
      alignItems:'center', gap:'12px', border:'1px solid var(--border)'
    }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#7ee787', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {command}
        </div>
        <div style={{fontSize:'11px', color:'#8b949e', marginTop:'3px'}}>{description}</div>
      </div>
      <button onClick={() => { navigator.clipboard.writeText(command); setCopied(true); setTimeout(()=>setCopied(false),1500) }}
        style={{fontSize:'10px', padding:'3px 10px', background:'rgba(255,255,255,0.06)',
          color: copied?'var(--accent)':'#8b949e', border:'none', borderRadius:'4px',
          cursor:'pointer', whiteSpace:'nowrap', flexShrink:0}}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function ResourcesPage() {
  const [search, setSearch] = useState('')

  const filteredResources = useMemo(() => {
    if (!search) return RESOURCES
    const s = search.toLowerCase()
    return RESOURCES.map(cat => ({
      ...cat,
      tools: cat.tools.filter(t => t.name.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s))
    })).filter(cat => cat.tools.length > 0)
  }, [search])

  const filteredCommands = useMemo(() => {
    if (!search) return COMMANDS
    const s = search.toLowerCase()
    return COMMANDS.filter(c => c.cmd.toLowerCase().includes(s) || c.desc.toLowerCase().includes(s))
  }, [search])

  return (
    <AppLayout>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        <div style={{ marginBottom: '32px' }}>
           <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', marginBottom: '8px' }}>Technical Toolbox</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px' }}>
             Curated resource repository for high-performance hardware diagnostics, system maintenance, and essential repair utilities.
           </p>
        </div>

        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search toolbox or search command repository..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 16px 14px 48px', fontSize: '15px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px' }}>
          
          {/* Tool Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             {filteredResources.map((cat, idx) => (
               <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                     {cat.icon}
                     <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, color: 'var(--text-muted)' }}>{cat.category}</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                     {cat.tools.map((tool, tIdx) => (
                       <a 
                         key={tIdx} href={tool.url} target="_blank" rel="noopener noreferrer" 
                         className="card hover:glow-border"
                         style={{ textDecoration: 'none', display: 'block', padding: 16 }}
                       >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                             <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{tool.name}</span>
                             <Download size={14} style={{ color: 'var(--accent)' }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tool.desc}</div>
                       </a>
                     ))}
                  </div>
               </div>
             ))}
             {filteredResources.length === 0 && (
               <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No resources found matching your search.</div>
             )}
          </div>

          {/* Command Toolbox Sidebar */}
          <aside>
             <div className="card" style={{ padding: 24, position: 'sticky', top: '80px', borderTop: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                   <Terminal size={18} style={{ color: 'var(--accent)' }} />
                   <h3 style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, fontWeight: 800 }}>Command Repository</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {filteredCommands.map((cmd, idx) => (
                     <CmdRow key={idx} command={cmd.cmd} description={cmd.desc} />
                   ))}
                   {filteredCommands.length === 0 && (
                     <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No matches found.</div>
                   )}
                </div>
             </div>
          </aside>
        </div>
      </main>
    </AppLayout>
  )
}
