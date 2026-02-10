/**
 * DMList Component (React Native)
 * 
 * List of DM conversations.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DMConversationCard } from './DMConversationCard';
import type { DM } from '@/types/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface DMListProps {
  dms: DM[];
  loading: boolean;
  onlineMap: Record<string, { online: boolean; lastSeen?: string }>;
  hasUnreadDM: (dm: DM) => boolean;
  getOtherUser: (dm: DM) => { id: number; name: string; avatar?: string };
  onDMClick?: (dmId: number) => void;
}

export function DMList({
  dms,
  loading,
  onlineMap,
  hasUnreadDM,
  getOtherUser,
  onDMClick,
}: DMListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (dms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="chatbubble-outline" size={32} color="#9ca3af" />
        </View>
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>Start chatting with other learners!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dms.map((dm) => {
        const otherUser = getOtherUser(dm);
        const onlineStatus = onlineMap[otherUser.id];
        return (
          <DMConversationCard
            key={dm.id}
            dm={dm}
            otherUser={otherUser}
            isOnline={onlineStatus?.online || false}
            hasUnread={hasUnreadDM(dm)}
            lastSeen={onlineStatus?.lastSeen}
            onPress={() => onDMClick?.(dm.id)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
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
});
