/**
 * useFreeTrial Hook
 * 
 * Handles free trial confirmation and activation.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  startFreeTrial,
  selectStartingTrial,
  selectSubscriptionError,
} from '@/store/slices/subscriptionSlice';

export interface UseFreeTrialReturn {
  startTrial: () => Promise<void>;
  starting: boolean;
  error: string | null;
}

export function useFreeTrial(): UseFreeTrialReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const starting = useAppSelector(selectStartingTrial);
  const error = useAppSelector(selectSubscriptionError);

  const startTrial = useCallback(async () => {
    const result = await dispatch(startFreeTrial());
    
    if (startFreeTrial.fulfilled.match(result)) {
      // Navigate to success page with trial end date
      const trialEndsAt = result.payload?.trialEndsAt;
      if (trialEndsAt) {
        router.push(`/free-trial-success?trialEndsAt=${encodeURIComponent(trialEndsAt)}`);
      } else {
        router.push('/free-trial-success');
      }
    } else {
      // Error is already set in Redux state
      // Failed to start free trial
    }
  }, [dispatch, router]);

  return {
    startTrial,
    starting,
    error,
  };
}
