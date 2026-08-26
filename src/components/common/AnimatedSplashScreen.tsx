/**
 * AnimatedSplashScreen Component
 *
 * Hands over from the native Expo splash: same dark ground (#09090f), same
 * white talktivity lockup, so the two read as one screen rather than a flash.
 * `app.json` must keep the matching `expo-splash-screen` backgroundColor —
 * it was #ffffff, which showed a white flash before this view appeared.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  useWindowDimensions,
} from 'react-native';
import { tokens } from '../../theme/tokens';

/** Intrinsic aspect of talktivity-splash-logo.png (1013 x 281). */
const LOGO_ASPECT = 1013 / 281;

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
  const { width } = useWindowDimensions();
  // A fixed 120pt square left the lockup tiny on a large phone and crowded on
  // a small one. Size from the screen, clamped so it never touches the edges.
  const logoWidth = Math.min(Math.max(width * 0.58, 180), 260);

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
      <View testID="splash-solid" style={styles.solid}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image
            source={require('../../assets/images/talktivity-splash-logo.png')}
            style={{ width: logoWidth, height: logoWidth / LOGO_ASPECT }}
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
    backgroundColor: tokens.color.bg.screen,
  },
  content: { alignItems: 'center' },
});
