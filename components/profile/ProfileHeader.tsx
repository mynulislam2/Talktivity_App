/**
 * Profile Header Component
 * 
 * User profile header with avatar and basic info
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface ProfileHeaderProps {
  name: string;
  username: string;
  avatar?: string;
  email: string;
  level: string;
  onEditPress?: () => void;
  onAvatarPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  username,
  avatar,
  email,
  level,
  onEditPress,
  onAvatarPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarPress}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.username}>@{username}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={16} color="#999" />
          <Text style={styles.infoText}>{email}</Text>
        </View>
      </View>

      <View style={styles.levelBadge}>
        <Ionicons name="medal" size={16} color={colors.primary} />
        <Text style={styles.levelText}>{level}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.sm,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: 14,
    color: '#999',
    marginBottom: spacing.md,
  },
  infoRow: {
    width: '100%',
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginLeft: spacing.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default ProfileHeader;
