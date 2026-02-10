/**
 * Payment Success Screen - Confirmation after successful payment
 * Displays complete AamarPay transaction details matching Next.js implementation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch } from '@/store/hooks';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';
import { updateLifecycle, loadLifecycle } from '@/store/slices/lifecycleSlice';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface TransactionData {
  orderId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  date?: string;
  paymentMethod?: string;
  bankTxn?: string;
  storeAmount?: number;
  serviceCharge?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  plan?: string;
  subscriptionActivated?: boolean;
}

interface PaymentSuccessScreenProps {
  navigation: any;
  route: any;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Parse AamarPay response from route params
    const aamarpayResponse = route.params?.aamarpayResponse;
    const orderId = route.params?.orderId;

    if (aamarpayResponse) {
      const planType = aamarpayResponse.desc?.toLowerCase().includes('pro') ? 'Pro' : 'Basic';
      
      const data: TransactionData = {
        orderId: aamarpayResponse.mer_txnid || orderId,
        transactionId: aamarpayResponse.pg_txnid || aamarpayResponse.epw_txnid,
        amount: parseFloat(aamarpayResponse.amount) || parseFloat(aamarpayResponse.amount_original),
        currency: aamarpayResponse.currency || 'BDT',
        status: 'Success',
        date: aamarpayResponse.pay_time || new Date().toISOString(),
        paymentMethod: aamarpayResponse.card_type || 'AamarPay',
        bankTxn: aamarpayResponse.bank_txn,
        storeAmount: aamarpayResponse.store_amount,
        serviceCharge: aamarpayResponse.pg_service_charge_bdt,
        customerName: aamarpayResponse.cus_name,
        customerEmail: aamarpayResponse.cus_email,
        customerPhone: aamarpayResponse.cus_phone,
        plan: planType,
      };

      setTransactionData(data);

      // Refresh subscription status with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      const refreshSubscription = async () => {
        try {
          const result = await dispatch(loadSubscriptionStatus()).unwrap();
          const isActive = result?.active || false;

          if (isActive) {
            setTransactionData((prev) => ({
              ...prev!,
              subscriptionActivated: true,
              plan: result?.subscription?.plan_type || prev?.plan || '—',
            }));
            await dispatch(loadLifecycle());
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(refreshSubscription, 1000 * retryCount);
          } else {
            await dispatch(loadLifecycle());
          }
        } catch (error) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(refreshSubscription, 1000 * retryCount);
          } else {
            await dispatch(loadLifecycle());
          }
        }
      };

      refreshSubscription();
    }

    setLoading(false);
  }, [route.params, dispatch]);

  const handleStartLearning = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const rootState = navigation.getParent()?.getState();
      const isInAuthStack = rootState?.routes?.find((r: any) => r.name === 'Auth') !== undefined;

      if (isInAuthStack) {
        await dispatch(updateLifecycle({ upgrade_completed: true }));
        await dispatch(loadLifecycle());
      }
    } catch (error) {
      console.error('[PaymentSuccess] Error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!transactionData) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={50} color={colors.error || '#ef4444'} />
          <Text style={styles.errorTitle}>Payment Information Not Available</Text>
          <Text style={styles.errorMessage}>We couldn't load your transaction details. Please contact support.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.checkmarkCircle}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successMessage}>Thank you for your purchase. Your transaction has been completed.</Text>
      </View>

      {/* Subscription Confirmation Banner */}
      {transactionData.subscriptionActivated && (
        <View style={styles.confirmationBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.confirmationText}>✅ Your subscription has been activated! You now have full access to all plan features.</Text>
        </View>
      )}

      {/* Transaction Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        <DetailRow label="Order ID" value={transactionData.orderId || '—'} />
        {transactionData.transactionId && <DetailRow label="Transaction ID" value={transactionData.transactionId} />}
        <DetailRow label="Amount" value={`${transactionData.currency} ${Number(transactionData.amount || 0).toFixed(2)}`} />
        <DetailRow label="Status" value={transactionData.status || '—'} valueColor={colors.success} />
        <DetailRow label="Plan" value={transactionData.plan || '—'} />
        {transactionData.bankTxn && <DetailRow label="Bank Transaction" value={transactionData.bankTxn} />}
        {transactionData.serviceCharge && <DetailRow label="Gateway Charge" value={`${transactionData.currency} ${transactionData.serviceCharge}`} />}
        {transactionData.storeAmount && <DetailRow label="Net Amount" value={`${transactionData.currency} ${Number(transactionData.storeAmount).toFixed(2)}`} />}
        {transactionData.customerName && <DetailRow label="Customer" value={transactionData.customerName} />}
        {transactionData.customerEmail && <DetailRow label="Email" value={transactionData.customerEmail} />}
        <DetailRow label="Payment Method" value={transactionData.paymentMethod || '—'} />
        <DetailRow label="Date" value={formatDate(transactionData.date)} />
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.startButton} onPress={handleStartLearning} disabled={isRefreshing}>
        {isRefreshing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>Start Learning</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Profile' as any)}>
        <Text style={styles.secondaryButtonText}>View Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, valueColor }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value}</Text>
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
  successHeader: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmationBanner: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  confirmationText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
    lineHeight: 16,
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBackground,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PaymentSuccessScreen;
