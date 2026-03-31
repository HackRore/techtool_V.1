'use client'
import AppLayout from '../../components/layout/AppLayout'
import { ExternalLink, Shield, Download, Zap, Cpu, Activity, Globe, Monitor, Terminal, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

const RESOURCES = [
  {
    category: 'Windows Activation & Setup',
    icon: <Shield className="text-accent" size={20} />,
    tools: [
      { name: 'Massgrave (MAS)', desc: 'The gold standard for Windows/Office activation. Clean, open-source, and HWID-based.', url: 'https://massgrave.dev' },
      { name: 'Chris Titus WinUtil', desc: 'Powerful debloater and utility suite for Windows optimization.', url: 'https://christitus.com/windows-tool/' },
      { name: 'Rufus', desc: 'The definitive tool for creating bootable USB media (BIOS/UEFI support).', url: 'https://rufus.ie' }
    ]
  },
  {
    category: 'Drivers',
    icon: <Cpu className="text-amber" size={20} />,
    tools: [
      { name: 'Display Driver Uninstaller (DDU)', desc: 'Deep-cleans GPU drivers to resolve BSODs and artifacting.', url: 'https://www.guru3d.com/files-details/display-driver-uninstaller-download.html' },
      { name: 'NVCleanstall', desc: 'Install NVIDIA drivers without the telemetry and bloat.', url: 'https://www.techpowerup.com/download/techpowerup-nvcleanstall/' },
      { name: 'Snappy Driver Installer Origin', desc: 'Offline driver repository for technician field-work.', url: 'https://www.snappy-driver-installer.org' }
    ]
  },
  {
    category: 'System Info & Monitoring',
    icon: <Activity className="text-cyan" size={20} />,
    tools: [
      { name: 'HWiNFO64', desc: 'The most comprehensive hardware monitoring tool available.', url: 'https://www.hwinfo.com/download/' },
      { name: 'CPU-Z & GPU-Z', desc: 'Standard validation tools for clock speeds and silicon specs.', url: 'https://www.cpuid.com/softwares/cpu-z.html' },
      { name: 'CrystalDiskInfo', desc: 'S.M.A.R.T. monitoring for SSD/HDD health and failure prediction.', url: 'https://crystalmark.info/en/software/crystaldiskinfo/' }
    ]
  },
  {
    category: 'Storage',
    icon: <Zap className="text-blue" size={20} />,
    tools: [
      { name: 'CrystalDiskMark', desc: 'Disk read/write benchmark.', url: 'https://crystalmark.info/en/software/crystaldiskmark/' },
      { name: 'WinDirStat', desc: 'Visual disk space map.', url: 'https://windirstat.net' },
      { name: 'TreeSize Free', desc: 'Find what is using disk space.', url: 'https://www.jam-software.com/treesize_free' },
      { name: 'Recuva', desc: 'Recover deleted files.', url: 'https://www.piriform.com/recuva' }
    ]
  },
  {
    category: 'Stress Testing',
    icon: <Activity className="text-red" size={20} />,
    tools: [
      { name: 'Prime95', desc: 'CPU torture test.', url: 'https://www.mersenne.org/download/' },
      { name: 'FurMark', desc: 'GPU stress test.', url: 'https://www.geeks3d.com/furmark/' },
      { name: 'OCCT', desc: 'Full system stability test.', url: 'https://www.ocbase.com' },
      { name: 'MemTest86', desc: 'RAM testing, bootable USB.', url: 'https://www.memtest86.com' }
    ]
  },
  {
    category: 'Malware & Security',
    icon: <Globe className="text-emerald" size={20} />,
    tools: [
      { name: 'AdwCleaner', desc: 'Malwarebytes tool for deep-cleaning adware and browser hijackers.', url: 'https://www.malwarebytes.com/adwcleaner' },
      { name: 'Process Explorer', desc: 'Advanced Task Manager from Microsoft Sysinternals.', url: 'https://docs.microsoft.com/en-us/sysinternals/downloads/process-explorer' },
      { name: 'Advanced IP Scanner', desc: 'Fast, reliable network scanner for mapping local topography.', url: 'https://www.advanced-ip-scanner.com' }
    ]
  },
  {
    category: 'Bootable Tools',
    icon: <Monitor className="text-purple" size={20} />,
    tools: [
      { name: 'Ventoy', desc: 'Put multiple ISOs on one USB drive.', url: 'https://www.ventoy.net' },
      { name: 'Hiren\'s BootCD PE', desc: 'All-in-one rescue environment.', url: 'https://www.hirensbootcd.org' }
    ]
  }
]

const COMMANDS = [
  { cmd: 'sfc /scannow', desc: 'Repair corrupt Windows files' },
  { cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Deep kernel repair' },
  { cmd: 'chkdsk C: /f /r /x', desc: 'Check and repair disk errors (requires restart)' },
  { cmd: 'powercfg /batteryreport /output "%USERPROFILE%\\Desktop\\battery-report.html"', desc: 'Generate high-fidelity battery health protocol' },
  { cmd: 'wmic diskdrive get status,caption,size', desc: 'Quick disk health check via command line' },
  { cmd: 'netsh wlan show wlanreport', desc: 'Generate WiFi connection history report' },
  { cmd: 'msinfo32', desc: 'Open System Information' },
  { cmd: 'devmgmt.msc', desc: 'Open Device Manager' },
  { cmd: 'eventvwr.msc', desc: 'Open Event Viewer' },
  { cmd: 'winver', desc: 'Check Windows version' }
]

function CmdRow({ command, description }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{
      background:'#0d1117', borderRadius:'6px', padding:'10px 14px',
      marginBottom:'8px', display:'flex', justifyContent:'space-between',
      alignItems:'center', gap:'12px', border:'1px solid var(--border)'
    }}>
      <div>
        <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#7ee787'}}>
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
           <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', marginBottom: '8px' }}>Resources</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px' }}>
             Curated technical toolkit for rapid hardware diagnostics and system optimization.
           </p>
        </div>

        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tools and commands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
          
          {/* Tool Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {filteredResources.map((cat, idx) => (
               <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                     {cat.icon}
                     <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>{cat.category}</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                     {cat.tools.map((tool, tIdx) => (
                       <a 
                         key={tIdx} href={tool.url} target="_blank" rel="noopener noreferrer" 
                         className="card hover:glow-border"
                         style={{ textDecoration: 'none', display: 'block', padding: 16 }}
                       >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                             <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{tool.name}</span>
                             <Download size={14} style={{ color: 'var(--accent)' }} />
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tool.desc}</div>
                       </a>
                     ))}
                  </div>
               </div>
             ))}
             {filteredResources.length === 0 && (
               <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No tools matched your search.</div>
             )}
          </div>

          {/* Command Toolbox Sidebar */}
          <aside>
             <div className="card" style={{ padding: 24, position: 'sticky', top: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                   <Terminal size={18} style={{ color: 'var(--accent)' }} />
                   <h3 style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 13 }}>Command Toolbox</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {filteredCommands.map((cmd, idx) => (
                     <CmdRow key={idx} command={cmd.cmd} description={cmd.desc} />
                   ))}
                   {filteredCommands.length === 0 && (
                     <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No commands found.</div>
                   )}
                </div>
             </div>
          </aside>
        </div>
      </main>
    </AppLayout>
  )
}
