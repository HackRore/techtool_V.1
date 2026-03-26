import comparisons from '../../../data/comparisons.json'
import tools from '../../../data/tools.json'
import Sidebar from '../../../components/Sidebar'
import Link from 'next/link'
import { Check, X, ArrowLeftRight, TrendingUp } from 'lucide-react'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return comparisons.map((comp) => ({
    slug: comp.slug,
  }))
}

export default function ComparisonPage({ params }) {
  const { slug } = params
  const comparison = comparisons.find(c => c.slug === slug)
  
  if (!comparison) {
    notFound()
  }

  const toolData = comparison.items.map(itemId => tools.find(t => t.id === itemId)).filter(Boolean)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="breadcrumb">Compare / {comparison.type}</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ArrowLeftRight size={32} className="text-blue-600" />
            {comparison.title}
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          {/* Comparison Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  <th style={{ padding: '20px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-4)', width: '30%' }}>Feature</th>
                  {toolData.map(tool => (
                    <th key={tool.id} style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{tool.icon}</span>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{tool.name}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.features.map((feature, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, fontSize: 14 }}>{feature.name}</td>
                    {comparison.items.map(itemId => (
                      <td key={itemId} style={{ padding: '16px 24px', textAlign: 'center', fontSize: 14, color: 'var(--text-2)' }}>
                        {feature[itemId]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verdict Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--blue-600)', background: 'var(--blue-50/10)' }}>
             <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
               <TrendingUp size={20} className="text-blue-600" />
               Technician Verdict
             </h3>
             <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)' }}>
               {comparison.verdict}
             </p>
          </div>

          {/* Similar Comparisons / Context */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-4)', marginBottom: 16 }}>Other Comparisons</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {comparisons.filter(c => c.slug !== slug).map(c => (
                <Link key={c.id} href={`/compare/${c.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card-flat hover-scale" style={{ padding: 20 }}>
                     <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                     <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>Compare specs and diagnostics</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
