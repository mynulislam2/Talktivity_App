/**
 * useHomeData Hook (Mobile)
 *
 * Orchestrates course data loading for the home page:
 * - Waits for subscription readiness
 * - Loads active course status from Redux
 * - Handles background course generation with non-blocking initializations
 * - Subscribes to realtime `course_ready` WebSocket events to update without polling
 * - Safety backstop: 4-second verification poll while generating (up to 40s), with automatic
 *   timeout transition to prevent infinite spinners if the server or socket is down.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentSubscription,
  selectSubscriptionStatusLoading,
} from '@/store/slices/subscriptionSlice';
import {
  loadCourseStatus,
  initializeCourse,
  selectCourseStatus,
  selectCourseLoading,
  selectCourseError,
} from '@/store/slices/courseSlice';
import { subscribeToCourseReady } from '@/services/socket';
import type { CourseStatus } from '@/services/course';

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

  const courseStatus = useAppSelector(selectCourseStatus);
  const courseLoading = useAppSelector(selectCourseLoading);
  const error = useAppSelector(selectCourseError);

  const [timedOut, setTimedOut] = useState(false);
  const initAttemptedRef = useRef(false);

  // Load course data
  const loadCourseData = useCallback(async () => {
    if (subscriptionLoading) return;

    const subscriptionActive = subscription?.active || false;
    const isFreeTrial = subscription?.subscription?.is_free_trial || false;
    const hasSubscription = subscriptionActive || isFreeTrial;

    if (!hasSubscription) {
      return;
    }

    try {
      const result = await dispatch(loadCourseStatus()).unwrap();
      // If no course exists at all (404/null), trigger background initialization (non-blocking)
      if (!result && !initAttemptedRef.current) {
        initAttemptedRef.current = true;
        await dispatch(initializeCourse()).unwrap();
      }
    } catch (err) {
      console.warn('[useHomeData Mobile] Could not load course status:', err);
    }
  }, [dispatch, subscription, subscriptionLoading]);

  // Listen for background generation completion via WebSocket
  useEffect(() => {
    const unsubscribe = subscribeToCourseReady((payload) => {
      console.log('🎉 [Mobile] Received course_ready socket event:', payload);
      setTimedOut(false);
      dispatch(loadCourseStatus());
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // Initial load when subscription becomes ready
  useEffect(() => {
    const hasSubscription =
      subscription?.active || subscription?.subscription?.is_free_trial;
    if (hasSubscription && !subscriptionLoading) {
      loadCourseData();
    }
  }, [subscription, subscriptionLoading, loadCourseData]);

  const retry = useCallback(async () => {
    setTimedOut(false);
    initAttemptedRef.current = false;
    await loadCourseData();
  }, [loadCourseData]);

  const isGenerating = courseStatus?.status === 'generating' || !courseStatus?.course;
  const finalError = error || (timedOut ? 'Course generation is taking longer than expected. Tap Retry to check again.' : null);
  const isLoading = !timedOut && (courseLoading || (subscriptionLoading && !courseStatus) || (isGenerating && !finalError));

  // Safety backstop: poll every 4s while generating in case the single WebSocket packet was dropped
  useEffect(() => {
    const hasSubscription =
      subscription?.active || subscription?.subscription?.is_free_trial;
    if (!isGenerating || finalError || !hasSubscription) return;

    let attempts = 0;
    const maxAttempts = 10; // 40s max before transitioning to retry UI
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setTimedOut(true);
        return;
      }
      try {
        const res = await dispatch(loadCourseStatus()).unwrap();
        if (res?.course) {
          clearInterval(interval);
          setTimedOut(false);
        }
      } catch (err) {
        // ignore
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isGenerating, finalError, subscription, dispatch]);

  return {
    courseStatus: courseStatus?.course ? courseStatus : null,
    isLoading,
    error: finalError,
    retry,
  };
}
