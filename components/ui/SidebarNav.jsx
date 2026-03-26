'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/testlab', label: 'TestLab', icon: '🧪' },
  { href: '/scanlab', label: 'ScanLab', icon: '🔍' },
  { href: '/fixlab', label: 'FixLab', icon: '🔧' },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href) => pathname === href

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out" aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group ${isActive(item.href) ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' : ''}`}>
                  <span className="ml-3">{item.icon} {item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="lg:hidden p-4">
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-500">
          <span className="sr-only">Open sidebar</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  )
}

