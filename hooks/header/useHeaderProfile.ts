/**
 * useHeaderProfile Hook
 * 
 * Fetches and manages user profile data for the header.
 * Uses Redux selector first, only dispatches loadProfile if data not available.
 * Extracted from Header component to follow separation of concerns.
 */

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProfile, loadProfile, selectProfileDataLoading } from '@/store/slices/profileSlice';
import { authService } from '@/service/AuthService';
import type { ProfileData } from '@/types/profile';

export interface UseHeaderProfileResult {
  user: ProfileData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch user profile for header display
 * Uses Redux selector first, only fetches if not available
 */
export function useHeaderProfile(): UseHeaderProfileResult {
  const dispatch = useAppDispatch();
  const profileFromRedux = useAppSelector(selectProfile);
  const loading = useAppSelector(selectProfileDataLoading);

  // Load profile from Redux if not available
  useEffect(() => {
    if (!profileFromRedux && !loading) {
      dispatch(loadProfile());
    }
  }, [dispatch, profileFromRedux, loading]);

  // Merge localStorage profile picture if needed (preserve existing logic)
  const user = useMemo(() => {
    if (!profileFromRedux) return null;
    
    try {
      const u = authService.getUser();
      if (u && !profileFromRedux.profile_picture && u?.profile_picture) {
        return { ...profileFromRedux, profile_picture: u.profile_picture };
      }
    } catch {
      // Ignore errors in localStorage access
    }
    
    return profileFromRedux;
  }, [profileFromRedux]);

  return { 
    user, 
    loading, 
    error: null // Errors are handled at page level, not in header
  };
}
