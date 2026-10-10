import React from 'react';
import { render } from '@testing-library/react-native';
import { CEFRProgressCard } from '../CEFRProgressCard';
import type { ProficiencyResult } from '@/types/proficiency';

function proficiency(overrides: Partial<ProficiencyResult> = {}): ProficiencyResult {
  return {
    overallScore: 72,
    overallLevel: 'B2',
    ieltsBand: '6.5',
    ieltsDescriptor: 'Competent User',
    confidence: 'established',
    skills: {
      fluency: { score: 70, level: 'B2', ieltsBand: '6.5', trend: 'stable' },
      grammar: { score: 70, level: 'B2', ieltsBand: '6.5', trend: 'stable' },
      vocabulary: { score: 66, level: 'B1', ieltsBand: '5.0', trend: 'stable' },
    },
    sessionCount: 5,
    ...overrides,
  };
}

describe('CEFRProgressCard (I6)', () => {
  it('shows the radar axis bands with their CEFR, compact', () => {
    const { getByText } = render(<CEFRProgressCard proficiency={proficiency()} />);
    // Overall + Fluency + Grammar all 6.5 (B2); Vocabulary/Lexical Resource 5.0 (B1).
    expect(getByText('5.0 (B1)')).toBeTruthy();
    expect(getByText('—')).toBeTruthy(); // pronunciation: never measured on this fixture
  });

  it('shows the self-rated start as "Band X (CEFR)" (I6 label format)', () => {
    const { getByText } = render(
      <CEFRProgressCard proficiency={null} startingLevel="beginner" />
    );
    expect(getByText('Band 2.0 (A1, approx.)')).toBeTruthy();
  });
});
