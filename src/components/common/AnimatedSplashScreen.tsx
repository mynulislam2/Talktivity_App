/**
 * AnimatedSplashScreen Component
 *
 * Clean splash screen with solid HomeScreen background and centered logo image.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';

interface AnimatedSplashScreenProps {
  isAppReady: boolean;
  onFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  isAppReady,
  onFinish,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const containerFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isAppReady) {
      timer = setTimeout(() => {
        Animated.timing(containerFade, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 200);
    }
    // Safety fallback: ensure splash screen always hides after max 2.5 seconds
    const safetyTimer = setTimeout(() => {
      Animated.timing(containerFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, [isAppReady, containerFade, onFinish]);

  return (
    <Animated.View
      style={[styles.container, { opacity: containerFade }]}
      pointerEvents={isAppReady ? 'none' : 'auto'}
    >
      <View style={styles.solid}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image
            source={require('../../assets/images/talktivity-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  solid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090f',
  },
  content: { alignItems: 'center' },
  logo: {
    width: 120,
    height: 120,
  },
});
