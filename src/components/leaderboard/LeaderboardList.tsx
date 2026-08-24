/**
 * LeaderboardList Component (React Native)
 *
 * Displays the leaderboard with rank medals, avatars, XP — matches frontend design.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import type { LeaderboardUser, LeaderboardType } from '@/types/leaderboard';
import { spacing } from '@/styles/spacing';

export interface LeaderboardListProps {
  leaderboard: LeaderboardUser[];
  leaderboardType: LeaderboardType;
}

function calcRowTone(position: number) {
  if (position === 1)
    return { bg: 'rgba(14,85,255,0.28)', border: 'rgba(99,102,241,0.3)' };
  if (position === 2)
    return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.06)' };
  if (position === 3)
    return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.06)' };
  return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.06)' };
}

/** Medal SVG for top 3 positions */
function RankMedal({ position }: { position: number }) {
  const colors = {
    1: {
      outer: '#d4a017',
      mid: '#f5d442',
      inner: '#fffbe6',
      ring: '#b8860b',
      text: '#7a5400',
      shadow: 'rgba(212,160,23,0.5)',
    },
    2: {
      outer: '#8a8a8a',
      mid: '#c8c8c8',
      inner: '#f0f0f0',
      ring: '#6e6e6e',
      text: '#4a4a4a',
      shadow: 'rgba(138,138,138,0.4)',
    },
    3: {
      outer: '#a0652a',
      mid: '#d4955a',
      inner: '#ffe8d0',
      ring: '#7a4c1e',
      text: '#5c3610',
      shadow: 'rgba(160,101,42,0.4)',
    },
  } as const;

  const c = colors[position as 1 | 2 | 3];
  if (!c) return null;

  return (
    <View
      style={{
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Svg width="36" height="36" viewBox="0 0 40 40">
        <Defs>
          <RadialGradient
            id={`medal-bg-${position}`}
            cx="0.38"
            cy="0.32"
            r="0.65"
          >
            <Stop offset="0%" stopColor={c.inner} />
            <Stop offset="45%" stopColor={c.mid} />
            <Stop offset="100%" stopColor={c.outer} />
          </RadialGradient>
          <RadialGradient
            id={`medal-shine-${position}`}
            cx="0.35"
            cy="0.25"
            r="0.5"
          >
            <Stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="20" cy="20" r="19" fill={c.ring} />
        <Circle cx="20" cy="20" r="17" fill={`url(#medal-bg-${position})`} />
        <Circle
          cx="20"
          cy="20"
          r="14"
          fill="none"
          stroke={c.ring}
          strokeWidth="0.8"
          opacity="0.4"
        />
        <Circle cx="20" cy="20" r="17" fill={`url(#medal-shine-${position})`} />
        <Ellipse
          cx="14"
          cy="12"
          rx="4"
          ry="2.5"
          fill="white"
          opacity="0.35"
          transform="rotate(-20 14 12)"
        />
      </Svg>
      <Text
        style={{
          position: 'absolute',
          fontSize: 16,
          fontWeight: '800',
          fontFamily: 'Poppins-Bold',
          color: c.text,
          textShadowColor: 'rgba(255,255,255,0.4)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 0,
        }}
      >
        {position}
      </Text>
    </View>
  );
}

function RankNumber({ position }: { position: number }) {
  return (
    <View style={{ width: 36, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          fontFamily: 'Poppins-SemiBold',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        {position}
      </Text>
    </View>
  );
}

export function LeaderboardList({
  leaderboard,
  leaderboardType,
}: LeaderboardListProps) {
  return (
    <View style={styles.container}>
      {/* Column headers */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>Rank</Text>
          <Text style={[styles.headerText, { marginLeft: 52 }]}>Users</Text>
        </View>
        <Text style={styles.headerText}>Total XP</Text>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No ranked learners yet. Complete lessons and earn XP to join the
              board.
            </Text>
          </View>
        ) : (
          leaderboard.map((user) => {
            const tone = calcRowTone(user.position);
            const rowContent = (
              <>
                <View style={styles.rowLeft}>
                  {user.position <= 3 ? (
                    <RankMedal position={user.position} />
                  ) : (
                    <RankNumber position={user.position} />
                  )}
                  {user.profile_picture ? (
                    <Image
                      source={{ uri: user.profile_picture }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.xpText}>{user.xp}</Text>
                </View>
              </>
            );

            // Rank 1 gets a blue-to-purple gradient row (matches web).
            if (user.position === 1) {
              return (
                <LinearGradient
                  key={`${leaderboardType}-${user.id}`}
                  colors={['rgba(14,85,255,0.65)', 'rgba(140,70,230,0.55)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.row, { borderColor: tone.border }]}
                >
                  {rowContent}
                </LinearGradient>
              );
            }

            return (
              <View
                key={`${leaderboardType}-${user.id}`}
                style={[
                  styles.row,
                  { backgroundColor: tone.bg, borderColor: tone.border },
                ]}
              >
                {rowContent}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.08,
    color: 'rgba(255,255,255,0.4)',
  },
  listContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    flex: 1,
  },
  rowRight: {},
  xpText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  emptyContainer: {
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
});
