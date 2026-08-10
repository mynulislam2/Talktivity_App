/**
 * ProgressLoadingState Component (React Native)
 *
 * Loading state for progress page — matches frontend Loader.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export function ProgressLoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6A5AE0" />
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
