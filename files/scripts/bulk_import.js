/**
 * Bulk Import & Validation Script - Elite OS Phase 3
 * Ensures 100% metadata consistency when scaling to 1000+ entries.
 */

const fs = require('fs');
const path = require('path');

const VALIDATORS = {
  tool: (data) => data.id && data.slug && data.name && data.category && Array.isArray(data.tags),
  guide: (data) => data.id && data.slug && data.title && data.category && Array.isArray(data.tags),
  resource: (data) => data.id && data.slug && data.title && data.category && data.link
};

function validateAndImport(type, newItems) {
  const storePath = path.resolve(__dirname, `../data/${type}s.json`);
  const currentData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const validator = VALIDATORS[type];

  const valid = [];
  const errors = [];

  newItems.forEach((item, index) => {
    if (validator(item)) {
      // Check for duplicates
      if (currentData.some(existing => existing.id === item.id || existing.slug === item.slug)) {
        errors.push(`[Index ${index}] Duplicate ID or Slug: ${item.id}`);
      } else {
        valid.push(item);
      }
    } else {
      errors.push(`[Index ${index}] Schema Validation Failed: ${item.id || 'Missing ID'}`);
    }
  });

  if (errors.length > 0) {
    console.error(`❌ Import failed with ${errors.length} errors:`);
    errors.forEach(err => console.error(err));
    return false;
  }

  const updatedData = [...currentData, ...valid];
  fs.writeFileSync(storePath, JSON.stringify(updatedData, null, 2));
  console.log(`✅ Successfully imported ${valid.length} ${type}s.`);
  return true;
}

module.exports = { validateAndImport };
