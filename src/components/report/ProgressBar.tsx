/**
 * ProgressBar Component (React Native)
 *
 * Reusable progress bar matching the frontend's ProgressBar.
 * Translucent track with a filled bar.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface ProgressBarProps {
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = '#3b82f6' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%` as any, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 10,
    backgroundColor: '#374151',
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
  },
});
