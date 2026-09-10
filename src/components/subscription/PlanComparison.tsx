/**
 * PlanComparison Component (React Native)
 *
 * Compare subscription plans side-by-side.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PlanCard } from './PlanCard';
import { SubscriptionPlan } from '@/services/subscription';
import { spacing } from '@/styles/spacing';

export interface PlanComparisonProps {
  plans: SubscriptionPlan[];
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onStartFreeTrial?: () => void;
  canStartFreeTrial?: boolean;
}

export function PlanComparison({
  plans,
  onSelectPlan,
  onStartFreeTrial,
  canStartFreeTrial = false,
}: PlanComparisonProps) {
  // Deduplicate active plans by plan_type
  const planTypeMap = new Map<string, SubscriptionPlan>();

  plans.forEach((plan) => {
    if (plan.is_active !== false && !planTypeMap.has(plan.plan_type)) {
      planTypeMap.set(plan.plan_type, plan);
    }
  });

  // Sort by duration and price
  const displayPlans = Array.from(planTypeMap.values()).sort((a, b) => {
    return (a.duration_days || 0) - (b.duration_days || 0) || (Number(a.price) || 0) - (Number(b.price) || 0);
  });

  // Find recommended plan (30-day or 90-day plan, or first)
  const recommendedPlan =
    displayPlans.find((plan) => plan.duration_days === 30 || plan.duration_days === 90) ||
    displayPlans[0];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {displayPlans.map((plan) => (
        <View key={plan.id} style={styles.cardWrapper}>
          <PlanCard
            plan={plan}
            isRecommended={plan.id === recommendedPlan?.id}
            onSelect={onSelectPlan}
            onStartFreeTrial={onStartFreeTrial}
            canStartFreeTrial={canStartFreeTrial}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  cardWrapper: {
    width: 320,
    marginRight: spacing.lg,
  },
});
