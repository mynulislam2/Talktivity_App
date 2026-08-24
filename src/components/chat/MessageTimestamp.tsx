import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatChatTimestamp } from '@/lib/chat/date';
import { colors } from '@/styles/colors';

export interface MessageTimestampProps {
  value: string;
  style?: any;
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({
  value,
  style,
}) => {
  return (
    <Text style={[styles.timestamp, style]}>{formatChatTimestamp(value)}</Text>
  );
};

const styles = StyleSheet.create({
  timestamp: {
    fontSize: 10,
    fontFamily: 'Poppins',
    color: colors.text.secondary,
    opacity: 0.75,
  },
});
