/**
 * ReportCTAButton
 *
 * Shared primary CTA for the report step cards: flat accent.primary fill,
 * 42px tall, radius 6 — never a pill. Centralizes the button so all five
 * report steps (and the error card) share one modern treatment instead of
 * each re-declaring its own gradient pill button.
 */
import React from 'react';
import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@/theme/tokens';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';

export interface ReportCTAButtonProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ReportCTAButton({ label, onPress, style }: ReportCTAButtonProps) {
  return (
    <FigmaPrimaryButton onPress={onPress} style={[s.button, style]}>
      <Text style={s.label}>{label}</Text>
    </FigmaPrimaryButton>
  );
}

const s = StyleSheet.create({
  button: {
    marginTop: 24,
    height: tokens.control.height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
