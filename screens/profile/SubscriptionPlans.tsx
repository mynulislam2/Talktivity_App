/**
 * Subscription Plans - Displays available plans and pricing
 * 
 * Shows plan comparison with:
 * - Plan features and duration
 * - Pricing comparison
 * - Select button for each plan
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadPlans } from '../../store/slices/subscriptionSlice';
import { SubscriptionPlan } from '../../service/SubscriptionService';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface SubscriptionPlansProps {
  navigation: any;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { plans, loading, error } = useAppSelector((state) => state.subscription);

  useEffect(() => {
    // Load plans on component mount
    dispatch(loadPlans());
  }, [dispatch]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // Navigate to checkout with selected plan
    navigation.navigate('Checkout', { plan });
  };

  const handleRetry = () => {
    dispatch(loadPlans());
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error || '#ef4444'} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>No plans available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          12 weeks of English learning tailored to you
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => {
          const isPro = plan.plan_type === 'Pro';
          
          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                isPro && styles.planCardPro,
              ]}
            >
              {isPro && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Popular</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name || plan.plan_type}</Text>
              
              <View style={styles.priceSection}>
                <Text style={styles.price}>৳{plan.price_usd.toLocaleString()}</Text>
                <Text style={styles.priceDuration}>for 12 weeks</Text>
              </View>

              <View style={styles.talkTimeSection}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <View style={styles.talkTimeText}>
                  <Text style={styles.talkTimeLabel}>Talk Time</Text>
                  <Text style={styles.talkTimeValue}>
                    {plan.plan_type === 'Pro'
                      ? 'Unlimited'
                      : `${plan.talk_time_minutes} minutes/day`}
                  </Text>
                </View>
              </View>

              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>What's included:</Text>
                {plan.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  isPro && styles.selectButtonPro,
                ]}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    isPro && styles.selectButtonTextPro,
                  ]}
                >
                  Select Plan
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isPro ? '#fff' : colors.primary}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.noteSection}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text style={styles.noteText}>
          12-week subscription renews automatically. Cancel anytime from your account settings.
        </Text>
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
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: colors.error || '#ef4444',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  plansContainer: {
    gap: spacing.lg,
  },
  planCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: spacing.lg,
    gap: spacing.md,
  },
  planCardPro: {
    borderColor: colors.primary,
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  recommendedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  priceSection: {
    gap: spacing.xs,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  priceDuration: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  talkTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  talkTimeText: {
    flex: 1,
  },
  talkTimeLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  talkTimeValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  featuresSection: {
    gap: spacing.md,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  selectButtonPro: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  selectButtonTextPro: {
    color: '#fff',
  },
  noteSection: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default SubscriptionPlans;
