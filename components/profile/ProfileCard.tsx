/**
 * ProfileCard Component (React Native)
 * 
 * User profile card with avatar, name, email, plan badge, and upgrade button.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ProfileData } from '@/types/profile';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface ProfileCardProps {
  profile: ProfileData | null;
  planType: string;
}

export function ProfileCard({ profile, planType }: ProfileCardProps) {
  const navigation = useNavigation();

  const handleUpgrade = () => {
    (navigation as any).navigate('ProfileStack', {
      screen: 'SubscriptionScreen',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {profile?.profile_picture ? (
          <Image
            source={{ uri: profile.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {profile?.full_name || 'Unknown User'}
          </Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{planType}</Text>
          </View>
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {profile?.email || 'No email found'}
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
          activeOpacity={0.7}
        >
          <Ionicons name="diamond" size={16} color="#fff" />
          <Text style={styles.upgradeButtonText}>
            {planType === 'Free' ? 'Upgrade Now' : 'Manage Subscription'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  planBadge: {
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  email: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '90%',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
