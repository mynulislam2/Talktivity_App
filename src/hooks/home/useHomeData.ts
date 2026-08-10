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

import React, { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentSubscription,
  selectSubscriptionStatusLoading,
} from '@/store/slices/subscriptionSlice';
import {
  loadCourseStatus,
  initializeCourse,
  checkAndCreateNextBatch,
  selectCourseStatus,
  selectCourseLoading,
  selectCourseError,
} from '@/store/slices/courseSlice';
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
  // Get course status from Redux
  const courseStatus = useAppSelector(selectCourseStatus);
  const courseLoading = useAppSelector(selectCourseLoading);
  const error = useAppSelector(selectCourseError);

  // Calculate isLoading:
  // - Show loading only if we're actively loading AND don't have course status yet
  // - Once we have courseStatus, don't show loading even if there's a background refresh
  // - Also check if we're waiting for subscription to be ready
  // - Add timeout: if loading for more than 30 seconds, stop showing loading
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  useEffect(() => {
    if (courseLoading && !courseStatus) {
      const timer = setTimeout(() => {
        console.warn(
          'Ã¢Å¡Â Ã¯Â¸Â Course loading timeout - stopping loading indicator'
        );
        setLoadingTimeout(true);
      }, 30000); // 30 seconds timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [courseLoading, courseStatus]);

  const isLoading =
    ((courseLoading && !courseStatus) || subscriptionLoading) &&
    !loadingTimeout;

  // Track if batch check has been done to avoid multiple calls
  const batchCheckDoneRef = useRef(false);
  const initializationAttemptedRef = useRef(false);

  // Track latest courseStatus in a ref to avoid stale closures
  const courseStatusRef = useRef<CourseStatus | null>(courseStatus);
  useEffect(() => {
    courseStatusRef.current = courseStatus;
  }, [courseStatus]);

  // Load course data
  const loadCourseData = useCallback(async () => {
    console.log('Ã°Å¸â€Â loadCourseData called', {
      subscriptionLoading,
      hasSubscription:
        subscription?.active || subscription?.subscription?.is_free_trial,
      currentCourseStatus: !!courseStatusRef.current,
      initializationAttempted: initializationAttemptedRef.current,
    });

    // Don't do anything while subscription status is still loading
    if (subscriptionLoading) {
      console.log(
        'Ã¢ÂÂ¸Ã¯Â¸Â Subscription still loading, skipping course load'
      );
      return;
    }

    // Guard: subscription must be available
    const subscriptionActive = subscription?.active || false;
    const isFreeTrial = subscription?.subscription?.is_free_trial || false;
    const hasSubscription = subscriptionActive || isFreeTrial;

    if (!hasSubscription) {
      console.log('Ã¢ÂÂ¸Ã¯Â¸Â No subscription available, skipping course load');
      return;
    }

    // Get current course status from ref (not from closure)
    const currentCourseStatus = courseStatusRef.current;

    // One-shot: if we already tried once and still have no course, stop spamming get-active.
    // User can trigger retry() manually (or a later navigation/remount will retry).
    if (!currentCourseStatus && initializationAttemptedRef.current) {
      console.log(
        'Ã¢ÂÂ¸Ã¯Â¸Â Course initialization already attempted, skipping...'
      );
      return;
    }

    // Check if course exists, initialize if missing (first attempt only)
    if (!currentCourseStatus && !initializationAttemptedRef.current) {
      initializationAttemptedRef.current = true;
      console.log('Ã°Å¸â€â€ž Starting course initialization check...');
      console.log('Ã°Å¸â€œÂ¡ About to call loadCourseStatus API...');
      try {
        // Try to load course status first
        const result = await dispatch(loadCourseStatus()).unwrap();
        console.log(
          'Ã°Å¸â€œÅ  loadCourseStatus result:',
          result ? 'Course found' : 'No course'
        );

        if (!result) {
          // No course found (NO_ACTIVE_COURSE), initialize one
          console.log('Ã°Å¸â€â€ž No active course found, initializing...');
          console.log('Ã°Å¸â€œÂ¡ About to call initializeCourse API...');
          const initResult = await dispatch(initializeCourse()).unwrap();
          if (initResult) {
            console.log('Ã¢Å“â€¦ Course initialized successfully');
          } else {
            console.warn(
              'Ã¢Å¡Â Ã¯Â¸Â Course initialization returned no result'
            );
          }
        } else {
          console.log('Ã¢Å“â€¦ Course status loaded');
        }
      } catch (error: any) {
        // Handle rate limiting (429) gracefully
        if (
          error?.status === 429 ||
          error?.message?.includes('429') ||
          error?.message?.includes('rate limit')
        ) {
          console.warn(
            'Ã¢Å¡Â Ã¯Â¸Â Rate limited (429) - course load skipped, will retry after delay'
          );
          // Reset flags after a delay to allow retry
          setTimeout(() => {
            initializationAttemptedRef.current = false;
            hasAttemptedLoadRef.current = false;
          }, 60000); // Wait 60 seconds before allowing retry
        } else {
          console.error('Ã¢ÂÅ’ Error loading/initializing course:', error);
          console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            code: error?.code,
          });
          // Reset flag on error to allow retry
          initializationAttemptedRef.current = false;
          // Also reset hasAttemptedLoadRef to allow retry from the effect
          hasAttemptedLoadRef.current = false;
        }
      }
    } else if (currentCourseStatus) {
      // Course already exists, just log
      console.log('Ã¢Å“â€¦ Course status already available');
    }
  }, [dispatch, subscription, subscriptionLoading]);

  // Track course progression to reset batch check when course advances
  const lastCheckedDayRef = useRef<number | null>(null);
  const lastCheckedWeekRef = useRef<number | null>(null);
  const isCheckingBatchRef = useRef(false);
  const hasInitialBatchCheckRef = useRef(false);
  const courseStatusIdRef = useRef<number | null>(null);

  // Check batch progression ONCE when course status is first loaded
  // This matches Next.js behavior - checks for next batch after course status is loaded
  useEffect(() => {
    // Get current course ID
    const currentCourseId = courseStatus?.course?.id;

    // If no course status, skip
    if (!courseStatus || !currentCourseId) {
      return;
    }

    // If course ID changed, reset flags (new course loaded)
    if (currentCourseId !== courseStatusIdRef.current) {
      batchCheckDoneRef.current = false;
      hasInitialBatchCheckRef.current = false;
      courseStatusIdRef.current = currentCourseId;
      lastCheckedDayRef.current = null;
      lastCheckedWeekRef.current = null;
    }

    const checkBatchProgression = async () => {
      // Prevent multiple simultaneous batch checks
      if (isCheckingBatchRef.current || batchCheckDoneRef.current) {
        return;
      }

      // Reset batch check if course has progressed since last check
      const currentDay = courseStatus?.course?.currentDay;
      const currentWeek = courseStatus?.course?.currentWeek;

      // Only reset if day/week actually changed (not on every render)
      if (currentDay !== undefined && currentWeek !== undefined) {
        if (
          currentDay !== lastCheckedDayRef.current ||
          currentWeek !== lastCheckedWeekRef.current
        ) {
          // Course progressed - allow re-check
          batchCheckDoneRef.current = false;
          hasInitialBatchCheckRef.current = false;
          lastCheckedDayRef.current = currentDay;
          lastCheckedWeekRef.current = currentWeek;
        }
      }

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
          isCheckingBatchRef.current = true;
          hasInitialBatchCheckRef.current = true;
          console.log('Ã°Å¸â€â€ž Checking batch progression...');
          // Check and create next batch (this also reloads course status)
          await dispatch(checkAndCreateNextBatch()).unwrap();
          batchCheckDoneRef.current = true;
          isCheckingBatchRef.current = false;
          console.log('Ã¢Å“â€¦ Batch check completed');
        }
      } catch (error: any) {
        // Error checking batch progression
        // Handle rate limiting (429) - wait before retrying
        if (error?.status === 429 || error?.message?.includes('429')) {
          console.warn(
            'Ã¢Å¡Â Ã¯Â¸Â Rate limited (429) - batch check skipped, will retry later'
          );
          // Mark as done to prevent immediate retry, but allow retry after delay
          batchCheckDoneRef.current = true;
          isCheckingBatchRef.current = false;
          // Reset after 60 seconds to allow retry
          setTimeout(() => {
            batchCheckDoneRef.current = false;
            hasInitialBatchCheckRef.current = false;
          }, 60000);
        } else {
          // Don't set error state - batch check is non-critical
          console.warn('Ã¢Å¡Â Ã¯Â¸Â Batch check error (non-critical):', error);
          batchCheckDoneRef.current = true; // Mark as done even on error to avoid retries
          isCheckingBatchRef.current = false;
        }
      }
    };

    // Only run if we have subscription and course status, and haven't checked yet
    // CRITICAL: Only run when course ID is NEW (different from ref), not on every courseStatus update
    const isNewCourse = currentCourseId !== courseStatusIdRef.current;
    if (
      subscription &&
      courseStatus &&
      isNewCourse &&
      !isCheckingBatchRef.current &&
      !hasInitialBatchCheckRef.current
    ) {
      checkBatchProgression();
    }
  }, [dispatch, subscription, courseStatus?.course?.id]);

  // Track if we've already attempted to load course data for this subscription
  const hasAttemptedLoadRef = useRef(false);
  const lastSubscriptionIdRef = useRef<number | string | null>(null);
  const lastSubscriptionActiveRef = useRef<boolean | null>(null);

  // Load course data when subscription is available
  // This effect runs when subscription becomes available
  // IMPORTANT: Do NOT include loadCourseData in dependencies to prevent infinite loops
  useEffect(() => {
    // Don't do anything while subscription is loading
    if (subscriptionLoading) {
      return;
    }

    // Get the actual subscription ID and active status (not the object reference)
    const subscriptionId = subscription?.subscription?.id || null;
    const subscriptionActive = subscription?.active || false;
    const isFreeTrial = subscription?.subscription?.is_free_trial || false;
    const hasValidSubscription = subscriptionActive || isFreeTrial;

    // CRITICAL: If subscription is not valid, don't do anything
    // This prevents infinite loops when subscription object exists but is not active
    if (!hasValidSubscription) {
      // Only reset flags if we had a subscription before (logout case)
      if (lastSubscriptionIdRef.current !== null) {
        hasAttemptedLoadRef.current = false;
        initializationAttemptedRef.current = false;
        lastSubscriptionIdRef.current = null;
        lastSubscriptionActiveRef.current = null;
      }
      return;
    }

    // If subscription ID changed (different subscription), reset the flag
    if (subscriptionId && subscriptionId !== lastSubscriptionIdRef.current) {
      console.log('Ã°Å¸â€â€ž Subscription ID changed, resetting load flags');
      hasAttemptedLoadRef.current = false;
      initializationAttemptedRef.current = false;
      lastSubscriptionIdRef.current = subscriptionId;
      lastSubscriptionActiveRef.current = hasValidSubscription;
    }

    // If subscription active status changed, reset the flag
    if (
      hasValidSubscription !== lastSubscriptionActiveRef.current &&
      subscriptionId
    ) {
      console.log(
        'Ã°Å¸â€â€ž Subscription status changed, resetting load flags'
      );
      hasAttemptedLoadRef.current = false;
      initializationAttemptedRef.current = false;
      lastSubscriptionActiveRef.current = hasValidSubscription;
    }

    // Only run once when subscription becomes available AND is valid
    if (hasValidSubscription && !hasAttemptedLoadRef.current) {
      hasAttemptedLoadRef.current = true;
      if (subscriptionId) {
        lastSubscriptionIdRef.current = subscriptionId;
      }
      lastSubscriptionActiveRef.current = hasValidSubscription;
      console.log(
        'Ã°Å¸â€â€ž Subscription available, triggering course load...'
      );
      // Call loadCourseData but don't include it in dependencies
      // The function is stable enough and we have guards inside it
      loadCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    subscription?.subscription?.id,
    subscription?.active,
    subscription?.subscription?.is_free_trial,
    subscriptionLoading,
  ]);

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
