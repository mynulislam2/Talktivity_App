import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { resetOnboarding } from '@/store/slices/onboardingSlice';
import { resetLifecycle } from '@/store/slices/lifecycleSlice';
import { clearCallState } from '@/store/slices/callSlice';
import { clearReport } from '@/store/slices/reportSlice';
import { resetSubscription } from '@/store/slices/subscriptionSlice';
import { resetPayment } from '@/store/slices/paymentSlice';
import { resetTodayReport } from '@/store/slices/todayReportSlice';
import { resetQuiz } from '@/store/slices/quizSlice';
import { resetChat } from '@/store/slices/chatSlice';
import { resetCommunity } from '@/store/slices/communitySlice';
import { resetCourse } from '@/store/slices/courseSlice';
import { resetProfile } from '@/store/slices/profileSlice';
import { resetProgressAnalytics } from '@/store/slices/progressAnalyticsSlice';
import { resetLeaderboard } from '@/store/slices/leaderboardSlice';
import { resetTopics } from '@/store/slices/topicsSlice';

// Guard against multiple simultaneous logouts
let isGlobalLogoutInProgress = false;

/**
 * Global client-side logout helper.
 *
 * - Dispatches Redux auth logout.
 * - Resets all Redux slices one by one.
 * - Clears all localStorage/sessionStorage keys.
 * - Optionally navigates to a target route (default: /login).
 */
export async function performGlobalLogout(
  navigate?: (path: string) => void,
  targetPath: string = '/login'
): Promise<void> {
  // Prevent multiple simultaneous logout calls
  if (isGlobalLogoutInProgress) {
    return; // Already logging out
  }

  isGlobalLogoutInProgress = true;

  try {
    // 1. Dispatch auth logout (handles auth slice reset)
    try {
      await store.dispatch(logoutUser()).unwrap();
    } catch (error) {
      // Continue with other resets even if auth logout fails
    }

    // 2. Reset all other Redux slices one by one
    const resetActions = [
      () => store.dispatch(resetOnboarding()),
      () => store.dispatch(resetLifecycle()),
      () => store.dispatch(clearCallState()),
      () => store.dispatch(clearReport()),
      () => store.dispatch(resetSubscription()),
      () => store.dispatch(resetPayment()),
      () => store.dispatch(resetTodayReport()),
      () => store.dispatch(resetQuiz()),
      () => store.dispatch(resetChat()),
      () => store.dispatch(resetCommunity()),
      () => store.dispatch(resetCourse()),
      () => store.dispatch(resetProfile()),
      () => store.dispatch(resetProgressAnalytics()),
      () => store.dispatch(resetLeaderboard()),
      () => store.dispatch(resetTopics()),
    ];

    // Execute all reset actions (continue even if one fails)
    resetActions.forEach((resetAction) => {
      try {
        resetAction();
      } catch (e) {
        // Log error but continue with other resets
      }
    });

    // 3. Clear all storage
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // Failed to clear AsyncStorage
    }

    // 4. Navigate
    if (navigate) {
      navigate(targetPath);
    }
  } finally {
    // Reset the logout flag so logout can be called again if needed
    isGlobalLogoutInProgress = false;
  }
}
