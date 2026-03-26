import diagnostics from '../../data/diagnostics.json'
import tools from '../../data/tools.json'
import guides from '../../data/guides.json'

/**
 * Retrieves a diagnostic tree by its ID.
 */
export function getDiagnosticById(id) {
  return diagnostics.find(d => d.id === id) || null
}

/**
 * Gets the current step data for a diagnostic run.
 */
export function getStep(diagnostic, stepId) {
  if (!diagnostic) return null
  return diagnostic.steps.find(s => s.id === stepId) || null
}

/**
 * Resolves tool and guide objects for a specific step.
 */
export function getStepContext(step) {
  if (!step) return {}
  
  return {
    tool: step.tool ? tools.find(t => t.id === step.tool || t.slug === step.tool) : null,
    guide: step.guide ? guides.find(g => g.id === step.guide || g.slug === step.guide) : null
  }
}

/**
 * Traverses to the next step based on user selection.
 */
export function nextStep(diagnostic, currentStepId, optionLabel) {
  const currentStep = getStep(diagnostic, currentStepId)
  if (!currentStep) return null
  
  const option = currentStep.options?.find(o => o.label === optionLabel)
  return option ? option.next : null
}
