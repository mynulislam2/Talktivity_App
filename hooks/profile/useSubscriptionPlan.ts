/**
 * useSubscriptionPlan Hook
 * 
 * Selects subscription plan type from Redux subscription slice.
 */

import { useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';

export interface UseSubscriptionPlanReturn {
  planType: string;
}

export function useSubscriptionPlan(): UseSubscriptionPlanReturn {
  const subscription = useAppSelector(selectCurrentSubscription);

  const planType = subscription?.subscription?.plan_type || subscription?.plan?.plan_type || 'Free';

  return {
    planType,
  };
}
