/**
 * UserProfilePopup Component (React Native)
 *
 * Modal popup showing user profile info with online status and action buttons.
 * Uses app-wide design tokens: dark bg, gradient buttons.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/colors';

export interface UserProfilePopupProps {
  visible: boolean;
  user: {
    id: number;
    full_name?: string;
    profile_picture?: string;
    level?: string;
  } | null;
  onClose: () => void;
  onMessage: (userId: number) => void;
  isOnline?: boolean;
  lastSeen?: string;
}

export function UserProfilePopup({
  visible,
  user,
  onClose,
  onMessage,
  isOnline,
  lastSeen,
}: UserProfilePopupProps) {
  if (!user) return null;

  const initial = (user.full_name || 'U').charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          {/* Profile Content */}
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {user.profile_picture ? (
                  <Image
                    source={{ uri: user.profile_picture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                )}

                {/* Online/Offline badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isOnline ? styles.statusOnline : styles.statusOffline,
                  ]}
                >
                  <Ionicons
                    name={isOnline ? 'wifi' : 'wifi-outline'}
                    size={12}
                    color="#fff"
                  />
                </View>
              </View>

              <Text style={styles.userName}>{user.full_name || 'User'}</Text>

              {user.level && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Level {user.level}</Text>
                </View>
              )}

              {/* Status */}
              <View style={styles.statusRow}>
                {isOnline ? (
                  <>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>Online now</Text>
                  </>
                ) : lastSeen ? (
                  <>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.statusText}>Last seen {lastSeen}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.offlineDot} />
                    <Text style={styles.statusText}>Offline</Text>
                  </>
                )}
              </View>
            </View>

            {/* Send Message button with gradient */}
            <TouchableOpacity
              onPress={() => onMessage(user.id)}
              activeOpacity={0.85}
              style={styles.messageButtonWrapper}
            >
              <LinearGradient
                colors={['#2C5BFF', '#A45DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.messageGradient}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                <Text style={styles.messageButtonText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#20233f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3d3e50',
    width: '100%',
    maxWidth: 360,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#2949ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#20233f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOnline: {
    backgroundColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: '#6b7280',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#93c5fd',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
  },
  messageButtonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});
