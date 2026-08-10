import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Group } from '@/types/community';

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
        <Text style={styles.title}>Your Groups</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {joinedGroupsList.length} joined
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your groups...</Text>
        </View>
      )}

      {!loading && joinedGroupsList.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={20} color="#C6C6C6" />
          </View>
          <Text style={styles.emptyText}>No groups joined yet</Text>
          <Text style={styles.emptySubtext}>
            Join some groups to start collaborating!
          </Text>
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
            <View style={styles.groupRow}>
              <View style={styles.groupInfo}>
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
                <View style={styles.groupNameInfo}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {group.name}
                  </Text>
                  <Text style={styles.groupMeta}>
                    {group.member_count || 0} members ·{' '}
                    {group.category || 'General'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.leaveButton,
                  leavingGroupId === group.id && styles.leaveButtonDisabled,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onLeaveGroup(group.id);
                }}
                disabled={leavingGroupId === group.id}
              >
                <Text style={styles.leaveButtonText}>
                  {leavingGroupId === group.id ? '...' : 'Leave'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#3D3E50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 19.2,
    color: '#FDFDFD',
  },
  countBadge: {
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3D3E50',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    color: '#C6C6C6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    color: '#C6C6C6',
    fontSize: 12,
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3D3E50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#FDFDFD',
    fontSize: 14,
  },
  emptySubtext: {
    color: '#C6C6C6',
    fontSize: 12,
  },
  groupCard: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3D3E50',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  coverImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  coverPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coverText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  groupNameInfo: {
    minWidth: 0,
    flex: 1,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16.8,
    color: '#FDFDFD',
  },
  groupMeta: {
    fontSize: 11,
    lineHeight: 15.4,
    color: '#C6C6C6',
  },
  leaveButton: {
    borderRadius: 6,
    backgroundColor: 'rgba(17,33,90,1)',
    borderWidth: 1,
    borderColor: '#3D3E50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexShrink: 0,
  },
  leaveButtonDisabled: {
    opacity: 0.6,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
