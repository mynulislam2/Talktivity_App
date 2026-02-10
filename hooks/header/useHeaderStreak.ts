/**
 * useHeaderStreak Hook
 * 
 * Fetches user streak for header display.
 * Now uses Redux course status instead of direct service call.
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';
import { selectCourseStatus, loadCourseStatus } from '@/store/slices/courseSlice';
import { authService } from '@/service/AuthService';

export interface UseHeaderStreakResult {
  streak: number;
  loading: boolean;
}

/**
 * Hook to fetch user streak for header display
 * Returns 0 if no active course (404 is expected and handled silently)
 */
export function useHeaderStreak(): UseHeaderStreakResult {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(selectCurrentSubscription);
  const courseStatus = useAppSelector(selectCourseStatus);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Update streak when course status changes
  useEffect(() => {
    if (courseStatus?.progress?.current_streak !== undefined) {
      setStreak(courseStatus.progress.current_streak);
      setLoading(false);
    }
  }, [courseStatus]);

  useEffect(() => {
    async function loadCourseStatusIfNeeded() {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setStreak(0);
        setLoading(false);
        return;
      }

      // Check subscription status from Redux
      if (!subscription) {
        setStreak(0);
        setLoading(false);
        return;
      }
      
      // Only fetch analytics if user has an active subscription
      const subscriptionActive = subscription.active || false;
      const isFreeTrial = subscription.subscription?.is_free_trial || false;
      const hasSubscription = subscriptionActive && (subscription.subscription || subscription.plan);
      
      if (!hasSubscription) {
        setStreak(0);
        setLoading(false);
        return;
      }

      // Load course status from Redux if not already loaded
      if (!courseStatus) {
        try {
          setLoading(true);
          await dispatch(loadCourseStatus());
        } catch (error: any) {
          // If course status load fails, silently set streak to 0
          if (error?.response?.status !== 404) {
            // Error loading course status
          }
          setStreak(0);
          setLoading(false);
        }
      }
    }

    // Load course status if needed
    if (subscription) {
      loadCourseStatusIfNeeded();
    } else {
      setLoading(false);
    }

    // Also load course status when app state becomes active (user returns to app)
    // Note: For React Native, we use AppState instead of document.visibilitychange
    // This is handled at a higher level if needed, or we can add AppState listener here
    // For now, we'll rely on the useEffect dependencies to reload when needed
  }, [subscription, courseStatus, dispatch]);

  return {
    streak,
    loading,
  };
}
