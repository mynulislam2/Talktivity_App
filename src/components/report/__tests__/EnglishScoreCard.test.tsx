import React from 'react';
import { render } from '@testing-library/react-native';
import { EnglishScoreCard } from '../EnglishScoreCard';
import { scoreToIeltsBand } from '../../../lib/report/cefrProficiency';
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

describe('scoreToIeltsBand — the band derivation used by EnglishScoreCard', () => {
  it('never leaves the 1.0-9.0 IELTS scale', () => {
    expect(scoreToIeltsBand(100)).toBe('9.0');
    expect(scoreToIeltsBand(95)).toBe('9.0');
    expect(scoreToIeltsBand(0)).toBe('1.0');
  });
});

describe('EnglishScoreCard band rendering (ielts mode)', () => {
  // The hero band comes only from a measured overall_band; it is never
  // derived from the 0-100 overall score (spec 2026-09-24, "App only").
  it('renders the measured overall_band in the hero', () => {
    const { getByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall: 100, overall_band: 9 })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    expect(getByText('Band 9.0')).toBeTruthy();
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

  it('renders a skill bar band of 0 as "Band 1.0", not as a percentage', () => {
    const { getAllByText, queryByText } = render(
      <EnglishScoreCard
        overallScores={scores({ overall: 0, fluency: 0 })}
        onContinue={() => {}}
        mode="ielts"
      />
    );
    // The Fluency skill bar derives Band 1.0 from a 0 score (the hero has no
    // measured band); a falsy-but-present band must not fall through to the
    // percentage branch.
    expect(getAllByText('Band 1.0')).toHaveLength(1);
    expect(queryByText('0%')).toBeNull();
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
