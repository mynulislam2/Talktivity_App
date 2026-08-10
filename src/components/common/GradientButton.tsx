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
  gradientColors?: readonly [string, string, ...string[]];
}

const sizeValues = { small: 36, medium: 42, large: 48 };

const sizeTextStyles: Record<string, TextStyle> = {
  small: { fontSize: 14 },
  medium: { fontSize: 16 },
  large: { fontSize: 18 },
};

const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true,
  gradientColors = [
    colors.brand.gradientStart,
    colors.brand.gradientMid,
    colors.brand.gradientEnd,
  ] as const,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { height: sizeValues[size] },
        fullWidth ? styles.fullWidth : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { height: sizeValues[size] }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={[styles.text, sizeTextStyles[size], textStyle]}>
            {label}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: colors.brand.buttonGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});

export default GradientButton;
