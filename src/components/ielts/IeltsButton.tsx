import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface IeltsButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const IeltsButton: React.FC<IeltsButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const content = (
    <View style={styles.innerContent}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? '#8B5CF6' : '#FFFFFF'}
          style={{ marginRight: 6 }}
        />
      ) : icon && iconPosition === 'left' ? (
        <View style={styles.leftIcon}>{icon}</View>
      ) : null}

      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            variant === 'secondary' && styles.textSecondary,
            variant === 'ghost' && styles.textGhost,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}

      {!loading && icon && iconPosition === 'right' ? (
        <View style={styles.rightIcon}>{icon}</View>
      ) : null}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.baseButton, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={['#2C5BFF', '#7856FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.baseButton,
        variant === 'secondary' && styles.secondary,
        variant === 'success' && styles.success,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 16,
  },
  success: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
  },
  danger: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  textSecondary: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  textGhost: {
    color: '#C4B5FD',
    fontWeight: '600',
  },
});

export default IeltsButton;
