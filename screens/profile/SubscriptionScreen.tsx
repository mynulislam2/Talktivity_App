/**
 * Subscription Screen
 * 
 * Plan management, upgrades, downgrades, and billing information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface SubscriptionScreenProps {
  navigation: any;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  color: string;
  isPopular?: boolean;
}

interface UserSubscription {
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired';
  renewsOn?: string;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const [currentPlan, setCurrentPlan] = useState<UserSubscription | null>({
    planId: 'basic',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    status: 'active',
    renewsOn: '2025-01-15',
  });
  const [isLoading, setIsLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'Forever',
      description: 'Get started with basic features',
      features: [
        '5 minutes per day',
        '5 practice sessions',
        'Basic vocabulary lessons',
        'Community access',
      ],
      color: '#6C757D',
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      period: '/month',
      description: 'Perfect for casual learners',
      features: [
        '30 minutes per day',
        '20 practice sessions',
        'All vocabulary lessons',
        'Community access',
        'Weekly reports',
      ],
      color: '#007AFF',
      isPopular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 24.99,
      period: '/month',
      description: 'For serious learners',
      features: [
        'Unlimited minutes',
        'Unlimited sessions',
        'All vocabulary lessons',
        'Community access',
        'Daily AI feedback',
        'Priority support',
        'Advanced analytics',
      ],
      color: '#FFB800',
      isPopular: true,
    },
  ];

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      // TODO: Fetch subscription data from backend
      // const response = await fetchSubscription();
      // setCurrentPlan(response);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      Alert.alert('Error', 'Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlanObject = (): Plan | null => {
    if (!currentPlan) return null;
    return plans.find((p) => p.id === currentPlan.planId) || null;
  };

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan?.planId) {
      Alert.alert('Current Plan', 'You are already on this plan');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    Alert.alert(
      'Upgrade Plan',
      `Upgrade to ${selectedPlan.name} for ${selectedPlan.price === 0 ? 'Free' : `$${selectedPlan.price}${selectedPlan.period}`}?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => {
            handlePlanChange(planId);
          },
          style: 'default',
        },
      ],
    );
  };

  const handleDowngrade = (planId: string) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    Alert.alert(
      'Downgrade Plan',
      `Downgrade to ${selectedPlan.name}? You may lose access to premium features.`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Downgrade',
          onPress: () => {
            handlePlanChange(planId);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handlePlanChange = async (newPlanId: string) => {
    try {
      setIsLoading(true);
      // TODO: Call backend API to change plan
      // await changePlan(newPlanId);
      setCurrentPlan({
        planId: newPlanId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        status: 'active',
        renewsOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      });
      Alert.alert('Success', 'Plan updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update plan');
      console.error('Plan change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', onPress: () => {}, style: 'cancel' },
        {
          text: 'Cancel Subscription',
          onPress: async () => {
            try {
              setIsLoading(true);
              // TODO: Call backend API to cancel subscription
              // await cancelSubscription();
              setCurrentPlan((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
              Alert.alert('Success', 'Subscription cancelled');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
              console.error('Cancellation error:', error);
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const currentPlanObj = getCurrentPlanObject();

  if (isLoading && !currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Current Plan Section */}
        {currentPlan && currentPlanObj && (
          <View style={styles.currentPlanSection}>
            <View style={styles.currentPlanCard}>
              <View
                style={[
                  styles.currentPlanBadge,
                  { backgroundColor: currentPlanObj.color },
                ]}
              >
                <Text style={styles.currentPlanBadgeText}>CURRENT PLAN</Text>
              </View>
              <Text style={styles.currentPlanName}>{currentPlanObj.name}</Text>
              <Text style={styles.currentPlanPrice}>
                {currentPlanObj.price === 0 ? (
                  'Free'
                ) : (
                  <>
                    ${currentPlanObj.price}
                    <Text style={styles.currentPlanPeriod}>{currentPlanObj.period}</Text>
                  </>
                )}
              </Text>

              {currentPlan.status === 'active' && currentPlan.renewsOn && (
                <View style={styles.renewalInfo}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.renewalText}>
                    Renews on {currentPlan.renewsOn}
                  </Text>
                </View>
              )}

              {currentPlan.status === 'cancelled' && (
                <View style={styles.renewalInfo}>
                  <Ionicons name="close-circle" size={16} color={colors.danger} />
                  <Text style={styles.renewalText}>
                    Ends on {currentPlan.endDate}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Plans Comparison */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Other Plans</Text>

          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan?.planId;

            return (
              <View
                key={plan.id}
                style={[styles.planCard, isCurrentPlan && styles.planCardCurrent]}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.planPrice}>
                    <Text style={styles.priceText}>
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </Text>
                    {plan.price > 0 && (
                      <Text style={styles.periodText}>{plan.period}</Text>
                    )}
                  </View>
                </View>

                {/* Features List */}
                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                        style={{ marginRight: spacing.sm }}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Button */}
                {!isCurrentPlan && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      plan.price < (currentPlanObj?.price || 0)
                        ? styles.downgradeButton
                        : styles.upgradeButton,
                    ]}
                    onPress={() =>
                      plan.price < (currentPlanObj?.price || 0)
                        ? handleDowngrade(plan.id)
                        : handleUpgrade(plan.id)
                    }
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        plan.price < (currentPlanObj?.price || 0)
                          ? styles.downgradeButtonText
                          : styles.upgradeButtonText,
                      ]}
                    >
                      {plan.price < (currentPlanObj?.price || 0)
                        ? 'Downgrade'
                        : 'Upgrade'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Billing Info Section */}
        {currentPlan && currentPlan.status === 'active' && (
          <View style={styles.billingSection}>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            <View style={styles.billingCard}>
              <View style={styles.billingItem}>
                <Text style={styles.billingLabel}>Current Plan</Text>
                <Text style={styles.billingValue}>{currentPlanObj?.name}</Text>
              </View>
              <View style={styles.billingDivider} />
              <View style={styles.billingItem}>
                <Text style={styles.billingLabel}>Start Date</Text>
                <Text style={styles.billingValue}>{currentPlan.startDate}</Text>
              </View>
              <View style={styles.billingDivider} />
              <View style={styles.billingItem}>
                <Text style={styles.billingLabel}>Renewal Date</Text>
                <Text style={styles.billingValue}>{currentPlan.renewsOn}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Cancel Subscription */}
        {currentPlan && currentPlan.status === 'active' && currentPlan.planId !== 'free' && (
          <View style={styles.cancelSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All prices are in USD. Billing occurs automatically at renewal.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  currentPlanSection: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  currentPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  currentPlanBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  currentPlanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  currentPlanName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  currentPlanPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  currentPlanPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  renewalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  renewalText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  plansSection: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  planCardCurrent: {
    opacity: 0.5,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFB800',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  periodText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  featuresList: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: colors.primary,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  downgradeButton: {
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  downgradeButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  billingSection: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  billingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  billingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  billingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  billingDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  cancelSection: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
