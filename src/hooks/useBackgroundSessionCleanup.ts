/**
 * useBackgroundSessionCleanup Hook
 *
 * Listens for AppState changes. When the mobile app is backgrounded or minimized
 * during an active AI call session, triggers cleanup/disconnect to prevent
 * background battery drain and call-time quota depletion.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useBackgroundSessionCleanup = (
  isActive: boolean,
  onCleanup: () => void
) => {
  const onCleanupRef = useRef(onCleanup);
  onCleanupRef.current = onCleanup;

  useEffect(() => {
    if (!isActive) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('[WebRTC] App moved to background — auto-disconnecting active call session');
        onCleanupRef.current();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isActive]);
};
