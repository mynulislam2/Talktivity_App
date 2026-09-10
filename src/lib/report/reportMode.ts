/**
 * Report Mode
 *
 * Users who picked "IELTS" during onboarding get the band-scored report;
 * everyone else keeps the general (score/level) report. The backend signals
 * this by including band fields in the payload for IELTS users and omitting
 * them for everyone else, so the mode is derived from the payload itself.
 *
 * Pure and dependency-free on purpose: the web app carries an identical
 * helper and the two must stay semantically the same.
 */

export type ReportMode = 'ielts' | 'general';

const BAND_KEYS = [
  'band',
  'fluencyBand',
  'vocabularyBand',
  'grammarBand',
  'pronunciationBand',
] as const;

const CRITERION_KEYS = [
  'fluency',
  'vocabulary',
  'grammar',
  'pronunciation',
  'discourse',
] as const;

/**
 * A band is band data only when it is a POSITIVE finite number, or a numeric
 * string carrying one. `0` is not treated as a band: the backend uses null for
 * "absent", so a 0 here is a degraded value rather than a measured band.
 *
 * This rule is duplicated in the web app at talktivity_frontend
 * lib/report/reportMode.ts and MUST stay identical - if the two drift, the same
 * report renders as IELTS on one platform and general on the other. The shared
 * case table in the tests pins them together.
 */
function isFiniteNumber(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0;
  }
  return false;
}

function hasCriterionBand(section: unknown): boolean {
  if (!section || typeof section !== 'object') return false;
  const record = section as Record<string, unknown>;
  return BAND_KEYS.some((key) => isFiniteNumber(record[key]));
}

/**
 * "ielts" only when the payload actually carries band data: a finite numeric
 * `overall_band`, or a finite per-criterion band. Anything else — missing,
 * null, a string such as "6.5", or garbage — is "general".
 */
export function getReportMode(report: unknown): ReportMode {
  if (!report || typeof report !== 'object') return 'general';

  const record = report as Record<string, unknown>;

  if (isFiniteNumber(record.overall_band)) return 'ielts';
  if (hasCriterionBand(record)) return 'ielts';

  return CRITERION_KEYS.some((key) => hasCriterionBand(record[key]))
    ? 'ielts'
    : 'general';
}
