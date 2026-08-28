/**
 * DM Chat Screen (React Native)
 *
 * Full-screen DM conversation interface.
 * Matches talktivity_frontend/components/DMChat.tsx exactly.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenBackground from '../../components/common/ScreenBackground';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadDMs,
  loadDMMessages,
  markDMReadLocally,
  selectDMs,
  selectDMMessages,
  selectMessagesLoading,
  syncDMPreviewAfterOwnMessage,
} from '@/store/slices/communitySlice';
import {
  clearDMThreadRealtime,
  dmMessageReceived,
  dmTypingUpdated,
  selectDMTypingUser,
  selectRealtimeDMMessages,
} from '@/store/slices/chatSlice';
import { communityService } from '@/services/community';
import {
  connectSocket,
  getOnlineUsers,
  subscribeToPresence,
} from '@/services/socket';
import { useChatIdentity, useDMSocket, useDMComposer } from '@/hooks/chat';
import { enrichMessageProfile } from '@/lib/chat/messageEnrichment';
import { resolveApiAssetUrl } from '@/utils/community';
import { MessageComposer, MessageBubble, ChatLoading } from '@/components/chat';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { tokens } from '@/theme/tokens';
import type { DMChatScreenProps } from '@/navigation/types';

const DMChatScreen: React.FC<DMChatScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const dmId = (route.params as any)?.dmId;
  const numericDmId = dmId ? Number(dmId) : NaN;

  const dms = useAppSelector(selectDMs);

  const dmMessagesSelector = useMemo(
    () => selectDMMessages(numericDmId),
    [numericDmId]
  );
  const messagesLoadingSelector = useMemo(
    () => selectMessagesLoading(numericDmId),
    [numericDmId]
  );
  const realtimeMessagesSelector = useMemo(
    () => selectRealtimeDMMessages(numericDmId),
    [numericDmId]
  );
  const typingUserSelector = useMemo(
    () => selectDMTypingUser(numericDmId),
    [numericDmId]
  );

  const dmMessages = useAppSelector(dmMessagesSelector);
  const messagesLoading = useAppSelector(messagesLoadingSelector);
  const realtimeMessages = useAppSelector(realtimeMessagesSelector);
  const typingUserId = useAppSelector(typingUserSelector);
  const {
    userId,
    fullName: userName,
    profilePicture: userAvatar,
  } = useChatIdentity();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [onlineMap, setOnlineMap] = useState<
    Record<number, { online: boolean; lastSeen?: string }>
  >({});
  const [pinnedMsgId, setPinnedMsgId] = useState<number | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const hasLoadedRef = useRef(false);
  const lastDmIdRef = useRef<number | null>(null);
  const pinnedMessageIdRef = useRef<number | null>(null);
  const chatContainerRef = useRef<View>(null);

  const dmInfo = useMemo(() => {
    if (!dmId) return null;
    return dms.find((d) => String(d.id) === String(dmId)) || null;
  }, [dms, dmId]);

  const otherUser = useMemo(() => {
    if (!dmInfo || !userId) return null;
    const idx = (dmInfo.participant_ids || []).findIndex(
      (id: any) => String(id) !== String(userId)
    );
    return {
      id: dmInfo.participant_ids?.[idx],
      name: dmInfo.participant_names?.[idx],
      avatar: dmInfo.participant_avatars?.[idx] || null,
    };
  }, [dmInfo, userId]);

  const messages = useMemo(() => {
    return [...dmMessages].sort(
      (a, b) =>
        new Date(a.created_at || a.updated_at || 0).getTime() -
        new Date(b.created_at || b.updated_at || 0).getTime()
    );
  }, [dmMessages]);

  const allMessages = useMemo(() => {
    const messageMap = new Map();
    messages.forEach((msg) => messageMap.set(msg.id, msg));
    realtimeMessages.forEach((msg) => messageMap.set(msg.id, msg));
    return Array.from(messageMap.values()).sort(
      (a: any, b: any) =>
        new Date(a.created_at || a.timestamp || 0).getTime() -
        new Date(b.created_at || b.timestamp || 0).getTime()
    );
  }, [messages, realtimeMessages]);

  // Fetch data
  useEffect(() => {
    if (!dmId) return;
    const numericId = Number(dmId);
    if (hasLoadedRef.current && lastDmIdRef.current === numericId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (dms.length === 0) await dispatch(loadDMs());
        const messagesResult = await dispatch(loadDMMessages(numericId));
        if (loadDMMessages.rejected.match(messagesResult)) {
          throw new Error('Failed to load messages.');
        }
        hasLoadedRef.current = true;
        lastDmIdRef.current = numericId;
      } catch (err) {
        setError('Failed to load DM or messages.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, dmId]);

  // Real-time presence
  useEffect(() => {
    if (!otherUser) return;
    const onlineUsers = getOnlineUsers();
    setOnlineMap((prev) => ({
      ...prev,
      [otherUser.id]: {
        online: onlineUsers.has(otherUser.id),
        lastSeen: undefined,
      },
    }));
    const handlePresence = (
      uid: number,
      online: boolean,
      lastSeen?: string
    ) => {
      if (uid === otherUser.id)
        setOnlineMap((prev) => ({ ...prev, [uid]: { online, lastSeen } }));
    };
    return subscribeToPresence(handlePresence);
  }, [otherUser]);

  // Mark as read
  useEffect(() => {
    if (!userId || !dmId || !Number.isFinite(numericDmId)) return;
    let isMounted = true;
    const markRead = async () => {
      try {
        connectSocket();
        const sock = (global as any).socket;
        if (sock) sock.emit('mark_dm_read', { dmId: numericDmId, userId });
        await communityService.markDMAsRead(String(dmId));
      } catch (err) {
        console.error('Failed to mark DM as read:', err);
      } finally {
        if (isMounted)
          dispatch(
            markDMReadLocally({
              dmId: numericDmId,
              readAt: new Date().toISOString(),
            })
          );
      }
    };
    markRead();
    return () => {
      isMounted = false;
      dispatch(clearDMThreadRealtime({ dmId: numericDmId }));
    };
  }, [dmId, userId]);

  // Auto-scroll
  useEffect(() => {
    if (allMessages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [allMessages.length]);

  // Pinned message
  useEffect(() => {
    const pinned = allMessages.find((m: any) => m.pinned || m.is_pinned);
    const newPinnedId = pinned ? pinned.id : null;
    if (newPinnedId !== pinnedMessageIdRef.current) {
      pinnedMessageIdRef.current = newPinnedId;
      setPinnedMsgId(newPinnedId);
    }
  }, [allMessages.length]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setShowScrollBtn(
      contentSize.height - contentOffset.y - layoutMeasurement.height > 100
    );
  }, []);

  const onIncomingDMMessage = useMemo(() => {
    return (msg: any) => {
      if (
        userId != null &&
        msg?.sender_id != null &&
        String(msg.sender_id) === String(userId)
      )
        return;
      const enriched = enrichMessageProfile(msg, {
        currentUserId: userId,
        currentUserName: userName || 'You',
        currentUserAvatar: userAvatar || null,
        otherUser: otherUser
          ? { id: otherUser.id, name: otherUser.name, avatar: otherUser.avatar }
          : null,
      });
      if (!Number.isFinite(numericDmId)) return;
      dispatch(dmMessageReceived({ dmId: numericDmId, message: enriched }));
    };
  }, [dispatch, numericDmId, otherUser, userAvatar, userId, userName]);

  const onDMTyping = useMemo(() => {
    return ({ typing: isTyping, userId: typingUserId }: any) => {
      if (otherUser && typingUserId === otherUser.id) {
        if (!Number.isFinite(numericDmId)) return;
        dispatch(
          dmTypingUpdated({
            dmId: numericDmId,
            userId: typingUserId,
            typing: !!isTyping,
          })
        );
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
    handleChange: handleInputValueChange,
    handleBlur: handleInputBlur,
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
      dispatch(
        syncDMPreviewAfterOwnMessage({
          dmId: numericDmId,
          content: String(m.content || ''),
          createdAt: m.created_at,
        })
      );
      dispatch(markDMReadLocally({ dmId: numericDmId, readAt: m.created_at }));
    },
  });

  const pinnedMessage = useMemo(() => {
    if (!pinnedMsgId) return null;
    return allMessages.find((m: any) => m.id === pinnedMsgId) || null;
  }, [allMessages, pinnedMsgId]);

  if (loading) {
    return (
      <ScreenBackground>
        <ChatLoading message="Loading conversation..." />
      </ScreenBackground>
    );
  }

  if (!otherUser && !error) {
    return (
      <ScreenBackground>
        <ChatLoading message="Preparing conversation..." />
      </ScreenBackground>
    );
  }

  if (!otherUser) {
    return (
      <ScreenBackground>
        <View style={styles.errorContainer}>
          <Ionicons
            name="people-outline"
            size={40}
            color="rgba(255,255,255,0.4)"
          />
          <Text style={styles.errorText}>Chat not found</Text>
          <Text style={styles.errorSubtext}>
            The conversation you're looking for doesn't exist
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  const isOnline = onlineMap[otherUser.id]?.online || false;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.safeTop, { paddingTop: Math.max(insets.top, 0) }]} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Community-style Header — matches frontend */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherUser.name || 'Chat'}
          </Text>
        </View>

        {/* Online status bar — matches frontend */}
        <View style={styles.statusBar}>
          {isOnline ? (
            <>
              <View style={styles.onlineDot} />
              <Text style={styles.statusOnlineText}>Online</Text>
            </>
          ) : (
            <Text style={styles.statusOfflineText}>Offline</Text>
          )}
        </View>

        {/* Error banner for actions */}
        {actionError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{actionError}</Text>
          </View>
        )}

        {/* Messages */}
        <View style={styles.messagesWrapper}>
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => {
              const isOwn =
                item.is_own ||
                (userId != null &&
                  item.sender_id != null &&
                  String(item.sender_id) === String(userId));
              return (
                <MessageBubble
                  id={item.id}
                  content={String(item.content || '')}
                  timestamp={String(item.timestamp || item.created_at || '')}
                  isOwn={isOwn}
                  authorName={item.full_name || item.sender || 'User'}
                  authorAvatar={resolveApiAssetUrl(
                    item.profile_picture || null
                  )}
                  pinned={item.pinned || item.is_pinned}
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubble-outline"
                  size={40}
                  color="rgba(255,255,255,0.4)"
                />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Start the conversation by saying hi!
                </Text>
              </View>
            }
            contentContainerStyle={styles.messagesContent}
            style={styles.messagesList}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onContentSizeChange={() => {
              setTimeout(
                () => flatListRef.current?.scrollToEnd({ animated: false }),
                50
              );
            }}
          />

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <TouchableOpacity
              style={styles.scrollToBottomBtn}
              onPress={scrollToBottom}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Typing indicator with bouncing dots — matches frontend */}
        {typingUserId === otherUser?.id && otherUser && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubbles}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
            <Text style={styles.typingText}>{otherUser.name} is typing...</Text>
          </View>
        )}

        {/* Message Composer */}
        <MessageComposer
          value={input}
          onChange={handleInputValueChange}
          onSend={handleSend}
          placeholder="Type a message... (Markdown & Emoji supported)"
          showEmoji={showEmoji}
          onToggleEmoji={() => setShowEmoji((v) => !v)}
          onEmojiSelect={handleEmojiSelect}
          onFocus={() =>
            setTimeout(
              () => flatListRef.current?.scrollToEnd({ animated: true }),
              120
            )
          }
          onBlur={handleInputBlur}
        />
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeTop: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: tokens.control.height,
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 25,
    color: '#FFFFFF',
    // The back button is absolute at left:16 and 42pt wide, so a centred title
    // grows outwards in both directions and a long name ends up underneath it.
    // 42pt of margin inside the row's 16pt padding stops the title exactly at
    // the button's edge; numberOfLines then ellipsises instead of overlapping.
    flexShrink: 1,
    marginHorizontal: 42,
    textAlign: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusOnlineText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
  },
  statusOfflineText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.4)',
  },
  errorBanner: {
    backgroundColor: 'rgba(220,38,38,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  messagesWrapper: {
    flex: 1,
    position: 'relative',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.4)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubbles: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  typingText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
  },
  scrollToBottomBtn: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.5)',
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});

export default DMChatScreen;
