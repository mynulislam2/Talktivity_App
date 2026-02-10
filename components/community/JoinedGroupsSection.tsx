/**
 * JoinedGroupsSection Component (React Native)
 * 
 * Section showing user's joined groups.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Group } from '@/types/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface JoinedGroupsSectionProps {
  groups: Group[];
  joinedGroups: number[];
  loading: boolean;
  onGroupClick: (groupId: number) => void;
  onLeaveGroup: (groupId: number) => void;
  leavingGroupId: number | null;
}

export function JoinedGroupsSection({
  groups,
  joinedGroups,
  loading,
  onGroupClick,
  onLeaveGroup,
  leavingGroupId,
}: JoinedGroupsSectionProps) {
  const joinedGroupsList = groups
    .filter((group) => joinedGroups.includes(group.id))
    .reduce(
      (acc, group) => {
        const key = (group.name || '').toLowerCase().trim();
        if (!acc.seenNames.has(key)) {
          acc.seenNames.add(key);
          acc.list.push(group);
        }
        return acc;
      },
      { list: [] as Group[], seenNames: new Set<string>() }
    ).list;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
          </View>
          <Text style={styles.title}>Your Groups</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{joinedGroupsList.length} joined</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your groups...</Text>
        </View>
      )}

      {!loading && joinedGroupsList.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={32} color="#9ca3af" />
          </View>
          <Text style={styles.emptyText}>No groups joined yet</Text>
          <Text style={styles.emptySubtext}>Join some groups to start collaborating!</Text>
        </View>
      )}

      {!loading &&
        joinedGroupsList.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupCard}
            onPress={() => onGroupClick(group.id)}
            activeOpacity={0.7}
          >
            <View style={styles.groupHeader}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName} numberOfLines={1}>
                  {group.name}
                </Text>
                <Text style={styles.groupCategory}>{group.category || 'General'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.leaveButton, leavingGroupId === group.id && styles.leaveButtonDisabled]}
                onPress={(e) => {
                  e.stopPropagation();
                  onLeaveGroup(group.id);
                }}
                disabled={leavingGroupId === group.id}
              >
                <Text style={styles.leaveButtonText}>
                  {leavingGroupId === group.id ? 'Leaving...' : 'Leave'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.groupFooter}>
              {group.cover_image ? (
                <Image
                  source={{ uri: group.cover_image }}
                  style={styles.coverImage}
                />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Text style={styles.coverText}>
                    {(group.name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.memberCount}>{group.member_count || 0} members</Text>
            </View>
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 12,
  },
  groupCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  groupInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  groupCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  leaveButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  leaveButtonDisabled: {
    opacity: 0.6,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coverImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  coverPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  coverText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
