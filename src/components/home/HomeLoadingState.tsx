import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

export const HomeLoadingState: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tokens.color.accent.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
