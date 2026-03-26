import diagnostics from '../../data/diagnostics.json'

/**
 * Analyzes natural language input to find the most relevant diagnostic tree.
 * @param {string} input - The user's symptom description.
 * @returns {Object|null} - The matched diagnostic tree or null.
 */
export function resolveSymptom(input) {
  if (!input) return null
  
  const query = input.toLowerCase().trim()
  const scores = diagnostics.map(diag => {
    let score = 0
    let matchedKeywords = []
    
    diag.symptoms.forEach(sym => {
      if (query.includes(sym)) {
        score += 2
        matchedKeywords.push(sym)
      }
    })
    
    // Also check title
    if (diag.title.toLowerCase().includes(query)) score += 1
    
    // Calculate confidence (simplified max score assumption)
    const confidence = Math.min(Math.round((score / 3) * 100), 100)
    
    return { ...diag, score, confidence }
  })

  const sorted = scores.sort((a, b) => b.score - a.score)
  const bestMatch = sorted[0]
  
  return bestMatch.score > 0 ? bestMatch : { id: 'unknown', confidence: 0 }
}

/**
 * Returns a list of all available symptoms for autocomplete or suggestions.
 */
export function getAllSymptoms() {
  const symptoms = new Set()
  diagnostics.forEach(diag => diag.symptoms.forEach(s => symptoms.add(s)))
  return Array.from(symptoms)
}
