/**
 * Chat Bubble Component
 * 
 * Individual chat message display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface ChatBubbleProps {
  isOwn: boolean;
  message: string;
  timestamp: string;
  senderName?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOwn,
  message,
  timestamp,
  senderName,
}) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
    >
      {!isOwn && senderName && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.message,
            isOwn ? styles.messageOwn : styles.messageOther,
          ]}
        >
          {message}
        </Text>
      </View>
      <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    flexDirection: 'column',
  },
  containerOwn: {
    alignItems: 'flex-end',
  },
  containerOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: spacing.xs,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageOwn: {
    color: '#fff',
  },
  messageOther: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: spacing.xs,
    marginHorizontal: spacing.md,
  },
});

export default ChatBubble;
