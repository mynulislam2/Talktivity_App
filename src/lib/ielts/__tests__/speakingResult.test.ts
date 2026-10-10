import { mergeSessionReport, readPronunciationState, toBandNumber } from '../speakingResult';

describe('readPronunciationState — never shows a band unless status is measured', () => {
  it('surfaces the band + cefr when status is measured', () => {
    const state = readPronunciationState({
      pronunciation_status: 'measured',
      pronunciation_band: 6.5,
      report_data: { pronunciation: { cefr: 'B2' } },
    });
    expect(state).toEqual({ status: 'measured', band: 6.5, cefr: 'B2' });
  });

  it('hides the band while pending, even if a stale band value is present', () => {
    const state = readPronunciationState({
      pronunciation_status: 'pending',
      pronunciation_band: 6.5,
    });
    expect(state).toEqual({ status: 'pending', band: null, cefr: null });
  });

  it('hides the band when not_measured, even if a stale band value is present', () => {
    const state = readPronunciationState({
      pronunciation_status: 'not_measured',
      pronunciation_band: 6.5,
    });
    expect(state).toEqual({ status: 'not_measured', band: null, cefr: null });
  });

  it('defaults to not_measured when there is no status at all', () => {
    const state = readPronunciationState({ pronunciation_band: 6.5 });
    expect(state.status).toBe('not_measured');
    expect(state.band).toBeNull();
  });

  it('ignores a garbage status value and defaults to not_measured', () => {
    const state = readPronunciationState({ pronunciation_status: 'nope' });
    expect(state.status).toBe('not_measured');
  });

  it('falls back to the nested report_data.pronunciation_status when the top-level one is absent', () => {
    const state = readPronunciationState({
      report_data: { pronunciation_status: 'measured', pronunciation: { band: 6.0, cefr: 'B1' } },
    });
    expect(state).toEqual({ status: 'measured', band: 6.0, cefr: 'B1' });
  });

  it('falls back to report_data.pronunciation.band when the top-level band is absent', () => {
    const state = readPronunciationState({
      pronunciation_status: 'measured',
      report_data: { pronunciation: { band: 7.0 } },
    });
    expect(state.band).toBe(7.0);
  });
});

describe('mergeSessionReport — I2: fresh session/report data must win over the stale /complete snapshot', () => {
  it('a fresh overall_band from the polled session overrides the stale resultSummary snapshot', () => {
    // report.report ("resultSummary") was computed BEFORE pronunciation was
    // measured; a later poll refreshed report's own top-level fields.
    const merged = mergeSessionReport(
      { overall_band: 6.0, overall_cefr: 'B2' }, // session (also stale here)
      {
        overall_band: 6.5, // fresh, from the poll's setReport({...prev, ...fresh})
        overall_cefr: 'B2',
        pronunciation_status: 'measured',
        report: { overall_band: 6.0, overall_cefr: 'B2' }, // stale /complete snapshot
      }
    );
    expect(merged.overall_band).toBe(6.5);
  });

  it('falls back to session/report when report.report has no matching key', () => {
    const merged = mergeSessionReport(
      { fluency_band: 6.5 },
      { pronunciation_band: 7.0, report: { overall_band: 6.5 } }
    );
    expect(merged.fluency_band).toBe(6.5);
    expect(merged.pronunciation_band).toBe(7.0);
    expect(merged.overall_band).toBe(6.5);
  });

  it('handles null session/report without throwing', () => {
    expect(mergeSessionReport(null, null)).toEqual({});
  });

  it('a fresh overall_band from the polled session overrides the stale resultSummary when report top-level lacks it', () => {
    const merged = mergeSessionReport(
      { overall_band: 6.5, overall_cefr: 'B2' },
      { report: { overall_band: 6.0, overall_cefr: 'B2' } }
    );
    expect(merged.overall_band).toBe(6.5);
  });
});

describe('toBandNumber', () => {
  it('coerces a numeric-looking value to a finite number', () => {
    expect(toBandNumber(6.5)).toBe(6.5);
    expect(toBandNumber('7')).toBe(7);
  });

  it('returns null for null, undefined, empty or non-numeric values', () => {
    expect(toBandNumber(null)).toBeNull();
    expect(toBandNumber(undefined)).toBeNull();
    expect(toBandNumber('')).toBeNull();
    expect(toBandNumber('abc')).toBeNull();
  });
});
