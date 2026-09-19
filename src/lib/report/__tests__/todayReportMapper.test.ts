import { normalizeTodayReport } from '../todayReportMapper';

const ieltsPayload = {
  overall_band: 6.5,
  target_band: 7.5,
  band_gap: 1.0,
  action_plan_priorities: ['Reduce hesitation', 'Upgrade collocations'],
  fluency: { band: 6.5, fluencyBand: 6.5, fluencyScore: 65, fluencyLevel: 'B2' },
  vocabulary: {
    band: 6.0,
    vocabularyScore: 60,
    vocabularyLevel: 'B1',
    sentenceUpgrades: [{ original: 'I like it.', improved: 'I am fond of it.', targetBand: '7.5' }],
  },
  grammar: { band: 6.5, grammarScore: 65, grammarLevel: 'B2' },
  pronunciation: {
    band: 6.5,
    pronunciationScore: 65,
    struggledWords: [{ word: 'comfortable', phonetic: 'KUMF-tuh-buhl', syllableStress: 'FIRST' }],
  },
};

describe('normalizeTodayReport in Talktivity-App', () => {
  describe('resilience to null/undefined/empty inputs', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['empty object', {}],
      ['a bare string', 'boom'],
      ['a number', 42],
      ['an array', []],
    ])('survives %s and still returns the four core sections', (_, input) => {
      const report = normalizeTodayReport(input as any);
      expect(report.fluency).toBeDefined();
      expect(report.vocabulary).toBeDefined();
      expect(report.grammar).toBeDefined();
      expect(report.discourse).toBeDefined();
    });

    it('unwraps a { report: ... } envelope', () => {
      const report = normalizeTodayReport({ report: ieltsPayload });
      expect(report.overall_band).toBe(6.5);
      expect(report.fluency.fluencyScore).toBe(65);
    });

    it('carries IELTS band and section fields through end to end', () => {
      const report = normalizeTodayReport(ieltsPayload);
      expect(report.overall_band).toBe(6.5);
      expect(report.target_band).toBe(7.5);
      expect(report.band_gap).toBe(1.0);
      expect(report.action_plan_priorities).toEqual([
        'Reduce hesitation',
        'Upgrade collocations',
      ]);
      expect(report.fluency.band).toBe(6.5);
      expect(report.vocabulary.sentenceUpgrades).toHaveLength(1);
      expect(report.pronunciation?.struggledWords).toHaveLength(1);
    });
  });

  describe('Band validation and coercion (toBand / pickBand)', () => {
    it('coerces string numbers like "6.5" into numeric 6.5', () => {
      const report = normalizeTodayReport({ fluency: { band: '6.5' } });
      expect(report.fluency.band).toBe(6.5);
    });

    it('clamps out-of-range bands to [0.0, 9.0]', () => {
      const report = normalizeTodayReport({
        overall_band: 12,
        fluency: { band: 47 },
      });
      expect(report.overall_band).toBeLessThanOrEqual(9);
      expect(report.fluency.band).toBeLessThanOrEqual(9);
    });

    it('preserves legitimate 0 scores without dropping them', () => {
      const report = normalizeTodayReport({
        overall_band: 0,
        fluency: { band: 0 },
      });
      expect(report.overall_band).toBe(0);
      expect(report.fluency.band).toBe(0);
    });
  });

  describe('Array coercion (toArray)', () => {
    it('ensures sentenceUpgrades is an array even when given malformed input', () => {
      const report = normalizeTodayReport({
        vocabulary: { sentenceUpgrades: 'not-an-array' },
      });
      expect(Array.isArray(report.vocabulary.sentenceUpgrades)).toBe(true);
    });

    it('parses string sentence upgrades with instead of / try patterns', () => {
      const report = normalizeTodayReport({
        vocabulary: {
          sentenceUpgrades: ["Instead of 'good', try 'exceptional'"],
        },
      });
      expect(report.vocabulary.sentenceUpgrades[0]).toEqual({
        original: 'good',
        improved: 'exceptional',
        targetBand: '7.5',
        explanation: "Instead of 'good', try 'exceptional'",
      });
    });

    it('ensures pronunciation struggledWords is an array', () => {
      const report = normalizeTodayReport({
        pronunciation: { struggledWords: { word: 'oops' } },
      });
      expect(Array.isArray(report.pronunciation?.struggledWords)).toBe(true);
    });
  });

  describe('Fraction to percentage scaling (toPercent)', () => {
    it('normalizes fractional complexSentenceRatio (0.4) to percentage width (40)', () => {
      const report = normalizeTodayReport({
        grammar: { sentenceComplexity: { complexSentenceRatio: 0.4 } },
      });
      expect(report.grammar.sentenceComplexity?.complexSentenceRatio).toBe(40);
    });

    it('leaves existing percentage values (40) intact', () => {
      const report = normalizeTodayReport({
        grammar: { sentenceComplexity: { complexSentenceRatio: 40 } },
      });
      expect(report.grammar.sentenceComplexity?.complexSentenceRatio).toBe(40);
    });
  });
});
