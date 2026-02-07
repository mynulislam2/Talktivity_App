/**
 * Community Screen (Redux)
 * 
 * Community/group discovery and management
 * Uses Redux for loading groups and managing join/leave state
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadGroups,
  loadJoinedGroups,
  joinGroup,
  leaveGroup,
  selectGroups,
  selectJoinedGroups,
  selectGroupsLoading,
  selectCommunityError,
} from '../../store/slices/communitySlice';
import CommunityCard from '../../components/social/CommunityCard';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface CommunityScreenProps {
  navigation: any;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const joinedGroupsIds = useAppSelector(selectJoinedGroups);
  const isLoading = useAppSelector(selectGroupsLoading);
  const error = useAppSelector(selectCommunityError);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined'>('all');
  const [isJoiningId, setIsJoiningId] = useState<number | null>(null);

  // Load groups on mount
  useEffect(() => {
    dispatch(loadGroups());
    dispatch(loadJoinedGroups());
  }, [dispatch]);

  // Filter and search groups
  const filteredGroups = React.useMemo(() => {
    let result = groups;

    // Filter by join status
    if (filter === 'joined') {
      result = result.filter((g) => joinedGroupsIds.includes(g.id));
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [groups, joinedGroupsIds, searchQuery, filter]);

  const handleJoinGroup = useCallback(
    async (groupId: number) => {
      setIsJoiningId(groupId);
      try {
        await dispatch(joinGroup(groupId)).unwrap();
        // Reload joined groups to ensure state is fresh
        dispatch(loadJoinedGroups());
      } catch (err: any) {
        Alert.alert('Error', err || 'Failed to join group');
      } finally {
        setIsJoiningId(null);
      }
    },
    [dispatch]
  );

  const handleLeaveGroup = useCallback(
    async (groupId: number) => {
      setIsJoiningId(groupId);
      try {
        await dispatch(leaveGroup(groupId)).unwrap();
        // Reload joined groups to ensure state is fresh
        dispatch(loadJoinedGroups());
      } catch (err: any) {
        Alert.alert('Error', err || 'Failed to leave group');
      } finally {
        setIsJoiningId(null);
      }
    },
    [dispatch]
  );

  const handleCommunityPress = (groupId: number) => {
    // Navigate to group detail screen if exists
    // navigation.navigate('GroupDetail', { groupId });
  };

  // Show error alert if there's an error
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Communities</Text>
          <Text style={styles.subtitle}>Join and learn with others</Text>
        </View>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All Communities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'joined' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('joined')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'joined' && styles.filterTabTextActive,
            ]}
          >
            My Communities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Communities List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No communities found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'joined'
                ? 'Join some communities to get started'
                : 'Try adjusting your search'}
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => {
            const isJoined = joinedGroupsIds.includes(group.id);
            const isJoiningThisGroup = isJoiningId === group.id;
            return (
              <CommunityCard
                key={group.id}
                communityId={String(group.id)}
                name={group.name}
                description={group.description || ''}
                memberCount={group.member_count || 0}
                postsCount={group.posts_count || 0}
                isJoined={isJoined}
                onPress={() => handleCommunityPress(group.id)}
                onJoin={() =>
                  isJoined
                    ? handleLeaveGroup(group.id)
                    : handleJoinGroup(group.id)
                }
              />
            );
          })
        )}
      </ScrollView>
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
    alignItems: 'flex-start',
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
  },
  createButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: colors.primary,
  },
  scrollContent: {
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
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});

export default CommunityScreen;
