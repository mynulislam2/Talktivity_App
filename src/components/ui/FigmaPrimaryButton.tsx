import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import GradientButton from '../common/GradientButton';

interface FigmaPrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FigmaPrimaryButton({
  children,
  onPress,
  disabled,
  loading,
  style,
}: FigmaPrimaryButtonProps) {
  return (
    <GradientButton
      onPress={onPress || (() => {})}
      disabled={disabled}
      loading={loading}
      style={[{ borderRadius: 6 }, style]}
      fullWidth={false}
      gradientColors={['#0e55ff', '#6a4bff', '#c55dfe'] as const}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {children}
    </GradientButton>
  );
}
