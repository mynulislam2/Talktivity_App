/**
 * FigmaPrimaryButton Component (React Native)
 *
 * Primary button matching the Figma design system.
 * Uses gradient colors matching CommunityTabs active state (#2C5BFF → #A45DFF)
 * with inset shadow glow effect.
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FigmaPrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function FigmaPrimaryButton({
  children,
  onPress,
  disabled,
  loading,
  style,
}: FigmaPrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.94}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
    >
      <LinearGradient
        colors={['#2C5BFF', '#A45DFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* <View style={styles.glowMagenta} /> */}
        {/* <View style={styles.glowDark} /> */}
        <View style={styles.content}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : children}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 42,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#b0c7ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6.34,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowMagenta: {
    position: 'absolute',
    top: 33.81,
    height: 21,
    width: 429,
    backgroundColor: 'rgba(187,45,255,0.5)',
    zIndex: 2,
    alignSelf: 'center',
  },
  glowDark: {
    position: 'absolute',
    top: 23.81,
    height: 22,
    width: '100%',
    backgroundColor: '#381d45',
    opacity: 0.9,
    zIndex: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 4,
  },
});
