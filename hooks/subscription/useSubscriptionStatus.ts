/**
 * useSubscriptionStatus Hook
 * 
 * Loads and manages user's subscription status using Redux actions.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadSubscriptionStatus,
  selectCurrentSubscription,
  selectSubscriptionStatusLoading,
  selectSubscriptionStatusError,
  selectCanStartFreeTrial,
} from '@/store/slices/subscriptionSlice';

export interface UseSubscriptionStatusReturn {
  subscription: any | null;
  loading: boolean;
  error: string | null;
  canStartFreeTrial: boolean;
  refreshStatus: () => Promise<void>;
}

export function useSubscriptionStatus(autoFetch: boolean = true): UseSubscriptionStatusReturn {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(selectCurrentSubscription);
  const loading = useAppSelector(selectSubscriptionStatusLoading);
  const error = useAppSelector(selectSubscriptionStatusError);
  const canStartFreeTrial = useAppSelector(selectCanStartFreeTrial);

  const refreshStatus = useCallback(async () => {
    const result = await dispatch(loadSubscriptionStatus());
    if (loadSubscriptionStatus.rejected.match(result)) {
      // Failed to load subscription status
    }
  }, [dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && !subscription && !loading && !error) {
      refreshStatus();
    }
  }, [autoFetch, subscription, loading, error, refreshStatus]);

  return {
    subscription,
    loading,
    error,
    canStartFreeTrial,
    refreshStatus,
  };
}
