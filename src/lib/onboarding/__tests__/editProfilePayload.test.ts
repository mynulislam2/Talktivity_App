import { buildOnboardingSavePayload } from '../editProfilePayload';

function fullRecord() {
  return {
    id: 1,
    user_id: 42,
    native_language: 'spanish',
    current_level: 'intermediate',
    tutor_style: ['encouraging'],
    industry: ['finance'],
    gender: 'female',
    main_goal: ['ielts'],
    speaking_frequency: 'daily',
  };
}

describe('buildOnboardingSavePayload — the camelCase→snake_case + full-record fix', () => {
  it('sends the edited field under its snake_case backend column', () => {
    const payload = buildOnboardingSavePayload(fullRecord(), 'nativeLanguage', 'french');
    expect(payload.native_language).toBe('french');
    expect((payload as any).nativeLanguage).toBeUndefined();
  });

  it('preserves every other field from the current record untouched', () => {
    const payload = buildOnboardingSavePayload(fullRecord(), 'currentLevel', 'advanced');
    expect(payload.current_level).toBe('advanced');
    expect(payload.industry).toEqual(['finance']);
    expect(payload.gender).toBe('female');
    expect(payload.main_goal).toEqual(['ielts']);
    expect(payload.speaking_frequency).toBe('daily');
    expect(payload.tutor_style).toEqual(['encouraging']); // unrelated field, unchanged
  });

  it('maps the multi-select tutorStyle edit to the tutor_style array column', () => {
    const payload = buildOnboardingSavePayload(fullRecord(), 'tutorStyle', ['strict', 'academic']);
    expect(payload.tutor_style).toEqual(['strict', 'academic']);
  });

  it('does not crash when there is no current record yet', () => {
    const payload = buildOnboardingSavePayload(null, 'nativeLanguage', 'german');
    expect(payload).toEqual({ native_language: 'german' });
  });
});
