/**
 * Root Navigator
 * 
 * Main navigation entry point that determines whether to show:
 * - AuthNavigator (user not logged in)
 * - MainNavigator (user logged in)
 * 
 * Automatically restores user session from AsyncStorage on app startup
 */

import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { useAutoLogin } from '../hooks/useAutoLogin';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectLifecycleData, selectLifecycleLoading, loadLifecycle } from '../store/slices/lifecycleSlice';
import { selectCurrentSubscription, selectSubscriptionStatusLoading, loadSubscriptionStatus } from '../store/slices/subscriptionSlice';
import { getRedirectPath } from '../lib/routing/getRedirectPath';
import AuthNavigator from './AuthNavigator';
import MainNavigatorWrapper from './MainNavigatorWrapper';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading, isCheckingAuth } = useAutoLogin();
  const lifecycle = useAppSelector(selectLifecycleData);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);
  const subscription = useAppSelector(selectCurrentSubscription);
  const subscriptionLoading = useAppSelector(selectSubscriptionStatusLoading);
  const dispatch = useAppDispatch();

  // CRITICAL: If user is authenticated but lifecycle is not loaded, try to load it
  useEffect(() => {
    if (isAuthenticated && !lifecycle && !lifecycleLoading) {
      // Lifecycle not loaded - try to load it
      dispatch(loadLifecycle());
    }
  }, [isAuthenticated, lifecycle, lifecycleLoading, dispatch]);

  // CRITICAL: If user is authenticated and redirectPath is /upgrade, load subscription status
  // This ensures we have subscription data to determine if user should see Main stack
  useEffect(() => {
    if (isAuthenticated && lifecycle && !lifecycleLoading) {
      const redirectPath = getRedirectPath(lifecycle);
      if (redirectPath === '/upgrade' && !subscription && !subscriptionLoading) {
        // Load subscription status to check if user has active subscription
        console.log('[RootNavigator] Loading subscription status for /upgrade redirect...');
        dispatch(loadSubscriptionStatus());
      }
    }
  }, [isAuthenticated, lifecycle, lifecycleLoading, subscription, subscriptionLoading, dispatch]);

  // CRITICAL: If user is authenticated but still in onboarding flow (onboarding/call/report/upgrade),
  // keep them in Auth stack so they DON'T see bottom tabs until fully onboarded.
  const shouldShowMain = useMemo(() => {
    if (!isAuthenticated) {
      console.log('[RootNavigator:shouldShowMain] Not authenticated, showing Auth stack');
      return false;
    }
    
    // If lifecycle is loading, wait (stay in Auth stack)
    if (lifecycleLoading) {
      console.log('[RootNavigator:shouldShowMain] Lifecycle loading, waiting...');
      return false;
    }
    
    // CRITICAL: If lifecycle not loaded yet, wait a bit before switching to Main
    // This gives time for lifecycle to load after registration
    // For new registrations, lifecycle might not be loaded immediately
    if (!lifecycle) {
      console.log('[RootNavigator:shouldShowMain] Lifecycle not loaded, staying in Auth stack');
      return false; // Stay in Auth stack until lifecycle loads
    }
    
    // Check redirect path to determine if user is fully onboarded
    const redirectPath = getRedirectPath(lifecycle);
    console.log('[RootNavigator:shouldShowMain] Redirect path:', redirectPath);
    
    // If redirectPath is /upgrade, check if user has active subscription
    // If subscription is active, show Main stack (user has completed onboarding and subscribed)
    if (redirectPath === '/upgrade') {
      // If subscription is loading, wait for it to complete
      if (subscriptionLoading) {
        console.log('[RootNavigator:shouldShowMain] Subscription loading, waiting...');
        return false;
      }
      
      const hasActiveSubscription = subscription?.active || false;
      const hasActiveTrial = subscription?.subscription?.is_free_trial || false;
      const hasAccess = hasActiveSubscription || hasActiveTrial;
      
      console.log('[RootNavigator:shouldShowMain] Subscription check:', {
        hasSubscription: !!subscription,
        hasActiveSubscription,
        hasActiveTrial,
        hasAccess,
        subscriptionData: subscription ? {
          active: subscription.active,
          is_free_trial: subscription.subscription?.is_free_trial,
        } : null,
      });
      
      if (hasAccess) {
        // User has active subscription/trial - show Main stack with bottom tabs
        console.log('[RootNavigator:shouldShowMain] ✅ User has active subscription/trial, showing Main stack');
        return true;
      }
      
      // User needs to subscribe - stay in Auth stack (upgrade page)
      console.log('[RootNavigator:shouldShowMain] ❌ No active subscription, staying in Auth stack');
      return false;
    }
    
    // Only show Main stack when user is fully onboarded (/home)
    // All other states (onboarding, call, report) stay in Auth stack (no bottom tabs)
    if (redirectPath === '/home') {
      // User is fully onboarded - show Main stack with bottom tabs
      console.log('[RootNavigator:shouldShowMain] ✅ Redirect path is /home, showing Main stack');
      return true;
    }
    
    // Any other state (onboarding, call, report) stays in Auth stack
    console.log('[RootNavigator:shouldShowMain] ❌ Redirect path is', redirectPath, ', staying in Auth stack');
    return false;
  }, [isAuthenticated, lifecycle, lifecycleLoading, subscription, subscriptionLoading]);

  // Don't show loading screen - let auth check happen in background
  // This allows users to interact with the app immediately
  // If user is authenticated, we'll switch to Main automatically

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {shouldShowMain ? (
        // Authenticated user - show main app with route protection
        <Stack.Screen name="Main" component={MainNavigatorWrapper} />
      ) : (
        // Unauthenticated user OR user needs onboarding - show auth flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
