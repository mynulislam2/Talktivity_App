/**
 * Profile Screen
 * 
 * User profile overview with stats and quick actions
 */

import React, { useEffect } from 'react';
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
import { loadProfile, selectProfile, selectProfileLoading, selectProfileError } from '../../store/slices/profileSlice';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsCard, { StatItemData } from '../../components/profile/StatsCard';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  // Load profile on mount
  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  // Reload profile when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(loadProfile());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#f44336" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(loadProfile())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats: StatItemData[] = [
    {
      label: 'Study Time',
      value: `${profile.totalStudyTime}h`,
      icon: 'time',
      color: colors.primary,
    },
    {
      label: 'Current Streak',
      value: `${profile.currentStreak}d`,
      icon: 'flame',
      color: '#FF6B6B',
    },
    {
      label: 'Total Points',
      value: profile.totalPoints,
      icon: 'trophy',
      color: '#FFB800',
    },
  ];

  const quickActions = [
    {
      id: 'edit',
      icon: 'create-outline',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfileScreen'),
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => navigation.navigate('SettingsScreen'),
    },
    {
      id: 'subscription',
      icon: 'card-outline',
      label: 'Subscription',
      onPress: () => navigation.navigate('SubscriptionScreen'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ProfileHeader
          name={profile.fullName}
          username={profile.username}
          avatar={profile.avatar}
          email={profile.email}
          level={profile.preferredLevel}
          onEditPress={() => navigation.navigate('EditProfileScreen')}
        />

        {/* Statistics */}
        <StatsCard stats={stats} columns={3} />

        {/* Bio Section */}
        {profile.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Member Since</Text>
          <Text style={styles.infoText}>
            {new Date(profile.profile.joinDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* App Version */}
        <View style={styles.footerSection}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bioSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: spacing.md,
  },
  bioText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  actionsSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  infoSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: '#000',
  },
  footerSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});



