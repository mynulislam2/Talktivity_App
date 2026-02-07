/**
 * Payment Failure Screen - Error handling after payment failure
 * 
 * Shows:
 * - Error message
 * - Retry option
 * - Contact support
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface PaymentFailureScreenProps {
  navigation: any;
  route: any;
}

const PaymentFailureScreen: React.FC<PaymentFailureScreenProps> = ({ navigation, route }) => {
  const reason = route.params?.reason || 'Payment was not completed';
  const plan = route.params?.plan || 'Unknown';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Error State */}
      <View style={styles.errorContainer}>
        <View style={styles.errorCircle}>
          <Ionicons name="close" size={60} color={colors.error || '#ef4444'} />
        </View>
        <Text style={styles.errorTitle}>Payment Failed</Text>
        <Text style={styles.errorSubtitle}>
          We couldn't complete your payment
        </Text>
      </View>

      {/* Error Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>What Happened?</Text>

        <View style={styles.reasonBox}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={colors.error || '#991b1b'}
          />
          <Text style={styles.reasonText}>{reason}</Text>
        </View>

        <Text style={styles.explanationText}>
          This could be due to:
        </Text>

        <View style={styles.reasonList}>
          <View style={styles.reasonItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonItemText}>Insufficient funds</Text>
          </View>
          <View style={styles.reasonItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonItemText}>Card expired or invalid</Text>
          </View>
          <View style={styles.reasonItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonItemText}>Network connectivity issue</Text>
          </View>
          <View style={styles.reasonItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonItemText}>Payment gateway temporarily unavailable</Text>
          </View>
        </View>
      </View>

      {/* Plan Information */}
      <View style={styles.planCard}>
        <Text style={styles.sectionTitle}>Your Plan (Not Charged)</Text>

        <View style={styles.planDetail}>
          <Text style={styles.planLabel}>Plan Type</Text>
          <Text style={styles.planValue}>{plan}</Text>
        </View>

        <View style={styles.planDetail}>
          <Text style={styles.planLabel}>Duration</Text>
          <Text style={styles.planValue}>12 weeks</Text>
        </View>

        <Text style={styles.noteText}>
          ℹ️ Your card was not charged. Please try again or use a different payment method.
        </Text>
      </View>

      {/* Support Section */}
      <View style={styles.supportCard}>
        <Text style={styles.sectionTitle}>Need Help?</Text>

        <TouchableOpacity style={styles.supportLink}>
          <Ionicons name="mail" size={20} color={colors.primary} />
          <View style={styles.supportLinkText}>
            <Text style={styles.supportLinkTitle}>Contact Support</Text>
            <Text style={styles.supportLinkDesc}>Email our support team</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportLink}>
          <Ionicons name="help-circle" size={20} color={colors.primary} />
          <View style={styles.supportLinkText}>
            <Text style={styles.supportLinkTitle}>FAQ</Text>
            <Text style={styles.supportLinkDesc}>Common payment issues</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          // Navigate back to checkout with same plan
          navigation.navigate('Checkout', { plan: { plan_type: plan } });
        }}
      >
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.navigate('SubscriptionPlans')}
      >
        <Text style={styles.cancelButtonText}>Back to Plans</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueWithoutPayment}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.continueWithoutPaymentText}>Continue Without Payment</Text>
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
  errorContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  errorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.error || '#ef4444',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reasonBox: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: colors.error || '#991b1b',
    fontWeight: '600',
    lineHeight: 18,
  },
  explanationText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  reasonList: {
    gap: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bullet: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '700',
    width: 20,
  },
  reasonItemText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  planCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  planLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  planValue: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  supportCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  supportLinkText: {
    flex: 1,
  },
  supportLinkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  supportLinkDesc: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  continueWithoutPayment: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  continueWithoutPaymentText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PaymentFailureScreen;
