/**
 * Root App Layout
 * 
 * Main entry point that sets up:
 * - Redux store and persistence
 * - Navigation
 * - LiveKit
 * - Status bar
 */

import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { store, persistor } from '../store';
import RootNavigator from '../navigation/RootNavigator';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Setup LiveKit for React Native
if (Platform.OS !== 'web') {
  try {
    require('@livekit/react-native').registerGlobals();
  } catch (err) {
    console.warn('LiveKit setup warning:', err);
  }
}

/**
 * Loading screen shown while Redux state is rehydrating
 */
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

/**
 * Root Layout Component
 * 
 * Wraps the entire app with Redux and Navigation providers
 */
export default function RootLayout() {
  useEffect(() => {
    // Setup status bar styling
    StatusBar.setBarStyle('dark-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#ffffff', true);
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      </PersistGate>
    </Provider>
  );
}
