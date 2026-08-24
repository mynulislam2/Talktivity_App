import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface GradientButtonProps {
  label?: string;
  children?: React.ReactNode;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const sizeValues = { small: 36, medium: 42, large: 48 };

const sizeTextStyles: Record<string, TextStyle> = {
  small: { fontSize: 14 },
  medium: { fontSize: 16 },
  large: { fontSize: 18 },
};

const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  children,
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
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
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
        start={start}
        end={end}
        style={[styles.gradient, { height: sizeValues[size] }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : children ? (
          <View style={styles.rowContent}>{children}</View>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.white,
    textAlign: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

export default GradientButton;
