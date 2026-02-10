/**
 * DMConversationCard Component (React Native)
 * 
 * Individual DM conversation card with online status.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { DM } from '@/types/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface DMConversationCardProps {
  dm: DM;
  otherUser: { id: number; name: string; avatar?: string };
  isOnline: boolean;
  hasUnread: boolean;
  lastSeen?: string;
  onPress?: () => void;
}

export function DMConversationCard({
  dm,
  otherUser,
  isOnline,
  hasUnread,
  lastSeen,
  onPress,
}: DMConversationCardProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Fallback to default navigation
      (navigation as any).navigate('SocialStack', {
        screen: 'DMChatScreen',
        params: { dmId: dm.id },
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {otherUser.avatar ? (
            <Image
              source={{ uri: otherUser.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(otherUser.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser.name}
            </Text>
            {!isOnline && lastSeen && (
              <Text style={styles.lastSeen}>
                {new Date(lastSeen).toLocaleDateString()}
              </Text>
            )}
          </View>
          <Text style={styles.message} numberOfLines={1}>
            {dm.last_message || 'No messages yet'}
          </Text>
        </View>
      </View>
      {hasUnread && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0a0923',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  lastSeen: {
    fontSize: 12,
    color: '#9ca3af',
  },
  message: {
    fontSize: 14,
    color: '#9ca3af',
    maxWidth: 200,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
});
