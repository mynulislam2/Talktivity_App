/**
 * Header Component (React Native)
 * 
 * Header component matching Next.js Header component exactly.
 * Shows user profile picture, name, and streak counter.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderProfile, useHeaderStreak } from '@/hooks/header';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export function Header() {
  const insets = useSafeAreaInsets();
  const { user } = useHeaderProfile();
  const { streak, loading } = useHeaderStreak();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.avatarContainer}>
            {user?.profile_picture ? (
              <Image
                source={{ uri: user.profile_picture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color={colors.white} />
              </View>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.full_name || 'User'}
            </Text>
          </View>
        </View>
        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>
            {loading ? '...' : `${streak} Days`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#181837',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: spacing.sm,
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6A5AE0',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    borderWidth: 2,
    borderColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    minWidth: 0,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  streakEmoji: {
    fontSize: 13,
    marginRight: spacing.xs,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
});
