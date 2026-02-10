/**
 * LeaderboardShell Component (React Native)
 * 
 * Shell layout for leaderboard page with Header and content slots.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '@/components/home';
import type { LeaderboardType } from '@/types/leaderboard';
import { spacing } from '@/styles/spacing';

export interface LeaderboardShellProps {
  currentType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
  userPositionSlot: React.ReactNode;
  listSlot: React.ReactNode;
}

export function LeaderboardShell({
  currentType,
  onTypeChange,
  userPositionSlot,
  listSlot,
}: LeaderboardShellProps) {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Global Leaderboard</Text>
          <Text style={styles.subtitle}>See where you stand among other learners.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <View
              style={[
                styles.tab,
                currentType === 'weekly' && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  currentType === 'weekly' && styles.tabTextActive,
                ]}
              >
                This Week
              </Text>
            </View>
            <View
              style={[
                styles.tab,
                currentType === 'overall' && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  currentType === 'overall' && styles.tabTextActive,
                ]}
              >
                All Time
              </Text>
            </View>
          </View>
        </View>

        {userPositionSlot}
        {listSlot}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050110',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  headerSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabsContainer: {
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#1f2937',
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6A5AE0',
    marginBottom: -spacing.sm - 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#fff',
  },
});
