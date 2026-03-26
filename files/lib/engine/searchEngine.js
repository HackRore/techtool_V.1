import tools from '../../data/tools.json';
import guides from '../../data/guides.json';
import resources from '../../data/resources.json';

/**
 * SearchEngine & Intelligence Layer - Elite OS Phase 3
 * Handles fuzzy search, similarity scoring, and popularity ranking.
 */

// Helper: Calculate tag overlap score (0 to 1)
const calculateSimilarity = (tags1, tags2) => {
  if (!tags1 || !tags2) return 0;
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  return intersection.size / Math.max(set1.size, set2.size);
};

// Helper: Popularity scoring model (Flags + Metadata)
const getScore = (item) => {
  let score = 0;
  if (item.featured) score += 50;
  if (item.popular) score += 30;
  if (item.recommended) score += 20;
  if (item.usageCount) score += (item.usageCount / 10);
  return score;
};

export const searchAll = (query) => {
  if (!query || query.length < 2) return { tools: [], guides: [], resources: [] };
  
  const q = query.toLowerCase();
  
  const searchIn = (item, fields) => {
    return fields.some(field => {
      const val = item[field];
      if (Array.isArray(val)) {
        return val.some(v => v.toLowerCase().includes(q));
      }
      return val?.toLowerCase().includes(q);
    });
  };

  return {
    tools: tools.filter(t => searchIn(t, ['name', 'description', 'category', 'tags'])),
    guides: guides.filter(g => searchIn(g, ['title', 'category', 'tags'])),
    resources: resources.filter(r => searchIn(r, ['title', 'description', 'category', 'tags']))
  };
};

export const getFeaturedContent = () => {
  return {
    tools: tools.filter(t => t.featured),
    guides: guides.filter(g => g.featured),
    resources: resources.filter(r => r.featured)
  };
};

export const getPopularContent = () => {
  return {
    tools: tools.filter(t => t.popular),
    guides: guides.filter(g => g.popular),
    resources: resources.filter(r => r.popular)
  };
};

export const getRecommendedContent = () => {
  return {
    tools: tools.filter(t => t.recommended),
    resources: resources.filter(r => r.recommended)
  };
};

export const getByTag = (tag) => {
  const t = tag.toLowerCase();
  return {
    tools: tools.filter(item => item.tags.some(tg => tg.toLowerCase() === t)),
    guides: guides.filter(item => item.tags.some(tg => tg.toLowerCase() === t)),
    resources: resources.filter(item => item.tags.some(tg => tg.toLowerCase() === t))
  };
};

export const getByCategory = (category) => {
  const c = category.toLowerCase();
  return {
    tools: tools.filter(item => item.category.toLowerCase() === c),
    guides: guides.filter(item => item.category.toLowerCase() === c),
    resources: resources.filter(item => item.category.toLowerCase() === c)
  };
};

// --- Intelligence Extensions (Phase 3) ---

export const getSimilarTools = (toolId, limit = 4) => {
  const sourceTool = tools.find(t => t.id === toolId);
  if (!sourceTool) return [];

  return tools
    .filter(t => t.id !== toolId)
    .map(t => ({
      ...t,
      similarity: calculateSimilarity(sourceTool.tags, t.tags) + (sourceTool.category === t.category ? 0.2 : 0)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

export const getRelatedGuides = (sourceTags, limit = 5) => {
  return guides
    .map(g => ({
      ...g,
      relevance: calculateSimilarity(sourceTags, g.tags)
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .filter(g => g.relevance > 0.1)
    .slice(0, limit);
};

export const getRankedContent = (type = 'tools', limit = 10) => {
  const dataset = type === 'tools' ? tools : type === 'guides' ? guides : resources;
  return [...dataset]
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, limit);
};
