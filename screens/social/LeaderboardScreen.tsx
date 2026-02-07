/**
 * Leaderboard Screen
 * 
 * Rankings and user leaderboard display
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadWeeklyLeaderboard, loadOverallLeaderboard, selectWeeklyLeaderboard, selectOverallLeaderboard, selectUserPositionWeekly, selectUserPositionOverall, selectLeaderboardLoading, selectLeaderboardError } from '../../store/slices/leaderboardSlice';
import UserCard from '../../components/social/UserCard';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface LeaderboardScreenProps {
  navigation: any;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');
  const [category, setCategory] = useState<'points' | 'time' | 'streak'>('points');

  // Redux selectors
  const weeklyLeaderboard = useAppSelector(selectWeeklyLeaderboard);
  const overallLeaderboard = useAppSelector(selectOverallLeaderboard);
  const userPositionWeekly = useAppSelector(selectUserPositionWeekly);
  const userPositionOverall = useAppSelector(selectUserPositionOverall);
  const loading = useAppSelector(selectLeaderboardLoading);
  const error = useAppSelector(selectLeaderboardError);

  // Load leaderboard data based on selected period
  useEffect(() => {
    if (period === 'weekly' || period === 'daily') {
      dispatch(loadWeeklyLeaderboard());
    } else {
      dispatch(loadOverallLeaderboard());
    }
  }, [dispatch, period]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Get current data based on period
  const currentLeaderboard = (period === 'weekly' || period === 'daily') ? weeklyLeaderboard : overallLeaderboard;
  const currentUserRank = (period === 'weekly' || period === 'daily') ? userPositionWeekly?.rank : userPositionOverall?.rank;

  const periodOptions: Array<{ label: string; value: typeof period }> = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'All Time', value: 'allTime' },
  ];

  const categoryOptions: Array<{ label: string; value: typeof category }> = [
    { label: 'Points', value: 'points' },
    { label: 'Study Time', value: 'time' },
    { label: 'Streak', value: 'streak' },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.primary;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return 'checkmark-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>See how you rank</Text>
        </View>
      </View>

      {/* Current Rank Card */}
      {currentUserRank && (
        <View style={styles.rankCard}>
          <Text style={styles.rankLabel}>Your Rank</Text>
          <View style={styles.rankContent}>
            <Ionicons
              name={getRankIcon(currentUserRank)}
              size={32}
              color={getRankColor(currentUserRank)}
            />
            <Text style={styles.rankNumber}>#{currentUserRank}</Text>
          </View>
          <Text style={styles.rankSubtitle}>Keep practicing to climb up!</Text>
        </View>
      )}

      {/* Period Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodScroll}
      >
        {periodOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.periodButton,
              period === opt.value && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(opt.value)}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === opt.value && styles.periodButtonTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        {categoryOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.categoryButton,
              category === opt.value && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(opt.value)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                category === opt.value && styles.categoryButtonTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : currentLeaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No leaderboard data</Text>
          </View>
        ) : (
          currentLeaderboard.map((entry) => (
            <View
              key={entry.userId}
              style={[
                styles.entryContainer,
                entry.isCurrentUser && styles.entryCurrentUser,
              ]}
            >
              <View style={styles.rankBadge}>
                <Ionicons
                  name={getRankIcon(entry.rank)}
                  size={24}
                  color={getRankColor(entry.rank)}
                />
              </View>

              <View style={styles.entryContent}>
                <Text style={styles.entryName}>{entry.userName}</Text>
                <View style={styles.entryMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.metaText}>{entry.points}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color={colors.primary} />
                    <Text style={styles.metaText}>{entry.totalTime}m</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="flame" size={14} color="#FF6B6B" />
                    <Text style={styles.metaText}>{entry.streak}d</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>#{entry.rank}</Text>
              </View>
            </View>
          ))
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
  rankCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: spacing.md,
  },
  rankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: spacing.lg,
  },
  rankSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  periodScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryButtonActive: {
    borderBottomColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  entryCurrentUser: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  entryContent: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    fontSize: 11,
    color: '#999',
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  rankNumber: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  rankNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LeaderboardScreen;
