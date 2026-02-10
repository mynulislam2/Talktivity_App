/**
 * Payment Cancel Screen - User cancelled payment
 * Simplified version matching Next.js implementation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface PaymentCancelScreenProps {
  navigation: any;
  route: any;
}

const PaymentCancelScreen: React.FC<PaymentCancelScreenProps> = ({ navigation, route }) => {
  const orderId = route.params?.orderId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Cancel Header */}
      <View style={styles.cancelHeader}>
        <View style={styles.warningCircle}>
          <Ionicons name="information-circle" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Payment Cancelled</Text>
        <Text style={styles.message}>Your payment was cancelled. No charges were made to your account.</Text>
      </View>

      {/* Order Info */}
      {orderId && (
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Order ID:</Text>
          <Text style={styles.infoValue}>{orderId}</Text>
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
        <Text style={styles.retryButtonText}>Retry Payment</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    minHeight: '100%',
    justifyContent: 'center',
  },
  cancelHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  warningCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
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
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
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
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
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
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaymentCancelScreen;
