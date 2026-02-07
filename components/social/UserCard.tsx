/**
 * User Card Component
 * 
 * Display user profile in card format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface UserCardProps {
  userId: string;
  name: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  level?: string;
  points?: number;
  onPress?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  userId,
  name,
  avatar,
  status,
  isOnline = false,
  level,
  points,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        )}
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        {status && <Text style={styles.status}>{status}</Text>}
        {level && <Text style={styles.level}>Level {level}</Text>}
      </View>

      {points !== undefined && (
        <View style={styles.pointsContainer}>
          <Ionicons name="trophy" size={16} color={colors.primary} />
          <Text style={styles.points}>{points}</Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    bottom: 0,
    right: 0,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: 12,
    color: '#999',
  },
  level: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
});

export default UserCard;
