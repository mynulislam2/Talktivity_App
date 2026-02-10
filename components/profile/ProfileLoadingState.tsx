/**
 * ProfileLoadingState Component (React Native)
 *
 * Premium loading state UI for the profile page with skeleton loaders.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { SkeletonProfile, SkeletonCard, SkeletonText } from '@/components/common/skeletons';

export function ProfileLoadingState() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header skeleton */}
      <SkeletonProfile />

      {/* Stats cards skeleton */}
      <View style={styles.section}>
        <SkeletonText lines={1} />
        <View style={styles.cardGrid}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>

      {/* Activity skeleton */}
      <View style={styles.section}>
        <SkeletonText lines={1} />
        <SkeletonCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardGrid: {
    marginTop: spacing.md,
  },
});
