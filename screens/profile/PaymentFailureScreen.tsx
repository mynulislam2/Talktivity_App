/**
 * Payment Failure Screen - Error handling after payment failure
 * Simplified version matching Next.js implementation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface PaymentFailureScreenProps {
  navigation: any;
  route: any;
}

const PaymentFailureScreen: React.FC<PaymentFailureScreenProps> = ({ navigation, route }) => {
  const orderId = route.params?.orderId;
  const reason = route.params?.reason || 'We couldn\'t process your payment.';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Error Header */}
      <View style={styles.errorHeader}>
        <View style={styles.errorCircle}>
          <Ionicons name="alert-circle" size={40} color="#fff" />
        </View>
        <Text style={styles.errorTitle}>Payment Failed</Text>
        <Text style={styles.errorMessage}>{reason}</Text>
      </View>

      {/* Possible Reasons Card */}
      <View style={styles.reasonsCard}>
        <Text style={styles.sectionTitle}>Possible Reasons:</Text>

        <ReasonItem text="Insufficient funds in your account" />
        <ReasonItem text="Card expired or invalid" />
        <ReasonItem text="Network connectivity issue" />
        <ReasonItem text="Payment gateway temporarily unavailable" />
      </View>

      {/* Order Info */}
      {orderId && (
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Order ID:</Text>
          <Text style={styles.infoValue}>{orderId}</Text>
          <Text style={styles.infoNote}>Your card was not charged. Please try again or contact support.</Text>
        </View>
      )}

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          const rootState = navigation.getParent()?.getState();
          const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;

          if (isInAuthStack) {
            navigation.navigate('Checkout' as any, { plan: 'Basic' });
          } else {
            navigation.navigate('SubscriptionPlans' as any);
          }
        }}
      >
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          const rootState = navigation.getParent()?.getState();
          const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;

          if (isInAuthStack) {
            navigation.navigate('SubscriptionScreen' as any);
          } else {
            navigation.navigate('SubscriptionPlans' as any);
          }
        }}
      >
        <Text style={styles.backButtonText}>Back to Plans</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

interface ReasonItemProps {
  text: string;
}

const ReasonItem: React.FC<ReasonItemProps> = ({ text }) => (
  <View style={styles.reasonItem}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.reasonText}>{text}</Text>
  </View>
);

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
  errorHeader: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.error || '#ef4444',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  reasonsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  infoNote: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: spacing.sm,
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
  backButton: {
    backgroundColor: colors.inputBackground,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

export default PaymentFailureScreen;
