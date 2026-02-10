/**
 * useCommunityData Hook
 * 
 * Orchestrates loading of both DMs and Groups from Redux.
 * Provides unified loading/error states and refresh function.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadDMs,
  loadGroups,
  loadJoinedGroups,
  loadLastReadStatus,
  selectDMs,
  selectGroups,
  selectCommunityLoading,
  selectCommunityError,
} from '@/store/slices/communitySlice';

export interface UseCommunityDataReturn {
  dms: any[];
  groups: any[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCommunityData(): UseCommunityDataReturn {
  const dispatch = useAppDispatch();
  const dms = useAppSelector(selectDMs);
  const groups = useAppSelector(selectGroups);
  const isLoading = useAppSelector(selectCommunityLoading);
  const error = useAppSelector(selectCommunityError);

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadDMs()),
      dispatch(loadGroups()),
      dispatch(loadJoinedGroups()),
      dispatch(loadLastReadStatus()),
    ]);
  }, [dispatch]);

  // Only load data once on mount, not on every refresh change
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return {
    dms,
    groups,
    isLoading,
    error,
    refresh,
  };
}
