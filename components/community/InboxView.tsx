/**
 * InboxView Component (React Native)
 * 
 * Main inbox container showing DMs and joined groups.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DMList } from './DMList';
import { JoinedGroupsSection } from './JoinedGroupsSection';
import type { DM, Group } from '@/types/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface InboxViewProps {
  dms: DM[];
  groups: Group[];
  joinedGroups: number[];
  dmLoading: boolean;
  groupsLoading: boolean;
  onlineMap: Record<string, { online: boolean; lastSeen?: string }>;
  hasUnreadDM: (dm: DM) => boolean;
  getOtherUser: (dm: DM) => { id: number; name: string; avatar?: string };
  onDMClick?: (dmId: number) => void;
  onGroupClick: (groupId: number) => void;
  onLeaveGroup: (groupId: number) => void;
  leavingGroupId: number | null;
}

export function InboxView({
  dms,
  groups,
  joinedGroups,
  dmLoading,
  groupsLoading,
  onlineMap,
  hasUnreadDM,
  getOtherUser,
  onDMClick,
  onGroupClick,
  onLeaveGroup,
  leavingGroupId,
}: InboxViewProps) {
  return (
    <View style={styles.container}>
      {/* Direct Messages Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble" size={16} color="#fff" />
          </View>
          <Text style={styles.sectionTitle}>Direct Messages</Text>
          <View style={styles.spacer} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dms.length} conversations</Text>
          </View>
        </View>

        <DMList
          dms={dms}
          loading={dmLoading}
          onlineMap={onlineMap}
          hasUnreadDM={hasUnreadDM}
          getOtherUser={getOtherUser}
          onDMClick={onDMClick}
        />
      </View>

      {/* Joined Groups Section */}
      <JoinedGroupsSection
        groups={groups}
        joinedGroups={joinedGroups}
        loading={groupsLoading}
        onGroupClick={onGroupClick}
        onLeaveGroup={onLeaveGroup}
        leavingGroupId={leavingGroupId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  spacer: {
    flex: 1,
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
});
