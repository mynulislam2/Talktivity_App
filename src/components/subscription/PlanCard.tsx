/**
 * PlanCard Component (React Native)
 *
 * Reusable subscription plan card component.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionPlan } from '@/services/subscription';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface PlanCardProps {
  plan: SubscriptionPlan;
  isRecommended?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  onStartFreeTrial?: () => void;
  canStartFreeTrial?: boolean;
}

export function PlanCard({
  plan,
  isRecommended = false,
  onSelect,
  onStartFreeTrial,
  canStartFreeTrial = false,
}: PlanCardProps) {
  const isFreeTrial = plan.plan_type === 'FreeTrial';
  const isPro = plan.plan_type === 'Pro';
  const isBasic = plan.plan_type === 'Basic';

  // Get values from environment variables (matching Next.js)
  const basicPlanPrice = process.env.EXPO_PUBLIC_BASIC_PLAN_PRICE || '2000';
  const proPlanPrice = process.env.EXPO_PUBLIC_PRO_PLAN_PRICE || '5000';
  const planDurationWeeks = process.env.EXPO_PUBLIC_PLAN_DURATION_WEEKS || '12';
  const basicPlanDailyTalkTime =
    process.env.EXPO_PUBLIC_BASIC_PLAN_DAILY_TALK_TIME || '5';
  const proPlanDailyTalkTime =
    process.env.EXPO_PUBLIC_PRO_PLAN_DAILY_TALK_TIME || '60';
  const basicPlanScenarios =
    process.env.EXPO_PUBLIC_BASIC_PLAN_SCENARIOS || '5';
  const proPlanScenarios =
    process.env.EXPO_PUBLIC_PRO_PLAN_SCENARIOS || 'unlimited';

  const handleClick = () => {
    if (isFreeTrial && onStartFreeTrial) {
      onStartFreeTrial();
    } else {
      onSelect(plan);
    }
  };

  // Render FreeTrial plan
  if (isFreeTrial) {
    return (
      <View style={[styles.card, styles.freeTrialCard]}>
        <Text style={styles.price}>FREE</Text>
        <Text style={styles.period}>7-day trial</Text>
        <View style={styles.featuresList}>
          <FeatureItem
            text={`${basicPlanDailyTalkTime} minutes daily talk time`}
          />
          <FeatureItem text={`Create ${basicPlanScenarios} scenarios`} />
          <FeatureItem text="5 roleplay sessions per section" />
          <FeatureItem text="Personalized Roadmap" />
          <FeatureItem text="Community Section" />
        </View>
        <View style={styles.buttonContainer}>
          {canStartFreeTrial ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleClick}
              >
                <Text style={styles.primaryButtonText}>
                  Start 7-Day Free Trial
                </Text>
              </TouchableOpacity>
              <Text style={styles.noCardText}>
                ðŸ’³ No credit card required
              </Text>
            </>
          ) : (
            <TouchableOpacity style={styles.disabledButton} disabled>
              <Text style={styles.disabledButtonText}>Free Trial Used</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Render Basic plan
  if (isBasic) {
    return (
      <View style={[styles.card, isRecommended && styles.recommendedCard]}>
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedBadgeText}>MOST POPULAR</Text>
          </View>
        )}
        <Text style={styles.planName}>Basic</Text>
        <Text style={styles.price}>
          à§³{basicPlanPrice}{' '}
          <Text style={styles.period}>/ {planDurationWeeks} weeks</Text>
        </Text>
        <View style={styles.featuresList}>
          <FeatureItem
            text={`${basicPlanDailyTalkTime} minutes daily talk time`}
          />
          <FeatureItem text={`Create ${basicPlanScenarios} scenarios`} />
          <FeatureItem text="5 roleplay sessions per section" />
          <FeatureItem text="Personalized Roadmap" />
          <FeatureItem text="Community Section" />
          <FeatureItem text={`Duration: ${planDurationWeeks} weeks`} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isRecommended && styles.recommendedButton,
            ]}
            onPress={handleClick}
          >
            <Text style={styles.primaryButtonText}>
              Buy Now - à§³{basicPlanPrice}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render Pro plan
  if (isPro) {
    return (
      <View style={styles.card}>
        <Text style={styles.planName}>Pro</Text>
        <Text style={styles.price}>
          à§³{proPlanPrice}{' '}
          <Text style={styles.period}>/ {planDurationWeeks} weeks</Text>
        </Text>
        <View style={styles.featuresList}>
          <FeatureItem
            text={`${proPlanDailyTalkTime} minutes daily talk time`}
          />
          <FeatureItem text="Unlimited scenarios" />
          <FeatureItem text="Unlimited roleplay sessions" />
          <FeatureItem text="Advanced Progress Analytics" />
          <FeatureItem text="Personalized Roadmap" />
          <FeatureItem text="Community Section" />
          <FeatureItem text={`Duration: ${planDurationWeeks} weeks`} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleClick}>
            <Text style={styles.primaryButtonText}>Go Pro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark" size={16} color="#10b981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    minHeight: 500,
  },
  freeTrialCard: {
    // Same as regular card
  },
  recommendedCard: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    paddingTop: spacing.sm,
    borderRadius: 20,
  },
  recommendedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.md,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  period: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: 'rgba(203, 213, 225, 1)',
  },
  featuresList: {
    marginTop: spacing.lg,
    gap: spacing.md,
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(203, 213, 225, 1)',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  recommendedButton: {
    backgroundColor: '#6A5AE0',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#4b5563',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  noCardText: {
    fontSize: 10,
    fontFamily: 'Poppins',
    color: 'rgba(203, 213, 225, 1)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
