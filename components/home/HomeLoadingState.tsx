/**
 * HomeLoadingState Component (React Native)
 *
 * Premium loading state for home page with skeleton loaders.
 * Provides better UX than spinner.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { SkeletonCard, SkeletonText } from '@/components/common/skeletons';

export const HomeLoadingState: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Timeline skeleton */}
      <View style={styles.section}>
        <SkeletonText lines={1} />
        <View style={styles.cardGrid}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>

      {/* Daily lessons skeleton */}
      <View style={styles.section}>
        <SkeletonText lines={1} />
        <SkeletonCard />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  cardGrid: {
    marginTop: spacing.md,
  },
});
