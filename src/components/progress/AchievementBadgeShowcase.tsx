/**
 * AchievementBadgeShowcase Component (React Native)
 *
 * Hexagonal badge display with SVG glyph icons — matches frontend.
 * Shows up to 2 featured badges in a row.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { scale } from '@/theme/responsive';
import Svg, {
  Path,
  Circle,
  Defs,
  ClipPath,
  Polygon,
  Rect,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import type { UserAchievements } from '@/services/course';

interface AchievementBadgeShowcaseProps {
  achievements: UserAchievements | null;
}

const HEXAGON_POINTS = '25,6.7 75,6.7 100,50 75,93.3 25,93.3 0,50';

function FireGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Path
        d="M16 4.8c1.2 3.45 4.7 5.3 4.7 9.36 0 2.12-1 3.84-2.92 5.42.05-1.56-.58-2.88-1.92-4.1-2.76 1.7-4.2 3.62-4.2 6.28 0 3.42 2.5 5.88 6.04 5.88 3.92 0 6.7-2.92 6.7-7.08 0-5.24-3.84-8.86-8.4-15.76Z"
        fill="#fff1cb"
      />
      <Path
        d="M16.1 11.3c.72 1.46 2 2.38 2 4.12 0 1.4-.77 2.47-2.33 3.34-.16-.82-.58-1.53-1.27-2.1-1.18.8-1.78 1.73-1.78 2.84 0 1.65 1.17 2.8 2.83 2.8 1.86 0 3.17-1.35 3.17-3.33 0-2.42-1.54-4.15-2.62-7.67Z"
        fill="#ff7f2f"
      />
    </Svg>
  );
}

function TrophyGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Path
        d="M10.2 6.8h11.6v3.04a5.8 5.8 0 0 1-4.33 5.6v2.72h3.07a1.4 1.4 0 0 1 1.4 1.4v1.5H9.98v-1.5a1.4 1.4 0 0 1 1.4-1.4h3.08v-2.72a5.8 5.8 0 0 1-4.26-5.6V6.8Z"
        fill="#fff5ca"
      />
      <Path
        d="M8.2 8.15H5.9a1.9 1.9 0 0 0-1.9 1.9c0 2.75 2.22 4.98 4.97 4.98h1.12M23.8 8.15h2.3a1.9 1.9 0 0 1 1.9 1.9c0 2.75-2.22 4.98-4.97 4.98H22.1"
        stroke="#fff5ca"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SparkleGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Path
        d="M16 5.4 18.2 11l5.9 2.2-5.9 2.12L16 21l-2.2-5.67-5.9-2.12L13.8 11 16 5.4Z"
        fill="white"
      />
      <Path
        d="m23.4 18.8 1.03 2.48 2.47 1.03-2.47 1-1.03 2.5-1-2.5-2.5-1 2.5-1.03 1-2.48Z"
        fill="#dff1ff"
      />
    </Svg>
  );
}

function TargetGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Circle cx="16" cy="16" r="9.5" stroke="white" strokeWidth="2.2" />
      <Circle cx="16" cy="16" r="5.3" stroke="white" strokeWidth="2.2" />
      <Circle cx="16" cy="16" r="1.9" fill="white" />
      <Path
        d="m18.7 13.3 5.2-5.2"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BookGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Path
        d="M8.2 8.3c0-1.22.98-2.2 2.2-2.2h12.05c.76 0 1.38.62 1.38 1.38v15.8c0 .76-.62 1.38-1.38 1.38H11.1a2.9 2.9 0 0 0-2.9 2.9V8.3Z"
        fill="white"
      />
      <Path
        d="M11.3 10.7h8.3M11.3 14.7h8.3M11.3 18.7h5.1"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BrainGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Path
        d="M11.4 8.2a4 4 0 0 0-3.98 4c0 1.08.43 2.07 1.14 2.79A4.2 4.2 0 0 0 11 22.46V24.2a2.3 2.3 0 1 0 4.6 0v-2.6m.8-13.4a4 4 0 0 1 3.98 4c0 1.08-.43 2.07-1.14 2.79A4.2 4.2 0 0 1 21 22.46V24.2a2.3 2.3 0 1 1-4.6 0v-2.6"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 7.2v17.1M12.2 12.1c1.2.12 2.1.63 2.9 1.55M19.8 12.1c-1.2.12-2.1.63-2.9 1.55M12.45 18c1.12.14 2.03.6 2.75 1.4M19.55 18c-1.12.14-2.03.6-2.75 1.4"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ClockGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Circle cx="16" cy="16" r="9.1" stroke="white" strokeWidth="2.2" />
      <Path
        d="M16 10.9v5.6l3.55 2.15"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ShieldGlyph() {
  return (
    <Svg viewBox="0 0 32 32" width={40} height={40} fill="none">
      <Path
        d="M16 5.8 23.4 8v6.16c0 4.54-2.85 8.54-7.4 10.42-4.55-1.88-7.4-5.88-7.4-10.42V8L16 5.8Z"
        fill="white"
      />
      <Path
        d="m12.55 15.9 2.23 2.2 4.67-4.95"
        stroke="white"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const BADGE_META: Record<
  string,
  {
    icon: React.ComponentType<any>;
    ringColor1: string;
    ringColor2: string;
    fillColor1: string;
    fillColor2: string;
    iconTone: string;
  }
> = {
  streak_7: {
    icon: FireGlyph,
    ringColor1: '#5b4dbe',
    ringColor2: '#7c3aed',
    fillColor1: '#4338ca',
    fillColor2: '#6d28d9',
    iconTone: '#fff1cb',
  },
  streak_30: {
    icon: TrophyGlyph,
    ringColor1: '#7c3aed',
    ringColor2: '#a855f7',
    fillColor1: '#5b21b6',
    fillColor2: '#7c3aed',
    iconTone: '#fff5ca',
  },
  perfect_score: {
    icon: SparkleGlyph,
    ringColor1: '#4338ca',
    ringColor2: '#6366f1',
    fillColor1: '#3730a3',
    fillColor2: '#4f46e5',
    iconTone: '#fff',
  },
  high_achiever: {
    icon: TargetGlyph,
    ringColor1: '#6366f1',
    ringColor2: '#8b5cf6',
    fillColor1: '#4338ca',
    fillColor2: '#7c3aed',
    iconTone: '#fff',
  },
  dedicated_learner: {
    icon: BookGlyph,
    ringColor1: '#4338ca',
    ringColor2: '#6d28d9',
    fillColor1: '#312e81',
    fillColor2: '#4338ca',
    iconTone: '#fff',
  },
  quiz_master: {
    icon: BrainGlyph,
    ringColor1: '#7c3aed',
    ringColor2: '#a855f7',
    fillColor1: '#5b21b6',
    fillColor2: '#8b5cf6',
    iconTone: '#fff',
  },
  time_master: {
    icon: ClockGlyph,
    ringColor1: '#4338ca',
    ringColor2: '#6366f1',
    fillColor1: '#312e81',
    fillColor2: '#4f46e5',
    iconTone: '#fff',
  },
};

const DEFAULT_META: {
  icon: React.ComponentType<any>;
  ringColor1: string;
  ringColor2: string;
  fillColor1: string;
  fillColor2: string;
  iconTone: string;
} = {
  icon: ShieldGlyph,
  ringColor1: '#4338ca',
  ringColor2: '#6366f1',
  fillColor1: '#312e81',
  fillColor2: '#4f46e5',
  iconTone: '#fff',
};

function BadgeToken({
  badge,
  meta,
}: {
  badge: any;
  meta: {
    icon: React.ComponentType<any>;
    ringColor1: string;
    ringColor2: string;
    fillColor1: string;
    fillColor2: string;
    iconTone: string;
  };
}) {
  const Icon = meta.icon;
  const counterLabel = badge.unlocked
    ? '1/1'
    : badge.progress != null
    ? `${Math.round(badge.progress)}%`
    : '0/1';
  // Two 124pt hexagons plus a 28pt gap need 276pt. A 320pt phone leaves the
  // card ~252pt of content, so the pair used to run past its right edge.
  const size = scale(124);

  return (
    <View style={styles.badgeToken}>
      <View style={[styles.hexagonOuter, { width: size, height: size }]}>
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id={`ring-${badge.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={meta.ringColor1} />
              <Stop offset="100%" stopColor={meta.ringColor2} />
            </LinearGradient>
            <LinearGradient id={`fill-${badge.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={meta.fillColor1} />
              <Stop offset="100%" stopColor={meta.fillColor2} />
            </LinearGradient>
          </Defs>
          {/* Gradient ring border */}
          <Polygon points={HEXAGON_POINTS} fill={`url(#ring-${badge.id})`} />
          {/* Dark inset */}
          <Polygon points="27,9 73,9 96,50 73,91 27,91 4,50" fill="#1e1b4b" />
          {/* Inner fill */}
          <Polygon
            points="30,12 70,12 91,50 70,88 30,88 9,50"
            fill={`url(#fill-${badge.id})`}
          />
          {/* Glow */}
          <Circle cx="50" cy="50" r="14" fill="rgba(255,255,255,0.08)" />
        </Svg>
        {/* Icon overlay */}
        <View style={styles.badgeIconOverlay}>
          <Icon />
        </View>
      </View>
      {/* Counter label */}
      <View style={styles.counterLabel}>
        <Text style={styles.counterText}>{counterLabel}</Text>
      </View>
    </View>
  );
}

function getFeaturedBadges(achievements: UserAchievements | null) {
  if (!achievements?.badges?.length) return [];
  return [...achievements.badges]
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return (b.progress || 0) - (a.progress || 0);
    })
    .slice(0, 2);
}

export function AchievementBadgeShowcase({
  achievements,
}: AchievementBadgeShowcaseProps) {
  const featuredBadges = getFeaturedBadges(achievements);

  if (!featuredBadges.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Badges</Text>
        <Text style={styles.emptyText}>
          Keep practicing to unlock your first badge.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Badges</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesRow}
      >
        {featuredBadges.map((badge) => {
          const meta = BADGE_META[badge.id] || DEFAULT_META;
          return <BadgeToken key={badge.id} badge={badge} meta={meta} />;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.12,
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  badgeToken: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  hexagonOuter: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconOverlay: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterLabel: {
    marginTop: -9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(67,56,202,0.4)',
    backgroundColor: '#2e1065',
    paddingHorizontal: 12,
    paddingVertical: 2,
    shadowColor: 'rgba(67,56,202,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  counterText: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 25,
    color: '#fff',
  },
});
