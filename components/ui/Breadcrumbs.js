'use client'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ paths = [] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://elite-tech-os.vercel.app/"
      },
      ...paths.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": p.label,
        "item": `https://elite-tech-os.vercel.app${p.href}`
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Home size={14} />
            Home
          </Link>
        </li>
        {paths.map((path, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={14} style={{ margin: '0 8px', opacity: 0.5 }} />
            <Link href={path.href} style={{ 
              color: idx === paths.length - 1 ? 'var(--text-primary)' : 'inherit', 
              textDecoration: 'none',
              fontWeight: idx === paths.length - 1 ? 600 : 400
            }}>
              {path.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
