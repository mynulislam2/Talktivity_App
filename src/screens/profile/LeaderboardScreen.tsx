/**
 * Leaderboard Screen (React Native)
 *
 * Rankings and user leaderboard display — matches frontend /leaderboard page.
 * Uses ProgressPageShell with tabs and header.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { useAppDispatch } from '@/store/hooks';
import { setLeaderboardType } from '@/store/slices/leaderboardSlice';
import { ProgressPageShell, ProgressScreenHeader } from '@/components/profile';
import {
  LeaderboardList,
  LeaderboardErrorState,
} from '@/components/leaderboard';
import { useLeaderboardData, useLeaderboardRefresh } from '@/hooks/leaderboard';
import type { LeaderboardScreenProps } from '@/navigation/types';
import type { LeaderboardType, LeaderboardUser } from '@/types/leaderboard';
import { colors } from '@/styles/colors';

const SCOPE_OPTIONS: { value: LeaderboardType; label: string }[] = [
  { value: 'overall', label: 'Global' },
  { value: 'weekly', label: 'This Week' },
];

function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return '0';
  return value >= 1000 ? (value / 1000).toFixed(1) + 'K' : String(value);
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const {
    currentLeaderboard,
    currentUserPosition,
    currentType,
    isLoading,
    error,
    refresh,
  } = useLeaderboardData();

  useLeaderboardRefresh();

  const currentScopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((o) => o.value === currentType)?.label || 'Global',
    [currentType]
  );
  const currentXpLabel = currentType === 'weekly' ? 'Weekly XP' : 'Global XP';

  const handleScopeChange = (scope: LeaderboardType) => {
    dispatch(setLeaderboardType(scope));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A5AE0" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ProgressPageShell
          activeTab="leaderboard"
          header={
            <ProgressScreenHeader
              onSettingsClick={() =>
                navigation.navigate('ProfileStack', {
                  screen: 'SettingsScreen',
                })
              }
            />
          }
        >
          <LeaderboardErrorState error={error} onRetry={refresh} />
        </ProgressPageShell>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ProgressPageShell
        activeTab="leaderboard"
        header={
          <ProgressScreenHeader
            onSettingsClick={() =>
              navigation.navigate('ProfileStack', { screen: 'SettingsScreen' })
            }
          />
        }
      >
        {/* Your position card — matches frontend */}
        <View style={styles.userSection}>
          <View style={styles.userRow}>
            <View style={styles.userLeft}>
              {currentUserPosition ? (
                <>
                  <View style={styles.avatarSm}>
                    <Text style={styles.avatarSmText}>
                      {(currentUserPosition.user.name || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.youLabel}>You</Text>
                    <Text style={styles.xpSubtext}>
                      {currentUserPosition
                        ? formatCompactNumber(currentUserPosition.user.xp)
                        : 'Start earning XP'}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.avatarEmpty}>
                    <Text style={styles.avatarSmText}>Y</Text>
                  </View>
                  <View>
                    <Text style={styles.youLabel}>You</Text>
                    <Text style={styles.xpSubtext}>Start earning XP</Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.userRight}>
              <Text style={styles.xpHeader}>{currentXpLabel}</Text>
              <View style={styles.xpRow}>
                <Text style={styles.xpValue}>
                  {currentUserPosition
                    ? `${formatCompactNumber(currentUserPosition.user.xp)}XP`
                    : '0XP'}
                </Text>
                <Ionicons
                  name="share-outline"
                  size={18}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Scope selector — Dropdown styled as text button */}
        <View style={styles.scopeSection}>
          <Dropdown
            data={SCOPE_OPTIONS}
            value={currentType}
            onChange={(item: any) => handleScopeChange(item.value)}
            labelField="label"
            valueField="value"
            style={styles.scopeDropdown}
            containerStyle={styles.scopeDropdownContainer}
            itemContainerStyle={styles.scopeDropdownItem}
            itemTextStyle={styles.scopeDropdownItemText}
            selectedTextStyle={styles.scopeDropdownSelectedText}
            activeColor="rgba(41,73,255,0.3)"
            placeholder=""
            renderLeftIcon={() => (
              <Ionicons
                name="trophy"
                size={24}
                color="#fbbf24"
                style={{ marginRight: 8 }}
              />
            )}
            renderRightIcon={() => (
              <Ionicons
                name="chevron-down"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            )}
            maxHeight={200}
          />
        </View>

        {/* Leaderboard list container */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <View style={styles.listHeaderLeft}>
              <Text style={styles.listHeaderText}>Rank</Text>
              <Text style={[styles.listHeaderText, { marginLeft: 52 }]}>
                Users
              </Text>
            </View>
            <Text style={styles.listHeaderText}>Total XP</Text>
          </View>

          <View style={styles.listBody}>
            {currentLeaderboard.length > 0 ? (
              currentLeaderboard.map((user) => (
                <LeaderboardRowItem
                  key={`${currentType}-${user.id}`}
                  user={user}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No ranked learners yet. Complete lessons and earn XP to join
                  the board.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Dropdown renders inline below the trigger */}
      </ProgressPageShell>
    </SafeAreaView>
  );
};

function LeaderboardRowItem({ user }: { user: LeaderboardUser }) {
  const getRowStyle = (position: number) => {
    if (position === 1)
      return { bg: 'rgba(14,85,255,0.28)', border: 'rgba(99,102,241,0.3)' };
    return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.06)' };
  };
  const tone = getRowStyle(user.position);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: tone.bg, borderColor: tone.border },
      ]}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rankBox}>
          <Text style={styles.rankText}>{user.position}</Text>
        </View>
        {user.profile_picture ? (
          <Image
            source={{ uri: user.profile_picture }}
            style={styles.rowAvatar}
          />
        ) : (
          <View style={styles.rowAvatarPlaceholder}>
            <Text style={styles.rowAvatarText}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.rowName} numberOfLines={1}>
          {user.name}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowXp}>{user.xp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    marginBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarSm: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarSmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  avatarEmpty: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  youLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 24,
  },
  xpSubtext: {
    fontSize: 14,
    color: '#8c8c8c',
    marginTop: 4,
  },
  userRight: {
    alignItems: 'flex-end',
  },
  xpHeader: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
  },
  scopeSection: {
    marginBottom: 24,
  },
  scopeDropdown: {
    minWidth: 200,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  scopeDropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: '#20233f',
    marginTop: 8,
  },
  scopeDropdownItem: {
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  scopeDropdownItemText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  scopeDropdownSelectedText: {
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: 0.14,
    color: '#fff',
  },
  listContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.08,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  listBody: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  rankBox: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rowAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  rowRight: {},
  rowXp: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  // Scope dropdown rendered via Modal
});

export default LeaderboardScreen;
