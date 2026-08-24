/* eslint-disable prettier/prettier */
/**
 * Auth Payment WebView Screen
 *
 * Handles payment gateway flow in WebView specifically for initial purchase.
 * Resets navigation to Main stack on success.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { useAppDispatch } from '@/store/hooks';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';

type PaymentResult = 'success' | 'failure' | 'cancel' | null;

const AuthPaymentWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentUrl } = route.params as { paymentUrl: string };
  const dispatch = useAppDispatch();

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const onNavigationStateChange = useCallback(
    (navState: any) => {
      const url = navState.url || '';
      const lowerUrl = url.toLowerCase();

      let targetScreen:
        | 'PaymentSuccess'
        | 'PaymentFailure'
        | 'PaymentCancel'
        | null = null;

      if (lowerUrl.includes('mobile-success')) targetScreen = 'PaymentSuccess';
      else if (lowerUrl.includes('mobile-fail'))
        targetScreen = 'PaymentFailure';
      else if (lowerUrl.includes('mobile-cancel'))
        targetScreen = 'PaymentCancel';

      if (targetScreen) {
        setIsProcessing(true);
        webViewRef.current?.stopLoading();

        // If payment was successful, refresh subscription status immediately
        // (backend callback might have processed, or we'll poll for it)
        if (targetScreen === 'PaymentSuccess') {
          console.log('[AuthPaymentWebView] Payment successful — refreshing subscription status');
          dispatch(loadSubscriptionStatus());
          
          // Also poll subscription status a few times in case backend is still processing
          setTimeout(() => dispatch(loadSubscriptionStatus()), 2000);
          setTimeout(() => dispatch(loadSubscriptionStatus()), 5000);
          setTimeout(() => dispatch(loadSubscriptionStatus()), 10000);
        }

        // Reset stack to remove WebView from history and set proper breadcrumbs
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'SubscriptionScreen' }, { name: targetScreen }],
          })
        );
      }
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.container}>
        {(loading || isProcessing) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            {isProcessing && (
              <Text style={styles.processingText}>Processing result...</Text>
            )}
          </View>
        )}
        {!isProcessing && (
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={onNavigationStateChange}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050110' },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050110',
    zIndex: 1,
  },
  processingText: {
    color: '#fff',
    marginTop: spacing.md,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
  },
});

export default AuthPaymentWebViewScreen;
