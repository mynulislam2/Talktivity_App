import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageTimestamp } from './MessageTimestamp';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface PinnedMessageBannerProps {
  message: {
    id: string | number;
    content: string;
    created_at?: string;
    timestamp?: string;
    full_name?: string;
    sender?: string;
  };
  onGoToMessage?: (id: string | number) => void;
  onUnpin?: () => void;
}

export const PinnedMessageBanner: React.FC<PinnedMessageBannerProps> = ({
  message,
  onGoToMessage,
  onUnpin,
}) => {
  const ts = String(message.timestamp || message.created_at || '');
  const senderName = message.full_name || message.sender || 'User';

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.iconContainer}>
          <Ionicons name="pin" size={16} color="#fff" />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.label}>📌 Pinned message</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {message.content}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.senderName}>{senderName}</Text>
            {ts ? <MessageTimestamp value={ts} style={styles.timestamp} /> : null}
            {onGoToMessage && (
              <TouchableOpacity onPress={() => onGoToMessage(message.id)}>
                <Text style={styles.linkText}>Go to message</Text>
              </TouchableOpacity>
            )}
            {onUnpin && (
              <TouchableOpacity onPress={onUnpin}>
                <Text style={styles.unpinText}>Unpin</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  banner: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 179, 8, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  senderName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timestamp: {
    fontSize: 12,
  },
  linkText: {
    fontSize: 12,
    color: '#7B70FF',
    fontWeight: '500',
  },
  unpinText: {
    fontSize: 12,
    color: '#f87171',
    fontWeight: '500',
  },
});
