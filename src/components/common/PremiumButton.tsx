/**
 * Gradient Button Component
 *
 * Universal gradient button matching Next.js button styles exactly.
 * Supports all button variants used in Next.js:
 * - Primary: Purple to Blue gradient (from-purple-600 to-blue-500)
 * - Secondary: Blue to Purple gradient (from-blue-500 to-purple-600)
 * - Full width or auto width
 * - Disabled state
 * - Loading state
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  // Gradient colors matching Next.js exactly
  const gradientColors: readonly [string, string] =
    variant === 'primary' ? ['#7B70FF', '#6A5AE0'] : ['#3b82f6', '#a855f7'];

  // Size styles matching Next.js
  const sizeStyles = {
    sm: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 16,
    },
    lg: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
          disabled && styles.gradientDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text
            style={[styles.text, { fontSize: currentSize.fontSize }, textStyle]}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 12, // rounded-xl in Next.js
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow matching Next.js shadow-lg
    shadowColor: '#7B70FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: '#fff',
    fontWeight: '600', fontFamily: 'Poppins-SemiBold', // font-semibold
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  gradientDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
});
