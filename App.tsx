/**
 * App Entry Point
 *
 * Main entry point that sets up:
 * - Redux store and persistence
 * - Navigation (React Navigation)
 * - Status bar
 * - Premium animated splash screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  StatusBar,
  Platform,
  View,
  StyleSheet,
  AppRegistry,
} from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { appNavigationTheme } from './src/theme/navigationTheme';
import { applyGlobalFontDefaults } from './src/theme/fonts';

import { store, persistor } from '@/store';
import { AlertProvider } from '@/contexts/AlertContext';
import RootNavigator from '@/navigation/RootNavigator';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { AnimatedSplashScreen } from '@/components/common/AnimatedSplashScreen';

// Keep native Expo splash screen visible while JS loads
SplashScreen.preventAutoHideAsync().catch(() => {});

// Default every Text/TextInput to Poppins so unstyled nodes still render in
// the loaded font. Individual `style` props still win. See fonts.ts for why
// this works under React 19. Nothing renders until `isReady` below, so it's
// safe to set this once here rather than after fonts resolve.
applyGlobalFontDefaults();

// Setup LiveKit for React Native
if (Platform.OS !== 'web') {
  try {
    require('@livekit/react-native').registerGlobals();
  } catch (err) {
    console.warn('LiveKit setup warning:', err);
  }
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fontsError, setFontsError] = useState(false);

  const [fontsLoaded, fontsErrorObj] = useFonts({
    'Poppins': require('./src/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Light': require('./src/assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('./src/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./src/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
    'Urbanist-Variable': require('./src/assets/fonts/Urbanist-Variable.ttf'),
    'Urbanist-Italic-Variable': require('./src/assets/fonts/Urbanist-Italic-Variable.ttf'),
  });

  useEffect(() => {
    if (fontsErrorObj) {
      console.warn('Font loading error:', fontsErrorObj);
      setFontsError(true);
    }
  }, [fontsErrorObj]);

  const handlePersistorReady = useCallback(() => {
    setIsAppReady(true);
  }, []);

  const isReady = isAppReady && (fontsLoaded || fontsError);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  // Setup status bar styling for dark theme
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#09090f', true);
    }
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Force ready if fonts fail or delay after 2s timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded && !fontsError) {
        console.warn('Font loading timed out — forcing app to render');
        setFontsError(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontsError]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer theme={appNavigationTheme}>
          <Provider store={store}>
            <PersistGate
              loading={null}
              persistor={persistor}
              onBeforeLift={handlePersistorReady}
            >
              <ErrorBoundary>
                <AlertProvider>
                  {isReady ? (
                    <RootNavigator />
                  ) : (
                    <View style={styles.loadingFallback} />
                  )}
                </AlertProvider>
              </ErrorBoundary>
              <StatusBar barStyle="light-content" backgroundColor="#09090f" />
            </PersistGate>
          </Provider>
        </NavigationContainer>

        {showSplash && (
          <AnimatedSplashScreen
            isAppReady={isReady}
            onFinish={handleSplashFinish}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingFallback: {
    flex: 1,
    backgroundColor: '#09090f',
  },
});

// Register the app with React Native — Android looks for "main" component
AppRegistry.registerComponent('main', () => App);

// On web, registering is not enough: react-native-web also needs the app to be
// RUN against a DOM node, otherwise the component is registered but never
// mounted and #root stays empty. Native platforms mount via AppRegistry
// themselves, so this branch is web-only and does not affect iOS or Android.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const rootTag = document.getElementById('root') ?? document.getElementById('main');
  if (rootTag) {
    AppRegistry.runApplication('main', { rootTag });
  }
}
