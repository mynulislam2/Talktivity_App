/**
 * Settings Screen (React Native)
 *
 * App preferences, account settings, subscription management, support links, logout.
 * Matches talktivity_frontend/app/profile/settings/page.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadSubscriptionStatus,
  selectCurrentSubscription,
} from '@/store/slices/subscriptionSlice';
import { LogoutModal } from '@/components/profile/LogoutModal';
import {
  COACH_SPEECH_RATE_OPTIONS,
  formatCoachSpeechRate,
  getCoachSpeechRate,
  setCoachSpeechRate,
} from '@/lib/preferences/userExperiencePreferences';
import { performGlobalLogout } from '@/utils/logoutClient';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { tokens } from '@/theme/tokens';
import ScreenBackground from '../../components/common/ScreenBackground';
import { DevicePermissionsModal } from '@/components/common/DevicePermissionsModal';

interface SettingsScreenProps {
  navigation: any;
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SettingsRow({
  label,
  onPress,
  trailing,
  danger = false,
}: {
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
}) {
  const content = (
    <View style={styles.settingsRow}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.settingsRowTouchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.settingsRowTouchable}>{content}</View>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [coachSpeechRateState, setCoachSpeechRateState] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isPermissionsModalVisible, setIsPermissionsModalVisible] = useState(false);

  const currentSubscription = useAppSelector(selectCurrentSubscription);
  const subscriptionDetails = (currentSubscription as any)?.subscription;
  const isLemonSqueezyActive =
    subscriptionDetails?.provider === 'lemonsqueezy' &&
    Boolean((currentSubscription as any)?.active);
  const isLemonSqueezyCancelled = subscriptionDetails?.status === 'cancelled';

  useEffect(() => {
    (async () => {
      const rate = await getCoachSpeechRate();
      setCoachSpeechRateState(rate);
    })();
  }, []);

  const speedIndex = COACH_SPEECH_RATE_OPTIONS.indexOf(
    coachSpeechRateState as any
  );

  const handleSpeedChange = (direction: -1 | 1) => {
    const nextIndex = Math.min(
      COACH_SPEECH_RATE_OPTIONS.length - 1,
      Math.max(0, speedIndex + direction)
    );
    const nextRate = COACH_SPEECH_RATE_OPTIONS[nextIndex];
    setCoachSpeechRateState(nextRate as any);
    setCoachSpeechRate(nextRate);
    setFeedback(
      `Coach voice speed updated to ${formatCoachSpeechRate(nextRate)}.`
    );
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setIsLogoutModalVisible(false);
    await performGlobalLogout((path: string) => {});
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 16, 61) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Account Section */}
        <View style={styles.sectionsWrapper}>
          <SettingsSection title="Account">
            <SettingsRow
              label="Change Password"
              onPress={() =>
                navigation.navigate('ProfileStack', {
                  screen: 'ChangePasswordScreen',
                })
              }
              trailing={
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              }
            />
            {/*
            <SettingsRow
              label="Aleena Speed"
              trailing={
                <View style={styles.speedControl}>
                  <TouchableOpacity
                    onPress={() => handleSpeedChange(-1)}
                    disabled={speedIndex <= 0}
                    style={[
                      styles.speedBtn,
                      speedIndex <= 0 && styles.speedBtnDisabled,
                    ]}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color="rgba(255,255,255,0.8)"
                    />
                  </TouchableOpacity>
                  <Text style={styles.speedValue}>
                    {formatCoachSpeechRate(coachSpeechRateState as any)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleSpeedChange(1)}
                    disabled={
                      speedIndex >= COACH_SPEECH_RATE_OPTIONS.length - 1
                    }
                    style={[
                      styles.speedBtn,
                      speedIndex >= COACH_SPEECH_RATE_OPTIONS.length - 1 &&
                        styles.speedBtnDisabled,
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color="rgba(255,255,255,0.8)"
                    />
                  </TouchableOpacity>
                </View>
              }
            />
            */}
          </SettingsSection>

          {/* Subscription Section */}
          {isLemonSqueezyActive && (
            <SettingsSection title="Subscription">
              <SettingsRow
                label="Manage subscription"
                onPress={() => {}}
                trailing={
                  <Ionicons name="open-outline" size={20} color="#fff" />
                }
              />
              {!isLemonSqueezyCancelled ? (
                <SettingsRow
                  label="Cancel renewal"
                  onPress={() => {}}
                  danger
                  trailing={
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#ff7a84"
                    />
                  }
                />
              ) : (
                <SettingsRow
                  label="Renewal cancelled"
                  trailing={
                    <Text style={styles.cancelledBadge}>
                      Access remains active
                    </Text>
                  }
                />
              )}
            </SettingsSection>
          )}

          {/* Help & Support Section */}
          <SettingsSection title="Help & Support">
            <SettingsRow
              label="Permissions & Audio Check"
              onPress={() => setIsPermissionsModalVisible(true)}
              trailing={
                <Ionicons name="mic-outline" size={20} color="#fff" />
              }
            />
            <SettingsRow
              label="Terms"
              onPress={() =>
                navigation.navigate('ProfileStack', { screen: 'Terms' })
              }
              trailing={
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              }
            />
            <SettingsRow
              label="Policy"
              onPress={() =>
                navigation.navigate('ProfileStack', { screen: 'Privacy' })
              }
              trailing={
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              }
            />
            <SettingsRow
              label="Refund Policy"
              onPress={() =>
                navigation.navigate('ProfileStack', { screen: 'Refund' })
              }
              trailing={
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              }
            />
          </SettingsSection>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Log Out</Text>
            <Ionicons name="arrow-forward" size={20} color="#ff2e2e" />
          </TouchableOpacity>

          {/* Feedback */}
          {feedback && (
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <LogoutModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />
      
      <DevicePermissionsModal
        visible={isPermissionsModalVisible}
        onClose={() => setIsPermissionsModalVisible(false)}
      />
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  headerSpacer: { flex: 1 },
  backButton: {
    width: tokens.control.height,
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 25,
    color: '#fff',
  },
  sectionsWrapper: {
    gap: 20,
  },
  section: {
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.surface.card,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    color: '#fdfdfd',
  },
  sectionBody: {
    marginTop: 20,
    gap: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  settingsRowTouchable: {
    minHeight: 36,
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#c6c6c6',
    flex: 1,
  },
  rowLabelDanger: {
    color: '#ff7a84',
  },
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#242e6b',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  speedBtn: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedBtnDisabled: {
    opacity: 0.35,
  },
  speedValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    color: '#c6c6c6',
  },
  cancelledBadge: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.55)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 16,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#ff7a84',
  },
  feedbackBanner: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  feedbackText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default SettingsScreen;
