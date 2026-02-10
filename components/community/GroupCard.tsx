/**
 * GroupCard Component (React Native)
 * 
 * Individual group card for discovery view.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Group } from '@/types/community';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface GroupCardProps {
  group: Group;
  isJoined: boolean;
  onJoin: (groupId: number) => void;
  joiningGroupId: number | null;
  onGroupClick?: (groupId: number) => void;
}

export function GroupCard({ group, isJoined, onJoin, joiningGroupId, onGroupClick }: GroupCardProps) {
  const getActivityLevel = (group: Group) => {
    const members = group.member_count || 0;
    if (members > 50) {
      return { level: 'Very Active', color: '#10b981', icon: 'trending-up' as const };
    }
    if (members > 20) {
      return { level: 'Active', color: '#6A5AE0', icon: 'time' as const };
    }
    return { level: 'New', color: '#a855f7', icon: 'sparkles' as const };
  };

  const activityLevel = getActivityLevel(group);

  const handlePress = () => {
    onGroupClick?.(group.id);
  };

  const handleJoinPress = (e: any) => {
    e.stopPropagation();
    onJoin(group.id);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{group.category || 'General'}</Text>
          </View>
          {group.description && (
            <Text style={styles.description} numberOfLines={2}>
              {group.description}
            </Text>
          )}
        </View>
        {isJoined ? (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedText}>Joined</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, joiningGroupId === group.id && styles.joinButtonDisabled]}
            onPress={handleJoinPress}
            disabled={joiningGroupId === group.id}
          >
            <Text style={styles.joinButtonText}>
              {joiningGroupId === group.id ? 'Joining...' : 'Join'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {group.cover_image ? (
            <Image
              source={{ uri: group.cover_image }}
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverText}>
                {(group.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#9ca3af" />
              <Text style={styles.statText}>{group.member_count || 0} members</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name={activityLevel.icon} size={16} color={activityLevel.color} />
              <Text style={[styles.statText, { color: activityLevel.color }]}>
                {activityLevel.level}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  infoContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  category: {
    fontSize: 14,
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  joinedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  joinedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coverImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  coverPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  coverText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
