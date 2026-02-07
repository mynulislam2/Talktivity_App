/**
 * Get Time Limits Based on Plan
 * 
 * Returns the time limit in seconds for practice and roleplay sessions
 * based on the user's subscription plan.
 */

import type { Subscription } from '@/store/slices/subscriptionSlice';

export interface TimeLimits {
  practice: number; // seconds
  roleplay: number; // seconds
  call: number; // seconds (lifetime limit)
}

/**
 * Get time limits based on subscription plan
 */
export function getTimeLimits(subscription: Subscription | null): TimeLimits {
  // Default limits (FreeTrial/Basic)
  const practiceLimit = 5 * 60; // 5 minutes = 300 seconds
  const callLimit = 5 * 60; // 5 minutes = 300 seconds (lifetime)
  
  let roleplayLimit = 5 * 60; // 5 minutes = 300 seconds (Basic/FreeTrial)
  
  // Pro plan gets more roleplay time
  if (subscription?.subscription?.plan_type === 'Pro') {
    roleplayLimit = 55 * 60; // 55 minutes = 3300 seconds
  }
  
  return {
    practice: practiceLimit,
    roleplay: roleplayLimit,
    call: callLimit,
  };
}
