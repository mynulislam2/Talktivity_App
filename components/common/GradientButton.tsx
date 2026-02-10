/**
 * GradientButton Component
 *
 * Universal gradient button matching Next.js button styles exactly.
 * - Primary: Purple gradient (#7B70FF to #6A5AE0)
 * - Rounded corners (rounded-xl / 12px)
 * - Shadow effects
 * - Full width or auto
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradientColors?: string[];
}

const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true,
  gradientColors = [colors.primaryLight, colors.primary], // #7B70FF to #6A5AE0
}) => {
  const buttonStyle = [
    styles.button,
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textColorStyle = [
    styles.text,
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={textColorStyle}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12, // rounded-xl matching Next.js
    overflow: 'hidden',
    // Shadow matching Next.js shadow-lg
    shadowColor: '#7B70FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  // Sizes
  smallButton: {
    borderRadius: 12,
  },
  mediumButton: {
    borderRadius: 12,
  },
  largeButton: {
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontWeight: '600', // font-semibold
    color: colors.white,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default GradientButton;
