/**
 * Practice Hooks
 * 
 * Central export for all practice-related hooks.
 */

export { usePracticeStatus } from './usePracticeStatus';
export type { UsePracticeStatusReturn } from './usePracticeStatus';

// Export React Native version as the default, with alias for convenience
export { usePracticeSessionNative, usePracticeSessionNative as usePracticeSession } from './usePracticeSessionNative';
export type { UsePracticeSessionReturn } from './usePracticeSessionNative';

export { usePracticeSaving } from './usePracticeSaving';
export type { UsePracticeSavingReturn, PracticeSessionSaveState } from './usePracticeSaving';

export { usePracticeSoundEffects } from './usePracticeSoundEffects';
export { usePracticeDerivedState } from './usePracticeDerivedState';
export type { UsePracticeDerivedStateReturn } from './usePracticeDerivedState';

export { usePracticeSessionType } from './usePracticeSessionType';
export { usePracticeSessionStateEvents } from './usePracticeSessionStateEvents';
export type { UsePracticeSessionStateEventsOptions } from './usePracticeSessionStateEvents';
