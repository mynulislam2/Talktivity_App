/**
 * ProfileCard Component (React Native)
 *
 * Profile card matching frontend exactly:
 * - 91px avatar with camera badge icon
 * - Name and CEFR rating line
 * - Plan type display
 * - Edit pencil icon
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileData } from '@/types/profile';
import type { ProficiencyResult } from '@/types/proficiency';
import { ProfileCameraBadgeIcon } from './ProfileVisualIcons';

export interface ProfileCardProps {
  profile: ProfileData | null;
  planType?: string;
  isProActive?: boolean;
  canUpgrade?: boolean;
  upgradeLabel?: 'Upgrade' | 'Upgraded';
  proficiency?: ProficiencyResult | null;
  onProfileImageClick?: () => void;
  isUploadingProfileImage?: boolean;
}

function getStartingLevelCefr(level?: string | null) {
  switch (level) {
    case 'beginner':
      return 'A1';
    case 'intermediate':
      return 'B1';
    case 'upper':
      return 'B2';
    case 'advanced':
      return 'C1';
    default:
      return null;
  }
}

function ProfileEditIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={24} height={24} fill="none">
      <Path
        d="M15.2 4.5l4.3 4.3M8.5 17.5l2.1-5.8a1.7 1.7 0 0 1 .4-.6l9.7-9.7a2.3 2.3 0 0 1 3.2 3.2l-9.7 9.7a1.7 1.7 0 0 1-.6.4l-5.8 2.1Z"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfileCard({
  profile,
  planType = 'Free',
  proficiency,
  onProfileImageClick,
  isUploadingProfileImage = false,
}: ProfileCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const selfRatedLevel = getStartingLevelCefr(profile?.startingLevel);
  const ratingLine = selfRatedLevel
    ? `CEFR ${selfRatedLevel} Self Rated`
    : proficiency &&
      proficiency.confidence !== 'none' &&
      proficiency.overallLevel !== 'Not yet assessed'
    ? `CEFR ${proficiency.overallLevel} AI Rated`
    : 'CEFR Not Yet Assessed';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Avatar with camera badge */}
        <TouchableOpacity
          onPress={onProfileImageClick}
          disabled={isUploadingProfileImage}
          style={styles.avatarWrapper}
          activeOpacity={0.7}
        >
          <View style={styles.avatarInner}>
            {profile?.profile_picture ? (
              <Image
                source={{ uri: profile.profile_picture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile?.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cameraBadge}>
            <ProfileCameraBadgeIcon size={30} />
          </View>
          {isUploadingProfileImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Edit button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileStack', { screen: 'EditProfileScreen' })
          }
          style={styles.editButton}
          activeOpacity={0.7}
        >
          <ProfileEditIcon />
        </TouchableOpacity>
      </View>

      {/* Name & CEFR */}
      <View style={styles.nameSection}>
        <Text style={styles.name}>{profile?.full_name || 'Unknown User'}</Text>
        <Text style={styles.cefrLine}>{ratingLine}</Text>
      </View>

      {/* Plan */}
      <View style={styles.planSection}>
        <View>
          <Text style={styles.planLabel}>Your Plan</Text>
          <Text style={styles.planValue}>{planType}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(47,47,76,0.5)',
    padding: 16,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarInner: {
    width: 91,
    height: 91,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  avatar: {
    width: 91,
    height: 91,
    borderRadius: 46,
  },
  avatarPlaceholder: {
    width: 91,
    height: 91,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 1,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 46,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#3d3e50',
    paddingBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 29,
    letterSpacing: 0.12,
    color: '#fff',
  },
  cefrLine: {
    fontSize: 14,
    lineHeight: 20,
    color: '#c6c6c6',
    marginTop: 4,
  },
  planSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#c6c6c6',
  },
  planValue: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
    marginTop: 4,
  },
});
