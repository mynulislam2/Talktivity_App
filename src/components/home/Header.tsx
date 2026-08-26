/**
 * Header Component (React Native)
 *
 * Greeting header with profile picture, streak count — matches frontend exactly.
 * Shows: "Hey {firstName}" + greeting, profile avatar, flame icon + streak.
 */

import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useHeaderProfile, useHeaderStreak } from '@/hooks/header';
import { resolveApiAssetUrl } from '@/utils/community';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';
import { getUpgradeActionState } from '@/utils/subscriptionStatus';
import { tokens } from '@/theme/tokens';
import { useResponsive } from '@/theme/responsive';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';

function UpgradeSparkIcon() {
  return (
    <Svg viewBox="0 0 16 16" width={14} height={14} fill="none">
      <Path
        d="m8 1.8 1.02 2.67 2.78 1.03-2.78.98L8 9.17l-1.02-2.7L4.2 5.5l2.78-1.03L8 1.8Z"
        fill="#fff"
      />
      <Path
        d="m12.1 8.95.52 1.35 1.38.5-1.38.5-.52 1.38-.5-1.38-1.38-.5 1.38-.5.5-1.35Z"
        fill="#fff"
      />
    </Svg>
  );
}

function MiniFlameIcon() {
  return (
    <Svg viewBox="0 0 18 18" width={20} height={20} fill="none">
      <Defs>
        <SvgLinearGradient
          id="headerFlame"
          x1="9"
          y1="1.8"
          x2="9"
          y2="14.25"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FF7365" />
          <Stop offset="0.5" stopColor="#FF5A3F" />
          <Stop offset="1" stopColor="#FF9822" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M9 1.8c.86 2.92 3.67 4.43 3.67 7.45 0 2.83-1.77 5-4.4 5-2.48 0-4.27-1.88-4.27-4.47 0-2.2 1.08-3.73 3.34-5.76.36 1.3 1.08 2.15 2.07 2.8.47-1.63.3-3.16-.4-5.02Z"
        fill="url(#headerFlame)"
      />
      <Path
        d="M9.14 7.1c.62 1.02 1.38 1.66 1.38 2.98 0 1.27-.8 2.15-2.03 2.15-1.12 0-1.91-.82-1.91-1.96 0-.88.42-1.62 1.43-2.63.22.54.6.94 1.13 1.3.2-.65.18-1.24 0-1.84Z"
        fill="#FFD86A"
      />
    </Svg>
  );
}

function getGreetingLabel(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function getFirstName(name?: string | null) {
  if (!name) return 'there';
  const [firstName] = name.trim().split(/\s+/);
  return firstName || 'there';
}

export function Header() {
  const insets = useSafeAreaInsets();
  const { narrow, s } = useResponsive();
  const avatarSize = s(46);
  const { user } = useHeaderProfile();
  const { streak, loading } = useHeaderStreak();
  const profilePicture = resolveApiAssetUrl(user?.profile_picture);
  const subscription = useAppSelector(selectCurrentSubscription);

  const greeting = useMemo(() => getGreetingLabel(new Date()), []);
  const firstName = useMemo(
    () => getFirstName(user?.full_name),
    [user?.full_name]
  );
  const { label: upgradeLabel, canUpgrade } = useMemo(
    () => getUpgradeActionState(subscription),
    [subscription]
  );
  const streakCount = loading ? 0 : streak;

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.container}>
        {/* Left: avatar + greeting */}
        <View style={styles.leftSection}>
          <View
            style={[
              styles.avatarContainer,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}
          >
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.textSection}>
            <Text style={styles.greetingLine} numberOfLines={1}>
              Hey {firstName}
            </Text>
            <Text style={styles.greetingSub} numberOfLines={1}>
              {greeting}
            </Text>
          </View>
        </View>

        {/* Right: streak + upgrade pill */}
        <View style={[styles.rightSection, narrow && styles.rightSectionNarrow]}>
          <View style={styles.streakContainer}>
            <MiniFlameIcon />
            <Text style={styles.streakText}>{streakCount}</Text>
          </View>

          {canUpgrade ? (
            <LinearGradient
              colors={[tokens.color.accent.gradientStart, tokens.color.accent.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeChip}
            >
              <UpgradeSparkIcon />
              <Text style={styles.upgradeChipText} numberOfLines={1}>
                {upgradeLabel}
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.upgradeChip, styles.upgradeChipDisabled]}>
              <UpgradeSparkIcon />
              <Text style={styles.upgradeChipText} numberOfLines={1}>
                {upgradeLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // `flexShrink: 1` (not just `flex: 1`) is what actually lets this column
    // give width back to the streak + upgrade chip on a narrow screen. With
    // `flex: 1` alone the greeting kept its measured width and painted over
    // the chip.
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  avatarContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.92)',
  },
  textSection: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  greetingLine: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.01,
    color: '#fdfdfd',
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: '#fdfdfd',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // The streak and the upgrade chip are the fixed part of this row; the
    // greeting is the part that should give.
    flexShrink: 0,
  },
  rightSectionNarrow: {
    gap: 6,
  },
  upgradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  upgradeChipDisabled: {
    backgroundColor: tokens.color.surface.card,
    opacity: 0.8,
  },
  upgradeChipText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 13.2,
    color: tokens.color.text.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 21.6,
    color: '#fdfdfd',
  },
});
