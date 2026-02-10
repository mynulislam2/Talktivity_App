/**
 * Profile Screen (React Native)
 * 
 * User profile overview with stats and quick actions
 * Matches Next.js /profile page implementation.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/store/hooks';
import { loadProfile, loadProgressStats } from '@/store/slices/profileSlice';
import { Header } from '@/components/home';
import {
  ProfileCard,
  ProgressGrid,
  MonthActivity,
  SettingsMenu,
  ProfileLoadingState,
  ProfileErrorState,
} from '@/components/profile';
import {
  useProfileData,
  useSubscriptionPlan,
  useProfileRefresh,
} from '@/hooks/profile';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { ProfileScreenProps } from '@/navigation/types';

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const dispatch = useAppDispatch();

  // Load data on mount
  useEffect(() => {
    dispatch(loadProfile());
    dispatch(loadProgressStats());
  }, [dispatch]);

  // Custom hooks
  const { profile, progressStats, isLoading, error, refresh } = useProfileData();
  const { planType } = useSubscriptionPlan();
  useProfileRefresh(); // Handles visibility change refresh

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ProfileLoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ProfileErrorState error={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <ProfileCard profile={profile} planType={planType} />

        {/* Progress Overview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
          </View>
          {/* Progress Stats Grid */}
          <ProgressGrid progressStats={progressStats} />
        </View>

        {/* Settings Menu */}
        <SettingsMenu profile={profile} />
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
    paddingHorizontal: 16,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileScreen;
