/**
 * GroupsView Component (React Native)
 * 
 * Main groups container for discovery view.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupFilters } from './GroupFilters';
import { GroupCard } from './GroupCard';
import type { Group } from '@/types/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface GroupsViewProps {
  groups: Group[];
  joinedGroups: number[];
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  loading: boolean;
  error: string | null;
  onJoin: (groupId: number) => void;
  joiningGroupId: number | null;
  onGroupClick?: (groupId: number) => void;
}

export function GroupsView({
  groups,
  joinedGroups,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showSearch,
  onToggleSearch,
  loading,
  error,
  onJoin,
  joiningGroupId,
  onGroupClick,
}: GroupsViewProps) {
  return (
    <View style={styles.container}>
      <GroupFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showSearch={showSearch}
        onToggleSearch={onToggleSearch}
      />

      <View style={styles.groupsContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Discovering amazing groups...</Text>
          </View>
        )}

        {!loading && !error && groups.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={40} color="#9ca3af" />
            </View>
            <Text style={styles.emptyText}>No groups found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}

        {!loading &&
          !error &&
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isJoined={joinedGroups.includes(group.id)}
              onJoin={onJoin}
              joiningGroupId={joiningGroupId}
              onGroupClick={onGroupClick}
            />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  groupsContainer: {
    gap: spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 14,
  },
});
