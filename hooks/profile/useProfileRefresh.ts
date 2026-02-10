/**
 * useProfileRefresh Hook
 * 
 * Handles visibility change refresh and provides manual refresh function.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadProfile, loadProgressStats } from '@/store/slices/profileSlice';

export interface UseProfileRefreshReturn {
  refresh: () => Promise<void>;
}

export function useProfileRefresh(): UseProfileRefreshReturn {
  const dispatch = useAppDispatch();

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadProfile()),
      dispatch(loadProgressStats()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    // Refresh when app becomes active (React Native uses AppState instead of document.hidden)
    const { AppState } = require('react-native');
    
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refresh]);

  return {
    refresh,
  };
}
