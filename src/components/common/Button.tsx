import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<string, ViewStyle> = {
  primary: {
    backgroundColor: colors.brand.buttonPrimary,
    shadowColor: colors.brand.buttonGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.brand.inputBg,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  danger: {
    backgroundColor: colors.error,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const variantTextStyles: Record<string, TextStyle> = {
  primary: { color: colors.white },
  secondary: { color: colors.text.primary },
  outline: { color: colors.text.primary },
  danger: { color: colors.white },
  ghost: { color: colors.text.primary },
};

const sizeStyles: Record<string, ViewStyle> = {
  small: { height: 36, paddingHorizontal: spacing.lg },
  medium: { height: 42, paddingHorizontal: spacing.xl },
  large: { height: 48, paddingHorizontal: spacing['2xl'] },
};

const sizeTextStyles: Record<string, TextStyle> = {
  small: { fontSize: 13, fontFamily: 'Poppins' },
  medium: { fontSize: 15, fontFamily: 'Poppins' },
  large: { fontSize: 17, fontFamily: 'Poppins' },
};

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.text.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantTextStyles[variant],
            sizeTextStyles[size],
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  disabledText: {
    color: colors.text.disabled,
  },
});

export default Button;
