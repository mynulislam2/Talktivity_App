/**
 * Social Screen (Redux)
 * 
 * Community hub with tabbed interface:
 * - Community: Browse groups and communities
 * - Leaderboard: Weekly/monthly rankings
 * - Messages: Direct message conversations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadDMs,
  selectDMs,
  selectDMLoading,
  selectCommunityError,
} from '../../store/slices/communitySlice';
import {
  loadWeeklyLeaderboard,
  selectLeaderboardData,
  selectLeaderboardLoading,
  selectLeaderboardError,
} from '../../store/slices/leaderboardSlice';
import type { SocialScreenProps } from '../../navigation/types';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

const SocialScreen: React.FC<SocialScreenProps> = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'community' | 'leaderboard' | 'messages'>('community');

  // Load thunks based on active tab
  useEffect(() => {
    if (activeTab === 'messages') {
      dispatch(loadDMs());
    } else if (activeTab === 'leaderboard') {
      dispatch(loadWeeklyLeaderboard());
    }
  }, [activeTab, dispatch]);

  // Selectors
  const dmsList = useAppSelector(selectDMs);
  const dmLoading = useAppSelector(selectDMLoading);
  const dmError = useAppSelector(selectCommunityError);

  const leaderboard = useAppSelector(selectLeaderboardData);
  const leaderboardLoading = useAppSelector(selectLeaderboardLoading);
  const leaderboardError = useAppSelector(selectLeaderboardError);

  // Show error if any
  useEffect(() => {
    if (dmError) {
      Alert.alert('Error', dmError);
    } else if (leaderboardError) {
      Alert.alert('Error', leaderboardError);
    }
  }, [dmError, leaderboardError]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {['community', 'leaderboard', 'messages'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab && styles.activeTabLabel,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'community' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communities</Text>
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>Discover Communities</Text>
              <Text style={styles.emptyDesc}>
                Browse and join communities to connect with learners
              </Text>
              <TouchableOpacity style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse Communities</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
            {leaderboardLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry, index) => (
                <View key={index} style={styles.leaderboardRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{entry.user?.name || 'Anonymous'}</Text>
                    <Text style={styles.userScore}>{entry.points || 0} points</Text>
                  </View>
                  <Text style={styles.streak}>🔥 {entry.streak || 0} days</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#ddd" />
                <Text style={styles.emptyText}>No rankings</Text>
                <Text style={styles.emptyDesc}>Start learning to appear on the leaderboard</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>
            {dmLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            ) : dmsList && dmsList.length > 0 ? (
              <View>
                <Text style={styles.dmCount}>
                  {dmsList.length} conversation{dmsList.length !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity style={styles.browseButton}>
                  <Text style={styles.browseButtonText}>Go to Messages</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ddd" />
                <Text style={styles.emptyText}>No messages</Text>
                <Text style={styles.emptyDesc}>
                  Start a conversation with other learners
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: spacing.md,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#ccc',
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  browseButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dmCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  loader: {
    marginVertical: spacing.lg,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  userScore: {
    fontSize: 12,
    color: '#999',
  },
  streak: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SocialScreen;
