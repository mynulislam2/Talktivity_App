/**
 * Payment Success Screen - Confirmation after successful payment
 * 
 * Shows:
 * - Confirmation message
 * - Plan details
 * - Duration
 * - Next steps
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { loadSubscriptionStatus } from '../../store/slices/subscriptionSlice';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface PaymentSuccessScreenProps {
  navigation: any;
  route: any;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const plan = route.params?.plan || 'Pro';
  const amount = route.params?.amount || 0;

  useEffect(() => {
    // Refresh subscription status to confirm purchase
    dispatch(loadSubscriptionStatus());

    // Could set a timeout to auto-navigate after few seconds
    const timer = setTimeout(() => {
      // auto-navigate if desired
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Animation */}
      <View style={styles.successContainer}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark-done-sharp" size={60} color={colors.primary} />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your subscription is now active
        </Text>
      </View>

      {/* Order Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Order Details</Text>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Plan</Text>
          <Text style={styles.detailValue}>{plan}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount Paid</Text>
          <Text style={styles.detailValue}>৳{amount.toLocaleString()}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>12 weeks</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
      </View>

      {/* What's Next */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.sectionTitle}>What's Next?</Text>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Start Learning</Text>
            <Text style={styles.stepDescription}>
              Access all learning materials and start your AI conversations
            </Text>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Practice Daily</Text>
            <Text style={styles.stepDescription}>
              Follow your personalized learning path for best results
            </Text>
          </View>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Track Progress</Text>
            <Text style={styles.stepDescription}>
              Check your reports and analytics to see improvement
            </Text>
          </View>
        </View>
      </View>

      {/* Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.sectionTitle}>Your Plan Includes</Text>

        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.benefitText}>Unlimited AI conversations</Text>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.benefitText}>Access to 500+ scenarios</Text>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.benefitText}>Advanced analytics dashboard</Text>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.benefitText}>Priority support</Text>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.benefitText}>Personalized learning path</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.continueButtonText}>Start Learning</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.secondaryButtonText}>View Account</Text>
      </TouchableOpacity>
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
  successContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#d1fae5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  nextStepsCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 16,
  },
  benefitsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default PaymentSuccessScreen;
