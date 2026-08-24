/**
 * ProgressLoadingState Component (React Native)
 *
 * Loading state for progress page — matches frontend Loader.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

export function ProgressLoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tokens.color.accent.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    backgroundColor: 'transparent',
  },
});
