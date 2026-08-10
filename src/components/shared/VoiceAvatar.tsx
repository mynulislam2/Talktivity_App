/**
 * VoiceAvatar Component (React Native)
 *
 * Static glowing orb with layered glow effect and teacher image.
 * Matches Next.js CenterAvatar design.
 * Reused by both Practice and Call pages.
 * Voice visualization is handled by the layout gradient overlays, not the avatar.
 */

import React from 'react';
import { View, Image, StyleSheet, useWindowDimensions } from 'react-native';

export interface VoiceAvatarProps {
  imageUrl?: string;
  size?: number;
}

// Base sizes (mobile-first, before multiplier)
const BASE_IMAGE = 120;
const BASE_INNER = 140;
const BASE_GLOW_1 = 190;
const BASE_GLOW_2 = 250;
const BASE_GLOW_3 = 310;

export function VoiceAvatar({
  imageUrl = 'https://i.ibb.co.com/rGMrg0j3/Teacher.png',
  size = 1,
}: VoiceAvatarProps) {
  const { width } = useWindowDimensions();

  // Responsive size factor
  const responsiveScale = width < 400 ? 0.85 : width < 480 ? 0.95 : 1;
  const s = size * responsiveScale;

  const imageSize = BASE_IMAGE * s;
  const innerSize = BASE_INNER * s;
  const glow1Size = BASE_GLOW_1 * s;
  const glow2Size = BASE_GLOW_2 * s;
  const glow3Size = BASE_GLOW_3 * s;

  return (
    <View style={styles.container}>
      {/* Outermost glow layer */}
      <View
        style={[
          styles.glowLayer,
          {
            width: glow3Size,
            height: glow3Size,
            borderRadius: glow3Size / 2,
            backgroundColor: 'rgba(50, 110, 180, 0.12)',
            shadowColor: 'rgba(80, 150, 230, 0.3)',
            shadowRadius: 40,
            shadowOpacity: 1,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
            opacity: 0.12,
          },
        ]}
      />

      {/* Middle glow layer */}
      <View
        style={[
          styles.glowLayer,
          {
            width: glow2Size,
            height: glow2Size,
            borderRadius: glow2Size / 2,
            backgroundColor: 'rgba(70, 130, 200, 0.22)',
            shadowColor: 'rgba(90, 160, 230, 0.4)',
            shadowRadius: 28,
            shadowOpacity: 1,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
            opacity: 0.25,
          },
        ]}
      />

      {/* Inner glow layer */}
      <View
        style={[
          styles.glowLayer,
          {
            width: glow1Size,
            height: glow1Size,
            borderRadius: glow1Size / 2,
            backgroundColor: 'rgba(100, 160, 220, 0.35)',
            shadowColor: 'rgba(100, 170, 230, 0.5)',
            shadowRadius: 18,
            shadowOpacity: 1,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
            opacity: 0.5,
          },
        ]}
      />

      {/* Inner circle (light blue background behind image) */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {/* Teacher image */}
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  glowLayer: {
    position: 'absolute',
  },
  innerCircle: {
    backgroundColor: 'rgba(170, 210, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(100, 170, 230, 0.6)',
    shadowRadius: 12,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  image: {
    resizeMode: 'cover',
  },
});
