/**
 * DM Chat Screen (React Native)
 * 
 * Full-screen DM conversation interface
 * Matches Next.js /community/inbox/[id] page implementation.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadDMs,
  loadDMMessages,
  selectDMs,
  selectDMMessages,
  selectMessagesLoading,
} from '@/store/slices/communitySlice';
import {
  dmMessageReceived,
  dmTypingUpdated,
  selectDMTypingUser,
  selectRealtimeDMMessages,
} from '@/store/slices/chatSlice';
import { communityService } from '@/service/CommunityService';
import { useChatIdentity, useDMSocket, useDMComposer } from '@/hooks/chat';
import { enrichMessageProfile } from '@/lib/chat/messageEnrichment';
import {
  MessageComposer,
  MessageBubble,
  PinnedMessageBanner,
  ChatLoading,
} from '@/components/chat';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { DMChatScreenProps } from '@/navigation/types';

const DMChatScreen: React.FC<DMChatScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const dmId = route.params?.dmId;
  const numericDmId = dmId ? Number(dmId) : NaN;

  const dms = useAppSelector(selectDMs);
  
  // Memoize selectors to prevent creating new selector functions on every render
  const dmMessagesSelector = useMemo(() => selectDMMessages(numericDmId), [numericDmId]);
  const messagesLoadingSelector = useMemo(() => selectMessagesLoading(numericDmId), [numericDmId]);
  const realtimeMessagesSelector = useMemo(() => selectRealtimeDMMessages(numericDmId), [numericDmId]);
  const typingUserSelector = useMemo(() => selectDMTypingUser(numericDmId), [numericDmId]);
  
  const dmMessages = useAppSelector(dmMessagesSelector);
  const messagesLoading = useAppSelector(messagesLoadingSelector);
  const realtimeMessages = useAppSelector(realtimeMessagesSelector);
  const typingUserId = useAppSelector(typingUserSelector);
  const { userId, fullName: userName, profilePicture: userAvatar } = useChatIdentity();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineMap, setOnlineMap] = useState<Record<number, { online: boolean; lastSeen?: string }>>({});
  const [pinnedMsgId, setPinnedMsgId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const hasLoadedRef = useRef(false);
  const lastDmIdRef = useRef<number | null>(null);
  const pinnedMessageIdRef = useRef<number | null>(null);

  // Find DM from Redux state
  const dmInfo = useMemo(() => {
    if (!dmId) return null;
    return dms.find((d) => String(d.id) === String(dmId)) || null;
  }, [dms, dmId]);

  // Find the other user
  const otherUser = useMemo(() => {
    if (!dmInfo || !userId) return null;
    const idx = (dmInfo.participant_ids || []).findIndex((id: any) => String(id) !== String(userId));
    return {
      id: dmInfo.participant_ids?.[idx],
      name: dmInfo.participant_names?.[idx],
      avatar: dmInfo.participant_avatars?.[idx] || null,
    };
  }, [dmInfo, userId]);

  // Get sorted messages from Redux
  const messages = useMemo(() => {
    return [...dmMessages].sort((a, b) =>
      new Date(a.created_at || a.updated_at || 0).getTime() -
      new Date(b.created_at || b.updated_at || 0).getTime()
    );
  }, [dmMessages]);

  // Merge Redux messages with realtime socket/optimistic messages
  const allMessages = useMemo(() => {
    const messageMap = new Map();
    // Add Redux messages
    messages.forEach((msg) => {
      messageMap.set(msg.id, msg);
    });
    // Add/update realtime messages
    realtimeMessages.forEach((msg) => {
      messageMap.set(msg.id, msg);
    });
    return Array.from(messageMap.values()).sort((a: any, b: any) =>
      new Date(a.created_at || a.timestamp || 0).getTime() -
      new Date(b.created_at || b.timestamp || 0).getTime()
    );
  }, [messages, realtimeMessages]);

  // Fetch DM info and messages - use ref to prevent multiple loads
  useEffect(() => {
    if (!dmId) return;
    const numericId = Number(dmId);
    
    // Only load if dmId changed or hasn't loaded yet
    if (hasLoadedRef.current && lastDmIdRef.current === numericId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load DMs if not already loaded
        if (dms.length === 0) {
          await dispatch(loadDMs());
        }
        // Load messages
        await dispatch(loadDMMessages(numericId));
        hasLoadedRef.current = true;
        lastDmIdRef.current = numericId;
      } catch (err) {
        setError('Failed to load DM or messages.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, dmId]); // Removed dms.length to prevent loops

  // Mark DM as read
  useEffect(() => {
    if (!userId || !dmId) return;
    const markRead = async () => {
      try {
        await communityService.markDMAsRead(String(dmId));
      } catch (err) {
        console.error('Failed to mark DM as read:', err);
      }
    };
    markRead();
  }, [dmId, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages.length]);

  // Find pinned message - only update if it actually changed
  useEffect(() => {
    const pinned = allMessages.find((m: any) => m.pinned || m.is_pinned);
    const newPinnedId = pinned ? pinned.id : null;
    // Only update if the pinned message ID actually changed
    if (newPinnedId !== pinnedMessageIdRef.current) {
      pinnedMessageIdRef.current = newPinnedId;
      setPinnedMsgId(newPinnedId);
    }
  }, [allMessages.length]); // Use length instead of full array to prevent infinite loops

  const onIncomingDMMessage = useMemo(() => {
    return (msg: any) => {
      // If this is our own message, we already added an optimistic copy; skip to avoid duplicates
      if (userId != null && msg?.sender_id != null && String(msg.sender_id) === String(userId)) {
        return;
      }
      const enriched = enrichMessageProfile(msg, {
        currentUserId: userId,
        currentUserName: userName || 'You',
        currentUserAvatar: userAvatar || null,
        otherUser: otherUser ? { id: otherUser.id, name: otherUser.name, avatar: otherUser.avatar } : null,
      });

      if (!Number.isFinite(numericDmId)) return;
      dispatch(dmMessageReceived({ dmId: numericDmId, message: enriched }));
    };
  }, [dispatch, numericDmId, otherUser, userAvatar, userId, userName]);

  const onDMTyping = useMemo(() => {
    return ({ typing: isTyping, userId: typingUserId }: any) => {
      if (otherUser && typingUserId === otherUser.id) {
        if (!Number.isFinite(numericDmId)) return;
        dispatch(dmTypingUpdated({ dmId: numericDmId, userId: typingUserId, typing: !!isTyping }));
      }
    };
  }, [dispatch, numericDmId, otherUser]);

  useDMSocket({
    dmId: dmId ? Number(dmId) : null,
    userId,
    otherUserId: otherUser ? otherUser.id : null,
    onMessage: onIncomingDMMessage,
    onTyping: onDMTyping,
  });

  const {
    input,
    showEmoji,
    setShowEmoji,
    handleSend,
    handleChange,
    handleBlur,
    handleEmojiSelect,
  } = useDMComposer({
    dmId: dmId ? Number(dmId) : null,
    userId,
    otherUserId: otherUser ? otherUser.id : null,
    userName: userName || 'You',
    userAvatar: userAvatar || null,
    onOptimisticMessage: (m) => {
      if (!Number.isFinite(numericDmId)) return;
      dispatch(dmMessageReceived({ dmId: numericDmId, message: m }));
    },
  });

  // Get pinned message
  const pinnedMessage = useMemo(() => {
    if (!pinnedMsgId) return null;
    return allMessages.find((m: any) => m.id === pinnedMsgId) || null;
  }, [allMessages, pinnedMsgId]);

  if (loading) {
    return <ChatLoading message="Loading conversation..." />;
  }

  if (!otherUser) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.errorText}>Chat not found</Text>
        <Text style={styles.errorSubtext}>The conversation you're looking for doesn't exist</Text>
      </View>
    );
  }

  const isOnline = onlineMap[otherUser.id]?.online || false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          {otherUser.avatar ? (
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={48} color={colors.primary} />
              {isOnline && <View style={styles.onlineIndicator} />}
            </View>
          ) : (
            <View style={[styles.avatarContainer, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{(otherUser.name || '?').charAt(0).toUpperCase()}</Text>
              {isOnline && <View style={styles.onlineIndicator} />}
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{otherUser.name}</Text>
            <View style={styles.statusContainer}>
              {isOnline ? (
                <>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Online</Text>
                </>
              ) : (
                <Text style={styles.statusText}>Offline</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => {
          const isOwn = item.is_own || (userId != null && item.sender_id != null && String(item.sender_id) === String(userId));
          const senderName = item.sender?.name || item.full_name || otherUser.name;
          const senderAvatar = item.sender?.avatar || item.profile_picture || otherUser.avatar;

          return (
            <MessageBubble
              id={item.id}
              content={item.content}
              timestamp={item.created_at || item.timestamp || new Date().toISOString()}
              isOwn={isOwn}
              authorName={senderName}
              authorAvatar={senderAvatar}
              pinned={item.pinned || item.is_pinned}
            />
          );
        }}
        ListHeaderComponent={
          pinnedMessage ? (
            <PinnedMessageBanner
              message={pinnedMessage}
              onGoToMessage={(id) => {
                // Scroll to message
                const index = allMessages.findIndex((m: any) => m.id === id);
                if (index >= 0) {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }
              }}
            />
          ) : null
        }
        ListEmptyComponent={
          messagesLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyText}>Loading messages...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
            </View>
          )
        }
        contentContainerStyle={styles.messagesContent}
        style={styles.messagesList}
        onContentSizeChange={() => {
          // Only scroll if we're near the bottom (within 100px)
          // This prevents infinite scrolling loops
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 50);
        }}
      />

      {/* Typing Indicator */}
      {typingUserId && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{otherUser.name} is typing...</Text>
        </View>
      )}

      {/* Message Composer */}
      <MessageComposer
        value={input}
        onChange={handleChange}
        onSend={handleSend}
        placeholder="Type a message..."
        disabled={messagesLoading}
        showEmoji={showEmoji}
        onToggleEmoji={() => setShowEmoji(!showEmoji)}
        onEmojiSelect={handleEmojiSelect}
        onFocus={handleBlur}
        onBlur={handleBlur}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050110',
  },
  container: {
    flex: 1,
    backgroundColor: '#050110',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    backgroundColor: 'rgba(26, 27, 60, 0.9)',
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#050110',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  typingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050110',
    padding: spacing['2xl'],
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DMChatScreen;
