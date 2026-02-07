/**
 * useSubscriptionAccess Hook
 * 
 * Provides subscription access information using Redux selectors.
 * Eliminates duplicate API calls by using Redux as single source of truth.
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentSubscription,
  selectSubscriptionStatusLoading,
  loadSubscriptionStatus,
} from '@/store/slices/subscriptionSlice';

interface UsageLimits {
  dailyTalkTime: number;
  scenarios: number;
  analytics: boolean;
}

interface FeatureAccess {
  hasAccess: boolean;
  limit: number;
  remaining: number;
}

export const useSubscriptionAccess = () => {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(selectCurrentSubscription);
  const isLoading = useAppSelector(selectSubscriptionStatusLoading);

  // Load subscription status if not available
  useEffect(() => {
    if (!subscription && !isLoading) {
      dispatch(loadSubscriptionStatus());
    }
  }, [dispatch, subscription, isLoading]);

  // Compute derived values from Redux state
  const hasActiveSubscription = useMemo(() => {
    return subscription?.active || false;
  }, [subscription]);

  const usageLimits = useMemo<UsageLimits>(() => {
    if (!subscription?.subscription) {
      return {
        dailyTalkTime: 0,
        scenarios: 0,
        analytics: false,
      };
    }

    return {
      dailyTalkTime: subscription.subscription.talk_time_minutes || 0,
      scenarios: 0, // Will be set from plan features if needed
      analytics: subscription.subscription.plan_type === 'Pro',
    };
  }, [subscription]);

  // Check feature access (synchronous, uses Redux state)
  const checkFeatureAccess = useCallback((feature: string): boolean => {
    return hasActiveSubscription;
  }, [hasActiveSubscription]);

  // Check usage limit (synchronous, uses Redux state)
  const checkUsageLimit = useCallback(
    (feature: string, currentUsage: number): FeatureAccess => {
      return {
        hasAccess: hasActiveSubscription,
        limit: 0,
        remaining: 0,
      };
    },
    [hasActiveSubscription]
  );

  // Refresh subscription status
  const refreshSubscription = useCallback(async (): Promise<boolean> => {
    try {
      await dispatch(loadSubscriptionStatus()).unwrap();
      return true;
    } catch (error) {
      // Error refreshing subscription
      return false;
    }
  }, [dispatch]);

  // Alias for backward compatibility
  const checkSubscriptionStatus = useCallback(async () => {
    await refreshSubscription();
  }, [refreshSubscription]);

  return {
    isLoading,
    hasActiveSubscription,
    subscription: subscription?.subscription || null,
    usageLimits,
    checkFeatureAccess,
    checkUsageLimit,
    refreshSubscription,
    checkSubscriptionStatus,
  };
};
