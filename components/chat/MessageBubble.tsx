import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageTimestamp } from './MessageTimestamp';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface MessageBubbleProps {
  id: string | number;
  content: string;
  timestamp: string;
  isOwn: boolean;
  authorName: string;
  authorAvatar?: string | null;
  pinned?: boolean;
  onOpenMenu?: (id: string | number) => void;
  onAvatarClick?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  content,
  timestamp,
  isOwn,
  authorName,
  authorAvatar,
  pinned,
  onOpenMenu,
  onAvatarClick,
}) => {
  const displayName = isOwn ? 'You' : authorName;
  const avatarInitial = (authorName || '?').charAt(0).toUpperCase();

  return (
    <View style={[styles.container, isOwn ? styles.containerOwn : styles.containerOther]}>
      {!isOwn && (
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarClick}
          activeOpacity={0.7}
        >
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
        onPress={() => onOpenMenu?.(id)}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <Text style={styles.authorName}>{displayName}</Text>
          <View style={styles.headerRight}>
            {pinned && (
              <Ionicons name="pin" size={12} color="#fbbf24" style={styles.pinIcon} />
            )}
            {onOpenMenu && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onOpenMenu(id);
                }}
                style={styles.menuButton}
              >
                <Ionicons name="ellipsis-vertical" size={12} color={isOwn ? 'rgba(255,255,255,0.7)' : colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}>
          {content}
        </Text>

        <MessageTimestamp value={timestamp} style={styles.timestamp} />
      </TouchableOpacity>

      {isOwn && (
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarClick}
          activeOpacity={0.7}
        >
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleOwn: {
    backgroundColor: '#4f46e5', // Blue gradient start
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)', // Gray gradient
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pinIcon: {
    marginRight: spacing.xs,
  },
  menuButton: {
    padding: spacing.xs,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
  contentOwn: {
    color: '#fff',
  },
  contentOther: {
    color: '#fff',
  },
  timestamp: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
});
