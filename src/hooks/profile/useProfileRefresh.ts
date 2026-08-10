import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import {
  loadProfile,
  loadProgressStats,
  loadProficiency,
} from '@/store/slices/profileSlice';

export interface UseProfileRefreshReturn {
  refresh: () => Promise<void>;
}

export function useProfileRefresh(): UseProfileRefreshReturn {
  const dispatch = useAppDispatch();

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadProfile()),
      dispatch(loadProgressStats()),
      dispatch(loadProficiency()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [refresh]);

  return {
    refresh,
  };
}
