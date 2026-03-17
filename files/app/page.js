'use client'
import Link from 'next/link'
import SidebarNav from '../components/ui/SidebarNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const MODULES = [
  {
    href: '/testlab',
    name: 'TestLab',
    icon: '🧪',
    tagline: 'Hardware Testing',
    desc: 'Keyboard, screen, webcam, mic and more - no software needed',
  },
  {
    href: '/scanlab',
    name: 'ScanLab',
    icon: '🔍',
    tagline: 'Diagnostics',
    desc: 'Upload HackRore JSON for full system health report',
  },
  {
    href: '/fixlab',
    name: 'FixLab',
    icon: '🔧',
    tagline: 'Knowledge Base',
    desc: '50+ common issues with step-by-step solutions',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 lg:ml-64">
      <SidebarNav />
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Technician Workbench
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            Complete hardware diagnostics and repair platform for refurbishment technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {MODULES.map((mod) => (
            <Card key={mod.href} clickable className="group h-[360px] flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <Badge cls="info">Ready</Badge>
              </div>
              <div className="flex items-center gap-6 mb-8 flex-grow">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  {mod.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{mod.name}</h2>
                  <p className="text-lg font-semibold text-blue-600 mb-2">{mod.tagline}</p>
                  <p className="text-gray-600 leading-relaxed">{mod.desc}</p>
                </div>
              </div>
              <Link href={mod.href} className="btn-primary w-full text-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Start {mod.name}
              </Link>
            </Card>
          ))}
        </div>

        <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to diagnose?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto leading-relaxed">
            Choose a module above to begin testing your device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link href="/testlab" className="btn-primary px-8 py-4 text-lg shadow-xl hover:shadow-2xl">
              Quick Test
            </Link>
            <Link href="/scanlab" className="btn-secondary px-8 py-4 text-lg shadow-md hover:shadow-lg">
              Full Scan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

