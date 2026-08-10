/* eslint-disable prettier/prettier */
/**
 * Profile Payment WebView Screen
 *
 * Handles payment gateway flow in WebView specifically for upgrades from dashboard.
 * Navigates back to Profile on success.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
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

const ProfilePaymentWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentUrl } = route.params as { paymentUrl: string };

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

        // Use navigate/replace to the static result screen in the same Profile stack
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'ProfileScreen' }, { name: targetScreen }],
          })
        );
      }
    },
    [navigation]
  );

  return (
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
    fontWeight: '500',
  },
});

export default ProfilePaymentWebViewScreen;
