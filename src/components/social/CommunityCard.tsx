/**
 * Community Card Component
 *
 * Display community/group in card format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface CommunityCardProps {
  communityId: string;
  name: string;
  description: string;
  icon?: string;
  coverImage?: string;
  memberCount: number;
  postsCount: number;
  isJoined?: boolean;
  onPress?: () => void;
  onJoin?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  communityId,
  name,
  description,
  icon,
  coverImage,
  memberCount,
  postsCount,
  isJoined = false,
  onPress,
  onJoin,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {coverImage && (
        <Image source={{ uri: coverImage }} style={styles.coverImage} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          {icon && <Image source={{ uri: icon }} style={styles.icon} />}
          {!icon && (
            <View style={styles.iconPlaceholder}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.meta}>
              {memberCount} members • {postsCount} posts
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {onJoin && !isJoined && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={onJoin}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}

        {isJoined && (
          <View style={styles.joinedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.joinedText}>Joined</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginLeft: spacing.sm,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  joinedText: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default CommunityCard;
