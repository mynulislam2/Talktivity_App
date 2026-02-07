/**
 * useSubscriptionPlans Hook
 * 
 * Loads and manages subscription plans using Redux actions.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadPlans,
  selectPlans,
  selectSubscriptionLoading,
  selectSubscriptionError,
} from '@/store/slices/subscriptionSlice';

export interface UseSubscriptionPlansReturn {
  plans: any[];
  loading: boolean;
  error: string | null;
  refreshPlans: () => Promise<void>;
}

export function useSubscriptionPlans(autoFetch: boolean = true): UseSubscriptionPlansReturn {
  const dispatch = useAppDispatch();
  const plans = useAppSelector(selectPlans);
  const loading = useAppSelector(selectSubscriptionLoading);
  const error = useAppSelector(selectSubscriptionError);

  const refreshPlans = useCallback(async () => {
    const result = await dispatch(loadPlans());
    if (loadPlans.rejected.match(result)) {
      // Failed to load plans
    }
  }, [dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && plans.length === 0 && !loading && !error) {
      refreshPlans();
    }
  }, [autoFetch, plans.length, loading, error, refreshPlans]);

  return {
    plans,
    loading,
    error,
    refreshPlans,
  };
}
