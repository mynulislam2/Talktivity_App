import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/store/hooks';
import {
  loadDMs,
  loadGroups,
  loadJoinedGroups,
  loadLastReadStatus,
  joinGroup,
  selectDMLoading,
  selectGroupsLoading,
  selectUnreadDMsCount,
} from '@/store/slices/communitySlice';
import { useAppSelector } from '@/store/hooks';
import { useNavigation } from '@react-navigation/native';
import ScreenBackground from '../../components/common/ScreenBackground';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(loadDMs()),
          dispatch(loadGroups()),
          dispatch(loadJoinedGroups()),
          dispatch(loadLastReadStatus()),
        ]);
      } catch (error) {
        console.error('Error loading community data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const { dms, groups, isLoading, error, refresh } = useCommunityData();
  const { activeTab, setActiveTab } = useCommunityTabs();
  const { dms: dmList, onlineMap, hasUnreadDM, getOtherUser } = useDMs();
  const {
    groups: groupList,
    joinedGroups,
    hasUnread: hasUnreadGroup,
  } = useGroups();
  const {
    filteredGroups,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useGroupFilters(groupList, joinedGroups);
  const unreadDMsCount = useAppSelector(selectUnreadDMsCount);
  const dmLoading = useAppSelector(selectDMLoading);
  const groupsLoading = useAppSelector(selectGroupsLoading);

  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [showGroupSearch, setShowGroupSearch] = useState(false);

  const handleJoin = useCallback(
    async (groupId: number) => {
      setJoiningGroupId(groupId);
      try {
        await dispatch(joinGroup(groupId)).unwrap();
        (navigation as any).navigate('SocialStack', {
          screen: 'GroupChatScreen',
          params: { groupId },
        });
      } catch {
        // handled by component
      } finally {
        setJoiningGroupId(null);
      }
    },
    [dispatch, navigation]
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

  const showInitialLoading =
    isLoading && dms.length === 0 && groups.length === 0;

  if (showInitialLoading) {
    return (
      <ScreenBackground>
        <View style={styles.root}>
          <View style={styles.bgBase} />
          <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <CommunityHeader title="Community" />
            <CommunityLoadingState />
          </SafeAreaView>
        </View>
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground>
        <View style={styles.root}>
          <View style={styles.bgBase} />
          <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <CommunityHeader title="Community" />
            <CommunityErrorState error={error} onRetry={refresh} />
          </SafeAreaView>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.root}>
      <View style={styles.bgBase} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <CommunityHeader title="Community" />
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
              dmLoading={dmLoading}
              groupsLoading={groupsLoading}
              onlineMap={onlineMap}
              hasUnreadDM={hasUnreadDM}
              hasUnreadGroup={hasUnreadGroup}
              getOtherUser={getOtherUser}
              onGroupClick={handleGroupClick}
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
    </View>
   </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
  },
});

export default CommunityScreen;

