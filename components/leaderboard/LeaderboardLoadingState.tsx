/**
 * LeaderboardLoadingState Component (React Native)
 *
 * Premium loading state UI for the leaderboard page with skeleton loaders.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header } from '@/components/home';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { SkeletonLeaderboardItem } from '@/components/common/skeletons';

export function LeaderboardLoadingState() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Show 10 skeleton items */}
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonLeaderboardItem key={index} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
});
