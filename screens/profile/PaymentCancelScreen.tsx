/**
 * Payment Cancelled Screen - Shown when user cancels payment
 * 
 * Shows:
 * - Cancellation confirmation
 * - Summary of what they were trying to purchase
 * - Options to retry or go back
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface PaymentCancelScreenProps {
  navigation: any;
  route: any;
}

const PaymentCancelScreen: React.FC<PaymentCancelScreenProps> = ({ navigation, route }) => {
  const plan = route.params?.plan || 'Unknown';
  const amount = route.params?.amount || '0';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Cancellation State */}
      <View style={styles.cancelContainer}>
        <View style={styles.cancelCircle}>
          <Ionicons name="arrow-back" size={60} color="#f59e0b" />
        </View>
        <Text style={styles.cancelTitle}>Payment Cancelled</Text>
        <Text style={styles.cancelSubtitle}>
          You cancelled the payment process
        </Text>
      </View>

      {/* Cancelled Purchase Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>What You Were Purchasing</Text>

        <View style={styles.planDetail}>
          <View>
            <Text style={styles.planLabel}>Plan</Text>
            <Text style={styles.planValue}>{plan} Plan</Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>৳{amount}</Text>
          </View>
        </View>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>You Would Have Received:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={18} color={colors.success || '#16a34a'} />
            <Text style={styles.benefitText}>
              Unlimited conversations
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={18} color={colors.success || '#16a34a'} />
            <Text style={styles.benefitText}>
              500+ practice scenarios
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={18} color={colors.success || '#16a34a'} />
            <Text style={styles.benefitText}>
              Detailed progress reports
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark" size={18} color={colors.success || '#16a34a'} />
            <Text style={styles.benefitText}>
              Advanced analytics
            </Text>
          </View>
        </View>

        <Text style={styles.noteText}>
          ℹ️ No charges were made to your account.
        </Text>
      </View>

      {/* Continue Learning Message */}
      <View style={styles.offersCard}>
        <Text style={styles.sectionTitle}>Continue Learning for Free</Text>

        <Text style={styles.offersText}>
          You can continue using Talktivity with your free plan:
        </Text>

        <View style={styles.freeFeatures}>
          <View style={styles.freeFeature}>
            <Ionicons name="time" size={18} color={colors.primary} />
            <Text style={styles.freeFeatureText}>5 minutes per day</Text>
          </View>
          <View style={styles.freeFeature}>
            <Ionicons name="chatbubbles" size={18} color={colors.primary} />
            <Text style={styles.freeFeatureText}>Daily practice conversations</Text>
          </View>
          <View style={styles.freeFeature}>
            <Ionicons name="trending-up" size={18} color={colors.primary} />
            <Text style={styles.freeFeatureText}>Basic progress tracking</Text>
          </View>
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsCard}>
        <Text style={styles.sectionTitle}>Why Upgrade Later?</Text>

        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>More Speaking Time</Text>
            <Text style={styles.tipDesc}>
              Get 60 minutes per day instead of 5 minutes
            </Text>
          </View>
        </View>

        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Unlock All Scenarios</Text>
            <Text style={styles.tipDesc}>
              Access 500+ practice scenarios across all topics
            </Text>
          </View>
        </View>

        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Detailed Analytics</Text>
            <Text style={styles.tipDesc}>
              Track your progress with advanced reports
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          // Navigate back to subscription plans
          navigation.navigate('SubscriptionPlans');
        }}
      >
        <Ionicons name="card" size={18} color="#fff" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.continueButtonText}>Continue with Free Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          navigation.navigate('SubscriptionPlans');
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
  },
  cancelContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  cancelCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f59e0b',
    textAlign: 'center',
  },
  cancelSubtitle: {
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
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  planLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  planValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '700',
  },
  priceTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  benefitsBox: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  noteText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  offersCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  offersText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  freeFeatures: {
    gap: spacing.md,
  },
  freeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  freeFeatureText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tipsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tipNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    textAlign: 'center',
    lineHeight: 30,
  },
  tipContent: {
    flex: 1,
    gap: spacing.xs,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tipDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
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
  continueButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: colors.success || '#16a34a',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success || '#16a34a',
  },
  backButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PaymentCancelScreen;
