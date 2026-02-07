/**
 * useReportCompletion Hook
 * 
 * Handles report completion and navigation.
 * Updates lifecycle/progress and navigates based on subscription status.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadLifecycle, updateLifecycle } from '@/store/slices/lifecycleSlice';
import { loadSubscriptionStatus, selectCurrentSubscription } from '@/store/slices/subscriptionSlice';

export interface UseReportCompletionReturn {
  completeReport: () => Promise<void>;
  isCompleting: boolean;
}

export function useReportCompletion(): UseReportCompletionReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentSubscription = useAppSelector(selectCurrentSubscription);
  const [isCompleting, setIsCompleting] = useState(false);

  const completeReport = useCallback(async () => {
    setIsCompleting(true);
    try {
      // Update lifecycle: mark report as completed
      const updateResult = await dispatch(updateLifecycle({ report_completed: true }));
      
      if (updateLifecycle.rejected.match(updateResult)) {
        // Failed to update report_completed
        // Continue with navigation even if update fails
      }

      // Load subscription status to check if user has active subscription
      const subscriptionResult = await dispatch(loadSubscriptionStatus());
      
      // Check if subscription loaded successfully
      if (loadSubscriptionStatus.fulfilled.match(subscriptionResult)) {
        const subscription = subscriptionResult.payload;
        const hasActiveSubscription = subscription?.active || false;
        const hasActiveTrial = subscription?.subscription?.is_free_trial || false;
        const hasAccess = hasActiveSubscription || hasActiveTrial;

        // Navigate based on subscription status
        if (hasAccess) {
          router.push('/home');
        } else {
          router.push('/upgrade');
        }
      } else {
        // If subscription load failed, navigate to upgrade as fallback
        router.push('/upgrade');
      }
    } catch (error) {
      // Error completing report
      // On error, navigate to upgrade page as fallback
      router.push('/upgrade');
    } finally {
      setIsCompleting(false);
    }
  }, [dispatch, router]);

  return {
    completeReport,
    isCompleting,
  };
}
