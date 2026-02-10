/**
 * useRouteProtection Hook (React Native)
 * 
 * Handles route protection and redirects based on lifecycle state.
 * Matches Next.js RouteGuard logic.
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectLifecycleData,
  selectLifecycleLoading,
} from '@/store/slices/lifecycleSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';
import { loadLifecycle } from '@/store/slices/lifecycleSlice';

/**
 * Map Next.js route to React Navigation screen
 */
function mapRouteToScreen(route: string): { stack: string; screen?: string; params?: any } {
  const routeBase = route.split('?')[0];
  const params = new URLSearchParams(route.split('?')[1] || '');
  
  switch (routeBase) {
    case '/onboarding':
      return { stack: 'Auth', screen: 'Onboarding' };
    case '/call':
      const callStart = params.get('CallStart') === 'true';
      return { 
        stack: 'Main', 
        screen: 'LearningStack',
        params: { screen: 'CallScreen', params: callStart ? { autoStart: true } : {} }
      };
    case '/home':
      return { stack: 'Main', screen: 'Home' };
    case '/upgrade':
      return { 
        stack: 'Main', 
        screen: 'ProfileStack',
        params: { screen: 'SubscriptionScreen' }
      };
    default:
      return { stack: 'Main' };
  }
}

export interface UseRouteProtectionOptions {
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  requireConversationExperience?: boolean;
  requireSubscription?: boolean;
  enabled?: boolean;
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const {
    requireAuth = true,
    requireOnboarding = true,
    requireConversationExperience = false,
    requireSubscription = false,
    enabled = true,
  } = options;

  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const lifecycle = useAppSelector(selectLifecycleData);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);

  useEffect(() => {
    if (!enabled) return;

    // CRITICAL: Don't do anything if lifecycle is still loading
    if (lifecycleLoading) {
      return;
    }

    // CRITICAL: Don't redirect if lifecycle is not loaded yet
    if (!lifecycle) {
      // Try to load lifecycle if not loaded
      dispatch(loadLifecycle());
      return;
    }

    // Calculate redirectPath using shared utility
    const redirectPath = getRedirectPath(lifecycle);
    
    // Don't redirect if redirectPath is null (shouldn't happen now, but safety check)
    if (!redirectPath) {
      return;
    }

    // Calculate allowed paths based on redirect path
    const allowedPaths = (() => {
      const paths: string[] = [];
      if (redirectPath === '/onboarding') {
        paths.push('/onboarding');
      } else if (redirectPath === '/call?CallStart=true') {
        paths.push('/call');
      } else if (redirectPath === '/call') {
        // Report not completed yet: keep user on /call.
        // Allow /report only when they intentionally open it via the button.
        paths.push('/call', '/report');
      } else if (redirectPath === '/upgrade') {
        paths.push('/upgrade', '/checkout', '/payment-success', '/report', '/free-trial', '/free-trial-success');
      } else if (redirectPath === '/home') {
        // All complete - allow access to all protected routes
        return null; // null means all routes are allowed
      }
      return paths;
    })();

    // Check if current path is allowed
    if (allowedPaths === null) {
      // All routes allowed (user completed all steps)
      return;
    }

    // For React Native, we need to check the current route differently
    // Since we're using navigation state, we'll navigate based on redirectPath
    const screenConfig = mapRouteToScreen(redirectPath);
    
    // Navigate to the appropriate screen
    if (screenConfig.stack === 'Auth') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Auth', params: screenConfig.screen ? { screen: screenConfig.screen } : {} },
          ],
        })
      );
    } else if (screenConfig.stack === 'Main') {
      if (screenConfig.screen === 'Home') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { 
                name: 'Main', 
                params: { 
                  screen: 'Home' 
                } 
              },
            ],
          })
        );
      } else {
        // Navigate to nested stack (e.g., LearningStack → CallScreen)
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Main',
            params: {
              screen: screenConfig.screen,
              ...(screenConfig.params ? { params: screenConfig.params } : {}),
            },
          } as any)
        );
      }
    }
  }, [lifecycle, lifecycleLoading, enabled, navigation, dispatch]);
}
