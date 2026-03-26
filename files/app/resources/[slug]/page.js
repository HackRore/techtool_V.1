import resources from '../../../data/resources.json'
import LinkEngine from '../../../lib/engine/linkEngine'
import Sidebar from '../../../components/Sidebar'
import Link from 'next/link'
import { Download, ExternalLink, ShieldCheck, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return resources.map((res) => ({
    slug: res.slug,
  }))
}

export default function ResourcePage({ params }) {
  const { slug } = params
  const resource = LinkEngine.getResourceBySlug(slug)
  
  if (!resource) {
    notFound()
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">Resources / {resource.category}</div>
          <h1>{resource.title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <span className="badge badge-ready">{resource.type}</span>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 16, 
              background: 'var(--blue-50)', 
              color: 'var(--blue-600)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0 
            }}>
              <Download size={40} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: 20 }}>
                {resource.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {resource.tags.map(tag => (
                   <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className="tag" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                     <Tag size={10} />
                     {tag}
                   </Link>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '12px 24px' }}>
                  <ExternalLink size={18} />
                  Download Resource
                </a>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
                  <ShieldCheck size={18} />
                  Verify Hash
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48, padding: '24px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-3)' }}>
             <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
               <ShieldCheck size={16} className="text-blue-600" />
               Security Disclosure
             </div>
             Elite Technician OS maintains a repository of verified third-party tools. However, always exercise caution. Verify digital signatures and MD5/SHA-256 hashes against official vendor documentation before deployment.
          </div>
        </div>
      </main>
    </div>
  )
}
