/**
 * Checkout Screen (React Native)
 * 
 * Payment checkout flow.
 * Matches Next.js /checkout page implementation.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { httpService } from '@/service/httpservice';
import { discountTokenService } from '@/service/DiscountTokenService';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { ProfileScreenProps } from '@/navigation/types';

interface Discount {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  discountedPrice: number;
}

const CheckoutScreen: React.FC<ProfileScreenProps<'Checkout'>> = ({ navigation, route }) => {
  const planType = route.params?.plan || 'Basic';

  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountToken, setDiscountToken] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  // Get values from environment variables (matching Next.js)
  const basicPlanPrice = parseFloat(process.env.EXPO_PUBLIC_BASIC_PLAN_PRICE || "2000");
  const proPlanPrice = parseFloat(process.env.EXPO_PUBLIC_PRO_PLAN_PRICE || "5000");
  const planDurationWeeks = process.env.EXPO_PUBLIC_PLAN_DURATION_WEEKS || "12";
  const basicPlanDailyTalkTime = process.env.EXPO_PUBLIC_BASIC_PLAN_DAILY_TALK_TIME || "5";
  const basicPlanScenarios = process.env.EXPO_PUBLIC_BASIC_PLAN_SCENARIOS || "50";
  const proPlanScenarios = process.env.EXPO_PUBLIC_PRO_PLAN_SCENARIOS || "500";

  const originalPrice = planType === 'Pro' ? proPlanPrice : basicPlanPrice;

  // Redirect to pricing page if plan type is invalid
  useEffect(() => {
    if (planType !== 'Basic' && planType !== 'Pro') {
      Alert.alert('Invalid Plan', 'Please select a valid plan');
      navigation.goBack();
    }
  }, [planType, navigation]);

  const handleApplyToken = async () => {
    if (!discountToken.trim()) {
      setTokenError('Please enter a discount token');
      return;
    }

    setValidatingToken(true);
    setTokenError(null);
    setAppliedDiscount(null);

    try {
      const response = await discountTokenService.validateToken(discountToken.trim().toUpperCase(), planType);
      
      if (response.success && response.data) {
        setAppliedDiscount(response.data);
        setTokenError(null);
      } else {
        setTokenError(response.error || 'Invalid discount token');
        setAppliedDiscount(null);
      }
    } catch (error: any) {
      setTokenError(error?.message || 'Failed to validate token. Please try again.');
      setAppliedDiscount(null);
    } finally {
      setValidatingToken(false);
    }
  };

  const handleRemoveToken = () => {
    setDiscountToken('');
    setAppliedDiscount(null);
    setTokenError(null);
  };

  const handleCheckout = async () => {
    if (!agreedToPolicy) {
      setError('Please agree to the Privacy Policy and Refund Policy to proceed.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use the AamarPay payment API endpoint
      const response = await httpService.post('/payments/aamarpay/payment', {
        planType: planType,
        amount: originalPrice,
        currency: 'BDT',
        desc: `Talktivity ${planType} Plan Subscription - ${planDurationWeeks} weeks`,
        discountToken: discountToken.trim() || null,
      });
      
      // Response structure: { success: true, data: { payment_url: "...", order_id: "..." } }
      if (response.data.success && response.data.data?.payment_url) {
        // Open payment URL in browser (React Native equivalent of window.location.href)
        const canOpen = await Linking.canOpenURL(response.data.data.payment_url);
        if (canOpen) {
          await Linking.openURL(response.data.data.payment_url);
        } else {
          setError('Unable to open payment gateway');
        }
      } else {
        setError(response.data.error || 'No payment URL received from the server.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Could not initiate payment. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Plan features data
  const planFeatures = {
    Basic: [
      { icon: true, text: `Time per day: ${basicPlanDailyTalkTime}min talk` },
      { icon: true, text: `Duration: ${planDurationWeeks} weeks` },
      { icon: true, text: `Access to ${basicPlanScenarios} Scenarios` },
      { icon: true, text: 'Personalized Roadmap' },
      { icon: true, text: 'Community Section' },
    ],
    Pro: [
      { icon: true, text: 'Unlimited AI Conversations' },
      { icon: true, text: `All ${proPlanScenarios}+ Scenarios` },
      { icon: true, text: 'Advanced Progress Analytics' },
      { icon: true, text: `Duration: ${planDurationWeeks} weeks` },
      { icon: true, text: 'Personalized Roadmap' },
      { icon: true, text: 'Community Section' },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Complete Your <Text style={styles.gradientText}>Purchase</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Review your plan details and proceed to payment
        </Text>
      </View>

      {/* Plan Card */}
      <View style={[styles.pricingCard, planType === 'Pro' && styles.proPlanCard]}>
        {planType === 'Pro' && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>Most Popular</Text>
          </View>
        )}
        <Text style={styles.planName}>{planType} Plan</Text>
        <View style={styles.priceContainer}>
          {appliedDiscount ? (
            <View>
              <Text style={styles.originalPrice}>৳{originalPrice.toFixed(2)}</Text>
              <Text style={styles.discountedPrice}>
                ৳{appliedDiscount.discountedPrice.toFixed(2)}{' '}
                <Text style={styles.pricePeriod}>/ {planDurationWeeks} weeks</Text>
              </Text>
              <Text style={styles.savingsText}>
                You save ৳{appliedDiscount.discountAmount.toFixed(2)} ({appliedDiscount.discountPercent}% off)
              </Text>
            </View>
          ) : (
            <Text style={styles.price}>
              ৳{originalPrice.toFixed(2)}{' '}
              <Text style={styles.pricePeriod}>/ {planDurationWeeks} weeks</Text>
            </Text>
          )}
        </View>

        <View style={styles.featuresList}>
          {planFeatures[planType as keyof typeof planFeatures].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark" size={20} color="#10b981" />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Discount Token Section */}
      <View style={styles.discountCard}>
        <Text style={styles.sectionTitle}>Have a discount code?</Text>
        <View style={styles.tokenInputRow}>
          <View style={styles.tokenInputContainer}>
            <Ionicons name="pricetag" size={20} color="rgba(203, 213, 225, 1)" style={styles.tokenIcon} />
            <TextInput
              style={styles.tokenInput}
              placeholder="Enter discount code"
              placeholderTextColor="rgba(203, 213, 225, 0.5)"
              value={discountToken}
              onChangeText={(text) => {
                setDiscountToken(text.toUpperCase());
                setTokenError(null);
                setAppliedDiscount(null);
              }}
              editable={!validatingToken}
            />
          </View>
          {appliedDiscount ? (
            <TouchableOpacity
              onPress={handleRemoveToken}
              style={styles.removeTokenButton}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleApplyToken}
              disabled={validatingToken || !discountToken.trim()}
              style={[
                styles.applyButton,
                (validatingToken || !discountToken.trim()) && styles.applyButtonDisabled
              ]}
            >
              {validatingToken ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Token Error Display */}
        {tokenError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{tokenError}</Text>
          </View>
        )}

        {/* Discount Applied Display */}
        {appliedDiscount && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Discount applied!</Text>
              <Text style={styles.successSubtitle}>
                {appliedDiscount.discountPercent}% off - Save ৳{appliedDiscount.discountAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Payment Section */}
      <View style={styles.paymentCard}>
        {/* Policy Agreement */}
        <View style={styles.policyAgreement}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreedToPolicy(!agreedToPolicy)}
          >
            {agreedToPolicy && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.policyText}>
            I agree to the{' '}
            <Text style={styles.policyLink} onPress={() => navigation.navigate('Privacy')}>
              Privacy Policy
            </Text>{' '}
            and{' '}
            <Text style={styles.policyLink} onPress={() => navigation.navigate('Refund')}>
              Refund Policy
            </Text>
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}

        {/* Payment Button */}
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={loading || !agreedToPolicy}
          style={[
            styles.paymentButton,
            loading && styles.paymentButtonLoading,
            !agreedToPolicy && styles.paymentButtonDisabled
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
          )}
        </TouchableOpacity>

        {/* Back to Pricing */}
        <TouchableOpacity
          onPress={() => {
            // Check if we're in Auth stack or ProfileStack
            const rootState = navigation.getParent()?.getState();
            const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;
            
            if (isInAuthStack) {
              // In Auth stack - navigate back to SubscriptionScreen
              navigation.navigate('SubscriptionScreen' as any);
            } else {
              // In ProfileStack - navigate to Subscription
              navigation.navigate('Subscription' as any);
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back to Pricing</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0923',
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  gradientText: {
    color: '#6A5AE0',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(203, 213, 225, 1)',
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: spacing.lg,
  },
  proPlanCard: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: 2,
  },
  proBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    paddingTop: spacing.sm,
    borderRadius: 20,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  originalPrice: {
    fontSize: 18,
    color: 'rgba(203, 213, 225, 1)',
    textDecorationLine: 'line-through',
    marginBottom: spacing.xs,
  },
  discountedPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(203, 213, 225, 1)',
  },
  savingsText: {
    fontSize: 14,
    color: '#10b981',
    marginTop: spacing.xs,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    flex: 1,
  },
  discountCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.md,
  },
  tokenInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tokenInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 1)',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  tokenIcon: {
    marginRight: spacing.sm,
  },
  tokenInput: {
    flex: 1,
    color: 'rgba(203, 213, 225, 1)',
    fontSize: 14,
    paddingVertical: spacing.md,
  },
  applyButton: {
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#4b5563',
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeTokenButton: {
    backgroundColor: '#4b5563',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: spacing.md,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: 12,
    color: '#059669',
  },
  paymentCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  policyAgreement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4b5563',
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  policyText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    lineHeight: 20,
  },
  policyLink: {
    color: '#7B70FF',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  paymentButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentButtonLoading: {
    backgroundColor: '#4b5563',
  },
  paymentButtonDisabled: {
    backgroundColor: '#4b5563',
    opacity: 0.6,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(203, 213, 225, 1)',
    fontSize: 14,
  },
});

export default CheckoutScreen;
