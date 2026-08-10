import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DMConversationCard } from './DMConversationCard';
import type { DM } from '@/types/community';

export interface DMListProps {
  dms: DM[];
  loading: boolean;
  onlineMap: Record<string, { online: boolean; lastSeen?: string }>;
  hasUnreadDM: (dm: DM) => boolean;
  getOtherUser: (dm: DM) => { id: number; name: string; avatar?: string };
}

export function DMList({
  dms,
  loading,
  onlineMap,
  hasUnreadDM,
  getOtherUser,
}: DMListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (dms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="chatbubble-outline"
            size={32}
            color="rgba(255,255,255,0.6)"
          />
        </View>
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>
          Start chatting with other learners!
        </Text>
      </View>
    );
  }

  return (
    <View>
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
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#FDFDFD',
    fontSize: 14,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#C6C6C6',
    fontSize: 12,
  },
});
