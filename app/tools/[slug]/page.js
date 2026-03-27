import tools from '../../../data/tools.json'
import * as LinkEngine from '../../../lib/engine/linkEngine'
import ToolClient from './ToolClient'
import AppLayout from '../../../components/layout/AppLayout'
import { ChevronRight } from 'lucide-react'

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }))
}

export default function ToolPage({ params }) {
  const { slug } = params
  const tool = tools.find(t => t.slug === slug)
  
  if (!tool) {
    return (
      <AppLayout>
        <div style={{ padding: 80, textAlign: 'center' }}>
           <h1>Tool Not Found</h1>
           <p style={{ color: 'var(--text-3)' }}>The requested diagnostic tool could not be located.</p>
        </div>
      </AppLayout>
    )
  }

  const relatedGuides = LinkEngine.getRelatedGuidesForTool(tool.id)

  return (
    <AppLayout>
      <div className="page-header animate-in">
        <div className="breadcrumb">
          System / TestLab / {tool.name}
        </div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, letterSpacing: -1.5 }}>
          <span style={{ fontSize: 44 }}>{tool.icon}</span>
          {tool.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 16 }}>{tool.description}</p>
      </div>
      <ToolClient tool={tool} relatedGuides={relatedGuides} />
    </AppLayout>
  )
}
