/**
 * Call Hooks
 * 
 * Central export for all call-related hooks.
 * Matches Next.js structure for consistency.
 */

export { useCallStatus } from './useCallStatus';
export type { CallStatusReturn } from './useCallStatus';

// Export with both names for convenience
export { useCallSessionNative, useCallSessionNative as useCallSession } from './useCallSessionNative';
export type { UseCallSessionReturn } from './useCallSessionNative';

export { useCallLifecycle } from './useCallLifecycle';
export type { UseCallLifecycleReturn } from './useCallLifecycle';

export { useSessionSaving } from './useSessionSaving';
export type { UseSessionSavingReturn, SessionSaveState } from './useSessionSaving';

export { useSessionStateEvents } from './useSessionStateEvents';
export type { UseSessionStateEventsOptions } from './useSessionStateEvents';

export { useCallSoundEffects } from './useCallSoundEffects';

export { useCallDerivedState } from './useCallDerivedState';
export type { UseCallDerivedStateReturn } from './useCallDerivedState';
