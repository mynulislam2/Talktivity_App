import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupFilters } from './GroupFilters';
import { GroupCard } from './GroupCard';
import type { Group } from '@/types/community';

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
            <ActivityIndicator size="small" color="rgba(255,255,255,0.62)" />
            <Text style={styles.loadingText}>
              Discovering amazing groups...
            </Text>
          </View>
        )}

        {!loading && !error && groups.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people" size={24} color="#C6C6C6" />
            </View>
            <Text style={styles.emptyText}>No groups found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
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
    gap: 24,
    paddingBottom: 24,
  },
  groupsContainer: {
    gap: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    marginLeft: 8,
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#FDFDFD',
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
  },
  emptySubtext: {
    color: '#C6C6C6',
    fontSize: 12,
  },
});
