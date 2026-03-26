import tools from '../../../data/tools.json'
import LinkEngine from '../../../lib/engine/linkEngine'
import ToolClient from './ToolClient'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }))
}

export default function ToolPage({ params }) {
  const { slug } = params
  const tool = LinkEngine.getToolBySlug(slug)
  
  if (!tool) {
    notFound()
  }

  const relatedGuides = LinkEngine.getRelatedGuidesForTool(tool.id)

  return <ToolClient tool={tool} relatedGuides={relatedGuides} />
}
