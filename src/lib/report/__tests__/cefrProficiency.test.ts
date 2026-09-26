import { mapProfileProgressToProficiency } from '../cefrProficiency';
import type { ProfileProgress } from '@/types/proficiency';

function profileProgress(overrides: Partial<ProfileProgress> = {}): ProfileProgress {
  return {
    overall_band: 6.5,
    overall_cefr: 'B2',
    approximate: false,
    criteria: {
      fc: { band: 6.5, cefr: 'B2' },
      lr: { band: 6.0, cefr: 'B1' },
      gra: { band: 6.5, cefr: 'B2' },
      pron: { band: 6.0, cefr: 'B1' },
    },
    target_band: 7.0,
    band_gap: 0.5,
    trend_7d: 'improving',
    last_assessed_at: '2026-09-20T00:00:00.000Z',
    sources: 5,
    ...overrides,
  };
}

describe('mapProfileProgressToProficiency — the sole source of the Profile band card', () => {
  it('returns the "no data yet" empty result for null/undefined', () => {
    expect(mapProfileProgressToProficiency(null).confidence).toBe('none');
    expect(mapProfileProgressToProficiency(null).overallLevel).toBe('Not yet assessed');
    expect(mapProfileProgressToProficiency(undefined).confidence).toBe('none');
  });

  it('returns the empty result when overall_band is null (no assessment yet)', () => {
    const result = mapProfileProgressToProficiency(profileProgress({ overall_band: null }));
    expect(result.confidence).toBe('none');
    expect(result.overallLevel).toBe('Not yet assessed');
  });

  it('still carries a learner-set target_band through even before any assessment', () => {
    const result = mapProfileProgressToProficiency(
      profileProgress({ overall_band: null, target_band: 7.0, band_gap: null })
    );
    expect(result.targetBand).toBe(7.0);
  });

  it('maps overall band/cefr straight through as "Band 6.5 (B2)" material — ieltsBand + descriptor', () => {
    const result = mapProfileProgressToProficiency(profileProgress());
    expect(result.ieltsBand).toBe('6.5');
    expect(result.overallLevel).toBe('B2');
    expect(result.ieltsDescriptor).toBeTruthy();
  });

  it('maps each FC/LR/GRA criterion to fluency/vocabulary/grammar — never from discourse', () => {
    const result = mapProfileProgressToProficiency(profileProgress());
    expect(result.skills.fluency.ieltsBand).toBe('6.5');
    expect(result.skills.vocabulary.ieltsBand).toBe('6.0');
    expect(result.skills.grammar.ieltsBand).toBe('6.5');
  });

  it('includes pronunciation only when the server has a measured pron criterion', () => {
    const measured = mapProfileProgressToProficiency(profileProgress());
    expect(measured.skills.pronunciation?.ieltsBand).toBe('6.0');

    const notMeasured = mapProfileProgressToProficiency(
      profileProgress({ criteria: { ...profileProgress().criteria, pron: null } })
    );
    expect(notMeasured.skills.pronunciation).toBeUndefined();
  });

  it('carries target_band and band_gap through untouched', () => {
    const result = mapProfileProgressToProficiency(profileProgress());
    expect(result.targetBand).toBe(7.0);
    expect(result.bandGap).toBe(0.5);
  });

  it('omits target_band when the learner has none set', () => {
    const result = mapProfileProgressToProficiency(
      profileProgress({ target_band: null, band_gap: null })
    );
    expect(result.targetBand).toBeUndefined();
    expect(result.bandGap).toBeUndefined();
  });

  it.each([
    [0, 'none'],
    [1, 'preliminary'],
    [2, 'preliminary'],
    [3, 'developing'],
    [4, 'developing'],
    [5, 'established'],
    [10, 'established'],
  ])('maps %i sources to confidence %s', (sources, confidence) => {
    const result = mapProfileProgressToProficiency(profileProgress({ sources }));
    expect(result.confidence).toBe(confidence);
  });

  it('carries sessionCount from sources', () => {
    const result = mapProfileProgressToProficiency(profileProgress({ sources: 8 }));
    expect(result.sessionCount).toBe(8);
  });
});
