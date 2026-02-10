/**
 * Free Trial Success Screen - Confirmation after trial activation
 * Simplified version matching Next.js implementation
 * 
 * Shows:
 * - Success confirmation
 * - Trial end date
 * - Two action buttons: Start Learning, View Plans
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSubscriptionStatus, selectCurrentSubscription } from '@/store/slices/subscriptionSlice';
import { updateLifecycle, loadLifecycle } from '@/store/slices/lifecycleSlice';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

import { FreeTrialSuccessScreenProps } from '../../navigation/types';

const FreeTrialSuccessScreen: React.FC<FreeTrialSuccessScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector(selectCurrentSubscription);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    // Get trial end date from subscription data
    if (subscription?.subscription?.trial_ends_at) {
      setTrialEndsAt(subscription.subscription.trial_ends_at);
    } else {
      // Refresh subscription status to get trial end date
      dispatch(loadSubscriptionStatus());
    }
  }, [dispatch, subscription?.subscription?.trial_ends_at]);

  const formatTrialEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartLearning = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Force refresh lifecycle and subscription status before navigating
      await dispatch(loadLifecycle());
      await dispatch(loadSubscriptionStatus());
      
      // Check if we're in Auth stack or ProfileStack
      const rootState = navigation.getParent()?.getState();
      const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
      
      if (isInAuthStack) {
        // In Auth stack - update lifecycle to mark upgrade as completed
        console.log('[FreeTrialSuccess] Updating lifecycle...');
        
        // Update lifecycle to mark upgrade_completed
        const updateResult = await dispatch(updateLifecycle({ upgrade_completed: true }));
        console.log('[FreeTrialSuccess] Lifecycle update result:', updateResult.type);
        
        // Reload lifecycle to get updated state
        const lifecycleResult = await dispatch(loadLifecycle());
        console.log('[FreeTrialSuccess] Lifecycle reload result:', lifecycleResult.type);
        
        // RootNavigator will automatically switch from Auth to Main
        console.log('[FreeTrialSuccess] All updates complete. RootNavigator should switch to Main automatically.');
      } else {
        // In ProfileStack - navigate to Main stack
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      }
    } catch (error) {
      console.error('[FreeTrialSuccess] Error navigating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPlans = () => {
    // Check if we're in Auth stack or ProfileStack
    const rootState = navigation.getParent()?.getState();
    const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
    
    if (isInAuthStack) {
      // In Auth stack - navigate back to SubscriptionScreen
      navigation.navigate('SubscriptionScreen' as any);
    } else {
      // In ProfileStack - navigate to SubscriptionPlans
      (navigation as any).navigate('SubscriptionPlans');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Card */}
      <View style={styles.successCard}>
        {/* Checkmark Icon */}
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to Your Free Trial!</Text>

        {/* Main Message */}
        <Text style={styles.message}>
          You now have full access to all Basic plan features for the next 7 days.
        </Text>

        {/* Trial End Date */}
        {trialEndsAt && (
          <View style={styles.trialDateContainer}>
            <Text style={styles.trialDateLabel}>Your free trial ends on:</Text>
            <Text style={styles.trialDateValue}>{formatTrialEndDate(trialEndsAt)}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.startButton, isLoading && styles.buttonDisabled]}
            onPress={handleStartLearning}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startButtonText}>Start Learning</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewPlansButton}
            onPress={handleViewPlans}
            disabled={isLoading}
          >
            <Text style={styles.viewPlansButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  successCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  trialDateContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trialDateLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  trialDateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewPlansButton: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewPlansButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default FreeTrialSuccessScreen;
