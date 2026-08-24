import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface ChatLoadingProps {
  message?: string;
}

export const ChatLoading: React.FC<ChatLoadingProps> = ({
  message = 'Loading conversation...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.spinner}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  message: {
    color: colors.text.secondary,
    fontSize: 16,
    fontFamily: 'Poppins',
  },
});
