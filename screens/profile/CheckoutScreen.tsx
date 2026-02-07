/**
 * Checkout Screen - Payment checkout flow
 * 
 * Handles:
 * - Discount token validation
 * - Price calculation with discount
 * - Terms & conditions agreement
 * - AamarPay payment initiation
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
  Switch,
  TextInput,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPayment } from '../../store/slices/paymentSlice';
import { discountTokenService, ValidateTokenResponse } from '../../service/DiscountTokenService';
import { SubscriptionPlan } from '../../service/SubscriptionService';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface Discount {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  discountedPrice: number;
}

interface CheckoutScreenProps {
  navigation: any;
  route: any;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { creating: paymentLoading, error: paymentError } = useAppSelector(
    (state) => state.payment
  );

  const plan: SubscriptionPlan = route.params?.plan;

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [discountToken, setDiscountToken] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      Alert.alert('Error', 'No plan selected');
      navigation.goBack();
    }
  }, [plan, navigation]);

  const handleValidateToken = async () => {
    if (!discountToken.trim()) {
      setTokenError('Please enter a discount token');
      return;
    }

    setValidatingToken(true);
    setTokenError(null);

    try {
      // Call real API to validate discount token
      const response = await discountTokenService.validateToken(
        discountToken.trim(),
        plan.plan_type
      );

      if (response.success && response.data) {
        setAppliedDiscount(response.data);
        setTokenError(null);
      } else {
        setTokenError(response.error || 'Invalid discount token');
        setAppliedDiscount(null);
      }
    } catch (err: any) {
      setTokenError(err.message || 'Failed to validate token');
      setAppliedDiscount(null);
    } finally {
      setValidatingToken(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountToken('');
    setAppliedDiscount(null);
    setTokenError(null);
  };

  const finalPrice = appliedDiscount
    ? appliedDiscount.discountedPrice
    : plan.price_usd;

  const handleCheckout = async () => {
    if (!agreedToTerms) {
      Alert.alert('Required', 'Please agree to the terms and conditions to continue');
      return;
    }

    // Dispatch payment creation thunk
    const result = await dispatch(
      createPayment({
        planId: plan.id,
        planType: plan.plan_type as 'Basic' | 'Pro',
      })
    );

    // Check if payment was created successfully
    if (result.payload && typeof result.payload === 'object' && 'paymentUrl' in result.payload) {
      // In a real app, you'd redirect to the payment URL (AamarPay)
      // For now, navigate to success screen
      Alert.alert('Success', 'Payment initiated. In production, you would be redirected to AamarPay.');
      navigation.replace('PaymentSuccess', {
        plan: plan.plan_type,
        amount: finalPrice.toString(),
      });
    } else if (result.payload) {
      // Error was returned
      Alert.alert('Payment Error', result.payload as string);
    }
  };

  if (!plan) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Order Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Plan</Text>
          <Text style={styles.summaryValue}>{plan.name || plan.plan_type}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>12 weeks</Text>
        </View>

        <View style={[styles.summaryItem, styles.priceItem]}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>৳{plan.price_usd.toLocaleString()}</Text>
        </View>

        {appliedDiscount && (
          <>
            <View style={[styles.summaryItem, styles.discountItem]}>
              <Text style={styles.discountLabel}>
                Discount ({appliedDiscount.discountPercent}%)
              </Text>
              <Text style={styles.discountValue}>
                -৳{appliedDiscount.discountAmount.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.summaryItem, styles.finalPriceItem]}>
              <Text style={styles.finalPriceLabel}>Total</Text>
              <Text style={styles.finalPrice}>
                ৳{appliedDiscount.discountedPrice.toLocaleString()}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Discount Token Section */}
      <View style={styles.discountSection}>
        <Text style={styles.sectionTitle}>Discount Code</Text>

        {!appliedDiscount ? (
          <>
            <View style={styles.tokenInputContainer}>
              <TextInput
                style={styles.tokenInput}
                placeholder="Enter discount code"
                placeholderTextColor="#999"
                value={discountToken}
                onChangeText={setDiscountToken}
                editable={!validatingToken}
              />
              <TouchableOpacity
                style={[styles.validateButton, validatingToken && styles.validateButtonDisabled]}
                onPress={handleValidateToken}
                disabled={validatingToken}
              >
                {validatingToken ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.validateButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            {tokenError && (
              <Text style={styles.tokenError}>{tokenError}</Text>
            )}
          </>
        ) : (
          <View style={styles.appliedDiscountBox}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <View style={styles.appliedDiscountText}>
              <Text style={styles.appliedDiscountLabel}>
                Applied: {appliedDiscount.discountPercent}% off
              </Text>
              <Text style={styles.appliedDiscountValue}>
                Saving: ৳{appliedDiscount.discountAmount.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemoveDiscount}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Terms & Conditions */}
      <View style={styles.termsSection}>
        <View style={styles.termsCheckbox}>
          <Switch
            value={agreedToTerms}
            onValueChange={setAgreedToTerms}
            trackColor={{ false: '#e0e0e0', true: colors.primaryLight }}
            thumbColor={agreedToTerms ? colors.primary : '#ccc'}
          />
          <Text style={styles.termsText}>
            I agree to the Privacy Policy and Terms of Service
          </Text>
        </View>

        <TouchableOpacity
          style={styles.policyLink}
          onPress={() => navigation.navigate('Terms')}
        >
          <Text style={styles.policyLinkText}>View Terms →</Text>
        </TouchableOpacity>
      </View>

      {(tokenError || paymentError) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color={colors.error || '#ef4444'} />
          <Text style={styles.errorText}>{tokenError || paymentError}</Text>
        </View>
      )}

      {/* Checkout Button */}
      <TouchableOpacity
        style={[styles.checkoutButton, (!agreedToTerms || paymentLoading) && styles.checkoutButtonDisabled]}
        onPress={handleCheckout}
        disabled={paymentLoading || !agreedToTerms}
      >
        {paymentLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.checkoutButtonText}>Pay ৳{finalPrice.toLocaleString()}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.secureNote}>
        🔒 Your payment is secure and encrypted
      </Text>
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
  summaryCard: {
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
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  priceItem: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  discountItem: {
    paddingVertical: spacing.md,
  },
  discountLabel: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '700',
  },
  finalPriceItem: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#10b981',
  },
  finalPriceLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '700',
  },
  finalPrice: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
  },
  discountSection: {
    gap: spacing.md,
  },
  tokenInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  tokenInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: '#fff',
  },
  validateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  validateButtonDisabled: {
    opacity: 0.6,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tokenError: {
    fontSize: 12,
    color: colors.error || '#ef4444',
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  appliedDiscountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  appliedDiscountText: {
    flex: 1,
  },
  appliedDiscountLabel: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  appliedDiscountValue: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  termsSection: {
    gap: spacing.md,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
  policyLink: {
    paddingHorizontal: spacing.lg,
  },
  policyLinkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error || '#991b1b',
    fontWeight: '500',
    lineHeight: 18,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secureNote: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default CheckoutScreen;
