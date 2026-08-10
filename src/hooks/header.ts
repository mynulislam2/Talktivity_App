import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectProfile,
  loadProfile,
  selectProfileDataLoading,
  loadProgressStats,
  selectProgressStats,
  selectProgressLoading,
} from '@/store/slices/profileSlice';
import {
  selectCourseStatus,
  loadCourseStatus,
} from '@/store/slices/courseSlice';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';
import { authService } from '@/services/auth';
import type { ProfileData } from '@/types/profile';

export interface UseHeaderProfileResult {
  user: ProfileData | null;
  loading: boolean;
  error: string | null;
}

export function useHeaderProfile(): UseHeaderProfileResult {
  const dispatch = useAppDispatch();
  const profileFromRedux = useAppSelector(selectProfile);
  const loading = useAppSelector(selectProfileDataLoading);

  useEffect(() => {
    if (!profileFromRedux && !loading) {
      dispatch(loadProfile());
    }
  }, [dispatch, profileFromRedux, loading]);

  const user: ProfileData | null = useMemo(() => {
    let merged = profileFromRedux || null;

    try {
      const u = authService.getUser() as any;
      if (u) {
        if (!merged) {
          const resolvedFullName = u.fullName || u.full_name || u.name || '';
          merged = {
            id: u.id ?? 0,
            email: u.email ?? '',
            full_name: resolvedFullName,
            profile_picture: u.profile_picture || undefined,
            isEmailVerified: u.isEmailVerified ?? u.is_email_verified ?? false,
            emailVerifiedAt: u.emailVerifiedAt ?? u.email_verified_at ?? null,
            lifecycle: u.lifecycle || undefined,
          } as ProfileData;
        } else if (!merged.profile_picture && u.profile_picture) {
          merged = { ...merged, profile_picture: u.profile_picture };
        }
      }
    } catch {}

    return merged;
  }, [profileFromRedux]);

  return { user, loading, error: null };
}

export interface UseHeaderStreakResult {
  streak: number;
  loading: boolean;
}

export function useHeaderStreak(): UseHeaderStreakResult {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(selectCurrentSubscription) as any;
  const progressStats = useAppSelector(selectProgressStats) as any;
  const progressLoading = useAppSelector(selectProgressLoading);
  const courseStatus = useAppSelector(selectCourseStatus) as any;

  const hasSubscription = useMemo(() => {
    if (!subscription) return false;
    return Boolean(
      (subscription as any).active ||
        (subscription as any).subscription?.is_free_trial ||
        (subscription as any).plan
    );
  }, [subscription]);

  useEffect(() => {
    if (!authService.isAuthenticated()) return;
    if (!hasSubscription) return;
    if (!progressStats && !progressLoading) {
      dispatch(loadProgressStats());
    }
  }, [dispatch, hasSubscription, progressLoading, progressStats]);

  const streak = useMemo(() => {
    const profileStreak =
      progressStats?.courseProgress?.progress?.current_streak;
    if (profileStreak !== undefined && profileStreak !== null) {
      return Math.max(0, Number(profileStreak));
    }
    const fallbackCourseStreak = courseStatus?.progress?.current_streak;
    if (fallbackCourseStreak !== undefined && fallbackCourseStreak !== null) {
      return Math.max(0, Number(fallbackCourseStreak));
    }
    return 0;
  }, [courseStatus, progressStats]);

  return {
    streak,
    loading: progressLoading && !progressStats && !courseStatus,
  };
}
