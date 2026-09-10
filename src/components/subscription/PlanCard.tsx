/**
 * PlanCard Component (React Native)
 * 
 * Reusable dynamic subscription plan card component.
 * 100% data-driven: renders directly from database plan attributes (name, price, duration, features).
 * Zero hardcoded legacy plans.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionPlan } from '@/services/subscription';
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
  const isFree = Number(plan.price) === 0 && (!plan.price_usd || Number(plan.price_usd) === 0);

  const priceDisplay = plan.price != null && Number(plan.price) > 0
    ? `৳${plan.price}`
    : plan.price_usd != null && Number(plan.price_usd) > 0
      ? `$${plan.price_usd}`
      : 'Free';

  const durationLabel = plan.duration_days ? `${plan.duration_days} days` : '';

  const features: string[] = Array.isArray(plan.features)
    ? (plan.features as string[])
    : [];

  const handleClick = () => {
    if (isFree && onStartFreeTrial) {
      onStartFreeTrial();
    } else {
      onSelect(plan);
    }
  };

  const buttonText = isFree
    ? (canStartFreeTrial ? 'Start Free Trial' : 'Trial Used')
    : `Buy Now - ${priceDisplay}`;

  return (
    <View style={[styles.card, isRecommended && styles.recommendedCard]}>
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      <Text style={styles.planName}>{plan.name || plan.plan_type}</Text>

      {plan.description ? (
        <Text style={styles.descriptionText}>{plan.description}</Text>
      ) : null}

      <Text style={styles.price}>
        {priceDisplay}{' '}
        {durationLabel ? <Text style={styles.period}>/ {durationLabel}</Text> : null}
      </Text>

      {features.length > 0 && (
        <View style={styles.featuresList}>
          {features.map((feature, idx) => (
            <FeatureItem key={idx} text={feature} />
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isRecommended && styles.recommendedButton,
            isFree && !canStartFreeTrial && styles.disabledButton,
          ]}
          disabled={isFree && !canStartFreeTrial}
          onPress={handleClick}
        >
          <Text
            style={[
              styles.primaryButtonText,
              isFree && !canStartFreeTrial && styles.disabledButtonText,
            ]}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
    minHeight: 460,
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
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(148, 163, 184, 1)',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  period: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: 'rgba(203, 213, 225, 1)',
  },
  featuresList: {
    marginTop: spacing.md,
    gap: spacing.sm,
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 13,
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
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});
