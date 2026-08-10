/**
 * MessageComposer Component (React Native)
 *
 * Composer with emoji button, text input, and send button.
 * Matches talktivity_frontend/components/chat/composer/MessageComposer.tsx exactly.
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  showEmoji: boolean;
  onToggleEmoji: () => void;
  onEmojiSelect: (emoji: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled,
  showEmoji,
  onToggleEmoji,
  onEmojiSelect,
  onFocus,
  onBlur,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Emoji button */}
        <TouchableOpacity
          onPress={onToggleEmoji}
          activeOpacity={0.7}
          style={styles.emojiButton}
          aria-label="Add emoji"
        >
          <Ionicons name="happy-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(253,253,253,0.5)"
          value={value}
          onChangeText={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSend}
          editable={!disabled}
          returnKeyType="send"
          blurOnSubmit
          aria-label="Message input"
        />

        {/* Send button with gradient */}
        <TouchableOpacity
          onPress={onSend}
          disabled={disabled || !value.trim()}
          activeOpacity={0.8}
          style={[
            styles.sendButton,
            (!value.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          aria-label="Send message"
        >
          <LinearGradient
            colors={['#0E55FF', '#C55DFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#09090f',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emojiButton: {
    width: 44,
    height: 37,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#636363',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 37,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#636363',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    color: '#FDFDFD',
  },
  sendButton: {
    width: 44,
    height: 37,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
