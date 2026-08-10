/**
 * CommunityLoadingState Component (React Native)
 *
 * Premium loading state UI for the community page with skeleton loaders.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { SkeletonListItem, SkeletonCard } from '@/components/common/skeletons';

export function CommunityLoadingState() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Groups section skeleton */}
      <View style={styles.section}>
        <SkeletonCard />
        <SkeletonCard />
      </View>

      {/* DM list skeleton */}
      <View style={styles.section}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonListItem key={index} />
        ))}
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
});
