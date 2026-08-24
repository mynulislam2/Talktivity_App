/**
 * SettingsMenu Component (React Native)
 *
 * Profile settings menu with navigation items.
 * Matches talktivity_frontend/components/profile/SettingsMenu.tsx
 * EXCLUDES: Upgrade Subscription (payment-related)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { selectProfile } from '@/store/slices/profileSlice';
import { formatLocalDate } from '@/utils/timezoneUtils';
import { performGlobalLogout } from '@/utils/logoutClient';
import type { ProfileData } from '@/types/profile';

export interface SettingsMenuProps {
  profile?: ProfileData | null;
  onAction?: () => void;
}

export function SettingsMenu({
  profile: profileProp,
  onAction,
}: SettingsMenuProps) {
  const profileFromRedux = useAppSelector(selectProfile);
  const profile = profileProp ?? profileFromRedux;
  const navigation = useNavigation<any>();

  const navigate = (screen: string, params?: any) => {
    navigation.navigate('ProfileStack', { screen, params });
    onAction?.();
  };

  const handleLogout = async () => {
    await performGlobalLogout((path: string) => {});
    onAction?.();
  };

  return (
    <View style={styles.container}>
      {/* Edit Profile */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigate('EditProfileScreen')}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="create-outline"
            size={16}
            color="#22d3ee"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Edit Profile</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* Change Password */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigate('ChangePasswordScreen')}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="key-outline"
            size={16}
            color="#818cf8"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Change Password</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* Leaderboard */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('ProfileStack', { screen: 'LeaderboardScreen' })
        }
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="trophy-outline"
            size={16}
            color="#fbbf24"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Leaderboard</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* View Progress */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('LearningStack', { screen: 'ProgressScreen' })
        }
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="bar-chart-outline"
            size={16}
            color="#60a5fa"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>View Progress</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigate('Privacy')}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="shield-outline"
            size={16}
            color="#4ade80"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Privacy Policy</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* Terms and Conditions */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigate('Terms')}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color="#60a5fa"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Terms and Conditions</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* Refund Policy */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigate('Refund')}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="refresh-outline"
            size={16}
            color="#fbbf24"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Refund Policy</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.35)"
        />
      </TouchableOpacity>

      {/* Member Since */}
      <View style={styles.memberSince}>
        <View style={styles.menuItemLeft}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#a78bfa"
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Member Since</Text>
        </View>
        <Text style={styles.memberSinceValue}>
          {profile?.created_at ? formatLocalDate(profile.created_at) : 'N/A'}
        </Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons
          name="log-out-outline"
          size={16}
          color="#ff6f85"
          style={styles.menuIcon}
        />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: '#1d2036',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.38,
    shadowRadius: 50,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginTop: 8,
  },
  memberSinceValue: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#ff6f85',
  },
});
