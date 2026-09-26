/**
 * Edit Profile → POST /onboarding payload.
 *
 * The backend's saveOrUpdateOnboarding does a full UPDATE of every onboarding
 * column on every call, reading a fixed snake_case field list off the
 * payload — any field missing from it is nulled (scalar columns) or emptied
 * to `[]` (JSONB array columns). So a single-field edit must:
 *   1. use the backend's snake_case column name, and
 *   2. be merged onto the full current record, never sent alone.
 */

export type EditableOnboardingField = 'nativeLanguage' | 'currentLevel' | 'tutorStyle';

const FIELD_TO_COLUMN: Record<EditableOnboardingField, string> = {
  nativeLanguage: 'native_language',
  currentLevel: 'current_level',
  tutorStyle: 'tutor_style',
};

export function buildOnboardingSavePayload(
  currentRecord: Record<string, unknown> | null | undefined,
  field: EditableOnboardingField,
  value: string | string[] | null
): Record<string, unknown> {
  return {
    ...(currentRecord ?? {}),
    [FIELD_TO_COLUMN[field]]: value,
  };
}
