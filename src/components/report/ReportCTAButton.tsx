/**
 * ReportCTAButton
 *
 * Shared primary CTA for the report step cards: flat accent.primary fill,
 * 42px tall, radius 6 — never a pill. Centralizes the button so all five
 * report steps (and the error card) share one modern treatment instead of
 * each re-declaring its own gradient pill button.
 */
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@/theme/tokens';

export interface ReportCTAButtonProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ReportCTAButton({ label, onPress, style }: ReportCTAButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[s.button, style]}>
      <Text style={s.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    marginTop: 24,
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: tokens.color.text.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
