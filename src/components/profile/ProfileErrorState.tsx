/**
 * ProfileErrorState Component (React Native)
 *
 * Error state UI with retry button for the profile page.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { performGlobalLogout } from '@/utils/logoutClient';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface ProfileErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ProfileErrorState({ error, onRetry }: ProfileErrorStateProps) {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await performGlobalLogout((path: string) => {
      // Navigation handled by logout utility
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
});
