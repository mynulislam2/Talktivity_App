/**
 * useReportCompletion Hook
 * 
 * Handles report completion and navigation.
 * Updates lifecycle/progress and navigates based on subscription status.
 */

import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadLifecycle, updateLifecycle } from '@/store/slices/lifecycleSlice';
import { loadSubscriptionStatus, selectCurrentSubscription } from '@/store/slices/subscriptionSlice';

export interface UseReportCompletionReturn {
  completeReport: () => Promise<void>;
  isCompleting: boolean;
}

export function useReportCompletion(): UseReportCompletionReturn {
  const navigation = useNavigation();
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

      // Always navigate to upgrade page in Auth stack after completing report
      // SubscriptionScreen will check subscription status and navigate to home if active
      console.log('[useReportCompletion] Navigating to SubscriptionScreen after report completion');
      
      // Get navigation state to determine which stack we're in
      const state = navigation.getState();
      console.log('[useReportCompletion] Current navigation state:', {
        currentRoute: state?.routes[state.index]?.name,
        allRoutes: state?.routes?.map((r: any) => r.name),
      });
      
      // Check if we're in Auth stack
      const rootState = navigation.getParent()?.getState();
      const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
      console.log('[useReportCompletion] Is in Auth stack:', isInAuthStack);
      
      if (isInAuthStack) {
        // We're in Auth stack - navigate directly to SubscriptionScreen
        console.log('[useReportCompletion] Navigating to SubscriptionScreen in Auth stack');
        try {
          (navigation as any).navigate('SubscriptionScreen');
        } catch (navError) {
          console.error('[useReportCompletion] Direct navigation failed, using reset:', navError);
          // Fallback: use reset to ensure navigation
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'SubscriptionScreen' as any },
              ],
            })
          );
        }
      } else {
        // We're in Main stack - need to switch to Auth stack first
        console.log('[useReportCompletion] Switching to Auth stack and navigating to SubscriptionScreen');
        const rootNavigation = navigation.getParent()?.getParent();
        if (rootNavigation) {
          rootNavigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Auth',
                  params: {
                    screen: 'SubscriptionScreen',
                  },
                },
              ],
            })
          );
        } else {
          console.error('[useReportCompletion] Could not find root navigation');
          // Fallback: try direct navigation
          (navigation as any).navigate('SubscriptionScreen');
        }
      }
    } catch (error) {
      // Error completing report
      console.error('[useReportCompletion] Error completing report:', error);
      // On error, navigate to upgrade page in Auth stack as fallback
      console.log('[useReportCompletion] Fallback: Navigating to SubscriptionScreen');
      const rootNavigation = navigation.getParent()?.getParent();
      if (rootNavigation) {
        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Auth',
                params: {
                  screen: 'SubscriptionScreen',
                },
              },
            ],
          })
        );
      } else {
        (navigation as any).navigate('SubscriptionScreen');
      }
    } finally {
      setIsCompleting(false);
    }
  }, [dispatch, navigation]);

  return {
    completeReport,
    isCompleting,
  };
}
