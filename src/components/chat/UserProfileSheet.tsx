import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface UserProfileSheetUser {
  id: number;
  full_name?: string;
  profile_picture?: string | null;
  level?: string | null;
}

export interface UserProfileSheetProps {
  visible: boolean;
  user: UserProfileSheetUser | null;
  isOnline?: boolean;
  lastSeen?: string;
  loadingMessage?: string | null;
  onClose: () => void;
  onMessage: (userId: number) => void;
}

export const UserProfileSheet: React.FC<UserProfileSheetProps> = ({
  visible,
  user,
  isOnline,
  lastSeen,
  loadingMessage,
  onClose,
  onMessage,
}) => {
  if (!user) return null;

  const initials = (user.full_name || 'U').charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={18} color="#e5e7eb" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              {user.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
              )}
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? '#22c55e' : '#4b5563' },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.nameText} numberOfLines={1}>
              {user.full_name || 'User'}
            </Text>

            {!!user.level && (
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>Level {user.level}</Text>
              </View>
            )}

            <View style={styles.statusRow}>
              {isOnline ? (
                <>
                  <View style={styles.statusDotSmall} />
                  <Text style={styles.statusLabel}>Online now</Text>
                </>
              ) : lastSeen ? (
                <Text style={styles.statusLabel}>Last seen {lastSeen}</Text>
              ) : (
                <Text style={styles.statusLabel}>Offline</Text>
              )}
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.messageButton}
              activeOpacity={0.85}
              onPress={() => onMessage(user.id)}
              disabled={!!loadingMessage}
            >
              {loadingMessage ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.messageButtonText} numberOfLines={1}>
                    {loadingMessage}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="chatbubbles" size={18} color="#fff" />
                  <Text style={styles.messageButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#020617',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    borderTopWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#e5e7eb',
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(129, 140, 248, 0.6)',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#020617',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#f9fafb',
    marginTop: spacing.sm,
  },
  levelPill: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  levelText: {
    fontSize: 12,
    color: '#bfdbfe',
    fontWeight: '500', fontFamily: 'Poppins-Medium',
  },
  statusRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionsSection: {
    marginTop: spacing.lg,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    gap: spacing.sm,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#f9fafb',
  },
});
