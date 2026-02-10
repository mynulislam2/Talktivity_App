/**
 * Community Screen (React Native)
 * 
 * Community/group discovery and management
 * Matches Next.js /community page implementation.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/store/hooks';
import {
  loadDMs,
  loadGroups,
  loadJoinedGroups,
  loadLastReadStatus,
  joinGroup,
  leaveGroup,
  selectUnreadDMsCount,
} from '@/store/slices/communitySlice';
import { useAppSelector } from '@/store/hooks';
import { useNavigation } from '@react-navigation/native';
import {
  CommunityHeader,
  CommunityTabs,
  CommunityLoadingState,
  CommunityErrorState,
  InboxView,
  GroupsView,
} from '@/components/community';
import {
  useCommunityData,
  useDMs,
  useGroups,
  useCommunityTabs,
  useGroupFilters,
} from '@/hooks/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { CommunityScreenProps } from '@/navigation/types';

const CommunityScreen: React.FC<CommunityScreenProps> = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Load data on mount and on focus
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Loading community data...');
      try {
        await Promise.all([
          dispatch(loadDMs()),
          dispatch(loadGroups()),
          dispatch(loadJoinedGroups()),
          dispatch(loadLastReadStatus()),
        ]);
        console.log('✅ Community data loaded');
      } catch (error) {
        console.error('❌ Error loading community data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Custom hooks
  const { dms, groups, isLoading, error, refresh } = useCommunityData();
  const { activeTab, setActiveTab } = useCommunityTabs();
  const { dms: dmList, onlineMap, hasUnreadDM, getOtherUser } = useDMs();
  const { groups: groupList, joinedGroups, isJoined } = useGroups();
  const { filteredGroups, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useGroupFilters(groupList, joinedGroups);
  const unreadDMsCount = useAppSelector(selectUnreadDMsCount);

  // Debug logging
  useEffect(() => {
    console.log('📊 Community Screen State:', {
      dmsCount: dms.length,
      dmListCount: dmList.length,
      groupsCount: groups.length,
      groupListCount: groupList.length,
      isLoading,
      error,
      activeTab,
    });
  }, [dms.length, dmList.length, groups.length, groupList.length, isLoading, error, activeTab]);

  // Local state for UI
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);
  const [showGroupSearch, setShowGroupSearch] = useState(false);

  // Handlers
  const handleJoin = useCallback(
    async (groupId: number) => {
      setJoiningGroupId(groupId);
      try {
        await dispatch(joinGroup(groupId)).unwrap();
        (navigation as any).navigate('SocialStack', {
          screen: 'ChatScreen',
          params: { contactId: String(groupId) },
        });
      } catch (err) {
        // Error handling is done by the component
      } finally {
        setJoiningGroupId(null);
      }
    },
    [dispatch, navigation]
  );

  const handleLeave = useCallback(
    async (groupId: number) => {
      setLeavingGroupId(groupId);
      try {
        await dispatch(leaveGroup(groupId)).unwrap();
      } catch (err) {
        // Error handling is done by the component
      } finally {
        setLeavingGroupId(null);
      }
    },
    [dispatch]
  );

  const handleDMClick = useCallback(
    (dmId: number) => {
      (navigation as any).navigate('SocialStack', {
        screen: 'DMChatScreen',
        params: { dmId },
      });
    },
    [navigation]
  );

  const handleGroupClick = useCallback(
    (groupId: number) => {
      (navigation as any).navigate('SocialStack', {
        screen: 'GroupChatScreen',
        params: { groupId },
      });
    },
    [navigation]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <CommunityHeader />
        <CommunityLoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <CommunityHeader />
        <CommunityErrorState error={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CommunityHeader />
      <CommunityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadDMsCount={unreadDMsCount}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
            {activeTab === 'inbox' ? (
              <InboxView
                dms={dmList}
                groups={groupList}
                joinedGroups={joinedGroups}
                dmLoading={false}
                groupsLoading={false}
                onlineMap={onlineMap}
                hasUnreadDM={hasUnreadDM}
                getOtherUser={getOtherUser}
                onDMClick={handleDMClick}
                onGroupClick={handleGroupClick}
                onLeaveGroup={handleLeave}
                leavingGroupId={leavingGroupId}
              />
            ) : (
          <GroupsView
            groups={filteredGroups}
            joinedGroups={joinedGroups}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showSearch={showGroupSearch}
            onToggleSearch={() => setShowGroupSearch(!showGroupSearch)}
            loading={false}
            error={null}
            onJoin={handleJoin}
            joiningGroupId={joiningGroupId}
            onGroupClick={handleGroupClick}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050110',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
});

export default CommunityScreen;
