import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileCard } from '../ProfileCard';
import type { ProfileData } from '@/types/profile';
import type { ProficiencyResult } from '@/types/proficiency';

function profile(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 1,
    email: 'user@example.com',
    full_name: 'Test User',
    ...overrides,
  };
}

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
      vocabulary: { score: 70, level: 'B2', ieltsBand: '6.5', trend: 'stable' },
    },
    sessionCount: 5,
    ...overrides,
  };
}

// I6: the rating line must include the CEFR, matching the web ProfileCard's
// "IELTS Band 6.5 (B2) AI Rated" — previously the app rendered "IELTS Band
// 6.5 AI Rated" with no CEFR at all.
describe('ProfileCard rating line includes the CEFR (I6)', () => {
  it('shows "IELTS Band 6.5 (B2) AI Rated" for an assessed proficiency', () => {
    const { getByText } = render(
      <ProfileCard profile={profile()} proficiency={proficiency()} />
    );
    expect(getByText('IELTS Band 6.5 (B2) AI Rated')).toBeTruthy();
  });

  it('shows "IELTS Band 2.0 (A1, approx.) Self Rated" when there is no assessment yet', () => {
    const { getByText } = render(
      <ProfileCard
        profile={profile({ startingLevel: 'beginner' })}
        proficiency={proficiency({ confidence: 'none', overallLevel: 'Not yet assessed' })}
      />
    );
    expect(getByText('IELTS Band 2.0 (A1, approx.) Self Rated')).toBeTruthy();
  });

  it('shows "IELTS Not Yet Assessed" with neither an assessment nor a self-rated level', () => {
    const { getByText } = render(<ProfileCard profile={profile()} proficiency={null} />);
    expect(getByText('IELTS Not Yet Assessed')).toBeTruthy();
  });
});
