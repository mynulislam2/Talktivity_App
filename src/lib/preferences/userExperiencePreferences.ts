import AsyncStorage from '@react-native-async-storage/async-storage';

export const COACH_SPEECH_RATE_OPTIONS = [0.9, 1, 1.1] as const;
export const DISPLAY_LANGUAGE_OPTIONS = ['English', 'Bangla'] as const;

export type CoachSpeechRate = (typeof COACH_SPEECH_RATE_OPTIONS)[number];
export type DisplayLanguage = (typeof DISPLAY_LANGUAGE_OPTIONS)[number];

const COACH_SPEECH_RATE_KEY = 'talktivity.coachSpeechRate';
const DISPLAY_LANGUAGE_KEY = 'talktivity.displayLanguage';

async function readStorage(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function writeStorage(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures
  }
}

export async function getCoachSpeechRate(): Promise<CoachSpeechRate> {
  const stored = Number(await readStorage(COACH_SPEECH_RATE_KEY));
  if (COACH_SPEECH_RATE_OPTIONS.includes(stored as CoachSpeechRate)) {
    return stored as CoachSpeechRate;
  }
  return 1;
}

export async function setCoachSpeechRate(rate: CoachSpeechRate): Promise<void> {
  await writeStorage(COACH_SPEECH_RATE_KEY, String(rate));
}

export function formatCoachSpeechRate(rate: number): string {
  return Number.isInteger(rate) ? `${rate}x` : `${rate.toFixed(1)}x`;
}

export async function getDisplayLanguage(): Promise<DisplayLanguage> {
  const stored = await readStorage(DISPLAY_LANGUAGE_KEY);
  if (DISPLAY_LANGUAGE_OPTIONS.includes(stored as DisplayLanguage)) {
    return stored as DisplayLanguage;
  }
  return 'English';
}

export async function setDisplayLanguage(
  language: DisplayLanguage
): Promise<void> {
  await writeStorage(DISPLAY_LANGUAGE_KEY, language);
}
