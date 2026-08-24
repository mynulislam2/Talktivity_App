/**
 * Profile Screen (React Native)
 *
 * Profile overview — matches talktivity_frontend/app/profile/page.tsx EXACTLY.
 * Order: ProfileCard, International subscription, HeroStats, CEFR, Activity, More Progress Insights + ProgressGrid
 * NO SettingsMenu (that's not on the frontend profile page)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenBackground from '../../components/common/ScreenBackground';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadProfile, loadProgressStats } from '@/store/slices/profileSlice';
import {
  loadSubscriptionStatus,
  selectCurrentSubscription,
} from '@/store/slices/subscriptionSlice';
import { profileService } from '@/services/profile';
import {
  ProfileCard,
  ProfileHeroStats,
  ProfileActivityCard,
  CEFRProgressCard,
  ProgressGrid,
  ProfileLoadingState,
  ProfileErrorState,
  ProgressPageShell,
  ProgressScreenHeader,
} from '@/components/profile';
import { useProfileData, useProfileRefresh } from '@/hooks/profile';
import type { ProfileScreenProps } from '@/navigation/types';

function formatSubscriptionDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);

  useEffect(() => {
    dispatch(loadProfile());
    dispatch(loadProgressStats());
    dispatch(loadSubscriptionStatus());
  }, [dispatch]);

  const { profile, progressStats, proficiency, isLoading, error, refresh } =
    useProfileData();
  useProfileRefresh();

  const currentSubscription = useAppSelector(selectCurrentSubscription);
  const subscriptionDetails = (currentSubscription as any)?.subscription;
  const planType = (currentSubscription as any)?.planType || 'Free';
  const isProActive = Boolean((currentSubscription as any)?.active);
  const isInternationalSubscription =
    isProActive && subscriptionDetails?.provider === 'lemonsqueezy';
  const isInternationalCancelled = subscriptionDetails?.status === 'cancelled';
  const internationalEndDate = formatSubscriptionDate(
    subscriptionDetails?.end_date || subscriptionDetails?.renews_at
  );

  const [billingAction, setBillingAction] = useState<
    'portal' | 'cancel' | null
  >(null);
  const [billingFeedback, setBillingFeedback] = useState<string | null>(null);

  const openProfileImagePicker = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsUploadingProfileImage(true);
        try {
          const response = await profileService.updateProfilePicture(
            result.assets[0].uri
          );
          if (!response.success) {
            Alert.alert(
              'Error',
              response.error || 'Failed to update profile picture.'
            );
          } else {
            await refresh();
          }
        } finally {
          setIsUploadingProfileImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  if (isLoading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <ProfileLoadingState />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <ProfileErrorState error={error} onRetry={refresh} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
      <ProgressPageShell
        activeTab="profile"
        header={
          <ProgressScreenHeader
            onSettingsClick={() =>
              navigation.navigate('ProfileStack', { screen: 'SettingsScreen' })
            }
          />
        }
      >
        {/* No onUpgradePress: this app has no working upgrade/checkout
            screen yet, so ProfileCard renders the Upgrade button visibly
            disabled rather than wiring it to a route that doesn't exist. */}
        <ProfileCard
          profile={profile}
          planType={planType}
          isProActive={isProActive}
          proficiency={proficiency}
          onProfileImageClick={openProfileImagePicker}
          isUploadingProfileImage={isUploadingProfileImage}
        />

        {/* International Subscription Section — matches frontend exactly */}
        {isInternationalSubscription ? (
          <View style={styles.subscriptionCard}>
            <View>
              <Text style={styles.subscriptionTitle}>
                International subscription
              </Text>
              <Text style={styles.subscriptionDesc}>
                {isInternationalCancelled
                  ? `Cancelled. Active until ${
                      internationalEndDate || 'the paid period ends'
                    }.`
                  : internationalEndDate
                  ? `Renews on ${internationalEndDate}.`
                  : 'Active recurring billing.'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.subscriptionButton}
              disabled={billingAction !== null}
              activeOpacity={0.7}
            >
              <Ionicons name="open-outline" size={16} color="#fff" />
              <Text style={styles.subscriptionButtonText}>
                {billingAction === 'portal' ? 'Opening...' : 'Manage billing'}
              </Text>
            </TouchableOpacity>

            {!isInternationalCancelled ? (
              <TouchableOpacity
                style={styles.cancelButton}
                disabled={billingAction !== null}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#ff9aa3"
                />
                <Text style={styles.cancelButtonText}>
                  {billingAction === 'cancel'
                    ? 'Cancelling...'
                    : 'Cancel renewal'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {billingFeedback ? (
              <Text style={styles.billingFeedback}>{billingFeedback}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Hero Stats — mb-4 */}
        <View style={styles.mb4}>
          <ProfileHeroStats progressStats={progressStats} />
        </View>

        {/* CEFR Progress — mb-4 */}
        <View style={styles.mb4}>
          <CEFRProgressCard
            proficiency={proficiency}
            startingLevel={profile?.startingLevel}
          />
        </View>

        {/* Activity — mb-8 (32px) matching frontend */}
        <View style={styles.mb8}>
          <ProfileActivityCard progressStats={progressStats} />
        </View>

        {/* More Progress Insights — matches frontend exactly */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>More Progress Insights</Text>
            <Text style={styles.insightsDesc}>
              Detailed practice and quiz metrics from your existing profile
              APIs.
            </Text>
          </View>
          <ProgressGrid progressStats={progressStats} />
        </View>
      </ProgressPageShell>
    </SafeAreaView>
   </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mb4: {
    marginBottom: 16,
    marginTop: 16,
  },
  mb8: {
    marginBottom: 32,
    marginTop: 16,
  },
  subscriptionCard: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(47,47,76,0.5)',
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 23,
    color: '#fff',
  },
  subscriptionDesc: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#c6c6c6',
    marginTop: 4,
  },
  subscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(249,249,249,0.4)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    borderRadius: 6,
  },
  subscriptionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,122,132,0.45)',
    backgroundColor: 'rgba(255,46,46,0.1)',
    paddingVertical: 12,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#ff9aa3',
  },
  billingFeedback: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
  },
  insightsSection: {
    marginBottom: 32,
  },
  insightsHeader: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  insightsDesc: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
});

export default ProfileScreen;
