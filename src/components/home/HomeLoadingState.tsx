import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const HomeLoadingState: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6A5AE0" />
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
