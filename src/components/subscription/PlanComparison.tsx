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
  // Deduplicate by plan_type, keeping the first occurrence
  const allowedPlanTypes = ['FreeTrial', 'Basic', 'Pro'];
  const planTypeMap = new Map<string, SubscriptionPlan>();

  plans.forEach((plan) => {
    if (
      allowedPlanTypes.includes(plan.plan_type) &&
      !planTypeMap.has(plan.plan_type)
    ) {
      planTypeMap.set(plan.plan_type, plan);
    }
  });

  // Convert back to array and sort: FreeTrial, Basic, Pro
  const displayPlans = Array.from(planTypeMap.values()).sort((a, b) => {
    const order = ['FreeTrial', 'Basic', 'Pro'];
    return order.indexOf(a.plan_type) - order.indexOf(b.plan_type);
  });

  // Find recommended plan (Basic is highlighted)
  const recommendedPlan = displayPlans.find(
    (plan) => plan.plan_type === 'Basic'
  );

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
