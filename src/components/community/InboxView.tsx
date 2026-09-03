import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CommunityAvatar } from './CommunityAvatar';
import { DMConversationCard } from './DMConversationCard';
import type { DM, Group } from '@/types/community';
import { getGroupActivityTimestamp } from '@/utils/community';

type InboxFilter = 'all' | 'unread' | 'group';

interface InboxEntryBase {
  key: string;
  title: string;
  subtitle: string;
  searchIndex: string;
  time?: string;
  sortTime?: string;
  unread: boolean;
}

interface DMEntry extends InboxEntryBase {
  kind: 'dm';
  dm: DM;
  avatar?: string;
  userId: number;
  isOnline: boolean;
}

interface GroupEntry extends InboxEntryBase {
  kind: 'group';
  group: Group;
}

type InboxEntry = DMEntry | GroupEntry;

export interface InboxViewProps {
  dms: DM[];
  groups: Group[];
  joinedGroups: number[];
  dmLoading: boolean;
  groupsLoading: boolean;
  onlineMap: Record<string, { online: boolean; lastSeen?: string }>;
  hasUnreadDM: (dm: DM) => boolean;
  hasUnreadGroup: (group: Group) => boolean;
  getOtherUser: (dm: DM) => { id: number; name: string; avatar?: string };
  onGroupClick: (groupId: number) => void;
}

function formatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function compareByRecent(a?: string, b?: string) {
  return new Date(b || 0).getTime() - new Date(a || 0).getTime();
}

export function InboxView({
  dms,
  groups,
  joinedGroups,
  dmLoading,
  groupsLoading,
  onlineMap,
  hasUnreadDM,
  hasUnreadGroup,
  getOtherUser,
  onGroupClick,
}: InboxViewProps) {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<InboxFilter>('all');

  const joinedGroupList = useMemo(() => {
    const joinedIds = new Set(joinedGroups);
    return groups
      .filter((group) => joinedIds.has(group.id))
      .sort((a, b) =>
        compareByRecent(
          getGroupActivityTimestamp(a),
          getGroupActivityTimestamp(b)
        )
      );
  }, [groups, joinedGroups]);

  const recentContacts = useMemo(
    () =>
      dms
        .map((dm) => {
          const otherUser = getOtherUser(dm);
          return {
            key: `recent-${dm.id}`,
            dmId: dm.id,
            userId: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
            isOnline: Boolean(onlineMap[otherUser.id]?.online),
            hasUnread: hasUnreadDM(dm),
            sortTime: dm.last_message_time,
          };
        })
        .sort((a, b) => {
          if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
          if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
          return compareByRecent(a.sortTime, b.sortTime);
        }),
    [dms, getOtherUser, hasUnreadDM, onlineMap]
  );

  const mergedEntries = useMemo<InboxEntry[]>(() => {
    const dmEntries: InboxEntry[] = dms.map((dm) => {
      const otherUser = getOtherUser(dm);
      const dmAny = dm as any;
      const unread = hasUnreadDM(dm);
      const preview =
        typeof dmAny.unread_count === 'number' && dmAny.unread_count > 1
          ? `${dmAny.unread_count} new messages`
          : dm.last_message || 'Start the conversation';

      return {
        kind: 'dm',
        key: `dm-${dm.id}`,
        title: otherUser.name,
        subtitle: preview,
        searchIndex: `${otherUser.name} ${preview}`.toLowerCase(),
        time: formatTime(dm.last_message_time),
        sortTime: dm.last_message_time,
        unread,
        dm,
        avatar: otherUser.avatar,
        userId: otherUser.id,
        isOnline: Boolean(onlineMap[otherUser.id]?.online),
      };
    });

    const groupEntries: InboxEntry[] = joinedGroupList.map((group) => {
      const gAny = group as any;
      const preview = gAny.last_message
        ? `${
            gAny.last_message_sender_name
              ? `${gAny.last_message_sender_name}: `
              : ''
          }${gAny.last_message}`
        : group.description ||
          `${group.member_count || 0} members in this group`;

      return {
        kind: 'group',
        key: `group-${group.id}`,
        title: group.name,
        subtitle: preview,
        searchIndex: `${group.name} ${group.description || ''} ${
          gAny.last_message || ''
        }`.toLowerCase(),
        time: formatTime(getGroupActivityTimestamp(group)),
        sortTime: getGroupActivityTimestamp(group),
        unread: hasUnreadGroup(group),
        group,
      };
    });

    return [...dmEntries, ...groupEntries];
  }, [
    dms,
    getOtherUser,
    hasUnreadDM,
    hasUnreadGroup,
    joinedGroupList,
    onlineMap,
  ]);

  const visibleEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mergedEntries
      .filter((entry) => {
        if (activeFilter === 'group' && entry.kind !== 'group') return false;
        if (activeFilter === 'unread' && !entry.unread) return false;
        if (!query) return true;
        return entry.searchIndex.includes(query);
      })
      .sort((a, b) => compareByRecent(a.sortTime, b.sortTime));
  }, [activeFilter, mergedEntries, searchQuery]);

  const unreadEntryCount = useMemo(
    () => mergedEntries.filter((entry) => entry.unread).length,
    [mergedEntries]
  );
  const isLoading = dmLoading || groupsLoading;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={16}
          color="#C6C6C6"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#C6C6C6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={14} color="#C6C6C6" />
          </TouchableOpacity>
        )}
      </View>

      <View>
        <View style={styles.messagesHeader}>
          <Text style={styles.messagesTitle}>Messages</Text>
          <View style={styles.chatCountBadge}>
            <Text style={styles.chatCountText}>
              {visibleEntries.length} chats
            </Text>
          </View>
        </View>

        {recentContacts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentScroll}
            contentContainerStyle={styles.recentContent}
          >
            {recentContacts.map((contact) => (
              <TouchableOpacity
                key={contact.key}
                style={styles.recentContact}
                onPress={() =>
                  (navigation as any).navigate('SocialStack', {
                    screen: 'DMChatScreen',
                    params: { dmId: contact.dmId },
                  })
                }
              >
                <CommunityAvatar
                  name={contact.name}
                  src={contact.avatar}
                  size={52}
                  isOnline={contact.isOnline}
                />
                <Text style={styles.recentName} numberOfLines={1}>
                  {contact.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.filterRow}>
        {(
          [
            ['all', 'All'],
            ['unread', `Unread ${unreadEntryCount}`],
            ['group', 'Group'],
          ] as const
        ).map(([value, label]) =>
          activeFilter === value ? (
            <TouchableOpacity key={value} onPress={() => setActiveFilter(value)}>
              <LinearGradient
                colors={['#2C5BFF', '#A45DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.filterChip, styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
                  {label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={value}
              onPress={() => setActiveFilter(value)}
              style={styles.filterChip}
            >
              <Text style={styles.filterChipText}>{label}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <View>
        {isLoading && mergedEntries.length === 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        )}

        {!isLoading && visibleEntries.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people" size={24} color="rgba(255,255,255,0.6)" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? 'No conversations matched your search'
                : 'No conversations matched this view'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Try another search or join a group to start chatting.
            </Text>
          </View>
        )}

        {visibleEntries.map((entry) => {
          if (entry.kind === 'dm') {
            const otherUser = getOtherUser(entry.dm);
            return (
              <DMConversationCard
                key={entry.key}
                dm={entry.dm}
                otherUser={otherUser}
                isOnline={entry.isOnline}
                hasUnread={entry.unread}
                lastSeen={onlineMap[entry.userId]?.lastSeen}
              />
            );
          }

          return (
            <TouchableOpacity
              key={entry.key}
              style={styles.groupRow}
              onPress={() => onGroupClick(entry.group.id)}
              activeOpacity={0.7}
            >
              <CommunityAvatar
                name={entry.group.name}
                src={entry.group.cover_image}
                size={54}
              />
              <View style={styles.groupRowText}>
                <View style={styles.groupRowNameRow}>
                  <Text style={styles.groupRowName} numberOfLines={1}>
                    {entry.group.name}
                  </Text>
                  {entry.time && (
                    <Text style={styles.groupRowTime}>{entry.time}</Text>
                  )}
                </View>
                <View style={styles.groupRowPreview}>
                  <Text
                    style={[
                      styles.groupRowPreviewText,
                      entry.unread && styles.groupRowPreviewUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {entry.subtitle}
                  </Text>
                </View>
              </View>
              <View style={styles.unreadContainer}>
                {entry.unread ? (
                  <View style={styles.glowDot} />
                ) : (
                  <View style={styles.emptyGlowDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins',
    paddingVertical: 0,
    height: '100%',
  },
  messagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  messagesTitle: {
    fontSize: 34,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: -0.04,
    color: '#fff',
  },
  chatCountBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chatCountText: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.58)',
  },
  recentScroll: {
    marginHorizontal: -4,
    paddingBottom: 8,
  },
  recentContent: {
    gap: 16,
    paddingLeft: 4,
    paddingRight: 20,
  },
  recentContact: {
    width: 72,
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  recentName: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.74)',
    textAlign: 'center',
    width: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: 'transparent',
    shadowColor: 'rgba(101,85,255,0.26)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.66)',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 40,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  emptyContainer: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.52)',
    textAlign: 'center',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  groupRowText: {
    flex: 1,
    minWidth: 0,
  },
  groupRowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupRowName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: -0.02,
    color: '#fff',
  },
  groupRowTime: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.66)',
    flexShrink: 0,
  },
  groupRowPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  groupRowPreviewText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.52)',
  },
  groupRowPreviewUnread: {
    color: 'rgba(255,255,255,0.88)',
  },
  unreadContainer: {
    minWidth: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  glowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD25C',
    shadowColor: 'rgba(255,210,92,0.72)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 14,
    elevation: 4,
  },
  emptyGlowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
