import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getInitials, resolveApiAssetUrl } from '@/utils/community';

export interface CommunityAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  isOnline?: boolean;
  className?: string;
  fallbackClassName?: string;
  labelClassName?: string;
}

export function CommunityAvatar({
  name,
  src,
  size = 48,
  isOnline = false,
}: CommunityAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedSrc = useMemo(() => resolveApiAssetUrl(src), [src]);
  const showImage = Boolean(resolvedSrc && !hasImageError);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showImage ? (
        <Image
          source={{ uri: resolvedSrc || undefined }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <LinearGradient
          colors={['rgba(110,84,255,0.95)', 'rgba(41,73,255,0.72)']}
          start={{ x: 0.55, y: 0 }}
          end={{ x: 0.45, y: 1 }}
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: Math.max(12, Math.round(size * 0.28)) },
            ]}
          >
            {getInitials(name)}
          </Text>
        </LinearGradient>
      )}
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size >= 48 ? 14 : 11,
              height: size >= 48 ? 14 : 11,
              borderRadius: (size >= 48 ? 14 : 11) / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexShrink: 0,
  },
  image: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: 'rgba(17,20,44,0.32)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 6,
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: '#3DFF9A',
    borderWidth: 2,
    borderColor: '#0A0E1D',
    shadowColor: 'rgba(61,255,154,0.65)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 4,
  },
});
