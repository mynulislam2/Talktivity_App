/**
 * Root App Layout
 *
 * Main entry point that sets up:
 * - Redux store and persistence
 * - Navigation
 * - LiveKit
 * - Status bar
 * - Premium animated splash screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { store, persistor } from '@/store';
import RootNavigator from '@/navigation/RootNavigator';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { AnimatedSplashScreen } from '@/components/common/AnimatedSplashScreen';

// Setup LiveKit for React Native
if (Platform.OS !== 'web') {
  try {
    require('@livekit/react-native').registerGlobals();
  } catch (err) {
    console.warn('LiveKit setup warning:', err);
  }
}

/**
 * Root Layout Component
 *
 * Wraps the entire app with Redux and Navigation providers
 * Shows custom animated splash screen while app initializes
 */
export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Setup status bar styling for dark theme
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#161823', true);
    }
  }, []);

  const handlePersistorReady = useCallback(() => {
    // Mark app as ready once Redux store is rehydrated
    setIsAppReady(true);
  }, []);

  const handleSplashFinish = useCallback(() => {
    // Hide splash screen after animation completes
    setShowSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={handlePersistorReady}>
          <ErrorBoundary>
            <RootNavigator />
          </ErrorBoundary>
          <StatusBar barStyle="light-content" backgroundColor="#161823" />
        </PersistGate>
      </Provider>

      {/* Premium animated splash screen */}
      {showSplash && (
        <AnimatedSplashScreen
          isAppReady={isAppReady}
          onFinish={handleSplashFinish}
        />
      )}
    </SafeAreaProvider>
  );
}
