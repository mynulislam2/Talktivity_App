/**
 * useGlobalRouteGuard Hook (React Native)
 * 
 * Global route protection hook that handles navigation based on lifecycle state.
 * Should be used in RootNavigator or a top-level component.
 * Matches Next.js GlobalRouteGuard logic.
 */

import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import {
  selectLifecycleData,
  selectLifecycleLoading,
  loadLifecycle,
} from '@/store/slices/lifecycleSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';

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
        stack: 'Auth', 
        screen: 'CallScreen',
        params: callStart ? { CallStart: true } : undefined
      };
    case '/home':
      return { stack: 'Main', screen: 'Home' };
    case '/upgrade':
      return { 
        stack: 'Auth', 
        screen: 'SubscriptionScreen'
      };
    default:
      return { stack: 'Main' };
  }
}

export function useGlobalRouteGuard() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const lifecycle = useAppSelector(selectLifecycleData);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);
  const hasNavigatedRef = useRef(false);
  const lastRedirectPathRef = useRef<string | null>(null);
  const isNavigatingRef = useRef(false); // Prevent concurrent navigations
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup function to clear timeout
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // CRITICAL: Only run route guard for authenticated users
    // If user is not authenticated, they should be in Auth stack already
    if (!isAuthenticated) {
      hasNavigatedRef.current = false; // Reset when not authenticated
      lastRedirectPathRef.current = null;
      isNavigatingRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      return;
    }

    // CRITICAL: Don't do anything if lifecycle is still loading
    if (lifecycleLoading) {
      return;
    }

    // CRITICAL: Don't redirect if lifecycle is not loaded yet
    if (!lifecycle) {
      // Try to load lifecycle if not loaded (only once)
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true; // Mark as attempting to load
        dispatch(loadLifecycle());
      }
      return;
    }

    // CRITICAL: Prevent concurrent navigation attempts
    if (isNavigatingRef.current) {
      return;
    }

    // Calculate redirectPath using shared utility
    const redirectPath = getRedirectPath(lifecycle);
    console.log('[useGlobalRouteGuard] redirectPath:', redirectPath);
    
    // Don't redirect if redirectPath is null
    if (!redirectPath) {
      hasNavigatedRef.current = true;
      return;
    }

    // Don't navigate if we've already navigated to this path
    if (lastRedirectPathRef.current === redirectPath && hasNavigatedRef.current) {
      return;
    }

    // Calculate screen config first
    const screenConfig = mapRouteToScreen(redirectPath);
    console.log('[useGlobalRouteGuard] screenConfig:', screenConfig);

    // Get current navigation state to check if we're already on the target screen
    const state = navigation.getState();
    if (!state) {
      console.log('[useGlobalRouteGuard] No navigation state available');
      return;
    }

    // Check if we're already on the target screen to avoid unnecessary navigation
    const currentRoute = state.routes[state.index];
    console.log('[useGlobalRouteGuard] Current route:', currentRoute?.name);
    
    // For upgrade page, check if we're already on SubscriptionScreen in Auth stack
    if (redirectPath === '/upgrade') {
      if (currentRoute?.name === 'Auth') {
        const authState = (currentRoute as any).state;
        if (authState && authState.routes && authState.index !== undefined) {
          const activeAuthScreen = authState.routes[authState.index];
          console.log('[useGlobalRouteGuard] Active auth screen:', activeAuthScreen?.name);
          if (activeAuthScreen?.name === 'SubscriptionScreen') {
            // Already on upgrade page in Auth stack, allow it - SubscriptionScreen will check subscription and navigate
            console.log('[useGlobalRouteGuard] Already on SubscriptionScreen (Auth), skipping navigation');
            hasNavigatedRef.current = true;
            lastRedirectPathRef.current = redirectPath;
            return;
          }
        }
      }
      // If we're not on upgrade page, continue to navigate
      console.log('[useGlobalRouteGuard] Not on upgrade page, will navigate to SubscriptionScreen (Auth)');
    }
    
    // For Home screen, check if we're already on Home tab
    if (screenConfig.stack === 'Main' && screenConfig.screen === 'Home') {
      if (currentRoute?.name === 'Main') {
        // Main is a Tab Navigator, check which tab is active
        const mainState = (currentRoute as any).state;
        if (mainState && mainState.routes && mainState.index !== undefined) {
          const activeTab = mainState.routes[mainState.index];
          if (activeTab?.name === 'Home') {
            // Already on Home tab, just mark as navigated
            hasNavigatedRef.current = true;
            lastRedirectPathRef.current = redirectPath;
            return;
          }
        }
      }
    } else if (currentRoute?.name === 'Main' && screenConfig.stack === 'Main') {
      // Check nested routes for other screens (e.g., LearningStack → CallScreen, ProfileStack → SubscriptionScreen)
      const mainState = (currentRoute as any).state;
      if (mainState && mainState.routes && mainState.index !== undefined) {
        const activeTab = mainState.routes[mainState.index];
        // If target is a stack screen (like LearningStack or ProfileStack), check nested state
        if (screenConfig.screen && activeTab?.name === screenConfig.screen) {
          // If there are nested params, check them too
          if (screenConfig.params && screenConfig.params.screen) {
            const tabState = (activeTab as any).state;
            if (tabState && tabState.routes && tabState.index !== undefined) {
              const nestedRoute = tabState.routes[tabState.index];
              const nestedParams = screenConfig.params.screen;
              console.log('[useGlobalRouteGuard] Checking nested route:', nestedRoute?.name, 'vs', nestedParams);
              if (nestedParams && nestedRoute?.name === nestedParams) {
                // Already on target nested screen
                console.log('[useGlobalRouteGuard] Already on target nested screen, skipping navigation');
                hasNavigatedRef.current = true;
                lastRedirectPathRef.current = redirectPath;
                return;
              }
            }
          } else {
            // Already on target screen (no nested params)
            console.log('[useGlobalRouteGuard] Already on target screen, skipping navigation');
            hasNavigatedRef.current = true;
            lastRedirectPathRef.current = redirectPath;
            return;
          }
        }
      }
    }

    // Mark that we're about to navigate BEFORE dispatching
    hasNavigatedRef.current = true;
    lastRedirectPathRef.current = redirectPath;
    isNavigatingRef.current = true; // Set flag to prevent concurrent navigations
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Use setTimeout to allow navigation to complete before allowing next check
    navigationTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
      navigationTimeoutRef.current = null;
    }, 500); // Increased timeout to allow navigation to complete
    
    // Navigate to the appropriate screen based on lifecycle state
    if (screenConfig.stack === 'Auth') {
      // User is authenticated but needs onboarding or upgrade
      // We need to navigate to Auth stack
      // Get root navigator to switch stacks
      const rootNavigation = navigation.getParent()?.getParent();
      if (rootNavigation) {
        if (screenConfig.screen === 'SubscriptionScreen') {
          // Navigate to SubscriptionScreen in Auth stack
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
          // Navigate to Onboarding or other Auth screens
          rootNavigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Auth',
                  params: {
                    screen: screenConfig.screen || 'Onboarding',
                  },
                },
              ],
            })
          );
        }
      }
      return;
    } else if (screenConfig.stack === 'Main') {
      if (screenConfig.screen === 'Home') {
        // Reset to Home tab
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
        // Navigate to nested stack (e.g., LearningStack → CallScreen, ProfileStack → SubscriptionScreen)
        console.log('[useGlobalRouteGuard] Navigating to:', screenConfig.screen, 'with params:', screenConfig.params);
        
        // Since we're in MainNavigatorWrapper (Tab Navigator), navigate directly to the tab with nested params
        // The navigation object here is the Tab Navigator, so we can navigate to tabs directly
        (navigation as any).navigate(screenConfig.screen, screenConfig.params || {});
        console.log('[useGlobalRouteGuard] Navigation dispatched to tab:', screenConfig.screen);
      }
    }
  }, [isAuthenticated, lifecycle, lifecycleLoading, dispatch]); // Removed navigation from deps - use ref if needed
}
