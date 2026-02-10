/**
 * RouteGuard Component (React Native)
 * 
 * Component-level route protection matching Next.js RouteGuard.
 * Wraps screens to enforce authentication, onboarding, and subscription requirements.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions, NavigationContainerRef } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectLifecycleData, selectLifecycleLoading } from '@/store/slices/lifecycleSlice';
import { selectCurrentSubscription, selectSubscriptionStatusLoading } from '@/store/slices/subscriptionSlice';
import { authService } from '@/service/AuthService';
import { clearAuth } from '@/store/slices/authSlice';

export interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  requireConversationExperience?: boolean;
  requireSubscription?: boolean;
  requireFeature?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireOnboarding = true,
  requireConversationExperience = false,
  requireSubscription = false,
  requireFeature,
}: RouteGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const hasDispatchedLogoutRef = useRef(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Get data directly from Redux
  const currentSubscription = useAppSelector(selectCurrentSubscription);
  const subscriptionLoading = useAppSelector(selectSubscriptionStatusLoading);
  const lifecycle = useAppSelector(selectLifecycleData);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);

  // Compute hasActiveSubscription directly from Redux state
  const hasActiveSubscription = currentSubscription?.active || false;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Check if authentication is required
        if (requireAuth) {
          const isAuthenticated = authService.isAuthenticated();

          if (!isAuthenticated) {
            setAuthorized(false);
            setLoading(false);
            // Instead of trying to navigate from nested navigator, clear auth state
            // This will update Redux state, causing RootNavigator to switch to Auth
            if (!hasDispatchedLogoutRef.current) {
              hasDispatchedLogoutRef.current = true;
              dispatch(clearAuth());
            }
            return;
          }

          // Wait for lifecycle to load - CRITICAL: Don't check lifecycle properties if not loaded
          // But if it's been loading for too long, proceed anyway (data might be missing)
          if (lifecycleLoading) {
            // Still loading - wait a bit, but don't block forever
            // The component will re-render when lifecycle loads
            setLoading(false); // Allow children to render with their own loading states
            setAuthorized(true); // Temporarily authorize to show UI
            return;
          }

          if (!lifecycle) {
            // Lifecycle not loaded and not loading - might be missing
            // Allow access but let children handle their own loading states
            setLoading(false);
            setAuthorized(true);
            return;
          }

          // Check if onboarding is required
          if (requireOnboarding) {
            const hasOnboarding = lifecycle.onboarding?.completed || false;

            if (!hasOnboarding) {
              setAuthorized(false);
              // For onboarding, we need to switch to Auth stack
              // Clear auth state temporarily to switch to Auth stack
              // This will cause RootNavigator to switch to Auth stack
              // Then useGlobalRouteGuard will navigate to Onboarding
              if (!hasDispatchedLogoutRef.current) {
                hasDispatchedLogoutRef.current = true;
                // Don't fully logout - just clear auth flag temporarily
                // The user's token is still valid, we just need to switch stacks
                dispatch(clearAuth());
              }
              return;
            }
          }

          // Check if conversation experience is required
          if (requireConversationExperience) {
            const hasConversationExperience = lifecycle.milestones?.callCompleted || false;

            if (!hasConversationExperience) {
              setAuthorized(false);
              // Navigate to Call screen
              navigation.dispatch(
                CommonActions.navigate('Main' as any, {
                  screen: 'LearningStack',
                  params: {
                    screen: 'CallScreen',
                    params: { CallStart: true, autoStart: true },
                  },
                } as any)
              );
              return;
            }
          }

          // Check if subscription is required
          if (requireSubscription) {
            // If lifecycle is still loading, allow access temporarily
            // Children will handle their own loading states
            if (lifecycleLoading) {
              setLoading(false);
              setAuthorized(true); // Temporarily authorize
              return;
            }

            // If subscription is still loading, allow access temporarily
            if (subscriptionLoading) {
              setLoading(false);
              setAuthorized(true); // Temporarily authorize
              return;
            }

            // Now subscription should be loaded, check if it's active

            // Subscription checked, verify it's active
            if (!hasActiveSubscription) {
              setAuthorized(false);
              navigation.dispatch(
                CommonActions.navigate('Main' as any, {
                  screen: 'ProfileStack',
                  params: {
                    screen: 'SubscriptionScreen',
                  },
                } as any)
              );
              return;
            }
          }

          // Check if specific feature is required
          if (requireFeature) {
            // Feature access is tied to subscription status
            if (!hasActiveSubscription) {
              setAuthorized(false);
              navigation.dispatch(
                CommonActions.navigate('Main' as any, {
                  screen: 'ProfileStack',
                  params: {
                    screen: 'SubscriptionScreen',
                  },
                } as any)
              );
              return;
            }
          }
        }

        setAuthorized(true);
      } catch (error) {
        // RouteGuard check failed
        setAuthorized(false);
        // Clear auth state to switch to Auth stack
        if (!hasDispatchedLogoutRef.current) {
          hasDispatchedLogoutRef.current = true;
          dispatch(clearAuth());
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [
    requireAuth,
    requireOnboarding,
    requireConversationExperience,
    requireSubscription,
    requireFeature,
    lifecycle,
    lifecycleLoading,
    subscriptionLoading,
    hasActiveSubscription,
    // Removed navigation and dispatch - they're stable and cause re-runs
  ]);

  // Separate effect for subscription status changes - handles updates to subscription status
  useEffect(() => {
    // Only re-evaluate authorization if subscription status changes
    if (requireSubscription && !subscriptionLoading && currentSubscription) {
      if (!hasActiveSubscription) {
        setAuthorized(false);
        navigation.dispatch(
          CommonActions.navigate('Main' as any, {
            screen: 'ProfileStack',
            params: {
              screen: 'SubscriptionScreen',
            },
          } as any)
        );
      } else {
        // User has active subscription, allow access
        setAuthorized(true);
      }
    }
  }, [requireSubscription, subscriptionLoading, hasActiveSubscription, currentSubscription, navigation]);

  // Always render children - let them handle their own loading states
  // RouteGuard only blocks if explicitly unauthorized (not just loading)
  // This prevents the app from getting stuck in a loading state
  if (!authorized && !loading) {
    // Explicitly unauthorized (not just loading) - don't render
    return null;
  }

  // Render children (they'll show their own loading states if needed)
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
