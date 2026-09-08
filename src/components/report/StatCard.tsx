/**
 * StatCard Component (React Native)
 *
 * Canonical card component for report statistics, matching
 * talktivity_frontend/components/report/StatCard/StatCard.tsx
 */

import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@/theme/tokens';

export interface StatCardProps {
  title: string;
  value?: string;
  valueColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  title,
  value,
  valueColor,
  children,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {value ? (
        <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
          {value}
        </Text>
      ) : null}
      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: 4,
  },
  body: {
    marginTop: 10,
  },
});
