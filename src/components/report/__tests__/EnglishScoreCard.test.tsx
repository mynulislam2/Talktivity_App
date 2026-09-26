import React from 'react';
import { render } from '@testing-library/react-native';
import { EnglishScoreCard } from '../EnglishScoreCard';
import type { OverallScores } from '../../../types/report';

function scores(overrides: Partial<OverallScores> = {}): OverallScores {
  return {
    grammar: 60,
    vocabulary: 60,
    fluency: 60,
    discourse: 60,
    overall: 60,
    level: 'B2',
    ...overrides,
  };
}

describe('EnglishScoreCard band rendering (ielts mode)', () => {
  // The hero band comes only from a measured overall_band; it is never
  // derived from the 0-100 overall score (spec 2026-09-24, "App only").
  it('renders the measured overall_band + cefr in the hero', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall: 100, overall_band: 9, overall_cefr: 'C2' })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band 9.0 (C2)')).toBeTruthy();
    expect(queryByText('Band 10.0')).toBeNull();
  });

  it('does not derive a hero band from a score of 95 when no band was measured', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall: 95 })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band not available')).toBeTruthy();
    expect(queryByText('Band 9.0')).toBeNull();
    expect(queryByText('Band 9.5')).toBeNull();
  });

  it('shows no hero band for a score of 0 instead of falling back to a fabricated 6.5', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall: 0 })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band not available')).toBeTruthy();
    expect(queryByText('Band 6.5')).toBeNull();
  });

  it('says the band is unavailable rather than inventing one when there are no scores', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={null}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band not available')).toBeTruthy();
    expect(queryByText('Band 6.5')).toBeNull();
  });

  it('shows "Speak a bit more to get a band" when insufficient_speech is set, instead of a band', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall_band: 5, overall_cefr: 'B1', insufficient_speech: true })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Speak a bit more to get a band')).toBeTruthy();
    expect(queryByText(/^Band /)).toBeNull();
  });

  it('shows a "short sample" note alongside the band when low_confidence is set', () => {
    const { getByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall_band: 6.5, overall_cefr: 'B2', low_confidence: true })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band 6.5 (B2)')).toBeTruthy();
    expect(getByText('Based on a short sample')).toBeTruthy();
  });

  it('shows a "short sample" note alongside the band when short_sample_capped is set', () => {
    const { getByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall_band: 6.0, overall_cefr: 'B2', short_sample_capped: true })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band 6.0 (B2)')).toBeTruthy();
    expect(getByText('Based on a short sample')).toBeTruthy();
  });

  it('renders a measured criterion band as "Band 0.0", not as a percentage', () => {
    const { getByText, getAllByText } = render(
      <EnglishScoreCard
        overallScores={scores({
          overall: 0,
          fluency: 0,
          criteria: {
            fluency: { band: 0, cefr: null },
            vocabulary: { band: null, cefr: null },
            grammar: { band: null, cefr: null },
            pronunciation: { band: null, cefr: null, status: 'not_measured' },
          },
        })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    // The Fluency skill bar shows the real measured band (0.0); a
    // falsy-but-present band must not fall through to the percentage branch.
    expect(getByText('Band 0.0')).toBeTruthy();
    expect(getAllByText('0%').length).toBeGreaterThan(0); // the other, unmeasured criteria still show 0%
  });

  it('shows "Not measured" for pronunciation when it was never measured', () => {
    const { getByText } = render(
      <EnglishScoreCard
        overallScores={scores()}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Not measured')).toBeTruthy();
  });

  it('shows "Measuring from your recording…" for pronunciation while it is pending', () => {
    const { getByText } = render(
      <EnglishScoreCard
        overallScores={scores({
          criteria: {
            fluency: { band: null, cefr: null },
            vocabulary: { band: null, cefr: null },
            grammar: { band: null, cefr: null },
            pronunciation: { band: null, cefr: null, status: 'pending' },
          },
        })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Measuring from your recording…')).toBeTruthy();
  });

  it('shows the measured pronunciation band + cefr, never the discourse score', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({
          discourse: 80, // a general-mode value present on the same payload
          criteria: {
            fluency: { band: null, cefr: null },
            vocabulary: { band: null, cefr: null },
            grammar: { band: null, cefr: null },
            pronunciation: { band: 6.5, cefr: 'B2', status: 'measured' },
          },
        })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band 6.5 (B2)')).toBeTruthy();
    expect(queryByText('80%')).toBeNull();
  });
});

describe('EnglishScoreCard general mode', () => {
  it('renders no band text and no IELTS branding', () => {
    const { queryByText, getByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall: 72, level: 'B2' })}
        onContinue={() => {}}
        mode="general"
      />
    );
    expect(getByText('Your English Score')).toBeTruthy();
    expect(getByText('72 out of 100')).toBeTruthy();
    expect(getByText('Score Breakdown')).toBeTruthy();
    expect(queryByText('IELTS Criteria Breakdown')).toBeNull();
    expect(queryByText(/^Band /)).toBeNull();
  });
});
