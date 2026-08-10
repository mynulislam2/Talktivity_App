/**
 * SubscriptionHeader Component (React Native)
 *
 * Header component for upgrade/free trial pages.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface SubscriptionHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function SubscriptionHeader({
  title,
  subtitle,
  showBackButton = false,
  onBack,
}: SubscriptionHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={20}
            color="rgba(203, 213, 225, 1)"
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: 'rgba(203, 213, 225, 1)',
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    textAlign: 'center',
  },
});
