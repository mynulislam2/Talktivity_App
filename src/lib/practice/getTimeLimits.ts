import type { SubscriptionStatus } from '@/services/subscription';

export interface TimeLimits {
  practice: number;
  roleplay: number;
  call: number;
}

export function getTimeLimits(
  subscription: SubscriptionStatus | null
): TimeLimits {
  const practiceLimit = 5 * 60;
  const callLimit = 1 * 60;

  let roleplayLimit = 5 * 60;
  let effectivePracticeLimit = practiceLimit;
  const planType = subscription?.subscription?.plan_type;

  if (planType === 'Pro' || planType?.startsWith('International_')) {
    roleplayLimit = 10 * 60;
    effectivePracticeLimit = 10 * 60;
  }

  return {
    practice: effectivePracticeLimit,
    roleplay: roleplayLimit,
    call: callLimit,
  };
}
