'use client'

/**
 * Persistence Engine for Elite Technician OS
 * Manages locally stored diagnostic sessions and tool results.
 */

const STORAGE_KEY = 'tech_os_sessions'

export const PersistenceEngine = {
  /**
   * Save a result for a specific tool/diagnostic
   */
  saveResult: (type, id, result) => {
    if (typeof window === 'undefined') return
    
    const sessions = PersistenceEngine.getHistory()
    const newEntry = {
      timestamp: new Date().toISOString(),
      type, // 'tool' | 'diagnostic' | 'symptom'
      id,
      result,
      version: '1.0.5'
    }
    
    // Keep last 50 entries
    const updated = [newEntry, ...sessions.slice(0, 49)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newEntry
  },

  /**
   * Retrieve full session history
   */
  getHistory: () => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('PersistenceEngine Error:', e)
      return []
    }
  },

  /**
   * Get the last result for a specific tool
   */
  getLastResult: (id) => {
    const history = PersistenceEngine.getHistory()
    return history.find(entry => entry.id === id)
  },

  /**
   * Clear all history
   */
  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}
