/**
 * GroupCard Component (React Native)
 *
 * Individual group card for discovery view.
 * Matches talktivity_frontend/components/community/GroupCard.tsx exactly.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Group } from '@/types/community';
import { CommunityAvatar } from './CommunityAvatar';
import { tokens } from '@/theme/tokens';

export interface GroupCardProps {
  group: Group;
  isJoined: boolean;
  onJoin: (groupId: number) => void;
  joiningGroupId: number | null;
  onGroupClick?: (groupId: number) => void;
}

const getActivityLevel = (memberCount: number) => {
  if (memberCount > 50) return 'Very Active';
  if (memberCount > 20) return 'Active';
  return 'New';
};

export function GroupCard({
  group,
  isJoined,
  onJoin,
  joiningGroupId,
  onGroupClick,
}: GroupCardProps) {
  const activity = getActivityLevel(group.member_count || 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (isJoined) onGroupClick?.(group.id);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.inner}>
        {/* Row 1: name + category | join button */}
        <View style={styles.row1}>
          <View style={styles.nameSection}>
            <CommunityAvatar
              name={group.name}
              src={group.cover_image}
              size={48}
            />
            <View style={styles.nameInfo}>
              <Text style={styles.groupName} numberOfLines={1}>
                {group.name}
              </Text>
              <Text style={styles.category}>{group.category || 'General'}</Text>
            </View>
          </View>

          {isJoined ? (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onJoin(group.id);
              }}
              disabled={joiningGroupId === group.id}
              activeOpacity={0.7}
              style={{ borderRadius: 100, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={['#2C5BFF', '#A45DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.joinButton,
                  joiningGroupId === group.id && styles.joinButtonDisabled,
                ]}
              >
                <Text style={styles.joinButtonText}>
                  {joiningGroupId === group.id ? '...' : 'Join'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Row 2: description */}
        <Text style={styles.description} numberOfLines={2}>
          {group.description || 'A group for all users'}
        </Text>

        {/* Row 3: member count | activity */}
        <View style={styles.row3}>
          <View style={styles.memberSection}>
            <Ionicons name="people" size={18} color="rgba(255,255,255,0.64)" />
            <Text style={styles.memberText}>
              {group.member_count || 0} members
            </Text>
          </View>
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>{activity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    padding: 20,
    shadowColor: 'rgba(4,8,22,0.16)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 38,
    elevation: 8,
  },
  inner: {
    gap: 20,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nameInfo: {
    gap: 4,
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 21.6,
    color: '#FDFDFD',
    maxWidth: 180,
  },
  category: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 16.8,
    color: 'rgba(255,255,255,0.58)',
  },
  joinedBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  joinedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  joinButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(101,85,255,0.26)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 8,
    minWidth: 58,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  description: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 21,
    color: '#FDFDFD',
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 16.8,
    color: 'rgba(255,255,255,0.64)',
  },
  activityBadge: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 16.8,
    color: '#FDFDFD',
  },
});
