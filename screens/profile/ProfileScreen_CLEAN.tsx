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

import { useProfile } from '../../Hooks/useProfile';
import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsCard, { StatItemData } from '../../components/profile/StatsCard';
import SettingsItem from '../../components/profile/SettingsItem';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const profile = useProfile();

  useEffect(() => {
    // Initial load handled in hook, but can refresh manually
    const unsubscribe = navigation.addListener('focus', () => {
      profile.loadProfile();
    });

    return unsubscribe;
  }, [navigation, profile]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            dispatch(logoutUser());
          },
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  };

  if (profile.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile.profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => profile.loadProfile()}
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
      value: `${profile.profile.totalStudyTime || 0}h`,
      icon: 'timer-outline',
      color: colors.primary,
    },
    {
      label: 'Streak',
      value: `${profile.profile.currentStreak || 0}d`,
      icon: 'flame',
      color: '#FF6B6B',
    },
    {
      label: 'Points',
      value: (profile.profile.totalPoints || 0).toString(),
      icon: 'star',
      color: '#FFB800',
    },
  ];

  const memberSinceDate = new Date(profile.profile.joinDate).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileHeader
          name={profile.profile.fullName}
          username={profile.profile.username}
          avatar={profile.profile.avatar}
          email={profile.profile.email}
          level={profile.profile.preferredLevel}
          onEditPress={() => navigation.navigate('EditProfileScreen')}
          onAvatarPress={() => {
            // TODO: Implement avatar change with image picker
            console.log('Avatar press - implement image picker');
          }}
        />

        {/* Statistics */}
        <View style={styles.section}>
          <StatsCard stats={stats} columns={3} />
        </View>

        {/* Bio Section */}
        {profile.profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{profile.profile.bio}</Text>
            </View>
          </View>
        )}

        {/* Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Account</Text>
          <SettingsItem
            icon="create-outline"
            label="Edit Profile"
            description="Update your personal information"
            onPress={() => navigation.navigate('EditProfileScreen')}
          />
          <SettingsItem
            icon="settings-outline"
            label="Settings"
            description="App preferences and account settings"
            onPress={() => navigation.navigate('SettingsScreen')}
          />
          <SettingsItem
            icon="card-outline"
            label="Subscription"
            description="Manage your plan and billing"
            onPress={() => navigation.navigate('SubscriptionScreen')}
          />
        </View>

        {/* Member Info */}
        <View style={styles.section}>
          <View style={styles.memberCard}>
            <Text style={styles.memberLabel}>Member since</Text>
            <Text style={styles.memberDate}>{memberSinceDate}</Text>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <SettingsItem
            icon="log-out-outline"
            label="Logout"
            description="Sign out from your account"
            isDanger={true}
            onPress={handleLogout}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Talktivity v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  bioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  memberDate: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
