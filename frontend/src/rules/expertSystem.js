import rules from './clinical_rules.json'

export function applyExpertRules(patient, rawResults) {
  // If no raw results, nothing to adjust
  if (!rawResults || rawResults.error) {
    return { original: rawResults, adjusted: rawResults, rules_applied: [], is_bipartite: true }
  }

  // Create deep copy for adjustments
  const adjusted = JSON.parse(JSON.stringify(rawResults))
  const appliedRules = []

  let age = null
  if (patient.dob) {
    const dobDate = new Date(patient.dob)
    const today = new Date()
    age = today.getFullYear() - dobDate.getFullYear()
  }

  rules.forEach(rule => {
    let match = false
    const taskData = rule.condition.task === 'alzheimer' ? adjusted.alzheimer : adjusted.tumor
    if (!taskData) return // If this analysis isn't present, skip

    // Check conditions
    const checks = []
    
    if (rule.condition.patient_age_max !== undefined) {
      checks.push(age !== null && age <= rule.condition.patient_age_max)
    }
    
    if (rule.condition.patient_genetic_biomarkers !== undefined) {
      checks.push(patient.genetic_biomarkers === rule.condition.patient_genetic_biomarkers)
    }

    if (rule.condition.patient_genetic_biomarkers_includes !== undefined) {
      checks.push(rule.condition.patient_genetic_biomarkers_includes.includes(patient.genetic_biomarkers))
    }

    if (rule.condition.patient_cancer_history_includes !== undefined) {
      const history = patient.cancer_history || []
      const intersection = rule.condition.patient_cancer_history_includes.filter(c => history.includes(c))
      checks.push(intersection.length > 0)
    }

    // Only match if all defined conditions pass and there is at least one condition
    if (checks.length > 0 && checks.every(c => c === true)) {
      match = true
    }

    if (match) {
      appliedRules.push({
        id: rule.id,
        name: rule.name,
        description: rule.description
      })

      // Apply actions
      if (rule.action.confidence_factor) {
        taskData.confidence = Math.min(1.0, taskData.confidence * rule.action.confidence_factor)
      }
      if (rule.action.prob_factor) {
        for (const key in taskData.probabilities) {
          taskData.probabilities[key] = Math.min(1.0, taskData.probabilities[key] * rule.action.prob_factor)
        }
        // Re-normalize probabilities so they sum to 1
        const total = Object.values(taskData.probabilities).reduce((sum, val) => sum + val, 0)
        if (total > 0) {
           for (const key in taskData.probabilities) {
             taskData.probabilities[key] = taskData.probabilities[key] / total
           }
        }
      }
    }
  })

  return {
    original: rawResults,
    adjusted: adjusted,
    rules_applied: appliedRules,
    is_bipartite: true
  }
}