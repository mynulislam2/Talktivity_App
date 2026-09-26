import { getReportMode } from '../reportMode';

describe('getReportMode', () => {
  it('returns "ielts" for a positive numeric overall_band', () => {
    expect(getReportMode({ overall_band: 6.5 })).toBe('ielts');
    expect(getReportMode({ overall_band: 9 })).toBe('ielts');
  });

  it('returns "ielts" for a finite per-criterion band', () => {
    expect(getReportMode({ fluency: { band: 6.0 } })).toBe('ielts');
    expect(getReportMode({ fluency: { fluencyBand: 6.0 } })).toBe('ielts');
    expect(getReportMode({ vocabulary: { vocabularyBand: 5.5 } })).toBe(
      'ielts'
    );
    expect(getReportMode({ grammar: { grammarBand: 7 } })).toBe('ielts');
    expect(getReportMode({ pronunciation: { pronunciationBand: 6.5 } })).toBe(
      'ielts'
    );
    expect(getReportMode({ discourse: { band: 6.5 } })).toBe('ielts');
  });

  it('returns "general" for a band of 0 - absent degrades to 0, it is not a measured band', () => {
    expect(getReportMode({ overall_band: 0 })).toBe('general');
    expect(getReportMode({ fluency: { band: 0 } })).toBe('general');
  });

  it('returns "general" for a payload with no band fields at all', () => {
    expect(
      getReportMode({
        fluency: {
          fluencyScore: 62,
          fluencyLevel: 'B2',
          improvementTarget: { percentToNextLevel: 8, nextLevel: 'C1' },
        },
        grammar: { grammarScore: 55, grammarLevel: 'B1' },
        vocabulary: { vocabularyScore: 60, vocabularyLevel: 'B2' },
        discourse: { discourseScore: 58, discourseLevel: 'B1' },
      })
    ).toBe('general');
  });

  it('returns "general" for null / undefined / non-objects', () => {
    expect(getReportMode(null)).toBe('general');
    expect(getReportMode(undefined)).toBe('general');
    expect(getReportMode(0)).toBe('general');
    expect(getReportMode('6.5')).toBe('general');
    expect(getReportMode(true)).toBe('general');
    expect(getReportMode([])).toBe('general');
  });

  it('returns "general" for null or undefined band values', () => {
    expect(getReportMode({ overall_band: null })).toBe('general');
    expect(getReportMode({ overall_band: undefined })).toBe('general');
    expect(getReportMode({ fluency: { band: null } })).toBe('general');
    expect(getReportMode({ fluency: null })).toBe('general');
  });

  it('accepts a numeric string band - JSON payloads are not always typed', () => {
    expect(getReportMode({ overall_band: '6.5' })).toBe('ielts');
    expect(getReportMode({ overall_band: 'not a band' })).toBe('general');
    expect(getReportMode({ overall_band: '' })).toBe('general');
  });

  it('returns "general" for garbage band values', () => {
    expect(getReportMode({ overall_band: NaN })).toBe('general');
    expect(getReportMode({ overall_band: Infinity })).toBe('general');
    expect(getReportMode({ overall_band: -Infinity })).toBe('general');
    expect(getReportMode({ overall_band: {} })).toBe('general');
    expect(getReportMode({ overall_band: [] })).toBe('general');
    expect(getReportMode({ fluency: { band: NaN } })).toBe('general');
    expect(getReportMode({ fluency: 'B2' })).toBe('general');
  });

  it('returns "general" for an empty payload', () => {
    expect(getReportMode({})).toBe('general');
  });

  it('returns "ielts" for insufficient_speech even with every criterion band null', () => {
    expect(
      getReportMode({
        insufficient_speech: true,
        overall_band: null,
        fluency: { band: null },
      })
    ).toBe('ielts');
  });
});


// ---------------------------------------------------------------------------
// CROSS-REPO CONTRACT. talktivity_frontend lib/report/reportMode.ts implements
// this same rule for the web. If the two drift, one report renders as IELTS on
// mobile and general on web. This exact table is asserted in BOTH repos.
// ---------------------------------------------------------------------------
describe('shared getReportMode contract', () => {
  const CASES: Array<[string, unknown, 'ielts' | 'general']> = [
    ['positive overall_band', { overall_band: 6.5 }, 'ielts'],
    ['numeric string band', { overall_band: '6.5' }, 'ielts'],
    ['per-criterion band', { fluency: { band: 7 } }, 'ielts'],
    ['pronunciationBand only', { pronunciation: { pronunciationBand: 6 } }, 'ielts'],
    ['band of 0', { overall_band: 0 }, 'general'],
    ['negative band', { overall_band: -1 }, 'general'],
    ['NaN band', { overall_band: NaN }, 'general'],
    ['Infinity band', { overall_band: Infinity }, 'general'],
    ['null band', { overall_band: null }, 'general'],
    ['no band fields', { fluency: { fluencyScore: 65 } }, 'general'],
    ['pre-merge general payload', { fluency: { fluencyScore: 59, improvementTarget: { percentToNextLevel: 11 } } }, 'general'],
    ['empty object', {}, 'general'],
    ['null', null, 'general'],
    ['undefined', undefined, 'general'],
    ['a string', 'boom', 'general'],
    ['an array', [], 'general'],
    ['insufficient_speech true, no bands', { insufficient_speech: true }, 'ielts'],
  ];

  it.each(CASES)('%s -> %s', (_label, payload, expected) => {
    expect(getReportMode(payload)).toBe(expected);
  });
});
