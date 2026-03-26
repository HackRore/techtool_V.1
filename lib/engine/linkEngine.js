import tools from '../../data/tools.json';
import guides from '../../data/guides.json';
import resources from '../../data/resources.json';

/**
 * LinkEngine - Elite Intelligence Layer for TechTool
 * Handles dynamic relationship mapping between Tools, Guides, and Resources.
 */

export const getToolBySlug = (slug) => {
  return tools.find(t => t.slug === slug);
};

export const getGuideBySlug = (slug) => {
  return guides.find(g => g.slug === slug);
};

export const getResourceBySlug = (slug) => {
  return resources.find(r => r.slug === slug);
};

export const getRelatedGuidesForTool = (toolId) => {
  const tool = tools.find(t => t.id === toolId);
  if (!tool || !tool.relatedGuides) return [];
  return guides.filter(g => tool.relatedGuides.includes(g.id));
};

export const getRelatedToolsForGuide = (guideId) => {
  const guide = guides.find(g => g.id === guideId);
  if (!guide || !guide.relatedTools) return [];
  return tools.filter(t => guide.relatedTools.includes(t.id));
};

export const getToolsByCategory = (category) => {
  return tools.filter(t => t.category === category);
};

export const getGuidesByTag = (tag) => {
  return guides.filter(g => g.tags.includes(tag));
};

export const searchAll = (query) => {
  const q = query.toLowerCase();
  const results = {
    tools: tools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    ),
    guides: guides.filter(g => 
      g.title.toLowerCase().includes(q) || 
      g.tags.some(tag => tag.toLowerCase().includes(q))
    ),
    resources: resources.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q)
    )
  };
  return results;
};
