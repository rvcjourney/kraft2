/**
 * Module progress utilities
 * Computes unlock state and completion % per FRD v1.0 locking rules
 */

// Map of moduleId → set of topic IDs that belong to it
// Kept here so progress logic doesn't need to import content files
const MODULE_TOPIC_IDS = {
  loans_module_1: new Set([
    'what_is_loan',
    'types_of_loans',
    'home_loan_overview',
    'eligibility_criteria',
    'emi_calculation',
    'documentation_kyc',
    'loan_processing',
    'disbursement',
    'repayment_foreclosure',
    'tax_benefits',
    'module_assessment',
  ]),
  // Other modules have no content yet — completion always 0
};

/**
 * Returns completion ratio (0–1) for a given moduleId based on submissions
 * @param {string} moduleId
 * @param {object} submissions - useLessonStore submissions map (keyed by topicId)
 * @param {number} totalTopics - total topics in the module
 */
export function getModuleCompletion(moduleId, submissions, totalTopics) {
  if (!totalTopics || totalTopics === 0) return 0;

  const topicIds = MODULE_TOPIC_IDS[moduleId];
  // Module has no content defined yet → 0% complete
  if (!topicIds) return 0;

  // Count only submissions that belong to this specific module
  const completedCount = Object.keys(submissions).filter((id) => topicIds.has(id)).length;
  return Math.min(1, completedCount / totalTopics);
}

/**
 * Returns true if the given module is unlocked based on its unlock requirement
 * @param {object} moduleConfig - entry from MODULES_CONFIG
 * @param {object} submissions  - useLessonStore submissions map
 * @param {Array}  allModules   - full MODULES_CONFIG array (to look up totalTopics)
 */
export function isModuleUnlocked(moduleConfig, submissions, allModules) {
  // Dev override: unlock everything
  if (import.meta.env.DEV && localStorage.getItem('__dev_unlock_all') === 'true') return true;

  const req = moduleConfig.unlockRequirement;

  // No requirement = always unlocked
  if (!req) return true;

  if (req.type === 'single') {
    const target = allModules.find((m) => m.id === req.moduleId);
    if (!target) return false;
    const completion = getModuleCompletion(req.moduleId, submissions, target.totalTopics);
    return completion >= req.minCompletion;
  }

  if (req.type === 'multi') {
    return req.moduleIds.every((id) => {
      const target = allModules.find((m) => m.id === id);
      if (!target) return false;
      return getModuleCompletion(id, submissions, target.totalTopics) >= 1.0;
    });
  }

  return false;
}

/**
 * Returns a human-readable unlock hint for a locked module
 */
export function getUnlockHint(moduleConfig, allModules) {
  const req = moduleConfig.unlockRequirement;
  if (!req) return '';

  if (req.type === 'single') {
    const target = allModules.find((m) => m.id === req.moduleId);
    const pct = Math.round(req.minCompletion * 100);
    return `Complete ${pct}% of "${target?.title || req.moduleId}" to unlock`;
  }

  if (req.type === 'multi') {
    const titles = req.moduleIds
      .map((id) => allModules.find((m) => m.id === id)?.title || id)
      .join(', ');
    return `Complete ${titles} to unlock`;
  }

  return 'Complete prerequisites to unlock';
}
