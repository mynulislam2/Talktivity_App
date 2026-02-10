/**
 * Subscription Screen (React Native)
 * 
 * Upgrade page - displays subscription plans.
 * Matches Next.js /upgrade page implementation.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectLifecycleData, updateLifecycle, loadLifecycle } from '@/store/slices/lifecycleSlice';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';
import { useSubscriptionPlans } from '@/hooks/subscription/useSubscriptionPlans';
import { useSubscriptionStatus } from '@/hooks/subscription/useSubscriptionStatus';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { PlanComparison } from '@/components/subscription/PlanComparison';
import { SubscriptionPlan } from '@/service/SubscriptionService';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { RouteGuard } from '@/components/navigation/RouteGuard';
import type { ProfileScreenProps } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';

// Support both Auth stack and ProfileStack navigation
type SubscriptionScreenProps = 
  | ProfileScreenProps<'Subscription'>
  | NativeStackScreenProps<AuthStackParamList, 'SubscriptionScreen'>;

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { plans, loading: plansLoading, error: plansError, refreshPlans } = useSubscriptionPlans(true);
  const { subscription, loading: statusLoading, canStartFreeTrial, refreshStatus } = useSubscriptionStatus(true);
  const lifecycleData = useAppSelector(selectLifecycleData);
  const hasCheckedSubscriptionRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  // Check subscription status and navigate to home if active
  useEffect(() => {
    // Only check once when subscription data is loaded
    if (statusLoading || hasCheckedSubscriptionRef.current || hasNavigatedRef.current) {
      return;
    }

    if (subscription) {
      const hasActiveSubscription = subscription?.active || false;
      const hasActiveTrial = subscription?.subscription?.is_free_trial || false;
      const hasAccess = hasActiveSubscription || hasActiveTrial;

      if (hasAccess) {
        hasCheckedSubscriptionRef.current = true;
        
        // Check if we're in Auth stack (onboarding flow) or ProfileStack (managing subscription)
        const state = navigation.getState();
        const rootState = navigation.getParent()?.getState();
        const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
        
        if (isInAuthStack && !hasNavigatedRef.current) {
          // We're in Auth stack - update lifecycle and reload subscription status
          // RootNavigator will automatically switch from Auth to Main when subscription is active
          hasNavigatedRef.current = true;
          console.log('[SubscriptionScreen] User has active subscription in Auth stack. Updating lifecycle...');
          
          // Update lifecycle to mark upgrade_completed
          dispatch(updateLifecycle({ upgrade_completed: true }));
          
          // Reload lifecycle to get updated state
          dispatch(loadLifecycle());
          
          // Reload subscription status (already loaded, but refresh to be sure)
          dispatch(loadSubscriptionStatus());
          
          // RootNavigator will automatically switch from Auth to Main
          console.log('[SubscriptionScreen] Lifecycle updated. RootNavigator will switch to Main automatically.');
        } else if (!isInAuthStack) {
          // We're in ProfileStack - navigate within Main stack
          hasNavigatedRef.current = true;
          setTimeout(() => {
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
          }, 100);
        }
      } else {
        hasCheckedSubscriptionRef.current = true;
        // Stay on upgrade page - user needs to subscribe
      }
    }
  }, [subscription, statusLoading, navigation]);

  // Refresh subscription status when screen comes into focus (e.g., after payment)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh subscription status when screen is focused
      // This handles the case where user completes payment and returns to this screen
      if (!statusLoading) {
        refreshStatus();
        hasCheckedSubscriptionRef.current = false; // Allow re-check after refresh
        hasNavigatedRef.current = false;
      }
    });

    return unsubscribe;
  }, [navigation, statusLoading, refreshStatus]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.plan_type === 'Basic' || plan.plan_type === 'Pro') {
      // Check if we're in Auth stack or ProfileStack
      const state = navigation.getState();
      const rootState = navigation.getParent()?.getState();
      const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
      
      console.log('[SubscriptionScreen] handleSelectPlan - isInAuthStack:', isInAuthStack);
      
      if (isInAuthStack) {
        // In Auth stack - navigate directly to Checkout in Auth stack
        console.log('[SubscriptionScreen] Navigating to Checkout in Auth stack');
        (navigation as any).navigate('Checkout', { plan: plan.plan_type });
      } else {
        // In ProfileStack - normal navigation
        console.log('[SubscriptionScreen] Navigating to Checkout in ProfileStack');
        (navigation as any).navigate('Checkout', { plan: plan.plan_type });
      }
    }
  };

  const handleStartFreeTrial = () => {
    // Check if we're in Auth stack or ProfileStack
    const state = navigation.getState();
    const rootState = navigation.getParent()?.getState();
    const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
    
    console.log('[SubscriptionScreen] handleStartFreeTrial - isInAuthStack:', isInAuthStack);
    
    if (isInAuthStack) {
      // In Auth stack - navigate directly to FreeTrial in Auth stack
      console.log('[SubscriptionScreen] Navigating to FreeTrial in Auth stack');
      (navigation as any).navigate('FreeTrial');
    } else {
      // In ProfileStack - normal navigation
      console.log('[SubscriptionScreen] Navigating to FreeTrial in ProfileStack');
      (navigation as any).navigate('FreeTrial');
    }
  };

  // Only show loading for plans, not subscription status
  // Subscription status loading shouldn't block showing plans
  const loading = plansLoading;

  // Log plans loading state for debugging
  useEffect(() => {
    console.log('[SubscriptionScreen] Plans state:', {
      plansCount: plans.length,
      plansLoading,
      plansError,
      statusLoading,
      loading,
    });
  }, [plans.length, plansLoading, plansError, statusLoading, loading]);

  return (
    <RouteGuard
      requireAuth={true}
      requireOnboarding={true}
      requireConversationExperience={true}
      requireSubscription={false}
    >
      <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SubscriptionHeader
          title="Unlock full access"
          subtitle="Choose a plan to continue. You'll be redirected to checkout."
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : plansError ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Error loading plans: {plansError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refreshPlans()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No plans available</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refreshPlans()}
            >
              <Text style={styles.retryButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PlanComparison
            plans={plans}
            onSelectPlan={handleSelectPlan}
            onStartFreeTrial={handleStartFreeTrial}
            canStartFreeTrial={canStartFreeTrial}
          />
        )}
      </ScrollView>
    </SafeAreaView>
    </RouteGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0923',
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    color: 'rgba(203, 213, 225, 1)',
    marginTop: spacing.md,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SubscriptionScreen;
