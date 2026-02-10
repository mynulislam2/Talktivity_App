/**
 * DividerWithText Component (React Native)
 * 
 * A divider with "OR" text in the middle.
 * Matches Next.js DividerWithText implementation.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '@/styles/spacing';

export const DividerWithText: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>OR</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    marginHorizontal: spacing.md,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
});
