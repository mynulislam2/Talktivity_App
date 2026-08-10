/**
 * DMConversationCard Component (React Native)
 *
 * Matches talktivity_frontend/components/community/DMConversationCard.tsx exactly.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DM } from '@/types/community';
import { CommunityAvatar } from './CommunityAvatar';

export interface DMConversationCardProps {
  dm: DM;
  otherUser: { id: number; name: string; avatar?: string };
  isOnline: boolean;
  hasUnread: boolean;
  lastSeen?: string;
}

function formatTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function DMConversationCard({
  dm,
  otherUser,
  isOnline,
  hasUnread,
}: DMConversationCardProps) {
  const navigation = useNavigation<any>();
  const dmAny = dm as any;
  const previewText =
    typeof dmAny.unread_count === 'number' && dmAny.unread_count > 1
      ? `${dmAny.unread_count} new messages`
      : dm.last_message || 'Start the conversation';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate('SocialStack', {
          screen: 'DMChatScreen',
          params: { dmId: dm.id },
        })
      }
      activeOpacity={0.7}
    >
      <CommunityAvatar
        name={otherUser.name}
        src={otherUser.avatar}
        size={54}
        isOnline={isOnline}
      />

      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {otherUser.name}
          </Text>
          {dm.last_message_time && (
            <Text style={styles.time}>{formatTime(dm.last_message_time)}</Text>
          )}
        </View>

        <View style={styles.previewRow}>
          <Text
            style={[styles.preview, hasUnread && styles.previewUnread]}
            numberOfLines={1}
          >
            {previewText}
          </Text>

          {isOnline && !hasUnread && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Live</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.unreadContainer}>
        {hasUnread ? (
          <View style={styles.unreadDot} />
        ) : (
          <View style={styles.emptyDot} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.02,
    color: '#fff',
  },
  time: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.66)',
    flexShrink: 0,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.52)',
  },
  previewUnread: {
    color: 'rgba(255,255,255,0.88)',
  },
  liveBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(61,255,154,0.3)',
    backgroundColor: 'rgba(61,255,154,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#7BFFB7',
  },
  unreadContainer: {
    minWidth: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5B93',
    shadowColor: 'rgba(255,91,147,0.72)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
