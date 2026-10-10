/**
 * IELTS Speaking result helpers.
 *
 * Pure and dependency-free, matching the style of listeningReview.ts.
 */

export type SpeakingPronunciationStatus = 'pending' | 'measured' | 'not_measured';

export interface SpeakingPronunciationState {
  status: SpeakingPronunciationStatus;
  band: number | null;
  cefr: string | null;
}

const VALID_STATUSES: readonly string[] = ['pending', 'measured', 'not_measured'];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/**
 * Reads pronunciation state from a merged IELTS session/report record (e.g.
 * `{...session, ...report, ...report.report}`). The band is only ever
 * surfaced when status is "measured" — a stale or placeholder band value
 * must never render while the recording is still pending or was never
 * measured.
 */
export function readPronunciationState(merged: Record<string, unknown>): SpeakingPronunciationState {
  const reportData = asRecord(merged.report_data);
  const rawStatus = merged.pronunciation_status ?? reportData.pronunciation_status;
  const status: SpeakingPronunciationStatus = VALID_STATUSES.includes(rawStatus as string)
    ? (rawStatus as SpeakingPronunciationStatus)
    : 'not_measured';

  if (status !== 'measured') {
    return { status, band: null, cefr: null };
  }

  const pronunciation = asRecord(reportData.pronunciation);
  const bandValue = merged.pronunciation_band ?? pronunciation.band;
  const band = typeof bandValue === 'number' ? bandValue : Number(bandValue);
  const cefrValue = pronunciation.cefr;

  return {
    status,
    band: Number.isFinite(band) ? band : null,
    cefr: typeof cefrValue === 'string' ? cefrValue : null,
  };
}

/** A raw session/report band field as a finite number, or null. */
export function toBandNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Merges an IELTS test session with its /complete response into the flat
 * record the band/pronunciation readers above expect.
 *
 * `report.report` is a ONE-TIME snapshot (`resultSummary`, taken when the
 * text bands were first scored) — it goes stale the moment pronunciation
 * finishes measuring afterwards, or the session is re-fetched by polling.
 * Fresh data (the polled `session`, then `report`'s own top-level fields,
 * which the poll keeps current) must win, so `report.report` is spread
 * FIRST, never last.
 */
export function mergeSessionReport(
  session: Record<string, any> | null | undefined,
  report: (Record<string, any> & { report?: Record<string, any> | null }) | null | undefined
): Record<string, any> {
  return { ...(report?.report ?? {}), ...(session ?? {}), ...(report ?? {}) };
}
