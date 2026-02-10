/**
 * Group Chat Screen (React Native)
 * 
 * Full-screen group conversation interface
 * Matches Next.js /community/groups/[id] page implementation.
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
  loadGroups,
  loadGroupMessages,
  loadGroupMembers,
  selectGroups,
  selectGroupMessages,
  selectGroupMembers,
  selectMessagesLoading,
  selectMembersLoading,
} from '@/store/slices/communitySlice';
import {
  groupMessageReceived,
  groupTypingUpdated,
  selectGroupTypingUsers,
  selectRealtimeGroupMessages,
} from '@/store/slices/chatSlice';
import { communityService } from '@/service/CommunityService';
import { useChatIdentity, useGroupSocket, useGroupComposer } from '@/hooks/chat';
import {
  MessageComposer,
  MessageBubble,
  PinnedMessageBanner,
  ChatLoading,
} from '@/components/chat';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { GroupChatScreenProps } from '@/navigation/types';

const GroupChatScreen: React.FC<GroupChatScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const groupId = route.params?.groupId;
  const numericGroupId = groupId ? Number(groupId) : NaN;

  const groups = useAppSelector(selectGroups);
  
  // Memoize selectors to prevent creating new selector functions on every render
  const groupMessagesSelector = useMemo(() => selectGroupMessages(numericGroupId), [numericGroupId]);
  const groupMembersSelector = useMemo(() => selectGroupMembers(numericGroupId), [numericGroupId]);
  const messagesLoadingSelector = useMemo(() => selectMessagesLoading(numericGroupId), [numericGroupId]);
  const membersLoadingSelector = useMemo(() => selectMembersLoading(numericGroupId), [numericGroupId]);
  const realtimeMessagesSelector = useMemo(() => selectRealtimeGroupMessages(numericGroupId), [numericGroupId]);
  const typingUsersSelector = useMemo(() => selectGroupTypingUsers(numericGroupId), [numericGroupId]);
  
  const groupMessages = useAppSelector(groupMessagesSelector);
  const groupMembers = useAppSelector(groupMembersSelector);
  const messagesLoading = useAppSelector(messagesLoadingSelector);
  const membersLoading = useAppSelector(membersLoadingSelector);
  const realtimeMessages = useAppSelector(realtimeMessagesSelector);
  const typingUsersArr = useAppSelector(typingUsersSelector);
  const { userId, fullName: userName, profilePicture: userAvatar } = useChatIdentity();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineMap, setOnlineMap] = useState<Record<number, { online: boolean; lastSeen?: string }>>({});
  const [pinnedMsgId, setPinnedMsgId] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pinnedMessageIdRef = useRef<number | null>(null);
  const hasLoadedRef = useRef(false);
  const lastGroupIdRef = useRef<number | null>(null);

  // Find group from Redux state
  const group = useMemo(() => {
    if (!groupId) return null;
    return groups.find((g) => String(g.id) === String(groupId)) || null;
  }, [groups, groupId]);

  // Get sorted messages from Redux
  const messages = useMemo(() => {
    return [...groupMessages].sort((a, b) =>
      new Date(a.created_at || a.updated_at || 0).getTime() -
      new Date(b.created_at || b.updated_at || 0).getTime()
    );
  }, [groupMessages]);

  // Get members from Redux
  const members = useMemo(() => groupMembers, [groupMembers]);

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

  // Typing users set
  const typingUsers = useMemo(() => new Set<number>(typingUsersArr || []), [typingUsersArr]);

  // Fetch group info, messages, and members - use ref to prevent multiple loads
  useEffect(() => {
    if (!groupId) return;
    const numericId = Number(groupId);
    
    // Only load if groupId changed or hasn't loaded yet
    if (hasLoadedRef.current && lastGroupIdRef.current === numericId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load groups if not already loaded
        if (groups.length === 0) {
          await dispatch(loadGroups());
        }
        // Load messages
        await dispatch(loadGroupMessages(numericId));
        // Load members
        await dispatch(loadGroupMembers(numericId));
        hasLoadedRef.current = true;
        lastGroupIdRef.current = numericId;
      } catch (err) {
        setError('Failed to load group or messages.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, groupId]); // Removed groups.length to prevent loops

  // Mark group as read
  useEffect(() => {
    if (!userId || !groupId) return;
    // TODO: Mark group as read via socket when socket is integrated
  }, [groupId, userId]);

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

  const onIncomingGroupMessage = useMemo(() => {
    return (msg: any) => {
      // If this is our own message, we already added an optimistic copy; skip to avoid duplicates
      if (userId != null && msg?.user_id != null && String(msg.user_id) === String(userId)) {
        return;
      }
      if (!Number.isFinite(numericGroupId)) return;
      dispatch(groupMessageReceived({ groupId: numericGroupId, message: msg }));
    };
  }, [dispatch, numericGroupId, userId]);

  const onGroupTyping = useMemo(() => {
    return ({ userId: typingUserId, typing: isTyping }: any) => {
      if (typingUserId === userId) return; // Never track yourself
      if (!Number.isFinite(numericGroupId)) return;
      dispatch(groupTypingUpdated({ groupId: numericGroupId, userId: typingUserId, typing: !!isTyping }));
    };
  }, [dispatch, numericGroupId, userId]);

  useGroupSocket({
    groupId: Number.isFinite(numericGroupId) ? numericGroupId : null,
    userId,
    onMessage: onIncomingGroupMessage,
    onTyping: onGroupTyping,
  });

  const {
    input,
    showEmoji,
    setShowEmoji,
    handleSend,
    handleChange,
    handleBlur,
    handleEmojiSelect,
  } = useGroupComposer({
    groupId: Number.isFinite(numericGroupId) ? numericGroupId : null,
    userId,
    userName: userName || 'You',
    userAvatar: userAvatar || null,
    onOptimisticMessage: (m) => {
      if (!Number.isFinite(numericGroupId)) return;
      dispatch(groupMessageReceived({ groupId: numericGroupId, message: m }));
    },
  });

  // Get pinned message
  const pinnedMessage = useMemo(() => {
    if (!pinnedMsgId) return null;
    return allMessages.find((m: any) => m.id === pinnedMsgId) || null;
  }, [allMessages, pinnedMsgId]);

  // Get typing indicator text
  const typingText = useMemo(() => {
    if (typingUsers.size === 0) return null;
    if (typingUsers.size === 1) {
      const typingUserId = Array.from(typingUsers)[0];
      const member = members.find((m) => m.id === typingUserId);
      return `${member?.full_name || 'Someone'} is typing...`;
    }
    return `${typingUsers.size} people are typing...`;
  }, [typingUsers, members]);

  if (loading) {
    return <ChatLoading message="Loading group conversation..." />;
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.errorText}>Group not found</Text>
        <Text style={styles.errorSubtext}>The group you're looking for doesn't exist</Text>
      </View>
    );
  }

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
          <View style={styles.groupInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {group.name}
            </Text>
            <Text style={styles.memberCount}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => {
            // TODO: Open group settings/members modal
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => {
          const isOwn = item.is_own || (userId != null && item.user_id != null && String(item.user_id) === String(userId));
          const senderName = item.full_name || 'User';
          const senderAvatar = item.profile_picture || null;

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
      {typingText && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{typingText}</Text>
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
    flex: 1,
  },
  groupInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  memberCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  headerButton: {
    padding: spacing.xs,
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

export default GroupChatScreen;
