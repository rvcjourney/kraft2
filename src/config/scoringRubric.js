/**
 * Scoring Rubric for "Are You Eligible?" Lesson
 * From: App - Employability Score Content (Five).docx
 */

export const MODULE_WEIGHTS = {
  age_alignment: 0.20,      // Age Module 20%
  foir_classification: 0.25, // Income Module 25%
  credit_sorting: 0.25,      // Credit Module 25%
  final_challenge: 0.30,     // Final Challenge 30%
};

export const MODULE_MAX_POINTS = {
  age_alignment: 20,         // 5 + 10 + 5
  foir_classification: 25,   // 15 + 5 + 5
  credit_sorting: 25,        // 15 + 5 + 5
  final_challenge: 30,       // 5 + 10 + 10 + 5
};

export const PERFORMANCE_BANDS = [
  { min: 85, max: 100, label: 'Expert', color: 'success', meaning: 'Ready to evaluate real customers' },
  { min: 70, max: 84, label: 'Proficient', color: 'info', meaning: 'Good understanding; minor gaps' },
  { min: 50, max: 69, label: 'Developing', color: 'warning', meaning: 'Needs more practice' },
  { min: 0, max: 49, label: 'Beginner', color: 'danger', meaning: 'Revisit modules recommended' },
];

export function getPerformanceBand(totalScore) {
  const score = Math.round(Number(totalScore) || 0);
  const band = PERFORMANCE_BANDS.find((b) => score >= b.min && score <= b.max);
  return band || PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
}

export function computeWeightedTotal(moduleScores) {
  let weighted = 0;
  for (const [moduleId, rawScore] of Object.entries(moduleScores)) {
    const weight = MODULE_WEIGHTS[moduleId];
    const maxPts = MODULE_MAX_POINTS[moduleId];
    if (weight != null && maxPts != null) {
      const pct = maxPts > 0 ? (rawScore / maxPts) * 100 : 0;
      weighted += pct * weight;
    }
  }
  return Math.round(Math.min(100, Math.max(0, weighted)));
}
