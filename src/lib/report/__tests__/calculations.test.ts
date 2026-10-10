import { calculateOverallScores } from '../calculations';
import type { TodayReport } from '@/types/report';

function baseReport(overrides: Partial<TodayReport> = {}): TodayReport {
  return {
    fluency: { fluencyScore: 60, fluencyLevel: 'B2' } as any,
    grammar: { grammarScore: 60, grammarLevel: 'B2' } as any,
    vocabulary: { vocabularyScore: 60, vocabularyLevel: 'B2' } as any,
    discourse: { discourseScore: 80, discourseLevel: 'C1' } as any,
    ...overrides,
  } as TodayReport;
}

describe('calculateOverallScores — real per-criterion bands (no discourse-as-pronunciation)', () => {
  it('returns null for a null report', () => {
    expect(calculateOverallScores(null)).toBeNull();
  });

  it('derives criteria.fluency/vocabulary/grammar from the report bands, not the 0-100 scores', () => {
    const report = baseReport({
      fluency: { fluencyScore: 60, fluencyLevel: 'B2', band: 6.5, cefr: 'B2' } as any,
      vocabulary: { vocabularyScore: 60, vocabularyLevel: 'B2', band: 6.0, cefr: 'B1' } as any,
      grammar: { grammarScore: 60, grammarLevel: 'B2', band: 6.5, cefr: 'B2' } as any,
    });
    const result = calculateOverallScores(report);
    expect(result?.criteria?.fluency).toEqual({ band: 6.5, cefr: 'B2' });
    expect(result?.criteria?.vocabulary).toEqual({ band: 6.0, cefr: 'B1' });
    expect(result?.criteria?.grammar).toEqual({ band: 6.5, cefr: 'B2' });
  });

  it('never sources the pronunciation criterion from discourse, even when discourse has a score', () => {
    const report = baseReport(); // discourseScore: 80, no pronunciation data at all
    const result = calculateOverallScores(report);
    expect(result?.criteria?.pronunciation).toEqual({
      band: null,
      cefr: null,
      status: 'not_measured',
    });
  });

  it('uses the measured pronunciation band + cefr only when pronunciation_status is measured', () => {
    const report = baseReport({
      pronunciation_status: 'measured',
      pronunciation: { band: 6.5, cefr: 'B2' } as any,
    });
    const result = calculateOverallScores(report);
    expect(result?.criteria?.pronunciation).toEqual({
      band: 6.5,
      cefr: 'B2',
      status: 'measured',
    });
  });

  it('hides the pronunciation band while pending, even if a stale band value is present', () => {
    const report = baseReport({
      pronunciation_status: 'pending',
      pronunciation: { band: 6.5, cefr: 'B2' } as any,
    });
    const result = calculateOverallScores(report);
    expect(result?.criteria?.pronunciation).toEqual({ band: null, cefr: null, status: 'pending' });
  });

  it('reports not_measured when pronunciation_status says so, hiding any band value', () => {
    const report = baseReport({
      pronunciation_status: 'not_measured',
      pronunciation: { band: 6.5, cefr: 'B2' } as any,
    });
    const result = calculateOverallScores(report);
    expect(result?.criteria?.pronunciation).toEqual({
      band: null,
      cefr: null,
      status: 'not_measured',
    });
  });

  it('derives measured status from source === "audio" on an old report with no pronunciation_status', () => {
    const report = baseReport({
      pronunciation: { band: 6.0 } as any,
      ...({ source: 'audio' } as any),
    });
    const result = calculateOverallScores(report);
    expect(result?.criteria?.pronunciation?.status).toBe('measured');
    expect(result?.criteria?.pronunciation?.band).toBe(6.0);
  });

  it('passes overall_cefr, insufficient_speech and low_confidence through', () => {
    const report = baseReport({
      overall_band: 6.5,
      overall_cefr: 'B2',
      insufficient_speech: true,
      low_confidence: true,
    });
    const result = calculateOverallScores(report);
    expect(result?.overall_cefr).toBe('B2');
    expect(result?.insufficient_speech).toBe(true);
    expect(result?.low_confidence).toBe(true);
  });

  it('still computes the legacy 0-100 general-mode scores unchanged', () => {
    const result = calculateOverallScores(baseReport());
    expect(result).toMatchObject({
      grammar: 60,
      vocabulary: 60,
      fluency: 60,
      discourse: 80,
      overall: 65,
      level: 'B2',
    });
  });
});
