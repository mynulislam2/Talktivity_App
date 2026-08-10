export { useCallStatus } from './useCallStatus';
export { useCallSession } from './useCallSession';
export { useCallLifecycle } from './useCallLifecycle';
export { useSessionSaving } from './useSessionSaving';
export { useCallDerivedState } from './useCallDerivedState';
export { useCallSoundEffects } from './useCallSoundEffects';

export function useSessionStateEvents(_options: {
  onSaving?: (message: string) => void;
  onSaved?: () => void;
  onFailed?: (message: string) => void;
  onEndSession?: () => void;
}): void {}
