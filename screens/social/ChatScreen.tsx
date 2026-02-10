/**
 * Chat Screen (Redux)
 * 
 * Direct messaging interface
 * Uses Redux for DM list and Redux selectors for messages
 * Integrates socket for real-time message updates
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createSelector } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadDMs,
  loadDMMessages,
  sendDMMessage,
  selectDMs,
  selectDMMessages,
  selectDMLoading,
  selectMessagesLoading,
} from '@/store/slices/communitySlice';
import {
  selectRealtimeDMMessages,
  selectDMTypingUser,
} from '@/store/slices/chatSlice';
import { communityService } from '@/service/CommunityService';
import ChatBubble from '@/components/social/ChatBubble';
import MessageInput from '@/components/social/MessageInput';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface ChatScreenProps {
  navigation: any;
  route: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const dms = useAppSelector(selectDMs);
  const dmLoading = useAppSelector(selectDMLoading);
  const [selectedDmId, setSelectedDmId] = useState<number | null>(route.params?.dmId || null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setError] = useState<string | null>(null);

  // Create memoized selectors using createSelector to prevent unnecessary rerenders
  const messagesSelector = useMemo(
    () => {
      if (!selectedDmId) {
        return createSelector(
          [(state: any) => state],
          () => []
        );
      }
      const baseSelector = selectDMMessages(selectedDmId);
      return createSelector(
        [(state: any) => state],
        (state) => {
          try {
            return baseSelector(state);
          } catch (error) {
            console.error('Error selecting DM messages:', error);
            return [];
          }
        }
      );
    },
    [selectedDmId]
  );

  const messagesLoadingSelector = useMemo(
    () => {
      if (!selectedDmId) {
        return createSelector(
          [(state: any) => state],
          () => false
        );
      }
      const baseSelector = selectMessagesLoading(selectedDmId);
      return createSelector(
        [(state: any) => state],
        (state) => {
          try {
            return baseSelector(state);
          } catch (error) {
            console.error('Error selecting messages loading:', error);
            return false;
          }
        }
      );
    },
    [selectedDmId]
  );

  const realtimeMessagesSelector = useMemo(
    () => {
      if (!selectedDmId) {
        return createSelector(
          [(state: any) => state],
          () => []
        );
      }
      const baseSelector = selectRealtimeDMMessages(selectedDmId);
      return createSelector(
        [(state: any) => state],
        (state) => {
          try {
            return baseSelector(state);
          } catch (error) {
            console.error('Error selecting realtime messages:', error);
            return [];
          }
        }
      );
    },
    [selectedDmId]
  );

  const typingUserIdSelector = useMemo(
    () => {
      if (!selectedDmId) {
        return createSelector(
          [(state: any) => state],
          () => null
        );
      }
      const baseSelector = selectDMTypingUser(selectedDmId);
      return createSelector(
        [(state: any) => state],
        (state) => {
          try {
            return baseSelector(state);
          } catch (error) {
            console.error('Error selecting typing user:', error);
            return null;
          }
        }
      );
    },
    [selectedDmId]
  );

  // Get messages for the selected DM using memoized selectors
  const messages = useAppSelector(messagesSelector);
  const messagesLoading = useAppSelector(messagesLoadingSelector);
  const realtimeMessages = useAppSelector(realtimeMessagesSelector);
  const typingUserId = useAppSelector(typingUserIdSelector);

  // Combine server-fetched and real-time messages
  const allMessages = [...messages, ...realtimeMessages];
  const selectedDM = dms.find((dm) => dm.id === selectedDmId);

  // Load DM list on mount
  useEffect(() => {
    dispatch(loadDMs());
  }, [dispatch]);

  // Load messages when DM is selected
  useEffect(() => {
    if (selectedDmId) {
      dispatch(loadDMMessages(selectedDmId));
      // Mark as read
      communityService.markDMAsRead(String(selectedDmId)).catch((err) => {
        console.error('Failed to mark DM as read:', err);
      });
    }
  }, [selectedDmId, dispatch]);

  // Update navigation title
  useEffect(() => {
    if (selectedDM) {
      navigation.setOptions({
        title: selectedDM.other_user?.name || 'Chat',
      });
    }
  }, [selectedDM, navigation]);

  const handleContactSelect = (dmId: number) => {
    setSelectedDmId(dmId);
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedDmId || !content.trim()) return;

      setIsSending(true);
      setError(null);

      try {
        // Dispatch Redux thunk to send message
        const result = await dispatch(
          sendDMMessage({ dmId: selectedDmId, content: content.trim() })
        ).unwrap();

        // Message will be added to Redux state automatically
      } catch (error: any) {
        const errorMsg = error || 'Failed to send message';
        setError(errorMsg);
        Alert.alert('Error', errorMsg);
      } finally {
        setIsSending(false);
      }
    },
    [selectedDmId, dispatch]
  );

  // Contact List View
  if (!selectedDmId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity style={styles.newChatButton}>
            <Ionicons name="create" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {dmLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : dms.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.contactsScroll}>
            {dms.map((dm) => (
              <TouchableOpacity
                key={dm.id}
                style={styles.contactItem}
                onPress={() => handleContactSelect(dm.id)}
                activeOpacity={0.7}
              >
                <View style={styles.contactAvatar}>
                  <Ionicons name="person-circle" size={48} color={colors.primary} />
                  {dm.other_user?.is_online && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.contactContent}>
                  <Text style={styles.contactName}>{dm.other_user?.name || 'Unknown'}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {dm.last_message_content || 'No messages yet'}
                  </Text>
                </View>

                <Text style={styles.timestamp}>
                  {dm.last_message_time
                    ? new Date(dm.last_message_time).toLocaleDateString()
                    : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // Chat View
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => setSelectedDmId(null)}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <View style={styles.chatHeaderContent}>
          <Text style={styles.chatHeaderTitle}>{selectedDM?.other_user?.name || 'Chat'}</Text>
          <View style={styles.statusContainer}>
            {selectedDM?.other_user?.is_online && (
              <>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
      >
        {messagesLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : allMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation</Text>
          </View>
        ) : (
          <>
            {allMessages.map((msg) => (
              <ChatBubble
                key={msg.id}
                isOwn={msg.is_own || false}
                message={msg.content}
                timestamp={msg.created_at || msg.timestamp}
                senderName={!msg.is_own ? msg.sender?.name : undefined}
              />
            ))}
            {typingUserId && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {selectedDM?.other_user?.name} is typing...
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {sendError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{sendError}</Text>
        </View>
      )}

      <MessageInput
        onSend={handleSendMessage}
        isLoading={isSending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  newChatButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsScroll: {
    paddingBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactAvatar: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    bottom: 0,
    right: 0,
  },
  contactContent: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  lastMessage: {
    fontSize: 12,
    color: '#999',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: spacing.md,
  },
  chatHeaderContent: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    color: '#999',
  },
  callButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.lg,
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: spacing.sm,
  },
  errorBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fee',
    borderTopWidth: 1,
    borderTopColor: '#f44336',
  },
  errorText: {
    fontSize: 13,
    color: '#f44336',
  },
  typingIndicator: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  typingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ChatScreen;
