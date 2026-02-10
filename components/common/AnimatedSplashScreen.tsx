/**
 * AnimatedSplashScreen Component
 *
 * Premium splash screen with smooth logo animation and fade transitions.
 * Displays while app is initializing (loading fonts, checking auth, etc.)
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
  isAppReady: boolean;
  onFinish: () => void;
}

// Keep native splash screen visible while we prepare our custom splash
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  isAppReady,
  onFinish,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const containerFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start entrance animation immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      // Hide native splash screen
      SplashScreen.hideAsync().catch(() => {
        /* might be called multiple times, ignore errors */
      });

      // Wait a moment, then fade out custom splash
      const timer = setTimeout(() => {
        Animated.timing(containerFade, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 500); // Show splash for at least 500ms after app is ready

      return () => clearTimeout(timer);
    }
  }, [isAppReady, containerFade, onFinish]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerFade,
        }
      ]}
      pointerEvents={isAppReady ? 'none' : 'auto'}
    >
      <LinearGradient
        colors={['#0A0923', '#161823', '#1a1a3e', '#0A0923']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo with animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Subtle glow effect behind logo */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            },
          ]}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 240,
    height: 240,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6A5AE0',
    shadowColor: '#7B70FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
    elevation: 20,
    zIndex: 1,
  },
});
