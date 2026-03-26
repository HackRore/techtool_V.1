/**
 * Pagination Utility - Elite OS Phase 3
 * Handles structured slicing of metadata arrays for hubs and search results.
 */

export const paginate = (items, page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;
  const pagedItems = items.slice(offset, offset + pageSize);
  
  return {
    items: pagedItems,
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    hasMore: offset + pageSize < items.length
  };
};

export const getPageRange = (total, currentPage, delta = 2) => {
  const range = [];
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(total - 1, currentPage + delta); i++) {
    range.push(i);
  }

  if (currentPage - delta > 2) range.unshift('...');
  if (currentPage + delta < total - 1) range.push('...');

  range.unshift(1);
  if (total > 1) range.push(total);

  return range;
};
