/**
 * Group Chat Screen (React Native)
 *
 * Full-screen group conversation interface.
 * Matches talktivity_frontend/components/GroupChat.tsx exactly.
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
  loadGroups,
  loadGroupMessages,
  loadGroupMembers,
  loadDMs,
  leaveGroup,
  markGroupReadLocally,
  selectGroups,
  selectGroupMessages,
  selectGroupMembers,
  selectMessagesLoading,
  selectMembersLoading,
  syncGroupPreviewAfterOwnMessage,
} from '@/store/slices/communitySlice';
import {
  clearGroupThreadRealtime,
  groupMessageReceived,
  groupTypingUpdated,
  selectGroupTypingUsers,
  selectRealtimeGroupMessages,
} from '@/store/slices/chatSlice';
import { communityService } from '@/services/community';
import {
  connectSocket,
  getOnlineUsers,
  subscribeToPresence,
} from '@/services/socket';
import {
  useChatIdentity,
  useGroupSocket,
  useGroupComposer,
} from '@/hooks/chat';
import { UserProfilePopup } from '@/components/community/UserProfilePopup';
import { CommunityAvatar } from '@/components/community/CommunityAvatar';
import { resolveApiAssetUrl } from '@/utils/community';
import { MessageComposer, MessageBubble, ChatLoading } from '@/components/chat';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { tokens } from '@/theme/tokens';
import type { GroupChatScreenProps } from '@/navigation/types';

const GroupChatScreen: React.FC<GroupChatScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const groupId = (route.params as any)?.groupId;
  const numericGroupId = groupId ? Number(groupId) : NaN;

  const groups = useAppSelector(selectGroups);

  const groupMessagesSelector = useMemo(
    () => selectGroupMessages(numericGroupId),
    [numericGroupId]
  );
  const groupMembersSelector = useMemo(
    () => selectGroupMembers(numericGroupId),
    [numericGroupId]
  );
  const messagesLoadingSelector = useMemo(
    () => selectMessagesLoading(numericGroupId),
    [numericGroupId]
  );
  const realtimeMessagesSelector = useMemo(
    () => selectRealtimeGroupMessages(numericGroupId),
    [numericGroupId]
  );
  const typingUsersSelector = useMemo(
    () => selectGroupTypingUsers(numericGroupId),
    [numericGroupId]
  );

  const groupMessages = useAppSelector(groupMessagesSelector);
  const groupMembers = useAppSelector(groupMembersSelector);
  const messagesLoading = useAppSelector(messagesLoadingSelector);
  const realtimeMessages = useAppSelector(realtimeMessagesSelector);
  const typingUsersArr = useAppSelector(typingUsersSelector);
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
  const [muted, setMuted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [groupProfileOpen, setGroupProfileOpen] = useState(false);
  const [profilePopupUser, setProfilePopupUser] = useState<any | null>(null);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [dmLoading, setDmLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pinnedMessageIdRef = useRef<number | null>(null);
  const hasLoadedRef = useRef(false);
  const lastGroupIdRef = useRef<number | null>(null);

  const group = useMemo(() => {
    if (!groupId) return null;
    return groups.find((g) => String(g.id) === String(groupId)) || null;
  }, [groups, groupId]);

  const messages = useMemo(() => {
    return [...groupMessages].sort(
      (a, b) =>
        new Date(a.created_at || a.updated_at || 0).getTime() -
        new Date(b.created_at || b.updated_at || 0).getTime()
    );
  }, [groupMessages]);

  const members = useMemo(() => groupMembers, [groupMembers]);

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

  const typingUsers = useMemo(
    () => new Set<number>(typingUsersArr || []),
    [typingUsersArr]
  );

  // Fetch data
  useEffect(() => {
    if (!groupId) return;
    const numericId = Number(groupId);
    if (hasLoadedRef.current && lastGroupIdRef.current === numericId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (groups.length === 0) await dispatch(loadGroups());
        await dispatch(loadGroupMessages(numericId));
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
  }, [dispatch, groupId]);

  // Real-time presence
  useEffect(() => {
    const onlineUsers = getOnlineUsers();
    setOnlineMap((prev) => {
      const map: Record<string, { online: boolean; lastSeen?: string }> = {
        ...prev,
      };
      members.forEach((m) => {
        map[m.id] = { online: onlineUsers.has(m.id), lastSeen: undefined };
      });
      return map;
    });
    const handlePresence = (
      uid: number,
      online: boolean,
      lastSeen?: string
    ) => {
      setOnlineMap((prev) => ({ ...prev, [uid]: { online, lastSeen } }));
    };
    return subscribeToPresence(handlePresence);
  }, [members.length]);

  // Listen for join/leave
  useEffect(() => {
    if (!groupId) return;
    const refetchMembers = async () => {
      try {
        await dispatch(loadGroupMembers(Number(groupId)));
      } catch {}
    };
    connectSocket();
    const sock = (global as any).socket;
    if (sock) {
      sock.on('user_joined', refetchMembers);
      sock.on('user_left', refetchMembers);
      return () => {
        sock.off('user_joined', refetchMembers);
        sock.off('user_left', refetchMembers);
      };
    }
  }, [dispatch, groupId]);

  // Mark as read
  useEffect(() => {
    if (!userId || !groupId || !Number.isFinite(numericGroupId)) return;
    let isMounted = true;
    const markRead = async () => {
      try {
        connectSocket();
        const sock = (global as any).socket;
        if (sock)
          sock.emit('mark_group_read', { groupId: numericGroupId, userId });
        await communityService.markGroupAsRead(numericGroupId);
      } catch (err) {
        // non-critical
      } finally {
        if (isMounted)
          dispatch(
            markGroupReadLocally({
              groupId: numericGroupId,
              readAt: new Date().toISOString(),
            })
          );
      }
    };
    markRead();
    return () => {
      isMounted = false;
      dispatch(clearGroupThreadRealtime({ groupId: numericGroupId }));
    };
  }, [groupId, userId]);

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

  const handleMuteToggle = useCallback(async () => {
    if (!groupId) return;
    try {
      const newMutedState = !muted;
      const result = await communityService.muteGroup(
        Number(groupId),
        newMutedState
      );
      if (result.success) setMuted(newMutedState);
      else setActionError(result.error || 'Failed to update mute state.');
    } catch (err) {
      setActionError('Failed to update mute state.');
    }
  }, [groupId, muted]);

  const openProfilePopup = useCallback((user: any) => {
    setProfilePopupUser(user);
    setProfilePopupOpen(true);
  }, []);

  const closeProfilePopup = useCallback(() => {
    setProfilePopupOpen(false);
  }, []);

  const handleMessageUser = useCallback(
    async (targetUserId: number) => {
      setDmLoading(true);
      try {
        const result = await communityService.startDM(targetUserId);
        if (result.success && result.data?.dmId) {
          await dispatch(loadDMs());
          setProfilePopupOpen(false);
          (navigation as any).navigate('SocialStack', {
            screen: 'DMChatScreen',
            params: { dmId: result.data.dmId },
          });
        } else {
          setActionError(result.error || 'Failed to start DM.');
        }
      } catch (err) {
        setActionError('Failed to start DM.');
      } finally {
        setDmLoading(false);
      }
    },
    [dispatch, navigation]
  );

  const onIncomingGroupMessage = useMemo(() => {
    return (msg: any) => {
      if (
        userId != null &&
        msg?.user_id != null &&
        String(msg.user_id) === String(userId)
      )
        return;
      if (!Number.isFinite(numericGroupId)) return;
      dispatch(groupMessageReceived({ groupId: numericGroupId, message: msg }));
    };
  }, [dispatch, numericGroupId, userId]);

  const onGroupTyping = useMemo(() => {
    return ({ userId: typingUserId, typing: isTyping }: any) => {
      if (typingUserId === userId) return;
      if (!Number.isFinite(numericGroupId)) return;
      dispatch(
        groupTypingUpdated({
          groupId: numericGroupId,
          userId: typingUserId,
          typing: !!isTyping,
        })
      );
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
    handleChange: handleInputValueChange,
    handleBlur: handleInputBlur,
    handleEmojiSelect,
  } = useGroupComposer({
    groupId: Number.isFinite(numericGroupId) ? numericGroupId : null,
    userId,
    userName: userName || 'You',
    userAvatar: userAvatar || null,
    onOptimisticMessage: (m) => {
      if (!Number.isFinite(numericGroupId)) return;
      dispatch(groupMessageReceived({ groupId: numericGroupId, message: m }));
      dispatch(
        syncGroupPreviewAfterOwnMessage({
          groupId: numericGroupId,
          content: String(m.content || ''),
          createdAt: m.created_at,
          senderName: userName || 'You',
        })
      );
      dispatch(
        markGroupReadLocally({ groupId: numericGroupId, readAt: m.created_at })
      );
    },
  });

  const pinnedMessage = useMemo(() => {
    if (!pinnedMsgId) return null;
    return allMessages.find((m: any) => m.id === pinnedMsgId) || null;
  }, [allMessages, pinnedMsgId]);

  // Typing text
  const typingText = useMemo(() => {
    if (typingUsers.size === 0) return null;
    const names = Array.from(typingUsers)
      .filter((tid) => tid !== userId)
      .map((tid) => members.find((m) => m.id === tid)?.full_name)
      .filter(Boolean);
    if (names.length === 0) return null;
    return (
      names.join(', ') +
      (names.length === 1 ? ' is typing...' : ' are typing...')
    );
  }, [typingUsers, members, userId]);

  if (loading) {
    return (
      <ScreenBackground>
        <ChatLoading />
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground>
        <View style={styles.errorContainer}>
          <Ionicons name="chatbubbles-outline" size={40} color="#f87171" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (!group) {
    return (
      <ScreenBackground>
        <View style={styles.errorContainer}>
          <Ionicons
            name="people-outline"
            size={40}
            color="rgba(255,255,255,0.4)"
          />
          <Text style={styles.errorText}>Group not found</Text>
          <Text style={styles.errorSubtext}>
            The group you're looking for doesn't exist
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.safeTop, { paddingTop: Math.max(insets.top, 0) }]} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header — matches frontend */}
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
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group.name || 'Group'}
          </Text>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            onPress={() => setGroupProfileOpen(true)}
            style={styles.headerMenuButton}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
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
              const msgUser =
                members.find((m: any) => m.id === item.user_id) || null;
              const isOwn = item.user_id === userId || item.sender === 'You';
              const authorName = isOwn
                ? userName
                : item.full_name || item.sender || msgUser?.full_name || 'User';
              const authorAvatar = isOwn
                ? resolveApiAssetUrl(userAvatar || null)
                : resolveApiAssetUrl(msgUser?.profile_picture || null);

              return (
                <MessageBubble
                  id={item.id}
                  content={String(item.content || '')}
                  timestamp={String(item.timestamp || item.created_at || '')}
                  isOwn={isOwn}
                  authorName={authorName}
                  authorAvatar={authorAvatar}
                  pinned={item.pinned || item.is_pinned}
                  onAvatarClick={() => {
                    if (msgUser) openProfilePopup(msgUser);
                  }}
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
        {typingText && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubbles}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
            <Text style={styles.typingLabel}>{typingText}</Text>
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
          onBlur={handleInputBlur}
          onFocus={() =>
            setTimeout(
              () => flatListRef.current?.scrollToEnd({ animated: true }),
              120
            )
          }
        />
      </KeyboardAvoidingView>

      {/* User Profile Popup */}
      <UserProfilePopup
        visible={profilePopupOpen}
        user={profilePopupUser}
        onClose={closeProfilePopup}
        onMessage={handleMessageUser}
        isOnline={
          profilePopupUser ? onlineMap[profilePopupUser.id]?.online : false
        }
        lastSeen={
          profilePopupUser && onlineMap[profilePopupUser.id]?.lastSeen
            ? onlineMap[profilePopupUser.id].lastSeen
            : undefined
        }
      />

      {/* DM loading overlay */}
      {dmLoading && (
        <View style={styles.dmOverlay}>
          <View style={styles.dmOverlayBox}>
            <Text style={styles.dmOverlayText}>Starting chat...</Text>
          </View>
        </View>
      )}

      {/* Group Profile Modal */}
      {groupProfileOpen && (
        <View style={styles.groupProfileOverlay}>
          <TouchableOpacity
            style={styles.groupProfileTouchable}
            activeOpacity={1}
            onPress={() => setGroupProfileOpen(false)}
          >
            <View style={styles.groupProfileModal}>
              <TouchableOpacity
                style={styles.groupProfileClose}
                onPress={() => setGroupProfileOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>

              <View style={styles.groupProfileAvatarSection}>
                <CommunityAvatar
                  name={group.name}
                  src={group.cover_image}
                  size={96}
                />
                <Text style={styles.groupProfileName}>{group.name}</Text>
                {group.description && (
                  <Text style={styles.groupProfileDesc}>
                    {group.description}
                  </Text>
                )}
                <Text style={styles.groupProfileMemberCount}>
                  <Ionicons
                    name="people"
                    size={14}
                    color="rgba(255,255,255,0.5)"
                  />{' '}
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </Text>
              </View>

              <View style={styles.groupProfileActions}>
                <TouchableOpacity
                  style={[
                    styles.muteButton,
                    muted ? styles.muteButtonMuted : styles.muteButtonActive,
                  ]}
                  onPress={handleMuteToggle}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={muted ? 'notifications-off' : 'notifications'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.muteButtonText}>
                    {muted ? 'Unmute notifications' : 'Mute notifications'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={async () => {
                    if (!groupId) return;
                    try {
                      await dispatch(leaveGroup(Number(groupId))).unwrap();
                      setGroupProfileOpen(false);
                      navigation.goBack();
                    } catch {
                      setActionError('Failed to leave group.');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="exit-outline" size={16} color="#ff6f85" />
                  <Text style={styles.leaveButtonText}>Leave Group</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  safeTop: { backgroundColor: 'transparent' },
  container: { flex: 1, backgroundColor: 'transparent' },
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
    color: '#FFFFFF',
    // Same shape as DMChatScreen: the back button is absolute at left:16 and
    // 42pt wide, so a long group name spreads out from the centre and ends up
    // underneath it. Clearing the button on the left and capping to one line
    // keeps the name inside the space the header actually has.
    flexShrink: 1,
    marginLeft: 42,
    textAlign: 'center',
  },
  headerSpacer: { flex: 1 },
  headerMenuButton: {
    width: 36,
    height: 36,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorBannerText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins', textAlign: 'center' },
  messagesWrapper: { flex: 1, position: 'relative' },
  messagesList: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, fontFamily: 'Poppins', color: 'rgba(255,255,255,0.4)' },
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
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubbles: { flexDirection: 'row', gap: 4 },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  typingDot2: { opacity: 0.7 },
  typingDot3: { opacity: 0.4 },
  typingLabel: { fontSize: 14, fontFamily: 'Poppins', color: 'rgba(255,255,255,0.5)', flex: 1 },
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
  dmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  dmOverlayBox: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dmOverlayText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  groupProfileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  groupProfileTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  groupProfileModal: {
    backgroundColor: '#20233f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3d3e50',
    width: '100%',
    maxWidth: 340,
    padding: 24,
  },
  groupProfileClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  groupProfileAvatarSection: { alignItems: 'center', marginBottom: 20 },
  groupProfileName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  groupProfileDesc: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  groupProfileMemberCount: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersListContainer: {
    maxHeight: 240,
    marginBottom: 20,
    backgroundColor: 'rgba(55,65,81,0.3)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  memberAvatarContainer: { position: 'relative' },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#fff' },
  adminBadge: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  groupProfileActions: { alignItems: 'center', width: '100%', gap: 12 },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  muteButtonActive: { backgroundColor: '#2949ff' },
  muteButtonMuted: { backgroundColor: '#d97706' },
  muteButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    backgroundColor: 'rgba(255,68,68,0.1)',
    width: '100%',
  },
  leaveButtonText: { color: '#ff4444', fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
});

export default GroupChatScreen;
