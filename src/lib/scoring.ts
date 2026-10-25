// ============================================================
// CareerIQ Scoring Utilities
// All formulas use illustrative/demo input values.
// These are NOT real ML model outputs.
// ============================================================

/**
 * Job Matching Score
 * S = 0.55K + 0.30E + 0.10X + 0.05P
 *
 * @param K - Required-skill coverage (0-100)
 * @param E - Semantic similarity calibrated to 0-100 scale
 * @param X - Experience-level compatibility (0-100)
 * @param P - Preference compatibility (0-100)
 * @returns Overall job match score (0-100), labeled as demo score
 */
export function computeJobMatchScore(K: number, E: number, X: number, P: number): number {
  const kClamped = clamp(K, 0, 100);
  const eClamped = clamp(E, 0, 100);
  const xClamped = clamp(X, 0, 100);
  const pClamped = clamp(P, 0, 100);
  return Math.round(0.55 * kClamped + 0.30 * eClamped + 0.10 * xClamped + 0.05 * pClamped);
}

/**
 * Skill Coverage Score
 * SkillCoverage = (Matched Required Skills / Total Required Skills) × 100
 *
 * @param matched - Number of matched required skills
 * @param total - Total number of required skills
 * @returns Skill coverage percentage (0-100)
 */
export function computeSkillCoverage(matched: number, total: number): number {
  if (total === 0) return 0; // Guard against division by zero
  return Math.round(clamp((matched / total) * 100, 0, 100));
}

/**
 * ATS Compatibility Score
 * A = 0.60R + 0.25T + 0.15F
 *
 * This is a project-defined compatibility score, NOT an actual employer ATS score.
 * Different applicant-tracking systems use entirely different evaluation rules.
 *
 * @param R - Required skill match rate (0-100)
 * @param T - Relevant terminology/keyword coverage (0-100)
 * @param F - Formatting and section completeness score (0-100)
 * @returns Illustrative ATS compatibility score (0-100)
 */
export function computeATSScore(R: number, T: number, F: number): number {
  const rClamped = clamp(R, 0, 100);
  const tClamped = clamp(T, 0, 100);
  const fClamped = clamp(F, 0, 100);
  return Math.round(0.60 * rClamped + 0.25 * tClamped + 0.15 * fClamped);
}

/**
 * Career Readiness Score
 * Weighted combination of multiple readiness factors
 *
 * @param skillCompleteness - % of role-required skills present (0-100)
 * @param profileCompleteness - Resume/profile completeness (0-100)
 * @param projectEvidence - Projects demonstrating skills (0-100)
 * @param experienceMatch - Experience level match (0-100)
 * @returns Career readiness score (0-100)
 */
export function computeCareerReadiness(
  skillCompleteness: number,
  profileCompleteness: number,
  projectEvidence: number,
  experienceMatch: number
): number {
  return Math.round(
    0.40 * clamp(skillCompleteness, 0, 100) +
    0.25 * clamp(profileCompleteness, 0, 100) +
    0.20 * clamp(projectEvidence, 0, 100) +
    0.15 * clamp(experienceMatch, 0, 100)
  );
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns a human-readable score label.
 */
export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-[#1a6b3a]' };
  if (score >= 65) return { label: 'Good', color: 'text-[#1a5fb4]' };
  if (score >= 45) return { label: 'Fair', color: 'text-[#92400e]' };
  return { label: 'Needs Work', color: 'text-[#991b1b]' };
}

/**
 * Returns Tailwind background color class for score-based progress.
 */
export function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-[#1a6b3a]';
  if (score >= 65) return 'bg-[#1a5fb4]';
  if (score >= 45) return 'bg-[#d97706]';
  return 'bg-[#dc2626]';
}

/**
 * Formats a score as a percentage string.
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}
