/**
 * Routing Utility Function
 * 
 * Determines the correct redirect path based on lifecycle state.
 * Uses lifecycle API data to make routing decisions.
 * 
 * Priority order:
 * 1. Onboarding not completed → /onboarding
 * 2. Call not completed → /call?CallStart=true
 * 3. Report not completed → /call
 * 4. No subscription/trial active → /upgrade
 * 5. All complete → /home
 * 
 * IMPORTANT: This function does NOT require subscription data.
 * Subscription status check should be done in components that have access to subscriptionSlice.
 * This function only validates onboarding and milestone completion.
 */

import { LifecycleResponseData } from '@/types/onboarding/responses';

/**
 * Get redirect path based on lifecycle completion status
 * 
 * CRITICAL: This now returns '/upgrade' when ALL conditions are met but requires subscription check.
 * Components using this should ALSO check subscription status before allowing /home access.
 * 
 * @param lifecycle - Lifecycle response data from API, or null if not loaded
 * @returns Redirect path string, or null if lifecycle is not loaded yet
 */
export function getRedirectPath(lifecycle: LifecycleResponseData | null): string | null {
  // If lifecycle not loaded, return null (don't redirect yet)
  if (!lifecycle) {
    return null;
  }

  const onboardingCompleted = lifecycle?.onboarding?.completed || false;
  const callCompleted = lifecycle?.milestones?.callCompleted || false;
  const reportCompleted = lifecycle?.milestones?.reportCompleted || false;

  // Rule 1: Onboarding not completed
  if (!onboardingCompleted) {
    return '/onboarding';
  }

  // Rule 2: Call not completed
  if (!callCompleted) {
    return '/call?CallStart=true';
  }

  // Rule 3: Report not completed
  if (!reportCompleted) {
    return '/call';
  }

  // Rule 4: All milestones complete - redirect to home
  // NOTE: /home page itself has RouteGuard with requireSubscription=true
  // which will handle the actual subscription check and redirect to /upgrade if needed
  return '/home';
}
