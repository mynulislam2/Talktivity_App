/**
 * useHomeData Hook
 * 
 * Orchestrates all data loading for the home page:
 * - Waits for subscription readiness
 * - Ensures active course exists (initializes if missing)
 * - Fetches course status from Redux
 * - Triggers batch progression check once
 * 
 * Now uses Redux for course status management.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription, selectSubscriptionStatusLoading } from '@/store/slices/subscriptionSlice';
import { selectLifecycleData } from '@/store/slices/lifecycleSlice';
import {
  loadCourseStatus,
  initializeCourse,
  checkAndCreateNextBatch,
  selectCourseStatus,
  selectCourseLoading,
  selectCourseError,
} from '@/store/slices/courseSlice';
import type { CourseStatus } from '@/service/CourseService';

export interface UseHomeDataResult {
  courseStatus: CourseStatus | null;
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
}

/**
 * Hook to orchestrate home page data loading
 */
export function useHomeData(): UseHomeDataResult {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(selectCurrentSubscription);
  const subscriptionLoading = useAppSelector(selectSubscriptionStatusLoading);
  const lifecycle = useAppSelector(selectLifecycleData);

  // Get course status from Redux
  const courseStatus = useAppSelector(selectCourseStatus);
  const isLoading = useAppSelector(selectCourseLoading);
  const error = useAppSelector(selectCourseError);

  // Track if batch check has been done to avoid multiple calls
  const batchCheckDoneRef = useRef(false);
  const initializationAttemptedRef = useRef(false);

  // Load course data
  const loadCourseData = useCallback(async () => {
    // Don't do anything while subscription status is still loading
    if (subscriptionLoading) return;

    // Guard: subscription must be available
    const subscriptionActive = subscription?.active || false;
    const isFreeTrial = subscription?.subscription?.is_free_trial || false;
    const hasSubscription = subscriptionActive || isFreeTrial;

    if (!hasSubscription) {
      return;
    }

    // One-shot: if we already tried once and still have no course, stop spamming get-active.
    // User can trigger retry() manually (or a later navigation/remount will retry).
    if (!courseStatus && initializationAttemptedRef.current) {
      return;
    }

    // Check if course exists, initialize if missing (first attempt only)
    if (!courseStatus && !initializationAttemptedRef.current) {
      initializationAttemptedRef.current = true;
      // Try to load course status first
      const result = await dispatch(loadCourseStatus()).unwrap();
      if (!result) {
        // No course found (NO_ACTIVE_COURSE), initialize one
        await dispatch(initializeCourse()).unwrap();
      }
    }
  }, [dispatch, subscription, subscriptionLoading, courseStatus]);

  // Check batch progression once when subscription is available
  useEffect(() => {
    const checkBatchProgression = async () => {
      if (batchCheckDoneRef.current) return;

      try {
        const subscriptionActive = subscription?.active || false;
        const isFreeTrial = subscription?.subscription?.is_free_trial || false;
        const hasSubscription = subscriptionActive || isFreeTrial;

        if (!hasSubscription) {
          return;
        }

        // Only check batch if we have a course status
        if (courseStatus) {
          await dispatch(checkAndCreateNextBatch()).unwrap();
          batchCheckDoneRef.current = true;
        }
      } catch (error) {
        // Error checking batch progression
        // Don't set error state - batch check is non-critical
        batchCheckDoneRef.current = true; // Mark as done even on error to avoid retries
      }
    };

    if (subscription && courseStatus && !batchCheckDoneRef.current) {
      checkBatchProgression();
    }
  }, [dispatch, subscription, courseStatus]);

  // Load course data when subscription is available
  useEffect(() => {
    if (subscription) {
      loadCourseData();
    }
  }, [subscription, loadCourseData]);

  const retry = useCallback(async () => {
    // Allow another one-shot attempt
    initializationAttemptedRef.current = false;
    batchCheckDoneRef.current = false;
    await loadCourseData();
  }, [loadCourseData]);

  return {
    courseStatus,
    isLoading,
    error,
    retry,
  };
}
