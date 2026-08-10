import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadProfile,
  loadProgressStats,
  loadProficiency,
  selectProfile,
  selectProgressStats,
  selectProficiency,
  selectProfileLoading,
  selectProfileError,
} from '@/store/slices/profileSlice';
import type { ProfileData, ProgressStats } from '@/types/profile';
import type { ProficiencyResult } from '@/types/proficiency';

export interface UseProfileDataReturn {
  profile: ProfileData | null;
  progressStats: ProgressStats | null;
  proficiency: ProficiencyResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProfileData(): UseProfileDataReturn {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const progressStats = useAppSelector(selectProgressStats);
  const proficiency = useAppSelector(selectProficiency);
  const isLoading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadProfile()),
      dispatch(loadProgressStats()),
      dispatch(loadProficiency()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    profile,
    progressStats,
    proficiency,
    isLoading,
    error,
    refresh,
  };
}
