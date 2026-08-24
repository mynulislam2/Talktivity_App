/**
 * CEFRLevelBadge Component (React Native)
 *
 * Displays a CEFR level badge — matches frontend design.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CEFRLevelBadgeProps {
  level: string;
  size?: 'sm' | 'md';
}

export function CEFRLevelBadge({ level, size = 'md' }: CEFRLevelBadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <Text style={[styles.text, isSmall && styles.textSmall]}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(124, 90, 254, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#c084fc',
  },
  textSmall: {
    fontSize: 11,
    fontFamily: 'Poppins',
  },
});
